import { SITE, field, check, slot, sourceList, webApp, faqSchema, faqHtml, fmtDate, more, volgendeStap } from '../layout.mjs';
import { SOURCES } from '../lib/constants.js';

const path = '/zzp-uurtarief/';
const faq = [
  ['Hoe bereken ik mijn uurtarief als zzp\'er?', 'Begin bij wat je netto per maand wilt overhouden. Tel daar belasting, Zvw-bijdrage, AOV, pensioen en zakelijke kosten bij, en deel door de uren die je echt kunt factureren. Deze tool rekent dat voor je uit.'],
  ['Hoeveel uur per jaar kan ik factureren?', 'Minder dan je denkt: vakantie, feestdagen, ziekte, acquisitie en administratie gaan eraf. Veel zzp\'ers factureren 60 tot 75% van hun gewerkte uren. Vul je eigen inschatting in.'],
  ['Welk uurtarief hoort bij mijn salaris in loondienst?', 'Kies “Vanuit mijn salaris”. We berekenen je netto loon in 2026 (vereenvoudigd) en zoeken het zzp-tarief dat na belasting, AOV, pensioen en kosten hetzelfde netto oplevert.'],
  ['Is het uurtarief inclusief of exclusief btw?', 'We tonen beide. Je offerte noemt meestal het tarief exclusief 21% btw; de btw draag je af aan de Belastingdienst (tenzij je de KOR gebruikt).'],
];

const body = `
<h1>Uurtarief zzp berekenen (2026)</h1>
<p class="lead">Welk uurtarief heb je nodig voor het inkomen dat je wilt? Of: welk tarief past bij je huidige salaris?</p>
<noscript><div class="alert">Deze rekentool heeft JavaScript nodig.</div></noscript>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
<fieldset><legend>1. Wat wil je verdienen?</legend>
<div class="field"><label for="f-modus">Uitgangspunt</label><select id="f-modus" name="modus"><option value="netto">Gewenst netto per maand</option><option value="salaris">Vanuit mijn salaris in loondienst</option></select></div>
<div id="m-netto">${field({ name: 'doelNetto', label: 'Netto per maand', value: '3200', unit: '€', hint: 'Wat je wilt overhouden na belasting, AOV en pensioen.' })}</div>
<div id="m-salaris" hidden>
${field({ name: 'brutoMaand', label: 'Bruto maandsalaris', value: '4000', unit: '€' })}
${field({ name: 'vakantiegeld', label: 'Vakantiegeld', value: '8', unit: '%' })}
${check({ name: 'dertiende', label: 'Ik krijg een 13e maand', checked: false })}
${field({ name: 'pensioenWn', label: 'Mijn pensioenpremie (werknemersdeel)', value: '5', unit: '% van bruto' })}
</div>
</fieldset>
<fieldset><legend>2. Je kosten en voorzieningen</legend>
${field({ name: 'kosten', label: 'Zakelijke kosten', value: '6000', unit: '€/jaar', hint: 'Laptop, software, verzekeringen, auto, opleiding, boekhouder.' })}
${field({ name: 'aov', label: 'AOV-premie', value: '250', unit: '€/maand', hint: 'Arbeidsongeschiktheidsverzekering. Vul 0 in als je die niet hebt.' })}
${field({ name: 'pensioen', label: 'Pensioen (lijfrente) inleg', value: '300', unit: '€/maand' })}
</fieldset>
<fieldset><legend>3. Je uren</legend>
${field({ name: 'weken', label: 'Werkweken per jaar', value: '44', unit: 'weken', hint: '52 min vakantie, feestdagen en ziekte.' })}
${field({ name: 'uren', label: 'Gewerkte uren per week', value: '36', unit: 'uur' })}
${field({ name: 'declarabel', label: 'Deel dat je kunt factureren', value: '70', unit: '%' })}
${check({ name: 'starter', label: 'Ik heb recht op startersaftrek', checked: false })}
</fieldset>
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<h2>Minimaal uurtarief (excl. btw)</h2>
<p class="big neg" id="out-tarief">–</p>
<p id="out-sub" class="note"></p>
<div id="out-alert"></div>
<table class="kv"><tbody id="out-table"></tbody></table>
${slot('boekhoudsoftware', 'partnerlink boekhoudprogramma.')}
<p class="note">Offerte of factuur maken met dit tarief? Gebruik de gratis <a href="/offerte-factuur-maken/">offerte- en factuurtool</a>. Tarief inclusief btw nodig? <a href="/btw-berekenen/">Btw berekenen</a>.</p>
</section>
</div>
<a class="mobilebar" href="#uitkomst"><span>Uurtarief</span><strong data-mirror></strong></a>

<h2>Zo rekenen we</h2>
${more('Berekening stap voor stap', `
<p>We zoeken de winst waarbij je, na inkomstenbelasting 2026, heffingskortingen, tariefaanpassing en Zvw-bijdrage, en na betaling van je AOV en pensioeninleg, precies je gewenste netto overhoudt. Daar tellen we je kosten bij (= benodigde omzet) en delen we door je declarabele uren.</p>
<p>Het urencriterium (1.225 uur) bepalen we uit je gewerkte uren: werkweken × uren per week. In de stand “Vanuit mijn salaris” berekenen we eerst je netto jaarloon: bruto incl. vakantiegeld, min je pensioenpremie en loonheffing met algemene heffingskorting en arbeidskorting (zonder bijtelling, reiskosten of andere vergoedingen). De WW, WIA en het werkgeversdeel van je pensioen krijg je als zzp'er niet; daarom vragen we naar AOV en pensioen.</p>
`)}

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}

${more('Bronnen', sourceList(['box1_2026', 'kortingen_2026', 'arbeidsinkomen', 'zelfstandigenaftrek_2026', 'mkb_2026', 'tariefaanpassing_2026', 'zvw_2026', 'urencriterium'], SOURCES))}
${volgendeStap([['Urenregistratie voor zzp\'ers', '/urenregistratie-zzp/'], ['Beste boekhoudprogramma voor zzp\'ers', '/beste-boekhoudprogramma-zzp/']])}
{{related}}
`;

export default {
  path,
  title: 'Uurtarief zzp berekenen 2026 | BoekhoudMatch', og: 'uurtarief', ogTitle: 'Uurtarief zzp berekenen (2026)',
  description: 'Bereken welk uurtarief je als zzp\'er nodig hebt voor je gewenste netto inkomen, of welk tarief past bij je salaris. Met de belastingregels van 2026.',
  crumb: 'Uurtarief zzp',
  body,
  scripts: ['/js/uurtarief.js'],
  schema: [webApp({ name: 'Uurtarief zzp 2026 rekentool', url: SITE.domain + path, description: 'Bereken het benodigde uurtarief voor zzp\'ers op basis van netto inkomen of salaris.' }), faqSchema(faq)],
};
