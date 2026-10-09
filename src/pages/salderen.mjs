import { SITE, more, field, slot, sourceList, webApp, faqSchema, faqHtml, fmtDate } from '../layout.mjs';
import { SOURCES, ENERGY } from '../lib/constants.js';

const path = '/salderen-2027/';
const faq = [
  ['Wanneer stopt de salderingsregeling?', 'Op 1 januari 2027, in één keer. Er is geen geleidelijke afbouw meer: het kabinet heeft besloten de regeling in 2027 helemaal te stoppen (bron: Rijksoverheid).'],
  ['Hoeveel moet mijn energieleverancier vanaf 2027 betalen voor teruggeleverde stroom?', 'Een redelijke vergoeding. Tot 1 januari 2030 moet die minimaal 50% zijn van de kale leveringsprijs van je contract, dus de stroomprijs zonder energiebelasting en btw. Deze rekentool waarschuwt als jouw ingevulde vergoeding daaronder ligt.'],
  ['Wat zijn terugleverkosten en hoe worden ze vanaf 2027 berekend?', 'Kosten die leveranciers rekenen voor het verwerken van je teruggeleverde stroom. Vanaf 1 januari 2027 moeten leveranciers die kosten uitdrukken in euro per teruggeleverde kWh (Staatscourant 2026, 28208), zodat je ze kunt vergelijken. In deze tool vul je ze daarom per kWh in.'],
  ['Waarom tellen vaste kosten niet mee?', 'Netbeheerkosten, vastrecht en de vermindering energiebelasting veranderen niet door het einde van salderen. Ze vallen tegen elkaar weg in het verschil 2026 → 2027, dus we laten ze weg om de som overzichtelijk te houden.'],
  ['Moet ik mijn zonnepanelen uitzetten in 2027?', 'Meestal niet. Zonder saldering is elke kWh die je zelf gebruikt het meest waard (je bespaart de volle kWh-prijs). Alleen bij een dynamisch contract met negatieve stroomprijzen kan terugleveren op dat moment geld kosten; dan helpt het om teruglevering te begrenzen, niet om alles uit te zetten.'],
];

