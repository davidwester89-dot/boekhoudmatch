import { SITE, GA_ID, esc, field, slot, sourceList, webApp, fmtDate, more, ORG, ICONS, FOUNDER, METHODE_LIJST, volgendeStap } from '../layout.mjs';
import { SOURCES, IB2026, BTW, CHECKED } from '../lib/constants.js';
import { PAKKETTEN, CHECKED as PCHECKED } from '../lib/pakketten.js';
import { REDACTIE, vendorHref } from '../lib/aanbieders.js';
import { match, VRAGEN } from '../lib/match.js';
import { situaties } from '../lib/situaties.mjs';
import { btwVanExcl } from '../lib/btw.js';
import { euro2 } from '../lib/format.js';
import { HERO_ART } from '../hero-art.mjs';
// Uitkomst bij de standaardinvoer (€ 100 excl., 21%) al in de HTML, zodat er bij laden niets verspringt (zelfde opbouw als js/btw.js).
const BTW0 = btwVanExcl(100, 0.21);
const BTW0_ROWS = [['Exclusief btw', euro2(BTW0.excl)], ['Btw 21%', euro2(BTW0.btw)], ['Inclusief btw', euro2(BTW0.incl), 'total']].map(([l, v, c]) => `<tr${c ? ` class="${c}"` : ''}><td>${l}</td><td>${v}</td></tr>`).join('');

const nl = (x, d = 2) => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
const pc = (x) => nl(x * 100, 2).replace(/,00$/, '') + '%';
const tool = (href, icon, title) => `<a class="tool" href="${href}"><span class="ico">${ICONS[icon]}</span>${title}</a>`;

const N_AANB = PAKKETTEN.length;
const N_PAK = PAKKETTEN.reduce((n, a) => n + a.plannen.length, 0);
const LAATSTE_CONTROLE = PAKKETTEN.map((a) => a.gecontroleerd || PCHECKED).sort()[0]; // oudste controledatum = eerlijkste claim
export const STATS = { N_AANB, N_PAK, LAATSTE_CONTROLE };
const e2 = (x) => '€ ' + x.toFixed(2).replace('.', ',');

// Drie voorbeeldprofielen: de uitkomst komt uit dezelfde match-functie als de tool (bij elke build opnieuw berekend).
export const VOORBEELDEN = [
  { id: 'starter', titel: 'Starter', wie: 'Eenmanszaak, tot 2 facturen en 5 bonnen per maand, budget tot € 10.', a: { rechtsvorm: 'eenmanszaak', facturen: 2, uitgaven: 5, btw: 'plichtig', bank: 'maakt-niet-uit', ib: 'zelf', extra: [], budget: 10 } },
  { id: 'uren', titel: 'Dienstverlener met uren', wie: 'Eenmanszaak, tot 5 facturen per maand, met bankkoppeling, uren en offertes, budget tot € 20.', a: { rechtsvorm: 'eenmanszaak', facturen: 5, uitgaven: 10, btw: 'plichtig', bank: 'auto', ib: 'zelf', extra: ['uren', 'offertes'], budget: 20 } },
  { id: 'groei', titel: 'Groeiende eenmanszaak', wie: 'Eenmanszaak, tot 25 facturen per maand, met bankkoppeling en hulp bij de aangifte, budget tot € 50.', a: { rechtsvorm: 'eenmanszaak', facturen: 25, uitgaven: 50, btw: 'plichtig', bank: 'auto', ib: 'hulp', extra: ['offertes'], budget: 50 } },
];
export const matchUrl = (a) => '/boekhoudprogramma-kiezen/?' + new URLSearchParams({ rechtsvorm: a.rechtsvorm, facturen: a.facturen, uitgaven: a.uitgaven, btw: a.btw, bank: a.bank, offertes: a.extra.includes('offertes') ? '1' : '0', uren: a.extra.includes('uren') ? '1' : '0', ib: a.ib, budget: a.budget === Infinity ? 'geen' : String(a.budget) }).toString();
function voorbeeld(v) {
  const top = match(PAKKETTEN, v.a).filter((r) => r.past).slice(0, 3);
  return `<article class="card example"><h3>${esc(v.titel)}</h3><p class="sub">${esc(v.wie)}</p><ol class="top">${top.map((r) => `<li><strong>${esc(r.naam)} ${esc(r.planNaam)}</strong> <span class="price">${e2(r.prijs)} p/m${r.toeslagen?.length ? ` <small>(incl. ${esc(r.toeslagen.join(', '))})</small>` : ''}</span></li>`).join('')}</ol><a href="${esc(matchUrl(v.a))}" rel="nofollow">Bekijk deze match →</a></article>`;
}
const logoImg = (a) => { const r = REDACTIE[a.id]; return r.logo ? `<img src="/logos/${r.logo}.webp" width="120" height="36" alt="${esc(a.naam)}" loading="lazy" decoding="async">` : `<span class="wordmark">${esc(r.kort)}</span>`; };
export function logoTile(a, href) {
  const r = REDACTIE[a.id];
  const inner = r.logo ? `<img src="/logos/${r.logo}.webp" width="160" height="48" alt="${esc(a.naam)}" loading="lazy" decoding="async">` : `<span class="wordmark">${esc(r.kort)}</span>`;
  return `<a class="logo-tile" href="${href}" title="${esc(a.naam)}">${inner}</a>`;
}

