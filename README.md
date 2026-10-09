# BoekhoudMatch

Bron van [boekhoudmatch.nl](https://boekhoudmatch.nl): gratis tools en artikelen voor zzp'ers over boekhouding, geld en belasting.

- **Boekhoudmatch**: 8 vragen, daarna de pakketten op volgorde met prijs en uitleg. De volgorde gebruikt nooit informatie over partnerschappen (getest).
- **Vergelijken**: alle pakketten naast elkaar, met de prijzen van de aanbieders zelf en de controledatum.
- **Rekentools**: netto inkomen zzp, uurtarief, btw, offerte en factuur, plus salderen en thuisbatterij.
- **Blog**: actuele artikelen met officiële bronnen (`content/blog/*.md`).

Statische site zonder frameworks. Externe verzoeken en cookies alleen voor Google Analytics, en pas na toestemming (zie hieronder). Contact: davidwester89@gmail.com.

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

## Google Analytics en cookiemelding

Google Analytics 4 staat uit zolang `GA_ID` in `src/analytics.config.mjs` leeg is: dan is er geen cookiemelding, geen Google-script en geen Google-domein in de CSP. Met een ID:

- toont elke pagina een cookiemelding (onderbalk) met twee gelijke knoppen, **Accepteren** en **Weigeren**, en een link naar `/privacy/#cookies`;
- wordt `gtag.js` pas geladen na **Accepteren**. Zonder keuze of na Weigeren gaat er geen enkel verzoek naar Google;
- staat de keuze in `localStorage` (`bm-consent`, met versie en datum). Na 12 maanden, of als `CONSENT_VERSION` in `src/lib/consent.js` omhoog gaat, vragen we het opnieuw;
- heropent **Cookie-instellingen** in de footer de melding. Weigeren stopt GA en wist de `_ga*`-cookies;
- gaan alleen deze events mee: `quiz_start`, `quiz_complete` (`vendor` = beste match), `vendor_click` (`vendor`, `page`) en `calculator_use` (`tool_name`, één keer per paginaweergave). Nooit invoer. Paginaadressen gaan zonder querystring mee, want de tools zetten invoer in de URL;
- is GA ingesteld met Google Signals uit, advertentiepersonalisatie uit en `ads_data_redaction`.

Logica: `src/lib/consent.js` (getest in `test/consent.test.js`), UI en events: `src/assets/js/consent.js`, privacytekst: `src/pages/static.mjs`.

### Aanzetten (ID instellen en live zetten)

```bash
cd /workspace/rekentools/site-boekhoudmatch && git checkout main && git pull --ff-only && git merge --no-edit feat/ga-consent && npm run set-ga -- G-XXXXXXXXXX && npm test && SHOW_SLOTS=0 npm run build && npm run check && git commit -am "Google Analytics aan" && git push
```

Uitzetten: `npm run set-ga -- ""`, commit en push.

### Eenmalig in Google Analytics (Beheer)

- Gegevensbewaring: **14 maanden** (Beheer → Gegevensverzameling en -aanpassing → Gegevensbewaring).
- Google Signals: **uit**. Instellingen voor gegevens delen met Google: alles **uit**.
- Accountinstellingen: de **verwerkersvoorwaarden** (Data Processing Terms) accepteren.
- Datastream → Uitgebreide metingen: zet **Paginawijzigingen op basis van browsergeschiedenis** en **Formulierinteracties** uit (de tools zetten invoer in de URL).
- Markeer `quiz_complete` en `vendor_click` als belangrijke gebeurtenis. Maak aangepaste dimensies (bereik: gebeurtenis) voor `vendor`, `tool_name` en `page`.
- Koppel Search Console aan de property (Beheer → Productkoppelingen).

## Structuur

- `build.mjs`: bouwt alle pagina's, blog, RSS (`/blog/feed.xml`), sitemap en manifest naar `dist/`
- `src/layout.mjs`: layout, meta-tags, Open Graph, schema.org
- `src/pages/`: pagina's; `src/pages/blog.mjs`: blogoverzicht, artikelen en feed
- `src/lib/`: rekenlogica, prijsdata (`pakketten.js`), match-algoritme, markdown
- `src/assets/`: CSS (wordt inline gezet), JavaScript, OG-afbeeldingen, iconen
- `content/blog/`: blogartikelen in markdown
- `scripts/`: `check.mjs` (SEO-controle), `og.mjs` (afbeeldingen), `new-post.mjs`, `set-ga.mjs` (Metings-ID)
- `src/analytics.config.mjs`: `GA_ID` (leeg = geen Analytics)
- `data-build/build_hourly.py`: haalt uurdata op uit openbare bronnen (NEDU/MFFBAS, PVGIS, EnergyZero)
- `test/`: unit tests (`node --test`)
