import { SITE, esc, field, slot, sourceList, webApp, fmtDate } from '../layout.mjs';
import { SOURCES, IB2026, ENERGY, BTW, CHECKED } from '../lib/constants.js';
import { PAKKETTEN, CHECKED as PCHECKED } from '../lib/pakketten.js';

const nl = (x, d = 2) => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
const pc = (x) => nl(x * 100, 2).replace(/,00$/, '') + '%';

export const home = {
  path: '/',
  title: 'BoekhoudMatch – boekhouding, geld en belasting voor zzp\'ers',
  description: 'Vind het boekhoudprogramma dat bij je past met een onafhankelijke match op echte prijzen, en reken je netto inkomen, uurtarief en btw uit met de officiële cijfers van 2026. Geen cookies.',
  body: `
<h1>Boekhouding, geld en belasting voor zzp'ers</h1>
<p class="lead">Welk boekhoudprogramma past bij jou, wat houd je netto over en welk uurtarief heb je nodig? Gratis tools op officiële cijfers en de actuele prijzen van de aanbieders zelf, met de bron erbij. Geen account, geen cookies, geen tracking.</p>
<a class="card feature" href="/boekhoudprogramma-kiezen/"><span class="tag">Nieuw · 8 vragen</span><h2>Boekhoudprogramma-match</h2><p>Beantwoord 8 vragen over je onderneming. Je ziet welke pakketten van ${PAKKETTEN.length} Nederlandse aanbieders passen, wat ze per maand kosten en <strong>waarom</strong> ze bovenaan staan. Of we ergens een partnerlink hebben, telt niet mee in de rangorde.</p><span class="btn">Start de match →</span></a>
<h2>Tools voor zzp'ers</h2>
<div class="grid cards">
<a class="card" href="/boekhoudprogramma-vergelijken/"><span class="tag">Prijzen ${fmtDate(PCHECKED)}</span><h3>Boekhoudprogramma's vergelijken 2026</h3><p>Alle pakketten naast elkaar: prijs, limieten, btw-aangifte, bankkoppeling, offertes en uren.</p></a>
<a class="card" href="/zzp-netto-inkomen/"><span class="tag">Zzp 2026</span><h3>Netto inkomen zzp</h3><p>Van winst naar netto, met alle aftrekposten en kortingen van 2026. Inclusief hoeveel je moet reserveren.</p></a>
<a class="card" href="/zzp-uurtarief/"><span class="tag">Zzp 2026</span><h3>Uurtarief berekenen</h3><p>Welk tarief heb je nodig? En welk tarief staat gelijk aan je salaris in loondienst?</p></a>
<a class="card" href="/btw-berekenen/"><span class="tag">Btw</span><h3>Btw berekenen</h3><p>Van exclusief naar inclusief en terug, 21% of 9%.</p></a>
<a class="card" href="/offerte-factuur-maken/"><span class="tag">Gratis tool</span><h3>Offerte en factuur maken</h3><p>Met alle verplichte gegevens, zonder account. Alles blijft in je eigen browser.</p></a>
</div>
<h2>Hoe we werken</h2>
<div class="prose">
<ul>
<li><strong>Prijzen van de bron.</strong> Elke prijs en functie in de boekhoudmatch komt van de website van de aanbieder zelf, met de datum waarop we keken. Wat we niet konden controleren, staat er als “niet vermeld”. We vullen het niet zelf in.</li>
<li><strong>Uitlegbare rangorde.</strong> Bij elk pakket zie je waarom het past, waar je op moet letten en hoe de score is opgebouwd.</li>
<li><strong>Officiële belastingcijfers.</strong> Belastingdienst en Rijksoverheid, met bronnen op <a href="/bronnen/">één pagina</a>.</li>
<li><strong>Geen tracking.</strong> Geen cookies, geen advertentienetwerken. Wat je invult blijft in je browser.</li>
<li><strong>Open over ons verdienmodel.</strong> Mogelijk plaatsen we later duidelijk gemarkeerde partnerlinks. Die hebben geen invloed op uitkomsten of rangorde. Zie <a href="/over/">over ons</a>.</li>
</ul>
</div>
<h2 class="small">Ook handig</h2>
<p class="note">Voor ondernemers met zonnepanelen thuis: <a href="/salderen-2027/">wat kost het einde van salderen in 2027?</a> · <a href="/thuisbatterij-terugverdientijd/">verdient een thuisbatterij zich terug?</a></p>`,
  schema: [{ '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, url: SITE.domain + '/', logo: SITE.domain + '/favicon.svg' }],
};

export const btw = {
  path: '/btw-berekenen/',
  title: 'Btw berekenen: 21% of 9%, inclusief en exclusief | BoekhoudMatch',
  description: 'Reken btw uit van exclusief naar inclusief en terug, met 21% of 9%. Gratis en zonder cookies.',
  crumb: 'Btw berekenen',
  body: `
<h1>Btw berekenen</h1>
<p class="lead">Van een bedrag exclusief btw naar inclusief, of andersom. Met het algemene tarief van 21% of het verlaagde tarief van 9%.</p>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
${field({ name: 'bedrag', label: 'Bedrag', value: '100', unit: '€' })}
<div class="field"><label for="f-richting">Dit bedrag is</label><select id="f-richting" name="richting"><option value="excl">exclusief btw</option><option value="incl">inclusief btw</option></select></div>
<div class="field"><label for="f-tarief">Btw-tarief</label><select id="f-tarief" name="tarief"><option value="0.21">21% (algemeen)</option><option value="0.09">9% (verlaagd)</option></select></div>
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<table class="kv"><tbody id="out-table"></tbody></table>
<p class="note">Formules: btw = exclusief × tarief. Exclusief = inclusief ÷ (1 + tarief). Afgerond op centen.</p>
</section>
</div>
<a class="mobilebar" href="#uitkomst">Uitkomst: <strong data-mirror></strong> ↓</a>
<h2>Goed om te weten</h2>
<div class="prose">
<p>Gebruik je de kleineondernemersregeling (KOR, omzet tot € ${nl(BTW.korGrens, 0)} per jaar), dan reken je geen btw en zet je op je factuur een vermelding dat je vrijgesteld bent. Bij verlegde btw (bijvoorbeeld in de bouw of bij zakelijke klanten in de EU) zet je “btw verlegd” op de factuur en het btw-nummer van je klant.</p>
</div>
<h2>Bronnen</h2>
${sourceList(['btw', 'kor'], SOURCES)}`,
  scripts: ['/js/btw.js'],
  schema: [webApp({ name: 'Btw berekenen', url: SITE.domain + '/btw-berekenen/', description: 'Btw uitrekenen van exclusief naar inclusief en terug.' })],
};

export const offerte = {
  path: '/offerte-factuur-maken/',
  title: 'Gratis offerte en factuur maken als zzp\'er (zonder account) | BoekhoudMatch',
  description: 'Maak gratis een offerte of factuur met alle verplichte gegevens: btw 21/9/0%, KOR en btw verlegd. Zonder account, alles blijft in je eigen browser. Printen naar PDF.',
  crumb: 'Offerte en factuur maken',
  body: `
<h1>Offerte en factuur maken</h1>
<p class="lead">Een complete offerte- en factuurtool voor zzp'ers die volledig in je browser werkt. Geen account, geen server: je gegevens blijven op je eigen apparaat. Opslaan als PDF via afdrukken.</p>
<p><a class="btn" href="/tools/offerteklaar.html">Open de offerte- en factuurtool</a></p>
<h2>Wat zit erin</h2>
<div class="prose"><ul>
<li>Btw-tarieven 21%, 9% en 0%, kleineondernemersregeling (KOR) en btw verlegd.</li>
<li>Alle verplichte factuurgegevens volgens de KVK: naam en adres, KvK-nummer, btw-nummer, factuurdatum, doorlopend factuurnummer, leverdatum, omschrijving, bedragen exclusief en inclusief btw.</li>
<li>Offerte met geldigheidsdatum, uitsluitingen en akkoordblok; daarna met één klik omzetten naar factuur.</li>
<li>Je bedrijfsgegevens worden alleen in je eigen browser bewaard (localStorage), zodat je ze niet steeds opnieuw hoeft in te vullen. Wij ontvangen niets.</li>
</ul>
<p>Bewaar je facturen zelf (minimaal 7 jaar). Deze tool is geen boekhouding: voor btw-aangifte en administratie is een boekhoudprogramma handiger.</p></div>
<p>Wil je factureren en boekhouden in één? <a href="/boekhoudprogramma-kiezen/">Doe de boekhoudmatch</a> of <a href="/boekhoudprogramma-vergelijken/">vergelijk alle pakketten</a>.</p>
${slot('boekhoudsoftware', 'Hier komt straks mogelijk een partnerlink naar een boekhoudprogramma met gratis proefperiode.')}
`,
};

export const bronnen = {
  path: '/bronnen/',
  title: 'Bronnen en cijfers 2026–2027 | BoekhoudMatch',
  description: 'Alle bedragen en percentages die onze rekentools gebruiken, met officiële bron en controledatum: box 1 2026, heffingskortingen, zelfstandigenaftrek, Zvw, energiebelasting 2026/2027.',
  crumb: 'Bronnen & cijfers',
  body: `
<h1>Bronnen &amp; cijfers</h1>
<p class="lead">Alle cijfers en prijzen die onze tools gebruiken, met de bron. Laatst gecontroleerd op ${fmtDate(CHECKED)}.</p>
<h2>Boekhoudprogramma's (prijzen en functies)</h2>
<p>Alleen van de eigen website van de aanbieder, gecontroleerd op ${fmtDate(PCHECKED)}. Prijzen kunnen sindsdien veranderd zijn; de prijs bij de aanbieder geldt.</p>
<table class="data"><thead><tr><th>Aanbieder</th><th>Bron</th><th>Btw-vermelding</th></tr></thead><tbody>
${PAKKETTEN.map((a) => `<tr><td>${esc(a.naam)}</td><td>${a.bronnen.map((b) => `<a href="${b.url}" rel="noopener">${esc(b.titel)}</a>`).join('<br>')}</td><td>${a.btwPrijzen === 'excl' ? 'excl. btw' : '<span class="unk">niet vermeld</span>'}</td></tr>`).join('')}
</tbody></table>
<p class="note">Niet per pakket te controleren functies staan in de vergelijking en de match als “niet vermeld”. Ze tellen in de match als onzeker (zie <a href="/boekhoudprogramma-kiezen/#methode">methode</a>).</p>
<h2>Inkomstenbelasting 2026 (jonger dan AOW-leeftijd)</h2>
<table class="data"><thead><tr><th>Onderdeel</th><th>Waarde</th></tr></thead><tbody>
${IB2026.brackets.map((b, i) => `<tr><td>Schijf ${i + 1}${b.upTo === Infinity ? ` (boven € ${nl(IB2026.brackets[i - 1].upTo, 0)})` : ` (t/m € ${nl(b.upTo, 0)})`}</td><td class="n">${pc(b.rate)}</td></tr>`).join('')}
<tr><td>Algemene heffingskorting (max; afbouw ${pc(IB2026.ahk.rate)} vanaf € ${nl(IB2026.ahk.start, 0)}, € 0 vanaf € ${nl(IB2026.ahk.end, 0)})</td><td class="n">€ ${nl(IB2026.ahk.max, 0)}</td></tr>
<tr><td>Arbeidskorting (max; € 0 vanaf € ${nl(IB2026.ak.at(-1).to, 0)})</td><td class="n">€ ${nl(5685, 0)}</td></tr>
<tr><td>Zelfstandigenaftrek (urencriterium ${nl(IB2026.urencriterium, 0)} uur)</td><td class="n">€ ${nl(IB2026.zelfstandigenaftrek, 0)}</td></tr>
<tr><td>Startersaftrek</td><td class="n">€ ${nl(IB2026.startersaftrek, 0)}</td></tr>
<tr><td>Mkb-winstvrijstelling</td><td class="n">${pc(IB2026.mkbRate)}</td></tr>
<tr><td>Tariefaanpassing aftrekposten (voordeel max ${pc(IB2026.aftrekTarief)})</td><td class="n">${pc(IB2026.tariefAanpassing)}</td></tr>
<tr><td>Inkomensafhankelijke bijdrage Zvw ondernemer (max bijdrage-inkomen € ${nl(IB2026.zvwMax, 0)})</td><td class="n">${pc(IB2026.zvwRate)}</td></tr>
</tbody></table>
${sourceList(['box1_2026', 'kortingen_2026', 'arbeidsinkomen', 'zelfstandigenaftrek_2026', 'mkb_2026', 'tariefaanpassing_2026', 'zvw_2026', 'urencriterium'], SOURCES)}
<h2>Energie (ook handig)</h2>
<table class="data"><thead><tr><th>Onderdeel</th><th>2026</th><th>2027</th></tr></thead><tbody>
<tr><td>Energiebelasting elektriciteit t/m 10.000 kWh (excl. btw)</td><td class="n">€ ${nl(ENERGY.eb[2026].perKwh, 5)}</td><td class="n">€ ${nl(ENERGY.eb[2027].perKwh, 4)}*</td></tr>
<tr><td>Vermindering energiebelasting per aansluiting (excl. btw)</td><td class="n">€ ${nl(ENERGY.eb[2026].vermindering)}</td><td class="n">€ ${nl(ENERGY.eb[2027].vermindering)}*</td></tr>
<tr><td>Salderen</td><td>volledig</td><td>gestopt per 1 januari</td></tr>
<tr><td>Minimale terugleververgoeding</td><td>–</td><td class="n">50% van kale leveringsprijs (t/m 2029)</td></tr>
<tr><td>CBS gemiddeld leveringstarief stroom aug. 2026 (incl. btw)</td><td class="n">€ ${nl(ENERGY.cbsAug2026.kaalInclBtw, 4)}</td><td></td></tr>
<tr><td>Btw</td><td class="n">21%</td><td class="n">21%</td></tr>
</tbody></table>
<p class="note">* Voorstel uit het Belastingplan 2027 (Prinsjesdag, september 2026). Wordt definitief na goedkeuring door het parlement, meestal in december. We werken de tools dan bij.</p>
${sourceList(['eb_2026', 'eb_2027', 'saldering', 'terugleverkosten_per_kwh', 'cbs_tarieven'], SOURCES)}
<h2>Data voor de thuisbatterij-simulatie</h2>
${sourceList(['nedu', 'pvgis', 'epex', 'milieucentraal_zelfverbruik', 'homewizard_battery'], SOURCES)}
<p class="note">Uit de EPEX-uurprijzen van 2025 volgt een gemiddelde beursprijs van ${nl(8.68, 2)} ct/kWh, maar een zon-gewogen gemiddelde van slechts ${nl(4.85, 2)} ct/kWh (excl. btw): zonnestroom is op de beurs ongeveer de helft waard van een gemiddelde kWh, omdat iedereen tegelijk zon opwekt.</p>
<h2>Btw</h2>
${sourceList(['btw', 'kor'], SOURCES)}
<h2>Wijzigingen</h2>
<ul><li>${fmtDate(CHECKED)}: eerste versie van BoekhoudMatch. Alle cijfers en prijzen gecontroleerd. Rompslomp: we rekenen met de tarieven per 1 november 2026.</li></ul>`,
};

export const over = {
  path: '/over/',
  title: 'Over BoekhoudMatch en ons verdienmodel',
  description: 'Wie maakt BoekhoudMatch, hoe de boekhoudmatch rangschikt en hoe we geld verdienen (partnerlinks, duidelijk gemarkeerd, zonder invloed op de rangorde).',
  crumb: 'Over & verdienmodel',
  body: `
<h1>Over ${SITE.name}</h1>
<div class="prose">
<p>${SITE.name} helpt zzp'ers met boekhouding, geld en belasting: welk boekhoudprogramma past bij je, wat houd je netto over en welk tarief heb je nodig. Ons uitgangspunt: elk getal heeft een bron, de rekenmethode staat erbij en de tools werken zonder account of cookies.</p>
<h2>Hoe de boekhoudmatch rangschikt</h2>
<p>De rangorde volgt een vaste, openbare methode: eerst wat aan je eisen voldoet en binnen je budget valt, daarna de laagste maandprijs, met plus- en minpunten voor btw-aangifte, bankkoppeling, offertes, uren en hulp bij de aangifte. De volledige methode staat <a href="/boekhoudprogramma-kiezen/#methode">bij de match</a>. Of wij aan een aanbieder kunnen verdienen, is <strong>geen</strong> onderdeel van die methode. Dat controleren we met geautomatiseerde tests.</p>
<h2>Hoe we geld verdienen</h2>
<p>Op dit moment verdienen we niets aan deze site en zijn we bij geen enkele aanbieder partner. Later plaatsen we mogelijk <strong>partnerlinks</strong> (affiliate links). Sluit je via zo'n link iets af, dan krijgen wij een vergoeding van die partij. Voor jou verandert de prijs niet.</p>
<ul>
<li>Partnerlinks zijn altijd duidelijk gemarkeerd als partnerlink.</li>
<li>Ze hebben nooit invloed op de uitkomst van een berekening of de volgorde in de match.</li>
<li>Pakketten waar we niets aan verdienen, staan er net zo goed in, ook bovenaan als ze beter passen.</li>
</ul>
<h2>Fouten en correcties</h2>
<p>Zie je een fout, een verouderde prijs of een functie die we verkeerd hebben? We passen het zo snel mogelijk aan en vermelden de wijziging op de bronnenpagina. Mail ons via <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
</div>`,
};

export const privacy = {
  path: '/privacy/',
  title: 'Privacy: geen cookies, geen tracking | BoekhoudMatch',
  description: 'Deze site plaatst geen cookies en gebruikt geen tracking. Wat je invult blijft in je browser.',
  crumb: 'Privacy',
  body: `
<h1>Privacyverklaring</h1>
<div class="prose">
<p><strong>Kort:</strong> ${SITE.name} (boekhoudmatch.nl) plaatst geen cookies, gebruikt geen trackers of advertentienetwerken en verzamelt geen persoonsgegevens via de rekentools of de boekhoudmatch.</p>
<h2>Rekentools en boekhoudmatch</h2>
<p>Alle berekeningen en de match gebeuren in je eigen browser. De getallen die je invult worden niet naar ons verstuurd. Ze komen wel in de adresbalk (URL) te staan, zodat je een berekening kunt bewaren of delen; die URL blijft bij jou.</p>
<h2>Offerte- en factuurtool</h2>
<p>De offerte- en factuurtool bewaart je bedrijfsgegevens en recente documenten in de lokale opslag (localStorage) van je eigen browser, alleen om je invoer te onthouden. Wij hebben daar geen toegang toe. Je kunt het wissen via de instellingen van je browser.</p>
<h2>Hosting en serverlogs</h2>
<p>De site wordt gehost via GitHub Pages (GitHub, Inc.). Zoals elke webserver verwerkt GitHub technische gegevens, zoals je IP-adres, om de site te kunnen tonen en te beveiligen; zie de <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">privacyverklaring van GitHub</a>. Wij ontvangen zelf geen bezoekersgegevens en gebruiken geen bezoekersstatistieken.</p>
<h2>Partnerlinks</h2>
<p>Klik je op een gemarkeerde partnerlink, dan ga je naar de website van die partij. Die kan cookies plaatsen volgens haar eigen privacybeleid. Op onze eigen site plaatsen wij geen cookies.</p>
<h2>Contact</h2>
<p>Vragen over privacy of deze site? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<p class="note">Laatst bijgewerkt: ${fmtDate(SITE.updated)}.</p>
</div>`,
};

export const disclaimer = {
  path: '/disclaimer/',
  title: 'Disclaimer | BoekhoudMatch',
  description: 'Uitkomsten van onze rekentools zijn indicaties, geen financieel, fiscaal of juridisch advies.',
  crumb: 'Disclaimer',
  body: `
<h1>Disclaimer</h1>
<div class="prose">
<p>De rekentools en de boekhoudmatch op deze site geven een <strong>indicatie</strong> op basis van de cijfers die jij invult en de officiële bedragen die op de bronnenpagina staan. Ze zijn geen financieel, fiscaal of juridisch advies.</p>
<ul>
<li>We doen ons best om alle bedragen actueel en juist te houden, maar kunnen fouten niet uitsluiten. Bedragen voor 2027 zijn deels voorstellen die nog kunnen veranderen.</li>
<li>Je persoonlijke situatie (partner, ander inkomen, toeslagen, eigen woning, contractvoorwaarden) kan tot een andere uitkomst leiden.</li>
<li>Prijzen en functies van boekhoudprogramma's komen van de websites van de aanbieders op de vermelde controledatum. Aanbieders kunnen hun prijzen en pakketten op elk moment wijzigen; de informatie bij de aanbieder zelf is leidend. De boekhoudmatch is een hulpmiddel en geen persoonlijk advies.</li>
<li>Neem belangrijke beslissingen, zoals de keuze voor een boekhoudprogramma, het vaststellen van je tarief of de aankoop van een thuisbatterij, niet alleen op basis van deze tools. Vraag bij twijfel een adviseur of de Belastingdienst.</li>
<li>Wij zijn niet aansprakelijk voor schade door het gebruik van deze site of de uitkomsten van de tools.</li>
<li>Zie je een fout? Mail naar <a href="mailto:${SITE.email}">${SITE.email}</a>.</li>
</ul>
</div>`,
};

export const notfound = {
  path: '/404.html', noindex: true,
  title: 'Pagina niet gevonden | BoekhoudMatch',
  description: 'Deze pagina bestaat niet.',
  crumb: 'Niet gevonden',
  body: `<h1>Pagina niet gevonden</h1><p>Deze pagina bestaat niet (meer). Ga naar de <a href="/">homepage</a> of doe de <a href="/boekhoudprogramma-kiezen/">boekhoudmatch</a>.</p>`,
};
