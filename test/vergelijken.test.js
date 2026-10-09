import test from 'node:test';
import assert from 'node:assert/strict';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { REDACTIE } from '../src/lib/aanbieders.js';
import { match } from '../src/lib/match.js';
import { situaties } from '../src/lib/situaties.mjs';

test('elke aanbieder heeft redactie (slug, knelt, sterk, zwak, wel, niet) en unieke slug', () => {
  const slugs = new Set();
  for (const a of PAKKETTEN) {
    const r = REDACTIE[a.id];
    assert.ok(r, a.id);
    for (const k of ['slug', 'kort', 'knelt', 'sterk', 'zwak']) assert.ok(r[k], `${a.id}.${k}`);
    assert.ok(r.wel.length && r.niet.length, a.id);
    assert.ok(!slugs.has(r.slug)); slugs.add(r.slug);
  }
  assert.equal(Object.keys(REDACTIE).length, PAKKETTEN.length);
});

test('vooringestelde aanbieder verandert de volgorde van de match niet', () => {
  const a = { rechtsvorm: 'eenmanszaak', facturen: 5, uitgaven: 10, btw: 'plichtig', bank: 'auto', ib: 'zelf', extra: [], budget: Infinity };
  const ids = (r) => r.map((x) => `${x.aanbieder}:${x.plan}`);
  assert.deepEqual(ids(match(PAKKETTEN, { ...a, aanbieder: 'exact' })), ids(match(PAKKETTEN, a)));
});

test('situatieblokken: zelfde uitkomst met of zonder partners (commissie telt niet mee)', () => {
  const key = (l) => l.map((s) => s.top && `${s.top.a.id}:${s.top.p.id}`).join('|');
  const a = key(situaties());
  const orig = PAKKETTEN.map((p) => p.partner);
  PAKKETTEN.forEach((p) => { p.partner = 'X'; });
  const b = key(situaties());
  PAKKETTEN.forEach((p, i) => { p.partner = orig[i]; });
  assert.equal(a, b);
  for (const s of situaties()) assert.ok(s.top, s.id);
});

test('MoneyMonk: prijzen van moneymonk.nl/prijzen (10-10-2026)', () => {
  const m = PAKKETTEN.find((a) => a.id === 'moneymonk');
  assert.deepEqual(m.plannen.map((p) => [p.id, p.prijs, p.transacties]), [['basis', 9, 20], ['pro', 32.5, 50], ['ultra', 37.5, Infinity]]);
  assert.equal(m.btwPrijzen, null);
});
