import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { REDACTIE } from '../src/lib/aanbieders.js';
import { PARTNERLINKS, uitgaand, ctaTekst } from '../src/lib/partnerlinks.js';

test('partnerlinks: alleen bestaande aanbieders en https', () => {
  for (const [id, pl] of Object.entries(PARTNERLINKS)) {
    assert.ok(PAKKETTEN.some((a) => a.id === id), id);
    assert.match(pl.url, /^https:\/\//);
  }
});
test('uitgaand: zonder partnerlink de eigen site, nofollow noopener, geen label', () => {
  const a = PAKKETTEN[0];
  assert.deepEqual(uitgaand(a, {}), { href: a.site, partner: false, rel: 'nofollow noopener' });
});
test('uitgaand: met partnerlink sponsored + label', () => {
  const a = PAKKETTEN[0];
  const r = uitgaand(a, { [a.id]: { url: 'https://example.com/x' } });
  assert.equal(r.partner, true); assert.equal(r.rel, 'nofollow sponsored noopener'); assert.equal(r.href, 'https://example.com/x');
});
test('ctaTekst: proef of gratis pakket -> Probeer, anders Bekijk', () => {
  assert.equal(ctaTekst('MoneyMonk', { proef: 30, prijs: 9 }).tekst, 'Probeer MoneyMonk gratis');
  assert.equal(ctaTekst('Tellow', { proef: null, prijs: 0 }).tekst, 'Probeer Tellow gratis');
  assert.equal(ctaTekst('Tellow', { proef: null, prijs: 12.99 }).tekst, 'Bekijk Tellow');
  assert.equal(ctaTekst('Rompslomp', { proef: null, prijs: 8.95 }).tekst, 'Bekijk Rompslomp');
});
test('match en volgorde lezen partnerlinks nooit', () => {
  for (const f of ['src/lib/match.js', 'src/lib/situaties.mjs']) assert.doesNotMatch(readFileSync(f, 'utf8'), /partnerlinks|PARTNERLINKS/);
  for (const id of Object.keys(REDACTIE)) assert.ok(PAKKETTEN.some((a) => a.id === id));
});
