// Praktijktests: eigen metingen met een proefaccount, volgens het vaste testprotocol (PLAN-diepgang-breedte.md, A1).
// Alleen waarneembare feiten, geen scores of oordelen. Wordt NIET gelezen door match.js (rangorde blijft gelijk).
// Ruwe metingen: research/praktijktest/<aanbieder>/METINGEN.md (buiten de site).
// Momenteel geen gepubliceerde tests; de aanbiederpagina toont de sectie alleen als hier een entry staat.

export const PRAKTIJKTESTS = {};

/** Test voor een aanbieder-id, of null. */
export const praktijktest = (id) => PRAKTIJKTESTS[id] || null;