export const home = {
  path: '/',
  title: 'Boekhoudprogramma zzp: welk pakket past? | BoekhoudMatch',
  ogTitle: 'BoekhoudMatch: welk boekhoudprogramma past bij jouw zzp-bedrijf?',
  description: `Welk boekhoudprogramma past bij jouw zzp-bedrijf? 8 vragen, ${N_PAK} pakketten van ${N_AANB} aanbieders, met prijs, limiet en bron. Gratis, zonder account.`,
  og: 'home',
  updated: '2026-10-19',
  body: `
<section class="hero sec">
<div class="hero-txt">
<p class="h1-brand">Boekhoud<b>Match</b>.nl</p>
<h1 class="tagline">Boekhoudprogramma kiezen als zzp'er? Gewoon. Zonder gedoe.</h1>
<p class="lead">Welk boekhoudprogramma past bij jouw zzp-bedrijf? Beantwoord 8 vragen en zie wat bij je past en wat het kost.</p>
<div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/">Start de match</a><a class="btn ghost" href="/boekhoudprogramma-vergelijken/">Vergelijk alle ${N_PAK} pakketten</a></div>
</div>
<div class="hero-side">
${HERO_ART}
<div class="hero-q">
<p class="hero-q-step">Vraag 1 van 8</p>
<p class="hero-q-title" id="hq">Wat is je rechtsvorm?</p>
<div class="hero-q-opts" role="group" aria-labelledby="hq">${VRAGEN.rechtsvorm.map(([v, l]) => `<a class="choice" href="/boekhoudprogramma-kiezen/?rechtsvorm=${v}" rel="nofollow">${esc(l)}<span aria-hidden="true">→</span></a>`).join('')}</div>
<p class="hero-q-foot">Daarna nog 7 korte vragen. Gratis, zonder account.</p>
</div>
</div>
<ul class="trustbar">
<li>${ICONS.kalender}<span>Prijzen gecontroleerd op <time datetime="${LAATSTE_CONTROLE}">${fmtDate(LAATSTE_CONTROLE)}</time></span></li>
<li>${ICONS.bron}<span>Bron bij elke prijs</span></li>
<li>${ICONS.schild}<span>Volgorde nooit betaald</span></li>
<li>${ICONS.gratis}<span>Gratis, zonder account</span></li>
</ul>
</section>

<div class="sec">
<section class="logobar" aria-labelledby="h-aanb">
<h2 id="h-aanb">Deze ${N_AANB} aanbieders vergelijken we</h2>
<div class="logos">${[...PAKKETTEN].sort((x, y) => x.naam.localeCompare(y.naam, 'nl')).map((a) => logoTile(a, vendorHref(a.id))).join('')}</div>
</section>
</div>

<section class="sec tint">
<h2>Beste keuze per situatie</h2>
<p class="sub">Een vaste regel op prijs en functies, uit de prijspagina's van de aanbieders. Partnerschappen tellen niet mee.</p>
<ol class="sitlist">
${situaties().filter((x) => x.top).map((x) => `<li><span class="sit-logo">${logoImg(x.top.a)}</span><span class="sit-txt"><strong>${esc(x.titel)}</strong><span>${esc(x.regel)}</span></span><span class="sit-pick">${esc(x.top.a.naam)} ${esc(x.top.p.naam)}<b>${e2(x.top.prijs)} p/m</b></span><a class="sit-why" href="${vendorHref(x.top.a.id)}">Waarom?<span class="sr-only"> ${esc(x.top.a.naam)}</span></a></li>`).join('\n')}
</ol>
<p><a href="/boekhoudprogramma-kiezen/">Jouw situatie is anders? Doe de match →</a></p>
<p>Wil je weten wat een pakket per maand kost? Bekijk bijvoorbeeld de <a href="/jortt/">Jortt kosten</a> per pakket. Heb je een bv? Lees dan welk <a href="/boekhoudprogramma-bv/">boekhoudpakket voor een bv</a> je nodig hebt.</p>

<a class="vid-teaser" href="/boekhoudprogramma-kiezen/"><img src="/video/boekhoudprogramma-kiezen-480-v2.webp" width="480" height="270" loading="lazy" decoding="async" alt="Stilstaand beeld uit de video: vraag 1 van de match, met een afspeelknop"><span><strong>Video: zo werkt de match in 1 minuut</strong><span>Bekijk hoe je met een paar vragen je boekhoudprogramma kiest →</span></span></a>

</section>

<section class="band method-band sec">
<h2>Zo vergelijken we</h2>
<ol class="steps">
<li><strong>Prijs van de aanbieder zelf.</strong> We halen elke prijs van de prijspagina van de aanbieder en linken naar die bron.</li>
<li><strong>Elke maand gecontroleerd.</strong> Bij elk pakket staat de datum van de laatste controle.</li>
<li><strong>Partnerlinks veranderen niets.</strong> Eerst wat past, dan je budget, dan de prijs. Commissie telt nooit mee.</li>
</ol>
<p class="author">Door <a href="/over/">Redactie BoekhoudMatch</a> · <a href="/boekhoudprogramma-kiezen/#methode">Hoe de match werkt</a></p>
</section>

<section class="sec tint">
<h2>Rekentools voor zzp'ers</h2>
<div class="toolrow">
${tool('/zzp-netto-inkomen/', 'netto', 'Netto-inkomen')}
${tool('/zzp-uurtarief/', 'uur', 'Uurtarief')}
${tool('/btw-berekenen/', 'btw', 'Btw berekenen')}
${tool('/offerte-factuur-maken/', 'factuur', 'Offerte en factuur')}
</div>
</section>

<section class="sec">
{{latest}}
</section>

<section class="sec band-sec">
<div class="cta-band"><div><h2>Welk boekhoudprogramma past bij jou?</h2><p>8 korte vragen, gratis en zonder account.</p></div><a class="btn" href="/boekhoudprogramma-kiezen/" data-cta="home_band">Start de match</a></div>
</section>`,
  // Organization en WebSite staan op elke pagina (layout.mjs, siteGraph).
};

