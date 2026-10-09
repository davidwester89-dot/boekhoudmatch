import { SITE, esc, slot, webApp, faqSchema, faqHtml, fmtDate } from '../layout.mjs';
import { PAKKETTEN, CHECKED } from '../lib/pakketten.js';
import { VRAGEN, PUNTEN } from '../lib/match.js';

const path = '/boekhoudprogramma-kiezen/';
const radios = (name, legend, opts, def, hint = '') => `<fieldset class="q"><legend>${legend}</legend>${hint ? `<p class="hint">${hint}</p>` : ''}<div class="opts">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}"${String(v) === String(def) ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></fieldset>`;

const faq = [
  ['Welk boekhoudprogramma is het beste voor een zzp\'er?', 'Dat hangt af van hoeveel facturen en bonnen je hebt, of je btw-aangifte doet of de KOR gebruikt, of je een automatische bankkoppeling wilt en of je hulp wilt bij je aangifte inkomstenbelasting. Een klein pakket met limieten is vaak het goedkoopst. Ga je over de limiet, dan moet je upgraden. De match rekent dat voor je uit.'],
  ['Heb ik een boekhoudprogramma nodig als ik de KOR gebruik?', 'Je doet dan geen btw-aangifte, maar je moet wel een administratie bijhouden en facturen bewaren (7 jaar). Een gratis of klein pakket kan dan genoeg zijn.'],
  ['Zijn de prijzen inclusief btw?', 'De meeste aanbieders noemen prijzen exclusief btw. Waar de prijspagina dat niet zegt, staat “niet vermeld” in de vergelijking. Als ondernemer met btw-aangifte trek je de btw op je abonnement meestal weer af.'],
  ['Verdienen jullie aan de aanbevelingen?', 'Op dit moment niet. Mogelijk plaatsen we later gemarkeerde partnerlinks. De rangorde gebruikt die informatie niet; dat staat in de methode en wordt automatisch getest.'],
];

