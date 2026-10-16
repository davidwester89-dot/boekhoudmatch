// Boekhoudpakketten: prijzen en functies UITSLUITEND van de eigen website van de aanbieder.
// Gecontroleerd op CHECKED (of per aanbieder op `gecontroleerd`). null = niet (per pakket) te verifiëren op de prijspagina -> zo tonen, niet raden.
// Prijzen: reguliere prijs per maand bij maandbetaling (geen tijdelijke acties). Acties staan apart in `actie`.
// LET OP: het veld `partner` wordt alleen gebruikt voor de openbaarmaking. De matching leest het NIET (zie match.js + tests).
export const CHECKED = '2026-10-10'; // alle prijzen opnieuw gecontroleerd op 10-10-2026 (eerste controle 8-10-2026)
const INF = Infinity;

// btwAangifte: 'direct' (indienen vanuit pakket staat expliciet vermeld) | 'ja' (functie vermeld, manier van indienen niet)
//              | 'handmatig' (pakket rekent uit, jij dient zelf in) | 'overzicht' (alleen btw-overzicht) | 'boekhouder' | false
// bank: 'auto' (automatische koppeling externe bank) | 'auto-extra' (tegen meerprijs `bankExtra`) | 'import' (handmatig importeren)
// ib: 'inclusief' (boekhouder doet aangifte IB) | 'controle' (aangifte IB wordt gecontroleerd/voorbereid in pakket)
//     | 'rapportage' (pakket maakt balans en W&V voor de IB-aangifte; invullen doe je zelf)
// webshopkoppelingen (per aanbieder, nog NIET getoond op de site): per platform 'ja' (koppeling genoemd op eigen site/helpcentrum/app store van de aanbieder,
//     ook via partner) of 'niet gevonden' (niet gevonden op officiële bronnen; niet raden). Eigen `gecontroleerd` en `bronnen`.
// omzetMax: omzetgrens per jaar die de aanbieder bij het pakket noemt (de match vraagt geen omzet: we tonen het als 'let op').
//     | 'eigen-boekhouder' (pakket bedoeld voor samenwerking met jouw boekhouder, kosten apart) | false | null
export const PAKKETTEN = [
  {
    id: 'eboekhouden', naam: 'e-Boekhouden.nl', site: 'https://www.e-boekhouden.nl',
    bronnen: [{ url: 'https://www.e-boekhouden.nl/prijzen', titel: 'e-Boekhouden.nl – Prijzen' }],
    btwPrijzen: null, // prijspagina vermeldt niet of prijzen excl. of incl. btw zijn
    rechtsvormen: null, eigenRekening: false, partner: 'Clicks.nu (eigen partnerprogramma)',
    actie: 'Starters: 15 maanden gratis. Anderen: 12 maanden 50% korting (na 14 dagen proef, nieuwe klanten).',
    noot: 'Alle functies (bankkoppeling, btw-aangifte, offertes, uren) zitten volgens de prijspagina in elk pakket. Een boeking = elke mutatie (verkoop, inkoop, bank).',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'ja',
      bronnen: [{ url: 'https://www.e-boekhouden.nl/koppelingen/webshops', titel: 'e-Boekhouden.nl – Koppelingen webshops' }, { url: 'https://www.e-boekhouden.nl/koppelingen/payment-service-providers', titel: 'e-Boekhouden.nl – Koppelingen payment service providers' }] },
    plannen: [
      { id: 'zzp', naam: 'ZZP', prijs: 9.95, facturen: INF, boekingenJaar: 240, btwAangifte: 'ja', bank: 'auto', offertes: true, uren: true, ib: false },
      { id: 'standaard', naam: 'Standaard', prijs: 14.50, facturen: 0, boekingenJaar: INF, btwAangifte: 'ja', bank: 'auto', offertes: true, uren: true, ib: false, noot: 'Zonder factureren.' },
      { id: 'standaard-f', naam: 'Standaard + Factureren', prijs: 24.00, facturen: INF, boekingenJaar: INF, btwAangifte: 'ja', bank: 'auto', offertes: true, uren: true, ib: false },
    ],
  },
  {
    id: 'moneybird', naam: 'Moneybird', site: 'https://www.moneybird.nl',
    bronnen: [{ url: 'https://www.moneybird.nl/prijzen/', titel: 'Moneybird – Prijzen' }],
    btwPrijzen: null, rechtsvormen: ['eenmanszaak', 'vof', 'bv'], eigenRekening: true, partner: 'Daisycon',
    actie: '60 dagen gratis proberen (pakket Compleet).',
    noot: 'Limiet gaat over verwerkte banktransacties per maand. Externe bank koppelen kan vanaf Groei; bij Compact/Start importeer je handmatig of gebruik je de Moneybird Betaalrekening (eerste 12 mnd gratis, daarna € 7 p/m). Offertes staan bij de functies, niet per pakket in de prijstabel.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'ja', noot: 'Webshopkoppelingen via partners (o.a. Combidesk, Webwinkelfacturen.nl); Mollie ook direct.',
      bronnen: [{ url: 'https://www.moneybird.nl/product/koppelingen/webshops/', titel: 'Moneybird – Koppelingen met webwinkels' }, { url: 'https://helpcenter.moneybird.nl/nl/articles/207364-beschikbare-koppelingen-per-categorie', titel: 'Moneybird Kennisbank – Beschikbare koppelingen per categorie' }] },
    plannen: [
      { id: 'compact', naam: 'Compact', prijs: 4, prijsJaar: 3, facturen: 1, transacties: 5, btwAangifte: 'overzicht', bank: 'import', offertes: true, uren: 'beperkt', ib: false, noot: 'Voor kleine of inactieve administraties.' },
      { id: 'start', naam: 'Start', prijs: 18, prijsJaar: 15, facturen: INF, transacties: 20, btwAangifte: 'direct', bank: 'import', offertes: true, uren: true, ib: false },
      { id: 'groei', naam: 'Groei', prijs: 35, prijsJaar: 29, facturen: INF, transacties: 50, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: false },
      { id: 'compleet', naam: 'Compleet', prijs: 49, prijsJaar: 41, facturen: INF, transacties: INF, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: false },
    ],
  },
  {
    id: 'jortt', naam: 'Jortt', site: 'https://www.jortt.nl',
    bronnen: [{ url: 'https://www.jortt.nl/prijs/', titel: 'Jortt – Prijs' }, { url: 'https://www.jortt.nl/uitleg/faq/overzicht-jortt-abonnementen/', titel: 'Jortt – Overzicht abonnementen' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: false, partner: 'Daisycon',
    actie: '30 dagen gratis, daarna 3 maanden € 9,95 p/m. Prijzen per 9 september 2026 verhoogd.',
    noot: 'Jortt ZZP: alleen eenmanszaak, tot 250 boekingen per maand, 1 bankkoppeling, gecontroleerde aangifte inkomstenbelasting. Jortt Starter heeft bewust geen boekhouding.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'ja', noot: 'Deels via Webwinkelfacturen.nl (kosten apart). Webshop-orders verwerken vraagt volgens Jortt een MKB- of Plus-abonnement.',
      bronnen: [{ url: 'https://www.jortt.nl/boekhouding-webshop/', titel: 'Jortt – Boekhouding voor je webshop' }, { url: 'https://www.jortt.nl/koppelingen/', titel: 'Jortt – Koppelingen' }, { url: 'https://www.jortt.nl/uitleg/administratie/administratie-voor-webshop-zonder-mollie-met-koppeling/', titel: 'Jortt – Webshop zonder Mollie met koppeling' }] },
    plannen: [
      { id: 'starter', naam: 'Starter', prijs: 0, boekhouding: false, facturen: INF, btwAangifte: false, bank: 'import', offertes: true, uren: true, ib: false },
      { id: 'zzp', naam: 'ZZP', prijs: 21.95, prijsJaar: 19.95, facturen: INF, boekingenMaand: 250, rechtsvormen: ['eenmanszaak'], btwAangifte: 'ja', bank: 'auto', offertes: true, uren: true, ib: 'controle' },
      { id: 'mkb', naam: 'MKB', prijs: 29.95, prijsJaar: 27.95, facturen: INF, boekingenMaand: INF, rechtsvormen: ['eenmanszaak', 'vof', 'bv'], btwAangifte: 'ja', bank: 'auto', offertes: true, uren: true, ib: 'controle' },
      { id: 'plus', naam: 'Plus', prijs: 39.95, prijsJaar: 37.95, facturen: INF, boekingenMaand: INF, rechtsvormen: ['eenmanszaak', 'vof', 'bv'], btwAangifte: 'ja', bank: 'auto', offertes: true, uren: true, ib: 'controle' },
    ],
  },
  {
    id: 'snelstart', naam: 'SnelStart', site: 'https://www.snelstart.nl',
    bronnen: [{ url: 'https://www.snelstart.nl/pakketten', titel: 'SnelStart – Pakketten' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: true, partner: 'Daisycon',
    actie: '30 dagen gratis proberen.',
    noot: 'inOrde (alleen via boekhouder) en inStap zijn bedoeld voor samenwerking met je boekhouder: jij levert bonnen aan, de boekhouder doet de rest. Urenregistratie staat niet op de pakkettenpagina.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'ja', noot: 'Meeste koppelingen via partners (S for Software, Webwinkelfacturen.nl).',
      bronnen: [{ url: 'https://www.snelstart.nl/koppelingen', titel: 'SnelStart – Koppelingen' }] },
    plannen: [
      { id: 'inorde', naam: 'inOrde', prijs: 9.50, facturen: 0, btwAangifte: 'boekhouder', bank: 'auto', offertes: false, uren: null, ib: 'eigen-boekhouder', viaBoekhouder: true, noot: 'Alleen via een boekhouder die met SnelStart werkt.' },
      { id: 'instap', naam: 'inStap', prijs: 15.50, facturen: INF, btwAangifte: 'boekhouder', bank: 'auto', offertes: false, uren: null, ib: 'eigen-boekhouder', viaBoekhouder: true },
      { id: 'inkaart', naam: 'inKaart', prijs: 22.00, facturen: INF, btwAangifte: 'ja', bank: 'auto', offertes: true, uren: null, ib: false },
      { id: 'inbalans', naam: 'inBalans', prijs: 39.50, facturen: INF, btwAangifte: 'ja', bank: 'auto', offertes: true, uren: null, ib: false },
      { id: 'inzicht', naam: 'inZicht', prijs: 54.00, facturen: INF, btwAangifte: 'ja', bank: 'auto', offertes: true, uren: null, ib: false, noot: 'Kosten verdelen per project of afdeling.' },
    ],
  },
  {
    id: 'tellow', naam: 'Tellow', site: 'https://www.tellow.nl',
    bronnen: [{ url: 'https://www.tellow.nl/prijs/', titel: 'Tellow – Prijs' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: true, partner: null,
    actie: '14 dagen niet-goed-geld-terug op betaalde pakketten.',
    noot: 'Inclusief betaalrekening. Btw-aangifte automatisch indienen vanaf Plus; bij Gratis en Basis dien je zelf in. Offertes vanaf Plus. Of urenregistratie en IB-voorbereiding in Gratis/Basis zitten, is in de functietabel niet per pakket af te lezen.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'niet gevonden', woocommerce: 'niet gevonden', lightspeed: 'niet gevonden', bol: 'niet gevonden', mollie: 'niet gevonden', noot: 'Helpcentrum beschrijft alleen handmatig verwerken van Mollie-, Bol- en Shopify-verkopen.',
      bronnen: [{ url: 'https://help.tellow.nl/nl/articles/4046294-hoe-verwerk-ik-verkopen-via-mollie', titel: 'Tellow Help Center – Verkopen via Mollie verwerken' }, { url: 'https://help.tellow.nl/nl/collections/1755215-hoe-koppel-ik', titel: 'Tellow Help Center – Hoe koppel ik' }] },
    plannen: [
      { id: 'gratis', naam: 'Gratis', prijs: 0, facturen: 3, uitgaven: 20, transacties: 25, btwAangifte: 'handmatig', bank: 'auto', offertes: false, uren: null, ib: null },
      { id: 'basis', naam: 'Basis', prijs: 12.99, facturen: INF, uitgaven: INF, transacties: INF, btwAangifte: 'handmatig', bank: 'auto', offertes: false, uren: null, ib: null },
      { id: 'plus', naam: 'Plus', prijs: 22.99, facturen: INF, uitgaven: INF, transacties: INF, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: null, ib: null },
      { id: 'compleet', naam: 'Compleet', prijs: 69.99, facturen: INF, uitgaven: INF, transacties: INF, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: null, ib: 'inclusief', noot: 'Boekhouder inbegrepen: stelt btw- en IB-aangifte op en controleert.' },
    ],
  },
  {
    id: 'rompslomp', naam: 'Rompslomp', site: 'https://rompslomp.nl',
    bronnen: [{ url: 'https://rompslomp.nl/tarieven/update-november-2026', titel: 'Rompslomp – Nieuwe tarieven per 1 november 2026' }, { url: 'https://rompslomp.nl/tarieven', titel: 'Rompslomp – Tarieven (tot 1 november 2026)' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: true, partner: 'Daisycon',
    actie: 'Gratis Starter-pakket.',
    noot: 'We rekenen met de tarieven die per 1 november 2026 gelden (tot die datum: Puur Factuur € 7,95, Basic € 13,50, Professional € 26,50, Master € 39,50). Automatische bankkoppeling vanaf Basic. Starter per 1 nov: facturen € 1,50 per stuk.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'niet gevonden', noot: 'Webshopkoppelingen via Webwinkelfacturen.nl.',
      bronnen: [{ url: 'https://rompslomp.nl/koppelingen/overzicht', titel: 'Rompslomp – Koppelingen overzicht' }] },
    plannen: [
      { id: 'starter', naam: 'Starter', prijs: 0, perFactuur: 1.50, facturen: INF, uitgaven: 5, btwAangifte: 'overzicht', bank: 'import', offertes: true, uren: null, ib: null },
      { id: 'puur', naam: 'Puur Factuur', prijs: 8.95, facturen: 8, uitgaven: 5, btwAangifte: 'direct', bank: 'import', offertes: true, uren: true, ib: null },
      { id: 'basic', naam: 'Basic', prijs: 14.95, facturen: 10, uitgaven: 10, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: null },
      { id: 'professional', naam: 'Professional', prijs: 28.95, facturen: INF, uitgaven: INF, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: null },
      { id: 'master', naam: 'Master', prijs: 42.95, facturen: INF, uitgaven: INF, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: null, noot: '3 boekhoudingen.' },
    ],
  },
  {
    id: 'informer', naam: 'Informer', site: 'https://www.informer.nl', gecontroleerd: '2026-10-11',
    bronnen: [{ url: 'https://www.informer.nl/prijzen', titel: 'Informer – Prijzen' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: true, partner: null,
    actie: 'Starters (KVK-inschrijving max. 6 maanden oud): 12 maanden € 15 p/m korting. 30 dagen gratis proberen.',
    noot: 'Automatische koppeling met je eigen bank kost € 1 p/m per rekening (Informer Money-rekening zonder vaste kosten).',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'niet gevonden', noot: 'Webshopkoppelingen via Webwinkelfacturen.nl.',
      bronnen: [{ url: 'https://helpdesk.informer.nl/nl/articles/10010353-koppeling-webshops', titel: 'Informer Helpcentrum – Koppeling webshops' }] },
    plannen: [
      { id: 'zzp-basis', naam: 'ZZP Basis', prijs: 15, facturen: INF, transacties: 30, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false, noot: 'Scan & Herken + € 5 p/m.' },
      { id: 'zzp-plus', naam: 'ZZP Plus', prijs: 23, facturen: INF, transacties: INF, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false },
      { id: 'mkb-basis', naam: 'MKB Basis', prijs: 34, facturen: INF, transacties: INF, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false },
      { id: 'mkb-plus', naam: 'MKB Plus', prijs: 45, facturen: INF, transacties: INF, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false },
    ],
  },
  {
    id: 'exact', naam: 'Exact (Reeleezee / Online)', site: 'https://www.exact.com/nl',
    bronnen: [{ url: 'https://www.exact.com/nl/bedrijven/exact-reeleezee', titel: 'Exact Reeleezee – Plans and pricing' }, { url: 'https://www.exact.com/nl/bedrijven/boekhouden/features-en-prijzen', titel: 'Exact Online Boekhouden – Features en prijzen' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: false, partner: null,
    actie: '30 dagen gratis proberen.',
    noot: 'Exact Reeleezee (Slim Boekhouden) is de zzp-lijn van Exact; Exact Online Boekhouden is uitgebreider. Offertes en uren staan niet bij deze boekhoudpakketten vermeld.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'ja', noot: 'Gevonden in de Exact Online App Store (apps van partners). Voor Reeleezee niets gevonden op exact.com.',
      bronnen: [{ url: 'https://www.exact.com/nl/app-store/shopify-integratie-iwebdevelopment', titel: 'Exact Online App Store – Shopify integratie' }, { url: 'https://www.exact.com/nl/app-store/woocommerce-iwebdevelopment', titel: 'Exact Online App Store – WooCommerce' }, { url: 'https://www.exact.com/nl/app-store/lightspeed-ecom-koppeling-xcore', titel: 'Exact Online App Store – Lightspeed eCom koppeling' }, { url: 'https://www.exact.com/nl/app-store/bol-com-integratie-webwinkelfacturen', titel: 'Exact Online App Store – Bol.com integratie' }, { url: 'https://www.exact.com/nl/app-store/mollie-aflettermodule-combidesk', titel: 'Exact Online App Store – Mollie Aflettermodule' }] },
    plannen: [
      { id: 'slim-start', naam: 'Reeleezee Slim Boekhouden Start', prijs: 18, facturen: 10, uitgaven: 10, btwAangifte: 'ja', bank: 'auto', offertes: null, uren: null, ib: false, noot: '10 facturen en 10 boekingen per maand.' },
      { id: 'slim', naam: 'Reeleezee Slim Boekhouden', prijs: 43, facturen: INF, uitgaven: INF, btwAangifte: 'direct', bank: 'auto', offertes: null, uren: null, ib: false },
      { id: 'eol-essentials', naam: 'Exact Online Boekhouden Essentials', prijs: 49, facturen: 25, btwAangifte: 'ja', bank: 'auto', offertes: null, uren: null, ib: false, noot: '1 gebruiker, 1 bankkoppeling.' },
    ],
  },
  {
    id: 'silvasoft', naam: 'Silvasoft', site: 'https://www.silvasoft.nl', gecontroleerd: '2026-10-10',
    bronnen: [
      { url: 'https://www.silvasoft.nl/prijzen/', titel: 'Silvasoft – Prijzen' },
      { url: 'https://www.silvasoft.nl/boekhoudprogramma/', titel: 'Silvasoft – Boekhouden' },
      { url: 'https://www.silvasoft.nl/offerte-software/', titel: 'Silvasoft – Offertes & orders' },
      { url: 'https://www.silvasoft.nl/urenregistratie/', titel: 'Silvasoft – Urenregistratie' },
    ],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: false, partner: 'eigen affiliateprogramma',
    actie: '30 dagen gratis proberen, geen automatische verlenging.',
    noot: 'Je stelt je pakket samen uit modules (prijs per administratie, excl. btw): Boekhouden € 13,95, Facturatie € 8,95, Offertes & orders € 6,95, Urenregistratie € 3,95. Onbeperkt boeken, btw-aangifte met 1 klik naar de Belastingdienst. Automatische bankkoppeling (alle Nederlandse banken) € 3 per bankrekening per maand; MT940-import zit erin. Hulp bij de aangifte inkomstenbelasting en ondersteunde rechtsvormen staan niet vermeld.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'ja', woocommerce: 'ja', lightspeed: 'ja', bol: 'ja', mollie: 'ja',
      bronnen: [{ url: 'https://www.silvasoft.nl/koppelingen/', titel: 'Silvasoft – Koppelingen' }] },
    plannen: [
      { id: 'boekhouden', naam: 'Boekhouden', prijs: 13.95, facturen: 0, btwAangifte: 'direct', bank: 'auto-extra', bankExtra: 3, offertes: false, uren: false, ib: null, noot: 'Zonder factureren.' },
      { id: 'boekhouden-facturatie', naam: 'Boekhouden + Facturatie', prijs: 22.90, facturen: INF, btwAangifte: 'direct', bank: 'auto-extra', bankExtra: 3, offertes: false, uren: false, ib: null },
      { id: 'bf-uren', naam: 'Boekhouden + Facturatie + Urenregistratie', prijs: 26.85, facturen: INF, btwAangifte: 'direct', bank: 'auto-extra', bankExtra: 3, offertes: false, uren: true, ib: null },
      { id: 'bf-offertes', naam: 'Boekhouden + Facturatie + Offertes & orders', prijs: 29.85, facturen: INF, btwAangifte: 'direct', bank: 'auto-extra', bankExtra: 3, offertes: true, uren: false, ib: null },
      { id: 'bf-offertes-uren', naam: 'Boekhouden + Facturatie + Offertes & orders + Urenregistratie', prijs: 33.80, facturen: INF, btwAangifte: 'direct', bank: 'auto-extra', bankExtra: 3, offertes: true, uren: true, ib: null },
    ],
  },
  {
    id: 'moneymonk', naam: 'MoneyMonk', site: 'https://www.moneymonk.nl', gecontroleerd: '2026-10-10',
    bronnen: [
      { url: 'https://www.moneymonk.nl/prijzen', titel: 'MoneyMonk – Prijzen' },
      { url: 'https://www.moneymonk.nl/starterskorting', titel: 'MoneyMonk – Starterskorting' },
      { url: 'https://www.moneymonk.nl/boekhouden/btw-aangifte', titel: 'MoneyMonk – Btw-aangifte' },
      { url: 'https://www.moneymonk.nl/boekhouden/inkomstenbelasting-zzp', titel: 'MoneyMonk – Inkomstenbelasting zzp' },
      { url: 'https://www.moneymonk.nl/boekhouden/urenregistratie', titel: 'MoneyMonk – Urenregistratie' },
      { url: 'https://www.moneymonk.nl/boekhouden/offerte-maken', titel: 'MoneyMonk – Offerte maken' },
    ],
    btwPrijzen: null, // prijspagina vermeldt niet of prijzen excl. of incl. btw zijn
    rechtsvormen: null, eigenRekening: false, partner: null,
    actie: 'Starters (onlangs ingeschreven bij de KVK): 15 maanden gratis. Pro: eerste 3 maanden € 15 p/m. 30 dagen gratis proberen.',
    noot: 'Limieten gaan over verwerkte banktransacties per maand en omzet per jaar. Gratis PSD2-bankkoppeling voor al je bankrekeningen in elk pakket. Btw-aangifte doe je vanuit de software; voor de IB-aangifte maakt het pakket een balans en winst-en-verliesrekening die je overneemt. Functies staan op de functiepagina’s, niet per pakket.',
    webshopkoppelingen: { gecontroleerd: '2026-10-16', shopify: 'niet gevonden', woocommerce: 'niet gevonden', lightspeed: 'niet gevonden', bol: 'niet gevonden', mollie: 'ja', noot: 'Directe webshopkoppeling alleen met Plug & Pay; Mollie-transacties worden dagelijks geïmporteerd.',
      bronnen: [{ url: 'https://www.moneymonk.nl/boekhouden/integraties', titel: 'MoneyMonk – Integraties' }, { url: 'https://www.moneymonk.nl/help/142-is-moneymonk-geschikt-voor-webshops', titel: 'MoneyMonk – Is MoneyMonk geschikt voor webshops?' }] },
    plannen: [
      { id: 'basis', naam: 'Basis', prijs: 9.00, transacties: 20, omzetMax: 20000, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: 'rapportage' },
      { id: 'pro', naam: 'Pro', prijs: 32.50, transacties: 50, omzetMax: 100000, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: 'rapportage', noot: 'Eerste 3 maanden € 15 p/m.' },
      { id: 'ultra', naam: 'Ultra', prijs: 37.50, transacties: Infinity, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: 'rapportage' },
    ],
  },
];
