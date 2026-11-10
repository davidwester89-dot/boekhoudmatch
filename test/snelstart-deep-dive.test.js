import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { PAKKETTEN } from '../src/lib/pakketten.js';
import { match } from '../src/lib/match.js';

const p = aanbiederPages.find((x) => x.path === '/snelstart/');
const ss = PAKKETTEN.find((a) => a.id === 'snelstart');
const pl = (id) => ss.plannen.find((x) => x.id === id);
const eur = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const nb = (s) => s.replace(/€&nbsp;/g, '€ ');
const IDS = ['inorde', 'instap', 'inkaart', 'inbalans', 'inzicht'];

test('SnelStart deep-dive: H2-volgorde (prijs, functies, extra kosten, FAQ), H2 letterlijk van SEO', () => {
  const h2 = [...p.body.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
  const want = ['Wat kost SnelStart per maand?', 'Wat zit er in elk SnelStart-pakket?', 'Extra kosten bij SnelStart', 'Veelgestelde vragen over SnelStart'];
  assert.deepEqual(h2.filter((h) => want.includes(h)), want);
});

test('SnelStart deep-dive: prijstabel uit pakketten.js, alle 5 pakketten, standaardprijs (L1), op de cent (L3)', () => {
  assert.deepEqual(ss.plannen.map((x) => x.id), IDS);
  for (const id of IDS) assert.ok(nb(p.body).includes(`<th scope="row">${pl(id).naam}</th><td class="n">${eur(pl(id).prijs)}</td>`), id);
  assert.match(nb(p.body), /inKaart kost dus 12 × € 22,00 = € 264,00 excl\. btw \(onze rekensom\)/);
  assert.match(p.body, /"Alle prijzen zijn exclusief btw\."/);
});

test('SnelStart deep-dive: functietabel 11 rijen × 5 pakketten; extra kosten letterlijk van snelstart.nl/pakketten', () => {
  const t = p.body.split('Functies per SnelStart-pakket')[1].split('</table>')[0];
  assert.equal((t.match(/<tr><th scope="row">/g) || []).length, 11);
  assert.match(t, /Btw- en ICP-aangifte in één klik<\/th><td>–<\/td><td>–<\/td><td>✓<\/td><td>✓<\/td><td>✓<\/td>/);
  assert.match(t, /Werken met kostenplaatsen<\/th><td>–<\/td><td>–<\/td><td>–<\/td><td>–<\/td><td>✓<\/td>/);
  const b = nb(p.body);
  for (const s of ['€ 3,50 per maand', '€ 2,50 (inOrde), € 3,00 (inStap), € 4,25 (inKaart), € 6,75 (inBalans) of € 10,50 (inZicht)', '"Inbegrepen vanaf inKaart, zonder extra kosten"', '"worden berekend over een maand en worden achteraf gefactureerd"', '"zonder extra kosten per applicatie"']) assert.ok(b.includes(s), s);
});

test('SnelStart deep-dive: geen placeholders/dollars, partnerlinks en CTA ongewijzigd, interne links + keuzehulp', () => {
  assert.doesNotMatch(p.body.replace('{{related}}', ''), /\{\{/);
  assert.doesNotMatch(p.body, /\$|USD|dollar/i);
  const verd = p.body.slice(p.body.indexOf('<h2>Wat kost SnelStart per maand?</h2>'), p.body.indexOf('Veelgestelde vragen over SnelStart'));
  assert.ok(verd.length > 1000);
  assert.doesNotMatch(verd, /sponsored|href="https?:/, 'geen externe of partnerlinks in de verdieping');
  for (const href of ['/boekhoudprogramma-kiezen/', '/boekhoudprogramma-vergelijken/', '/goedkoopste-boekhoudprogramma/', '/bankkoppeling-boekhoudprogramma/']) assert.ok(p.body.includes(`href="${href}`), href);
});

test('SnelStart deep-dive: FAQPage-schema zonder HTML, datums 2026-11-12', () => {
  const faq = p.schema.find((s) => s['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map((q) => q.name), ['Kun je SnelStart gratis proberen?', 'Betaal je SnelStart per maand of per jaar?', 'Kan ik SnelStart zonder boekhouder gebruiken?']);
  for (const q of faq.mainEntity) assert.doesNotMatch(q.acceptedAnswer.text, /\{\{|<[a-z]/);
  assert.equal(p.updated, '2026-11-12');
  assert.equal(p.schema[0].dateModified, '2026-11-12');
});

test('SnelStart: title en meta van SEO (30-10), placeholders {{p:inorde}}/{{p:inzicht}} gerenderd', () => {
  const title = 'SnelStart kosten 2026: prijs per maand | BoekhoudMatch';
  assert.equal(p.title, title);
  assert.equal(p.ogTitle, title);
  assert.equal(p.description, `Wat kost SnelStart per maand? Van ${eur(pl('inorde').prijs)} (inOrde, via een boekhouder) tot ${eur(pl('inzicht').prijs)} (inZicht). Prijs per pakket, btw-aangifte en extra kosten op een rij.`);
  assert.equal(p.description, 'Wat kost SnelStart per maand? Van € 9,50 (inOrde, via een boekhouder) tot € 54,00 (inZicht). Prijs per pakket, btw-aangifte en extra kosten op een rij.');
  assert.ok(p.title.length <= 60);
  assert.equal(p.description.length, 151);
  assert.doesNotMatch(p.description, /&nbsp;|\u00a0|\{\{/);
});

test('Controlegroep E6 ongemoeid: geen verdieping of eigen title', () => {
  for (const slug of ['silvasoft', 'rompslomp', 'tellow', 'exact', 'informer']) {
    const x = aanbiederPages.find((y) => y.path === `/${slug}/`);
    assert.doesNotMatch(x.body, /Veelgestelde vragen over/, slug);
    assert.match(x.title, /prijzen 2026/, slug);
  }
});

test('Inbound links naar /snelstart/ in 3 bestaande pagina\'s', () => {
  for (const f of ['content/blog/2026-10-17-wat-kost-een-boekhoudprogramma.md', 'content/gids/goedkoopste-boekhoudprogramma.md', 'content/gids/btw-aangifte-boekhoudprogramma.md']) {
    assert.match(readFileSync(f, 'utf8'), /\[SnelStart\]\(\/snelstart\/\)/, f);
  }
});

test('SnelStart pakketten.js (MM 30-10): inStap offertes, actie, controledatum', () => {
  assert.equal(pl('inorde').offertes, false);
  for (const id of ['instap', 'inkaart', 'inbalans', 'inzicht']) assert.equal(pl(id).offertes, true, id);
  assert.equal(ss.actie, '30 dagen gratis proberen.'); // live snelstart.nl/pakketten 10-11-2026: '30 dagen gratis'
  // Prijzen niet opnieuw volledig gecontroleerd; alleen instap.offertes en proefduur live nagelezen 10-11-2026. checked blijft CHECKED (2026-10-10).
  assert.equal(ss.gecontroleerd, undefined);
  assert.equal(p.stamp.checked, '2026-10-10');
  assert.equal(p.stamp.updated, "2026-11-12");
});

test('Trendbreuk E6: met offertes gewenst krijgt SnelStart inStap de offertebonus', () => {
  const a = { rechtsvorm: 'eenmanszaak', facturen: 2, uitgaven: 20, btw: 'plichtig', bank: 'auto', ib: 'hulp', budget: 20, extra: ['offertes'] };
  const r = match(PAKKETTEN, a);
  assert.equal(r[0].aanbieder, 'snelstart');
  assert.equal(r[0].plan, 'instap');
  assert.equal(r[0].score, 106.5);
  assert.ok(r[0].plus.includes('Offertes inbegrepen.'));
});

test('SnelStart is bronlink, geen trial-CTA; andere aanbieders ongewijzigd', () => {
  assert.match(p.body, /<a href="https:\/\/www\.snelstart\.nl" rel="noopener">Bron: SnelStart<\/a>/);
  assert.doesNotMatch(p.body, /30 dagen gratis proberen bij SnelStart|class="btn"[^>]*SnelStart|data-cta="(?:trial|visit)"/);
  const mm = aanbiederPages.find((x) => x.path === '/moneymonk/');
  assert.match(mm.body, />30 dagen gratis proberen bij MoneyMonk</);
});

test('Feitenrij SnelStart: "Gratis proberen: 30 dagen" (live 10-11); filter ongewijzigd', async () => {
  const { REDACTIE } = await import('../src/lib/aanbieders.js');
  const vergelijken = (await import('../src/pages/vergelijken.mjs')).default;
  assert.equal(REDACTIE.snelstart.proef, 30);
  assert.match(p.body, /<dt>Gratis proberen<\/dt><dd>30 dagen<\/dd>/);
  const kaart = vergelijken.body.split('data-v="snelstart"')[1].split('data-v="')[0];
  assert.match(kaart, /<dt>Gratis proberen<\/dt><dd>30 dagen<\/dd>/);
  assert.match(vergelijken.body, /data-v="snelstart" [^>]*data-proef="1"/);
});
