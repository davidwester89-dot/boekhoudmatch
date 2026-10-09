import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { layout, SITE } from './src/layout.mjs';
import salderen from './src/pages/salderen.mjs';
import thuisbatterij from './src/pages/thuisbatterij.mjs';
import zzpnetto from './src/pages/zzpnetto.mjs';
import uurtarief from './src/pages/uurtarief.mjs';
import * as S from './src/pages/static.mjs';
import kiezen from './src/pages/kiezen.mjs';
import vergelijken from './src/pages/vergelijken.mjs';

const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const pages = [S.home, kiezen, vergelijken, zzpnetto, uurtarief, S.btw, S.offerte, salderen, thuisbatterij, S.bronnen, S.over, S.privacy, S.disclaimer, S.notfound];
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };

for (const p of pages) {
  const file = p.path.endsWith('.html') ? join(OUT, p.path) : join(OUT, p.path, 'index.html');
  write(file, layout(p));
}

// assets
cpSync('src/assets/css', join(OUT, 'css'), { recursive: true });
cpSync('src/assets/js', join(OUT, 'js'), { recursive: true });
cpSync('src/lib', join(OUT, 'js/lib'), { recursive: true });
cpSync('src/assets/data', join(OUT, 'data'), { recursive: true });

// OfferteKlaar hergebruiken, zonder externe Google Fonts (privacy, geen derde partijen)
let ok = readFileSync('src/vendor/offerteklav.html', 'utf8');
ok = ok.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
ok = ok.replace('<title>', '<meta name="robots" content="noindex"><link rel="canonical" href="' + SITE.domain + '/offerte-factuur-maken/">\n<title>');
write(join(OUT, 'tools/offerteklaar.html'), ok);

write(join(OUT, '.nojekyll'), '');
write(join(OUT, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0f6b5c"/><text x="16" y="22" font-family="system-ui,Arial" font-size="18" font-weight="800" text-anchor="middle" fill="#fff">B</text></svg>');
write(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.domain}/sitemap.xml\n`);
const urls = pages.filter((p) => !p.noindex).map((p) => `<url><loc>${SITE.domain}${p.path}</loc><lastmod>${SITE.updated}</lastmod></url>`);
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
// Cloudflare Pages headers: beveiliging + caching
write(join(OUT, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: interest-cohort=(), geolocation=(), camera=(), microphone=()
  Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'
/css/*
  Cache-Control: public, max-age=86400
/js/*
  Cache-Control: public, max-age=86400
/data/*
  Cache-Control: public, max-age=604800
`);

const files = [];
const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => e.isDirectory() ? walk(join(d, e.name)) : files.push(join(d, e.name)));
walk(OUT);
console.log(`Built ${pages.length} pages, ${files.length} files → ${OUT}/  (partnerplekken ${SITE.showSlots ? 'zichtbaar' : 'verborgen'})`);
