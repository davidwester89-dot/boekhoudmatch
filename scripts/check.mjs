// Controleert de gebouwde site (dist/) op SEO- en kwaliteitsregels. Faalt met exit 1 bij fouten.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist';
const errors = [];
const files = [];
const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(join(d, e.name)) : files.push(join(d, e.name))));
walk(OUT);
const htmls = files.filter((f) => f.endsWith('.html') && !f.includes('/tools/'));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const titles = new Map();
const descs = new Map();
const exists = (href) => {
  const p = href.split(/[?#]/)[0];
  if (p === '' || p === '/') return existsSync(join(OUT, 'index.html'));
  const f = join(OUT, p);
  return existsSync(f) && (statSync(f).isFile() || existsSync(join(f, 'index.html')));
};

for (const f of htmls) {
  const h = readFileSync(f, 'utf8');
  const rel = f.slice(OUT.length);
  const noindex = h.includes('name="robots" content="noindex"');
  const title = decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!title) errors.push(`${rel}: geen <title>`);
  if (title.length > 62) errors.push(`${rel}: title ${title.length} tekens (max 62): ${title}`);
  if (!desc) errors.push(`${rel}: geen meta description`);
  if (desc.length > 155) errors.push(`${rel}: description ${desc.length} tekens (max 155)`);
  if (desc.length < 70) errors.push(`${rel}: description te kort (${desc.length})`);
  if (!noindex) {
    if (titles.has(title)) errors.push(`${rel}: dubbele title met ${titles.get(title)}`);
    if (descs.has(desc)) errors.push(`${rel}: dubbele description met ${descs.get(desc)}`);
    titles.set(title, rel); descs.set(desc, rel);
    if (!/<link rel="canonical" href="https:\/\/boekhoudmatch\.nl\/[^"]*">/.test(h)) errors.push(`${rel}: geen canonical`);
  }
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: ${h1} keer <h1> (moet 1 zijn)`);
  if (!h.includes('<html lang="nl">')) errors.push(`${rel}: lang=nl ontbreekt`);
  const og = (h.match(/<meta property="og:image" content="https:\/\/boekhoudmatch\.nl(\/og\/[^"]+)"/) || [])[1];
  if (!og || !existsSync(join(OUT, og))) errors.push(`${rel}: og:image ontbreekt of bestaat niet (${og})`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { errors.push(`${rel}: ongeldige JSON-LD`); }
  }
  if (h.includes('"FAQPage"') && !h.includes('<details><summary>')) errors.push(`${rel}: FAQPage-schema zonder zichtbare FAQ`);
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) errors.push(`${rel}: <img> zonder alt`);
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) if (!exists(m[1])) errors.push(`${rel}: dode interne link ${m[1]}`);
  for (const m of h.matchAll(/src="(\/[^"]*)"/g)) if (!exists(m[1])) errors.push(`${rel}: ontbrekend bestand ${m[1]}`);
  // Analytics: gtag.js nooit vast in de HTML (laadt pas na toestemming); consent-script alleen als er een GA_ID is.
  if (/<script[^>]+src="https?:\/\//.test(h)) errors.push(`${rel}: extern script in de HTML (mag alleen na toestemming)`);
  const ga = /<body[^>]* data-ga="G-[A-Z0-9]+"/.test(h);
  if (ga !== h.includes('src="/js/consent.js"')) errors.push(`${rel}: consent.js en GA_ID horen samen`);
  if (!ga && /googletagmanager|google-analytics/.test(h)) errors.push(`${rel}: Google-domein zonder GA_ID`);
  if (ga && !h.includes('data-consent-open>Cookie-instellingen<')) errors.push(`${rel}: link Cookie-instellingen ontbreekt`);
  const text = h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  for (const bad of [/partnerplek/i, /\bTODO\b/, /lorem ipsum/i, /\bplaceholder\b/i, /\bunit ?test/i, /\bdeveloper\b/i, /\{\{\w+\}\}/]) {
    if (bad.test(text)) errors.push(`${rel}: verboden tekst ${bad}`);
  }
}
const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
for (const m of sitemap.matchAll(/<loc>https:\/\/boekhoudmatch\.nl([^<]*)<\/loc>/g)) if (!exists(m[1])) errors.push(`sitemap: ${m[1]} bestaat niet`);
// Redirectpagina's (meta refresh): noindex, canonical naar bestaand doel, niet in de sitemap
for (const f of htmls) {
  const h = readFileSync(f, 'utf8');
  const m = h.match(/<meta http-equiv="refresh" content="0; url=https:\/\/boekhoudmatch\.nl([^"]*)">/);
  if (!m) continue;
  const rel = f.slice(OUT.length).replace(/index\.html$/, '');
  if (!h.includes('name="robots" content="noindex"')) errors.push(`${rel}: redirect zonder noindex`);
  if (!h.includes(`<link rel="canonical" href="https://boekhoudmatch.nl${m[1]}">`)) errors.push(`${rel}: redirect-canonical wijkt af van doel`);
  if (!exists(m[1])) errors.push(`${rel}: redirectdoel ${m[1]} bestaat niet`);
  if (sitemap.includes(`<loc>https://boekhoudmatch.nl${rel}</loc>`)) errors.push(`${rel}: redirect staat in sitemap`);
}
for (const f of ['robots.txt', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'site.webmanifest', 'blog/feed.xml', '404.html', '.nojekyll']) if (!existsSync(join(OUT, f))) errors.push(`ontbreekt: ${f}`);

if (errors.length) { console.error(errors.map((e) => '✗ ' + e).join('\n')); console.error(`\n${errors.length} fout(en)`); process.exit(1); }
console.log(`✓ ${htmls.length} pagina's gecontroleerd: titles, descriptions, canonical, h1, og:image, JSON-LD, links, sitemap`);
