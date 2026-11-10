import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const dateFields = (h) => ({ visible: h.match(/(?:bijgewerkt|Updated)\s*(?:op\s*)?:?\s*<time[^>]*datetime="([^"]+)"/i)?.[1], ld: [...h.matchAll(/"dateModified"\s*:\s*"([^"]+)"/g)].map((m) => m[1]), og: [] });
const readSitemap = (out) => new Map([...readFileSync(out+'/sitemap.xml','utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m)=>[m[1],m[2]]));
import { STIJL_PADEN } from './nuchter-datums-helper.mjs';
test('stijlrelease 18-11: exacte bijgewerkt-/lastmod-/dateModified-datums, uitsluitend op de vastgelegde pagina’s', () => {
  const out = 'dist';
  const sitemap = readSitemap(out);
  for (const pad of STIJL_PADEN) {
    const file = pad.endsWith('.html') ? out + pad : out + pad + 'index.html';
    const fields = dateFields(readFileSync(file, 'utf8'));
    assert.equal(fields.visible, '2026-11-18', pad + ': zichtbaar');
    assert.equal(sitemap.get(pad), '2026-11-18', pad + ': sitemap');
    for (const date of [...fields.ld, ...fields.og]) assert.equal(date, '2026-11-18', pad + ': dateModified');
  }
});

import { nuchterDatum } from '../src/nuchter-datums.mjs';
test('stijl-datumvloer regresseert een latere inhoudelijke paginadatum niet', () => {
  const pad = [...STIJL_PADEN][0];
  const p = nuchterDatum({ path: pad, updated: '2027-01-02', lastmod: '2027-01-02', body: '<p>Updated <time datetime="2027-01-02">2 January 2027</time></p>', schema: [{ dateModified: '2027-01-02' }] });
  assert.equal(p.updated, '2027-01-02');
  assert.equal(p.lastmod, '2027-01-02');
  assert.equal(p.schema[0].dateModified, '2027-01-02');
  assert.match(p.body, /datetime="2027-01-02"/);
});
