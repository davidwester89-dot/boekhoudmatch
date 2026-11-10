import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aanbiederPages } from '../src/pages/aanbieder.mjs';
import { PAKKETTEN } from '../src/lib/pakketten.js';

const p = aanbiederPages.find((x) => x.path === '/jortt/');
const jortt = PAKKETTEN.find((a) => a.id === 'jortt');
const pl = (id) => jortt.plannen.find((x) => x.id === id);
const eur = (x) => '€ ' + x.toFixed(2).replace('.', ',');
const nb = (s) => s.replace(/€&nbsp;/g, '€ '); // verdieping zet een harde spatie na €

test('Jortt deep-dive: H2-volgorde (prijs, pakketten, extra kosten, boekhouder, FAQ)', () => {
  const h2 = [...p.body.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
  const want = ['Wat kost Jortt per maand en per jaar?', 'Wat zit er in elk Jortt-pakket?', 'Extra kosten naast je abonnement', 'Jortt met een boekhouder', 'Veelgestelde vragen over Jortt'];
  assert.deepEqual(h2.filter((h) => want.includes(h)), want);
  assert.match(p.body, /<h3>Is Jortt gratis\?<\/h3>/);
});

test('Jortt deep-dive: prijzen in de tabel komen uit pakketten.js en kloppen op de cent (L3)', () => {
  for (const id of ['zzp', 'mkb', 'plus']) {
    const x = pl(id), jaar = Math.round(12 * x.prijsJaar * 100) / 100;
    assert.ok(nb(p.body).includes(`<th scope="row">${x.naam}</th><td class="n">${eur(x.prijs)}</td><td>${eur(x.prijsJaar)} p/m<br>${eur(jaar)} per jaar</td>`), id);
  }
  assert.match(nb(p.body), /12 × € 21,95 = € 263,40 \(onze rekensom\): € 24,00 meer dan bij jaarbetaling/);
  // L4: welkomstactie (3 mnd € 9,95, eerstejaarsbedragen) heeft bij Jortt geen einddatum, dus niet in de verdieping.
  assert.doesNotMatch(nb(p.body), /Welkomstactie|€ 209,40|€ 281,40|€ 371,40/);
});

test('Jortt deep-dive: geen placeholders, geen dollars, geen extra partnerlinks in de tekst', () => {
  assert.doesNotMatch(p.body.replace('{{related}}', ''), /\{\{/); // {{related}} vult build.mjs
  assert.doesNotMatch(p.body, /\$|USD|dollar/i);
  assert.equal((p.body.match(/rel="[^"]*sponsored/g) || []).length, (p.body.match(/class="card vendor-out"/g) || []).length, 'alleen de bestaande partnerknop');
});

test('Jortt deep-dive: interne links en FAQPage-schema zonder HTML', () => {
  for (const href of ['/boekhoudprogramma-vergelijken/', '/boekhoudprogramma-kiezen/', '/jortt-vs-moneymonk/', '/goedkoopste-boekhoudprogramma/', '/gratis-boekhoudprogramma/', '/bankkoppeling-boekhoudprogramma/', '/blog/wat-kost-een-boekhoudprogramma/']) {
    assert.ok(p.body.includes(`href="${href}`), href);
  }
  const faq = p.schema.find((s) => s['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map((q) => q.name), ['Is Jortt gratis?', 'Kan ik Jortt per maand opzeggen?', 'Wat kost Jortt voor bestaande klanten in 2027?']);
  for (const q of faq.mainEntity) assert.doesNotMatch(q.acceptedAnswer.text, /\{\{|<[a-z]/);
});

test('Jortt deep-dive: bijwerkdatum = pushdatum (L7) in stamp en dateModified; extra bronnen onderaan', () => {
  assert.equal(p.updated, '2026-11-12');
  assert.equal(p.schema[0].dateModified, '2026-11-12');
  assert.match(p.body, /jortt\.nl\/uitleg\/faq\/prijswijziging-jortt\/" rel="noopener"/);
  assert.match(p.body, /jortt\.nl\/boekhouder\/" rel="noopener"/);
});

test('Andere aanbiederpagina\'s: geen verdieping, Moneybird-vraag blijft een eigen H2', () => {
  const mb = aanbiederPages.find((x) => x.path === '/moneybird/');
  assert.match(mb.body, /<h2>Is Moneybird nog gratis\?<\/h2>/);
  assert.doesNotMatch(mb.body, /Veelgestelde vragen over/);
});

test('Jortt: eigen title en meta (SEO 29-10), og:title gelijk, bedragen uit pakketten.js', () => {
  const title = 'Jortt kosten 2026: prijs per maand en jaar | BoekhoudMatch';
  const meta = `Jortt ZZP kost ${eur(pl('zzp').prijs)} per maand of ${eur(pl('zzp').prijsJaar)} bij jaarbetaling (excl. btw). Bekijk pakketten, limieten, extra kosten en voorwaarden.`;
  assert.equal(pl('starter').prijs, 0);
  assert.equal(p.title, title);
  assert.equal(p.ogTitle, title);
  assert.equal(p.description, meta);
  assert.equal(p.description, 'Jortt ZZP kost € 21,95 per maand of € 19,95 bij jaarbetaling (excl. btw). Bekijk pakketten, limieten, extra kosten en voorwaarden.');
  assert.ok(p.title.length <= 60, `title ${p.title.length}`);
  assert.ok(p.description.length >= 120 && p.description.length <= 155, `meta ${p.description.length}`);
  assert.doesNotMatch(p.description, /&nbsp;|\u00a0|\{\{/);
  // Andere aanbieders houden het sjabloon.
  const mb = aanbiederPages.find((x) => x.path === '/moneybird/');
  assert.equal(mb.title, 'Is Moneybird nog gratis? Geen gratis pakket | BoekhoudMatch');
  assert.equal(mb.ogTitle, 'Moneybird: prijzen en pakketten');
});

test('Jortt-jaartotalen gelabeld als regulier tarief; geen welkomstactie op /jortt/; jortt.shop-bron 4,5%; L4-vervangtekst (SC B3)', () => {
  const p = aanbiederPages.find((x) => x.path === '/jortt/');
  const nb = (s) => s.replace(/€&nbsp;/g, '€ ');
  assert.match(p.body, /<th>Bij jaarbetaling \(regulier tarief\)<\/th>/);
  assert.doesNotMatch(p.body, /welkomstactie/i);
  assert.doesNotMatch(p.body, /(?<![0-9])9,95|30 dagen gratis|HR-module|gratis in bèta|loonstroken gratis|€ 209,40|€ 281,40|€ 371,40/i);
  assert.match(nb(p.body), /<li><strong>Loonstroken:<\/strong> € 9,50 per loonstrook per werknemer per maand, in Starter, MKB en Plus \(niet in ZZP\).<\/li>/);
  assert.match(p.body, /De betaalde abonnementen hebben geen opstartkosten\. Een maandabonnement zeg je per maand op; een jaarabonnement loopt twaalf maanden\./);
  assert.match(nb(p.body), /Daarvoor heb je ZZP \(€ 21,95 per maand, exclusief btw\), MKB of Plus nodig\./);
  assert.match(p.body, /data-cta="visit">Bekijk Jortt</);
  assert.doesNotMatch(p.body, /proberen bij Jortt/);
  assert.match(p.body, /4,5% van je omzet plus portokosten\. Bron: <a href="https:\/\/www\.jortt\.nl\/webshop\/">jortt\.nl\/webshop<\/a>/);
  assert.ok((p.bronnen || []).some((b) => b.url === 'https://www.jortt.nl/webshop/') || p.body.includes('https://www.jortt.nl/webshop/'));
});
