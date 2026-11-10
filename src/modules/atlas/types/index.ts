import type { GeoProjection } from 'd3-geo';

export type ContinentId = 'europe' | 'asia' | 'africa' | 'north-america' | 'south-america' | 'oceania';

/** [longitude, latitude] in degrees. */
export type LonLat = [number, number];
export type PolygonCoords = LonLat[][];

export interface Country {
  id: string; // ISO 3166-1 alpha-3
  code: string; // ISO 3166-1 alpha-2, lowercase (flag file name)
  name: string;
  official: string;
  capital: string;
  continent: ContinentId;
  subregion: string;
  population: number;
  area: number; // km²
  landlocked: boolean;
  flagRatio: number; // width / height
  mainland: number[]; // indices of the polygons forming the recognisable shape
  centroid: LonLat;
  radius: number; // angular radius of the main shape, degrees
  tiny: boolean; // too small to see on a continent map; drawn with a marker
  neighbors: string[];
  level: number; // 1-based level within its continent
}

/** Geometry of a country or territory. `caps` holds a bounding circle [lon, lat, radiusDeg] per polygon. */
export interface WorldShape {
  id: string;
  polygons: PolygonCoords[];
  caps: [number, number, number][];
}

export interface Atlas {
  continents: ContinentId[];
  countries: Country[];
  byId: Map<string, Country>;
  shapes: WorldShape[];
  shapeById: Map<string, WorldShape>;
}

/** A projection sized to a viewBox, plus the visible area used to skip off-screen polygons. */
export interface MapFrame {
  projection: GeoProjection;
  width: number;
  height: number;
  center: LonLat;
  radius: number; // degrees from center that can be visible
}

export interface ContinentInfo {
  id: ContinentId;
  name: string;
  view: { center: LonLat; bounds: [LonLat, LonLat] }; // bounds: [[west, south], [east, north]]
}
