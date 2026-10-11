// De vs-gidsen (twee aanbieders naast elkaar), uit content/gids/*-vs-*.md. Voor interne links vanaf aanbiederpagina's en de vergelijking.
import { readdirSync, readFileSync, existsSync } from 'node:fs';

export const VS_GIDSEN = existsSync('content/gids') ? readdirSync('content/gids').filter((f) => /-vs-.*\.md$/.test(f)).sort().map((f) => {
  const slug = f.replace(/\.md$/, '');
  const title = (readFileSync(`content/gids/${f}`, 'utf8').match(/^title:\s*(.+)$/m) || [])[1] || slug;
  const kort = title.split(':')[0].trim(); // "Moneybird vs e-Boekhouden"
  const [a, b] = slug.split('-vs-');
  const [na, nb] = kort.split(/\s+vs\s+/);
  return { path: `/${slug}/`, kort, slugs: [a, b], namen: { [a]: na, [b]: nb } };
}) : [];

/** vs-gidsen waarin een aanbieder (op slug) voorkomt, met de naam van de andere aanbieder. */
export const vsVoor = (slug) => VS_GIDSEN.filter((g) => g.slugs.includes(slug)).map((g) => ({ ...g, ander: g.namen[g.slugs.find((s) => s !== slug)] }));
