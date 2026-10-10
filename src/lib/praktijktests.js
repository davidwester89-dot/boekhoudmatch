// Praktijktests: eigen metingen met een proefaccount, volgens het vaste testprotocol (PLAN-diepgang-breedte.md, A1).
// Alleen waarneembare feiten, geen scores of oordelen. Wordt NIET gelezen door match.js (rangorde blijft gelijk).
// Ruwe metingen: research/praktijktest/<aanbieder>/METINGEN.md (buiten de site).

export const PRAKTIJKTESTS = {
  moneybird: {
    datum: '2026-10-10',
    pakket: 'Proefperiode (60 dagen)',
    door: 'Dave West',
    omgeving: 'Desktop, Chrome',
    aanmelden: {
      velden: ['naam', 'e-mailadres', 'wachtwoord'],
      kvk: 'Nee. Bij het instellen zoekt Moneybird je bedrijf in het KvK-register; overslaan kan via "Het bedrijf staat nog niet ingeschreven".',
      telefoon: 'Nee',
      betaalgegevens: 'Nee',
      id: 'Nee',
      bevestigingsmail: 'Ja (binnen 1 minuut ontvangen)',
      minutenTotDashboard: 'ca. 1,5 minuut, inclusief bevestigingsmail',
    },
    metingen: {
      eersteFactuur: 'ca. 17 klikken, inclusief het aanmaken van de testklant. Geen verplichte bedrijfsgegevens; een gele melding wijst op ontbrekend btw-id en IBAN. UBL-bestand gaat standaard mee als bijlage; Peppol moet je eerst activeren.',
      bon: 'Ja. Na uploaden van een pdf-bon (analyse ca. 15–20 seconden) ingevuld: soort, kenmerk, datum, omschrijving, € 100 excl. btw, 21% btw (€ 21), categorie en de naam van de nieuwe leverancier. Ca. 7 klikken, 0 velden getypt.',
      bank: 'Geen lijst met banken. Keuze: Moneybird Betaalrekening (eerste 12 maanden gratis, daarna € 7 p/m plus € 0,15 per transactie) of een andere bank via Ponto (inbegrepen; betaalopdrachten € 1 p/m per rekening plus € 0,03 per betaling, excl. btw). Koppelen vraagt eerst betaalgegevens. Importeren kan met CAMT.053 of MT940 (max. 10 MB).',
      btw: 'Rubriek 1a (€ 1.000 / € 210) en 5b (€ 21) klopten met het testscenario, totaal € 189. Voor indienen vraagt Moneybird een btw-nummer in de bedrijfsgegevens en, volgens het helpcenter, een bedrijfsverificatie (identiteitsbewijs of brief naar het KvK-adres).',
      btwBron: 'https://helpcenter.moneybird.nl/nl/articles/207429-waarom-moneybird-jouw-gegevens-verifieert',
      app: 'Niet op een telefoon getest. De app staat in de Nederlandse App Store (iPhone) en in Google Play.',
      support: 'Niet getest',
      proef: '60 dagen, in deze test tot 9 december 2026. Het abonnementsscherm toont niet wat er na de proef gebeurt.',
    },
    screenshots: [
      { stap: 2, src: '/img/praktijktest/moneybird-2-factuur-2026-10-10.webp', width: 1200, height: 973,
        alt: 'Moneybird-factuurscherm met conceptfactuur aan Testklant B.V.: € 1.000 plus € 210 btw, totaal € 1.210; regels KVK, Btw en Bank zijn leeg', bijschrift: 'Factuur' },
      { stap: 5, src: '/img/praktijktest/moneybird-5-btw-2026-10-10.webp', width: 1200, height: 1362,
        alt: 'Moneybird-btw-aangifte kwartaal 4 2026: rubriek 1a € 1000 en € 210, rubriek 5b € 21, totaal € 189, met de knop Volgende', bijschrift: 'Btw-overzicht' },
      { stap: 3, src: '/img/praktijktest/moneybird-3-bon-2026-10-10.webp', width: 1200, height: 844,
        alt: 'Moneybird na uploaden van een inkoopbon: kenmerk T-0001, datum, € 100 excl. btw, 21% btw en categorie automatisch ingevuld', bijschrift: 'Bon' },
    ],
    waarnemingen: [
      'Bij het aanmelden vroeg Moneybird alleen naam, e-mailadres en wachtwoord; geen KvK-nummer, telefoonnummer, betaalgegevens of identiteitsbewijs.',
      'De eerste factuur kon zonder btw-id en IBAN worden verstuurd; Moneybird toonde daarover een gele melding en de regels KVK, Btw en Bank bleven leeg op de pdf.',
      'Na het uploaden van de bon waren bedrag, btw, datum, kenmerk en categorie ingevuld zonder dat we iets typten.',
      'Zelfgemaakte CAMT.053- en MT940-testbestanden werden geweigerd ("Moneybird kan alleen officiële bestanden van je bank inlezen"). Een handmatig ingevoerde betaling van € 1.210 werd via het betalingskenmerk aan de factuur gekoppeld, de betaling van € 121 niet aan de bon.',
    ],
    grenzen: 'Getest zonder KvK-inschrijving; btw-aangifte niet ingediend, app en support niet getest.',
  },
  eboekhouden: {
    datum: '2026-10-10',
    pakket: 'Proefaccount (14 dagen)',
    door: 'Dave West',
    omgeving: 'Desktop, Chrome',
    aanmelden: {
      velden: ['e-mailadres', 'gebruikersnaam', 'wachtwoord'],
      kvk: 'Nee',
      telefoon: 'Nee (veld wel zichtbaar, niet verplicht)',
      betaalgegevens: 'Nee',
      id: 'Nee',
      bevestigingsmail: 'Nee (direct klaar voor gebruik)',
      minutenTotDashboard: 'ca. 1,5 minuut',
    },
    metingen: {
      eersteFactuur: 'ca. 15 klikken, inclusief het aanmaken van de testrelatie (Code en Bedrijf verplicht). Een nieuwe factuurregel staat standaard op 9% btw en rekening 0130 Inventarissen; voor de test gezet op 21% btw en 8000 Omzet. Bij e-mailen is het veld Bericht verplicht. Optie "UBL-bestand meesturen" (vinkje); geen Peppol-optie gezien. Factuur F00001 € 1.210 verzonden.',
      bon: 'Ja, via Autopilot (gratis, eerst aanzetten; waarschuwing over externe AI; 10 credits zichtbaar). Na uploaden las Autopilot de bon in ca. 30 seconden en boekte: nieuwe leverancier, kenmerk T-0001, datum, € 100 excl. btw, 21% btw, rekening 4700 Kantoorbenodigdheden. Ca. 7 klikken, 0 velden getypt. Gewone handmatige invoer was ook mogelijk.',
      bank: 'Koppelingen zichtbaar voor ABN Amro, ASN, bunq, ING, Knab, Rabobank, RegioBank, Revolut, SNS, Triodos, Van Lanschot en overige Europese banken; geen prijs getoond op dat scherm. Een zelfgemaakt CAMT.053-testbestand werd geaccepteerd (3 regels): € 121 automatisch gekoppeld aan de bon, € 1.210 niet aan de factuur (ander factuurnummer in de omschrijving), € 7,50 onverwerkt. MT940 daarna ook geaccepteerd, zonder dubbele regels te herkennen.',
      btw: 'Rubriek 1a (€ 1.000 / € 210) en 5b (€ 21) klopten met het testscenario, totaal € 189. Verzenden was geblokkeerd: de periode is nog niet voorbij en "Je OB-nummer is niet correct of niet ingevuld". Niets ingediend.',
      app: 'Niet getest',
      support: 'Niet getest',
      proef: '14 dagen, in deze test tot ca. 24 oktober 2026. Op het scherm: "u gaat pas betalen na uw proefperiode". Of de proef vanzelf stopt en wat er daarna met de gegevens gebeurt, stond niet in de app.',
    },
    screenshots: [
      { stap: 2, src: '/img/praktijktest/eboekhouden-2-factuur-2026-10-10.webp', width: 1200, height: 668,
        alt: 'e-Boekhouden-factuurscherm met factuurregel Advieswerk (test): € 1.000 plus 21% btw, totaal € 1.210; knop Proefaccount omzetten (nog 14 dagen)', bijschrift: 'Factuur' },
      { stap: 3, src: '/img/praktijktest/eboekhouden-3-bon-2026-10-10.webp', width: 1200, height: 668,
        alt: 'e-Boekhouden Autopilot na boeken van inkoopbon.pdf: Testleverancier Kantoorartikelen B.V., T-0001, € 100 bij 21% btw, rekening 4700 Kantoorbenodigdheden', bijschrift: 'Bon' },
      { stap: 5, src: '/img/praktijktest/eboekhouden-5-btw-2026-10-10.webp', width: 1200, height: 668,
        alt: 'e-Boekhouden-btw-aangifte 4e kwartaal 2026: rubriek 1a € 1000 en € 210, voorgestelde aangifte gelijk aan de gegevens', bijschrift: 'Btw-overzicht' },
    ],
    waarnemingen: [
      'Bij het aanmelden waren e-mailadres, gebruikersnaam en wachtwoord verplicht; telefoonnummer, KvK-nummer, betaalgegevens en identiteitsbewijs niet. Er kwam geen bevestigingsmail; het account was direct klaar.',
      'Een nieuwe factuurregel staat standaard op 9% btw en rekening 0130 Inventarissen; voor de testfactuur gezet op 21% btw en 8000 Omzet. Bij e-mailen is het veld Bericht verplicht.',
      'Autopilot (gratis, eerst aanzetten) las de bon in ongeveer 30 seconden en boekte leverancier, T-0001, datum, € 100 plus 21% btw en rekening 4700 Kantoorbenodigdheden; 0 velden getypt.',
      'Een zelfgemaakt CAMT.053-testbestand werd geaccepteerd: 3 regels, de betaling van € 121 gekoppeld aan de bon, de € 1.210 niet aan de factuur (ander factuurnummer in de omschrijving), € 7,50 onverwerkt.',
    ],
    grenzen: 'Getest zonder KvK-inschrijving; btw-aangifte niet ingediend, app en support niet getest.',
  },
};

/** Test voor een aanbieder-id, of null. */
export const praktijktest = (id) => PRAKTIJKTESTS[id] || null;
