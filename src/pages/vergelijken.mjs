import { SITE, esc, slot, fmtDate, faqHtml, faqSchema, METHODE_LIJST } from '../layout.mjs';
import { PAKKETTEN, CHECKED } from '../lib/pakketten.js';
import { REDACTIE, vendorHref } from '../lib/aanbieders.js';
import { situaties } from '../lib/situaties.mjs';
import { e2, UNK, BTW_L, yn, ibL, bankL, rvL, limieten, checked, vanaf, bronLinks, N_AANB, N_PAK, ALFA, logo, softwareSchema, btwNoot } from '../lib/weergave.mjs';

const path = '/boekhoudprogramma-vergelijken/';
const matchMet = (a) => `/boekhoudprogramma-kiezen/?aanbieder=${a.id}`;

// Filterkenmerken per pakket (data-attributen; filteren gebeurt in /js/vergelijken.js).
const rv = (a, p) => (p.rechtsvormen ?? a.rechtsvormen);
const attrs = (a, p) => {
  const r = rv(a, p);
  return `data-v="${a.id}" data-prijs="${p.prijs}" data-prijsbank="${p.prijs + (p.bank === 'auto-extra' ? p.bankExtra : 0)}" data-rv="${r ? r.join(' ') : 'onbekend'}" data-bank="${p.bank === 'auto' || p.bank === 'auto-extra' ? 1 : 0}" data-btw="${p.btwAangifte === 'direct' ? 1 : 0}" data-uren="${p.uren === true ? 1 : 0}" data-ib="${['controle', 'inclusief', 'rapportage'].includes(p.ib) ? 1 : 0}" data-proef="${REDACTIE[a.id].proef ? 1 : 0}" data-boekhouding="${p.boekhouding === false ? 0 : 1}"`;
};

const rows = ALFA.flatMap((a) => a.plannen.map((p, i) => `<tr${i === 0 ? ' class="first"' : ''} ${attrs(a, p)}>
<th scope="row"><a href="${vendorHref(a.id)}">${esc(a.naam)}</a></th>
<td>${esc(p.naam)}${p.noot ? `<br><span class="note">${esc(p.noot)}</span>` : ''}</td>
<td class="n">${e2(p.prijs)}${a.btwPrijzen === 'excl' ? '' : '<sup>*</sup>'}</td>
<td class="n">${p.prijsJaar != null ? e2(p.prijsJaar) : UNK}</td>
<td>${limieten(p)}</td>
<td>${BTW_L[String(p.btwAangifte)]}</td>
<td>${bankL(p, a)}</td>
<td>${yn(p.offertes)}</td>
<td>${yn(p.uren)}</td>
<td>${ibL(p)}</td>
<td>${rvL(p, a)}</td>
</tr>`)).join('\n');

const kaart = (a) => {
  const r = REDACTIE[a.id], v = vanaf(a);
  return `<article class="card vcard" id="${r.slug}" data-v="${a.id}">
<div class="vhead">${logo(a)}<div><h3><a href="${vendorHref(a.id)}">${esc(a.naam)}</a></h3><p class="vprice">vanaf <strong data-vanaf>${e2(v.prijs)}</strong> p/m <span class="note">(${esc(v.naam)}${v.perFactuur ? `, ${e2(v.perFactuur)} per factuur` : ''}, ${btwNoot(a)})</span></p></div></div>
<dl class="vfacts"><dt>Limiet die vaak knelt</dt><dd>${esc(r.knelt)}</dd><dt>Sterk</dt><dd>${esc(r.sterk)}</dd><dt>Zwak</dt><dd>${esc(r.zwak)}</dd><dt>Gratis proberen</dt><dd>${r.proef ? `${r.proef} dagen` : UNK}</dd></dl>
<p class="note">Bron: ${bronLinks(a)}<br>Gecontroleerd op ${fmtDate(checked(a))}</p>
<p class="vlinks"><a href="${vendorHref(a.id)}">Alles over ${esc(r.kort)} →</a> <a href="${matchMet(a)}" rel="nofollow">Match met ${esc(r.kort)} →</a></p>
</article>`;
};

