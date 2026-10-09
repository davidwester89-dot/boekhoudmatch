// Redactie per aanbieder: korte samenvattingen van wat in pakketten.js en op de bronpagina's van de aanbieder staat.
// Geen meningen, scores of populariteit. Elke bewering is terug te vinden in de prijs- of functiepagina (zie `bronnen`).
// proef = gratis proefperiode in dagen volgens de site van de aanbieder (null = geen proefperiode vermeld).
// logo = bestandsnaam in src/assets/logos (webp, 320x96, van de eigen site van de aanbieder); null = woordmerk.
export const REDACTIE = {
  eboekhouden: {
    slug: 'e-boekhouden', kort: 'e-Boekhouden', logo: null, proef: 14,
    sterk: 'Alle functies (bankkoppeling, btw-aangifte, offertes, uren) zitten in elk pakket.',
    zwak: 'Het ZZP-pakket heeft een grens van 240 boekingen per jaar; elke mutatie (verkoop, inkoop, bank) telt.',
    knelt: 'ZZP: max. 240 boekingen per jaar',
    wel: ['Je hebt weinig boekingen en wilt een laag vast bedrag.', 'Je start net: starters krijgen volgens de prijspagina 15 maanden gratis.', 'Je wilt offertes en uren in hetzelfde pakket.'],
    niet: ['Je hebt meer dan 240 boekingen per jaar en wilt factureren: dan wordt het Standaard + Factureren (€ 24,00).', 'Je hebt een vof of bv: of die wordt ondersteund, staat niet op de prijspagina.'],
  },
  moneybird: {
    slug: 'moneybird', kort: 'Moneybird', logo: 'moneybird', proef: 60,
    sterk: 'Btw-aangifte direct indienen vanaf Start; eenmanszaak, vof en bv worden genoemd.',
    zwak: 'Je externe bank automatisch koppelen kan pas vanaf Groei.',
    knelt: 'Start: max. 20 verwerkte banktransacties per maand',
    wel: ['Je wilt je btw-aangifte direct vanuit het pakket indienen.', 'Je hebt een vof of bv.', 'Je hebt weinig banktransacties, of je gebruikt de Moneybird Betaalrekening.'],
    niet: ['Je wilt je huidige bank automatisch koppelen voor weinig geld: dat kan pas vanaf Groei (€ 35).', 'Je hebt veel banktransacties en een klein budget.'],
  },
  jortt: {
    slug: 'jortt', kort: 'Jortt', logo: 'jortt', proef: 30,
    sterk: 'Gecontroleerde aangifte inkomstenbelasting in ZZP, MKB en Plus.',
    zwak: 'ZZP is alleen voor een eenmanszaak; Starter heeft geen boekhouding.',
    knelt: 'ZZP: max. 250 boekingen per maand, alleen eenmanszaak',
    wel: ['Je wilt hulp of controle bij je aangifte inkomstenbelasting.', 'Je hebt een eenmanszaak (ZZP), of een vof of bv (MKB en Plus).'],
    niet: ['Je zoekt een gratis pakket mét boekhouding: Starter is alleen factureren.', 'Je zoekt de laagste maandprijs voor een klein volume.'],
  },
  moneymonk: {
    slug: 'moneymonk', kort: 'MoneyMonk', logo: null, proef: 30,
    sterk: 'Gratis PSD2-bankkoppeling voor al je bankrekeningen, in elk pakket.',
    zwak: 'Elk pakket heeft een omzetgrens; Basis is tot € 20.000 omzet per jaar.',
    knelt: 'Basis: max. 20 banktransacties per maand en tot € 20.000 omzet per jaar',
    wel: ['Je hebt een kleine omzet en weinig banktransacties (Basis).', 'Je wilt uren registreren en offertes maken; die functies staan op de site.', 'Je start net: starters krijgen volgens de site 15 maanden gratis.'],
    niet: ['Je omzet is hoger dan € 20.000 en je wilt weinig betalen: Pro kost na 3 maanden € 32,50.', 'Je wilt weten of de prijzen in- of exclusief btw zijn: niet vermeld op de prijspagina.'],
  },
  rompslomp: {
    slug: 'rompslomp', kort: 'Rompslomp', logo: 'rompslomp', proef: null,
    sterk: 'Btw-aangifte direct versturen vanaf Puur Factuur.',
    zwak: 'Automatische bankkoppeling pas vanaf Basic; Puur Factuur en Basic hebben lage limieten.',
    knelt: 'Puur Factuur: max. 8 facturen en 5 uitgaven per maand',
    wel: ['Je stuurt weinig facturen en wilt toch je btw-aangifte direct indienen.', 'Je wilt gratis beginnen (Starter, facturen € 1,50 per stuk).'],
    niet: ['Je hebt meer dan 10 facturen of uitgaven per maand en een klein budget: dan wordt het Professional (€ 28,95).', 'Je wilt hulp bij je IB-aangifte: niet vermeld.'],
  },
  tellow: {
    slug: 'tellow', kort: 'Tellow', logo: null, proef: null,
    sterk: 'Gratis pakket met betaalrekening; Compleet heeft een boekhouder die je btw- en IB-aangifte opstelt.',
    zwak: 'Bij Gratis en Basis dien je de btw-aangifte zelf in.',
    knelt: 'Gratis: max. 3 facturen, 20 uitgaven en 25 transacties per maand',
    wel: ['Je wilt gratis beginnen en stuurt heel weinig facturen.', 'Je wilt je aangiftes laten doen door een boekhouder (Compleet).'],
    niet: ['Je wilt je btw-aangifte direct indienen voor weinig geld: dat kan vanaf Plus (€ 22,99).', 'Je wilt weten of urenregistratie erin zit: niet per pakket vermeld.'],
  },
  snelstart: {
    slug: 'snelstart', kort: 'SnelStart', logo: 'snelstart', proef: 30,
    sterk: 'inOrde en inStap zijn gemaakt voor samenwerking met je eigen boekhouder.',
    zwak: 'Urenregistratie staat niet op de pakkettenpagina.',
    knelt: 'inOrde: alleen via een boekhouder die met SnelStart werkt',
    wel: ['Je werkt met een boekhouder die SnelStart gebruikt.', 'Je wilt zelf boekhouden met een uitgebreider pakket (inKaart en hoger).'],
    niet: ['Je wilt zelf boekhouden voor zo weinig mogelijk geld: inOrde en inStap zijn daar niet voor bedoeld.', 'Je wilt uren registreren in je boekhoudpakket: niet vermeld.'],
  },
  informer: {
    slug: 'informer', kort: 'Informer', logo: 'informer', proef: 30,
    sterk: 'ZZP Plus heeft onbeperkt banktransacties.',
    zwak: 'Je eigen bank automatisch koppelen kost € 1 per maand per rekening.',
    knelt: 'ZZP Basis: max. 30 bankbetalingen per maand',
    wel: ['Je wilt offertes en uren in je pakket.', 'Je hebt meer dan 30 bankbetalingen per maand (ZZP Plus).'],
    niet: ['Je hebt een bv en wilt weten of ZZP-pakketten passen: rechtsvormen niet vermeld.', 'Je wilt hulp bij je IB-aangifte: niet in de pakketten genoemd.'],
  },
  exact: {
    slug: 'exact', kort: 'Exact', logo: null, proef: 30,
    sterk: 'Reeleezee Slim Boekhouden: btw-aangifte direct indienen en onbeperkt facturen.',
    zwak: 'Offertes en urenregistratie staan niet bij deze boekhoudpakketten vermeld.',
    knelt: 'Slim Boekhouden Start: max. 10 facturen en 10 boekingen per maand',
    wel: ['Je verwacht te groeien en wilt bij een grote aanbieder blijven (Exact Online).'],
    niet: ['Je zoekt een goedkoop pakket voor meer dan 10 facturen per maand: Slim Boekhouden kost € 43.', 'Je wilt offertes of uren in je boekhoudpakket: niet vermeld.'],
  },
  silvasoft: {
    slug: 'silvasoft', kort: 'Silvasoft', logo: 'silvasoft', proef: 30,
    sterk: 'Je kiest losse modules; onbeperkt boeken en btw-aangifte met 1 klik naar de Belastingdienst.',
    zwak: 'Automatische bankkoppeling kost € 3 per bankrekening per maand.',
    knelt: 'Module Boekhouden: zonder factureren (Facturatie is € 8,95 extra)',
    wel: ['Je wilt alleen betalen voor de modules die je gebruikt.', 'Je wilt onbeperkt boeken zonder volumegrens.'],
    niet: ['Je wilt hulp bij je IB-aangifte: niet vermeld.', 'Je wilt weten welke rechtsvormen worden ondersteund: niet vermeld.'],
  },
};

// Link naar de pagina van een aanbieder. VENDOR_PAGES=false: anker in de vergelijking (tot de aanbiederpagina's live zijn).
export const VENDOR_PAGES = false;
export const vendorHref = (id) => (VENDOR_PAGES ? `/${REDACTIE[id].slug}/` : `/boekhoudprogramma-vergelijken/#${REDACTIE[id].slug}`);
