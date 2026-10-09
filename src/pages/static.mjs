import { SITE, esc, field, slot, sourceList, webApp, fmtDate, more, ORG, ICONS } from '../layout.mjs';
import { SOURCES, IB2026, ENERGY, BTW, CHECKED } from '../lib/constants.js';
import { PAKKETTEN, CHECKED as PCHECKED } from '../lib/pakketten.js';

const nl = (x, d = 2) => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
const pc = (x) => nl(x * 100, 2).replace(/,00$/, '') + '%';
const tool = (href, icon, title, text) => `<a class="card" href="${href}"><span class="ico">${ICONS[icon]}</span><h3>${title}</h3><p>${text}</p></a>`;

export const home = {
  path: '/',
  title: 'BoekhoudMatch: boekhoudprogramma en rekentools voor zzp',
  ogTitle: 'Vind het boekhoudprogramma dat bij je past',
  description: `Vind in 8 vragen het boekhoudprogramma dat bij je past (${PAKKETTEN.length} aanbieders, echte prijzen) en reken netto inkomen, uurtarief en btw uit. Gratis, geen cookies.`,
  og: 'home',
  body: `
<section class="hero">
<div>
<h1>Boekhouden zonder gedoe begint met het juiste boekhoudprogramma</h1>
<p class="lead">Beantwoord 8 vragen en zie welk boekhoudprogramma bij jouw zzp-bedrijf past. Met echte prijzen en eerlijk uitgelegd.</p>
<div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/">Start de match</a><a class="btn ghost" href="/boekhoudprogramma-vergelijken/">Vergelijk prijzen</a></div>
<ul class="trust"><li>${PAKKETTEN.length} aanbieders vergeleken</li><li>Actuele prijzen</li><li>Geen cookies</li></ul>
</div>
<div class="hero-card" aria-label="Zo werkt het">
<ol>
<li><span>1</span><div><strong>Vertel kort over je bedrijf</strong><br><span class="note">Facturen, bonnen, btw, bank.</span></div></li>
<li><span>2</span><div><strong>Zie wat past en wat het kost</strong><br><span class="note">Per maand, met de limieten erbij.</span></div></li>
<li><span>3</span><div><strong>Kies met een gerust hart</strong><br><span class="note">We leggen uit waarom iets bovenaan staat.</span></div></li>
</ol>
</div>
</section>

<h2>Handige tools voor zzp'ers</h2>
<div class="grid cards">
${tool('/boekhoudprogramma-vergelijken/', 'compare', 'Boekhoudprogramma\'s vergelijken', 'Alle pakketten naast elkaar: prijs, limieten, btw-aangifte en bankkoppeling.')}
${tool('/zzp-netto-inkomen/', 'netto', 'Netto inkomen berekenen', 'Wat houd je over van je winst, en hoeveel moet je opzijzetten?')}
${tool('/zzp-uurtarief/', 'uur', 'Uurtarief berekenen', 'Welk tarief heb je nodig? Ook vanuit je huidige salaris.')}
${tool('/btw-berekenen/', 'btw', 'Btw berekenen', 'Van exclusief naar inclusief en terug, 21% of 9%.')}
${tool('/offerte-factuur-maken/', 'factuur', 'Offerte en factuur maken', 'Gratis, zonder account. Alles blijft in je eigen browser.')}
${tool('/blog/', 'blog', 'Blog', 'Wat verandert er voor zzp\'ers? Kort uitgelegd, met bronnen.')}
</div>

{{latest}}

<h2>Waarom BoekhoudMatch</h2>
<div class="grid cards">
<div class="card"><h3>Echte prijzen</h3><p class="note">Elke prijs komt van de site van de aanbieder, met de datum erbij. Wat we niet kunnen controleren, noemen we “niet vermeld”.</p></div>
<div class="card"><h3>Eerlijke volgorde</h3><p class="note">Je ziet waarom een pakket bovenaan staat. Of wij ergens aan verdienen, telt niet mee.</p></div>
<div class="card"><h3>Officiële cijfers</h3><p class="note">Belastingbedragen van de Belastingdienst en Rijksoverheid. Alle bronnen staan op <a href="/bronnen/">één pagina</a>.</p></div>
</div>

<p class="note" style="margin-top:28px">Ook handig voor thuis: <a href="/salderen-2027/">wat kost het einde van salderen?</a> · <a href="/thuisbatterij-terugverdientijd/">verdient een thuisbatterij zich terug?</a></p>`,
  schema: [
    { '@context': 'https://schema.org', ...ORG, sameAs: [] },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.domain + '/', inLanguage: 'nl-NL', publisher: { '@type': 'Organization', name: SITE.name } },
  ],
};

