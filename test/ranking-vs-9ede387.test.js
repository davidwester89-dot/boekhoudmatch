import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PAKKETTEN as NU } from '../src/lib/pakketten.js';
import { PAKKETTEN as OUD } from './fixtures/pakketten-9ede387.js';
import { match, VRAGEN } from '../src/lib/match.js';

const verwacht = JSON.parse(readFileSync(new URL('./fixtures/ranking-9ede387-vs-v2.expected.json', import.meta.url), 'utf8'));
const EXTRAS = [[], ['offertes'], ['uren'], ['offertes', 'uren']];

function *profielen() {
  for (const [rechtsvorm] of VRAGEN.rechtsvorm)
  for (const [facturen] of VRAGEN.facturen)
  for (const [uitgaven] of VRAGEN.uitgaven)
  for (const [btw] of VRAGEN.btw)
  for (const [bank] of VRAGEN.bank)
  for (const [ib] of VRAGEN.ib)
  for (const [budget] of VRAGEN.budget)
  for (const extra of EXTRAS) {
    yield { rechtsvorm, facturen, uitgaven, btw, bank, ib, budget, extra };
  }
}

const volgorde = (res) => res.map((r) => `${r.aanbieder}/${r.plan}`).join(' > ');
const top3past = (res) => res.filter((r) => r.past).slice(0, 3).map((r) => `${r.aanbieder}/${r.plan}`);
const planPrijs = (res) => res.map((r) => `${r.aanbieder}:${r.plan}:${r.prijs}`).sort().join('|');

function diffs() {
  const shifts = [];
  let inputs = 0, orderChanged = 0, top3PastChanged = 0, planOrPriceChanged = 0, anyChanged = 0, orderChangedNoExtras = 0;
  for (const a of profielen()) {
    inputs++;
    const voor = match(OUD, a), na = match(NU, a);
    const o = volgorde(voor) !== volgorde(na);
    const t = top3past(voor).join('>') !== top3past(na).join('>');
    const p = planPrijs(voor) !== planPrijs(na);
    if (o) orderChanged++;
    if (t) top3PastChanged++;
    if (p) planOrPriceChanged++;
    if (o && a.extra.length === 0) orderChangedNoExtras++;
    if (o || t || p) {
      anyChanged++;
      const prof = { ...a, budget: a.budget === Infinity ? 'geen' : a.budget };
      shifts.push([prof, voor.map((r) => `${r.aanbieder}/${r.plan}`), na.map((r) => `${r.aanbieder}/${r.plan}`)]);
    }
  }
  return { inputs, summary: { orderChanged, top3PastChanged, planOrPriceChanged, anyChanged, orderChangedNoExtras }, shifts };
}

test('ranking vs directe parent 9ede387, inclusief extra-wensen: verwachte verschuivingen (inStap.offertes)', () => {
  const { inputs, summary, shifts } = diffs();
  assert.equal(inputs, verwacht.inputs);
  assert.deepEqual(summary, verwacht.summary);
  const sha = createHash('sha256').update(shifts.map((s) => JSON.stringify(s)).join('\n')).digest('hex');
  assert.equal(sha, verwacht.shiftsSha256);
  const g = verwacht.groei.a;
  const voor = match(OUD, g), na = match(NU, g);
  assert.deepEqual(top3past(voor), verwacht.groei.voorTop3past);
  assert.deepEqual(top3past(na), verwacht.groei.naTop3past);
});
