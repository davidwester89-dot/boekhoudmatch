import { SITE, esc, slot, webApp, faqSchema, faqHtml, fmtDate, more, ICONS } from '../layout.mjs';
import { PAKKETTEN, CHECKED } from '../lib/pakketten.js';
import { VRAGEN, PUNTEN, match } from '../lib/match.js';
import { REDACTIE, vendorHref } from '../lib/aanbieders.js';
import { uitgaand, ctaTekst } from '../lib/partnerlinks.js';

// Uitslag bij de standaardantwoorden alvast in de HTML (zelfde opbouw als kiezen.js), zodat er bij laden niets verspringt.
const euro = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const host = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
const DEF = { aanbieder: '', rechtsvorm: 'eenmanszaak', facturen: '5', uitgaven: '10', btw: 'plichtig', bank: 'auto', offertes: false, uren: false, ib: 'zelf', budget: 'geen', extra: [] };
const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));
const passend0 = match(PAKKETTEN, DEF).filter((r) => r.past);
function knopHtml(r, pos, cls) {
  const a = byId[r.aanbieder], red = REDACTIE[a.id], u = uitgaand(a), c = ctaTekst(red.kort, { proef: red.proef, prijs: r.prijs });
  return { html: `<a class="${cls}" href="${esc(u.href)}" target="_blank" rel="${u.rel}" data-vendor="${esc(a.naam)}" data-pos="${pos}" data-cta="${c.gratis ? 'trial' : 'visit'}">${esc(pos === 1 ? c.tekst : `Bekijk ${red.kort}`)}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opent in een nieuw tabblad)</span></a>`, a, red, u, c };
}
const pagina = (a, pos, t) => `<a class="vlink" href="${vendorHref(a.id)}" data-vendor="${esc(a.naam)}" data-pos="${pos}" data-cta="vendor_page">${esc(t)}</a>`;
const PRE_TOP = passend0.slice(0, 3).map((r, i) => {
  let mini = '';
  if (i > 0) { const k = knopHtml(r, i + 1, 'btn ghost sm'); mini = `<div class="mini-cta">${k.html}${pagina(k.a, i + 1, `Alles over ${k.red.kort}`)}</div>`; }
  return `<li><strong>${esc(`${r.naam} ${r.planNaam}`)}</strong><span class="price">${esc(` ${euro(r.prijs)} p/m${r.toeslagen?.length ? ` (incl. ${r.toeslagen.join(', ')})` : ''}${r.binnenBudget ? '' : ' (boven budget)'}`)}</span>${mini}</li>`;
}).join('');
const PRE_CTA = (() => { const r = passend0[0]; if (!r) return ''; const k = knopHtml(r, 1, 'btn'); return `${k.html}${pagina(k.a, 1, `Lees alles over ${k.red.kort} →`)}`; })();
const PRE_BEST = passend0[0] ? `${passend0[0].naam} ${passend0[0].planNaam}` : '–';
const PRE_CMP = '/boekhoudprogramma-vergelijken/?aanbieders=' + passend0.slice(0, 3).map((r) => r.aanbieder).join(',') + '#per-aanbieder';

const path = '/boekhoudprogramma-kiezen/';

