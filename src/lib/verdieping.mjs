// Verdieping per aanbieder (deep-dives op /<slug>/): extra H2-secties, FAQ, bijwerkdatum en extra bronnen.
// Apart van aanbieders.js, want dat bestand gaat ook mee naar de browser (js/lib, voor de match); .mjs blijft server-side.
// Alleen feiten die letterlijk op de gelinkte bronpagina's van de aanbieder staan. Prijzen via placeholders uit pakketten.js (zie aanbieder.mjs).
export const VERDIEPING = {
  moneybird: {
    // Interne link naar de bankkoppelingsgids in 'Goed om te weten' (alinea over bank koppelen). Bodywijziging, L7-datum = pushdatum 2026-11-13.
    bijgewerkt: '2026-11-13',
    nootLink: 'Hoe je de automatische bankkoppeling in Moneybird instelt en wat die per pakket kost, lees je in <a href="/bankkoppeling-boekhoudprogramma/">bankkoppeling in je boekhoudprogramma</a>.',
  },
  jortt: {
    // Deep-dive /jortt/ (zoekvraag 'jortt kosten'). Alles uit jortt.nl/prijs/, de abonnementen-FAQ, de prijswijziging-FAQ en jortt.nl/boekhouder/, gecontroleerd 29-10-2026, prijzen herberekend 10-11-2026. Welkomstactie/loonstroken-gratis/HR-bèta weggelaten: geen kalender-einddatum op de bron (L4, SC B3).
    // {{p:pakket}} = maandprijs, {{pj:pakket}} = prijs p/m bij jaarbetaling, {{pjj:pakket}} = 12 × prijs bij jaarbetaling, {{pmj:pakket}} = 12 × maandprijs (onze rekensom). Alles uit pakketten.js.
    bijgewerkt: '2026-11-12',
    // Title ongewijzigd (SEO 29-10). Meta: exacte L4-vervangtekst SC B3 punt 5 (geen 30-dagen-actie). Bedragen via placeholders uit pakketten.js.
    title: 'Jortt kosten 2026: prijs per maand en jaar | BoekhoudMatch',
    description: 'Jortt ZZP kost {{p:zzp}} per maand of {{pj:zzp}} bij jaarbetaling (excl. btw). Bekijk pakketten, limieten, extra kosten en voorwaarden.',
    bronnen: [
      { url: 'https://www.jortt.nl/uitleg/faq/prijswijziging-jortt/', titel: 'Jortt – Prijswijziging jortt' },
      { url: 'https://www.jortt.nl/boekhouder/', titel: 'Jortt – Boekhoudcoach zoeken' },
      { url: 'https://www.jortt.nl/webshop/', titel: 'Jortt – jortt.shop' },
    ],
    verdieping: [
      ['Wat kost Jortt per maand en per jaar?', `<p>Jortt toont alle prijzen per maand en exclusief btw, per bedrijf (KvK-nummer). Starter is gratis; de boekhouding begint bij ZZP.</p>
<div class="table-wrap" tabindex="0" role="region" aria-label="Jortt-prijzen per maand en per jaar"><table class="data"><thead><tr><th>Pakket</th><th>Per maand</th><th>Bij jaarbetaling (regulier tarief)</th></tr></thead><tbody>
<tr><th scope="row">Starter</th><td class="n">{{p:starter}}</td><td>{{p:starter}}</td></tr>
<tr><th scope="row">ZZP</th><td class="n">{{p:zzp}}</td><td>{{pj:zzp}} p/m<br>{{pjj:zzp}} per jaar</td></tr>
<tr><th scope="row">MKB</th><td class="n">{{p:mkb}}</td><td>{{pj:mkb}} p/m<br>{{pjj:mkb}} per jaar</td></tr>
<tr><th scope="row">Plus</th><td class="n">{{p:plus}}</td><td>{{pj:plus}} p/m<br>{{pjj:plus}} per jaar</td></tr>
</tbody></table></div>
<p>Bij een jaarabonnement betaal je twaalf keer het bedrag per maand in één keer. Betaal je per maand, dan is het voor ZZP over een jaar 12 × {{p:zzp}} = {{pmj:zzp}} (onze rekensom): {{verschil:zzp}} meer dan bij jaarbetaling.</p>
<p>De betaalde abonnementen hebben geen opstartkosten. Een maandabonnement zeg je per maand op; een jaarabonnement loopt twaalf maanden.</p>
<p><strong>Prijswijziging:</strong> sinds 9 september 2026 gelden deze prijzen voor nieuwe klanten; voor bestaande klanten zie de vragen hieronder. Een jaarabonnement staat twaalf maanden vast; een prijswijziging geldt pas bij de volgende verlenging.</p>
<p>Wat Jortt kost naast andere pakketten, zie je in de <a href="/boekhoudprogramma-vergelijken/">vergelijking van alle boekhoudprogramma's</a> en bij <a href="/goedkoopste-boekhoudprogramma/">het goedkoopste boekhoudprogramma</a>. Meer over prijzen van boekhoudprogramma's lees je in <a href="/blog/wat-kost-een-boekhoudprogramma/">wat kost een boekhoudprogramma?</a></p>`],
      ['Wat zit er in elk Jortt-pakket?', `<div class="table-wrap" tabindex="0" role="region" aria-label="Functies per Jortt-pakket"><table class="data"><thead><tr><th></th><th>Starter</th><th>ZZP</th><th>MKB</th><th>Plus</th></tr></thead><tbody>
<tr><th scope="row">Facturen, offertes en uren</th><td>Ja</td><td>Ja</td><td>Ja</td><td>Ja</td></tr>
<tr><th scope="row">E-facturen via Peppol versturen en ontvangen</th><td>Ja</td><td>Ja</td><td>Ja</td><td>Ja</td></tr>
<tr><th scope="row">Boekhouding</th><td>Nee</td><td>Ja, bedoeld voor tot 250 boekingen per maand</td><td>Ja, onbeperkt boekingen</td><td>Ja, onbeperkt boekingen</td></tr>
<tr><th scope="row">Rechtsvorm</th><td>Niet vermeld</td><td>Alleen eenmanszaak</td><td>Alle</td><td>Alle</td></tr>
<tr><th scope="row">Bankkoppeling</th><td>Nee</td><td>1 bank (meerdere rekeningen van die bank)</td><td>Onbeperkt banken en rekeningen</td><td>Onbeperkt banken en rekeningen</td></tr>
<tr><th scope="row">Btw-aangifte</th><td>Nee</td><td colspan="3">Nagelopen op 21 punten en elektronisch ingediend bij de Belastingdienst</td></tr>
<tr><th scope="row">Aangifte inkomstenbelasting</th><td>Nee</td><td>Nagelopen op 32 punten</td><td colspan="2">IB of VPB, nagelopen op 32 punten</td></tr>
<tr><th scope="row">Jaarrekening</th><td>Nee</td><td>Norm 4410</td><td colspan="2">Norm 4410 en KvK-jaarrekening</td></tr>
<tr><th scope="row">Automatisch geboekt door de Boekhoudbot</th><td>Nee</td><td>Tot 90% (10 eigen regels)</td><td>Tot 95% (25 eigen regels)</td><td>Tot 99% (250 eigen regels)</td></tr>
</tbody></table></div>
<p>Jortt maakt in de betaalde pakketten het rapport waarmee je zelf je aangifte inkomstenbelasting (of bij MKB en Plus vennootschapsbelasting) doet. Jortt hanteert de 250 boekingen bij ZZP als richtlijn en niet als harde grens; heb je er structureel meer, dan past MKB beter.</p>
<p>Meer over de bankkoppeling per pakket lees je in <a href="/bankkoppeling-boekhoudprogramma/">bankkoppeling in je boekhoudprogramma</a>. Twijfel je welk pakket past? <a href="/boekhoudprogramma-kiezen/">Doe de match</a>.</p>`],
      ['Extra kosten naast je abonnement', `<ul>
<li><strong>Loonstroken:</strong> € 9,50 per loonstrook per werknemer per maand, in Starter, MKB en Plus (niet in ZZP).</li>
<li><strong>jortt.shop:</strong> geen vaste kosten, wel 4,5% van je omzet plus portokosten. Bron: <a href="https://www.jortt.nl/webshop/">jortt.nl/webshop</a>.</li>
<li><strong>Oude maanden invoeren:</strong> tot 18 maanden terug, zonder extra kosten.</li>
</ul>
<p>Past Jortt toch niet, dan heb je bij de betaalde pakketten 90 dagen: Jortt crediteert dan de facturen, ook bij een jaarabonnement.</p>`],
      ['Jortt met een boekhouder', `<p>Volgens Jortt doet ongeveer 80% van de gebruikers de boekhouding zelf, van de eerste factuur tot de btw-aangifte en de aangifte inkomstenbelasting. Eén op de vijf werkt samen met een jortt-boekhoudcoach. Zo'n coach kan meekijken, je boekhouding en aangifte controleren of de boekhouding helemaal voor je doen.</p>
<p>Je boekhouder werkt mee als gebruiker van je administratie, met een eigen wachtwoord; jij bepaalt wie wat mag doen. Voor je accountant of de Belastingdienst maak je met één klik een auditfile (XAF). Wat een coach kost, verschilt per kantoor; op de <a href="https://www.jortt.nl/boekhouder/" rel="noopener" data-vendor="Jortt">coachpagina van Jortt</a> staan de kantoren met hun eigen gegevens.</p>`],
    ],
    faq: [
      ['Is Jortt gratis?', 'Deels. Jortt Starter is gratis, zonder tijdslimiet en zonder creditcard: je maakt er facturen en offertes mee, houdt uren en projecten bij en verstuurt en ontvangt e-facturen via Peppol. Boekhouden, een bankkoppeling en de btw-aangifte zitten niet in Starter. Daarvoor heb je ZZP (€ 21,95 per maand, exclusief btw), MKB of Plus nodig. Andere gratis opties staan bij <a href="/gratis-boekhoudprogramma/">gratis boekhoudprogramma</a>.'],
      ['Kan ik Jortt per maand opzeggen?', 'Ja, een maandabonnement zeg je per maand op. Een jaarabonnement verlengt automatisch met twaalf maanden; wil je dat niet, geef het dan vóór de verlengdatum door.'],
      ['Wat kost Jortt voor bestaande klanten in 2027?', 'Vanaf 1 januari 2027 betaal je de gewone prijs: ZZP {{p:zzp}}, MKB {{p:mkb}} of Plus {{p:plus}} per maand (of {{pj:zzp}}, {{pj:mkb}} en {{pj:plus}} per maand bij jaarbetaling). Had je vóór 9 september 2026 al een betaald abonnement, dan betaal je tot en met 31 december 2026 nog je oude prijs (ZZP € 19,95, MKB € 24,95, Plus € 34,95 per maand); het verschil staat als korting op je factuur. Je hoeft daar niets voor te doen.'],
    ],
  },
  snelstart: {
    // Deep-dive /snelstart/ (groeiexperiment E6, MM-OK 30-10; zoekvraag 'wat kost snelstart per maand'). Alles van https://www.snelstart.nl/pakketten (incl. de vergelijkingstabel op die pagina), nagelezen 30-10-2026.
    // Abonnementsbedragen via placeholders uit pakketten.js. Extra kosten staan letterlijk op dezelfde pagina (niet in pakketten.js).
    bijgewerkt: '2026-11-12',
    // Title en meta van de SEO-specialist (30-10). og:title = title.
    title: 'SnelStart kosten 2026: prijs per maand | BoekhoudMatch',
    description: 'Wat kost SnelStart per maand? Van {{p:inorde}} (inOrde, via een boekhouder) tot {{p:inzicht}} (inZicht). Prijs per pakket, btw-aangifte en extra kosten op een rij.',
    verdieping: [
      ['Wat kost SnelStart per maand?', `<p>SnelStart toont een prijs per maand per pakket. "Alle prijzen zijn exclusief btw."</p>
<div class="table-wrap" tabindex="0" role="region" aria-label="SnelStart-prijzen per maand"><table class="data"><thead><tr><th>Pakket</th><th>Per maand</th><th>Voor wie</th></tr></thead><tbody>
<tr><th scope="row">inOrde</th><td class="n">{{p:inorde}}</td><td>Jij stuurt je bonnen door, je boekhouder doet de rest. Alleen via een boekhouder of accountant die met SnelStart werkt.</td></tr>
<tr><th scope="row">inStap</th><td class="n">{{p:instap}}</td><td>Ook bonnen doorsturen naar je boekhouder, plus onbeperkt facturen maken en versturen.</td></tr>
<tr><th scope="row">inKaart</th><td class="n">{{p:inkaart}}</td><td>Zelf boekhouden: onbeperkt facturen en offertes, btw- en ICP-aangifte in een paar klikken.</td></tr>
<tr><th scope="row">inBalans</th><td class="n">{{p:inbalans}}</td><td>Alles van inKaart, plus abonnements&shy;facturen en uitgebreid debiteurenbeheer.</td></tr>
<tr><th scope="row">inZicht</th><td class="n">{{p:inzicht}}</td><td>Alles van inBalans, plus orderbeheer en kosten verdelen per project of afdeling.</td></tr>
</tbody></table></div>
<p>Je betaalt per maand of per jaar; de abonnementskosten worden vooraf in rekening gebracht. Een aparte jaarprijs staat niet op de pakkettenpagina. Een jaar inKaart kost dus 12 × {{p:inkaart}} = {{pmj:inkaart}} excl. btw (onze rekensom). Voor handel en voorraad heeft SnelStart ook inControle en inHandel, met "Prijs op aanvraag"; die staan niet in onze vergelijking.</p>
<p>Hoe SnelStart zich verhoudt tot andere pakketten, zie je in de <a href="/boekhoudprogramma-vergelijken/">vergelijking van alle boekhoudprogramma's</a> en bij <a href="/goedkoopste-boekhoudprogramma/">het goedkoopste boekhoudprogramma</a>.</p>`],
      ['Wat zit er in elk SnelStart-pakket?', `<div class="table-wrap" tabindex="0" role="region" aria-label="Functies per SnelStart-pakket"><table class="data"><thead><tr><th></th><th>inOrde</th><th>inStap</th><th>inKaart</th><th>inBalans</th><th>inZicht</th></tr></thead><tbody>
<tr><th scope="row">Samenwerken met je boekhouder (met mailbox)</th><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Onbeperkt bonnen scannen via de app</th><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Bankafschriften automatisch inlezen (bankkoppeling)</th><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Onbeperkt factureren</th><td>–</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Eenvoudige offertes maken</th><td>–</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Elektronisch factureren (UBL)</th><td>–</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Onbeperkt boekhouden</th><td>–</td><td>–</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Btw- en ICP-aangifte in één klik</th><td>–</td><td>–</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">SnelStart Bankieren (5 zakelijke betaalrekeningen)</th><td>–</td><td>–</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Abonnementen (periodiek) factureren</th><td>–</td><td>–</td><td>–</td><td>✓</td><td>✓</td></tr>
<tr><th scope="row">Werken met kostenplaatsen</th><td>–</td><td>–</td><td>–</td><td>–</td><td>✓</td></tr>
</tbody></table></div>
<p>SnelStart heeft twee programma's: SnelStart Web en de desktopversie SnelStart 12. In SnelStart Web maak je eenvoudige offertes vanaf inStap; uitgebreidere offertes in SnelStart 12 vanaf inBalans. Facturen met een iDEAL-betaallink stuur je in SnelStart Web vanaf inStap en in SnelStart 12 vanaf inKaart. Hoe de bankkoppeling werkt, lees je in <a href="/bankkoppeling-boekhoudprogramma/">bankkoppeling in je boekhoudprogramma</a>. Twijfel je welk pakket past? <a href="/boekhoudprogramma-kiezen/">Doe de match</a>.</p>`],
      ['Extra kosten bij SnelStart', `<p>In elk pakket zit 1 online administratie en 1 gebruiker. Daarboven rekent SnelStart per maand:</p>
<ul>
<li><strong>Extra online administratie:</strong> € 3,50 per maand, in elk pakket.</li>
<li><strong>Extra gebruiker:</strong> € 2,50 (inOrde), € 3,00 (inStap), € 4,25 (inKaart), € 6,75 (inBalans) of € 10,50 (inZicht) per maand.</li>
<li><strong>SnelStart Bankieren:</strong> "Inbegrepen vanaf inKaart, zonder extra kosten". Los kost het € 7,50 per maand, en vanaf inKaart € 7,50 per maand per extra administratie waarvoor je het gebruikt.</li>
</ul>
<p>De kosten voor extra online administraties en extra gebruikers heten bij SnelStart verbruikskosten: ze "worden berekend over een maand en worden achteraf gefactureerd". De desktopversie en SnelStart Web gebruik je allebei "zonder extra kosten per applicatie".</p>`],
    ],
    faq: [
      ['Kun je SnelStart gratis proberen?', 'Ja. Volgens SnelStart probeer je alle pakketten 30 dagen gratis. Doe je niets, dan stopt het abonnement vanzelf; het wordt pas definitief als je het zelf activeert.'],
      ['Betaal je SnelStart per maand of per jaar?', 'Allebei kan. De abonnementskosten worden vooraf in rekening gebracht. Kosten voor extra administraties of gebruikers worden over een maand berekend en achteraf gefactureerd.'],
      ['Kan ik SnelStart zonder boekhouder gebruiken?', 'Ja, vanaf inKaart ({{p:inkaart}} per maand): daarin zitten onbeperkt boekhouden en de btw- en ICP-aangifte in één klik. inOrde krijg je alleen via een boekhouder of accountant die met SnelStart werkt, en bij inStap doet je boekhouder de rest.'],
    ],
  },
};
