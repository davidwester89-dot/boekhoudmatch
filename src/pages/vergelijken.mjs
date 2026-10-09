import { SITE, esc, slot, fmtDate, faqHtml, faqSchema, METHODE_LIJST } from '../layout.mjs';
import { PAKKETTEN, CHECKED } from '../lib/pakketten.js';

const path = '/boekhoudprogramma-vergelijken/';
const e2 = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const unk = '<span class="unk">niet vermeld</span>';
const lim = (x, unit) => (x === undefined ? '' : x === Infinity ? `onbeperkt ${unit}` : x === 0 ? `geen ${unit}` : `${x} ${unit}`);
const btwL = { direct: 'Ja, direct indienen', ja: 'Ja', handmatig: 'Berekenen, zelf indienen', overzicht: 'Alleen overzicht', boekhouder: 'Via boekhouder', false: 'Nee' };
const ibL = { inclusief: 'Boekhouder doet IB', controle: 'Gecontroleerde IB-aangifte', 'eigen-boekhouder': 'Via eigen boekhouder', false: 'Nee' };
const yn = (v) => (v === true ? 'Ja' : v === false ? 'Nee' : v === 'beperkt' ? 'Beperkt' : unk);
const bankL = (p, a) => (p.bank === 'auto' ? 'Automatisch' : p.bank === 'auto-extra' ? `Automatisch (+ ${e2(p.bankExtra)} p/m)` : `Handmatig importeren${a.eigenRekening ? '; automatisch met eigen rekening aanbieder' : ''}`);
const rvL = (p, a) => { const rv = p.rechtsvormen ?? a.rechtsvormen; return rv ? rv.map((r) => ({ eenmanszaak: 'eenmanszaak', vof: 'vof', bv: 'bv' }[r])).join(', ') : unk; };
const limieten = (p) => [p.facturen !== undefined ? lim(p.facturen, 'facturen/mnd') : '', p.perFactuur ? `${e2(p.perFactuur)} per factuur` : '', lim(p.uitgaven, 'uitgaven/mnd'), lim(p.transacties, 'banktransacties/mnd'), lim(p.boekingenMaand, 'boekingen/mnd'), lim(p.boekingenJaar, 'boekingen/jaar'), p.boekhouding === false ? '<strong>geen boekhouding</strong>' : '', p.viaBoekhouder ? 'voor samenwerking met boekhouder' : ''].filter(Boolean).filter((s) => !s.startsWith('onbeperkt') || s.includes('facturen')).join('<br>');

const ALFA = [...PAKKETTEN].sort((x, y) => x.naam.localeCompare(y.naam, 'nl'));
const rows = ALFA.flatMap((a) => a.plannen.map((p, i) => `<tr${i === 0 ? ' class="first"' : ''}>
<th scope="row">${i === 0 ? `<a href="${a.bronnen[0].url}" rel="noopener" data-vendor="${esc(a.naam)}">${esc(a.naam)}</a>` : `<span class="sr">${esc(a.naam)}</span>`}</th>
<td>${esc(p.naam)}${p.noot ? `<br><span class="note">${esc(p.noot)}</span>` : ''}</td>
<td class="n">${e2(p.prijs)}${a.btwPrijzen === 'excl' ? '' : '<sup>*</sup>'}</td>
<td class="n">${p.prijsJaar != null ? e2(p.prijsJaar) : '–'}</td>
<td>${limieten(p) || '–'}</td>
<td>${btwL[String(p.btwAangifte)]}</td>
<td>${bankL(p, a)}</td>
<td>${yn(p.offertes)}</td>
<td>${yn(p.uren)}</td>
<td>${p.ib === null ? unk : ibL[String(p.ib)]}</td>
<td>${rvL(p, a)}</td>
</tr>`)).join('\n');

const goedkoopst = PAKKETTEN.flatMap((a) => a.plannen.filter((p) => p.boekhouding !== false && p.btwAangifte && p.btwAangifte !== 'overzicht' && !p.viaBoekhouder && (p.facturen ?? Infinity) >= 10).map((p) => ({ a, p }))).sort((x, y) => x.p.prijs - y.p.prijs).slice(0, 3);

