import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAKKETTEN } from '../src/lib/pakketten.js';

const PLATFORMS = ['shopify', 'woocommerce', 'lightspeed', 'bol', 'mollie'];

test('elke aanbieder heeft webshopkoppelingen met bron en controledatum', () => {
  for (const a of PAKKETTEN) {
    const w = a.webshopkoppelingen;
    assert.ok(w, `${a.id}: webshopkoppelingen ontbreekt`);
    assert.match(w.gecontroleerd, /^\d{4}-\d{2}-\d{2}$/, `${a.id}: gecontroleerd`);
    assert.ok(Array.isArray(w.bronnen) && w.bronnen.length > 0, `${a.id}: bronnen`);
    for (const b of w.bronnen) assert.match(b.url, /^https:\/\//, `${a.id}: bron-url`);
    for (const p of PLATFORMS) assert.ok(['ja', 'niet gevonden'].includes(w[p]), `${a.id}.${p}: '${w[p]}'`);
  }
});
