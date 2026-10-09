// Boekhoudpakketten: prijzen en functies UITSLUITEND van de eigen website van de aanbieder.
// Gecontroleerd op CHECKED. null = niet (per pakket) te verifiëren op de prijspagina -> zo tonen, niet raden.
// Prijzen: reguliere prijs per maand bij maandbetaling (geen tijdelijke acties). Acties staan apart in `actie`.
// LET OP: het veld `partner` wordt alleen gebruikt voor de openbaarmaking. De matching leest het NIET (zie match.js + tests).
export const CHECKED = '2026-10-08';
const INF = Infinity;

// btwAangifte: 'direct' (indienen vanuit pakket staat expliciet vermeld) | 'ja' (functie vermeld, manier van indienen niet)
//              | 'handmatig' (pakket rekent uit, jij dient zelf in) | 'overzicht' (alleen btw-overzicht) | 'boekhouder' | false
// bank: 'auto' (automatische koppeling externe bank) | 'auto-extra' (tegen meerprijs `bankExtra`) | 'import' (handmatig importeren)
// ib: 'inclusief' (boekhouder doet aangifte IB) | 'controle' (aangifte IB wordt gecontroleerd/voorbereid in pakket)
//     | 'eigen-boekhouder' (pakket bedoeld voor samenwerking met jouw boekhouder, kosten apart) | false | null
export const PAKKETTEN = [
  {
    id: 'eboekhouden', naam: 'e-Boekhouden.nl', site: 'https://www.e-boekhouden.nl',
    bronnen: [{ url: 'https://www.e-boekhouden.nl/prijzen', titel: 'e-Boekhouden.nl – Prijzen' }],
    btwPrijzen: null, // prijspagina vermeldt niet of prijzen excl. of incl. btw zijn
    rechtsvormen: null, eigenRekening: false, partner: 'Clicks.nu (eigen partnerprogramma)',
    actie: 'Starters: 15 maanden gratis. Anderen: 12 maanden 50% korting (na 14 dagen proef, nieuwe klanten).',
    noot: 'Alle functies (bankkoppeling, btw-aangifte, offertes, uren) zitten volgens de prijspagina in elk pakket. Een boeking = elke mutatie (verkoop, inkoop, bank).',
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
    noot: 'jortt ZZP: alleen eenmanszaak, tot 250 boekingen per maand, 1 bankkoppeling, gecontroleerde aangifte inkomstenbelasting. jortt Starter heeft bewust géén boekhouding.',
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
    plannen: [
      { id: 'starter', naam: 'Starter', prijs: 0, perFactuur: 1.50, facturen: INF, uitgaven: 5, btwAangifte: 'overzicht', bank: 'import', offertes: true, uren: null, ib: null },
      { id: 'puur', naam: 'Puur Factuur', prijs: 8.95, facturen: 8, uitgaven: 5, btwAangifte: 'direct', bank: 'import', offertes: true, uren: true, ib: null },
      { id: 'basic', naam: 'Basic', prijs: 14.95, facturen: 10, uitgaven: 10, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: null },
      { id: 'professional', naam: 'Professional', prijs: 28.95, facturen: INF, uitgaven: INF, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: null },
      { id: 'master', naam: 'Master', prijs: 42.95, facturen: INF, uitgaven: INF, btwAangifte: 'direct', bank: 'auto', offertes: true, uren: true, ib: null, noot: '3 boekhoudingen.' },
    ],
  },
  {
    id: 'informer', naam: 'Informer', site: 'https://www.informer.nl',
    bronnen: [{ url: 'https://www.informer.nl/prijzen', titel: 'Informer – Prijzen' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: true, partner: null,
    actie: 'Starters (KvK-inschrijving max. 6 maanden oud): 12 maanden € 15 p/m korting. 30 dagen gratis proberen.',
    noot: 'Automatische koppeling met je eigen bank kost € 1 p/m per rekening (Informer Money-rekening zonder vaste kosten). MKB Basis staat op de pagina zowel als € 34 als € 35; wij rekenen met € 35.',
    plannen: [
      { id: 'zzp-basis', naam: 'ZZP Basis', prijs: 15, facturen: INF, transacties: 30, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false, noot: 'Scan & Herken + € 5 p/m.' },
      { id: 'zzp-plus', naam: 'ZZP Plus', prijs: 23, facturen: INF, transacties: INF, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false },
      { id: 'mkb-basis', naam: 'MKB Basis', prijs: 35, facturen: INF, transacties: INF, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false },
      { id: 'mkb-plus', naam: 'MKB Plus', prijs: 45, facturen: INF, transacties: INF, btwAangifte: 'ja', bank: 'auto-extra', bankExtra: 1, offertes: true, uren: true, ib: false },
    ],
  },
  {
    id: 'exact', naam: 'Exact (Reeleezee / Online)', site: 'https://www.exact.com/nl',
    bronnen: [{ url: 'https://www.exact.com/nl/bedrijven/exact-reeleezee', titel: 'Exact Reeleezee – Plans and pricing' }, { url: 'https://www.exact.com/nl/producten/boekhouden/features-en-prijzen', titel: 'Exact Online Boekhouden – Features en prijzen' }],
    btwPrijzen: 'excl', rechtsvormen: null, eigenRekening: false, partner: null,
    actie: '30 dagen gratis proberen.',
    noot: 'Exact Reeleezee (Slim Boekhouden) is de zzp-lijn van Exact; Exact Online Boekhouden is uitgebreider. Offertes en uren staan niet bij deze boekhoudpakketten vermeld.',
    plannen: [
      { id: 'slim-start', naam: 'Reeleezee Slim Boekhouden Start', prijs: 18, facturen: 10, uitgaven: 10, btwAangifte: 'ja', bank: 'auto', offertes: null, uren: null, ib: false, noot: '10 facturen en 10 boekingen per maand.' },
      { id: 'slim', naam: 'Reeleezee Slim Boekhouden', prijs: 43, facturen: INF, uitgaven: INF, btwAangifte: 'direct', bank: 'auto', offertes: null, uren: null, ib: false },
      { id: 'eol-essentials', naam: 'Exact Online Boekhouden Essentials', prijs: 49, facturen: 25, btwAangifte: 'ja', bank: 'auto', offertes: null, uren: null, ib: false, noot: '1 gebruiker, 1 bankkoppeling.' },
    ],
  },
];