const body = `
<h1>Einde salderen 2027: wat kost het jou?</h1>
<p class="lead">Vul de cijfers van je jaarafrekening in en zie wat je in 2027 meer betaalt nu salderen stopt.</p>
<noscript><div class="alert">Deze rekentool heeft JavaScript nodig.</div></noscript>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
<fieldset><legend>1. Je jaarafrekening</legend>
${field({ name: 'afname', label: 'Stroom van het net (afname)', value: '3000', unit: 'kWh/jaar', hint: 'Normaal + dal opgeteld, vóór saldering.' })}
${field({ name: 'teruglevering', label: 'Teruggeleverd aan het net', value: '2500', unit: 'kWh/jaar', hint: 'Staat op je jaarafrekening of in de app van je leverancier.' })}
</fieldset>
<fieldset><legend>2. Je stroomprijs</legend>
${field({ name: 'allIn', label: 'Stroomprijs per kWh, alles inbegrepen', value: '0,2577', unit: '€/kWh incl. btw', hint: `Leveringstarief + energiebelasting, incl. btw. Standaard: CBS-gemiddelde augustus 2026 (€ 0,1469 + € 0,11085). We rekenen hieruit je kale prijs.` })}
</fieldset>
<fieldset><legend>3. Terugleveren in 2026 (nu)</legend>
${field({ name: 'vergoeding2026', label: 'Vergoeding voor overschot', value: '0,07', unit: '€/kWh', hint: 'Alleen wat je méér teruglevert dan je afneemt krijgt deze vergoeding.' })}
${field({ name: 'tlk2026', label: 'Terugleverkosten 2026 per kWh', value: '0', unit: '€/kWh' })}
${field({ name: 'tlk2026vast', label: 'Terugleverkosten 2026 vast', value: '0', unit: '€/jaar', hint: 'Sommige leveranciers rekenen een vast bedrag per maand of per staffel. Vul het jaarbedrag in.' })}
</fieldset>
<fieldset><legend>4. Terugleveren in 2027 (na salderen)</legend>
<div class="presets" role="group" aria-label="Voorbeeldtarieven 2027">
<button type="button" data-preset="minimum">Wettelijk minimum, geen kosten</button>
<button type="button" data-preset="vast">Voorbeeld vast contract</button>
<button type="button" data-preset="slecht">Voorbeeld lage netto vergoeding</button>
</div>
${field({ name: 'vergoeding2027', label: 'Bruto terugleververgoeding 2027', value: '0,084', unit: '€/kWh', hint: 'Zonder btw. Staat in je contract of aanbod voor 2027.' })}
${field({ name: 'tlk2027', label: 'Terugleverkosten 2027', value: '0,0489', unit: '€/kWh', hint: 'Vanaf 2027 verplicht per teruggeleverde kWh vermeld.' })}
<p class="note" id="preset-note">Voorbeeld: aangekondigd tarief voor een nieuw 1-jarig vast contract (bruto 8,40 ct, kosten 4,89 ct), op basis van het aangekondigde Vattenfall-tarief voor een nieuw 1-jarig vast contract (overzicht zonnesaldo.nl, geraadpleegd 8 oktober 2026). Controleer altijd je eigen aanbod.</p>
</fieldset>
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<h2>Uitkomst</h2>
<p>Verschil 2027 t.o.v. 2026 (kWh-kosten):</p>
<p class="big" id="out-verschil">–</p>
<p class="note" id="out-permaand"></p>
<div id="out-alert"></div>
<table class="kv"><tbody id="out-table"></tbody></table>
<h3>Wat levert zelf verbruiken op?</h3>
<p id="out-eigen" class="note"></p>
${slot('energievergelijker', 'energievergelijker.')}
</section>
</div>
<a class="mobilebar" href="#uitkomst"><span>Verschil 2027</span><strong data-mirror></strong></a>

<h2>Zo rekenen we</h2>
${more('Berekening en aannames', `
<p><strong>2026, met saldering.</strong> De kWh die je teruglevert worden weggestreept tegen je afname, tegen de volle prijs inclusief energiebelasting en btw. Lever je meer terug dan je afneemt, dan krijg je voor dat overschot alleen de terugleververgoeding. Daarbovenop komen eventuele terugleverkosten.</p>
<p><strong>2027, zonder saldering.</strong> Je betaalt voor álle afgenomen kWh de volle prijs. Voor álle teruggeleverde kWh krijg je de terugleververgoeding, min de terugleverkosten per kWh.</p>
<p><strong>Prijsopbouw.</strong> Uit je all-in prijs halen we de kale leveringsprijs: all-in ÷ 1,21 − energiebelasting 2026 (€ ${String(ENERGY.eb[2026].perKwh).replace('.', ',')} per kWh excl. btw). Die kale prijs houden we in 2027 gelijk. In 2027 rekenen we met de voorgestelde energiebelasting van € ${String(ENERGY.eb[2027].perKwh).replace('.', ',')} per kWh excl. btw (Belastingplan 2027, nog niet definitief).</p>
<p><strong>Wettelijk minimum.</strong> Tot 2030 moet de vergoeding minimaal 50% van de kale leveringsprijs zijn. Ligt jouw ingevulde vergoeding lager, dan zie je een waarschuwing.</p>
<p><strong>Niet meegerekend:</strong> vaste kosten (die blijven gelijk), prijsveranderingen van je leverancier na 2026, en het verschil tussen normaal- en daltarief. Wil je weten wat een thuisbatterij doet? Gebruik de <a href="/thuisbatterij-terugverdientijd/">thuisbatterij-rekentool</a>, die rekent per uur.</p>`)}

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}

${more('Bronnen', sourceList(['saldering', 'terugleverkosten_per_kwh', 'eb_2026', 'eb_2027', 'cbs_tarieven', 'tlk_overzicht'], SOURCES))}
<p class="note">Alle cijfers staan op <a href="/bronnen/">bronnen en cijfers</a>.</p>
`;

export default {
  path,
  title: 'Einde salderen 2027: wat kost het jou? | BoekhoudMatch', og: 'salderen', ogTitle: 'Einde salderen 2027: wat kost het jou?',
  description: 'Bereken wat het einde van salderen op 1 januari 2027 jou kost, met energiebelasting 2027, minimumvergoeding en terugleverkosten. Gratis, zonder account.',
  h1: 'Einde salderen 2027', crumb: 'Salderen 2027',
  body,
  scripts: ['/js/salderen.js'],
  schema: [webApp({ name: 'Einde salderen 2027 rekentool', url: SITE.domain + path, description: 'Bereken het verschil in stroomkosten tussen 2026 (met saldering) en 2027 (zonder).' }), faqSchema(faq)],
};