export const btw = {
  path: '/btw-berekenen/',
  title: 'Btw berekenen: 21% of 9%, in- en exclusief | BoekhoudMatch',
  ogTitle: 'Btw berekenen',
  description: 'Reken snel btw uit: van exclusief naar inclusief en terug, met 21% of 9%. Gratis btw-calculator voor zzp\'ers, met uitleg over KOR en btw verlegd.',
  crumb: 'Btw berekenen', og: 'btw',
  body: `
<h1>Btw berekenen</h1>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
${field({ name: 'bedrag', label: 'Bedrag', value: '100', unit: '€' })}
<div class="field"><label for="f-richting">Dit bedrag is</label><select id="f-richting" name="richting"><option value="excl">exclusief btw</option><option value="incl">inclusief btw</option></select></div>
<div class="field"><label for="f-tarief">Btw-tarief</label><select id="f-tarief" name="tarief"><option value="0.21">21% (algemeen)</option><option value="0.09">9% (verlaagd)</option></select></div>
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<h2>Uitkomst</h2>
<table class="kv"><tbody id="out-table">${BTW0_ROWS}</tbody></table>
</section>
</div>
<a class="mobilebar" href="#uitkomst"><span>Uitkomst</span><strong data-mirror></strong></a>
<p class="intro-na">Vul een bedrag in en kies het tarief. Je ziet direct de btw en het bedrag in- en exclusief btw.</p>
<h2>Goed om te weten</h2>
${more('Hoe reken je btw uit?', '<p>Btw = bedrag exclusief × tarief. Exclusief = inclusief ÷ (1 + tarief). We ronden af op hele centen.</p>')}
${more('Wanneer reken je geen btw?', `<p>Met de kleineondernemersregeling (KOR, omzet tot € ${nl(BTW.korGrens, 0)} per jaar) reken je geen btw. Bij verlegde btw (bijvoorbeeld bij zakelijke klanten in een ander EU-land) zet je “btw verlegd” en het btw-nummer van je klant op de factuur.</p>`)}
${more('Bronnen', sourceList(['btw', 'kor'], SOURCES))}
<p>Btw op je factuur zetten? Gebruik de gratis <a href="/offerte-factuur-maken/">factuurtool</a>. Wil je je btw-aangifte rechtstreeks vanuit je boekhouding doen? <a href="/boekhoudprogramma-vergelijken/">Vergelijk welke boekhoudprogramma's dat kunnen</a>.</p>
${volgendeStap([['Btw-aangifte vanuit je boekhoudprogramma', '/btw-aangifte-boekhoudprogramma/'], ['KOR en boekhoudsoftware', '/kor-boekhoudprogramma/']])}
{{related}}`,
  scripts: ['/js/btw.js'],
  schema: [webApp({ name: 'Btw berekenen', url: SITE.domain + '/btw-berekenen/', description: 'Btw uitrekenen van exclusief naar inclusief en terug, 21% of 9%.' })],
};

