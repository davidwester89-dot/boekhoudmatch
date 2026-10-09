// Maakt een nieuw blogbestand met de juiste opzet.
// Gebruik: npm run new-post -- <slug> "<Titel>"   (bijv. npm run new-post -- btw-aangifte-q4-2026 "Btw-aangifte Q4 2026: ...")
import { writeFileSync, existsSync } from 'node:fs';

const [slug, title = 'Titel van het artikel'] = process.argv.slice(2);
if (!slug || !/^[a-z0-9-]+$/.test(slug)) { console.error('Geef een slug op met alleen a-z, 0-9 en -'); process.exit(1); }
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date());
const file = `content/blog/${today}-${slug}.md`;
if (existsSync(file)) { console.error(`${file} bestaat al`); process.exit(1); }
writeFileSync(file, `---
title: ${title}
seo_title: ${title.slice(0, 60)}
description: Eén of twee zinnen (70-155 tekens) die zeggen wat de lezer leert.
date: ${today}
updated: ${today}
tools: /zzp-netto-inkomen/, /boekhoudprogramma-kiezen/
sources:
- Naam van de officiële bron | https://www.belastingdienst.nl/...
- Tweede bron | https://www.rijksoverheid.nl/...
---
Inleiding van 2-3 zinnen: wat is er aan de hand en voor wie is het belangrijk?

> **Let op:** markeer voorstellen duidelijk als voorstel (nog niet aangenomen).

## Wat verandert er?

## Wat betekent het voor jou?

## Wat kun je nu doen?

1. Eerste stap.
2. Tweede stap.
`);
console.log(`Aangemaakt: ${file}\nVolgende stap: schrijf de tekst, dan npm run og && npm test && npm run build && npm run check`);
