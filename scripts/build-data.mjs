// Builds the static data the app ships with:
//   public/data/countries.json  – country facts + continent/level assignment
//   public/data/world.json      – simplified GeoJSON geometry for every country/territory
//   public/flags/<cca2>.svg     – flag images (public domain, real aspect ratios)
//
// Sources: world-countries (ODbL), world-atlas / Natural Earth (public domain),
// svg-country-flags (public domain), Natural Earth POP_EST (scripts/data/population.json).

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature, merge } from 'topojson-client';
import { geoArea, geoCentroid, geoDistance } from 'd3-geo';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (...p) => join(root, 'public', ...p);

const allCountries = require('world-countries');
const topo50 = require('world-atlas/countries-50m.json');
const topo10 = require('world-atlas/countries-10m.json');
const population = JSON.parse(readFileSync(join(root, 'scripts/data/population.json'), 'utf8'));
const flagDir = join(dirname(require.resolve('svg-country-flags/package.json')), 'svg');

const EARTH_RADIUS_KM = 6371;
const DEG = 180 / Math.PI;
const CLUSTER_GAP_KM = 400; // polygons further than this from the main landmass are left out of the "shape"
const LEVEL_TARGET_SIZE = 8;
const EXTRA_STATES = new Set(['VAT', 'PSE', 'UNK', 'TWN']); // non-UN-members commonly treated as countries
const KEEP_ALL_PARTS = new Set(['MYS']); // shapes whose distant parts are essential (East Malaysia)

// ---------- Countries ----------

const continentOf = (c) => {
  if (c.region === 'Americas') return c.subregion === 'South America' ? 'south-america' : 'north-america';
  return { Africa: 'africa', Asia: 'asia', Europe: 'europe', Oceania: 'oceania' }[c.region];
};

const selected = allCountries.filter((c) => c.unMember || EXTRA_STATES.has(c.cca3));
const selectedIds = new Set(selected.map((c) => c.cca3));

// ---------- Geometry ----------

const geoms50 = topo50.objects.countries.geometries;
const byNumeric = new Map(selected.map((c) => [c.ccn3, c.cca3]));
const byName = { Kosovo: 'UNK' };
// Breakaway regions shown as part of the internationally recognised country.
const mergeInto = { Somaliland: '706', 'N. Cyprus': '196' };
const dropNames = new Set(['Antarctica', 'Fr. S. Antarctic Lands', 'Siachen Glacier', 'Indian Ocean Ter.']);

const round = (n) => Math.round(n * 1000) / 1000;
const roundCoords = (coords) =>
  typeof coords[0] === 'number' ? [round(coords[0]), round(coords[1])] : coords.map(roundCoords);

// Drops consecutive duplicate points created by rounding; rings need at least 4 points.
const cleanRing = (ring) => {
  const res = [];
  for (const p of ring) {
    const last = res[res.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) res.push(p);
  }
  return res.length >= 4 ? res : null;
};

const toPolygons = (geometry) => {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys
    .map((poly) => poly.map((ring) => cleanRing(roundCoords(ring))).filter(Boolean))
    .filter((poly) => poly.length > 0);
};

const features = []; // { id, polygons }

for (const g of geoms50) {
  const name = g.properties.name;
  if (dropNames.has(name) || mergeInto[name]) continue;
  let geometry;
  const mergeParts = Object.entries(mergeInto).filter(([, target]) => target === g.id);
  if (mergeParts.length) {
    const parts = [g, ...mergeParts.map(([n]) => geoms50.find((x) => x.properties.name === n))];
    geometry = merge(topo50, parts);
  } else {
    geometry = feature(topo50, g).geometry;
  }
  if (!geometry) continue;
  const id = byNumeric.get(g.id) ?? byName[name] ?? `x-${features.length}`;
  features.push({ id, polygons: toPolygons(geometry) });
}

// Countries missing from the 50m dataset (Tuvalu) come from the 10m dataset.
for (const c of selected) {
  if (features.some((f) => f.id === c.cca3)) continue;
  const g = topo10.objects.countries.geometries.find((x) => x.id === c.ccn3);
  if (!g) throw new Error(`No geometry for ${c.cca3}`);
  features.push({ id: c.cca3, polygons: toPolygons(feature(topo10, g).geometry) });
}

// Picks the polygons that make up a country's recognisable "main" shape: the largest
// polygon plus everything chained to it by gaps smaller than CLUSTER_GAP_KM.
// Removes far-away overseas parts (French Guiana for France, Hawaii for the USA, ...).
const mainlandOf = (polygons, maxGapKm) => {
  const info = polygons.map((poly) => {
    const geo = { type: 'Polygon', coordinates: poly };
    const centroid = geoCentroid(geo);
    const radius = Math.max(...poly[0].map((p) => geoDistance(centroid, p)));
    return { area: geoArea(geo), centroid, radius };
  });
  const main = info.reduce((best, cur, i) => (cur.area > info[best].area ? i : best), 0);
  const kept = new Set([main]);
  let grew = true;
  while (grew) {
    grew = false;
    info.forEach((p, i) => {
      if (kept.has(i)) return;
      for (const k of kept) {
        const q = info[k];
        const gapKm = (geoDistance(p.centroid, q.centroid) - p.radius - q.radius) * EARTH_RADIUS_KM;
        if (gapKm < maxGapKm) {
          kept.add(i);
          grew = true;
          break;
        }
      }
    });
  }
  const indices = [...kept].sort((a, b) => a - b);
  const centroid = geoCentroid({ type: 'MultiPolygon', coordinates: indices.map((i) => polygons[i]) });
  const radius = Math.max(...indices.flatMap((i) => polygons[i][0].map((p) => geoDistance(centroid, p))));
  return {
    indices,
    centroid: [round(centroid[0]), round(centroid[1])],
    radius: Math.round(radius * DEG * 100) / 100,
  };
};

