import { geoAzimuthalEqualArea, geoDistance, geoPath, type GeoProjection } from 'd3-geo';
import type { MultiPolygon } from 'geojson';
import { CONTINENTS } from './continents';
import type { Atlas, ContinentId, Country, LonLat, MapFrame } from '../types';

const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;
export const MAP_WIDTH = 1000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function mainlandGeometry(atlas: Atlas, country: Country): MultiPolygon {
  const shape = atlas.shapeById.get(country.id);
  const polygons = shape ? country.mainland.map((i) => shape.polygons[i]).filter((p) => p !== undefined) : [];
  return { type: 'MultiPolygon', coordinates: polygons };
}

/** Azimuthal equal-area projection centred on a point: little distortion around the centre. */
const centredProjection = ([lon, lat]: LonLat): GeoProjection =>
  geoAzimuthalEqualArea().rotate([-lon, -lat]).precision(0.3);

/** Map of a whole continent, `MAP_WIDTH` wide. */
const continentFrames = new Map<ContinentId, MapFrame>();
export function continentFrame(id: ContinentId): MapFrame {
  const cached = continentFrames.get(id);
  if (cached) return cached;
  const { center, bounds } = CONTINENTS[id].view;
  const [[west, south], [eastRaw, north]] = bounds;
  const east = eastRaw < west ? eastRaw + 360 : eastRaw;
  const points: LonLat[] = [];
  for (let i = 0; i <= 8; i++) {
    for (let j = 0; j <= 8; j++) points.push([west + ((east - west) * i) / 8, south + ((north - south) * j) / 8]);
  }
  const target = { type: 'MultiPoint' as const, coordinates: points };
  const projection = centredProjection(center).clipAngle(110).fitWidth(MAP_WIDTH, target);
  const [, [, bottom]] = geoPath(projection).bounds(target);
  const reach = Math.max(...points.map((p) => geoDistance(center, p))) * DEG;
  const frame: MapFrame = { projection, width: MAP_WIDTH, height: Math.round(bottom), center, radius: reach * 1.6 };
  continentFrames.set(id, frame);
  return frame;
}

/** Map centred on one country, zoomed so its neighbourhood is visible. */
const focusFrames = new Map<string, MapFrame>();
export function focusFrame(country: Country, width: number, height: number): MapFrame {
  const key = `${country.id}:${width}x${height}`;
  const cached = focusFrames.get(key);
  if (cached) return cached;
  const half = clamp(Math.max(country.radius * 2.4, country.radius + 5), 5, 75);
  const scale = Math.min(width, height) / 2 / (2 * Math.sin((half * RAD) / 2));
  const projection = centredProjection(country.centroid)
    .clipAngle(Math.min(160, half * 2.5 + 10))
    .scale(scale)
    .translate([width / 2, height / 2]);
  const radius = (half * Math.hypot(width, height)) / Math.min(width, height);
  const frame: MapFrame = { projection, width, height, center: country.centroid, radius: radius * 1.1 };
  focusFrames.set(key, frame);
  return frame;
}

export interface RenderedFeature {
  id: string;
  d: string;
  country?: Country;
}

/** Projects every shape (skipping polygons outside the frame) into SVG path data. Cached per frame. */
const featureCache = new WeakMap<MapFrame, RenderedFeature[]>();
export function renderFeatures(atlas: Atlas, frame: MapFrame): RenderedFeature[] {
  const cached = featureCache.get(frame);
  if (cached) return cached;
  const path = geoPath(frame.projection);
  const result: RenderedFeature[] = [];
  for (const shape of atlas.shapes) {
    const polygons = shape.polygons.filter((_, i) => {
      const cap = shape.caps[i];
      return cap !== undefined && geoDistance(frame.center, [cap[0], cap[1]]) * DEG - cap[2] < frame.radius;
    });
    if (!polygons.length) continue;
    const d = path({ type: 'MultiPolygon', coordinates: polygons });
    if (d) result.push({ id: shape.id, d, country: atlas.byId.get(shape.id) });
  }
  featureCache.set(frame, result);
  return result;
}

/** Projected bounding box of a country's main shape within a frame. */
export function projectedBounds(atlas: Atlas, frame: MapFrame, country: Country): [[number, number], [number, number]] {
  return geoPath(frame.projection).bounds(mainlandGeometry(atlas, country));
}

/** Silhouette path of a country's main shape, fitted into a size×size box. */
export function silhouettePath(atlas: Atlas, country: Country, size: number, padding: number): string {
  const geometry = mainlandGeometry(atlas, country);
  const projection = centredProjection(country.centroid)
    .clipAngle(90)
    .fitExtent(
      [
        [padding, padding],
        [size - padding, size - padding],
      ],
      geometry,
    );
  return geoPath(projection)(geometry) ?? '';
}