export const btw = {
  path: '/btw-berekenen/',
  title: 'Btw berekenen: 21% of 9%, in- en exclusief | BoekhoudMatch',
  ogTitle: 'Btw berekenen',
  description: 'Reken snel btw uit: van exclusief naar inclusief en terug, met 21% of 9%. Gratis btw-calculator voor zzp\'ers, met uitleg over KOR en btw verlegd.',
  crumb: 'Btw berekenen', og: 'btw',
  body: `
<h1>Btw berekenen</h1>
<p class="lead">Vul een bedrag in en kies het tarief. Je ziet direct de btw en het bedrag in- en exclusief.</p>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
${field({ name: 'bedrag', label: 'Bedrag', value: '100', unit: '€' })}
<div class="field"><label for="f-richting">Dit bedrag is</label><select id="f-richting" name="richting"><option value="excl">exclusief btw</option><option value="incl">inclusief btw</option></select></div>
<div class="field"><label for="f-tarief">Btw-tarief</label><select id="f-tarief" name="tarief"><option value="0.21">21% (algemeen)</option><option value="0.09">9% (verlaagd)</option></select></div>
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<h2>Uitkomst</h2>
<table class="kv"><tbody id="out-table"></tbody></table>
</section>
</div>
<a class="mobilebar" href="#uitkomst"><span>Uitkomst</span><strong data-mirror></strong></a>
<h2>Goed om te weten</h2>
${more('Hoe reken je btw uit?', '<p>Btw = bedrag exclusief × tarief. Exclusief = inclusief ÷ (1 + tarief). We ronden af op centen.</p>')}
${more('Wanneer reken je geen btw?', `<p>Met de kleineondernemersregeling (KOR, omzet tot € ${nl(BTW.korGrens, 0)} per jaar) reken je geen btw. Bij verlegde btw (bijvoorbeeld bij zakelijke klanten in een ander EU-land) zet je “btw verlegd” en het btw-nummer van je klant op de factuur.</p>`)}
${more('Bronnen', sourceList(['btw', 'kor'], SOURCES))}
<p>Btw op je factuur zetten? Gebruik de gratis <a href="/offerte-factuur-maken/">factuurtool</a>. Wil je je btw-aangifte rechtstreeks vanuit je boekhouding doen? <a href="/boekhoudprogramma-vergelijken/">Vergelijk welke boekhoudprogramma's dat kunnen</a>.</p>
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
<div class="actions"><a class="btn" href="/tools/offerteklaar.html">Open de factuurtool</a></div>
<div class="grid cards">
<div class="card"><h3>Alles wat erop moet</h3><p class="note">KvK- en btw-nummer, factuurnummer, datum, omschrijving en bedragen in- en exclusief btw.</p></div>
<div class="card"><h3>21%, 9%, 0%, KOR en verlegd</h3><p class="note">De juiste vermelding staat er automatisch op.</p></div>
<div class="card"><h3>Offerte wordt factuur</h3><p class="note">Klant akkoord? Met één klik maak je er een factuur van. Opslaan als PDF via afdrukken.</p></div>
</div>
${more('Waar worden mijn gegevens bewaard?', '<p>Alleen in je eigen browser (localStorage), zodat je ze niet steeds opnieuw hoeft in te vullen. Wij ontvangen niets. Bewaar je facturen zelf minimaal 7 jaar.</p>')}
<p>Wil je factureren en boekhouden in één? <a href="/boekhoudprogramma-kiezen/">Doe de boekhoudmatch</a> of <a href="/boekhoudprogramma-vergelijken/">vergelijk alle pakketten</a>.</p>
${slot('boekhoudsoftware', 'partnerlink boekhoudprogramma.')}
{{related}}`,
  schema: [webApp({ name: 'Offerte en factuur maken', url: SITE.domain + '/offerte-factuur-maken/', description: 'Gratis offertes en facturen maken in je browser, zonder account.' })],
};

