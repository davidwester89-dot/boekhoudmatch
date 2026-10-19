import { test } from 'node:test';
import assert from 'node:assert/strict';
import { networkFor } from '../src/network.mjs';

test('BM-footer bevat geen energiesites (briefing P1)', () => {
  const urls = networkFor('boekhoudmatch.nl').map((s) => s.url).join(' ');
  for (const d of ['verduurzaammatch', 'warmtepompenmatch', 'thuisaccumatch']) assert.ok(!urls.includes(d), d);
  assert.ok(urls.includes('shopmatch.nl'));
  assert.ok(!urls.includes('boekhoudmatch.nl'));
});
