// Netwerk-footer ("Ook van ons"). Eén regel per site; een site toevoegen = één regel erbij.
// Alleen live match-sites (geen Goodfellas). shopmatch.nl en kassamatch.nl staan klaar als commentaar tot ze live zijn.
export const NETWORK = [
  { naam: 'BoekhoudMatch', logo: 'Boekhoud<b>Match</b>.nl', url: 'https://boekhoudmatch.nl/', wat: 'Boekhoudprogramma kiezen' },
  { naam: 'VerduurzaamMatch', logo: 'Verduurzaam<b>Match</b>.nl', url: 'https://verduurzaammatch.nl/', wat: 'Je huis verduurzamen' },
  // { naam: 'ShopMatch', logo: 'Shop<b>Match</b>.nl', url: 'https://shopmatch.nl/', wat: 'Webshopplatform kiezen' },
  // { naam: 'KassaMatch', logo: 'Kassa<b>Match</b>.nl', url: 'https://kassamatch.nl/', wat: 'Kassasysteem kiezen' },
];
export const networkFor = (self) => NETWORK.filter((s) => !s.url.includes(self));