export const bronnen = {
  path: '/bronnen/',
  title: 'Bronnen en cijfers 2026 | BoekhoudMatch',
  description: 'Alle bedragen en prijzen die onze tools gebruiken, met officiële bron en controledatum: inkomstenbelasting 2026, zelfstandigenaftrek, Zvw en btw.',
  crumb: 'Bronnen en cijfers',
  body: `
<h1>Bronnen en cijfers</h1>
<p class="lead">Alle cijfers en prijzen die onze tools gebruiken, met de bron. Laatst gecontroleerd op ${fmtDate(CHECKED)}.</p>
<h2>Boekhoudprogramma's</h2>
<p>Prijzen en functies komen alleen van de site van de aanbieder, gecontroleerd op ${fmtDate(PCHECKED)}. De prijs bij de aanbieder is leidend.</p>
<div class="table-wrap"><table class="data"><thead><tr><th>Aanbieder</th><th>Bron</th><th>Btw</th></tr></thead><tbody>
${PAKKETTEN.map((a) => `<tr><td>${esc(a.naam)}</td><td>${a.bronnen.map((b) => `<a href="${b.url}" rel="noopener">${esc(b.titel)}</a>`).join('<br>')}</td><td>${a.btwPrijzen === 'excl' ? 'excl. btw' : '<span class="unk">niet vermeld</span>'}</td></tr>`).join('')}
</tbody></table></div>
<h2>Inkomstenbelasting 2026</h2>
<p class="note">Voor wie jonger is dan de AOW-leeftijd.</p>
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
<h2>Energie (salderen en thuisbatterij)</h2>
<div class="table-wrap"><table class="data"><thead><tr><th>Onderdeel</th><th>2026</th><th>2027</th></tr></thead><tbody>
<tr><td>Energiebelasting stroom t/m 10.000 kWh (excl. btw)</td><td class="n">€ ${nl(ENERGY.eb[2026].perKwh, 5)}</td><td class="n">€ ${nl(ENERGY.eb[2027].perKwh, 4)}*</td></tr>
<tr><td>Vermindering energiebelasting (excl. btw)</td><td class="n">€ ${nl(ENERGY.eb[2026].vermindering)}</td><td class="n">€ ${nl(ENERGY.eb[2027].vermindering)}*</td></tr>
<tr><td>Salderen</td><td>volledig</td><td>gestopt</td></tr>
<tr><td>Minimale terugleververgoeding</td><td>–</td><td>50% van de kale prijs</td></tr>
</tbody></table></div>
<p class="note">* Voorstel uit het Belastingplan 2027. Definitief na goedkeuring door het parlement.</p>
${more('Energiebronnen en data', sourceList(['eb_2026', 'eb_2027', 'saldering', 'terugleverkosten_per_kwh', 'cbs_tarieven', 'nedu', 'pvgis', 'epex', 'milieucentraal_zelfverbruik', 'homewizard_battery'], SOURCES))}
<h2>Wijzigingen</h2>
<ul><li>9 oktober 2026: nieuw design en blog.</li><li>8 oktober 2026: eerste versie. Rompslomp: tarieven per 1 november 2026.</li></ul>`,
};

