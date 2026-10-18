import { test } from 'node:test';
import assert from 'node:assert/strict';
import { home, over } from '../src/pages/static.mjs';

test('homepage: logo is geen H1, beschrijvende H1 met zoekwoord, zoekwoord in title en intro', () => {
  assert.match(home.body, /<p class="h1-brand">Boekhoud<b>Match<\/b>\.nl<\/p>\n<h1 class="tagline">Boekhoudprogramma kiezen als zzp'er\? Gewoon\. Zonder gedoe\.<\/h1>/);
  assert.equal((home.body.match(/<h1/g) || []).length, 1);
  assert.ok(home.title.length <= 60, `title ${home.title.length} tekens`);
  assert.match(home.title, /^Boekhoudprogramma zzp/);
  assert.doesNotMatch(home.title, /vergelijken/i, 'niet concurreren met /boekhoudprogramma-vergelijken/');
  assert.match(home.body, /<p class="lead">[^<]*boekhoudprogramma[^<]*zzp/);
});

test('/over/: vaste zin over Dave en overzicht van wat er op de site staat', () => {
  assert.match(over.body, /Ons team/); assert.doesNotMatch(over.body, /Dave West|dave-west/);
  assert.match(over.body, /<h2>Wat je hier vindt<\/h2>/);
});