const faq = [
  ['Wat is het goedkoopste boekhoudprogramma voor zzp\'ers?', `Gratis of heel goedkope instappakketten bestaan (bijvoorbeeld Tellow Gratis, Rompslomp Starter, Moneybird Compact), maar met strenge limieten op facturen, bonnen of transacties. Voor wie ten minste 10 facturen per maand stuurt en btw-aangifte doet, zijn de goedkoopste passende pakketten op ${fmtDate(CHECKED)}: ${goedkoopst.map(({ a, p }) => `${a.naam} ${p.naam} (${e2(p.prijs)} p/m)`).join(', ')}. Let op limieten en of je zelf de btw-aangifte moet indienen. Stuur je alleen af en toe een factuur? Dan is onze gratis <a href="/offerte-factuur-maken/">factuurtool</a> misschien al genoeg.`],
  ['Waarom staat er soms “niet vermeld”?', 'De prijspagina van de aanbieder noemt het niet per pakket. We vullen niets zelf in. Vraag het na of probeer het in de proefperiode.'],
  ['Hoe vaak worden de prijzen gecontroleerd?', `Deze tabel is gecontroleerd op ${fmtDate(CHECKED)}; Silvasoft op ${fmtDate(PAKKETTEN.find((a) => a.id === 'silvasoft').gecontroleerd)}. Bij bekende prijswijzigingen (zoals Rompslomp per 1 november 2026) rekenen we met de nieuwe prijs en vermelden we dat.`],
];

const body = `
<h1>Boekhoudprogramma vergelijken (2026)</h1>
<p class="lead">Alle ${PAKKETTEN.reduce((n, a) => n + a.plannen.length, 0)} pakketten van ${PAKKETTEN.length} aanbieders naast elkaar: prijs, limieten, btw-aangifte en bankkoppeling.</p>
<p class="note">Actuele prijzen, rechtstreeks van de aanbieders zelf.</p>
<div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/">Liever advies op maat? Doe de match</a></div>
<section class="band methodbox" aria-labelledby="methode"><h2 id="methode">Zo vergelijken we</h2>
${METHODE_LIJST}
<p class="note">Prijzen gecontroleerd door Dave West, oprichter. Meer over <a href="/over/">wie we zijn</a> en alle <a href="/bronnen/">bronnen</a>.</p></section>
<div class="table-wrap" tabindex="0" role="region" aria-label="Vergelijkingstabel boekhoudprogramma's (scroll horizontaal)">
<table class="data compare">
<thead><tr><th>Aanbieder</th><th>Pakket</th><th>Prijs p/m</th><th>Bij jaar&shy;betaling</th><th>Limieten</th><th>Btw-aangifte</th><th>Bank&shy;koppeling</th><th>Offertes</th><th>Uren</th><th>Aangifte IB</th><th>Rechtsvorm</th></tr></thead>
<tbody>
${rows}
</tbody></table></div>
<p class="note">Maandprijzen bij maandbetaling, exclusief btw, zonder tijdelijke acties. <sup>*</sup> Niet vermeld of de prijs in- of exclusief btw is. “Niet vermeld” = staat niet op de prijspagina.</p>

<h2>Per aanbieder</h2>
<div class="grid cards">
${ALFA.map((a) => `<div class="card"><h3>${esc(a.naam)}</h3><p class="note">${esc(a.noot)}</p>${a.actie ? `<p class="note"><strong>Actie:</strong> ${esc(a.actie)}</p>` : ''}<p class="note">Bron: ${a.bronnen.map((b) => `<a href="${b.url}" rel="noopener" data-vendor="${esc(a.naam)}">${esc(b.titel)}</a>`).join(' · ')} (gecontroleerd ${fmtDate(a.gecontroleerd || CHECKED)})</p></div>`).join('\n')}
</div>
${slot('vergelijken-partner', 'partnerlinks naar proefperiodes.')}
<p class="note">Er staan op deze site op dit moment geen partnerlinks. De tabel staat op alfabet. Zie <a href="/over/">hoe we werken</a>.</p>

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}
{{related}}
`;

export default {
  path, title: 'Boekhoudprogramma vergelijken 2026 (zzp) | BoekhoudMatch', og: 'vergelijken', ogTitle: 'Boekhoudprogramma\'s vergelijken 2026',
  description: `Vergelijk ${PAKKETTEN.length} boekhoudprogramma's voor zzp'ers op prijs, limieten, btw-aangifte en bankkoppeling. Actuele prijzen van de aanbieders zelf.`,
  crumb: 'Boekhoudprogramma vergelijken', body,
  schema: [faqSchema(faq), {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Boekhoudprogramma\'s voor zzp\'ers',
    itemListElement: PAKKETTEN.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.naam, url: a.site })),
  }],
};
