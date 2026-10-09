// Netto-inkomen zzp'er en uurtarief, belastingjaar 2026.
// Vereenvoudigingen (staan ook op de pagina): jonger dan AOW-leeftijd, geen fiscale partner,
// geen box 2/3, geen eigen woning, geen niet-gerealiseerde zelfstandigenaftrek uit eerdere jaren.
import { IB2026 } from './constants.js';

const r2 = (x) => Math.round(x * 100) / 100;

export function box1Tax(income, P = IB2026) {
  let tax = 0, prev = 0;
  for (const b of P.brackets) {
    if (income <= prev) break;
    const part = Math.min(income, b.upTo) - prev;
    tax += part * b.rate;
    prev = b.upTo;
  }
  return Math.max(0, tax);
}

export function algemeneHeffingskorting(verzamelinkomen, P = IB2026) {
  const { max, start, rate, end } = P.ahk;
  if (verzamelinkomen < start) return max;
  if (verzamelinkomen >= end) return 0;
  return Math.max(0, max - rate * (verzamelinkomen - start));
}

export function arbeidskorting(arbeidsinkomen, P = IB2026) {
  if (arbeidsinkomen <= 0) return 0;
  for (const s of P.ak) {
    if (arbeidsinkomen < s.to) return Math.max(0, s.base + s.rate * (arbeidsinkomen - s.from));
  }
  return 0;
}

/**
 * @param {object} i
 * @param {number} i.winst            winst uit onderneming vóór ondernemersaftrek (omzet - kosten - afschrijvingen)
 * @param {boolean} i.urencriterium   voldoet aan 1.225 uur
 * @param {boolean} i.starter         recht op startersaftrek
 * @param {number} [i.inkomensvoorzieningen] aftrekbare premies AOV + lijfrente (binnen jaarruimte)
 */
export function zzpNetto(i, P = IB2026) {
  const winst = Number(i.winst) || 0;
  const uren = !!i.urencriterium;
  const starter = uren && !!i.starter;
  const voorz = Math.max(0, Number(i.inkomensvoorzieningen) || 0);

  let zelfst = uren ? P.zelfstandigenaftrek : 0;
  if (!starter) zelfst = Math.min(zelfst, Math.max(0, winst)); // max winst, tenzij starter
  const startersaftrek = starter ? P.startersaftrek : 0;
  const ondernemersaftrek = zelfst + startersaftrek;
  const winstNaOA = winst - ondernemersaftrek;
  const mkb = P.mkbRate * winstNaOA; // bij verlies verkleint dit het verlies
  const belastbareWinst = winstNaOA - mkb;

  const belastbaarBox1 = belastbareWinst - voorz;
  const brutoBelasting = box1Tax(Math.max(0, belastbaarBox1), P);

  // tariefaanpassing ondernemersfaciliteiten (aftrekposten in hoogste schijf max 37,56%)
  const aftrekposten = Math.max(0, ondernemersaftrek + mkb);
  const inkomenVoorAftrek = belastbaarBox1 + aftrekposten;
  const tariefAanpassing = P.tariefAanpassing *
    Math.min(aftrekposten, Math.max(0, inkomenVoorAftrek - P.tariefAanpassingGrens));

  const ahk = algemeneHeffingskorting(Math.max(0, belastbaarBox1), P);
  const ak = arbeidskorting(winst, P); // arbeidsinkomen = winst vóór OA en mkb
  const belastingVoorKorting = brutoBelasting + tariefAanpassing;
  const kortingen = Math.min(ahk + ak, belastingVoorKorting);
  const inkomstenbelasting = belastingVoorKorting - kortingen;

  const zvw = P.zvwRate * Math.min(Math.max(0, belastbareWinst), P.zvwMax);
  const totaalBelasting = inkomstenbelasting + zvw;
  const netto = winst - totaalBelasting; // vóór betaalde AOV/lijfrente-premies
  const nettoNaVoorzieningen = netto - voorz;

  return {
    winst: r2(winst), zelfstandigenaftrek: r2(zelfst), startersaftrek: r2(startersaftrek),
    ondernemersaftrek: r2(ondernemersaftrek), mkbVrijstelling: r2(mkb), belastbareWinst: r2(belastbareWinst),
    inkomensvoorzieningen: r2(voorz), belastbaarBox1: r2(belastbaarBox1),
    brutoBelasting: r2(brutoBelasting), tariefAanpassing: r2(tariefAanpassing),
    algemeneHeffingskorting: r2(ahk), arbeidskorting: r2(ak), toegepasteKortingen: r2(kortingen),
    inkomstenbelasting: r2(inkomstenbelasting), zvw: r2(zvw), totaalBelasting: r2(totaalBelasting),
    netto: r2(netto), nettoNaVoorzieningen: r2(nettoNaVoorzieningen),
    nettoPerMaand: r2(nettoNaVoorzieningen / 12),
    effectiefTarief: winst > 0 ? totaalBelasting / winst : 0,
  };
}

