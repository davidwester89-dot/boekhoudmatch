// Einde salderen: wat kost het? Vergelijkt 2026 (met saldering) met 2027 (zonder).
// Vaste kosten (netbeheer, vastrecht, vermindering energiebelasting) veranderen niet door het einde van
// salderen en laten we daarom weg: we vergelijken alleen de kWh-gerelateerde posten.
import { ENERGY } from './constants.js';

const r2 = (x) => Math.round(x * 100) / 100;

/** Van all-in kWh-prijs (incl. EB en btw, zoals op je contract) naar kale leveringsprijs excl. btw. */
export function kaalUitAllIn(allInInclBtw, year = 2026) {
  return allInInclBtw / (1 + ENERGY.btw) - ENERGY.eb[year].perKwh;
}
export function allInUitKaal(kaalExBtw, year = 2026) {
  return (kaalExBtw + ENERGY.eb[year].perKwh) * (1 + ENERGY.btw);
}
export function minimumVergoeding(kaalExBtw) {
  return ENERGY.minVergoedingFactor * kaalExBtw;
}

/**
 * @param {object} i
 * @param {number} i.afname              kWh van het net per jaar (jaarafrekening, normaal + dal)
 * @param {number} i.teruglevering       kWh teruggeleverd per jaar
 * @param {number} i.kaalExBtw           kale leveringsprijs €/kWh excl. btw (zelfde in 2026 en 2027 aangenomen)
 * @param {number} i.vergoeding2026      vergoeding €/kWh voor overschot boven afname in 2026
 * @param {number} i.terugleverkosten2026Kwh  terugleverkosten 2026 €/kWh (op alle teruglevering)
 * @param {number} i.terugleverkosten2026Vast terugleverkosten 2026 € per jaar (vast deel)
 * @param {number} i.vergoeding2027      bruto terugleververgoeding 2027 €/kWh
 * @param {number} i.terugleverkosten2027 terugleverkosten 2027 €/kWh (wettelijk per kWh uitgedrukt)
 */
export function vergelijkSalderen(i) {
  const A = Math.max(0, +i.afname || 0);
  const T = Math.max(0, +i.teruglevering || 0);
  const kaal = +i.kaalExBtw || 0;
  const p26 = allInUitKaal(kaal, 2026);
  const p27 = allInUitKaal(kaal, 2027);

  // 2026: salderen. Gesaldeerde kWh tegen volle prijs; overschot krijgt (lage) vergoeding.
  const gesaldeerd = Math.min(A, T);
  const nettoAfname = A - gesaldeerd;
  const overschot = T - gesaldeerd;
  const kosten2026 =
    nettoAfname * p26 - overschot * (+i.vergoeding2026 || 0) +
    T * (+i.terugleverkosten2026Kwh || 0) + (+i.terugleverkosten2026Vast || 0);

  // 2027: geen salderen. Alle afname tegen volle prijs, alle teruglevering tegen vergoeding minus kosten.
  const v27 = +i.vergoeding2027 || 0;
  const k27 = +i.terugleverkosten2027 || 0;
  const kosten2027 = A * p27 - T * v27 + T * k27;

  const minVerg = minimumVergoeding(kaal);
  return {
    prijs2026: p26, prijs2027: p27,
    gesaldeerd, nettoAfname, overschot,
    kosten2026: r2(kosten2026), kosten2027: r2(kosten2027),
    verschil: r2(kosten2027 - kosten2026),
    nettoTerugleverWaarde2027: v27 - k27,
    minimumVergoeding: minVerg,
    vergoedingOnderMinimum: v27 + 1e-9 < minVerg,
    // waarde van 1 kWh extra eigen verbruik in 2027 (i.p.v. terugleveren)
    waardeEigenVerbruikPerKwh: p27 - (v27 - k27),
  };
}

/** Wat levert het op om X kWh van je teruglevering zelf te gebruiken (in 2027)? */
export function besparingMeerEigenVerbruik(res, kwh) {
  return r2(kwh * res.waardeEigenVerbruikPerKwh);
}
