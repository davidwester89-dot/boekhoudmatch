import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { PARTNERLINKS, NEUTRALE_BRONNEN, uitgaand, ctaTekst, bronLinkHtml, partnerNoten, NOOT_HTML } from '../src/lib/partnerlinks.js';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { layout } from '../src/layout.mjs';
import { checked } from '../src/lib/weergave.mjs';

const byId = Object.fromEntries(PAKKETTEN.map((a) => [a.id, a]));
const ANDERE_ONBETAALD = ['moneymonk', 'rompslomp', 'tellow', 'silvasoft'];

test('Informer en Exact: neutrale bronlink, geen partner/CTA/sponsored/ref', () => {
  assert.deepEqual(Object.keys(NEUTRALE_BRONNEN).sort(), ['exact', 'informer', 'snelstart']);
  assert.equal(NEUTRALE_BRONNEN.informer.href, 'https://www.informer.nl');
  assert.equal(NEUTRALE_BRONNEN.exact.href, 'https://www.exact.com/nl');
  assert.equal(bronLinkHtml('informer'), '<a href="https://www.informer.nl" rel="noopener">Bron: Informer</a>');
  assert.equal(bronLinkHtml('exact'), '<a href="https://www.exact.com/nl" rel="noopener">Bron: Exact</a>');

  for (const id of ['informer', 'exact']) {
    assert.equal(PARTNERLINKS[id], undefined, id);
    const u = uitgaand(byId[id]);
    assert.equal(u.partner, false, id);
    assert.equal(u.bron, true, id);
    assert.equal(u.rel, 'noopener', id);
    assert.equal(u.href, NEUTRALE_BRONNEN[id].href, id);
    assert.doesNotMatch(u.href, /ref=|sponsored|[?&](si|li|wi|awinmid)=/);
    assert.doesNotMatch(u.rel, /sponsored|nofollow/);
    const c = ctaTekst(byId[id].naam, { proef: 30, prijs: 16, id });
    assert.equal(c.tekst, `Bron: ${NEUTRALE_BRONNEN[id].naam}`);
    assert.equal(c.gratis, false);
    assert.equal(c.bron, true);
  }
});

test('andere vier onbetaalde merken houden de gewone CTA-fallback (geen bronlink; SnelStart is al bronlink sinds Jortt v3)', () => {
  for (const id of ANDERE_ONBETAALD) {
    const u = uitgaand(byId[id]);
    assert.equal(u.partner, false, id);
    assert.equal(u.bron, false, id);
    assert.equal(u.rel, 'nofollow noopener', id);
    assert.equal(u.href, byId[id].site, id);
  }
  assert.equal(ctaTekst('MoneyMonk', { proef: 30, prijs: 9, id: 'moneymonk' }).tekst, '30 dagen gratis proberen bij MoneyMonk');
  assert.equal(ctaTekst('Rompslomp', { proef: null, prijs: 8.95, id: 'rompslomp' }).tekst, 'Bekijk Rompslomp');
  assert.equal(ctaTekst('Tellow', { proef: null, prijs: 0, id: 'tellow' }).tekst, 'Gratis beginnen bij Tellow');
});

test('aanbiederpagina Informer/Exact: bronlink zonder btn/sponsored/partnernoot; datums 14-11', () => {
  for (const id of ['informer', 'exact']) {
    const p = aanbiederPages.find((x) => x.path === `/${id}/`);
    const html = partnerNoten(layout(p));
    const link = bronLinkHtml(id);
    const out = p.body.match(/<div class="card vendor-out">[\s\S]*?<\/div>/)[0];
    assert.equal(out, `<div class="card vendor-out">${link}</div>`);
    assert.doesNotMatch(out, /class="btn|ghost|data-cta|sponsored|nofollow|target="_blank"/);
    assert.doesNotMatch(p.body, /dagen gratis proberen bij (?:Informer|Exact)|Gratis beginnen bij (?:Informer|Exact)|Bekijk (?:Informer|Exact)/);
    // Uitgaande links naar het merk: alleen de bronlink, nooit een CTA of sponsored.
    const naarMerk = [...p.body.matchAll(/<a\b[^>]*href="https:\/\/www\.(?:informer\.nl|exact\.com)[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
    assert.ok(naarMerk.includes(link), id);
    for (const a of naarMerk) {
      assert.doesNotMatch(a, /class="btn|rel="[^"]*sponsored|data-cta="(?:trial|visit)"/);
    }
    assert.equal(html.split(NOOT_HTML).length - 1, 0, id);
    assert.doesNotMatch(html, /<p class="pnoot">/);

    assert.equal(p.updated, '2026-11-14');
    assert.equal(p.stamp.updated, '2026-11-14');
    assert.equal(p.stamp.checked, checked(byId[id]));
    assert.notEqual(p.stamp.checked, '2026-11-14');
    assert.equal(p.schema.find((s) => s['@type'] === 'SoftwareApplication').dateModified, '2026-11-14');
  }
});

test('andere aanbiederpagina\'s: CTA-knop ongewijzigd (geen Bron:-vervanging)', async () => {
  const kiezen = (await import('../src/pages/kiezen.mjs')).default;
  for (const id of ANDERE_ONBETAALD) {
    const p = aanbiederPages.find((x) => x.path === `/${id}/`);
    assert.match(p.body, /<div class="card vendor-out"><a class="btn" href="https:\/\/[^"]+" target="_blank" rel="nofollow noopener"/, id);
    assert.doesNotMatch(p.body, /Bron: (?:MoneyMonk|Rompslomp|Tellow|Silvasoft)/, id);
  }
  const mb = aanbiederPages.find((x) => x.path === '/moneybird/');
  assert.match(mb.body, /rel="nofollow sponsored noopener"/);

  // Standaarduitslag: Informer is nr. 3, dus een neutrale bronlink in de SSR; MoneyMonk (nr. 1) blijft CTA.
  assert.match(kiezen.body, /<a href="https:\/\/www\.informer\.nl" rel="noopener">Bron: Informer<\/a>/);
  assert.doesNotMatch(kiezen.body, /Bekijk Informer|proberen bij Informer/);
  assert.doesNotMatch(kiezen.body, /Bron: Exact|Bekijk Exact|proberen bij Exact/);
  assert.match(kiezen.body, /30 dagen gratis proberen bij MoneyMonk/);
  assert.match(kiezen.body, /Bekijk Rompslomp/);
  assert.equal(kiezen.updated, '2026-11-14');
});
