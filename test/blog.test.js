import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { parsePost, markdown, parseFrontmatter } from '../src/lib/markdown.mjs';

const dir = new URL('../content/blog/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

test('markdown: koppen, lijsten, links, tabel en kader', () => {
  const html = markdown('## Kop één\n\nTekst met **vet** en [link](https://example.org).\n\n- a\n- b\n\n1. x\n2. y\n\n> Let op\n\n| A | B |\n|---|---|\n| 1 | 2 |');
  assert.match(html, /<h2 id="kop-een">Kop één<\/h2>/);
  assert.match(html, /<strong>vet<\/strong>/);
  assert.match(html, /<a href="https:\/\/example.org" rel="noopener">link<\/a>/);
  assert.match(html, /<ul><li>a<\/li><li>b<\/li><\/ul>/);
  assert.match(html, /<ol><li>x<\/li><li>y<\/li><\/ol>/);
  assert.match(html, /<blockquote><p>Let op<\/p><\/blockquote>/);
  assert.match(html, /<th>A<\/th><th>B<\/th>.*<td>1<\/td><td>2<\/td>/s);
});

test('markdown: html in tekst wordt ge-escaped', () => {
  assert.match(markdown('<script>x</script>'), /&lt;script&gt;/);
});

test('frontmatter: lijst en sleutels', () => {
  const { meta } = parseFrontmatter('---\ntitle: T\nsources:\n- A | https://a\n- B | https://b\n---\nbody');
  assert.equal(meta.title, 'T');
  assert.deepEqual(meta.sources, ['A | https://a', 'B | https://b']);
});

test('er is minstens één blogpost', () => assert.ok(files.length >= 1));

for (const f of files) {
  test(`blogpost ${f} voldoet aan de redactieregels`, () => {
    const p = parsePost(f, readFileSync(new URL(f, dir), 'utf8'));
    assert.match(p.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(p.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(p.updated >= p.date, 'bijgewerkt-datum vóór publicatiedatum');
    assert.ok(f.startsWith(p.date), 'bestandsnaam begint met de publicatiedatum');
    assert.ok(p.seoTitle.length <= 60, `seo_title ${p.seoTitle.length} tekens (max 60)`);
    assert.ok(p.description.length >= 70 && p.description.length <= 155, `description ${p.description.length} tekens (70-155)`);
    assert.ok(p.words >= 600 && p.words <= 1300, `${p.words} woorden (richtlijn 700-1200)`);
    assert.ok(p.sources.length >= 2, 'minstens 2 bronnen');
    for (const s of p.sources) assert.match(s.url, /^https:\/\//, `bron zonder https-url: ${s.title}`);
    assert.ok(p.tools.length >= 1, 'minstens 1 gerelateerde tool');
    assert.ok(!/<h1/.test(p.html), 'gebruik geen # (h1) in de tekst; de titel is de h1');
    if (p.checked) assert.match(p.checked, /^\d{4}-\d{2}-\d{2}$/);
    if (p.image) {
      assert.match(p.image.name, /^[a-z0-9-]+$/, 'image: alleen a-z, 0-9 en -');
      assert.ok(p.image.alt.length >= 20, 'image_alt ontbreekt of is te kort');
      for (const w of [600, 1200]) assert.ok(existsSync(new URL(`../src/assets/img/blog/${p.image.name}-${w}.webp`, import.meta.url)), `afbeelding ${p.image.name}-${w}.webp ontbreekt`);
    }
  });
}