const sit = situaties();
const sitBlok = (s) => {
  if (!s.top) return '';
  const t = s.top;
  return `<div class="card sit"><span class="tag">${esc(s.titel)}</span><h3><a href="${vendorHref(t.a.id)}">${esc(t.a.naam)} ${esc(t.p.naam)}</a></h3>
<p class="vprice"><strong>${e2(t.prijs)}</strong> p/m${t.prijs !== t.p.prijs ? ' (incl. bankkoppeling)' : ''}</p>
<p class="note"><strong>Regel:</strong> ${esc(s.regel)}</p>
${s.volgende.length ? `<p class="note">Daarna: ${s.volgende.map((x) => `${esc(x.a.naam)} ${esc(x.p.naam)} (${e2(x.prijs)})`).join(', ')}.</p>` : ''}
${s.alt ? `<p class="note">Met je eigen boekhouder: ${esc(s.alt.a.naam)} ${esc(s.alt.p.naam)} (${e2(s.alt.prijs)} p/m, plus de kosten van je boekhouder).</p>` : ''}
<p class="note">Limiet: ${limieten(t.p).replace(/<br>/g, ', ')}.</p></div>`;
};

const goedkoopst = sit.find((s) => s.id === 'instap');
const faq = [
  ['Wat is het goedkoopste boekhoudprogramma voor zzp\'ers?', `Gratis of heel goedkope pakketten bestaan (bijvoorbeeld Tellow Gratis, Rompslomp Starter, Moneybird Compact), maar met strenge limieten op facturen, bonnen of transacties. Het goedkoopste pakket waarmee je zelf boekhoudt, btw-aangifte doet en 5 facturen en 5 uitgaven per maand kwijt kunt, is op ${fmtDate(CHECKED)} ${goedkoopst.top.a.naam} ${goedkoopst.top.p.naam} (${e2(goedkoopst.top.prijs)} p/m). Let op de limieten. Stuur je alleen af en toe een factuur? Dan is onze gratis <a href="/offerte-factuur-maken/">factuurtool</a> misschien al genoeg.`],
  ['Waarom staat er soms “niet vermeld”?', 'De pagina van de aanbieder noemt het niet (per pakket). We vullen niets zelf in. Vraag het na of probeer het in de proefperiode.'],
  ['Hoe vaak worden de prijzen gecontroleerd?', `Elke maand, door Dave West. De laatste controle was op ${fmtDate(CHECKED)}. Bij bekende prijswijzigingen (zoals Rompslomp per 1 november 2026) rekenen we met de nieuwe prijs en vermelden we dat.`],
  ['Telt commissie mee in de volgorde?', 'Nee. De tabel staat op alfabet en de situatieblokken volgen een vaste regel op prijs en functies. Op dit moment staan er geen partnerlinks op de site.'],
];

const sel = (name, label, opts) => `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>`;
const chk = (name, label) => `<label class="check"><input type="checkbox" name="${name}" id="f-${name}"> <span>${label}</span></label>`;

