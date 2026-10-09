// Boekhoudprogramma-match: transparante, deterministische rangorde.
// Gebruikt NOOIT het veld `partner` (affiliate). Zie test/match.test.js.

export const VRAGEN = {
  rechtsvorm: [['eenmanszaak', 'Eenmanszaak / zzp'], ['vof', 'Vof of maatschap'], ['bv', 'Bv (of holding)']],
  facturen: [[2, '0–2'], [5, '3–5'], [10, '6–10'], [25, '11–25'], [100, '26–100'], [250, 'meer dan 100']],
  uitgaven: [[5, '0–5'], [10, '6–10'], [20, '11–20'], [50, '21–50'], [150, 'meer dan 50']],
  btw: [['plichtig', 'Ik doe btw-aangifte'], ['kor', 'Ik gebruik de KOR (geen btw-aangifte)']],
  bank: [['auto', 'Ja, automatisch inlezen'], ['maakt-niet-uit', 'Niet nodig, handmatig importeren mag']],
  ib: [['zelf', 'Zelf doen'], ['hulp', 'Graag hulp of controle in het pakket'], ['uitbesteden', 'Volledig laten doen door een boekhouder']],
  budget: [[0, 'Gratis'], [10, 'Tot € 10'], [20, 'Tot € 20'], [30, 'Tot € 30'], [50, 'Tot € 50'], [Infinity, 'Maakt niet uit']],
};

export const PUNTEN = {
  btwDirect: 8, btwJa: 6, btwHandmatig: 2, bankAuto: 5, eigenRekening: -5,
  extraJa: 3, extraOnbekend: -3, extraNee: -10, ibMatch: 10, ibVolledig: 20, ibEigenBoekhouder: 8,
  rechtsvormOnbekend: -8,
};

/** Schat volumes uit de antwoorden. Elke factuur, uitgave en banktransactie telt als boeking. */
export function volumes({ facturen, uitgaven }) {
  const transacties = facturen + uitgaven + 3; // + btw-betaling, privé-opname, bankkosten
  const boekingenMaand = facturen + uitgaven + transacties;
  return { facturen, uitgaven, transacties, boekingenMaand, boekingenJaar: boekingenMaand * 12 };
}

const fmt = (x) => (x === Infinity ? 'onbeperkt' : String(x));
const euro = (x) => '€ ' + x.toFixed(2).replace('.', ',');

