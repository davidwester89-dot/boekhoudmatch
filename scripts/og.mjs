// Maakt Open Graph-afbeeldingen (1200×630) en favicons met headless Chrome.
// Gebruik: node scripts/og.mjs            (alleen ontbrekende afbeeldingen)
//          node scripts/og.mjs --force    (alles opnieuw)
// Draait lokaal (niet in CI); de PNG's worden meegecommit in src/assets/og en src/assets/icons.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LOGO } from '../src/layout.mjs';
import { parsePost } from '../src/lib/markdown.mjs';

const CHROME = process.env.CHROME || ['google-chrome', 'chromium', 'chromium-browser'].find((c) => { try { execFileSync('which', [c]); return true; } catch { return false; } });
if (!CHROME) { console.error('Geen Chrome/Chromium gevonden; zet CHROME=/pad/naar/chrome'); process.exit(1); }
const force = process.argv.includes('--force');
const tmp = mkdtempSync(join(tmpdir(), 'og-'));

function shot(html, out, w, h) {
  const f = join(tmp, 'p.html');
  writeFileSync(f, html);
  execFileSync(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', '--force-device-scale-factor=1', `--window-size=${w},${h}`, `--screenshot=${out}`, 'file://' + f], { stdio: 'ignore' });
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const ogHtml = (kicker, title, sub) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#fbf6ef;font-family:ui-rounded,"SF Pro Rounded","DejaVu Sans",system-ui,sans-serif;color:#1d2b36;position:relative;overflow:hidden}
.blob{position:absolute;right:-120px;top:-120px;width:520px;height:520px;border-radius:50%;background:#f6e2cc}
.blob2{position:absolute;right:120px;bottom:-200px;width:380px;height:380px;border-radius:50%;background:#e8f1ec}
.in{position:absolute;left:80px;top:70px;right:160px;bottom:70px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px;font-weight:800;font-size:34px}.brand svg{width:60px;height:60px}.brand b{color:#b44d22}
.k{margin-top:auto;display:inline-block;align-self:flex-start;background:#1f5f4f;color:#fff;font-weight:700;font-size:26px;padding:8px 20px;border-radius:99px}
h1{font-size:${title.length > 48 ? 60 : 72}px;line-height:1.08;letter-spacing:-1.5px;margin-top:22px;font-weight:800}
p{font-size:30px;color:#6b5e52;margin-top:20px}
</style></head><body><div class="blob"></div><div class="blob2"></div><div class="in"><div class="brand">${LOGO}<span>Boekhoud<b>Match</b></span></div><span class="k">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></div></body></html>`;

const OG = {
  home: ['Voor zzp\'ers', 'Vind het boekhoudprogramma dat bij je past', 'Echte prijzen · eerlijk uitgelegd · gratis'],
  match: ['Gratis · 8 vragen', 'Welk boekhoudprogramma past bij jou?', 'Echte prijzen van de aanbieders zelf'],
  vergelijken: ['Prijzen 2026', 'Boekhoudprogramma\'s vergelijken', 'Prijs, limieten, btw-aangifte en bankkoppeling'],
  netto: ['Rekentool 2026', 'Netto inkomen zzp berekenen', 'Met zelfstandigenaftrek, mkb-vrijstelling en Zvw'],
  uurtarief: ['Rekentool 2026', 'Uurtarief zzp berekenen', 'Ook vanuit je huidige salaris'],
  btw: ['Rekentool', 'Btw berekenen', '21% of 9%, inclusief en exclusief'],
  factuur: ['Gratis tool', 'Offerte en factuur maken', 'Zonder account, alles in je eigen browser'],
  salderen: ['Ook handig', 'Einde salderen 2027: wat kost het jou?', 'Reken het uit met je jaarafrekening'],
  batterij: ['Ook handig', 'Verdient een thuisbatterij zich terug?', 'Uur voor uur doorgerekend'],
  blog: ['Blog', 'Boekhouding en belasting voor zzp\'ers', 'Kort uitgelegd, met officiële bronnen'],
};
for (const f of readdirSync('content/blog').filter((x) => x.endsWith('.md'))) {
  const p = parsePost(f, readFileSync(join('content/blog', f), 'utf8'));
  OG['blog-' + p.slug] = ['Blog', p.title, 'BoekhoudMatch · ' + p.date.split('-').reverse().join('-')];
}

// Gidsen en aanbiederpagina's: titel van de pagina, geen prijzen of datums (die veranderen).
for (const f of existsSync('content/gids') ? readdirSync('content/gids').filter((x) => x.endsWith('.md')) : []) {
  const t = (readFileSync(join('content/gids', f), 'utf8').match(/^title:\s*(.+)$/m) || [])[1];
  if (t) OG['gids-' + f.replace(/\.md$/, '')] = [/ vs /.test(t) ? 'Vergelijking' : 'Gids', t.replace(/\s*\(20\d\d\)$/, ''), 'Prijs, limieten en bron van de aanbieder zelf'];
}
const { PAKKETTEN } = await import('../src/lib/pakketten.js');
const { REDACTIE } = await import('../src/lib/aanbieders.js');
for (const a of PAKKETTEN) OG['vendor-' + REDACTIE[a.id].slug] = ['Prijzen 2026', `${REDACTIE[a.id].kort}: prijzen en pakketten`, 'Per pakket: prijs, limieten, btw-aangifte en bank'];

mkdirSync('src/assets/og', { recursive: true });
let n = 0;
for (const [k, [kicker, title, sub]] of Object.entries(OG)) {
  const out = `src/assets/og/${k}.png`;
  if (existsSync(out) && !force) continue;
  shot(ogHtml(kicker, title, sub), out, 1200, 630); n++;
  console.log('og', out);
}

// Favicons
mkdirSync('src/assets/icons', { recursive: true });
const iconHtml = (size, pad) => `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px;background:${pad ? '#fbf6ef' : 'transparent'};display:grid;place-items:center}svg{width:${pad ? Math.round(size * 0.8) : size}px;height:${pad ? Math.round(size * 0.8) : size}px}</style></head><body>${LOGO}</body></html>`;
const icons = [['favicon-32.png', 32, false], ['apple-touch-icon.png', 180, true], ['icon-192.png', 192, true], ['icon-512.png', 512, true]];
for (const [name, size, pad] of icons) {
  const out = `src/assets/icons/${name}`;
  if (existsSync(out) && !force) continue;
  shot(iconHtml(size, pad), out, size, size); console.log('icon', out);
}
writeFileSync('src/assets/icons/favicon.svg', LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true" focusable="false"', ''));
// favicon.ico met de 32px PNG erin (ICO mag PNG-data bevatten)
const png = readFileSync('src/assets/icons/favicon-32.png');
const hdr = Buffer.alloc(22);
hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
hdr.writeUInt8(32, 6); hdr.writeUInt8(32, 7); hdr.writeUInt8(0, 8); hdr.writeUInt8(0, 9);
hdr.writeUInt16LE(1, 10); hdr.writeUInt16LE(32, 12); hdr.writeUInt32LE(png.length, 14); hdr.writeUInt32LE(22, 18);
writeFileSync('src/assets/icons/favicon.ico', Buffer.concat([hdr, png]));
rmSync(tmp, { recursive: true, force: true });
console.log(`Klaar: ${n} OG-afbeelding(en) gemaakt.`);
