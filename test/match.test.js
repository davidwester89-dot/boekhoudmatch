import test from 'node:test';
import assert from 'node:assert/strict';
import { PAKKETTEN, CHECKED } from '../src/lib/pakketten.js';
import { match, beoordeel, volumes, normaliseer } from '../src/lib/match.js';

const basis = { rechtsvorm: 'eenmanszaak', facturen: 5, uitgaven: 10, btw: 'plichtig', bank: 'auto', ib: 'zelf', extra: [], budget: Infinity };
const ids = (r) => r.map((x) => `${x.aanbieder}:${x.plan}`);

test('data: elke aanbieder heeft bron-URL van eigen domein, plannen met prijs, en controledatum', () => {
  assert.equal(CHECKED, '2026-10-08');
  for (const a of PAKKETTEN) {
    const host = new URL(a.site).hostname.replace(/^www\./, '');
    assert.ok(a.bronnen.length > 0, a.id);
    for (const b of a.bronnen) assert.ok(new URL(b.url).hostname.endsWith(host), `${a.id} bron ${b.url} niet van eigen site`);
    for (const p of a.plannen) assert.ok(typeof p.prijs === 'number' && p.prijs >= 0, `${a.id}/${p.id}`);
  }
  assert.equal(PAKKETTEN.length, 8);
});

test('affiliate-status beïnvloedt de rangorde niet', () => {
  const scenarios = [basis, { ...basis, rechtsvorm: 'bv', facturen: 25, uitgaven: 50 }, { ...basis, btw: 'kor', bank: 'maakt-niet-uit', budget: 10 }, { ...basis, ib: 'uitbesteden' }];
  for (const s of scenarios) {
    const a = ids(match(PAKKETTEN, s));
    const geenPartners = PAKKETTEN.map((p) => ({ ...p, partner: null }));
    const allemaalPartner = PAKKETTEN.map((p) => ({ ...p, partner: 'X' }));
    assert.deepEqual(ids(match(geenPartners, s)), a);
    assert.deepEqual(ids(match(allemaalPartner, s)), a);
  }
});

test('volgorde van de invoerlijst maakt niet uit (deterministisch)', () => {
  const a = ids(match(PAKKETTEN, basis));
  const b = ids(match([...PAKKETTEN].reverse(), basis));
  assert.deepEqual(a, b);
});

test('volumes: transacties en boekingen worden geschat uit facturen en uitgaven', () => {
  assert.deepEqual(volumes({ facturen: 5, uitgaven: 10 }), { facturen: 5, uitgaven: 10, transacties: 18, boekingenMaand: 33, boekingenJaar: 396 });
});

test('harde eisen sluiten uit met reden: rechtsvorm, limieten, geen boekhouding', () => {
  const jortt = PAKKETTEN.find((p) => p.id === 'jortt');
  const zzp = jortt.plannen.find((p) => p.id === 'zzp');
  const r = beoordeel(jortt, zzp, normaliseer({ ...basis, rechtsvorm: 'bv' }));
  assert.equal(r.past, false);
  assert.match(r.nee.join(' '), /bv/);
  const starter = jortt.plannen.find((p) => p.id === 'starter');
  assert.equal(beoordeel(jortt, starter, normaliseer(basis)).past, false);
  const eb = PAKKETTEN.find((p) => p.id === 'eboekhouden');
  const ebZzp = eb.plannen.find((p) => p.id === 'zzp');
  assert.equal(beoordeel(eb, ebZzp, normaliseer({ ...basis, facturen: 10, uitgaven: 10 })).past, false); // 43/mnd = 516/jaar > 240
});

test('e-Boekhouden ZZP past bij heel kleine administratie (≤ 240 boekingen/jaar)', () => {
  const eb = PAKKETTEN.find((p) => p.id === 'eboekhouden');
  const ebZzp = eb.plannen.find((p) => p.id === 'zzp');
  // 2 facturen + 5 uitgaven: transacties 10, boekingen 17/mnd = 204/jaar
  const r = beoordeel(eb, ebZzp, normaliseer({ ...basis, facturen: 2, uitgaven: 5 }));
  assert.equal(r.volumes.boekingenJaar, 204);
  assert.equal(r.past, true);
});

