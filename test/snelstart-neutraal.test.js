import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { PARTNERLINKS, NEUTRALE_BRONNEN, uitgaand, ctaTekst, bronLinkHtml, partnerNoten, NOOT_HTML } from '../src/lib/partnerlinks.js';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { layout } from '../src/layout.mjs';
import kiezen from '../src/pages/kiezen.mjs';
import vergelijken from '../src/pages/vergelijken.mjs';
import { gidsPages } from '../src/pages/gids.mjs';

const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));
const BRON = '<a href="https://www.snelstart.nl" rel="noopener">Bron: SnelStart</a>';
const CTA_RE = /30 dagen gratis proberen bij SnelStart/;
const CTA_ATTR_RE = /data-cta="(?:trial|visit)"[^>]*>[^<]*SnelStart|class="btn"[^>]*snelstart\.nl|snelstart\.nl"[^>]*class="btn/i;

test('SnelStart: neutrale bronlink, geen partner/CTA/sponsored/ref/utm', () => {
  assert.ok(Object.keys(NEUTRALE_BRONNEN).includes('snelstart'));
  assert.equal(NEUTRALE_BRONNEN.snelstart.href, 'https://www.snelstart.nl');
  assert.equal(bronLinkHtml('snelstart'), BRON);
  assert.equal(PARTNERLINKS.snelstart, undefined);
  const u = uitgaand(byId.snelstart);
  assert.equal(u.partner, false);
  assert.equal(u.bron, true);
  assert.equal(u.rel, 'noopener');
  assert.equal(u.href, 'https://www.snelstart.nl');
  assert.doesNotMatch(u.href, /ref=|utm_|sponsored|[?&](si|li|wi|awinmid)=/);
  assert.doesNotMatch(u.rel, /sponsored|nofollow/);
  const c = ctaTekst('SnelStart', { proef: 30, prijs: 15.5, id: 'snelstart' });
  assert.equal(c.tekst, 'Bron: SnelStart');
  assert.equal(c.gratis, false);
  assert.equal(c.bron, true);
});

test('aanbiederpagina /snelstart/: bronlink zonder btn/data-cta/sponsored/partnernoot', () => {
  const p = aanbiederPages.find((x) => x.path === '/snelstart/');
  const html = partnerNoten(layout(p));
  const out = p.body.match(/<div class="card vendor-out">[\s\S]*?<\/div>/)[0];
  assert.equal(out, `<div class="card vendor-out">${BRON}</div>`);
  assert.doesNotMatch(out, /class="btn|ghost|data-cta|sponsored|nofollow|target="_blank"/);
  assert.doesNotMatch(p.body, CTA_RE);
  const naarMerk = [...p.body.matchAll(/<a\b[^>]*href="https:\/\/www\.snelstart\.nl[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.ok(naarMerk.includes(BRON));
  for (const a of naarMerk) {
    assert.doesNotMatch(a, /class="btn|rel="[^"]*sponsored|data-cta="(?:trial|visit)"/);
  }
  assert.equal(html.split(NOOT_HTML).length - 1, 0);
  assert.doesNotMatch(html, /<p class="pnoot">/);
});

test('statische pagina\'s en gidsen: geen SnelStart-trial-CTA (faalt bij terugkeer)', () => {
  for (const p of aanbiederPages) {
    assert.doesNotMatch(p.body, CTA_RE, p.path);
    assert.doesNotMatch(p.body, CTA_ATTR_RE, p.path);
  }
  assert.doesNotMatch(kiezen.body, CTA_RE);
  assert.doesNotMatch(vergelijken.body, CTA_RE);
  for (const p of gidsPages()) {
    assert.doesNotMatch(p.body, CTA_RE, p.path);
  }
});

test('client/quiz (kiezen.js): SnelStart wordt bronlink, zonder data-cta of btn', () => {
  const src = readFileSync('src/assets/js/kiezen.js', 'utf8');
  assert.match(src, /if \(u\.bron\)/);
  assert.match(src, /l\.textContent = c\.tekst/);
  assert.doesNotMatch(src, CTA_RE);
  // Standaard-SSR-uitslag op /boekhoudprogramma-kiezen/: als SnelStart in de top staat, alleen de bronlink.
  if (kiezen.body.includes('SnelStart')) {
    assert.match(kiezen.body, /<a href="https:\/\/www\.snelstart\.nl" rel="noopener">Bron: SnelStart<\/a>/);
    assert.doesNotMatch(kiezen.body, CTA_RE);
    assert.doesNotMatch(kiezen.body, /data-cta="(?:trial|visit)"[^>]*>[^<]*SnelStart/);
  }
});

test('broncode: nergens de oude SnelStart-CTA-zin (faalt bij terugkeer)', () => {
  const skip = new Set(['node_modules', 'dist', '.git']);
  const hits = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(f.name) || f.name.endsWith('.png') || f.name.endsWith('.webp') || f.name.endsWith('.woff2')) continue;
      const p = `${dir}/${f.name}`;
      if (f.isDirectory()) walk(p);
      else if (/\.(js|mjs|md|html|json)$/.test(f.name)) {
        const t = readFileSync(p, 'utf8');
        if (CTA_RE.test(t)) hits.push(p);
      }
    }
  };
  walk('src');
  walk('content');
  assert.deepEqual(hits, [], hits.join('\n'));
});
