import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schoon, bewaar, laad, wis } from '../src/lib/opslag.js';
import { layout, siteGraph, stampHtml, withStamp, foutGezien, faqFromHtml } from '../src/layout.mjs';
import kiezen from '../src/pages/kiezen.mjs';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { checked } from '../src/lib/weergave.mjs';
import { home, over } from '../src/pages/static.mjs';

const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const VELDEN = ['rechtsvorm', 'facturen', 'budget'];

test('opslag: alleen quizvelden, bewaren, laden, wissen', () => {
  assert.equal(schoon('?rechtsvorm=bv&email=x@y.nl&facturen=5', VELDEN), 'rechtsvorm=bv&facturen=5');
  assert.equal(schoon('rechtsvorm=<script>', VELDEN), '');
  const s = mem();
  bewaar(s, 'k', '?rechtsvorm=bv&budget=geen', VELDEN);
  assert.equal(laad(s, 'k', VELDEN), 'rechtsvorm=bv&budget=geen');
  assert.equal(laad(s, 'k', VELDEN, Date.now() + 91 * 864e5), '', 'ouder dan 90 dagen');
  wis(s, 'k'); assert.equal(laad(s, 'k', VELDEN), '');
  assert.equal(laad({ getItem() { throw new Error('uit'); } }, 'k', VELDEN), '');
});

test('quiz: zichtbare voortgangsbalk, opnieuw beginnen, delen zonder e-mail', () => {
  assert.match(kiezen.body, /class="qbar" role="progressbar"[^>]*aria-valuemax="8"/);
  assert.match(kiezen.body, /id="q-resume" hidden/);
  assert.equal((kiezen.body.match(/data-reset/g) || []).length, 2);
  assert.match(kiezen.body, /Deel of bewaar/);
  assert.doesNotMatch(kiezen.body, /type="email"/);
});

test('elke pagina: Organization + WebSite, OG/Twitter, Fout gezien met URL', () => {
  const g = siteGraph()['@graph'].map((x) => x['@type']);
  assert.deepEqual(g, ['Organization', 'WebSite']);
  const h = layout(over);
  for (const t of ['og:title', 'og:image', 'og:url', 'twitter:card', '"@type":"WebSite"', '"@type":"Organization"']) assert.ok(h.includes(t), t);
  assert.match(foutGezien('https://boekhoudmatch.nl/over/'), /mailto:info@boekhoudmatch\.nl\?subject=Fout%20gezien[^"]*body=Pagina%3A%20https%3A%2F%2Fboekhoudmatch\.nl%2Fover%2F/);
  assert.equal((layout(home).match(/"@type":"WebSite"/g) || []).length, 1, 'geen dubbele WebSite op home');
});

test('sticky CTA: overal behalve op de match en op tools met eigen uitkomstbalk; body krijgt ruimte', () => {
  const h = layout(over);
  assert.match(h, /class="stickycta" href="\/boekhoudprogramma-kiezen\/"[^>]*>.*Bekijk jouw match in 2 minuten/);
  assert.match(h, /<body class="has-cta"/);
  assert.doesNotMatch(layout(kiezen), /class="stickycta"/);
});

test('badge: echte datums, niets verzonnen', () => {
  assert.equal(stampHtml({}), '');
  assert.equal(stampHtml({ checked: null, updated: null }), '');
  assert.match(stampHtml({ checked: '2026-10-10' }), /Gecontroleerd op <time datetime="2026-10-10">10 oktober 2026/);
  assert.doesNotMatch(stampHtml({ checked: '2026-10-10' }), /Laatst bijgewerkt/);
  assert.match(withStamp('<h1>X</h1>\n<p class="lead">L</p>\n<p>rest</p>', { updated: '2026-10-09' }), /<p class="lead">L<\/p>\s*<p class="stamp">.*<p>rest/s);
  for (const p of aanbiederPages) {
    const a = PAKKETTEN.find((x) => p.path.includes(x.id) || p.ogTitle.startsWith(x.naam));
    assert.ok(p.stamp.checked && p.stamp.updated, p.path);
    if (a) assert.equal(p.stamp.checked, checked(a));
  }
});

test('aanbiederpagina: SoftwareApplication zonder ratings of reviews', () => {
  for (const p of aanbiederPages) {
    const s = JSON.stringify(p.schema);
    assert.match(s, /"@type":"SoftwareApplication"/);
    assert.doesNotMatch(s, /aggregateRating|"review"/i);
  }
});

test('FAQPage alleen uit echte vragen', () => {
  assert.deepEqual(faqFromHtml('<h2>Iets</h2><h3>Geen faq?</h3><p>x</p>'), []);
  assert.deepEqual(faqFromHtml('<h2 id="v">Veelgestelde vragen</h2><h3>Wat?</h3><p>Dit.</p><h3>Wie?</h3><p>Zij.</p><h2>Bronnen</h2><h3>Nee</h3><p>n</p>'), [['Wat?', 'Dit.'], ['Wie?', 'Zij.']]);
});
