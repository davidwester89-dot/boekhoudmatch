// 'Dit verandert je top-3': vergelijkt de top-3 vóór en na één antwoord. Alleen op basis van de match-uitslag
// (die nooit partnerlinks gebruikt); deze functie kent alleen namen en volgorde.
const lijst = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} en ${xs.at(-1)}`);
/** oud/nieuw: arrays met namen in volgorde (max. 3). Geeft { veranderd, tekst }. */
export function top3Verschil(oud, nieuw) {
  const o = oud.slice(0, 3), n = nieuw.slice(0, 3);
  const erin = n.filter((x) => !o.includes(x)), eruit = o.filter((x) => !n.includes(x));
  const delen = [];
  if (erin.length) delen.push(`${lijst(erin)} ${erin.length > 1 ? 'komen' : 'komt'} erin`);
  if (eruit.length) delen.push(`${lijst(eruit)} ${eruit.length > 1 ? 'vallen' : 'valt'} eruit`);
  if (n[0] && n[0] !== o[0]) delen.push(`nieuwe nummer 1: ${n[0]}`);
  else if (!erin.length && !eruit.length && n.join() !== o.join()) delen.push('de volgorde verschuift');
  if (!n.length && o.length) return { veranderd: true, tekst: 'Dit verandert je top-3: er past nu geen pakket meer bij al je wensen.' };
  if (!delen.length) return { veranderd: false, tekst: 'Je top-3 blijft gelijk.' };
  const t = delen.join('; ');
  return { veranderd: true, tekst: `Dit verandert je top-3: ${t}.` };
}
