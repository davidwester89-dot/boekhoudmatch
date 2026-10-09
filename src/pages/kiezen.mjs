import { SITE, esc, slot, webApp, faqSchema, faqHtml, fmtDate, more } from '../layout.mjs';
import { PAKKETTEN, CHECKED } from '../lib/pakketten.js';
import { VRAGEN, PUNTEN, match } from '../lib/match.js';
import { REDACTIE, vendorHref } from '../lib/aanbieders.js';
import { uitgaand, ctaTekst } from '../lib/partnerlinks.js';

// Uitslag bij de standaardantwoorden alvast in de HTML (zelfde opbouw als kiezen.js), zodat er bij laden niets verspringt.
const euro = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const host = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
const DEF = { aanbieder: '', rechtsvorm: 'eenmanszaak', facturen: '5', uitgaven: '10', btw: 'plichtig', bank: 'auto', offertes: false, uren: false, ib: 'zelf', budget: 'Infinity', extra: [] };
const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));
const passend0 = match(PAKKETTEN, DEF).filter((r) => r.past);
function knopHtml(r, pos, cls) {
  const a = byId[r.aanbieder], red = REDACTIE[a.id], u = uitgaand(a), c = ctaTekst(red.kort, { proef: red.proef, prijs: r.prijs });
  return { html: `<a class="${cls}" href="${esc(u.href)}" target="_blank" rel="${u.rel}" data-vendor="${esc(a.naam)}" data-pos="${pos}" data-cta="${c.gratis ? 'trial' : 'visit'}">${esc(pos === 1 ? c.tekst : `Bekijk ${red.kort}`)}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opent in een nieuw tabblad)</span></a>`, a, red, u, c };
}
const pagina = (a, pos, t) => `<a class="vlink" href="${vendorHref(a.id)}" data-vendor="${esc(a.naam)}" data-pos="${pos}" data-cta="vendor_page">${esc(t)}</a>`;
const PRE_TOP = passend0.slice(0, 3).map((r, i) => {
  let mini = '';
  if (i > 0) { const k = knopHtml(r, i + 1, 'btn ghost sm'); mini = `<div class="mini-cta">${k.html}${pagina(k.a, i + 1, `Alles over ${k.red.kort}`)}${k.u.partner ? '<span class="plabel">partnerlink</span>' : ''}</div>`; }
  return `<li><strong>${esc(`${r.naam} ${r.planNaam}`)}</strong><span class="price">${esc(` ${euro(r.prijs)} p/m${r.binnenBudget ? '' : ' (boven budget)'}`)}</span>${r.plus[0] ? `<div class="note">${esc(r.plus.slice(0, 2).join(' '))}</div>` : ''}${mini}</li>`;
}).join('');
const PRE_CTA = (() => { const r = passend0[0]; if (!r) return ''; const k = knopHtml(r, 1, 'btn'); return `${k.html}<p class="note cta-sub">${esc([k.c.uitleg, `naar ${host(k.a.site)}`].filter(Boolean).join(' · '))}${k.u.partner ? ' · <span class="plabel">partnerlink</span>' : ''}</p>${pagina(k.a, 1, `Lees alles over ${k.red.kort} →`)}`; })();
const PRE_BEST = passend0[0] ? `${passend0[0].naam} ${passend0[0].planNaam}` : '–';
const PRE_CMP = '/boekhoudprogramma-vergelijken/?aanbieders=' + passend0.slice(0, 3).map((r) => r.aanbieder).join(',') + '#per-aanbieder';

const path = '/boekhoudprogramma-kiezen/';
const radios = (name, legend, opts, def, hint = '') => `<fieldset class="q"><legend>${legend}</legend>${hint ? `<p class="hint">${hint}</p>` : ''}<div class="opts">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}"${String(v) === String(def) ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></fieldset>`;