// Bounding circle [lon, lat, radiusDeg] per polygon, so the app can skip polygons outside a view.
const capsOf = (polygons) =>
  polygons.map((poly) => {
    const centroid = geoCentroid({ type: 'Polygon', coordinates: poly });
    const radius = Math.max(...poly[0].map((p) => geoDistance(centroid, p)));
    return [round(centroid[0]), round(centroid[1]), Math.round(radius * DEG * 100) / 100];
  });

// ---------- Flags ----------

const flagRatio = (svg) => {
  const vb = svg.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (vb) return Number(vb[1]) / Number(vb[2]);
  const w = svg.match(/<svg[^>]*\swidth="([\d.]+)/);
  const h = svg.match(/<svg[^>]*\sheight="([\d.]+)/);
  return w && h ? Number(w[1]) / Number(h[1]) : 1.5;
};

if (existsSync(out('flags'))) rmSync(out('flags'), { recursive: true });
mkdirSync(out('flags'), { recursive: true });
mkdirSync(out('data'), { recursive: true });

// ---------- Assemble ----------

const featureById = new Map(features.map((f) => [f.id, f]));
const TINY_AREA_KM2 = 3000;

const countries = selected.map((c) => {
  const f = featureById.get(c.cca3);
  if (!f) throw new Error(`Missing geometry for ${c.cca3}`);
  const code = c.cca2.toLowerCase();
  const svgPath = join(flagDir, `${code}.svg`);
  copyFileSync(svgPath, out('flags', `${code}.svg`));
  const { indices, centroid, radius } = KEEP_ALL_PARTS.has(c.cca3)
    ? mainlandOf(f.polygons, Infinity)
    : mainlandOf(f.polygons, CLUSTER_GAP_KM);
  return {
    id: c.cca3,
    code,
    name: c.name.common,
    official: c.name.official,
    capital: c.capital.join(', '),
    continent: continentOf(c),
    subregion: c.subregion,
    population: population[c.cca3] ?? 0,
    area: c.area,
    landlocked: c.landlocked,
    flagRatio: Math.round(flagRatio(readFileSync(svgPath, 'utf8')) * 1000) / 1000,
    mainland: indices,
    centroid,
    radius,
    tiny: c.area < TINY_AREA_KM2,
    neighbors: c.borders.filter((b) => selectedIds.has(b)),
    level: 0,
  };
});

// Levels: within each continent, better-known countries (by population, with a nudge for
// large area) come first, split into evenly sized levels.
const fame = (c) => Math.log10(Math.max(c.population, 1)) + 0.35 * Math.log10(Math.max(c.area, 1));
const continents = ['europe', 'asia', 'africa', 'north-america', 'south-america', 'oceania'];
const levelSummary = {};
for (const cont of continents) {
  const list = countries.filter((c) => c.continent === cont).sort((a, b) => fame(b) - fame(a));
  const levels = Math.max(1, Math.round(list.length / LEVEL_TARGET_SIZE));
  const base = Math.floor(list.length / levels);
  const extra = list.length % levels;
  let i = 0;
  for (let l = 0; l < levels; l++) {
    const size = base + (l < extra ? 1 : 0);
    for (let k = 0; k < size; k++) list[i++].level = l + 1;
  }
  levelSummary[cont] = Array.from({ length: levels }, (_, l) =>
    list.filter((c) => c.level === l + 1).map((c) => c.name),
  );
}

if (countries.some((c) => !c.continent || !c.level)) throw new Error('Country without continent/level');

writeFileSync(out('data', 'countries.json'), JSON.stringify({ continents, countries }));
writeFileSync(
  out('data', 'world.json'),
  JSON.stringify(features.map((f) => ({ id: f.id, polygons: f.polygons, caps: capsOf(f.polygons) }))),
);

if (process.argv.includes('--verbose')) {
  for (const [cont, levels] of Object.entries(levelSummary)) {
    console.log(`\n${cont}`);
    levels.forEach((names, i) => console.log(`  L${i + 1} (${names.length}): ${names.join(', ')}`));
  }
  const trimmed = countries.filter((c) => c.mainland.length < featureById.get(c.id).polygons.length);
  console.log('\nShapes with far-away parts removed:', trimmed.map((c) => c.id).join(' '));
}
console.log(`data: ${countries.length} countries, ${features.length} map features, ${countries.length} flags`);
