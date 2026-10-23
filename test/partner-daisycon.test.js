import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { match } from '../src/lib/match.js';
import { PARTNERLINKS, uitgaand, partnerNoten, NOOT_HTML } from '../src/lib/partnerlinks.js';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { layout } from '../src/layout.mjs';
import { over, privacy, PRIVACY_UPDATED, OVER_UPDATED } from '../src/pages/static.mjs';
import { SITE } from '../src/layout.mjs';
import { readFileSync } from 'node:fs';

// Daisycon (media 436745): Jortt en Moneybird goedgekeurd 23-10-2026. fENNA staat niet op de site en krijgt geen link.
const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));

test('Daisycon: alleen Jortt en Moneybird hebben een partnerlink, met de afgesproken deeplink', () => {
  assert.deepEqual(Object.keys(PARTNERLINKS).sort(), ['jortt', 'moneybird']);
  const j = new URL(PARTNERLINKS.jortt.url), m = new URL(PARTNERLINKS.moneybird.url);
  assert.equal(j.hostname, 'jf79.net'); assert.equal(j.searchParams.get('si'), '16611'); assert.equal(j.searchParams.get('wi'), '436745'); assert.equal(j.searchParams.get('dl'), 'prijs/');
  assert.equal(m.hostname, 'bdt9.net'); assert.equal(m.searchParams.get('si'), '19080'); assert.equal(m.searchParams.get('wi'), '436745'); assert.equal(m.searchParams.has('dl'), false, 'Moneybird: geen deeplink (homepage)');
  assert.doesNotMatch(JSON.stringify(PARTNERLINKS), /PLACEHOLDER|\.invalid/);
  for (const id of ['jortt', 'moneybird']) {
    assert.equal(PARTNERLINKS[id].netwerk, 'Daisycon');
    const u = uitgaand(byId[id]);
    assert.equal(u.partner, true); assert.equal(u.rel, 'nofollow sponsored noopener');
  }
  assert.equal(uitgaand(byId.exact).partner, false);
});

test('aanbiederpagina Jortt/Moneybird: knop sponsored + precies één partnerzin; andere aanbieders geen zin', () => {
  for (const p of aanbiederPages) {
    const html = partnerNoten(layout(p));
    const n = html.split(NOOT_HTML).length - 1;
    if (p.path === '/jortt/' || p.path === '/moneybird/') {
      assert.equal(n, 1, p.path);
      assert.match(html, /<div class="card vendor-out"><a class="btn" href="https:\/\/[^"]+" target="_blank" rel="nofollow sponsored noopener"/);
    } else assert.equal(n, 0, p.path);
  }
});

test('volgorde van de match verandert niet door partnerlinks', () => {
  const v = { rechtsvorm: 'eenmanszaak', facturen: '5', uitgaven: '10', btw: 'plichtig', bank: 'auto', offertes: false, uren: false, ib: 'zelf', budget: 'geen', extra: [] };
  const zonder = PAKKETTEN.map((a) => ({ ...a }));
  assert.deepEqual(match(PAKKETTEN, v).map((r) => r.aanbieder + r.planNaam), match(zonder, v).map((r) => r.aanbieder + r.planNaam));
});

test('over en privacy noemen partnerlinks via Daisycon, geen "nu niet"', () => {
  assert.match(over.body, /affiliatenetwerk Daisycon/);
  assert.doesNotMatch(over.body + over.description, /Nu verdienen we niets|later mogelijk/);
  assert.match(privacy.body, /privacybeleid van Daisycon/);
});

test('privacy: eigen datum (PRIVACY_UPDATED) voor "Bijgewerkt op" en lastmod; SITE.updated ongewijzigd', () => {
  assert.equal(PRIVACY_UPDATED, '2026-10-23');
  assert.equal(privacy.updated, PRIVACY_UPDATED);
  assert.match(privacy.body, /Bijgewerkt op 23 oktober 2026\./);
  assert.equal(SITE.updated, '2026-10-10');
  assert.match(readFileSync('src/pages/static.mjs', 'utf8'), /fmtDate\(PRIVACY_UPDATED\)/);
});

test('over: eigen datum (OVER_UPDATED) voor lastmod; SITE.updated ongewijzigd', () => {
  assert.equal(OVER_UPDATED, '2026-10-23');
  assert.equal(over.updated, OVER_UPDATED);
  assert.equal(SITE.updated, '2026-10-10');
});

test('kiezen en vergelijken: updated 2026-10-23 (FAQ partnerlinks); privacy: cookie + klik-ID naar de aanbieder', async () => {
  const kiezen = (await import('../src/pages/kiezen.mjs')).default;
  const vergelijken = (await import('../src/pages/vergelijken.mjs')).default;
  assert.equal(kiezen.updated, '2026-10-23');
  assert.equal(vergelijken.updated, '2026-10-23');
  assert.match(privacy.body, /Daisycon plaatst op zijn eigen domein een cookie en geeft een klik-ID door aan de aanbieder, om vast te leggen dat je via BoekhoudMatch kwam\./);
});