const body = `
<span class="tag">Prijzen gecontroleerd op ${fmtDate(CHECKED)} · ${PAKKETTEN.length} aanbieders</span>
<h1>Welk boekhoudprogramma past bij jou?</h1>
<p class="lead">Beantwoord 8 vragen. Je ziet direct welke pakketten passen, wat ze per maand kosten en waarom ze bovenaan staan. Alle prijzen en functies komen van de websites van de aanbieders zelf.</p>
<noscript><div class="alert">De match heeft JavaScript nodig. Je kunt ook de <a href="/boekhoudprogramma-vergelijken/">vergelijkingstabel</a> bekijken.</div></noscript>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
${radios('rechtsvorm', '1. Wat is je rechtsvorm?', VRAGEN.rechtsvorm, 'eenmanszaak')}
${radios('facturen', '2. Hoeveel verkoopfacturen stuur je per maand?', VRAGEN.facturen, 5)}
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
<h2 style="margin-top:0">Uitkomst</h2>
<p>Beste match voor jou:</p>
<p class="big best" id="big-mirror">–</p>
<p class="note" style="margin-bottom:4px">Top 3:</p>
<ol class="top" id="out-top"></ol>
<p class="note" id="out-vol"></p>
<p class="note"><a href="#rangorde">Bekijk alle ${PAKKETTEN.length} aanbieders en waarom ze wel of niet passen ↓</a></p>
</section>
</div>
<a class="mobilebar" href="#uitkomst">Beste match: <strong data-mirror></strong> ↓</a>

<h2 id="rangorde">Volledige rangorde</h2>
<div id="out-list" class="ranklist"></div>
${slot('boekhoudmatch-partner', 'Hier komt straks bij sommige pakketten mogelijk een gemarkeerde partnerlink naar de gratis proefperiode. De rangorde hierboven verandert daar niet door: ook pakketten zonder partnerprogramma staan erin.')}

<h2 id="methode">Zo werkt de match</h2>
<div class="prose">
<ol>
<li><strong>Volume schatten.</strong> Uit je antwoorden schatten we je banktransacties (facturen + bonnen + 3 voor btw, privé-opname en bankkosten) en je boekingen (facturen + bonnen + banktransacties). Elk antwoord rekenen we met de bovenkant van de gekozen klasse.</li>
<li><strong>Harde eisen.</strong> Een pakket valt af als het je rechtsvorm uitdrukkelijk niet ondersteunt, onder je volume zit (facturen, bonnen, transacties of boekingen), geen boekhouding of geen btw-aangifte heeft terwijl je die nodig hebt, geen automatische bankkoppeling heeft als je die wilt, of alleen via een boekhouder werkt terwijl je zelf wilt boekhouden. Wil je alles uitbesteden, dan tellen alleen pakketten met een boekhouder erin of erbij.</li>
<li><strong>Per aanbieder het goedkoopste passende pakket.</strong> Extra kosten die je zeker maakt, zoals een betaalde bankkoppeling of een prijs per factuur, tellen we mee.</li>
<li><strong>Rangorde.</strong> Eerst pakketten die passen en binnen je budget vallen, daarna passende pakketten boven je budget, dan de rest. Binnen een groep telt de score:
<ul>
<li>100 min de maandprijs: elke euro telt even zwaar.</li>
<li>Btw-aangifte: direct indienen +${PUNTEN.btwDirect}, “btw-aangifte” zonder details +${PUNTEN.btwJa}, alleen berekenen +${PUNTEN.btwHandmatig}.</li>
<li>Automatische bankkoppeling +${PUNTEN.bankAuto}. Alleen via de eigen rekening van de aanbieder ${PUNTEN.eigenRekening}.</li>
<li>Gewenste offertes of uren: inbegrepen +${PUNTEN.extraJa}, niet te verifiëren ${PUNTEN.extraOnbekend}, niet inbegrepen ${PUNTEN.extraNee}.</li>
<li>Hulp bij de IB-aangifte als je die wilt: +${PUNTEN.ibMatch}. Boekhouder inbegrepen bij uitbesteden: +${PUNTEN.ibVolledig}.</li>
<li>Rechtsvorm niet vermeld (bij vof of bv): ${PUNTEN.rechtsvormOnbekend}.</li>
</ul>
Bij gelijke score wint de laagste prijs, daarna de alfabetische volgorde.</li>
<li><strong>Wat níet meetelt:</strong> of wij partner zijn van een aanbieder, tijdelijke acties en kortingen (die tonen we wel), reviews en populariteit.</li>
<li><strong>Onbekend is onbekend.</strong> Staat een functie niet per pakket op de prijspagina, dan tonen we “niet te verifiëren” en vullen we niets zelf in.</li>
</ol>
<p>De prijzen zijn de reguliere maandprijzen bij maandbetaling. Een lagere prijs bij jaarbetaling staat erbij. Gecontroleerd op ${fmtDate(CHECKED)}: zie <a href="/bronnen/">bronnen</a> en de <a href="/boekhoudprogramma-vergelijken/">vergelijkingstabel</a>.</p>
</div>

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}
`;

export default {
  path, title: 'Boekhoudprogramma kiezen: doe de match (zzp, 2026) | BoekhoudMatch',
  description: `Welk boekhoudprogramma past bij jouw zzp-bedrijf? 8 vragen, ${PAKKETTEN.length} Nederlandse aanbieders, actuele prijzen van de aanbieders zelf en een uitlegbare rangorde. Gratis en zonder cookies.`,
  crumb: 'Boekhoudprogramma kiezen', body, scripts: ['/js/kiezen.js'],
  schema: [webApp({ name: 'Boekhoudprogramma-match', url: SITE.domain + path, description: 'Vind het boekhoudprogramma dat bij je onderneming past.' }), faqSchema(faq)],
};