/** Netto loon in loondienst (vereenvoudigd: jaarbasis, geen bijtelling, Zvw betaalt werkgever). */
export function loondienstNetto({ brutoJaar, pensioenWerknemer = 0 }, P = IB2026) {
  const loon = Math.max(0, brutoJaar - pensioenWerknemer);
  const tax = box1Tax(loon, P);
  const k = Math.min(tax, algemeneHeffingskorting(loon, P) + arbeidskorting(loon, P));
  const lb = tax - k;
  return { belastbaarLoon: r2(loon), loonheffing: r2(lb), netto: r2(brutoJaar - pensioenWerknemer - lb) };
}

/** Zoek winst waarbij nettoNaVoorzieningen == doelNetto (bisectie; netto stijgt monotoon met winst). */
export function winstVoorNetto(doelNetto, opts = {}, P = IB2026) {
  let lo = 0, hi = 1_000_000;
  const f = (w) => zzpNetto({ ...opts, winst: w }, P).nettoNaVoorzieningen;
  if (f(hi) < doelNetto) return NaN;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < doelNetto) lo = mid; else hi = mid;
  }
  return Math.round(hi * 100) / 100;
}

/**
 * Uurtarief: welk tarief (excl. btw) heb je nodig?
 * @param {object} i
 * @param {number} i.doelNettoMaand  netto per maand dat je wilt overhouden (na AOV en pensioeninleg)
 * @param {number} i.kostenJaar      zakelijke kosten per jaar (excl. btw)
 * @param {number} i.aovMaand        AOV-premie per maand
 * @param {number} i.pensioenMaand   lijfrente/pensioeninleg per maand
 * @param {number} i.werkweken       weken per jaar dat je werkt
 * @param {number} i.urenPerWeek     totaal gewerkte uren per week
 * @param {number} i.declarabelPct   deel van de uren dat je kunt factureren (0-1)
 * @param {boolean} i.starter
 */
export function uurtarief(i, P = IB2026) {
  const totaalUren = i.werkweken * i.urenPerWeek;
  const declarabel = totaalUren * i.declarabelPct;
  const urencriterium = totaalUren >= P.urencriterium;
  const voorz = 12 * ((i.aovMaand || 0) + (i.pensioenMaand || 0));
  const opts = { urencriterium, starter: !!i.starter, inkomensvoorzieningen: voorz };
  const winst = winstVoorNetto(12 * i.doelNettoMaand, opts, P);
  const omzet = winst + (i.kostenJaar || 0);
  const tarief = declarabel > 0 ? omzet / declarabel : NaN;
  const detail = zzpNetto({ ...opts, winst }, P);
  return {
    totaalUren, declarabeleUren: r2(declarabel), urencriterium,
    benodigdeWinst: r2(winst), benodigdeOmzet: r2(omzet),
    uurtariefExBtw: r2(tarief), uurtariefInclBtw: r2(tarief * 1.21),
    detail,
  };
}

/** Loondienst-equivalent: welk zzp-tarief geeft hetzelfde netto als dit salaris? */
export function uurtariefVanuitSalaris(i, P = IB2026) {
  const bruto = i.brutoMaand * 12 * (1 + (i.vakantiegeldPct ?? 0.08)) + (i.dertiendeMaand ? i.brutoMaand : 0);
  const pensWn = bruto * (i.pensioenWerknemerPct || 0);
  const ld = loondienstNetto({ brutoJaar: bruto, pensioenWerknemer: pensWn }, P);
  const res = uurtarief({ ...i, doelNettoMaand: ld.netto / 12 }, P);
  return { loondienst: { brutoJaar: r2(bruto), ...ld }, ...res };
}