// Video (proef 19-10-2026): klikbaar stilstaand beeld. In de HTML na het formulier (mobiel: onder de vragen); op desktop via CSS boven formulier en uitslag; de <video> met ondertitels komt er pas na een klik in (js/video.js).
const VIDEO = {
  name: 'Boekhoudprogramma kiezen als zzp\'er in 1 minuut',
  description: 'Beantwoord een paar vragen over je bedrijf en zie welk boekhoudprogramma bij je past. Zo werkt de gratis match van BoekhoudMatch.',
  // Breed (16:9, desktop vanaf 900px) en staand (mobiel), allebei met Nederlandse voice-over en dezelfde ondertitels.
  src: '/video/boekhoudprogramma-kiezen-v3.mp4', srcMobiel: '/video/boekhoudprogramma-kiezen-mobiel-v3.mp4', vtt: '/video/boekhoudprogramma-kiezen-desktop-v3.nl.vtt', vttMobiel: '/video/boekhoudprogramma-kiezen-v2.nl.vtt',
  poster: '/video/boekhoudprogramma-kiezen-960-v3.webp', posterMobiel: '/video/boekhoudprogramma-kiezen-poster-v3.webp',
  thumb: '/video/boekhoudprogramma-kiezen-1280-v2.webp', duration: 'PT1M', uploadDate: '2026-10-20T07:05:00+02:00',
};
const videoHtml = `<section class="vid" aria-labelledby="vid-kop">
<div class="vid-box" data-video data-src="${VIDEO.src}" data-src-mobiel="${VIDEO.srcMobiel}" data-vtt="${VIDEO.vtt}" data-vtt-mobiel="${VIDEO.vttMobiel}" data-poster="${VIDEO.poster}" data-poster-mobiel="${VIDEO.posterMobiel}" data-title="${esc(VIDEO.name)}">
<button type="button" class="vid-play" aria-label="Speel de video af: ${esc(VIDEO.name)} (met geluid en ondertitels)"><picture><source media="(min-width: 900px)" srcset="${VIDEO.poster} 960w, ${VIDEO.thumb} 1280w" sizes="640px" width="960" height="540"><img src="${VIDEO.posterMobiel}" srcset="/video/boekhoudprogramma-kiezen-poster-420-v3.webp 420w, ${VIDEO.posterMobiel} 540w" sizes="240px" width="540" height="1268" fetchpriority="high" alt="Stilstaand beeld uit de video: vraag 1 van de match, met een afspeelknop"></picture></button>
</div>
<div class="vid-txt">
<h2 id="vid-kop">Zo werkt de match in 1 minuut</h2>
<p>Een boekhoudprogramma kiezen als zzp'er hoeft niet lang te duren. In de video zie je hoe de match werkt. Je beantwoordt een paar korte vragen: je rechtsvorm, hoeveel facturen en bonnen je hebt, of je btw-aangifte doet, of je je bank wilt koppelen en wat het mag kosten. Daarna zie je meteen je beste match, je top 3 en wat elk pakket per maand kost. Per aanbieder lees je waarom het wel of niet past. De match is gratis en je hebt geen account nodig.</p>
</div>
</section>`;
const videoSchema = {
  '@context': 'https://schema.org', '@type': 'VideoObject', name: VIDEO.name, description: VIDEO.description,
  thumbnailUrl: [SITE.domain + VIDEO.thumb], contentUrl: SITE.domain + VIDEO.src, uploadDate: VIDEO.uploadDate, duration: VIDEO.duration,
  inLanguage: 'nl-NL', isFamilyFriendly: true, publisher: { '@type': 'Organization', name: SITE.name, url: SITE.domain + '/' },
};
const QI = { rechtsvorm: 'persoon', facturen: 'factuur', uitgaven: 'bon', btw: 'btw', bank: 'bank', ib: 'aangifte', budget: 'euro' };
const radios = (name, legend, opts, def, hint = '') => `<fieldset class="q" data-q="${name}"><legend><span class="qi">${ICONS[QI[name]]}</span>${legend}</legend>${hint ? `<p class="hint">${hint}</p>` : ''}<div class="opts">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}"><span>${esc(l)}</span></label>`).join('')}</div></fieldset>`;

const faq = [
  ['Welk boekhoudprogramma is het beste voor een zzp\'er?', 'Dat hangt af van je aantal facturen en bonnen, je btw, of je een bankkoppeling wilt en of je hulp wilt bij je aangifte. Een klein pakket is vaak het goedkoopst, zolang je onder de limiet blijft. De match rekent dat voor je uit.'],
  ['Heb ik een boekhoudprogramma nodig als ik de KOR gebruik?', 'Je doet dan geen btw-aangifte, maar je moet wel een administratie bijhouden en facturen bewaren (7 jaar). Een gratis of klein pakket kan dan genoeg zijn.'],
  ['Zijn de prijzen inclusief btw?', 'De meeste aanbieders noemen prijzen exclusief btw. Zegt de aanbieder het niet, dan staat er “niet vermeld”. Doe je btw-aangifte, dan trek je de btw op je abonnement meestal weer af.'],
  ['Verdienen jullie aan de aanbevelingen?', 'Soms. Bij sommige aanbieders krijgen we een vergoeding als je via onze link een abonnement afsluit (via het affiliatenetwerk Daisycon). Jouw prijs blijft gelijk. Partnerlinks worden bij de knoppen vermeld met één zin per blok en tellen nooit mee in de match of de volgorde.'],
];

const body = `
<h1>Welk boekhoudprogramma past bij jou?</h1>
<p class="lead">8 korte vragen, meteen je uitslag.</p>
<noscript><div class="alert">De match heeft JavaScript nodig. Bekijk anders de <a href="/boekhoudprogramma-vergelijken/">vergelijkingstabel</a>.</div></noscript>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
<input type="hidden" name="aanbieder" value="">
<div class="qprog"><p id="q-prog">0 van 8 vragen beantwoord</p><p class="sub" id="q-voorlopig">Tot je kiest, rekent de uitslag met gangbare antwoorden.</p><div class="qbar" role="progressbar" aria-label="Voortgang" aria-valuemin="0" aria-valuemax="8" aria-valuenow="0"><span id="q-bar"></span></div></div>
<p class="resume" id="q-resume" hidden>Je vorige antwoorden staan er weer (alleen bewaard op dit apparaat). <button type="button" class="linkbtn" data-reset data-cta="restart">Opnieuw beginnen</button></p>
${radios('rechtsvorm', '1. Wat is je rechtsvorm?', VRAGEN.rechtsvorm, 'eenmanszaak')}
${radios('facturen', '2. Hoeveel facturen stuur je per maand?', VRAGEN.facturen, 5)}
${radios('uitgaven', '3. Hoeveel bonnen en inkoopfacturen heb je per maand?', VRAGEN.uitgaven, 10, 'Denk aan abonnementen, tanken, materiaal en telefoon.')}
${radios('btw', '4. Btw', VRAGEN.btw, 'plichtig')}
${radios('bank', '5. Wil je je bank automatisch koppelen?', VRAGEN.bank, 'auto')}
<fieldset class="q" data-q="extra"><legend><span class="qi">${ICONS.extra}</span>6. Wat wil je er ook mee doen?</legend><div class="opts">
<label><input type="checkbox" name="offertes"><span>Offertes maken</span></label>
<label><input type="checkbox" name="uren"><span>Uren of projecten bijhouden</span></label>
</div></fieldset>
${radios('ib', '7. Je aangifte inkomstenbelasting', VRAGEN.ib, 'zelf')}
${radios('budget', '8. Wat mag het per maand kosten (excl. btw)?', VRAGEN.budget.map(([v, l]) => [v === Infinity ? 'geen' : String(v), l]), '')}
<div class="qdone"><button type="submit" class="btn" id="q-submit">Toon mijn uitslag</button><p>Gratis, zonder account.</p></div>
</form>
${videoHtml}
<section class="card result" id="uitkomst" aria-live="polite">
<h2 id="uitkomst-kop" tabindex="-1">Jouw beste match</h2>
<p class="big best" id="big-mirror">${esc(PRE_BEST)}</p>
<div id="out-cta" class="match-cta">${PRE_CTA}</div>
<div id="out-pick" class="pick" hidden></div>
<p class="lbl" style="margin-bottom:4px">Top 3</p>
<ol class="top" id="out-top">${PRE_TOP}</ol>
<div class="match-next">
<a class="btn ghost" id="out-cmp" href="${esc(PRE_CMP)}" rel="nofollow" data-cta="compare">Vergelijk deze 3 naast elkaar</a>
<p class="match-links"><a href="/boekhoudprogramma-kiezen/" data-reset data-cta="restart">Opnieuw beginnen</a><button type="button" class="linkbtn" id="out-copy" data-cta="copy_link">Deel of bewaar: kopieer de link</button> <span id="out-copy-ok" class="sub" role="status"></span></p>
<p class="sub">Je antwoorden staan in de link en blijven alleen op dit apparaat bewaard. Geen account, geen e-mail.</p>
</div>
<p><a class="vlink" href="#rangorde">Bekijk alle ${PAKKETTEN.length} aanbieders ↓</a></p>
</section>
</div>
<a class="mobilebar" href="#uitkomst"><span>Beste match</span><strong data-mirror></strong></a>
<p class="intro-na">Beantwoord 8 korte vragen. Je ziet meteen wat past, wat het kost en waarom.</p>

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
  path, title: 'Boekhoudprogramma kiezen als zzp\'er | BoekhoudMatch', og: 'match', ogTitle: 'Welk boekhoudprogramma past bij jou?',
  description: `Welk boekhoudprogramma past bij jouw zzp-bedrijf? 8 vragen, ${PAKKETTEN.length} aanbieders, actuele prijzen en eerlijk uitgelegd waarom. Gratis, zonder account.`,
  crumb: 'Boekhoudprogramma kiezen', body, scripts: ['/js/kiezen.js', '/js/video.js'], updated: '2026-10-21',
  schema: [webApp({ name: 'Boekhoudprogramma-match', url: SITE.domain + path, description: 'Vind het boekhoudprogramma dat bij je onderneming past.' }), faqSchema(faq), videoSchema],
};