test('per aanbieder wordt het goedkoopste passende pakket gekozen', () => {
  const r = match(PAKKETTEN, { ...basis, facturen: 25, uitgaven: 20 });
  const mb = r.find((x) => x.aanbieder === 'moneybird');
  assert.equal(mb.plan, 'groei'); // 25+20+3 = 48 transacties: Start (20) valt af, Groei (50) past
});

test('budget: pakketten boven budget komen na pakketten binnen budget, maar blijven zichtbaar', () => {
  const r = match(PAKKETTEN, { ...basis, budget: 10 });
  const firstOver = r.findIndex((x) => !x.binnenBudget || !x.past);
  assert.ok(r.slice(0, firstOver).every((x) => x.past && x.prijs <= 10));
  assert.ok(r.some((x) => x.past && !x.binnenBudget));
});

test('volledig uitbesteden: pakket met boekhouder inbegrepen scoort extra en wordt genoemd', () => {
  const r = match(PAKKETTEN, { ...basis, ib: 'uitbesteden' });
  const t = r.find((x) => x.aanbieder === 'tellow');
  assert.equal(t.plan, 'compleet');
  assert.equal(r[0].aanbieder, 'tellow'); // boekhouder inbegrepen gaat vóór 'eigen boekhouder (kosten apart)'
  assert.ok(r.filter((x) => x.past).every((x) => ['tellow', 'snelstart'].includes(x.aanbieder)));
  assert.ok(t.plus.some((s) => /Boekhouder inbegrepen/.test(s)));
});

test('zelf boekhouden sluit "alleen via boekhouder"-pakketten uit', () => {
  const sn = PAKKETTEN.find((p) => p.id === 'snelstart');
  const r = beoordeel(sn, sn.plannen.find((p) => p.id === 'instap'), normaliseer(basis));
  assert.equal(r.past, false);
});

test('KOR: btw-aangifte is geen eis, dus geen btw-punten', () => {
  const mb = PAKKETTEN.find((p) => p.id === 'moneybird');
  const start = mb.plannen.find((p) => p.id === 'start');
  const a = beoordeel(mb, start, normaliseer({ ...basis, btw: 'kor', bank: 'maakt-niet-uit', facturen: 2, uitgaven: 5 }));
  const b = beoordeel(mb, start, normaliseer({ ...basis, btw: 'plichtig', bank: 'maakt-niet-uit', facturen: 2, uitgaven: 5 }));
  assert.equal(b.score - a.score, 8);
});

test('meerprijs bankkoppeling en prijs per factuur worden in de prijs meegeteld', () => {
  const inf = PAKKETTEN.find((p) => p.id === 'informer');
  assert.equal(beoordeel(inf, inf.plannen[0], normaliseer({ ...basis, facturen: 2, uitgaven: 5 })).prijs, 16);
  const rs = PAKKETTEN.find((p) => p.id === 'rompslomp');
  assert.equal(beoordeel(rs, rs.plannen[0], normaliseer({ ...basis, facturen: 5, uitgaven: 5, bank: 'maakt-niet-uit' })).prijs, 7.5);
});

test('onbekende functies worden als onbekend gemeld, niet als "ja"', () => {
  const ex = PAKKETTEN.find((p) => p.id === 'exact');
  const r = beoordeel(ex, ex.plannen[1], normaliseer({ ...basis, extra: ['offertes', 'uren'] }));
  assert.ok(r.let_op.filter((s) => /niet te verifiëren/.test(s)).length === 2);
});

test('normaliseer leest URL-waarden (strings) correct', () => {
  const n = normaliseer({ facturen: '10', uitgaven: '20', extra: 'offertes,uren', budget: 'Infinity' });
  assert.equal(n.facturen, 10); assert.deepEqual(n.extra, ['offertes', 'uren']); assert.equal(n.budget, Infinity);
});
