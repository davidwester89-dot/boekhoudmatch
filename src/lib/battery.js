// Thuisbatterij: uur-voor-uur simulatie over een representatief jaar (8.760 uur).
// Data: verbruiksprofiel MFFBAS/NEDU E1A 2025, zonprofiel PVGIS De Bilt (gem. 2018-2023),
// EPEX day-ahead NL 2025. Sturing: zelfverbruik (laden met zonne-overschot, ontladen bij verbruik).
// Handelen op prijsverschillen (laden van het net) rekenen we bewust NIET mee.
import { ENERGY } from './constants.js';

const r2 = (x) => Math.round(x * 100) / 100;

/** Zet het compacte JSON-formaat om naar Float64Arrays. */
export function decodeHourly(json) {
  const n = json.load.length;
  const load = new Float64Array(n), pv = new Float64Array(n), price = new Float64Array(n);
  let sl = 0, sp = 0;
  for (let h = 0; h < n; h++) { sl += json.load[h]; sp += json.pv[h]; }
  for (let h = 0; h < n; h++) {
    load[h] = json.load[h] / sl;     // fractie van jaarverbruik
    pv[h] = json.pv[h] / sp;         // fractie van jaaropwek
    price[h] = json.price[h] / 1e4;  // EPEX €/kWh excl. btw
  }
  return { n, load, pv, price, meta: json.meta };
}

/**
 * Bouw prijsfuncties per uur.
 * contract.type 'vast': afname = allIn (incl. EB, btw); teruglevering = vergoeding - terugleverkosten.
 * contract.type 'dynamisch': afname = (epex + opslag + EB) * 1,21; teruglevering = epex*(btwFactor) + bonus - kosten.
 */
export function prijsModel(contract, year = 2027) {
  const eb = ENERGY.eb[year].perKwh, btw = ENERGY.btw;
  if (contract.type === 'dynamisch') {
    const opslag = +contract.inkoopOpslag || 0;            // €/kWh excl. btw
    const terugBtw = contract.terugleveringInclBtw ? 1 + btw : 1;
    const kosten = +contract.terugleverkosten || 0;         // €/kWh
    return {
      afname: (epex) => (epex + opslag + eb) * (1 + btw),
      terug: (epex) => epex * terugBtw - kosten,
    };
  }
  const allIn = +contract.allIn || 0;
  const netTerug = (+contract.vergoeding || 0) - (+contract.terugleverkosten || 0);
  return { afname: () => allIn, terug: () => netTerug };
}

/**
 * Simuleer één jaar.
 * @param {object} d   uitvoer van decodeHourly
 * @param {object} p
 * @param {number} p.verbruik     totaal stroomverbruik huishouden kWh/jaar (incl. eigen zonnestroom)
 * @param {number} p.opwek        zonnestroom kWh/jaar
 * @param {number} p.capaciteit   bruikbare batterijcapaciteit kWh (0 = geen batterij)
 * @param {number} p.vermogen     max. laad/ontlaadvermogen kW
 * @param {number} p.rendement    round-trip rendement (0-1)
 * @param {object} p.contract     zie prijsModel
 */
export function simuleer(d, p) {
  const loadArr = p.loadProfiel || d.load;
  const pm = prijsModel(p.contract, p.year || 2027);
  const cap = Math.max(0, +p.capaciteit || 0);
  const pw = Math.max(0, +p.vermogen || 0);
  const eta = Math.sqrt(Math.min(1, Math.max(0.5, +p.rendement || 0.9))); // per richting
  let soc = 0;
  let afname = 0, terug = 0, eigen = 0, uitBatterij = 0, inBatterij = 0, kosten = 0;
  for (let h = 0; h < d.n; h++) {
    const L = loadArr[h] * p.verbruik;
    const S = d.pv[h] * p.opwek;
    const direct = Math.min(L, S);
    let surplus = S - direct;
    let tekort = L - direct;
    if (cap > 0) {
      if (surplus > 0) {
        const charge = Math.min(surplus, pw, (cap - soc) / eta);
        soc += charge * eta; surplus -= charge; inBatterij += charge;
      }
      if (tekort > 0) {
        const dis = Math.min(tekort, pw, soc * eta);
        soc -= dis / eta; tekort -= dis; uitBatterij += dis;
      }
    }
    eigen += direct;
    afname += tekort; terug += surplus;
    const e = d.price[h];
    kosten += tekort * pm.afname(e) - surplus * pm.terug(e);
  }
  return {
    afname: r2(afname), teruglevering: r2(terug), directEigenVerbruik: r2(eigen),
    uitBatterij: r2(uitBatterij), inBatterij: r2(inBatterij),
    zelfconsumptie: p.opwek > 0 ? (eigen + inBatterij) / p.opwek : 0,
    cycli: cap > 0 ? uitBatterij / cap : 0,
    kosten: r2(kosten),
  };
}

