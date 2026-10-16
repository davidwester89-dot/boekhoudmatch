import { test } from 'node:test';
import assert from 'node:assert/strict';
import kiezen from '../src/pages/kiezen.mjs';
import { home, matchUrl, VOORBEELDEN } from '../src/pages/static.mjs';
import { normaliseer } from '../src/lib/match.js';
import { pakketTabel } from '../src/lib/weergave.mjs';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { REDACTIE } from '../src/lib/aanbieders.js';

test('quiz: geen voorgeselecteerde antwoorden bij "0 van 8"', () => {
  assert.match(kiezen.body, /0 van 8 vragen beantwoord/);
  const form = kiezen.body.slice(kiezen.body.indexOf('<form'), kiezen.body.indexOf('</form>'));
  assert.doesNotMatch(form, /\bchecked\b/, 'geen enkel antwoord mag vooraf aangevinkt zijn');
});

test('quiz: budget "maakt niet uit" is budget=geen, nooit Infinity in een URL', () => {
  assert.doesNotMatch(kiezen.body, /Infinity/);
  assert.match(kiezen.body, /name="budget" value="geen"/);
  assert.equal(normaliseer({ budget: 'geen' }).budget, Infinity);
  assert.equal(normaliseer({ budget: 'Infinity' }).budget, Infinity, 'oude links blijven werken');
  for (const v of VOORBEELDEN) assert.doesNotMatch(matchUrl(v.a), /Infinity/);
  assert.doesNotMatch(matchUrl({ ...VOORBEELDEN[0].a, budget: Infinity }), /Infinity/);
  assert.doesNotMatch(home.body, /Infinity/);
});

test('homepage: volgorde hero (vraag 1), trustbar, logobalk, situaties, methode, tools', () => {
  const idx = ['class="hero-q"', 'class="trustbar"', 'class="logobar"', 'Beste keuze per situatie', 'Zo vergelijken we', 'class="toolrow"', '{{latest}}'].map((x) => home.body.indexOf(x));
  idx.forEach((i) => assert.ok(i > 0));
  assert.deepEqual([...idx].sort((a, b) => a - b), idx);
  assert.equal((home.body.match(/<li>/g) || []).length >= 4, true);
  assert.equal((home.body.split('class="trustbar"')[1].split('</ul>')[0].match(/<li>/g) || []).length, 4);
  assert.match(home.body, /Redactie BoekhoudMatch/);
  assert.doesNotMatch(home.body, /Dave|<img[^>]*(foto|portret)/i);
  assert.doesNotMatch(home.body, /★|sterren|\/10\b|#1/);
  assert.match(home.body, /href="\/boekhoudprogramma-kiezen\/\?rechtsvorm=eenmanszaak"/);
});

test('aanbiederpagina: pakketkaarten met uitklapper, geen brede tabel', () => {
  for (const a of PAKKETTEN) {
    const h = pakketTabel(a);
    assert.equal((h.match(/class="pkg-card"/g) || []).length, a.plannen.length, a.id);
    assert.match(h, /<details class="pkg-more"><summary>Alle details<\/summary>/);
    assert.doesNotMatch(h, /<table/);
  }
});

test('logo\'s: alleen gezet als bestand bestaat', async () => {
  const { existsSync } = await import('node:fs');
  for (const r of Object.values(REDACTIE)) if (r.logo) assert.ok(existsSync(`src/assets/logos/${r.logo}.webp`), r.logo);
});
