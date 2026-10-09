import { test } from 'node:test';
import assert from 'node:assert/strict';
import { btwVanExcl, btwVanIncl } from '../src/lib/btw.js';
import { parseNum, euro } from '../src/lib/format.js';

test('btw 21% en 9% heen en terug', () => {
  assert.deepEqual(btwVanExcl(100, 0.21), { excl: 100, btw: 21, incl: 121 });
  assert.deepEqual(btwVanIncl(121, 0.21), { excl: 100, btw: 21, incl: 121 });
  assert.deepEqual(btwVanExcl(19.99, 0.09), { excl: 19.99, btw: 1.8, incl: 21.79 });
  const t = btwVanIncl(10, 0.21); assert.equal(t.excl + t.btw, 10);
});

test('getallen invoer NL/EN', () => {
  assert.equal(parseNum('1.234,56'), 1234.56);
  assert.equal(parseNum('1234.56'), 1234.56);
  assert.equal(parseNum('€ 2.500'), 2500); // NL duizendtallen
  assert.equal(parseNum('0.250'), 0.25);
  assert.equal(parseNum('1.5'), 1.5);
  assert.equal(parseNum('12.345.678'), 12345678);
  assert.equal(parseNum('2500'), 2500);
  assert.ok(Number.isNaN(parseNum('')));
  assert.match(euro(1234.4), /1\.234/);
});
