// Onafhankelijke verwachting voor de stijlrelease van 19 november 2026.
export const STIJL_PADEN = new Set([
  "/bankkoppeling-boekhoudprogramma/",
  "/blog/bewaarplicht-administratie-zzp/",
  "/blog/boekhouden-als-zzper/",
  "/blog/boekhoudprogramma-peppol/",
  "/blog/btw-aangifte-doen-zzp/",
  "/blog/schijnzelfstandigheid-2027-zzp/",
  "/blog/voorlopige-aanslag-zzp/",
  "/blog/wat-kost-een-boekhoudprogramma/",
  "/blog/zakelijke-rekening-zzp/",
  "/boekhoudprogramma-eenmanszaak/",
  "/boekhoudprogramma-kiezen/",
  "/boekhoudprogramma-starters/",
  "/boekhoudprogramma-vof/",
  "/bronnen/",
  "/btw-aangifte-boekhoudprogramma/",
  "/e-boekhouden/",
  "/exact/",
  "/gratis-boekhoudprogramma/",
  "/informer/",
  "/jortt-vs-moneymonk/",
  "/jortt/",
  "/kor-boekhoudprogramma/",
  "/moneybird-vs-e-boekhouden/",
  "/moneybird/",
  "/moneymonk/",
  "/rompslomp-vs-tellow/",
  "/rompslomp/",
  "/silvasoft/",
  "/snelstart/",
  "/tellow/",
  "/urenregistratie-zzp/",
  "/voorschotfactuur-maken/"
]);
// 20-11 (inlink naar /blog/boekhoudprogramma-webshop/): alleen de post met eigen bodywijziging.
export const WEBSHOP_INLINK_PADEN = new Set(['/blog/wat-kost-een-boekhoudprogramma/']);
// 23-11 (techronde 19-11): inlinks in bestaande zinnen (urenregistratie, bankkoppeling) en FAQ 'periodiek' (beste-zzp); eigen bodywijziging.
export const TECH1911_PADEN = new Set(['/urenregistratie-zzp/', '/bankkoppeling-boekhoudprogramma/', '/beste-boekhoudprogramma-zzp/', '/', '/offerte-factuur-maken/']);
export const revisieDatum = (pad, vorige) => TECH1911_PADEN.has(pad) ? '2026-11-23' : WEBSHOP_INLINK_PADEN.has(pad) ? '2026-11-20' : STIJL_PADEN.has(pad) ? '2026-11-19' : vorige;
