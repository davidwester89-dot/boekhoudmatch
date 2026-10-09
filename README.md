# BoekhoudMatch

Bron van [boekhoudmatch.nl](https://boekhoudmatch.nl): gratis tools voor zzp'ers over boekhouding, geld en belasting. Een boekhoudprogramma-match, een vergelijking van boekhoudpakketten, netto inkomen en uurtarief 2026, btw berekenen en een offerte- en factuurtool. Statisch, zonder cookies of tracking.

- `npm test`: unit-tests voor alle rekenlogica en de match (Node 20, geen dependencies)
- `npm run build`: genereert `dist/` (`SHOW_SLOTS=0` verbergt partnerplekken)
- `python3 data-build/build_hourly.py`: haalt de uurdata voor de thuisbatterij-simulatie op uit openbare bronnen (NEDU/MFFBAS, PVGIS, EPEX via EnergyZero); gebeurt automatisch in de workflow
- Deploy: GitHub Actions → GitHub Pages (`.github/workflows/pages.yml`)

Prijzen en functies van boekhoudpakketten staan in `src/lib/pakketten.js`, met bron en controledatum. De rangorde (`src/lib/match.js`) gebruikt geen partnerinformatie; dat wordt getest.

Uitkomsten zijn indicaties, geen financieel of fiscaal advies. Contact: davidwester89@gmail.com
