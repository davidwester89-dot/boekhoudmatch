# SEO-log 7 november 2026

Uitzondering op de bevriezing van boekhoudmatch.nl. Geen nieuw experimentbesluit.

## Besluit dat deze wijziging dekt

Groeilog 30 oktober 2026, 15:15 Europe/Amsterdam: bevriezing t/m 10 november, push 12 november, E6-basislijn t/m 11 november. Bevestigd op 6 november. Dave heeft op 7 november 2026 voor deze SEO-opdracht expliciet goedgekeurd dat die wijzigingsstop wordt doorbroken. Deze commit is die uitzondering. Hij kan de meettrend van E6 en van de title-hercrawl van 26 oktober breken.

## Wat de data wel en niet zegt

GSC-pagina, 26 oktober t/m 1 november (aangeleverd; geen nieuwere paginadimensie in deze commit):

| URL | Vertoningen | Klikken | Positie |
|---|---|---|---|
| /moneybird/ | 5 | 0 | 65,4 |
| /bankkoppeling-boekhoudprogramma/ | 3 | 0 | 85 |
| /snelstart/ | 2 | 0 | 44 |
| /rompslomp-vs-tellow/ | 1 | 0 | 1 (query geanonimiseerd; periode ervoor 13 / 0 / 58,3) |
| /jortt/ | geen rij | | periode ervoor 4 / 0 / 61,5 |

Dit volume onderbouwt geen CTR-winst en geen shortlist op positie 8–20. De aanpassingen zetten een antwoord dat al op de pagina stond ook in title, meta of de eerste alinea, met bedragen uit `pakketten.js` of zinnen die al op de pagina stonden.

## Gewijzigd

- `/moneybird/`: title en meta noemen dat er geen gratis pakket is. Compact € 4,00 / € 3,00 bij jaarbetaling, controledatum blijft 10 oktober 2026. De bestaande H2 „Is Moneybird nog gratis?” staat vóór „In het kort”. Links naar `/gratis-boekhoudprogramma/` en `/bankkoppeling-boekhoudprogramma/` (Groei € 35,00 uit de data). E6 gebruikt deze URL als referentie, niet als controle.
- `/bankkoppeling-boekhoudprogramma/`: title en meta. De Moneybird-regel linkt naar `/moneybird/`. Koppen over SnelStart/Rabobank, ING en Moneybird zijn niet hernoemd. Geen nieuwe prijs.
- `/rompslomp-vs-tellow/`: title en meta leiden met „Rompslomp tarieven 2026”. De eerste alinea noemt de huidige maandprijzen via `{{p:}}` (€ 8,95 en € 12,99). De oude Rompslomp-bedragen tot 1 november blijven de bedragen die er al stonden. `checked` blijft 26 oktober 2026. Dit is niet de E6-controle; `/rompslomp/` en `/tellow/` zijn niet aangepast.
- `/snelstart/`: één alinea met een link naar de bankgids. Title, meta en pakketlijst ongewijzigd. Geen H2 „Wat kost SnelStart per maand?”: die hoort bij de E6-verdieping (week 46: push 17 november) en die verdieping staat niet in deze tree.

## Niet gewijzigd

- E6-controle: `/silvasoft/`, `/rompslomp/`, `/tellow/`, `/exact/`, `/informer/`.
- `/jortt/`: E6-testpagina. De deep-dive staat op de planning voor 12 november en zit niet in deze tree. Niets aangepast, zodat dit bestand die deep-dive niet overschrijft.
- Geen partnerlink toegevoegd of verwijderd. Matchvolgorde niet aangepast. Geen ratings.

## Meten

Een nulmeting van vóór deze commit is niet opnieuw getrokken. Wie E6 of de title van `/rompslomp-vs-tellow/` (26 oktober) later leest, moet deze commit als trendbreuk apart zetten. Geen verwachte positie of klikken in dit log.
