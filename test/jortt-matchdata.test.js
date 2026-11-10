// Jortt ZZP 250 boekingen = richtlijn (vlag boekingenRichtlijn).
// L4 (SC B3): Jortt.actie = null; welkomstactie/loonstroken-gratis/HR-bèta hebben op jortt.nl/prijs/ geen kalender-einddatum (nagelezen 10-11-2026).
// Alleen teksten/vlag; de match (rangorde, scores, gekozen pakketten, prijzen) blijft gelijk op de 6480 combinaties zonder extra's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { match, beoordeel, normaliseer, VRAGEN } from '../src/lib/match.js';
import { limieten, pakketTabel } from '../src/lib/weergave.mjs';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';

const jortt = PAKKETTEN.find((a) => a.id === 'jortt');
const zzp = jortt.plannen.find((p) => p.id === 'zzp');
const zonderReden = (r) => ({ ...r, nee: r.nee.length });
function alleCombinaties(pakketten) {
  const uit = [];
  for (const [rechtsvorm] of VRAGEN.rechtsvorm) for (const [facturen] of VRAGEN.facturen) for (const [uitgaven] of VRAGEN.uitgaven)
  for (const [btw] of VRAGEN.btw) for (const [bank] of VRAGEN.bank) for (const [ib] of VRAGEN.ib) for (const [budget] of VRAGEN.budget) {
    const a = { rechtsvorm, facturen, uitgaven, btw, bank, ib, extra: [], budget };
    const n = normaliseer(a);
    uit.push({ a: [rechtsvorm, facturen, uitgaven, btw, bank, ib, String(budget)], top: match(pakketten, a).map(zonderReden),
      alle: pakketten.flatMap((x) => x.plannen.map((p) => zonderReden(beoordeel(x, p, n)))) });
  }
  return uit;
}

test('6480 match()-combinaties zonder extra\'s: dezelfde uitslag als parent 9ede387 (alleen redentekst mag verschillen)', () => {
  const uit = alleCombinaties(PAKKETTEN);
  assert.equal(uit.length, 6480);
  // sha256 van dezelfde normalisatie, berekend op 258caf1 (= ebf0f9d) met /workspace/tmp/bm-matchsnap/snap.mjs.
  // Verandert dit bewust (prijzen of matchregels), dan opnieuw vastleggen na SC- en MM-OK.
  assert.equal(createHash('sha256').update(JSON.stringify(uit)).digest('hex'), 'e2ed41080ef4adf291552870e4e69dfc8898ae88c6d46c90942fc2f5476c5411');
});

test('boekingenRichtlijn en actie veranderen de match niet (blijvende invariant)', () => {
  const zonder = PAKKETTEN.map((a) => ({ ...a, actie: a.id === 'jortt' ? 'x' : a.actie, plannen: a.plannen.map(({ boekingenRichtlijn, ...p }) => p) }));
  assert.deepEqual(alleCombinaties(zonder), alleCombinaties(PAKKETTEN));
});

test('Jortt: actie is null (L4), vlag op ZZP, grens blijft 250', () => {
  assert.equal(jortt.actie, null);
  assert.equal(zzp.boekingenMaand, 250);
  assert.equal(zzp.boekingenRichtlijn, true);
  assert.deepEqual(PAKKETTEN.flatMap((a) => a.plannen.filter((p) => p.boekingenRichtlijn).map((p) => `${a.id}/${p.id}`)), ['jortt/zzp']);
  const body = aanbiederPages.find((x) => x.path === '/jortt/').body;
  assert.doesNotMatch(body, /<dt>Actie<\/dt>/);
  assert.doesNotMatch(body, /(?<![0-9])9,95/);
});

test('Kaartlabel en nee-reden bij de richtlijn', () => {
  assert.match(limieten(zzp), /tot 250 boekingen\/mnd \(richtlijn\)/);
  assert.doesNotMatch(pakketTabel(jortt), /max\. 250 boekingen/);
  const r = beoordeel(jortt, zzp, normaliseer({ facturen: 250, uitgaven: 150 }));
  assert.ok(r.nee.includes('Jortt adviseert tot 250 boekingen per maand (richtlijn); jij: ca. 803. Jortt MKB past dan beter.'), r.nee.join(' | '));
  // Zonder vlag blijft de oude tekst (andere aanbieders).
  const { boekingenRichtlijn, ...kaal } = zzp;
  assert.ok(beoordeel(jortt, kaal, normaliseer({ facturen: 250, uitgaven: 150 })).nee.includes('Max. 250 boekingen per maand (jij: ca. 803).'));
});

test('Gidsen: geen "max. 250" meer bij Jortt ZZP; geen Jortt-€ 9,95-actie', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  for (const f of readdirSync('content/gids')) {
    const t = readFileSync(`content/gids/${f}`, 'utf8');
    assert.doesNotMatch(t, /Jortt ZZP[^\n]*(max\.|maximaal) 250/i, f);
    assert.doesNotMatch(t, /Jortt[^\n]*(?<![0-9])9,95/, f);
    assert.doesNotMatch(t, /Jortt[^\n]*3 maanden €/, f);
  }
});

test('B3 extra gidsen: /boekhoudprogramma-starters/ en /gratis-boekhoudprogramma/ 12-11; datePublished blijft 10-10', async () => {
  const { gidsPages } = await import('../src/pages/gids.mjs');
  const pages = gidsPages();
  for (const path of ['/boekhoudprogramma-starters/', '/gratis-boekhoudprogramma/']) {
    const p = pages.find((x) => x.path === path);
    const art = p.schema.find((s) => s['@type'] === 'Article');
    assert.equal(art.datePublished, '2026-10-10', path);
    assert.equal(art.dateModified, '2026-11-12', path);
    assert.equal(p.updated, '2026-11-12', path);
    assert.equal(p.stamp.updated, '2026-11-12', path);
  }
});

test('B1: bankkoppeling, urenregistratie en beste-zzp krijgen pushdatum 12-11; datePublished blijft', async () => {
  const { gidsPages } = await import('../src/pages/gids.mjs');
  const pages = gidsPages();
  const cases = [
    ['/bankkoppeling-boekhoudprogramma/', '2026-10-23'],
    ['/urenregistratie-zzp/', '2026-10-10'],
    ['/beste-boekhoudprogramma-zzp/', '2026-10-10'],
  ];
  for (const [path, published] of cases) {
    const p = pages.find((x) => x.path === path);
    const art = p.schema.find((s) => s['@type'] === 'Article');
    assert.equal(art.datePublished, published, path);
    assert.equal(art.dateModified, '2026-11-12', path);
    assert.equal(p.updated, '2026-11-12', path);
    assert.equal(p.stamp.updated, '2026-11-12', path);
  }
  const beste = pages.find((x) => x.path === '/beste-boekhoudprogramma-zzp/');
  assert.match(beste.body, /Eenmanszaak, tot 25 facturen en 50 uitgaven per maand, met offertes, btw-aangifte, bankkoppeling en hulp bij de aangifte, budget tot € 50\./);
});
