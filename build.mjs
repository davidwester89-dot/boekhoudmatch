import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { layout, SITE, RELATED } from './src/layout.mjs';
import salderen from './src/pages/salderen.mjs';
import thuisbatterij from './src/pages/thuisbatterij.mjs';
import zzpnetto from './src/pages/zzpnetto.mjs';
import uurtarief from './src/pages/uurtarief.mjs';
import * as S from './src/pages/static.mjs';
import kiezen from './src/pages/kiezen.mjs';
import vergelijken from './src/pages/vergelijken.mjs';
import { parsePost } from './src/lib/markdown.mjs';
import { postPage, blogIndex, latestHtml, feed } from './src/pages/blog.mjs';

const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };

// Blog: content/blog/*.md → /blog/<slug>/ (nieuwste eerst). Posts met een datum in de toekomst worden overgeslagen.
const today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const posts = readdirSync('content/blog').filter((f) => f.endsWith('.md')).sort().reverse()
  .map((f) => parsePost(f, readFileSync(join('content/blog', f), 'utf8')))
  .filter((p) => p.date <= today);
RELATED.posts = posts;
const ogKey = (p) => (existsSync(`src/assets/og/blog-${p.slug}.png`) ? `blog-${p.slug}` : 'blog');

const home = { ...S.home, body: S.home.body.replace('{{latest}}', latestHtml(posts)) };
const pages = [home, kiezen, vergelijken, zzpnetto, uurtarief, S.btw, S.offerte, blogIndex(posts), ...posts.map((p) => postPage(p, posts, ogKey(p))),
  salderen, thuisbatterij, S.bronnen, S.over, S.privacy, S.disclaimer, S.notfound];

for (const p of pages) {
  const file = p.path.endsWith('.html') ? join(OUT, p.path) : join(OUT, p.path, 'index.html');
  write(file, layout(p));
}

// assets
cpSync('src/assets/js', join(OUT, 'js'), { recursive: true });
cpSync('src/lib', join(OUT, 'js/lib'), { recursive: true, filter: (f) => !f.endsWith('.mjs') });
cpSync('src/assets/data', join(OUT, 'data'), { recursive: true });
cpSync('src/assets/og', join(OUT, 'og'), { recursive: true });
cpSync('src/assets/icons', OUT, { recursive: true });

// Offerte- en factuurtool hergebruiken, zonder externe Google Fonts (privacy, geen derde partijen)
let ok = readFileSync('src/vendor/offerteklav.html', 'utf8');
ok = ok.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
ok = ok.replace('<title>', '<meta name="robots" content="noindex">\n<title>');
write(join(OUT, 'tools/offerteklaar.html'), ok);

write(join(OUT, '.nojekyll'), '');
write(join(OUT, 'site.webmanifest'), JSON.stringify({
  name: 'BoekhoudMatch', short_name: 'BoekhoudMatch', lang: 'nl', start_url: '/', display: 'standalone',
  background_color: '#fbf6ef', theme_color: SITE.theme,
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
}, null, 1));
write(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
const urls = pages.filter((p) => !p.noindex).map((p) => `<url><loc>${SITE.domain}${p.path}</loc><lastmod>${p.updated || SITE.updated}</lastmod></url>`);
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
write(join(OUT, 'blog/feed.xml'), feed(posts));

const files = [];
const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => e.isDirectory() ? walk(join(d, e.name)) : files.push(join(d, e.name)));
walk(OUT);
console.log(`Built ${pages.length} pages (${posts.length} blogposts), ${files.length} files → ${OUT}/  (partnerplekken ${SITE.showSlots ? 'zichtbaar' : 'verborgen'})`);
