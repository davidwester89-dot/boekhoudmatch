import { SITE, more, field, check, slot, sourceList, webApp, faqSchema, faqHtml, fmtDate } from '../layout.mjs';
import { SOURCES } from '../lib/constants.js';

const path = '/thuisbatterij-terugverdientijd/';
const faq = [
  ['Is een thuisbatterij rendabel na 2027?', 'Dat hangt vooral af van het verschil tussen wat je betaalt voor stroom van het net en wat je krijgt voor teruglevering, en van de aanschafprijs. Hoe lager je netto terugleververgoeding, hoe meer een batterij per verschoven kWh oplevert. Deze tool rekent het uur voor uur door voor jouw invoer.'],
  ['Wat is een stekkerbatterij (thuisbatterij met stekker)?', 'Een kleine batterij (vaak 2 tot 3 kWh) die je in het stopcontact steekt en die met ongeveer 800 watt laadt en ontlaadt, gestuurd op je slimme meter. Kies de preset “Stekkerbatterij” om die te doorrekenen.'],
  ['Waarom rekenen jullie handelen op stroomprijzen niet mee?', 'Laden van het net bij lage prijzen en ontladen bij hoge prijzen kan bij een dynamisch contract extra opleveren, maar dat hangt af van de sturing van je leverancier of app en van toekomstige prijsverschillen. We rekenen bewust alleen met zelfverbruik, zodat de uitkomst niet te rooskleurig is.'],
  ['Waarom vragen jullie naar direct eigen verbruik?', 'Een standaard verbruiksprofiel is een gemiddelde van veel huishoudens en dus gladder dan jouw echte verbruik. Zonder correctie lijkt het alsof je meer zonnestroom direct gebruikt dan in werkelijkheid. Milieu Centraal noemt gemiddeld ongeveer 30%. Weet je jouw eigen percentage (opwek min teruglevering, gedeeld door opwek), vul dat dan in.'],
];