export const offerte = {
  path: '/offerte-factuur-maken/',
  title: 'Gratis factuur en offerte maken als zzp\'er | BoekhoudMatch',
  ogTitle: 'Gratis offerte en factuur maken',
  description: 'Maak gratis een offerte of factuur met alle verplichte gegevens, ook voor KOR en btw verlegd. Zonder account: alles blijft in je eigen browser.',
  crumb: 'Offerte en factuur maken', og: 'factuur',
  body: `
<h1>Gratis offerte en factuur maken</h1>
<p class="lead">Maak een nette offerte of factuur met alle verplichte gegevens. Zonder account, en je gegevens blijven op je eigen apparaat.</p>
<div class="actions"><a class="btn" href="/tools/offerteklaar.html" data-tool="factuur">Open de factuurtool</a></div>
<h2>Wat de factuurtool doet</h2>
<div class="grid cards">
<div class="card"><h3>Alles wat erop moet</h3><p>KVK- en btw-nummer, factuurnummer, datum en bedragen.</p></div>
<div class="card"><h3>Elk btw-tarief</h3><p>21%, 9%, 0%, KOR en btw verlegd: de juiste vermelding staat er vanzelf op.</p></div>
<div class="card"><h3>Offerte wordt factuur</h3><p>Klant akkoord? Met één klik maak je er een factuur van.</p></div>
</div>
${more('Waar worden mijn gegevens bewaard?', '<p>Alleen in je eigen browser, zodat je ze niet steeds opnieuw hoeft in te vullen. Wij ontvangen niets. Bewaar je facturen zelf minstens 7 jaar.</p>')}
<p>Wil je factureren en boekhouden in één? <a href="/boekhoudprogramma-kiezen/">Doe de boekhoudmatch</a> of <a href="/boekhoudprogramma-vergelijken/">vergelijk alle pakketten</a>.</p>
${volgendeStap([['Gratis boekhoudprogramma: wat krijg je wel en niet?', '/gratis-boekhoudprogramma/'], ['Boekhoudprogramma voor starters', '/boekhoudprogramma-starters/']])}
${slot('boekhoudsoftware', 'partnerlink boekhoudprogramma.')}
{{related}}`,
  schema: [webApp({ name: 'Offerte en factuur maken', url: SITE.domain + '/offerte-factuur-maken/', description: 'Gratis offertes en facturen maken in je browser, zonder account.' })],
};

