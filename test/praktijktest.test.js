import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PRAKTIJKTESTS } from '../src/lib/praktijktests.js';
import { PAKKETTEN } from '../src/lib/pakketten.js';

const ids = new Set(PAKKETTEN.map((a) => a.id));

test('praktijktests: bestaande aanbieders, vaste velden, geldige datum', () => {
  for (const [id, t] of Object.entries(PRAKTIJKTESTS)) {
    assert.ok(ids.has(id), `onbekende aanbieder ${id}`);
    assert.match(t.datum, /^\d{4}-\d{2}-\d{2}$/, id);
    assert.ok(t.pakket && typeof t.aanmelden === 'object' && typeof t.metingen === 'object', id);
    assert.ok(Array.isArray(t.grenzen) && t.grenzen.length > 0, `${id}: grenzen ontbreken`);
    assert.ok(t.waarnemingen.length > 0 && t.waarnemingen.length <= 4, `${id}: 1 tot 4 waarnemingen`);
  }
});

test('praktijktests: elke screenshot bestaat, heeft een datum, alt, bijschrift en afmetingen', () => {
  for (const [id, t] of Object.entries(PRAKTIJKTESTS)) {
    assert.ok(t.screenshots.length > 0, id);
    for (const s of t.screenshots) {
      const f = 'src/assets' + s.src;
      assert.ok(existsSync(f), `${f} bestaat niet`);
      assert.match(s.src, new RegExp(`^/img/praktijktest/${id}-[a-z0-9-]+-\\d{4}-\\d{2}-\\d{2}\\.webp$`), s.src);
      assert.match(s.datum, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(s.src.includes(s.datum), `${s.src}: datum niet in bestandsnaam`);
      assert.ok(s.alt && s.alt.length > 20, `${s.src}: alt-tekst`);
      assert.match(s.bijschrift, /^Screenshot BoekhoudMatch, /);
      assert.equal(s.width, 1200);
      const b = readFileSync(f);
      assert.equal(b.toString('ascii', 0, 4), 'RIFF'); assert.equal(b.toString('ascii', 8, 12), 'WEBP');
    }
  }
});

test('praktijktests: waarnemingen zonder sterren, scores of oordeelwoorden', () => {
  const verboden = /[★☆⭐]|\b\d+([.,]\d+)?\s*(\/|van de|uit)\s*(5|10)\b|\b(score|cijfer|rapportcijfer|sterren?)\b|\b(makkelijk|gemakkelijk|lastig|moeilijk|goed|slecht|snel|traag|handig|onhandig|prima|uitstekend|top|super|fijn|beste|slechtste|aanrader|helaas|gelukkig|perfect|verwarrend|intuïtief|omslachtig)\b/i;
  for (const [id, t] of Object.entries(PRAKTIJKTESTS)) for (const w of t.waarnemingen) assert.doesNotMatch(w, verboden, `${id}: "${w}"`);
});

test('match.js en situaties lezen praktijktests nooit', () => {
  for (const f of ['src/lib/match.js', 'src/lib/situaties.mjs']) assert.doesNotMatch(readFileSync(f, 'utf8'), /praktijktest/i);
});