const body = `
<h1>Boekhoudprogramma's vergelijken (2026)</h1>
<p class="lead">Alle ${N_PAK} pakketten van ${N_AANB} aanbieders: prijs, de limiet die knelt, sterke en zwakke punten, met bron en controledatum.</p>
<div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/">Liever advies op maat? Doe de match</a></div>
<section class="band methodbox" aria-labelledby="methode"><h2 id="methode">Zo vergelijken we</h2>
${METHODE_LIJST}
<p class="note">Prijzen gecontroleerd door Dave West, oprichter. Meer over <a href="/over/">wie we zijn</a> en alle <a href="/bronnen/">bronnen</a>.</p></section>

<h2>Per situatie</h2>
<p class="note">Geen sterren of scores: per situatie een vaste regel op de tabel hieronder. Gecontroleerd op ${fmtDate(CHECKED)}.</p>
<div class="grid cards two sits">${sit.map(sitBlok).join('\n')}</div>

<h2 id="filter">Filter de aanbieders</h2>
<form class="card filters" id="filters" novalidate>
<div class="fgrid">
${sel('rv', 'Rechtsvorm', [['', 'Alle'], ['eenmanszaak', 'Eenmanszaak'], ['vof', 'Vof (door aanbieder genoemd)'], ['bv', 'Bv (door aanbieder genoemd)']])}
${sel('budget', 'Budget per maand', [['', 'Maakt niet uit'], ['10', 'Tot € 10'], ['20', 'Tot € 20'], ['30', 'Tot € 30'], ['50', 'Tot € 50']])}
</div>
<div class="fchecks">
${chk('bank', 'Automatische bankkoppeling')}${chk('btw', 'Btw-aangifte direct indienen')}${chk('uren', 'Urenregistratie')}${chk('ib', 'Hulp bij aangifte IB')}${chk('proef', 'Gratis proefperiode')}
</div>
<p class="note" id="f-count" aria-live="polite">${N_AANB} aanbieders, ${N_PAK} pakketten.</p>
<p class="note">Een pakket telt mee als het aan alle gekozen filters voldoet. “Vanaf” toont dan de goedkoopste passende prijs; met het filter bankkoppeling inclusief een betaalde koppeling. Staat de rechtsvorm niet vermeld, dan rekenen we die alleen mee bij eenmanszaak.</p>
</form>

<h2>Per aanbieder</h2>
<div class="grid cards two vcards" id="vcards">
${ALFA.map(kaart).join('\n')}
</div>
<p class="note" id="f-none" hidden>Geen aanbieder voldoet aan alle filters. Zet een filter uit.</p>

<h2 id="tabel">Alle pakketten in detail</h2>
<div class="table-wrap" tabindex="0" role="region" aria-label="Vergelijkingstabel boekhoudprogramma's (scroll horizontaal)">
<table class="data compare">
<thead><tr><th>Aanbieder</th><th>Pakket</th><th>Prijs p/m</th><th>Bij jaar&shy;betaling</th><th>Limieten</th><th>Btw-aangifte</th><th>Bank&shy;koppeling</th><th>Offertes</th><th>Uren</th><th>Aangifte IB</th><th>Rechtsvorm</th></tr></thead>
<tbody>
${rows}
</tbody></table></div>
<p class="note">Maandprijzen bij maandbetaling, zonder tijdelijke acties; exclusief btw tenzij <sup>*</sup>: dan vermeldt de aanbieder niet of de prijs in- of exclusief btw is. “Niet vermeld” = staat niet op de pagina van de aanbieder. De tabel staat op alfabet.</p>
${slot('vergelijken-partner', 'partnerlinks naar proefperiodes.')}

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}
<p>Liever niet zelf vergelijken? <a href="/boekhoudprogramma-kiezen/">Doe de match</a>: 8 vragen, daarna de pakketten op volgorde met de reden erbij.</p>
{{related}}
`;

export default {
  path, title: 'Vergelijkingstabel boekhoudprogramma\'s 2026 | BoekhoudMatch', og: 'vergelijken', ogTitle: 'Boekhoudprogramma\'s vergelijken 2026',
  description: `Vergelijk ${N_PAK} pakketten van ${N_AANB} boekhoudprogramma's op prijs, limieten, btw-aangifte en bankkoppeling. Filter op je situatie. Met bron en datum.`,
  crumb: 'Boekhoudprogramma vergelijken', body, scripts: ['/js/vergelijken.js'], updated: CHECKED,
  schema: [faqSchema(faq), {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Boekhoudprogramma\'s voor zzp\'ers (op alfabet)', dateModified: CHECKED,
    itemListElement: ALFA.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.naam, url: SITE.domain + vendorHref(a.id).replace(/#.*/, '') })),
  }],
};