export const bronnen = {
  path: '/bronnen/',
  title: 'Bronnen en cijfers 2026 | BoekhoudMatch',
  description: 'Alle bedragen en prijzen die onze tools gebruiken, met officiële bron en controledatum: inkomstenbelasting 2026, zelfstandigenaftrek, Zvw en btw.',
  crumb: 'Bronnen en cijfers', updated: '2026-10-19',
  stamp: { checked: [CHECKED, ...PAKKETTEN.map((a) => a.gecontroleerd || PCHECKED)].sort()[0] },
  body: `
<h1>Bronnen en cijfers</h1>
<p class="lead">Alle cijfers en prijzen die onze tools gebruiken, met de bron.</p>
<h2>Boekhoudprogramma's</h2>
<p>Prijzen en functies komen alleen van de site van de aanbieder. Bij verschil geldt de prijs van de aanbieder.</p>
<div class="table-wrap"><table class="data"><thead><tr><th>Aanbieder</th><th>Bron</th><th>Btw</th><th>Gecontroleerd</th></tr></thead><tbody>
${PAKKETTEN.map((a) => `<tr><td>${esc(a.naam)}</td><td>${a.bronnen.map((b) => `<a href="${b.url}" rel="noopener">${esc(b.titel)}</a>`).join('<br>')}</td><td>${a.btwPrijzen === 'excl' ? 'excl. btw' : '<span class="unk">niet vermeld</span>'}</td><td>${fmtDate(a.gecontroleerd || PCHECKED)}</td></tr>`).join('')}
</tbody></table></div>
<h2>Inkomstenbelasting 2026</h2>
<p>Voor wie jonger is dan de AOW-leeftijd.</p>
<div class="table-wrap"><table class="data"><thead><tr><th>Onderdeel</th><th>Waarde</th></tr></thead><tbody>
${IB2026.brackets.map((b, i) => `<tr><td>Schijf ${i + 1}${b.upTo === Infinity ? ` (boven € ${nl(IB2026.brackets[i - 1].upTo, 0)})` : ` (t/m € ${nl(b.upTo, 0)})`}</td><td class="n">${pc(b.rate)}</td></tr>`).join('')}
<tr><td>Algemene heffingskorting (max; afbouw ${pc(IB2026.ahk.rate)} vanaf € ${nl(IB2026.ahk.start, 0)})</td><td class="n">€ ${nl(IB2026.ahk.max, 0)}</td></tr>
<tr><td>Arbeidskorting (max)</td><td class="n">€ ${nl(5685, 0)}</td></tr>
<tr><td>Zelfstandigenaftrek (urencriterium ${nl(IB2026.urencriterium, 0)} uur)</td><td class="n">€ ${nl(IB2026.zelfstandigenaftrek, 0)}</td></tr>
<tr><td>Startersaftrek</td><td class="n">€ ${nl(IB2026.startersaftrek, 0)}</td></tr>
<tr><td>Mkb-winstvrijstelling</td><td class="n">${pc(IB2026.mkbRate)}</td></tr>
<tr><td>Tariefaanpassing aftrekposten</td><td class="n">${pc(IB2026.tariefAanpassing)}</td></tr>
<tr><td>Bijdrage Zvw ondernemer (tot € ${nl(IB2026.zvwMax, 0)})</td><td class="n">${pc(IB2026.zvwRate)}</td></tr>
</tbody></table></div>
${sourceList(['box1_2026', 'kortingen_2026', 'arbeidsinkomen', 'zelfstandigenaftrek_2026', 'mkb_2026', 'tariefaanpassing_2026', 'zvw_2026', 'urencriterium'], SOURCES)}
<h2>Btw</h2>
${sourceList(['btw', 'kor'], SOURCES)}
<h2>Minimumloon 2026</h2>
<p>Voor de veelgestelde vragen bij de <a href="/zzp-uurtarief/">uurtarief-tool</a>. Het minimumloon geldt voor werknemers, niet voor zzp'ers.</p>
${sourceList(['minimumloon_2026'], SOURCES)}
<h2>Bankkoppelingen per bank</h2>
<p>Voor de gids <a href="/bankkoppeling-boekhoudprogramma/">bankkoppeling in je boekhoudprogramma</a>.</p>
<ul class="sources"><li><a href="https://kennisplein.snelstart.nl/klanten/s/article/de-nieuwe-generatie-bankkoppeling-via-psd2" rel="noopener">SnelStart Kennisplein – Een bankkoppeling maken</a></li><li><a href="https://kennisplein.snelstart.nl/klanten/s/article/een-uitgebreide-bankkoppeling-maken" rel="noopener">SnelStart Kennisplein – Een standaard of een uitgebreide bankkoppeling</a></li><li><a href="https://helpcenter.moneybird.nl/nl/articles/208068-bankkoppeling-via-ponto" rel="noopener">Moneybird Kennisbank – Bankkoppeling via Ponto</a></li><li><a href="https://helpcenter.moneybird.nl/nl/articles/208119-bankkoppeling-rabobank" rel="noopener">Moneybird Kennisbank – Bankkoppeling Rabobank</a></li></ul>
<h2>Wijzigingen</h2>
<ul><li>19 oktober 2026: minimumloon 2026 (Rijksoverheid) en bankkoppelingen per bank (SnelStart, Moneybird) als bron toegevoegd.</li><li>11 oktober 2026: Informer MKB Basis aangepast naar € 34 p/m, zoals op informer.nl/prijzen staat.</li><li>10 oktober 2026: de energietools (einde salderen en thuisbatterij) en hun bronnen verwijderd; ze vielen buiten het zzp-thema.</li><li>10 oktober 2026: MoneyMonk toegevoegd (prijzen van moneymonk.nl). Alle prijzen opnieuw gecontroleerd; geen wijzigingen.</li><li>10 oktober 2026: Silvasoft toegevoegd als 9e aanbieder (prijzen en functies van silvasoft.nl).</li><li>9 oktober 2026: nieuw design en blog.</li><li>8 oktober 2026: eerste versie. Rompslomp: tarieven per 1 november 2026.</li></ul>`,
};

