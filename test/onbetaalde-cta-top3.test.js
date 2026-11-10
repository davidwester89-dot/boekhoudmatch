// Vaste regel: per matchprofiel geen onbetaalde commerciële CTA in de top 3, of exact rapporteren.
// Onbetaalde CTA = uitgaand() zonder partnerlink en zonder neutrale bronlink.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { uitgaand } from '../src/lib/partnerlinks.js';
import { match, VRAGEN } from '../src/lib/match.js';

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

const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));
const soort = (id) => {
  const u = uitgaand(byId[id]);
  if (u.partner) return 'betaald';
  if (u.bron) return 'bronlink';
  return 'onbetaalde-cta';
};

function inventaris() {
  const merken = Object.fromEntries(PAKKETTEN.map((a) => [a.id, soort(a.id)]));
  const byBrand = {};
  const byCombo = {};
  let n = 0, metOnbetaald = 0, snelstartOnbetaald = 0;
  for (const a of profielen()) {
    n++;
    const top3 = match(PAKKETTEN, a).slice(0, 3).map((r) => r.aanbieder);
    const unpaid = [...new Set(top3.filter((id) => merken[id] === 'onbetaalde-cta'))];
    if (unpaid.length) {
      metOnbetaald++;
      for (const id of unpaid) byBrand[id] = (byBrand[id] || 0) + 1;
      const key = unpaid.slice().sort().join('+');
      byCombo[key] = (byCombo[key] || 0) + 1;
    }
    if (top3.includes('snelstart') && merken.snelstart === 'onbetaalde-cta') snelstartOnbetaald++;
  }
  return {
    inputs: n,
    merken,
    profilesWithUnpaidCtaInTop3: metOnbetaald,
    snelstartUnpaidCtaInTop3: snelstartOnbetaald,
    byBrand,
    byCombo,
  };
}

test('SnelStart is bronlink, dus nooit een onbetaalde CTA in de top 3', () => {
  assert.equal(soort('snelstart'), 'bronlink');
  assert.equal(soort('jortt'), 'betaald');
});

test('onbetaalde CTA in top 3: 0 of exact de vastgelegde inventaris', () => {
  const got = inventaris();
  const expected = JSON.parse(readFileSync(new URL('./fixtures/onbetaalde-cta-top3.expected.json', import.meta.url), 'utf8'));
  assert.equal(got.inputs, 25920);
  assert.equal(got.snelstartUnpaidCtaInTop3, 0);
  assert.equal(got.merken.snelstart, 'bronlink');
  assert.deepEqual(got, expected);
});
