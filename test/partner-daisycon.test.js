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

// Daisycon (media 436745): Jortt en Moneybird goedgekeurd 23-10-2026. Awin (publisher 3145721): e-Boekhouden mid 101519 goedgekeurd 5-11-2026.
const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));

test('partnerlinks: Jortt/Moneybird via Daisycon, e-Boekhouden via Awin (homepage, geen zelfgemaakte deeplink)', () => {
  assert.deepEqual(Object.keys(PARTNERLINKS).sort(), ['eboekhouden', 'jortt', 'moneybird']);
  const j = new URL(PARTNERLINKS.jortt.url), m = new URL(PARTNERLINKS.moneybird.url), e = new URL(PARTNERLINKS.eboekhouden.url);
  assert.equal(j.hostname, 'jf79.net'); assert.equal(j.searchParams.get('si'), '16611'); assert.equal(j.searchParams.get('wi'), '436745'); assert.equal(j.searchParams.get('dl'), 'prijs/');
  assert.equal(m.hostname, 'bdt9.net'); assert.equal(m.searchParams.get('si'), '19080'); assert.equal(m.searchParams.get('wi'), '436745'); assert.equal(m.searchParams.has('dl'), false, 'Moneybird: geen deeplink (homepage)');
  assert.equal(e.hostname, 'www.awin1.com'); assert.equal(e.pathname, '/cread.php');
  assert.equal(e.searchParams.get('awinmid'), '101519'); assert.equal(e.searchParams.get('awinaffid'), '3145721');
  assert.equal(e.searchParams.get('ued'), 'https://www.e-boekhouden.nl/');
  assert.doesNotMatch(JSON.stringify(PARTNERLINKS), /PLACEHOLDER|\.invalid/);
  for (const id of ['jortt', 'moneybird']) {
    assert.equal(PARTNERLINKS[id].netwerk, 'Daisycon');
    const u = uitgaand(byId[id]);
    assert.equal(u.partner, true); assert.equal(u.rel, 'nofollow sponsored noopener');
  }
  assert.equal(PARTNERLINKS.eboekhouden.netwerk, 'Awin');
  const ue = uitgaand(byId.eboekhouden);
  assert.equal(ue.partner, true); assert.equal(ue.rel, 'nofollow sponsored noopener');
  assert.equal(ue.href, PARTNERLINKS.eboekhouden.url);
  assert.equal(byId.eboekhouden.partner, 'Awin');
  assert.equal(uitgaand(byId.exact).partner, false);
});

test('aanbiederpagina Jortt/Moneybird/e-Boekhouden: knop sponsored + precies één partnerzin; andere aanbieders geen zin', () => {
  for (const p of aanbiederPages) {
    const html = partnerNoten(layout(p));
    const n = html.split(NOOT_HTML).length - 1;
    if (p.path === '/jortt/' || p.path === '/moneybird/' || p.path === '/e-boekhouden/') {
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

test('over en privacy noemen Daisycon én Awin, geen "nu niet"', () => {
  assert.match(over.body, /affiliatenetwerk Daisycon of Awin/);
  assert.doesNotMatch(over.body + over.description, /Nu verdienen we niets|later mogelijk/);
  assert.match(privacy.body, /privacybeleid van Daisycon/);
  assert.match(privacy.body, /privacybeleid van Awin/);
});

test('privacy: eigen datum (PRIVACY_UPDATED) voor "Bijgewerkt op" en lastmod; SITE.updated ongewijzigd', () => {
  assert.equal(PRIVACY_UPDATED, '2026-11-05');
  assert.equal(privacy.updated, PRIVACY_UPDATED);
  assert.match(privacy.body, /Bijgewerkt op 5 november 2026\./);
  assert.equal(SITE.updated, '2026-10-10');
  assert.match(readFileSync('src/pages/static.mjs', 'utf8'), /fmtDate\(PRIVACY_UPDATED\)/);
});

test('over: eigen datum (OVER_UPDATED) voor lastmod; SITE.updated ongewijzigd', () => {
  assert.equal(OVER_UPDATED, '2026-11-05');
  assert.equal(over.updated, OVER_UPDATED);
  assert.equal(SITE.updated, '2026-10-10');
});

test('kiezen 2026-11-12 (matchdata/clientreden); vergelijken 2026-11-12 (Jortt-richtlijn in tabel); privacy ongewijzigd', async () => {
  const kiezen = (await import('../src/pages/kiezen.mjs')).default;
  const vergelijken = (await import('../src/pages/vergelijken.mjs')).default;
  assert.equal(kiezen.updated, '2026-11-12');
  assert.equal(kiezen.stamp.updated, '2026-11-12');
  assert.equal(kiezen.schema.find((s) => s['@type'] === 'WebApplication').dateModified, '2026-11-12');
  assert.equal(vergelijken.updated, '2026-11-12');
  const kSrc = readFileSync('src/pages/kiezen.mjs', 'utf8');
  const vSrc = readFileSync('src/pages/vergelijken.mjs', 'utf8');
  assert.match(kSrc, /affiliatenetwerk Daisycon of Awin/);
  assert.match(vSrc, /partnerlinks \(via Daisycon of Awin\)/);
  assert.match(privacy.body, /Daisycon of Awin plaatst op zijn eigen domein een cookie en geeft een klik-ID door aan de aanbieder, om vast te leggen dat je via BoekhoudMatch kwam\./);
});