// Datum van de laatste inhoudelijke wijziging van /over/ (los van SITE.updated): lastmod in de sitemap.
export const OVER_UPDATED = '2026-10-23';

export const over = {
  path: '/over/',
  updated: OVER_UPDATED,
  title: 'Over BoekhoudMatch: wie we zijn en hoe we werken',
  description: 'Wie maakt BoekhoudMatch, hoe de boekhoudmatch de volgorde bepaalt en hoe we geld verdienen met duidelijk vermelde partnerlinks.',
  crumb: 'Over ons',
  body: `
<h1>Over ${SITE.name}</h1>
<div class="prose">
<p class="lead">We helpen zzp'ers met boekhouding, geld en belasting. Elk getal heeft een bron en alles werkt zonder account.</p>
<h2>Ons team</h2>
<p>Achter BoekhoudMatch zit een klein team dat elke week voor je aan de slag gaat:</p>
<ul>
<li><strong>Prijzen en voorwaarden checken</strong> op de sites van de aanbieders zelf.</li>
<li><strong>Nieuwe regels volgen</strong>, zoals btw, de e-factuur en wijzigingen bij de Belastingdienst.</li>
<li><strong>Gidsen bijwerken</strong> zodra er iets verandert.</li>
<li><strong>De match testen</strong>, zodat de uitkomst klopt met de prijzen.</li>
</ul>
<h2>Wat je hier vindt</h2>
<ul>
<li><a href="/boekhoudprogramma-kiezen/">De boekhoudmatch</a>: 8 vragen, en je ziet welk pakket past en wat het kost.</li>
<li><a href="/boekhoudprogramma-vergelijken/">De vergelijking</a>: alle ${N_PAK} pakketten van ${N_AANB} aanbieders naast elkaar.</li>
<li><a href="/gidsen/">Gidsen</a> per rechtsvorm en situatie, en <a href="/blog/">blogs</a> over regels die veranderen.</li>
<li>Rekentools voor <a href="/zzp-netto-inkomen/">netto-inkomen</a>, <a href="/zzp-uurtarief/">uurtarief</a>, <a href="/btw-berekenen/">btw</a> en een gratis <a href="/offerte-factuur-maken/">factuurtool</a>.</li>
</ul>
<h2>Zo werken we</h2>
${METHODE_LIJST}
<p>We verzinnen geen sterren, reviews of “meest gekozen”-labels. Je hebt geen account nodig en wat je invult, blijft in je eigen browser.</p>
<p>De volledige rekenregels van de match staan <a href="/boekhoudprogramma-kiezen/#methode">bij de match</a>. Alle bronnen en controledatums staan op de <a href="/bronnen/">bronnenpagina</a>.</p>
<h2>Hoe we geld verdienen</h2>
<p>Bij sommige aanbieders staat een partnerlink (via het affiliatenetwerk Daisycon). Sluit je via zo'n link een abonnement af, dan krijgen wij een vergoeding. Jouw prijs blijft gelijk. Partnerlinks worden bij de knoppen vermeld met één zin per blok. Commissie telt nooit mee in de match of de volgorde.</p>
<h2>Fout gezien?</h2>
<p>Een verouderde prijs of een fout in een berekening? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>. We passen het snel aan.</p>
</div>`,
  schema: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Over BoekhoudMatch', url: SITE.domain + '/over/', publisher: ORG }],
};