/**
 * Terugverdientijd met degradatie en optionele prijsstijging.
 * @returns {{besparingJaar1:number, terugverdienJaar:number|null, cumulatief:number[]}}
 */
export function terugverdientijd({ besparingJaar1, investering, levensduur = 15, degradatie = 0.02, prijsstijging = 0 }) {
  const cum = []; let tot = 0, jaar = null;
  for (let y = 1; y <= levensduur; y++) {
    const s = besparingJaar1 * Math.pow(1 - degradatie, y - 1) * Math.pow(1 + prijsstijging, y - 1);
    const prev = tot; tot += s; cum.push(r2(tot));
    if (jaar === null && tot >= investering) jaar = r2(y - 1 + (investering - prev) / s);
  }
  return { besparingJaar1: r2(besparingJaar1), terugverdienJaar: jaar, cumulatief: cum };
}

export function batterijAnalyse(d, p) {
  const zonder = simuleer(d, { ...p, capaciteit: 0 });
  const met = simuleer(d, p);
  const besparing = zonder.kosten - met.kosten;
  const tv = terugverdientijd({ besparingJaar1: besparing, investering: +p.investering || 0, levensduur: p.levensduur ?? 15, degradatie: p.degradatie ?? 0.02, prijsstijging: p.prijsstijging ?? 0 });
  return { zonder, met, besparing: r2(besparing), ...tv };
}

/**
 * Kalibratie. Een standaardprofiel is een gemiddelde van veel huishoudens en dus "gladder" dan één echt
 * huishouden; daardoor lijkt direct eigen verbruik hoger dan in werkelijkheid (Milieu Centraal: ~30%).
 * We verschuiven daarom per dag een deel (alpha) van het verbruik in zonuren naar de uren zonder zon,
 * tot het directe eigen verbruik (zonder batterij) gelijk is aan het doel.
 */
export function verschovenProfiel(d, alpha) {
  const out = new Float64Array(d.n);
  for (let day = 0; day < d.n; day += 24) {
    let dagMassa = 0, nachtMassa = 0;
    for (let h = day; h < day + 24 && h < d.n; h++) {
      if (d.pv[h] > 0) dagMassa += d.load[h]; else nachtMassa += d.load[h];
    }
    for (let h = day; h < day + 24 && h < d.n; h++) {
      if (d.pv[h] > 0) out[h] = d.load[h] * (1 - alpha);
      else out[h] = nachtMassa > 0 ? d.load[h] * (1 + alpha * dagMassa / nachtMassa) : d.load[h];
    }
  }
  return out;
}

export function directZelfverbruik(d, verbruik, opwek, profiel) {
  if (!(opwek > 0)) return 0;
  let eigen = 0;
  for (let h = 0; h < d.n; h++) eigen += Math.min(profiel[h] * verbruik, d.pv[h] * opwek);
  return eigen / opwek;
}

/** Zoek alpha zodat direct zelfverbruik ≈ doel (0-1). Geeft profiel + bereikt percentage. */
export function kalibreerProfiel(d, verbruik, opwek, doel) {
  const f = (a) => directZelfverbruik(d, verbruik, opwek, verschovenProfiel(d, a));
  const max = f(0), min = f(1);
  if (!(doel > 0) || doel >= max) return { alpha: 0, profiel: d.load, bereikt: max, max, min };
  if (doel <= min) return { alpha: 1, profiel: verschovenProfiel(d, 1), bereikt: min, max, min };
  let lo = 0, hi = 1;
  for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (f(m) > doel) lo = m; else hi = m; }
  const profiel = verschovenProfiel(d, hi);
  return { alpha: hi, profiel, bereikt: directZelfverbruik(d, verbruik, opwek, profiel), max, min };
}
