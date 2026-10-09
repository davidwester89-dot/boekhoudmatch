// Gidsen, vergelijkingen en beslisartikelen: content/gids/<slug>.md -> /<slug>/.
// Prijzen in de tekst komen uit de data via {{p:aanbieder/pakket}}; blokken via een regel {{blok:naam args}}.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, esc, fmtDate, ORG, FOUNDER } from '../layout.mjs';
import { parseFrontmatter, markdown, wordCount } from '../lib/markdown.mjs';
import { PAKKETTEN, CHECKED } from '../lib/pakketten.js';
import { REDACTIE, vendorHref } from '../lib/aanbieders.js';
import { match } from '../lib/match.js';
import { situaties } from '../lib/situaties.mjs';
import { e2, UNK, BTW_L, yn, ibL, bankL, rvL, limieten, checked, vanaf, N_AANB, N_PAK, ALFA, byId, btwNoot } from '../lib/weergave.mjs';
import { VOORBEELDEN, matchUrl } from './static.mjs';

const plan = (ref) => { const [v, p] = ref.split('/'); const a = byId[v]; const pl = a && a.plannen.find((x) => x.id === p); if (!pl) throw new Error(`Onbekend pakket ${ref}`); return { a, p: pl }; };
const prijsTxt = (ref) => { const { p } = plan(ref); return p.prijs === 0 ? 'gratis' : e2(p.prijs); };