const GA_COOKIE = GA_ID ? `_ga_${GA_ID.slice(2)}` : '_ga_<ID>';
const gaHtml = `
<h2 id="cookies">Cookies en statistieken</h2>
<p>We gebruiken Google Analytics 4 om te zien hoeveel mensen de site bezoeken, hoe ze ons vinden (bijvoorbeeld via Google) en welke pagina's en tools ze gebruiken. Zo weten we wat helpt en wat beter kan.</p>
<p><strong>Alleen met jouw toestemming.</strong> Pas als je op “Accepteren” klikt, laden we Google Analytics en plaatst Google cookies. Klik je op “Weigeren” of kies je niets, dan wordt er niets geladen en geen cookie geplaatst. De site werkt in alle gevallen volledig.</p>
<div class="table-wrap"><table class="data">
<thead><tr><th scope="col">Cookie</th><th scope="col">Doel</th><th scope="col">Bewaartermijn</th></tr></thead>
<tbody>
<tr><td><code>_ga</code></td><td>Onderscheidt bezoekers met een willekeurig nummer, zodat we unieke bezoekers kunnen tellen.</td><td>1 jaar</td></tr>
<tr><td><code>${GA_COOKIE}</code></td><td>Houdt bij welke pagina's in één bezoek worden bekeken.</td><td>1 jaar</td></tr>
</tbody></table></div>
<p>Je keuze zelf bewaren we in de lokale opslag van je browser (<code>bm-consent</code>, geen cookie). Na 12 maanden vragen we het opnieuw.</p>
<h3>Wat we meten, en wat niet</h3>
<ul>
<li>Bekeken pagina's (zonder wat je invult: invoer in de adresbalk sturen we niet mee), herkomst van het bezoek, apparaat, browser en land of regio.</li>
<li>Of de boekhoudmatch wordt gestart en afgerond, met de naam van het best passende pakket, welke rekentool wordt gebruikt en op welke aanbieder wordt geklikt.</li>
<li>Nooit wat je in de tools invult, zoals omzet, inkomen of je antwoorden. We koppelen de gegevens niet aan je naam of andere gegevens.</li>
</ul>
<h3>Privacyvriendelijk ingesteld</h3>
<ul>
<li>Google Analytics 4 slaat geen IP-adressen op.</li>
<li>Google Signals en advertentiepersonalisatie staan uit; gegevens worden niet gebruikt voor advertenties.</li>
<li>Gegevens in Google Analytics worden na 14 maanden automatisch verwijderd.</li>
</ul>
<h3>Google als verwerker en doorgifte naar de VS</h3>
<p>Google Ireland Limited verwerkt de statistieken in onze opdracht, op basis van de verwerkersvoorwaarden van Google. Gegevens kunnen ook worden verwerkt door Google LLC in de Verenigde Staten. Google LLC is gecertificeerd onder het EU-VS Data Privacy Framework, waarvoor de Europese Commissie een adequaatheidsbesluit heeft genomen. Meer informatie: <a href="https://policies.google.com/privacy?hl=nl" rel="noopener">privacybeleid van Google</a> en <a href="https://business.safety.google/adsprocessorterms/" rel="noopener">verwerkersvoorwaarden van Google</a>.</p>
<p>De grondslag is jouw toestemming (artikel 11.7a Telecommunicatiewet en artikel 6 lid 1 onder a AVG).</p>
<h3>Toestemming wijzigen of intrekken</h3>
<p>Dat kan altijd, net zo makkelijk als geven: klik op <a href="#cookies" data-consent-open>Cookie-instellingen</a> (ook onderaan elke pagina) en kies “Weigeren”. We stoppen dan direct met meten en wissen de Google Analytics-cookies. Je kunt cookies ook wissen via de instellingen van je browser.</p>
<h2>Jouw rechten</h2>
<p>Je mag ons vragen welke gegevens we over je hebben, of die laten aanpassen of verwijderen. Mail ons daarvoor. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de <a href="https://www.autoriteitpersoonsgegevens.nl/" rel="noopener">Autoriteit Persoonsgegevens</a>.</p>`;

// Datum van de laatste inhoudelijke wijziging van /privacy/ (los van SITE.updated): "Bijgewerkt op" en lastmod in de sitemap.
export const PRIVACY_UPDATED = '2026-10-23';

