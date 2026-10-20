// Redesign v1 (20-10-2026): hero met eigen illustratie, actieband naar de match, sticky header en donkere footer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { home } from '../src/pages/static.mjs';
import { HERO_ART } from '../src/hero-art.mjs';

test('redesign: hero-illustratie is eigen inline SVG, decoratief, zonder externe beelden', () => {
  assert.match(home.body, /<div class="hero-side">\s*<div class="hero-art" aria-hidden="true"><svg /);
  assert.ok(home.body.includes(HERO_ART));
  assert.doesNotMatch(HERO_ART, /<image|<img|href=|url\(/);
});
test('redesign: actieband onderaan de homepage gaat naar de match', () => {
  assert.match(home.body, /<div class="cta-band">[\s\S]*<a class="btn" href="\/boekhoudprogramma-kiezen\/" data-cta="home_band">Start de match<\/a><\/div>/);
});
test('redesign: sticky header, 1200px kolom en donkere footer in de CSS', () => {
  const css = readFileSync(new URL('../src/assets/css/style.css', import.meta.url), 'utf8');
  for (const k of ['header.site{position:sticky', '.wrap{max-width:1200px', 'footer.site{background:var(--deep)', '.cta-band{']) assert.ok(css.includes(k), k);
});
