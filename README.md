# BoekhoudMatch

Bron van [boekhoudmatch.nl](https://boekhoudmatch.nl): gratis tools en artikelen voor zzp'ers over boekhouding, geld en belasting.

- **Boekhoudmatch**: 8 vragen, daarna de pakketten op volgorde met prijs en uitleg. De volgorde gebruikt nooit informatie over partnerschappen (getest).
- **Vergelijken**: alle pakketten naast elkaar, met de prijzen van de aanbieders zelf en de controledatum.
- **Rekentools**: netto inkomen zzp, uurtarief, btw, offerte en factuur.
- **Blog**: actuele artikelen met officiële bronnen (`content/blog/*.md`).

Statische site zonder frameworks. Externe verzoeken en cookies alleen voor Google Analytics, en pas na toestemming (zie hieronder). Contact: info@boekhoudmatch.nl.

## Ontwikkelen

```bash
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
   - Afbeelding (verplicht): zet `src/assets/img/blog/<naam>-1200.webp` (1200×630) en `<naam>-600.webp` (600×315) neer, met het zoekwoord in `<naam>`. In de frontmatter: `image: <naam>`, `image_alt:` (beschrijvende Nederlandse alt-tekst) en eventueel `image_caption:` (met bronvermelding bij een foto). Geen AI-beelden van echte personen, merken of producten en geen gekopieerde foto's: liefst een eigen screenshot of zelfgemaakte illustratie. Zet dezelfde afbeelding ook als PNG (1200×630) in `src/assets/og/blog-<slug>.png`; die wordt og:image (WebP wordt niet overal getoond). `npm run og` laat die dan staan.
   - `checked:` is de datum waarop je de bronnen hebt gecontroleerd (zichtbaar onder de titel).
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
- gaan alleen deze events mee: `quiz_start`, `quiz_complete` (`vendor` = beste match), `vendor_click` (`vendor`, `page`), `match_cta` (`cta_type`), `calculator_use` (`tool_name`, één keer per paginaweergave), `video_start` en `video_complete` (`page`, één keer per afspeelbeurt). Nooit invoer. Paginaadressen gaan zonder querystring mee, want de tools zetten invoer in de URL;
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

## Video (proef sinds 19-10-2026)

Op `/boekhoudprogramma-kiezen/` staat een video van 1 minuut: een echte schermopname van de match met Nederlandse voice-over en ondertitels. Mobiel staat hij (staand) onder de vragen, op desktop (vanaf 900px, breed 16:9) boven formulier en uitslag.

- **Bestanden** in `src/assets/video/` (komen in `dist/video/`):
  - `boekhoudprogramma-kiezen-v3.mp4`: breed 960×540, voor desktop; ook `contentUrl` in het schema.
  - `boekhoudprogramma-kiezen-mobiel-v3.mp4`: staand 390×916, voor mobiel.
  - Beide: H.264 Main@3.1, yuv420p, 25 fps, `+faststart`, AAC mono 96 kbit/s nominaal, onder 2,5 MB.
  - `boekhoudprogramma-kiezen-v2.nl.vtt`: ondertitels, voor beide versies.
  - Stilstaande beelden (vraagscherm van de match, geen aanbiedersnamen, prijzen of uitslag): `-poster-v3.webp`/`-poster-420-v3.webp` (staand), `-960-v3.webp` (breed), `-1280-v2.webp` (`thumbnailUrl`), `-480-v2.webp` (homepage).
- **Klik om te laden:** in de HTML staat alleen een knop met het stilstaande beeld in een vak met vaste verhouding (mobiel `390/916`, desktop `16/9`, dus geen CLS). Pas na een klik kiest `src/assets/js/video.js` de juiste versie, zet er een `<video controls preload="none" playsinline>` met `<track kind="subtitles" srclang="nl" default>` in en start hem met geluid. Niet automatisch afspelen; dempen kan met de knoppen van de speler. Geen YouTube.
- **Voice-over:** Piper (offline TTS), stem `nl_NL-alex-medium` (dataset CC0, model in rhasspy/piper-voices, MIT). De tekst is precies de tekst van de 10 ondertitels, elk stuk begint op de starttijd van zijn ondertitel en eindigt ruim binnen het venster. Een paar woorden staan voor Piper anders gespeld zodat de uitspraak klopt (`metsj` voor match, `zet-zet-pee-er`, `Tohn`). Nooit aanbiedersnamen. Geluidsniveau rond -16 LUFS (ffmpeg loudnorm, twee keer). Scripts: `/workspace/tts/build_vo.py`, opname `/workspace/video-bm/rec.mjs` (`mobile`/`desktop`), montage `/workspace/video-bm/enc.sh`.
- **Opname:** schone browser, cookiekeuze vooraf op Weigeren, `deviceScaleFactor: 1` met `recordVideo.size` gelijk aan de viewport, voorbeeldprofiel uit `/workspace/plannen/video-script-boekhoudmatch.md`. Tijdens de opname zijn het videoblok, `.mobilebar` en `.stickycta` verborgen (alleen in de opname). De tekst per scène staat in een eigen balk boven het beeld (ffmpeg), nooit over knoppen.
- **Schema:** `VideoObject` in `src/pages/kiezen.mjs` (`VIDEO`).
- **Homepage:** alleen een kleine thumbnail die linkt naar `/boekhoudprogramma-kiezen/` (geen embed).
- **Events:** `video_start` (eerste keer afspelen) en `video_complete` (einde bereikt), met `page`. Alleen na toestemming, via `track()` uit `consent.js`.
- **Nieuwe versie?** Geef gewijzigde bestanden een nieuw versienummer (`-v4`, ...; GitHub Pages cachet 10 minuten op dezelfde naam), pas de verwijzingen in `VIDEO` en op de homepage aan en zet `uploadDate` (met tijd en tijdzone) op het moment van plaatsen.

## Structuur

- `build.mjs`: bouwt alle pagina's, blog, RSS (`/blog/feed.xml`), sitemap en manifest naar `dist/`
- `src/layout.mjs`: layout, meta-tags, Open Graph, schema.org
- `src/pages/`: pagina's; `src/pages/blog.mjs`: blogoverzicht, artikelen en feed
- `src/lib/`: rekenlogica, prijsdata (`pakketten.js`), match-algoritme, markdown
- `src/assets/`: CSS (wordt inline gezet), JavaScript, OG-afbeeldingen, iconen, video (`src/assets/video/`)
- `content/blog/`: blogartikelen in markdown
- `scripts/`: `check.mjs` (SEO-controle), `og.mjs` (afbeeldingen), `new-post.mjs`, `set-ga.mjs` (Metings-ID)
- `src/analytics.config.mjs`: `GA_ID` (leeg = geen Analytics)
- `test/`: unit tests (`node --test`)

## Schrijfregel: geen disclaimer-zinnen onder artikelen (16-10-2026, Dave)
Nooit zinnen als "geraadpleegd op …", "kan na een update verschuiven", "controleer altijd zelf", "check altijd de actuele prijs", "informatie/voorwaarden kunnen veranderen", "dit is geen advies". Klinkt te AI-achtig. Bron nodig? Alleen een kale bronnaam/link, zonder datum-voorbehoud. Wettelijk nodige partnerlink-labels en het Goodfellas-blok "Vanaf de pitmuur" blijven.
