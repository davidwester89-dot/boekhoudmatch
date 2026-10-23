import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { postPage } from '../src/pages/blog.mjs';
import uurtarief from '../src/pages/uurtarief.mjs';
import vergelijken, { TEKST_UPDATED } from '../src/pages/vergelijken.mjs';
import kiezen from '../src/pages/kiezen.mjs';
import { home } from '../src/pages/static.mjs';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { checked } from '../src/lib/weergave.mjs';

test('Moneybird: H2 "Is Moneybird nog gratis?" met FAQPage-schema en prijzen uit de data', () => {
  const p = aanbiederPages.find((x) => x.path === '/moneybird/');
  assert.match(p.body, /<h2>Is Moneybird nog gratis\?<\/h2>\s*<p>Nee, Moneybird heeft geen gratis pakket\. Het kleinste pakket is Compact: € 4,00 per maand, of € 3,00/);
  const faq = p.schema.find((s) => s['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity[0].name, 'Is Moneybird nog gratis?');
  assert.doesNotMatch(faq.mainEntity[0].acceptedAnswer.text, /\{\{|<[a-z]/);
});

test('Match-knop boven en onder op elke aanbiederpagina en blogpost (data-cta match_top/match_bottom)', () => {
  for (const p of aanbiederPages) {
    assert.match(p.body, /href="\/boekhoudprogramma-kiezen\/\?aanbieder=[a-z]+" rel="nofollow" data-cta="match_top"/, p.path);
    assert.match(p.body, /data-cta="match_bottom"/, p.path);
  }
  const post = postPage({ slug: 'x', path: '/blog/x/', title: 'X', seoTitle: 'X', description: 'd', date: '2026-10-19', updated: '2026-10-19', checked: '2026-10-19', html: '<p>tekst</p>', words: 100, tools: [], sources: [] }, [], 'blog');
  assert.match(post.body, /data-cta="match_top"[\s\S]*<p>tekst<\/p>[\s\S]*data-cta="match_bottom"/);
});

test('Uurtarief: title <= 60 met tarief en uurloon; FAQ minimumuurloon 2026 (Rijksoverheid) en tarief bepalen', () => {
  assert.ok(uurtarief.title.length <= 60);
  assert.match(uurtarief.title, /tarief en uurloon/);
  const names = uurtarief.schema.find((s) => s['@type'] === 'FAQPage').mainEntity.map((q) => q.name);
  assert.ok(names.includes('Wat is het minimumuurloon in 2026?') && names.includes('Hoe bepaal je je zzp-tarief?'));
  assert.match(uurtarief.body, /€ 14,71 bruto per uur vanaf 1 januari 2026, en € 14,99 bruto per uur vanaf 1 juli 2026/);
});

test('Interne links: Jortt kosten en boekhoudpakket voor een bv precies één keer op home en vergelijken', () => {
  for (const b of [home.body, vergelijken.body]) {
    assert.equal((b.match(/<a href="\/jortt\/">Jortt kosten<\/a>/g) || []).length, 1);
    assert.equal((b.match(/<a href="\/boekhoudprogramma-bv\/">boekhoudpakket voor een bv<\/a>/g) || []).length, 1);
  }
});

test('Vergelijken: controledatum = echte laatste controle uit de data, ook in FAQ-schema en sitemapdatum', () => {
  const nieuwst = PAKKETTEN.map(checked).sort().at(-1);
  assert.equal(vergelijken.updated, [nieuwst, TEKST_UPDATED].sort().at(-1));
  const faq = vergelijken.schema.find((s) => s['@type'] === 'FAQPage');
  const a = faq.mainEntity.find((q) => q.name === 'Hoe vaak worden de prijzen gecontroleerd?').acceptedAnswer.text;
  assert.doesNotMatch(a, /laatste controle was op 10 oktober 2026/);
  assert.match(a, /11 oktober 2026/);
});

test('Geen layoutverschuiving: cookiemelding fixed zonder body-padding; skiplink 48px; match-intro max. 1 regel', () => {
  const css = readFileSync('src/assets/css/style.css', 'utf8');
  assert.doesNotMatch(css, /body\.has-consent\{padding/);
  assert.match(css, /\.consent\{position:fixed/);
  assert.match(css, /\.skip\{position:absolute;left:-999px;min-height:48px/);
  assert.match(css, /\.calc>\*\{min-width:0\}/);
  assert.match(kiezen.body, /<p class="lead">8 korte vragen, meteen je uitslag\.<\/p>/);
});
