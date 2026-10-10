// Alle officiële cijfers op één plek, met bron. Wijzig hier, nergens anders.
// Peildatum controle: 8 oktober 2026.

export const CHECKED = '2026-10-08';

export const SOURCES = {
  box1_2026: {
    title: 'Belastingdienst – Box 1: uitleg en tarieven (tarieven 2026)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/',
  },
  kortingen_2026: {
    title: 'Belastingdienst – Voorlopige aanslag 2026: gebruikte tarieven en heffingskortingen',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen',
  },
  arbeidsinkomen: {
    title: 'Belastingdienst – Arbeidsinkomen (winst vóór ondernemersaftrek en mkb-winstvrijstelling)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/arbeidskorting/inkomen_uit_werk',
  },
  zelfstandigenaftrek_2026: {
    title: 'Belastingdienst – Zelfstandigenaftrek 2026 (€ 1.200, startersaftrek € 2.123)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/veranderingen-inkomstenbelasting-2026/ondernemersaftrek-2026/zelfstandigenaftrek-2026',
  },
  mkb_2026: {
    title: 'Belastingdienst – Mkb-winstvrijstelling 2026 (12,7%, voordeel tegen 37,56%)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/veranderingen-inkomstenbelasting-2026/mkb-winstvrijstelling-2026',
  },
  tariefaanpassing_2026: {
    title: 'Belastingdienst – Afbouw tarief aftrekposten bij hoog inkomen (11,94% in 2026)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/aftrek-en-kortingen/content/afbouw-tarief-aftrekposten-bij-hoog-inkomen',
  },
  urencriterium: {
    title: 'Belastingdienst – Ondernemersaftrek en investeringsaftrek (urencriterium 1.225 uur)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/ondernemersaftrek_en_investeringsaftrek',
  },
  zvw_2026: {
    title: 'Belastingdienst – Percentages inkomensafhankelijke bijdrage Zvw (4,85%, max € 79.409)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/percentages-zvw',
  },
  btw: {
    title: 'Belastingdienst – Btw-tarieven (21%, 9%, 0%)',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/tarieven_en_vrijstellingen/',
  },
  kor: {
    title: 'Belastingdienst – Kleineondernemersregeling (KOR), omzetgrens € 20.000',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/hoe_werkt_de_btw/kleineondernemersregeling/',
  },
};

// ---------- Inkomstenbelasting 2026 (jonger dan AOW-leeftijd) ----------
export const IB2026 = {
  year: 2026,
  brackets: [
    { upTo: 38883, rate: 0.3575 },
    { upTo: 78426, rate: 0.3756 },
    { upTo: Infinity, rate: 0.4950 },
  ],
  // algemene heffingskorting
  ahk: { max: 3115, start: 29736, rate: 0.06398, end: 78426 },
  // arbeidskorting (op arbeidsinkomen)
  ak: [
    { from: 0, to: 11965, base: 0, rate: 0.08324 },
    { from: 11965, to: 25845, base: 996, rate: 0.31009 },
    { from: 25845, to: 45592, base: 5300, rate: 0.01950 },
    { from: 45592, to: 132920, base: 5685, rate: -0.06510 },
  ],
  zelfstandigenaftrek: 1200,
  startersaftrek: 2123,
  urencriterium: 1225,
  mkbRate: 0.127,
  // tariefaanpassing aftrekposten: voordeel max 37,56%
  aftrekTarief: 0.3756,
  tariefAanpassing: 0.1194,
  tariefAanpassingGrens: 78426,
  zvwRate: 0.0485,
  zvwMax: 79409,
};

// ---------- Btw ----------
export const BTW = { hoog: 0.21, laag: 0.09, nul: 0, korGrens: 20000 };
