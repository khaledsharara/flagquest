import { useEffect, useLayoutEffect, useMemo, useRef, type MouseEvent } from 'react';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { cn, type Tone } from '../../shared';
import { projectedBounds, renderFeatures } from '../utils/geometry';
import { useAtlas } from './AtlasProvider';
import type { MapFrame } from '../types';

interface WorldMapProps {
  frame: MapFrame;
  /** Countries to colour, by id. */
  highlights?: Readonly<Record<string, Tone>>;
  /** Countries drawn as "in play". Defaults to every country (territories stay grey). */
  activeIds?: ReadonlySet<string>;
  /** Small countries to draw as circles so they can be seen and tapped. */
  markerIds?: readonly string[];
  /** Enables pinch/drag zoom. */
  interactive?: boolean;
  onSelect?: (countryId: string) => void;
  /** Interactive maps animate to show this country when it changes. */
  zoomToId?: string | null;
  className?: string;
}

const MARKER_PX = 5;
const MARKER_HIT_PX = 16; // tap radius around a small-country marker
const MARKER_HIT_ON_LAND_PX = 9; // smaller radius when the tap also landed on another country

const toneFill: Record<Tone, string> = {
  neutral: 'fill-slate-400',
  accent: 'fill-orange-500',
  correct: 'fill-emerald-500',
  wrong: 'fill-rose-500',
};

export function WorldMap({
  frame,
  highlights = {},
  activeIds,
  markerIds = [],
  interactive = false,
  onSelect,
  zoomToId,
  className,
}: WorldMapProps) {
  const atlas = useAtlas();
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const scaleRef = useRef(1);

  const features = useMemo(() => renderFeatures(atlas, frame), [atlas, frame]);
  const highlighted = useMemo(
    () => features.filter((f) => highlights[f.id]).map((f) => ({ ...f, tone: highlights[f.id] as Tone })),
    [features, highlights],
  );

  const markers = useMemo(() => {
    const ids = new Set(markerIds);
    for (const id of Object.keys(highlights)) if (atlas.byId.get(id)?.tiny) ids.add(id);
    return [...ids].flatMap((id) => {
      const country = atlas.byId.get(id);
      const point = country && frame.projection(country.centroid);
      return point ? [{ id, x: point[0], y: point[1], tone: highlights[id] }] : [];
    });
  }, [atlas, frame, markerIds, highlights]);

  /** Screen pixels per map unit, including the current zoom. */
  const pixelsPerUnit = () => (svgRef.current?.getScreenCTM()?.a ?? 1) * scaleRef.current;

  // Markers keep a constant on-screen size regardless of zoom and container size.
  const sizeMarkers = () => {
    const ppu = pixelsPerUnit();
    layerRef.current?.querySelectorAll<SVGCircleElement>('circle[data-r]').forEach((circle) => {
      circle.setAttribute('r', String(Number(circle.dataset.r) / ppu));
    });
  };

  useLayoutEffect(sizeMarkers);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(sizeMarkers);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!interactive || !svg) return;
    const selection = select(svg);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .translateExtent([
        [-frame.width * 0.3, -frame.height * 0.3],
        [frame.width * 1.3, frame.height * 1.3],
      ])
      .on('zoom', (event: { transform: { k: number; toString(): string } }) => {
        layerRef.current?.setAttribute('transform', event.transform.toString());
        scaleRef.current = event.transform.k;
        sizeMarkers();
      });
    selection.call(behavior).on('dblclick.zoom', null);
    zoomRef.current = behavior;
    return () => {
      selection.on('.zoom', null);
    };
  }, [interactive, frame]);

  useEffect(() => {
    const svg = svgRef.current;
    const country = zoomToId ? atlas.byId.get(zoomToId) : undefined;
    if (!interactive || !svg || !zoomRef.current || !country) return;
    const [[x0, y0], [x1, y1]] = projectedBounds(atlas, frame, country);
    const fraction = Math.max((x1 - x0) / frame.width, (y1 - y0) / frame.height, 0.001);
    const k = Math.min(12, Math.max(1, 0.3 / fraction));
    const target = zoomIdentity
      .translate(frame.width / 2, frame.height / 2)
      .scale(k)
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    select(svg).transition().duration(700).call(zoomRef.current.transform, target);
  }, [atlas, frame, interactive, zoomToId]);

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    const layer = layerRef.current;
    const ctm = layer?.getScreenCTM();
    if (!onSelect || !ctm) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    const tappedId = (event.target as Element).closest('[data-id]')?.getAttribute('data-id') ?? null;
    const tappedCountry = tappedId ? atlas.byId.get(tappedId) : undefined;
    const ppu = pixelsPerUnit();
    let best: string | null = null;
    let bestDistance = tappedCountry && !tappedCountry.tiny ? MARKER_HIT_ON_LAND_PX : MARKER_HIT_PX;
    for (const marker of markers) {
      const distance = Math.hypot(marker.x - point.x, marker.y - point.y) * ppu;
      if (distance < bestDistance) {
        best = marker.id;
        bestDistance = distance;
      }
    }
    const selected = best ?? (tappedCountry ? tappedCountry.id : null);
    if (selected) onSelect(selected);
  };

  const isActive = (id: string, isCountry: boolean) => (activeIds ? activeIds.has(id) : isCountry);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${frame.width} ${frame.height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn('block h-full w-full select-none', interactive && 'touch-none', className)}
      onClick={handleClick}
      role="img"
      aria-label="Map"
    >
      <g ref={layerRef}>
        <g className="stroke-slate-400/80 dark:stroke-slate-900" strokeWidth={0.6} strokeLinejoin="round">
          {features.map((f) => (
            <path
              key={f.id}
              d={f.d}
              data-id={f.id}
              vectorEffect="non-scaling-stroke"
              className={
                isActive(f.id, Boolean(f.country))
                  ? 'fill-white dark:fill-slate-500'
                  : 'fill-slate-200 dark:fill-slate-700'
              }
            />
          ))}
        </g>
        <g className="stroke-white dark:stroke-slate-900" strokeWidth={1} strokeLinejoin="round">
          {highlighted.map((f) => (
            <path
              key={f.id}
              d={f.d}
              data-id={f.id}
              vectorEffect="non-scaling-stroke"
              className={cn(toneFill[f.tone], 'transition-[fill]')}
            />
          ))}
        </g>
        <g>
          {markers.map((m) => (
            <circle
              key={m.id}
              cx={m.x}
              cy={m.y}
              data-r={m.tone ? MARKER_PX * 2 : MARKER_PX}
              data-id={m.id}
              vectorEffect="non-scaling-stroke"
              strokeWidth={m.tone ? 2.5 : 1.25}
              fillOpacity={m.tone ? 0.75 : undefined}
              className={
                m.tone
                  ? cn(toneFill[m.tone], 'stroke-white dark:stroke-slate-900')
                  : 'fill-white/70 stroke-slate-500 dark:fill-slate-500/60 dark:stroke-slate-300'
              }
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
