// Aanbiederpagina's: /<slug>/ per aanbieder. Alleen feiten uit pakketten.js en aanbieders.js (bron: site van de aanbieder).
import { existsSync } from 'node:fs';
import { SITE, esc, fmtDate } from '../layout.mjs';
import { PAKKETTEN } from '../lib/pakketten.js';
import { REDACTIE } from '../lib/aanbieders.js';
import { uitgaand, ctaTekst } from '../lib/partnerlinks.js';
import { praktijktest } from '../lib/praktijktests.js';
import { e2, checked, vanaf, bronLinks, pakketTabel, logo, softwareSchema, btwNoot, N_AANB, UNK } from '../lib/weergave.mjs';

// Uitgaande knop naar de aanbieder: partnerlink alleen als die is goedgekeurd (dan met label), anders gewone link.
function uitCta(a, r) {
  const u = uitgaand(a), c = ctaTekst(r.kort, { proef: r.proef, prijs: Math.min(...a.plannen.map((p) => p.prijs)) });
  const host = a.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
  return `<div class="card vendor-out"><a class="btn" href="${esc(u.href)}" target="_blank" rel="${u.rel}" data-vendor="${esc(a.naam)}" data-pos="aanbiederpagina" data-cta="${c.gratis ? 'trial' : 'visit'}">${esc(c.tekst)}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opent in een nieuw tabblad)</span></a><p class="note">${esc([c.uitleg, `naar ${host}`].filter(Boolean).join(' · '))} · ${u.partner ? '<span class="plabel">partnerlink</span>' : 'gewone link, we verdienen er niets aan'}.</p></div>`;
}
// Praktijktest-sectie (alleen als er een test is). Feiten uit praktijktests.js, geen scores.
function praktijkSectie(a, r, t) {
  const m = t.metingen, am = t.aanmelden;
  const rij = (k, v) => `<tr><th scope="row">${esc(k)}</th><td>${v}</td></tr>`;
  const rijen = [
    rij('Aanmelden', esc(`${am.velden.length} verplichte velden (${am.velden.join(', ')}). Bevestigingsmail: ${am.bevestigingsmail.toLowerCase()}. Tot het dashboard: ${am.minutenTotDashboard}.`)),
    rij('KvK-nummer nodig', esc(am.kvk)),
    rij('Telefoon, betaalgegevens, ID', esc(`Telefoon: ${am.telefoon.toLowerCase()}. Betaalgegevens: ${am.betaalgegevens.toLowerCase()}. Identiteitsbewijs: ${am.id.toLowerCase()}.`)),
    rij('Eerste factuur', esc(m.eersteFactuur)),
    rij('Bon automatisch herkend', esc(m.bon)),
    rij('Bankkoppeling', esc(m.bank)),
    rij('Btw-aangifte', `${esc(m.btw)}${m.btwBron ? ` <a href="${esc(m.btwBron)}" rel="noopener" data-vendor="${esc(a.naam)}">Bron</a>` : ''}`),
    rij('App', esc(m.app)),
    rij('Support', esc(m.support)),
    rij('Proefperiode', esc(m.proef)),
  ].join('');
  const shots = t.screenshots.map((s) => `<figure class="ptest-shot"><a href="${esc(s.src)}" title="Screenshot op ware grootte"><img src="${esc(s.src)}" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="lazy" decoding="async"></a><figcaption class="note">${esc(s.bijschrift)}</figcaption></figure>`).join('');
  return `
<section id="praktijktest" class="ptest" aria-labelledby="praktijktest-kop">
<h2 id="praktijktest-kop">Praktijktest: zo werkt ${esc(r.kort)} in de praktijk</h2>
<p class="post-meta">Getest op <time datetime="${t.datum}">${fmtDate(t.datum)}</time>, ${esc(t.pakket.split(' (')[0].toLowerCase())}, door <a href="/over/">${esc(t.door)}</a></p>
<p>We maakten een proefaccount aan met een testadministratie en vaste testgegevens: één factuur van € 1.000 plus 21% btw aan een testklant, één inkoopbon van € 121 en drie bankregels. Hieronder staat wat we zagen, zonder cijfer of eindoordeel.</p>
<div class="table-wrap" tabindex="0" role="region" aria-label="Meetresultaten praktijktest ${esc(r.kort)}"><table class="data ptest-facts"><tbody>${rijen}</tbody></table></div>
<div class="ptest-shots">${shots}</div>
<h3>Wat opviel</h3>
<ul>${t.waarnemingen.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
<h3>Grenzen van deze test</h3>
<ul class="ptest-grenzen">${t.grenzen.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
<p class="note">Screenshots zijn alleen bijgesneden en geschaald, verder niet bewerkt. We gebruiken ze als citaat bij onze eigen bespreking. De test heeft geen invloed op de volgorde in de match.</p>
</section>
`;
}
const ul = (l) => `<ul>${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;

export const aanbiederPages = PAKKETTEN.map((a) => {
  const r = REDACTIE[a.id], v = vanaf(a), t = praktijktest(a.id), c = checked(a), mod = t && t.datum > c ? t.datum : c, path = `/${r.slug}/`;
  const prijzen = a.plannen.map((p) => p.prijs).filter((x) => x > 0);
  const body = `
