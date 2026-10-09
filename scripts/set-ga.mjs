// Zet de Google Analytics Metings-ID: npm run set-ga -- G-XXXXXXXXXX   (leeg laten = Analytics en cookiemelding uit)
import { readFileSync, writeFileSync } from 'node:fs';
import { GA_ID_RE } from '../src/lib/consent.js';

const id = (process.argv[2] || '').trim().toUpperCase();
if (id && !GA_ID_RE.test(id)) { console.error(`Ongeldige Metings-ID "${id}". Verwacht iets als G-AB12CD34EF.`); process.exit(1); }
const f = new URL('../src/analytics.config.mjs', import.meta.url);
const src = readFileSync(f, 'utf8');
if (!/^export const GA_ID = '.*';$/m.test(src)) { console.error('GA_ID-regel niet gevonden in src/analytics.config.mjs'); process.exit(1); }
writeFileSync(f, src.replace(/^export const GA_ID = '.*';$/m, `export const GA_ID = '${id}';`));
console.log(id ? `GA_ID = ${id}` : 'GA_ID leeg: Analytics en cookiemelding staan uit');
