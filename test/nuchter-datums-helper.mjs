// Onafhankelijke verwachting voor de stijlrelease van 13 november 2026.
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
  "/boekhoudprogramma-starters/",
  "/boekhoudprogramma-vof/",
  "/btw-aangifte-boekhoudprogramma/",
  "/e-boekhouden/",
  "/gratis-boekhoudprogramma/",
  "/jortt-vs-moneymonk/",
  "/jortt/",
  "/kor-boekhoudprogramma/",
  "/moneybird-vs-e-boekhouden/",
  "/moneymonk/",
  "/urenregistratie-zzp/",
  "/voorschotfactuur-maken/"
]);
export const revisieDatum = (pad, vorige) => STIJL_PADEN.has(pad) ? '2026-11-18' : vorige;