export const privacy = {
  path: '/privacy/',
  updated: PRIVACY_UPDATED,
  title: 'Privacy en cookies | BoekhoudMatch',
  description: GA_ID
    ? 'Hoe BoekhoudMatch met je gegevens omgaat: tools werken in je browser en Google Analytics gebruiken we alleen met jouw toestemming.'
    : 'Hoe BoekhoudMatch met je gegevens omgaat: wat je invult in onze tools blijft in je eigen browser en we gebruiken geen statistieken.',
  crumb: 'Privacy',
  body: `
<h1>Privacy en cookies</h1>
<div class="prose">
<p class="lead">Kort: wat je in onze tools invult, blijft in je eigen browser. ${GA_ID ? 'Alleen als je daar toestemming voor geeft, houden we statistieken bij met Google Analytics.' : 'We houden geen statistieken bij en plaatsen geen cookies.'}</p>
<h2>Wie is verantwoordelijk?</h2>
<p>Verantwoordelijk voor de verwerking van persoonsgegevens op deze site: BoekhoudMatch.nl, <a href="mailto:info@boekhoudmatch.nl">info@boekhoudmatch.nl</a>.</p>
<h2>Tools en match</h2>
<p>Alles wordt in je eigen browser berekend. Wat je invult, komt in de adresbalk te staan zodat je een berekening kunt bewaren of delen. Het wordt niet naar ons verstuurd.</p>
<h2>Factuurtool</h2>
<p>De factuurtool onthoudt je bedrijfsgegevens in de lokale opslag van je browser. Wij kunnen daar niet bij. Je wist het via de instellingen van je browser.</p>
<p>De match bewaart je antwoorden in de lokale opslag van je browser (<code>boekhoudmatch-quiz-v1</code>, maximaal 90 dagen), zodat je later verder kunt. Wij kunnen daar niet bij. “Opnieuw beginnen” wist ze.</p>
${GA_ID ? gaHtml : '<h2 id="cookies">Cookies</h2>\n<p>We plaatsen op dit moment geen cookies en gebruiken geen statistieken. Gaan we dat wel doen, dan vragen we eerst je toestemming en staat hier precies wat we meten.</p>'}
<h2>Hosting</h2>
<p>De site draait op GitHub Pages (GitHub, Inc.). GitHub verwerkt technische gegevens zoals je IP-adres om de site te tonen en te beveiligen; zie de <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">privacyverklaring van GitHub</a>. Wij ontvangen via GitHub geen bezoekersgegevens.</p>
<h2>Partnerlinks</h2>
<p>Partnerlinks worden bij de knoppen vermeld. Klik je erop, dan ga je via het affiliatenetwerk Daisycon naar de aanbieder. Daisycon plaatst op zijn eigen domein een cookie en geeft een klik-ID door aan de aanbieder, om vast te leggen dat je via BoekhoudMatch kwam. Sluit je iets af, dan kunnen wij daardoor een vergoeding krijgen. Daisycon is zelf verantwoordelijk voor die gegevens; zie het <a href="https://daisycon.com/en/legal-information/privacy-policy/" rel="noopener">privacybeleid van Daisycon</a>.</p>
<h2>Contact</h2>
<p>Vragen? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<p>Bijgewerkt op ${fmtDate(PRIVACY_UPDATED)}.</p>
</div>`,
};

export const disclaimer = {
  path: '/disclaimer/',
  title: 'Disclaimer: uitkomsten, prijzen en links | BoekhoudMatch',
  description: 'De uitkomsten van onze tools en artikelen zijn indicaties, geen persoonlijk financieel, fiscaal of juridisch advies.',
  crumb: 'Disclaimer',
  body: `
<h1>Disclaimer</h1>
<div class="prose">
<p class="lead">Onze tools en artikelen geven een indicatie. Ze zijn geen persoonlijk financieel, fiscaal of juridisch advies.</p>
<ul>
<li>We houden bedragen zo actueel en juist mogelijk, maar fouten zijn niet uitgesloten. Bedragen voor 2027 zijn deels nog voorstellen.</li>
<li>Je eigen situatie (partner, ander inkomen, toeslagen, eigen woning) kan tot een andere uitkomst leiden.</li>
<li>Logo's en merknamen zijn eigendom van de betreffende aanbieders. We gebruiken alleen logo's uit hun eigen beeldbank of van hun eigen site, om aan te geven welk pakket we bespreken.</li>
<li>Prijzen van boekhoudprogramma's komen van de sites van de aanbieders op de vermelde datum. De informatie bij de aanbieder is leidend.</li>
<li>Twijfel je? Vraag een adviseur of de Belastingdienst. We zijn niet aansprakelijk voor schade door het gebruik van deze site.</li>
<li>Fout gezien? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</li>
</ul>
</div>`,
};

export const notfound = {
  path: '/404.html', noindex: true,
  title: 'Pagina niet gevonden | BoekhoudMatch',
  description: 'Deze pagina bestaat niet (meer). Ga verder naar de boekhoudmatch, de rekentools of de blog van BoekhoudMatch.',
  body: `<section class="notfound"><h1>Oeps, deze pagina bestaat niet</h1><p class="lead" style="margin:0 auto 10px">Misschien is hij verhuisd. Hier kun je verder:</p><div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/">Doe de boekhoudmatch</a><a class="btn ghost" href="/boekhoudprogramma-vergelijken/">Vergelijk alle pakketten</a><a class="btn ghost" href="/gidsen/">Naar de gidsen</a><a class="btn ghost" href="/">Naar de homepage</a></div><p style="text-align:center">Klopt er een link niet? Mail naar <a href="mailto:info@boekhoudmatch.nl">info@boekhoudmatch.nl</a>.</p></section>`,
};
