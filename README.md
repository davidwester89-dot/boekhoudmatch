# BoekhoudMatch

Bron van [boekhoudmatch.nl](https://boekhoudmatch.nl): gratis tools en artikelen voor zzp'ers over boekhouding, geld en belasting.

- **Boekhoudmatch**: 8 vragen, daarna de pakketten op volgorde met prijs en uitleg. De volgorde gebruikt nooit informatie over partnerschappen (getest).
- **Vergelijken**: alle pakketten naast elkaar, met de prijzen van de aanbieders zelf en de controledatum.
- **Rekentools**: netto inkomen zzp, uurtarief, btw, offerte en factuur, plus salderen en thuisbatterij.
- **Blog**: actuele artikelen met officiële bronnen (`content/blog/*.md`).

Statische site zonder frameworks of externe verzoeken, geen cookies, geen tracking. Contact: davidwester89@gmail.com.

## Ontwikkelen

```bash
python3 data-build/build_hourly.py   # eenmalig: uurdata voor de thuisbatterij-tool (openbare bronnen)
npm test                             # unit tests (berekeningen, match, blogregels)
npm run build                        # bouwt dist/ (SHOW_SLOTS=0 verbergt partnerplekken, zoals in productie)
npm run check                        # SEO- en kwaliteitscontrole op dist/
npm run serve                        # lokaal bekijken op http://localhost:8080
npm run og                           # OG-afbeeldingen en favicons maken (headless Chrome, lokaal)
```

Deploy: elke push naar `main` draait `.github/workflows/pages.yml` (tests, build met `SHOW_SLOTS=0`, check) en publiceert op GitHub Pages.

## Wekelijks een blogpost toevoegen

1. `git pull`
2. `npm run new-post -- <slug> "<Titel>"`. Dit maakt `content/blog/JJJJ-MM-DD-<slug>.md` met de juiste opzet.
3. Schrijf het artikel in die markdown (700-1200 woorden, je-vorm, korte alinea's):
   - Alleen feiten uit officiële bronnen (Belastingdienst, Rijksoverheid, KVK, Ondernemersplein, Kamerstukken). Geen verzonnen cijfers.
   - Voorstellen duidelijk als voorstel markeren.
   - Minstens 2 bronnen onder `sources:` (`Naam | https://url`), 1-3 tools onder `tools:`.
   - `seo_title` maximaal 60 tekens, `description` 70-155 tekens. Gebruik `##` en `###` voor koppen (de titel is de h1).
   - Een artikel later bijwerken? Pas de tekst aan en zet `updated:` op de nieuwe datum.
4. `npm run og` maakt de deelafbeelding `src/assets/og/blog-<slug>.png`. Zonder Chrome valt de post terug op `og/blog.png`.
5. `npm test && SHOW_SLOTS=0 npm run build && npm run check`. Alles moet slagen.
6. `git add content/blog src/assets/og && git commit -m "Blog: <titel>" && git push`
7. Controleer dat de workflow "Deploy BoekhoudMatch" slaagt en open `https://boekhoudmatch.nl/blog/<slug>/`.

Posts met een datum in de toekomst worden pas gepubliceerd bij een build op of na die datum.

## Structuur

- `build.mjs`: bouwt alle pagina's, blog, RSS (`/blog/feed.xml`), sitemap en manifest naar `dist/`
- `src/layout.mjs`: layout, meta-tags, Open Graph, schema.org
- `src/pages/`: pagina's; `src/pages/blog.mjs`: blogoverzicht, artikelen en feed
- `src/lib/`: rekenlogica, prijsdata (`pakketten.js`), match-algoritme, markdown
- `src/assets/`: CSS (wordt inline gezet), JavaScript, OG-afbeeldingen, iconen
- `content/blog/`: blogartikelen in markdown
- `scripts/`: `check.mjs` (SEO-controle), `og.mjs` (afbeeldingen), `new-post.mjs`
- `data-build/build_hourly.py`: haalt uurdata op uit openbare bronnen (NEDU/MFFBAS, PVGIS, EnergyZero)
- `test/`: unit tests (`node --test`)