export const over = {
  path: '/over/',
  title: 'Over BoekhoudMatch: wie we zijn en hoe we werken',
  description: 'Wie maakt BoekhoudMatch, hoe de boekhoudmatch de volgorde bepaalt en hoe we (later mogelijk) geld verdienen met duidelijk gemarkeerde partnerlinks.',
  crumb: 'Over ons',
  body: `
<h1>Over ${SITE.name}</h1>
<div class="prose">
<p class="lead">We helpen zzp'ers met boekhouding, geld en belasting. Elk getal heeft een bron en alles werkt zonder account of cookies.</p>
<h2>Hoe de match de volgorde bepaalt</h2>
<p>Eerst wat bij je past en binnen je budget valt, daarna de prijs per maand, met plus- en minpunten voor btw-aangifte, bankkoppeling, offertes, uren en hulp bij je aangifte. De volledige methode staat <a href="/boekhoudprogramma-kiezen/#methode">bij de match</a>. Of wij ergens aan verdienen, telt niet mee.</p>
<h2>Hoe we geld verdienen</h2>
<p>Op dit moment verdienen we niets aan deze site. Later plaatsen we mogelijk partnerlinks: sluit je via zo'n link iets af, dan krijgen wij een vergoeding. Voor jou verandert de prijs niet. Zulke links zijn altijd gemarkeerd en hebben geen invloed op uitkomsten of volgorde.</p>
<h2>Fout gezien?</h2>
<p>Een verouderde prijs of een fout in een berekening? Mail ons via <a href="mailto:${SITE.email}">${SITE.email}</a>. We passen het snel aan en vermelden het op de <a href="/bronnen/">bronnenpagina</a>.</p>
</div>`,
  schema: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'Over BoekhoudMatch', url: SITE.domain + '/over/', publisher: ORG }],
};

export const privacy = {
  path: '/privacy/',
  title: 'Privacy: geen cookies, geen tracking | BoekhoudMatch',
  description: 'BoekhoudMatch plaatst geen cookies en gebruikt geen tracking. Wat je invult in onze tools, blijft in je eigen browser.',
  crumb: 'Privacy',
  body: `
<h1>Privacyverklaring</h1>
<div class="prose">
<p class="lead">Kort: we plaatsen geen cookies, gebruiken geen trackers en verzamelen geen persoonsgegevens via de tools.</p>
<h2>Tools en match</h2>
<p>Alles wordt in je eigen browser berekend. Wat je invult, komt in de adresbalk te staan zodat je een berekening kunt bewaren of delen. Het wordt niet naar ons verstuurd.</p>
<h2>Factuurtool</h2>
<p>De factuurtool onthoudt je bedrijfsgegevens in de lokale opslag van je browser. Wij kunnen daar niet bij. Je wist het via de instellingen van je browser.</p>
<h2>Hosting</h2>
<p>De site draait op GitHub Pages (GitHub, Inc.). GitHub verwerkt technische gegevens zoals je IP-adres om de site te tonen en te beveiligen; zie de <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">privacyverklaring van GitHub</a>. Wij ontvangen zelf geen bezoekersgegevens en houden geen statistieken bij.</p>
<h2>Partnerlinks</h2>
<p>Klik je later op een gemarkeerde partnerlink, dan kan die partij cookies plaatsen volgens haar eigen beleid.</p>
<h2>Contact</h2>
<p>Vragen? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<p class="note">Bijgewerkt op ${fmtDate(SITE.updated)}.</p>
</div>`,
};

export const disclaimer = {
  path: '/disclaimer/',
  title: 'Disclaimer | BoekhoudMatch',
  description: 'De uitkomsten van onze tools en artikelen zijn indicaties, geen persoonlijk financieel, fiscaal of juridisch advies.',
  crumb: 'Disclaimer',
  body: `
<h1>Disclaimer</h1>
<div class="prose">
<p class="lead">Onze tools en artikelen geven een indicatie. Ze zijn geen persoonlijk financieel, fiscaal of juridisch advies.</p>
<ul>
<li>We houden bedragen zo actueel en juist mogelijk, maar fouten zijn niet uitgesloten. Bedragen voor 2027 zijn deels nog voorstellen.</li>
<li>Je eigen situatie (partner, ander inkomen, toeslagen, eigen woning) kan tot een andere uitkomst leiden.</li>
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
  body: `<section class="notfound"><h1>Oeps, deze pagina bestaat niet</h1><p class="lead" style="margin:0 auto 10px">Misschien is hij verhuisd. Hier kun je verder:</p><div class="actions"><a class="btn" href="/boekhoudprogramma-kiezen/">Doe de boekhoudmatch</a><a class="btn ghost" href="/">Naar de homepage</a><a class="btn ghost" href="/blog/">Naar de blog</a></div></section>`,
};
