import { SITE, field, check, slot, sourceList, webApp, faqSchema, faqHtml, fmtDate } from '../layout.mjs';
import { SOURCES } from '../lib/constants.js';

const path = '/zzp-netto-inkomen/';
const faq = [
  ['Hoeveel moet ik als zzp\'er reserveren voor belasting?', 'Dat hangt af van je winst. De tool toont het percentage van je winst dat naar inkomstenbelasting en de Zvw-bijdrage gaat. Reserveer dat deel van elke betaalde factuur (exclusief btw; de btw draag je apart af).'],
  ['Telt de arbeidskorting over mijn winst vóór of na aftrekposten?', 'Vóór. Voor ondernemers is het arbeidsinkomen de winst vóór ondernemersaftrek en mkb-winstvrijstelling (Belastingdienst). Sommige rekentools nemen de winst ná aftrek; dat geeft bij gemiddelde winsten een paar honderd euro te veel netto.'],
  ['Wat is de zelfstandigenaftrek in 2026?', '€ 1.200, als je aan het urencriterium van 1.225 uur per jaar voldoet en aan het begin van het jaar de AOW-leeftijd nog niet hebt bereikt. Starters krijgen daarbovenop € 2.123 startersaftrek.'],
  ['Wat is de mkb-winstvrijstelling in 2026?', '12,7% van je winst na ondernemersaftrek. Je krijgt hem automatisch, ook zonder urencriterium.'],
  ['Waarom is mijn voordeel van aftrekposten beperkt bij een hoge winst?', 'Boven € 78.426 inkomen (vóór aftrekposten) krijg je over ondernemersaftrek en mkb-winstvrijstelling maximaal 37,56% voordeel. Het verschil met het toptarief (11,94%) wordt als tariefaanpassing bijgeteld.'],
];

const body = `
<span class="tag">Zzp · belastingjaar 2026 · bijgewerkt ${fmtDate(SITE.updated)}</span>
<h1>Netto inkomen zzp berekenen (2026)</h1>
<p class="lead">Van winst naar netto: met zelfstandigenaftrek, mkb-winstvrijstelling, heffingskortingen, tariefaanpassing en Zvw-bijdrage volgens de officiële bedragen van 2026. Je ziet ook hoeveel je moet reserveren.</p>
<noscript><div class="alert">Deze rekentool heeft JavaScript nodig. Er worden geen cookies of trackers geladen.</div></noscript>
<div class="grid calc">
<form class="calc-form card" id="form" novalidate>
<fieldset><legend>Je onderneming in 2026</legend>
${field({ name: 'omzet', label: 'Omzet (exclusief btw)', value: '72000', unit: '€/jaar' })}
${field({ name: 'kosten', label: 'Zakelijke kosten en afschrijvingen', value: '7000', unit: '€/jaar', hint: 'Exclusief btw die je terugvraagt.' })}
${check({ name: 'uren', label: 'Ik werk minstens 1.225 uur per jaar aan mijn onderneming (urencriterium)', checked: true })}
${check({ name: 'starter', label: 'Ik heb recht op startersaftrek (in een van de vorige 5 jaar geen ondernemer, max. 2× zelfstandigenaftrek gehad)', checked: false })}
${field({ name: 'voorz', label: 'AOV-premie en lijfrente-inleg', value: '0', unit: '€/jaar', hint: 'Aftrekbaar als inkomensvoorziening (lijfrente binnen je jaarruimte).' })}
</fieldset>
<p class="note">Uitgangspunten: jonger dan de AOW-leeftijd, geen fiscale partner, geen ander inkomen, geen eigen woning of box 3. Heb je die wel, dan wijkt je uitkomst af.</p>
</form>
<section class="card result" id="uitkomst" aria-live="polite">
<h2 style="margin-top:0">Uitkomst</h2>
<p>Netto per maand:</p>
<p class="big neg" id="out-netto">–</p>
<p id="out-reserve" class="note"></p>
<table class="kv"><tbody id="out-table"></tbody></table>
<p class="note">Welk boekhoudprogramma past bij jou? <a href="/boekhoudprogramma-kiezen/">Doe de boekhoudmatch</a> (8 vragen, onafhankelijke rangorde).</p>
${slot('boekhoudsoftware', 'Hier komt straks mogelijk een partnerlink naar een boekhoudprogramma met gratis proefperiode. De rangorde in onze boekhoudmatch verandert daar niet door.')}
<p class="note">Wil je weten welk uurtarief je nodig hebt? <a href="/zzp-uurtarief/">Uurtarief berekenen</a>.</p>
</section>
</div>
<a class="mobilebar" href="#uitkomst">Uitkomst: <strong data-mirror></strong> ↓</a>

<h2>Zo rekenen we (2026)</h2>
<div class="prose">
<ol>
<li><strong>Winst</strong> = omzet − kosten.</li>
<li><strong>Ondernemersaftrek</strong>: zelfstandigenaftrek € 1.200 (alleen met urencriterium, niet hoger dan je winst tenzij je starter bent) plus eventueel startersaftrek € 2.123.</li>
<li><strong>Mkb-winstvrijstelling</strong>: 12,7% van de winst na ondernemersaftrek. Wat overblijft is je <em>belastbare winst</em>.</li>
<li><strong>Inkomstenbelasting box 1</strong>: 35,75% tot € 38.883, 37,56% tot € 78.426, daarboven 49,50%. AOV en lijfrente gaan eerst van je inkomen af.</li>
<li><strong>Tariefaanpassing</strong>: ligt je inkomen vóór aftrekposten boven € 78.426, dan tellen we 11,94% bij over het deel van ondernemersaftrek en mkb-vrijstelling dat in die schijf valt.</li>
<li><strong>Heffingskortingen</strong>: algemene heffingskorting (max. € 3.115, afbouw 6,398% boven € 29.736) en arbeidskorting (max. € 5.685) over je winst vóór aftrekposten. Samen nooit meer dan de belasting.</li>
<li><strong>Zvw-bijdrage</strong>: 4,85% over je belastbare winst, tot maximaal € 79.409.</li>
</ol>
<p>Alle bedragen staan met bron op <a href="/bronnen/">bronnen &amp; cijfers</a>. De tool is getest met handberekeningen (zie broncode).</p>
</div>

<h2>Veelgestelde vragen</h2>
${faqHtml(faq)}

<h2>Bronnen</h2>
${sourceList(['box1_2026', 'kortingen_2026', 'arbeidsinkomen', 'zelfstandigenaftrek_2026', 'mkb_2026', 'tariefaanpassing_2026', 'zvw_2026', 'urencriterium'], SOURCES)}
`;

export default {
  path,
  title: 'Netto inkomen zzp berekenen 2026 (met reserveren) | BoekhoudMatch',
  description: 'Bereken je netto inkomen als zzp\'er in 2026: zelfstandigenaftrek € 1.200, mkb-winstvrijstelling 12,7%, heffingskortingen en Zvw 4,85%. Met bronnen, zonder cookies.',
  crumb: 'Zzp netto inkomen',
  body,
  scripts: ['/js/zzpnetto.js'],
  schema: [webApp({ name: 'Netto inkomen zzp 2026 rekentool', url: SITE.domain + path, description: 'Bereken netto inkomen en belastingreservering voor zzp\'ers in 2026.' }), faqSchema(faq)],
};