const body = `
<h1>Thuisbatterij terugverdientijd berekenen (2027)</h1>
<p class="lead">Wat bespaart een thuis- of stekkerbatterij als salderen stopt? We rekenen elk uur van het jaar door met echte zon- en verbruiksprofielen.</p>
<noscript><div class="alert">Deze rekentool heeft JavaScript nodig.</div></noscript>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
<fieldset><legend>1. Je huis</legend>
${field({ name: 'verbruik', label: 'Totaal stroomverbruik', value: '3500', unit: 'kWh/jaar', hint: 'Inclusief zelf gebruikte zonnestroom. Uit je jaarafrekening: afname + opwek − teruglevering.' })}
${field({ name: 'opwek', label: 'Opwek zonnepanelen', value: '3200', unit: 'kWh/jaar', hint: 'Uit de app van je omvormer. Vuistregel: aantal wattpiek × 0,85 à 0,9.' })}
${field({ name: 'zelfverbruik', label: 'Direct eigen verbruik zonder batterij', value: '30', unit: '%', hint: 'Gemiddeld ca. 30% (Milieu Centraal). Leeg laten = ongecorrigeerd standaardprofiel.' })}
</fieldset>
<fieldset><legend>2. De batterij</legend>
<div class="presets" role="group" aria-label="Batterij-voorbeelden">
<button type="button" data-preset="stekker">Stekkerbatterij 2,7 kWh</button>
<button type="button" data-preset="b5">Thuisbatterij 5 kWh</button>
<button type="button" data-preset="b10">Thuisbatterij 10 kWh</button>
</div>
${field({ name: 'capaciteit', label: 'Bruikbare capaciteit', value: '2,688', unit: 'kWh' })}
${field({ name: 'vermogen', label: 'Laad-/ontlaadvermogen', value: '0,8', unit: 'kW' })}
${field({ name: 'rendement', label: 'Rendement heen en terug', value: '88', unit: '%', hint: 'Verlies bij laden plus ontladen. Kijk in de specificaties; 85 tot 92% is gebruikelijk.' })}
${field({ name: 'investering', label: 'Aanschafprijs incl. installatie', value: '1195', unit: '€' })}
<p class="note" id="preset-note">Voorbeeld: HomeWizard Plug-In Battery, 2,7 kWh, 800 W, € 1.195 (webshopprijs oktober 2026).</p>
${field({ name: 'levensduur', label: 'Levensduur', value: '12', unit: 'jaar' })}
${field({ name: 'degradatie', label: 'Capaciteitsverlies per jaar', value: '2', unit: '%' })}
</fieldset>
<fieldset><legend>3. Je contract in 2027</legend>
<div class="field"><label for="f-type">Soort contract</label><select id="f-type" name="type"><option value="vast">Vast of variabel</option><option value="dynamisch">Dynamisch (uurprijzen)</option></select></div>
<div id="vast-velden">
${field({ name: 'allIn', label: 'Stroomprijs all-in', value: '0,2577', unit: '€/kWh incl. btw', hint: 'Standaard: CBS-gemiddelde augustus 2026.' })}
${field({ name: 'vergoeding', label: 'Terugleververgoeding', value: '0,084', unit: '€/kWh' })}
${field({ name: 'terugleverkosten', label: 'Terugleverkosten', value: '0,0489', unit: '€/kWh' })}
</div>
<div id="dyn-velden" hidden>
${field({ name: 'opslag', label: 'Inkoopvergoeding leverancier', value: '0,02', unit: '€/kWh excl. btw', hint: 'Opslag bovenop de beursprijs. Energiebelasting 2027 en btw rekenen we zelf.' })}
${field({ name: 'dynKosten', label: 'Inhouding op teruglevering', value: '0', unit: '€/kWh', hint: 'Sommige dynamische leveranciers houden iets in per teruggeleverde kWh, andere niets.' })}
${check({ name: 'terugBtw', label: 'Ik krijg de beursprijs inclusief btw voor teruglevering', checked: false })}
<p class="note">We gebruiken de echte uurprijzen van 2025 (EPEX day-ahead NL) als voorbeeldjaar.</p>
</div>
</fieldset>
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<h2>Uitkomst</h2>
<p>Besparing in het eerste jaar:</p>
<p class="big neg" id="out-besparing">–</p>
<p id="out-tvt" class="note"></p>
<div id="out-alert"></div>
<table class="kv"><tbody id="out-table"></tbody></table>
<svg id="chart" class="chart" viewBox="0 0 400 160" role="img" aria-label="Cumulatieve besparing tegenover aanschafprijs"></svg>
<p class="note">Groene lijn: opgetelde besparing per jaar. Stippellijn: aanschafprijs.</p>
${slot('batterij', 'thuisbatterijen of offertes.')}
</section>
</div>
<a class="mobilebar" href="#uitkomst"><span>Besparing jaar 1</span><strong data-mirror></strong></a>

<h2>Zo rekenen we</h2>
${more('Berekening en aannames', `
<ol>
<li><strong>Elk uur van het jaar.</strong> Je jaarverbruik verdelen we over 8.760 uur volgens het officiële standaardprofiel voor huishoudens (MFFBAS/NEDU E1A, 2025). Je opwek verdelen we volgens PVGIS-zonnegegevens voor De Bilt (gemiddelde 2018–2023, panelen op het zuiden).</li>
<li><strong>Correctie eigen verbruik.</strong> Omdat een standaardprofiel gladder is dan een echt huishouden, schuiven we per dag een deel van het verbruik in zonuren naar de avond en nacht, tot je direct eigen verbruik (zonder batterij) gelijk is aan het percentage dat je invult.</li>
<li><strong>Batterij.</strong> Zonne-overschot gaat eerst in de batterij (tot de capaciteit en het vermogen vol zijn), tekort haal je eerst uit de batterij. Laadverlies verdelen we gelijk over laden en ontladen.</li>
<li><strong>Kosten.</strong> Per uur: afname × stroomprijs − teruglevering × (vergoeding − terugleverkosten). Bij een dynamisch contract gebruiken we per uur de beursprijs plus opslag, energiebelasting 2027 (voorstel) en btw.</li>
<li><strong>Terugverdientijd.</strong> We tellen de besparing per jaar op, met jaarlijks capaciteitsverlies, tot de aanschafprijs bereikt is. Prijsstijgingen rekenen we niet mee.</li>
</ol>
<p><strong>Niet meegerekend:</strong> handelen op prijsverschillen, subsidies, onderhoud en vervanging van de omvormer, en extra opbrengst door slim sturen van grote apparaten. De uitkomst is een indicatie; je werkelijke besparing hangt af van je eigen verbruikspatroon.</p>`)}

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}

${more('Bronnen', sourceList(['nedu', 'pvgis', 'epex', 'eb_2027', 'saldering', 'cbs_tarieven', 'milieucentraal_zelfverbruik', 'homewizard_battery', 'tlk_overzicht'], SOURCES))}
`;

export default {
  path,
  title: 'Thuisbatterij terugverdientijd berekenen | BoekhoudMatch', og: 'batterij', ogTitle: 'Verdient een thuisbatterij zich terug?',
  description: 'Bereken uur voor uur wat een thuisbatterij of stekkerbatterij bespaart na het einde van salderen, inclusief terugverdientijd. Gratis, zonder account.',
  crumb: 'Thuisbatterij terugverdientijd',
  body,
  scripts: ['/js/thuisbatterij.js'],
  schema: [webApp({ name: 'Thuisbatterij terugverdientijd rekentool', url: SITE.domain + path, description: 'Uur-voor-uur simulatie van de besparing van een thuisbatterij na 2027.' }), faqSchema(faq)],
};