const faq = [
  ['Welk boekhoudprogramma is het beste voor een zzp\'er?', 'Dat hangt af van hoeveel facturen en bonnen je hebt, of je btw-aangifte doet of de KOR gebruikt, of je een automatische bankkoppeling wilt en of je hulp wilt bij je aangifte inkomstenbelasting. Een klein pakket met limieten is vaak het goedkoopst. Ga je over de limiet, dan moet je upgraden. De match rekent dat voor je uit.'],
  ['Heb ik een boekhoudprogramma nodig als ik de KOR gebruik?', 'Je doet dan geen btw-aangifte, maar je moet wel een administratie bijhouden en facturen bewaren (7 jaar). Een gratis of klein pakket kan dan genoeg zijn.'],
  ['Zijn de prijzen inclusief btw?', 'De meeste aanbieders noemen prijzen exclusief btw. Waar de prijspagina dat niet zegt, staat “niet vermeld” in de vergelijking. Als ondernemer met btw-aangifte trek je de btw op je abonnement meestal weer af.'],
  ['Verdienen jullie aan de aanbevelingen?', 'Op dit moment niet. Plaatsen we later gemarkeerde partnerlinks, dan telt dat niet mee in de volgorde.'],
];

const body = `
<h1>Welk boekhoudprogramma past bij jou?</h1>
<p class="lead">Beantwoord 8 korte vragen. Je ziet meteen wat past, wat het per maand kost en waarom.</p>
<p class="note">${PAKKETTEN.length} aanbieders · ${PAKKETTEN.reduce((n, a) => n + a.plannen.length, 0)} pakketten · prijzen gecontroleerd op ${fmtDate(CHECKED)}</p>
<noscript><div class="alert">De match heeft JavaScript nodig. Bekijk anders de <a href="/boekhoudprogramma-vergelijken/">vergelijkingstabel</a>.</div></noscript>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
<input type="hidden" name="aanbieder" value="">
${radios('rechtsvorm', '1. Wat is je rechtsvorm?', VRAGEN.rechtsvorm, 'eenmanszaak')}
${radios('facturen', '2. Hoeveel facturen stuur je per maand?', VRAGEN.facturen, 5)}
${radios('uitgaven', '3. Hoeveel bonnen en inkoopfacturen heb je per maand?', VRAGEN.uitgaven, 10, 'Denk aan abonnementen, tanken, materiaal en telefoon.')}
${radios('btw', '4. Btw', VRAGEN.btw, 'plichtig')}
${radios('bank', '5. Wil je je bank automatisch koppelen?', VRAGEN.bank, 'auto')}
<fieldset class="q"><legend>6. Wat wil je er ook mee doen?</legend><div class="opts">
<label><input type="checkbox" name="offertes"><span>Offertes maken</span></label>
<label><input type="checkbox" name="uren"><span>Uren of projecten bijhouden</span></label>
</div></fieldset>
${radios('ib', '7. Je aangifte inkomstenbelasting', VRAGEN.ib, 'zelf')}
${radios('budget', '8. Wat mag het per maand kosten (excl. btw)?', VRAGEN.budget.map(([v, l]) => [String(v), l]), 'Infinity')}
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<h2>Jouw beste match</h2>
<p class="big best" id="big-mirror">${esc(PRE_BEST)}</p>
<div id="out-cta" class="match-cta">${PRE_CTA}</div>
<div id="out-pick" class="pick" hidden></div>
<p class="note" style="margin-bottom:4px">Top 3</p>
<ol class="top" id="out-top">${PRE_TOP}</ol>
<p class="note" id="out-vol">We rekenen met ${passend0[0].volumes.facturen} facturen, ${passend0[0].volumes.uitgaven} bonnen en ongeveer ${passend0[0].volumes.transacties} banktransacties per maand.</p>
<div class="match-next">
<a class="btn ghost" id="out-cmp" href="${esc(PRE_CMP)}" rel="nofollow" data-cta="compare">Vergelijk deze 3 naast elkaar</a>
<p class="match-links"><a href="/boekhoudprogramma-kiezen/" data-cta="restart">Opnieuw beginnen</a> · <button type="button" class="linkbtn" id="out-copy" data-cta="copy_link">Kopieer link naar je uitslag</button> <span id="out-copy-ok" class="note" role="status"></span></p>
</div>
<p><a href="#rangorde">Bekijk alle ${PAKKETTEN.length} aanbieders ↓</a></p>
</section>
</div>
<a class="mobilebar" href="#uitkomst"><span>Beste match</span><strong data-mirror></strong></a>

<h2 id="rangorde">Alle aanbieders op volgorde</h2>
<div id="out-list" class="ranklist"></div>
${slot('boekhoudmatch-partner', 'partnerlink naar proefperiode.')}

<h2 id="methode">Zo werkt de match</h2>
<p>Eerst wat past en binnen je budget valt, daarna de prijs. Of wij aan een aanbieder verdienen, telt nooit mee.</p>
${more('De volledige methode', `<ol>
<li><strong>Volume schatten.</strong> Uit je antwoorden schatten we je banktransacties (facturen + bonnen + 3) en je boekingen (facturen + bonnen + banktransacties), steeds met de bovenkant van je keuze.</li>
<li><strong>Harde eisen.</strong> Een pakket valt af als het je rechtsvorm niet ondersteunt, onder je volume zit, geen btw-aangifte heeft terwijl je die nodig hebt, geen automatische bankkoppeling heeft als je die wilt, of alleen via een boekhouder werkt terwijl je zelf wilt boekhouden. Wil je alles uitbesteden, dan tellen alleen pakketten met een boekhouder.</li>
<li><strong>Per aanbieder het goedkoopste passende pakket</strong>, inclusief vaste extra kosten zoals een betaalde bankkoppeling.</li>
<li><strong>Volgorde.</strong> Eerst passend en binnen budget, dan passend boven budget, dan de rest. Binnen een groep telt de score:
<ul>
<li>100 min de maandprijs.</li>
<li>Btw-aangifte: direct indienen +${PUNTEN.btwDirect}, btw-aangifte zonder details +${PUNTEN.btwJa}, alleen berekenen +${PUNTEN.btwHandmatig}.</li>
<li>Automatische bankkoppeling +${PUNTEN.bankAuto}; alleen via de eigen rekening van de aanbieder ${PUNTEN.eigenRekening}.</li>
<li>Gewenste offertes of uren: inbegrepen +${PUNTEN.extraJa}, onbekend ${PUNTEN.extraOnbekend}, niet inbegrepen ${PUNTEN.extraNee}.</li>
<li>Hulp bij de aangifte inkomstenbelasting als je die wilt: +${PUNTEN.ibMatch}; boekhouder inbegrepen bij uitbesteden: +${PUNTEN.ibVolledig}.</li>
<li>Rechtsvorm niet vermeld (bij vof of bv): ${PUNTEN.rechtsvormOnbekend}.</li>
</ul>
Bij gelijke score wint de laagste prijs.</li>
<li><strong>Telt niet mee:</strong> partnerschappen, tijdelijke acties, reviews en populariteit.</li>
<li><strong>Onbekend is onbekend.</strong> Staat iets niet op de prijspagina, dan tonen we “niet vermeld”.</li>
</ol>
<p>Prijzen zijn maandprijzen bij maandbetaling. Zie ook de <a href="/bronnen/">bronnen</a> en de <a href="/boekhoudprogramma-vergelijken/">vergelijkingstabel</a>.</p>`)}

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}
{{related}}
`;

export default {
  path, title: 'Boekhoudprogramma kiezen als zzp\'er (2026) | BoekhoudMatch', og: 'match', ogTitle: 'Welk boekhoudprogramma past bij jou?',
  description: `Welk boekhoudprogramma past bij jouw zzp-bedrijf? 8 vragen, ${PAKKETTEN.length} aanbieders, actuele prijzen en eerlijk uitgelegd waarom. Gratis, zonder account.`,
  crumb: 'Boekhoudprogramma kiezen', body, scripts: ['/js/kiezen.js'],
  schema: [webApp({ name: 'Boekhoudprogramma-match', url: SITE.domain + path, description: 'Vind het boekhoudprogramma dat bij je onderneming past.' }), faqSchema(faq)],
};