/** Beoordeel één pakket voor één gebruiker. */
export function beoordeel(aanbieder, plan, a) {
  const v = volumes(a);
  const plus = [], let_op = [], nee = [];
  let prijs = plan.prijs;
  let score = 0;
  let subgroep = 0;

  if (plan.boekhouding === false) nee.push('Geen boekhouding in dit pakket (alleen factureren).');
  const rv = plan.rechtsvormen ?? aanbieder.rechtsvormen;
  if (rv && !rv.includes(a.rechtsvorm)) nee.push(`Niet voor ${a.rechtsvorm === 'bv' ? 'een bv' : a.rechtsvorm === 'vof' ? 'een vof' : 'een eenmanszaak'}.`);
  else if (!rv && a.rechtsvorm !== 'eenmanszaak') { let_op.push('Of je rechtsvorm wordt ondersteund staat niet op de prijspagina.'); score += PUNTEN.rechtsvormOnbekend; }

  if (plan.perFactuur) { prijs += plan.perFactuur * v.facturen; let_op.push(`Facturen kosten ${euro(plan.perFactuur)} per stuk (bij ${v.facturen} facturen: ${euro(plan.perFactuur * v.facturen)} p/m).`); }
  if (plan.facturen !== undefined && v.facturen > plan.facturen) nee.push(plan.facturen === 0 ? 'Geen verkoopfacturen in dit pakket.' : `Max. ${plan.facturen} facturen per maand.`);
  if (plan.uitgaven !== undefined && v.uitgaven > plan.uitgaven) nee.push(`Max. ${plan.uitgaven} uitgaven/boekingen per maand.`);
  if (plan.transacties !== undefined && v.transacties > plan.transacties) nee.push(`Max. ${plan.transacties} banktransacties per maand (jij: ca. ${v.transacties}).`);
  if (plan.boekingenMaand !== undefined && v.boekingenMaand > plan.boekingenMaand) nee.push(`Max. ${plan.boekingenMaand} boekingen per maand (jij: ca. ${v.boekingenMaand}).`);
  if (plan.boekingenJaar !== undefined && v.boekingenJaar > plan.boekingenJaar) nee.push(`Max. ${plan.boekingenJaar} boekingen per jaar (jij: ca. ${v.boekingenJaar}).`);

  if (plan.omzetMax) let_op.push(`Pakket is voor een omzet tot € ${plan.omzetMax.toLocaleString('nl-NL')} per jaar.`);

  if (plan.viaBoekhouder && a.ib === 'zelf') nee.push('Bedoeld voor samenwerking met een boekhouder; niet om zelf te boekhouden.');

  if (a.btw === 'plichtig') {
    const b = plan.btwAangifte;
    if (b === false) nee.push('Geen btw-aangifte.');
    else if (b === 'direct') { score += PUNTEN.btwDirect; plus.push('Btw-aangifte direct indienen vanuit het pakket.'); }
    else if (b === 'ja') { score += PUNTEN.btwJa; plus.push('Btw-aangifte zit erin (of je rechtstreeks indient, staat niet op de prijspagina).'); }
    else if (b === 'boekhouder') { score += PUNTEN.btwJa; plus.push('Btw-aangifte via je boekhouder.'); }
    else { score += PUNTEN.btwHandmatig; let_op.push(b === 'handmatig' ? 'Btw wordt berekend, maar je dient de aangifte zelf in bij de Belastingdienst.' : 'Alleen een btw-overzicht; aangifte doe je zelf.'); }
  }

  if (a.bank === 'auto') {
    if (plan.bank === 'auto') { score += PUNTEN.bankAuto; plus.push('Automatische bankkoppeling.'); }
    else if (plan.bank === 'auto-extra') { score += PUNTEN.bankAuto; prijs += plan.bankExtra; plus.push(`Automatische bankkoppeling (+ ${euro(plan.bankExtra)} p/m, meegeteld in de prijs).`); }
    else if (aanbieder.eigenRekening) { score += PUNTEN.eigenRekening; let_op.push(`Automatisch alleen met de eigen zakelijke rekening van ${aanbieder.naam}; je huidige bank importeer je handmatig.`); }
    else nee.push('Geen automatische bankkoppeling.');
  }

  for (const [k, label] of [['offertes', 'Offertes'], ['uren', 'Urenregistratie']]) {
    if (!a.extra?.includes(k)) continue;
    const w = plan[k];
    if (w === true) { score += PUNTEN.extraJa; plus.push(`${label} inbegrepen.`); }
    else if (w === 'beperkt') { let_op.push(`${label} beperkt in dit pakket.`); }
    else if (w === false) { score += PUNTEN.extraNee; let_op.push(`${label} niet in dit pakket.`); }
    else { score += PUNTEN.extraOnbekend; let_op.push(`${label}: niet te verifiëren op de prijspagina.`); }
  }

  if (a.ib === 'hulp') {
    if (plan.ib === 'controle' || plan.ib === 'inclusief') { score += PUNTEN.ibMatch; plus.push(plan.ib === 'inclusief' ? 'Boekhouder doet je aangifte inkomstenbelasting.' : 'Aangifte inkomstenbelasting wordt gecontroleerd/voorbereid in het pakket.'); }
    else if (plan.ib === 'eigen-boekhouder') { score += PUNTEN.ibEigenBoekhouder; let_op.push('Werkt samen met jouw eigen boekhouder; diens kosten komen erbij.'); }
    else if (plan.ib === 'rapportage') let_op.push('Pakket maakt een overzicht voor je IB-aangifte; invullen doe je zelf.');
    else if (plan.ib === null) let_op.push('Hulp bij de IB-aangifte: niet per pakket te verifiëren.');
    else let_op.push('Geen hulp bij de aangifte inkomstenbelasting.');
  } else if (a.ib === 'uitbesteden') {
    if (plan.ib === 'inclusief') { score += PUNTEN.ibVolledig; plus.push('Boekhouder inbegrepen (btw- en IB-aangifte).'); }
    else if (plan.ib === 'eigen-boekhouder') { score += PUNTEN.ibEigenBoekhouder; subgroep = 1; let_op.push('Gemaakt voor samenwerking met je eigen boekhouder. De prijs is exclusief de kosten van die boekhouder, dus niet te vergelijken met een pakket waar de boekhouder al in zit.'); }
    else nee.push('Geen boekhouder inbegrepen (je wilt het volledig uitbesteden).');
  }

  const binnenBudget = prijs <= a.budget + 1e-9;
  if (!binnenBudget) let_op.push(`Boven je budget (${euro(prijs)} p/m).`);
  score += 100 - prijs; // goedkoper = hoger; elke euro p/m telt even zwaar
  return { aanbieder: aanbieder.id, naam: aanbieder.naam, plan: plan.id, planNaam: plan.naam, prijs, prijsJaar: plan.prijsJaar ?? null, score: Math.round(score * 100) / 100, subgroep, past: nee.length === 0, binnenBudget, plus, let_op, nee, volumes: v };
}

const groep = (r) => (r.past ? (r.binnenBudget ? 0 : 1) : 2);
export function vergelijk(x, y) {
  return groep(x) - groep(y) || x.subgroep - y.subgroep || y.score - x.score || x.prijs - y.prijs || x.naam.localeCompare(y.naam) || x.planNaam.localeCompare(y.planNaam);
}

/** Beste pakket per aanbieder, aanbieders gesorteerd. */
export function match(pakketten, antwoorden) {
  const a = normaliseer(antwoorden);
  const perAanbieder = pakketten.map((aanb) => {
    const r = aanb.plannen.map((p) => beoordeel(aanb, p, a)).sort(vergelijk);
    return { ...r[0], alternatieven: r.slice(1).filter((x) => x.past).map((x) => `${x.planNaam} (${euro(x.prijs)})`) };
  });
  return perAanbieder.sort(vergelijk);
}

export function normaliseer(a) {
  const n = (x, d) => (x === undefined || x === null || x === '' ? d : Number(x));
  return {
    rechtsvorm: a.rechtsvorm || 'eenmanszaak',
    facturen: n(a.facturen, 5), uitgaven: n(a.uitgaven, 10),
    btw: a.btw || 'plichtig', bank: a.bank || 'auto', ib: a.ib || 'zelf',
    extra: Array.isArray(a.extra) ? a.extra : String(a.extra || '').split(',').filter(Boolean),
    budget: a.budget === 'Infinity' || a.budget === undefined || a.budget === '' ? Infinity : Number(a.budget),
  };
}
export { fmt };
