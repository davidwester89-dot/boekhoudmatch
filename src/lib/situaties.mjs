// Situatieblokken: per situatie een vaste, controleerbare regel op de pakketdata. Geen scores of meningen.
// De uitkomst verandert alleen als prijzen of functies in pakketten.js veranderen. Partnerstatus wordt niet gelezen.
import { PAKKETTEN } from './pakketten.js';
import { volumes } from './match.js';

const alle = () => PAKKETTEN.flatMap((a) => a.plannen.map((p) => ({ a, p, prijs: p.prijs + (p.bank === 'auto-extra' ? p.bankExtra : 0) })));
const sorteer = (l) => l.sort((x, y) => x.prijs - y.prijs || x.a.naam.localeCompare(y.a.naam, 'nl'));
const btwOk = (p) => p.btwAangifte === 'direct' || p.btwAangifte === 'ja';
const bankOk = (p) => p.bank === 'auto' || p.bank === 'auto-extra';
const zelf = (p) => p.boekhouding !== false && !p.viaBoekhouder;
// Past het volume van n facturen + n uitgaven per maand (zelfde schatting als de match: transacties en boekingen)?
const ruim = (p, n) => { const v = volumes({ facturen: n, uitgaven: n }); return !p.perFactuur && (p.facturen ?? Infinity) >= v.facturen && (p.uitgaven ?? Infinity) >= v.uitgaven && (p.transacties ?? Infinity) >= v.transacties && (p.boekingenMaand ?? Infinity) >= v.boekingenMaand && (p.boekingenJaar ?? Infinity) >= v.boekingenJaar; };
const geenGrens = (p) => [p.facturen, p.uitgaven, p.transacties, p.boekingenMaand, p.boekingenJaar].every((x) => x === undefined || x === Infinity) && !p.omzetMax && !p.perFactuur;
const noemt = (a, p, rv) => (p.rechtsvormen ?? a.rechtsvormen ?? []).includes(rv);

export const SITUATIES = [
  { id: 'instap', titel: 'Beste instap', regel: 'Goedkoopste pakket waarmee je zelf boekhoudt, btw-aangifte doet en 5 facturen en 5 uitgaven per maand kwijt kunt (met de banktransacties en boekingen die daarbij horen, zoals in de match).',
    filter: ({ p }) => zelf(p) && btwOk(p) && ruim(p, 5) },
  { id: 'uren', titel: 'Beste voor uren', regel: 'Goedkoopste pakket met urenregistratie, btw-aangifte en automatische bankkoppeling (eventuele meerprijs voor de koppeling meegeteld), voor 10 facturen en 10 uitgaven per maand (met de bijbehorende transacties en boekingen).',
    filter: ({ p }) => zelf(p) && p.uren === true && btwOk(p) && bankOk(p) && ruim(p, 10) },
  { id: 'boekhouder', titel: 'Beste met een boekhouder', regel: 'Pakket waarin een boekhouder je btw- en IB-aangifte doet. Daarnaast: het goedkoopste pakket dat gemaakt is voor samenwerking met je eigen boekhouder (diens kosten komen erbij).',
    filter: ({ p }) => p.ib === 'inclusief', extra: ({ p }) => p.ib === 'eigen-boekhouder' },
  { id: 'bv', titel: 'Beste als je naar een bv groeit', regel: 'Goedkoopste pakket waarbij de aanbieder de bv als rechtsvorm noemt, zonder volumegrens en met btw-aangifte.',
    filter: ({ a, p }) => noemt(a, p, 'bv') && geenGrens(p) && btwOk(p) && zelf(p) },
];

/** Per situatie: winnaar, de volgende twee en (bij boekhouder) het alternatief. */
export function situaties() {
  const l = alle();
  return SITUATIES.map((s) => {
    const r = sorteer(l.filter(s.filter));
    return { ...s, top: r[0], volgende: r.slice(1, 3), alt: s.extra ? sorteer(l.filter(s.extra))[0] : null };
  });
}
