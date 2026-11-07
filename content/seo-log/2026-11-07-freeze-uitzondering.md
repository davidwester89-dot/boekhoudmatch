# SEO-log 7 november 2026

Geen publicatie. Geen toestemming om de bevriezing te doorbreken.

## Toestemming en intrekking

Op 7 november 2026 gaf Dave eerst toestemming om de bevriezing van boekhoudmatch.nl voor deze SEO-opdracht te doorbreken. Commit f876c0408db71ca5df48aea72ba5ae5b7bb1c9d4 legde die toestemming vast en zette bijwerkdatums op 2026-11-07.

Dave heeft die toestemming daarna ingetrokken. De uitzondering is niet meer geldig. Deze correctie is geen publicatie en wijzigt geen meetafspraak. Een push wacht op een aparte vrijgave van de exacte hash.

## Datums

`published` van de twee bestaande gidsen staat op de datePublished van main: bankkoppeling 2026-10-23, Rompslomp vs Tellow 2026-10-26. `updated`, de zichtbare bijwerkdatum, `dateModified` en de sitemap-lastmod van de gewijzigde pagina's zijn niet op 7 november gezet. Die velden moeten op de werkelijke publicatiedag worden gezet en opnieuw worden gereviewd vóór een push. `checked` en de prijzen in `pakketten.js` zijn niet ververst.

## Tekst die in de werkboom staat

- `/moneybird/`: title en meta. De meta noemt Compact € 4,00 per maand en € 3,00 bij jaarbetaling, met de btw-basis uit de data: btw niet vermeld. Controledatum in de meta blijft 10 oktober 2026. `bijgewerkt` blijft 2026-10-19.
- `/bankkoppeling-boekhoudprogramma/`: title, meta, en een link van de Moneybird-regel naar `/moneybird/`. Geen nieuw bedrag.
- `/rompslomp-vs-tellow/`: title, meta, en een openingszin met `{{p:}}`. `checked` blijft 2026-10-26.
- `/snelstart/`: één link naar de bankgids. Geen `bijgewerkt`.
- `/gidsen/`: sitemap-lastmod, zichtbare datum en `dateModified` gebruiken dezelfde nieuwste `updated` van de gidsen. Dat gat zat al op main (lastmod 2026-10-10, zichtbare datum de nieuwste gids).

`/jortt/`, `/silvasoft/`, `/rompslomp/`, `/tellow/`, `/exact/` en `/informer/` zijn niet aangepast. Geen partnerlink en geen matchvolgorde.

Officiële prijspagina's zijn voor deze correctie niet opnieuw gelezen. Bestaande afgeleide zinnen (zoals 3 × € 1,50 op de vergelijking, en de volgorde gratis/€ 7 op de bankgids) zijn niet nieuw en niet in deze correctie herschreven.
