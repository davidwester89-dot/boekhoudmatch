import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { top3Verschil } from '../src/lib/top3.js';
execSync('node build.mjs', { stdio: 'ignore' });

test('top-3-hint: erin, eruit, nieuwe nummer 1, gelijk, leeg', () => {
  assert.deepEqual(top3Verschil(['A', 'B', 'C'], ['A', 'B', 'C']), { veranderd: false, tekst: 'Je top-3 blijft gelijk.' });
  assert.equal(top3Verschil(['A', 'B', 'C'], ['D', 'A', 'B']).tekst, 'Dit verandert je top-3: D komt erin; C valt eruit; nieuwe nummer 1: D.');
  assert.equal(top3Verschil(['A', 'B', 'C'], ['A', 'C', 'B']).tekst, 'Dit verandert je top-3: de volgorde verschuift.');
  assert.equal(top3Verschil(['A', 'B', 'C'], ['A', 'D', 'E']).tekst, 'Dit verandert je top-3: D en E komen erin; B en C vallen eruit.');
  assert.match(top3Verschil(['A'], []).tekst, /geen pakket/);
});
test('top-3-hint kent geen partnerlinks; quiz: icoon bij elke vraag, inline', () => {
  assert.doesNotMatch(readFileSync('src/lib/top3.js', 'utf8'), /import/);
  assert.match(readFileSync('src/assets/js/kiezen.js', 'utf8'), /top3Verschil\(bevestigdTop, huidigTop\)/);
  const h = readFileSync('dist/boekhoudprogramma-kiezen/index.html', 'utf8');
  assert.equal((h.match(/<legend><span class="qi"><svg /g) || []).length, 8);
  assert.doesNotMatch(h, /<img[^>]+\.svg/);
});

test('CSP: elke gebouwde pagina met een CSP heeft https://www.google.com in connect-src (gtag-terugval /g/collect)', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  const files = [];
  (function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) files.push(p); } })('dist');
  let metCsp = 0;
  for (const f of files) {
    const h = readFileSync(f, 'utf8');
    const m = h.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/);
    if (!m) continue;
    metCsp++;
    const connect = (m[1].split(';').map((s) => s.trim()).find((s) => s.startsWith('connect-src')) || '').split(/\s+/);
    assert.ok(connect.includes('https://www.google.com'), `${f}: connect-src mist https://www.google.com`);
  }
  assert.ok(metCsp > 0, 'geen pagina met CSP gevonden');
  console.log(`CSP-check: ${metCsp} van ${files.length} pagina's met CSP, allemaal met https://www.google.com in connect-src`);
});
