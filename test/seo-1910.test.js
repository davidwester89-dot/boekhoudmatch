import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { gidsPages } from '../src/pages/gids.mjs';
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

test('SEO 7-11: Moneybird beantwoordt "niet meer gratis"; SnelStart linkt naar de bankgids; controle en Jortt blijven', () => {
  const mb = aanbiederPages.find((x) => x.path === '/moneybird/');
  assert.equal(mb.title, 'Moneybird niet meer gratis: prijzen 2026 | BoekhoudMatch');
  assert.ok(mb.title.length <= 60 && mb.description.length >= 70 && mb.description.length <= 155);
  assert.match(mb.description, /Compact kost € 4,00 per maand, of € 3,00 bij jaarbetaling/);
  assert.match(mb.description, /gecontroleerd op 10 oktober 2026/);
  assert.match(mb.body, /<h2>Is Moneybird nog gratis\?<\/h2>[\s\S]*<h2>In het kort<\/h2>/);
  assert.equal((mb.body.match(/<h2>Is Moneybird nog gratis\?<\/h2>/g) || []).length, 1);
  assert.match(mb.body, /href="\/gratis-boekhoudprogramma\/">gratis boekhoudprogramma<\/a>/);
  assert.match(mb.body, /vanaf Groei \(€ 35,00 per maand\)[\s\S]*href="\/bankkoppeling-boekhoudprogramma\/">bankkoppeling per pakket<\/a>/);
  const faq = mb.schema.find((s) => s['@type'] === 'FAQPage');
  assert.doesNotMatch(faq.mainEntity[0].acceptedAnswer.text, /<[a-z]/);

  const ss = aanbiederPages.find((x) => x.path === '/snelstart/');
  assert.equal(ss.title, 'SnelStart prijzen 2026: kosten per pakket | BoekhoudMatch');
  assert.equal((ss.body.match(/href="\/bankkoppeling-boekhoudprogramma\/">bankkoppeling per pakket<\/a>/g) || []).length, 1);
  assert.doesNotMatch(ss.title + ss.description, /Wat kost SnelStart/);

  for (const slug of ['jortt', 'silvasoft', 'rompslomp', 'tellow', 'exact', 'informer']) {
    const p = aanbiederPages.find((x) => x.path === `/${slug}/`);
    const kort = { jortt: 'Jortt', silvasoft: 'Silvasoft', rompslomp: 'Rompslomp', tellow: 'Tellow', exact: 'Exact', informer: 'Informer' }[slug];
    assert.equal(p.title, `${kort} prijzen 2026: kosten per pakket | BoekhoudMatch`);
    assert.doesNotMatch(p.body, /bankkoppeling per pakket/);
    assert.doesNotMatch(p.body, /niet meer gratis/);
  }
});

test('SEO 7-11: bankgids en Rompslomp vs Tellow, prijzen uit de bestaande data', () => {
  const pages = gidsPages();
  const bank = pages.find((p) => p.path === '/bankkoppeling-boekhoudprogramma/');
  assert.equal(bank.title, 'Bankkoppeling boekhoudprogramma: per pakket | BoekhoudMatch');
  assert.ok(bank.title.length <= 60 && bank.description.length >= 70 && bank.description.length <= 155, `${bank.title.length} / ${bank.description.length}`);
  assert.match(bank.body, /<strong><a href="\/moneybird\/">Moneybird<\/a><\/strong>/);
  assert.match(bank.body, /<h2 id="snelstart-koppelen-met-de-rabobank">/);
  assert.match(bank.body, /<h2 id="moneybird-automatische-bankkoppeling-instellen">/);
  assert.equal(bank.updated, '2026-11-07');

  const vs = pages.find((p) => p.path === '/rompslomp-vs-tellow/');
  assert.equal(vs.title, 'Rompslomp tarieven 2026 vs Tellow | BoekhoudMatch');
  assert.ok(vs.title.length <= 60 && vs.description.length >= 70 && vs.description.length <= 155, `${vs.title.length} / ${vs.description.length}`);
  assert.match(vs.description, /€ 8,95/);
  assert.match(vs.description, /€ 12,99/);
  assert.match(vs.body, /Puur Factuur € 8,95 per maand en Tellow Basis € 12,99/);
  const h2 = [...vs.body.matchAll(/<h2 id="[^"]+">([^<]+)<\/h2>/g)].map((m) => m[1]);
  assert.equal(h2[0], 'Rompslomp en Tellow tarieven 2026: wat krijg je voor je geld?');
  assert.equal(h2[1], 'Gratis: Starter tegen Gratis');
  assert.equal(vs.updated, '2026-11-07');
  assert.equal(vs.stamp.checked, '2026-10-26');
});

test('Geen layoutverschuiving: cookiemelding fixed zonder body-padding; skiplink 48px; match-intro max. 1 regel', () => {
  const css = readFileSync('src/assets/css/style.css', 'utf8');
  assert.doesNotMatch(css, /body\.has-consent\{padding/);
  assert.match(css, /\.consent\{position:fixed/);
  assert.match(css, /\.skip\{position:absolute;left:-999px;min-height:48px/);
  assert.match(css, /\.calc>\*\{min-width:0\}/);
  assert.match(kiezen.body, /<p class="lead">8 korte vragen, meteen je uitslag\.<\/p>/);
});