<h1>${esc(a.naam)}: prijzen en pakketten (2026)</h1>
<p class="lead">${esc(r.kort)} heeft ${a.plannen.length} pakketten${prijzen.length ? `, van ${e2(Math.min(...prijzen))} tot ${e2(Math.max(...prijzen))} per maand` : ''} (${btwNoot(a)}). Per pakket de prijs, limieten en functies, van de site van ${esc(r.kort)} zelf.</p>
<p class="post-meta">Gecontroleerd op <time datetime="${c}">${fmtDate(c)}</time> door <a href="/over/">Dave West</a> · <a href="#bronnen">Bronnen</a></p>
<div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/?aanbieder=${a.id}" rel="nofollow">Past ${esc(r.kort)} bij jou? Doe de match</a><a class="btn ghost" href="/boekhoudprogramma-vergelijken/">Vergelijk met ${N_AANB - 1} andere aanbieders</a></div>

<h2>In het kort</h2>
<div class="vhead big">${logo(a)}</div>
<dl class="vfacts wide"><dt>Vanaf</dt><dd>${v.prijs === 0 ? 'gratis' : `${e2(v.prijs)} p/m`} (${esc(v.naam)}${v.perFactuur ? `, ${e2(v.perFactuur)} per factuur` : ''})</dd><dt>Limiet die vaak knelt</dt><dd>${esc(r.knelt)}</dd><dt>Sterk</dt><dd>${esc(r.sterk)}</dd><dt>Zwak</dt><dd>${esc(r.zwak)}</dd><dt>Gratis proberen</dt><dd>${r.proef ? `${r.proef} dagen` : UNK}</dd>${a.actie ? `<dt>Actie</dt><dd>${esc(a.actie)}</dd>` : ''}</dl>

<h2>Pakketten en prijzen</h2>
${pakketTabel(a)}
<p class="note">${esc(a.noot)}</p>
${t ? praktijkSectie(a, r, t) : ''}

<div class="grid cards two">
<div class="card"><h2 class="h3">Voor wie wel</h2>${ul(r.wel)}</div>
<div class="card"><h2 class="h3">Voor wie niet</h2>${ul(r.niet)}</div>
</div>
${uitCta(a, r)}

<h2 id="bronnen">Bronnen</h2>
<ul class="sources">${a.bronnen.map((b) => `<li><a href="${b.url}" rel="noopener" data-vendor="${esc(a.naam)}">${esc(b.titel)}</a></li>`).join('')}</ul>
<p class="note">De informatie bij ${esc(r.kort)} is leidend. Fout gezien? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>. Hoe we werken: <a href="/over/">over ons</a>.</p>
<p>Twijfel je tussen ${esc(r.kort)} en een ander pakket? <a href="/boekhoudprogramma-kiezen/">Doe de match</a> of bekijk de <a href="/boekhoudprogramma-vergelijken/">vergelijking</a>.</p>
{{related}}`;
  const titel = `${r.kort} prijzen 2026: pakketten en limieten | BoekhoudMatch`;
  return {
    path, title: titel.length <= 62 ? titel : `${r.kort} prijzen 2026: pakketten, limieten | BoekhoudMatch`, ogTitle: `${a.naam}: prijzen en pakketten`, og: existsSync(`src/assets/og/vendor-${r.slug}.png`) ? `vendor-${r.slug}` : 'vergelijken',
    description: `${r.kort}: ${a.plannen.length} pakketten, ${v.prijs === 0 ? 'ook een gratis pakket' : `vanaf ${e2(v.prijs)} p/m`}. Prijs, limieten, btw-aangifte en bankkoppeling per pakket, gecontroleerd op ${fmtDate(c)}.`,
    crumb: r.kort, parents: [['/boekhoudprogramma-vergelijken/', 'Vergelijken']], navPath: '/boekhoudprogramma-vergelijken/', updated: mod,
    body, schema: [{ ...softwareSchema(a, SITE.domain + path), dateModified: mod }],
  };
});