// --- blokken ---
const rv = (a, p) => p.rechtsvormen ?? a.rechtsvormen;
const FILTERS = {
  eenmanszaak: (a, p) => p.boekhouding !== false && (!rv(a, p) || rv(a, p).includes('eenmanszaak')),
  vof: (a, p) => p.boekhouding !== false && (rv(a, p) || []).includes('vof'),
  bv: (a, p) => p.boekhouding !== false && (rv(a, p) || []).includes('bv'),
  gratis: (a, p) => p.prijs === 0,
  uren: (a, p) => p.uren === true && p.boekhouding !== false,
  btwdirect: (a, p) => p.btwAangifte === 'direct',
  bankauto: (a, p) => p.bank === 'auto' || p.bank === 'auto-extra',
};
function tabel(filter, { perAanbieder = false } = {}) {
  const f = FILTERS[filter]; if (!f) throw new Error('Onbekend filter ' + filter);
  let l = ALFA.flatMap((a) => a.plannen.filter((p) => f(a, p)).map((p) => ({ a, p })));
  if (perAanbieder) { const seen = new Set(); l = l.sort((x, y) => x.p.prijs - y.p.prijs).filter(({ a }) => !seen.has(a.id) && seen.add(a.id)).sort((x, y) => x.a.naam.localeCompare(y.a.naam, 'nl')); }
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Pakketten"><table class="data"><thead><tr><th>Aanbieder</th><th>Pakket</th><th>Prijs p/m</th><th>Limieten</th><th>Btw-aangifte</th><th>Bankkoppeling</th><th>Uren</th><th>Rechtsvorm</th></tr></thead><tbody>
${l.map(({ a, p }) => `<tr><th scope="row"><a href="${vendorHref(a.id)}">${esc(a.naam)}</a></th><td>${esc(p.naam)}</td><td class="n">${p.prijs === 0 ? 'gratis' : e2(p.prijs)}${a.btwPrijzen === 'excl' ? '' : '<sup>*</sup>'}</td><td>${limieten(p)}</td><td>${BTW_L[String(p.btwAangifte)]}</td><td>${bankL(p, a)}</td><td>${yn(p.uren)}</td><td>${rvL(p, a)}</td></tr>`).join('')}
</tbody></table></div><p class="note">${l.length} pakketten. Op alfabet, maandprijs bij maandbetaling zonder acties, gecontroleerd op ${fmtDate(CHECKED)}. <sup>*</sup> In- of exclusief btw niet vermeld.</p>`;
}
function sitBlokken(ids) {
  const s = situaties().filter((x) => !ids || ids.includes(x.id));
  return `<div class="grid cards two">${s.map((x) => `<div class="card sit"><span class="tag">${esc(x.titel)}</span><h3><a href="${vendorHref(x.top.a.id)}">${esc(x.top.a.naam)} ${esc(x.top.p.naam)}</a></h3><p class="vprice"><strong>${e2(x.top.prijs)}</strong> p/m</p><p class="note"><strong>Regel:</strong> ${esc(x.regel)}</p>${x.volgende.length ? `<p class="note">Daarna: ${x.volgende.map((y) => `${esc(y.a.naam)} ${esc(y.p.naam)} (${e2(y.prijs)})`).join(', ')}.</p>` : ''}${x.alt ? `<p class="note">Met je eigen boekhouder: ${esc(x.alt.a.naam)} ${esc(x.alt.p.naam)} (${e2(x.alt.prijs)} p/m plus de kosten van je boekhouder).</p>` : ''}</div>`).join('')}</div>`;
}
function voorbeelden(ids) {
  return `<div class="grid cards">${VOORBEELDEN.filter((v) => !ids || ids.includes(v.id)).map((v) => { const top = match(PAKKETTEN, v.a).filter((r) => r.past).slice(0, 3); return `<article class="card example"><h3>${esc(v.titel)}</h3><p class="note">${esc(v.wie)}</p><ol class="top">${top.map((r) => `<li><strong>${esc(r.naam)} ${esc(r.planNaam)}</strong> <span class="price">${e2(r.prijs)} p/m</span>${r.let_op[0] ? `<div class="note warn">Let op: ${esc(r.let_op[0])}</div>` : ''}</li>`).join('')}</ol><a href="${esc(matchUrl(v.a))}" rel="nofollow">Open deze match →</a></article>`; }).join('')}</div>`;
}
// Rechtsvormen per aanbieder: op aanbiederniveau, of per pakket als de aanbieder het per pakket noemt.
function rvAll(a) {
  if (a.rechtsvormen) return esc(a.rechtsvormen.join(', '));
  const per = a.plannen.filter((p) => p.boekhouding !== false && p.rechtsvormen);
  if (!per.length) return UNK;
  return per.map((p) => `${esc(p.naam)}: ${esc(p.rechtsvormen.join(', '))}`).join('<br>');
}
function vs(x, y) {
  const A = byId[x], B = byId[y];
  const rij = (label, fa, fb) => `<tr><th scope="row">${label}</th><td>${fa}</td><td>${fb}</td></tr>`;
  const r = (a) => REDACTIE[a.id];
  const pl = (a) => a.plannen.map((p) => `${esc(p.naam)}: ${p.prijs === 0 ? 'gratis' : e2(p.prijs)}`).join('<br>');
  const tabelHtml = `<div class="table-wrap"><table class="data vs"><thead><tr><th></th><th><a href="${vendorHref(A.id)}">${esc(A.naam)}</a></th><th><a href="${vendorHref(B.id)}">${esc(B.naam)}</a></th></tr></thead><tbody>
${rij('Pakketten (p/m)', pl(A), pl(B))}
${rij('Prijzen', btwNoot(A), btwNoot(B))}
${rij('Limiet die vaak knelt', esc(r(A).knelt), esc(r(B).knelt))}
${rij('Sterk', esc(r(A).sterk), esc(r(B).sterk))}
${rij('Zwak', esc(r(A).zwak), esc(r(B).zwak))}
${rij('Rechtsvorm', rvAll(A), rvAll(B))}
${rij('Gratis proberen', r(A).proef ? `${r(A).proef} dagen` : UNK, r(B).proef ? `${r(B).proef} dagen` : UNK)}
${rij('Actie', esc(A.actie || '–'), esc(B.actie || '–'))}
${rij('Gecontroleerd', fmtDate(checked(A)), fmtDate(checked(B)))}
</tbody></table></div>`;
  const uit = VOORBEELDEN.map((v) => {
    const res = match([A, B], v.a);
    const cel = (a) => { const q = res.find((z) => z.aanbieder === a.id); return q.past ? `${esc(q.planNaam)}, ${e2(q.prijs)}${q.binnenBudget ? '' : ' (boven budget)'}` : `past niet: ${esc((q.nee[0] || '').replace(/\.$/, ''))}`; };
    const eerste = res[0].past ? res[0].naam : 'geen van beide';
    return `<tr><th scope="row">${esc(v.titel)}</th><td>${cel(A)}</td><td>${cel(B)}</td><td>${esc(eerste)}</td></tr>`;
  }).join('');
  return `${tabelHtml}<h3>Wat de match kiest in drie situaties</h3><div class="table-wrap"><table class="data"><thead><tr><th>Situatie</th><th>${esc(A.naam)}</th><th>${esc(B.naam)}</th><th>Hoger in de match</th></tr></thead><tbody>${uit}</tbody></table></div><p class="note">Uitkomst van de match met alleen deze twee aanbieders, voor de drie voorbeeldprofielen van de <a href="/">homepage</a>. Jouw situatie kan anders uitvallen.</p>`;
}
const cta = (q) => `<div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/${q ? `?${q}` : ''}"${q ? ' rel="nofollow"' : ''}>Doe de match</a><a class="btn ghost" href="/boekhoudprogramma-vergelijken/">Vergelijk alle ${N_PAK} pakketten</a></div>`;

function blok(line) {
  const [naam, ...args] = line.trim().split(/\s+/);
  if (naam === 'tabel') return tabel(args[0], { perAanbieder: args.includes('per-aanbieder') });
  if (naam === 'situaties') return sitBlokken(args.length ? args : null);
  if (naam === 'voorbeelden') return voorbeelden(args.length ? args : null);
  if (naam === 'vs') return vs(args[0], args[1]);
  if (naam === 'cta') return cta(args[0]);
  throw new Error('Onbekend blok ' + naam);
}

function render(md) {
  md = md.replace(/\{\{p:([a-z-]+\/[a-z-]+)\}\}/g, (_, ref) => prijsTxt(ref))
    .replace(/\{\{n:aanbieders\}\}/g, String(N_AANB)).replace(/\{\{n:pakketten\}\}/g, String(N_PAK))
    .replace(/\{\{datum\}\}/g, fmtDate(CHECKED))
    .replace(/\{\{vanaf:([a-z]+)\}\}/g, (_, v) => e2(vanaf(byId[v]).prijs))
    .replace(/\{\{link:([a-z]+)\}\}/g, (_, v) => `[${byId[v].naam}](${vendorHref(v)})`);
  return md.split(/^\{\{blok:(.*)\}\}$/m).map((part, i) => (i % 2 ? blok(part) : markdown(part))).join('\n');
}

export function gidsPages() {
  if (!existsSync('content/gids')) return [];
  return readdirSync('content/gids').filter((f) => f.endsWith('.md')).sort().map((f) => {
    const src = readFileSync(join('content/gids', f), 'utf8');
    const { meta, body } = parseFrontmatter(src);
    for (const k of ['title', 'seo_title', 'description', 'updated', 'crumb']) if (!meta[k]) throw new Error(`${f}: ${k} ontbreekt`);
    const slug = f.replace(/\.md$/, ''), path = `/${slug}/`;
    const sources = (meta.sources || []).map((s) => { const [t, u] = s.split(/\s+\|\s+/); return { title: t, url: u }; });
    const vendors = String(meta.vendors || '').split(',').map((s) => s.trim()).filter(Boolean).map((v) => byId[v]);
    const words = wordCount(body.replace(/^\{\{blok:.*\}\}$/gm, ''));
    const html = render(body);
    const pageBody = `
<article class="article gids">
<h1>${esc(meta.title)}</h1>
<p class="post-meta">Door <a href="/over/">Dave West</a> · prijzen gecontroleerd op <time datetime="${CHECKED}">${fmtDate(CHECKED)}</time> · bijgewerkt <time datetime="${meta.updated}">${fmtDate(meta.updated)}</time></p>
${meta.update ? `<p class="alert ok"><strong>Update ${fmtDate(meta.updated)}:</strong> ${esc(meta.update)}</p>` : ''}
${html}
<aside class="cta"><h2>Verder kiezen</h2><ul><li><a href="/boekhoudprogramma-kiezen/">Doe de match: 8 vragen, daarna de pakketten op volgorde →</a></li><li><a href="/boekhoudprogramma-vergelijken/">Vergelijk alle ${N_PAK} pakketten met filters →</a></li>${(meta.related || []).map((r) => { const [t, u] = r.split(/\s+\|\s+/); return `<li><a href="${u}">${esc(t)} →</a></li>`; }).join('')}</ul></aside>
<h2>Bronnen</h2>
<ul class="sources">${[...sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a></li>`), ...vendors.flatMap((a) => a.bronnen.slice(0, 1).map((b) => `<li><a href="${b.url}" rel="noopener" data-vendor="${esc(a.naam)}">${esc(b.titel)}</a> (gecontroleerd ${fmtDate(checked(a))})</li>`))].join('')}<li><a href="/bronnen/">Alle prijsbronnen en controledatums</a></li></ul>
<p class="note">Algemene informatie, geen persoonlijk advies. De informatie bij de aanbieder is leidend. Fout gezien? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
</article>
{{related}}`;
    return {
      path, title: meta.seo_title, ogTitle: meta.title, description: meta.description, crumb: meta.crumb, og: 'vergelijken', updated: meta.updated, words, kind: meta.kind || 'gids',
      body: pageBody,
      schema: [{ '@context': 'https://schema.org', '@type': 'Article', headline: meta.title, description: meta.description, datePublished: meta.published || meta.updated, dateModified: meta.updated, inLanguage: 'nl-NL', wordCount: words,
        author: { ...FOUNDER.schema }, publisher: ORG, mainEntityOfPage: { '@type': 'WebPage', '@id': SITE.domain + path }, citation: sources.map((s) => s.url) }],
    };
  });
}

// Overzichtspagina /gidsen/ met alle gidsen, in drie groepen.
const GROEP = (slug) => (/-vs-/.test(slug) ? 'Twee aanbieders naast elkaar' : /^(beste-|gratis-|boekhoudprogramma-(eenmanszaak|vof|bv|starters))/.test(slug) ? 'Kiezen voor jouw situatie' : 'Uitleg bij het kiezen');
export function gidsHub(gidsen) {
  const groepen = ['Kiezen voor jouw situatie', 'Twee aanbieders naast elkaar', 'Uitleg bij het kiezen'];
  const lijst = (g) => gidsen.filter((p) => GROEP(p.path.slice(1, -1)) === g).map((p) => `<li><a href="${p.path}"><strong>${esc(p.ogTitle)}</strong></a><br><span class="note">${esc(p.description)}</span></li>`).join('');
  return {
    path: '/gidsen/', title: 'Gidsen: boekhoudprogramma kiezen (2026) | BoekhoudMatch', description: `Gidsen bij het kiezen van een boekhoudprogramma: per rechtsvorm, gratis, starters, btw, bank, KOR en uren. Prijzen gecontroleerd op ${fmtDate(CHECKED)}.`, crumb: 'Gidsen', og: 'vergelijken', updated: CHECKED,
    body: `<section class="article"><h1>Gidsen: boekhoudprogramma kiezen</h1>
<p class="lead">Korte gidsen bij de match en de vergelijking. Elke prijs komt uit dezelfde data, gecontroleerd op ${fmtDate(CHECKED)} op de prijspagina's van de aanbieders. Geschreven door <a href="/over/">Dave West</a>.</p>
${groepen.map((g) => `<h2>${g}</h2><ul class="gidslijst">${lijst(g)}</ul>`).join('\n')}
<aside class="cta"><h2>Liever meteen kiezen?</h2><ul><li><a href="/boekhoudprogramma-kiezen/">Doe de match →</a></li><li><a href="/boekhoudprogramma-vergelijken/">Vergelijk alle ${N_PAK} pakketten →</a></li></ul></aside>
</section>`,
    schema: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Gidsen: boekhoudprogramma kiezen', url: SITE.domain + '/gidsen/', inLanguage: 'nl-NL', hasPart: gidsen.map((p) => ({ '@type': 'Article', headline: p.ogTitle, url: SITE.domain + p.path })) }],
  };
}
