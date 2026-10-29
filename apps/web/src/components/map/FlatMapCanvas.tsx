import { useEffect, useRef, useState, useMemo, useCallback, memo, type FC } from 'react';
import { useEventStore } from '../../store/useEventStore';
import { CONTINENTAL_POLYGONS, METRO_HUBS } from '../globe/worldPolygons';
import { getEventColor } from '../../utils/geo';
import type { WorldEvent } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Globe, Target } from 'lucide-react';

const FlatMapCanvasInner: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const events = useEventStore((s) => s.events);
  const filters = useEventStore((s) => s.filters);
  const activeLayers = useEventStore((s) => s.activeLayers);
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const setViewMode = useEventStore((s) => s.setViewMode);

  // Pan and zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tooltip display state (only these trigger re-renders, debounced)
  const [tooltipData, setTooltipData] = useState<{
    event: WorldEvent;
    x: number;
    y: number;
  } | null>(null);

  // Refs for mousemove tracking (no re-renders)
  const cursorCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const hoveredEventRef = useRef<WorldEvent | null>(null);
  const tooltipPosRef = useRef<{ x: number; y: number } | null>(null);
  const tooltipDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoize visibleEvents to avoid recomputing every render
  const visibleEvents = useMemo(() => {
    return events.filter((evt) => {
      if (!evt.location) return false;
      if (activeLayers[evt.category] === false) return false;
      if (filters.minImportance > 0 && evt.importance < filters.minImportance) return false;
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(evt.category)) {
        return false;
      }
      if (filters.selectedSources.length > 0 && !filters.selectedSources.includes(evt.source)) {
        return false;
      }
      if (filters.country && evt.country && !evt.country.toLowerCase().includes(filters.country.toLowerCase())) {
        return false;
      }
      if (filters.startDate) {
        const evtTime = new Date(evt.timestamp).getTime();
        const startTime = new Date(filters.startDate).getTime();
        if (evtTime < startTime) return false;
      }
      if (filters.endDate) {
        const evtTime = new Date(evt.timestamp).getTime();
        const endTime = new Date(filters.endDate).getTime();
        if (evtTime > endTime) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchCountry = evt.country?.toLowerCase().includes(q) ?? false;
        const matchSource = evt.source.toLowerCase().includes(q);
        if (!matchTitle && !matchCountry && !matchSource) return false;
      }
      return true;
    });
  }, [events, filters, activeLayers]);

  // Use refs to pass changing data into the animation loop without restarting it
  const visibleEventsRef = useRef(visibleEvents);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const selectedEventRef = useRef(selectedEvent);

  useEffect(() => { visibleEventsRef.current = visibleEvents; }, [visibleEvents]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { selectedEventRef.current = selectedEvent; }, [selectedEvent]);

  // Cached background gradient and static layer canvas
  const bgGradientRef = useRef<{ gradient: CanvasGradient; height: number } | null>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticSizeRef = useRef<{ w: number; h: number; zoom: number; panX: number; panY: number }>({
    w: 0, h: 0, zoom: 1, panX: 0, panY: 0,
  });

  // Render Loop — runs once, reads refs for dynamic data
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a static offscreen canvas for continents, grid, metro lights
    if (!staticCanvasRef.current) {
      staticCanvasRef.current = document.createElement('canvas');
    }
    const staticCanvas = staticCanvasRef.current;

    let animId: number;
    let shockwaveTick = 0;

    const renderStaticLayer = (width: number, height: number, currentZoom: number, currentPan: { x: number; y: number }) => {
      staticCanvas.width = width;
      staticCanvas.height = height;
      const sctx = staticCanvas.getContext('2d');
      if (!sctx) return;

      sctx.clearRect(0, 0, width, height);

      sctx.save();
      // Apply pan & zoom
      sctx.translate(width / 2 + currentPan.x, height / 2 + currentPan.y);
      sctx.scale(currentZoom, currentZoom);
      sctx.translate(-width / 2, -height / 2);

      const mapWidth = width * 0.92;
      const mapHeight = height * 0.85;
      const mapX = (width - mapWidth) / 2;
      const mapY = (height - mapHeight) / 2;

      const toXY = (lon: number, lat: number) => {
        const x = mapX + ((lon + 180) / 360) * mapWidth;
        const y = mapY + ((90 - lat) / 180) * mapHeight;
        return { x, y };
      };

      // 1. Grid lines
      sctx.lineWidth = 0.8;
      sctx.strokeStyle = 'rgba(14, 116, 144, 0.2)';

      for (let lon = -180; lon <= 180; lon += 30) {
        const pt = toXY(lon, 0);
        sctx.beginPath();
        sctx.moveTo(pt.x, mapY);
        sctx.lineTo(pt.x, mapY + mapHeight);
        sctx.stroke();

        sctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        sctx.font = '9px monospace';
        sctx.fillText(`${lon}°`, pt.x - 10, mapY + mapHeight + 14);
      }

      for (let lat = -60; lat <= 80; lat += 20) {
        const pt = toXY(0, lat);
        sctx.beginPath();
        sctx.moveTo(mapX, pt.y);
        sctx.lineTo(mapX + mapWidth, pt.y);
        sctx.stroke();

        sctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        sctx.font = '9px monospace';
        sctx.fillText(`${lat}°`, mapX - 24, pt.y + 3);
      }

      // Highlight Equator & Prime Meridian
      sctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      sctx.lineWidth = 1.2;
      const eq = toXY(0, 0);
      sctx.beginPath();
      sctx.moveTo(mapX, eq.y);
      sctx.lineTo(mapX + mapWidth, eq.y);
      sctx.stroke();

      const pm = toXY(0, 0);
      sctx.beginPath();
      sctx.moveTo(pm.x, mapY);
      sctx.lineTo(pm.x, mapY + mapHeight);
      sctx.stroke();

      // 2. Continents
      CONTINENTAL_POLYGONS.forEach((poly) => {
        if (poly.length < 3) return;
        sctx.beginPath();
        const first = toXY(poly[0][0], poly[0][1]);
        sctx.moveTo(first.x, first.y);

        for (let i = 1; i < poly.length; i++) {
          const pt = toXY(poly[i][0], poly[i][1]);
          sctx.lineTo(pt.x, pt.y);
        }
        sctx.closePath();

        sctx.fillStyle = '#08172c';
        sctx.shadowColor = 'rgba(56, 189, 248, 0.35)';
        sctx.shadowBlur = 6;
        sctx.fill();

        sctx.lineWidth = 1.5;
        sctx.strokeStyle = '#38bdf8';
        sctx.stroke();
        sctx.shadowBlur = 0;
      });

      // 3. Metropolitan Night Lights
      METRO_HUBS.forEach((hub) => {
        const pt = toXY(hub.lon, hub.lat);
        const r = 8 * hub.intensity;
        const glow = sctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, r);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
        glow.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
        glow.addColorStop(1, 'rgba(56, 189, 248, 0)');

        sctx.fillStyle = glow;
        sctx.beginPath();
        sctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        sctx.fill();

        sctx.fillStyle = '#ffffff';
        sctx.beginPath();
        sctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
        sctx.fill();
      });

      sctx.restore();

      // Cache the size/transform used
      staticSizeRef.current = {
        w: width,
        h: height,
        zoom: currentZoom,
        panX: currentPan.x,
        panY: currentPan.y,
      };
    };

    const render = () => {
      animId = requestAnimationFrame(render);
      shockwaveTick += 0.03;

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Deep space ocean background — cache the gradient
      const cachedBg = bgGradientRef.current;
      if (!cachedBg || cachedBg.height !== height) {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#02050e');
        grad.addColorStop(0.5, '#040b1a');
        grad.addColorStop(1, '#02050e');
        bgGradientRef.current = { gradient: grad, height };
      }
      ctx.fillStyle = bgGradientRef.current!.gradient;
      ctx.fillRect(0, 0, width, height);

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const currentEvents = visibleEventsRef.current;
      const currentSelected = selectedEventRef.current;

      // Redraw static layer only when transform or size changes
      const ss = staticSizeRef.current;
      if (
        ss.w !== width ||
        ss.h !== height ||
        ss.zoom !== currentZoom ||
        ss.panX !== currentPan.x ||
        ss.panY !== currentPan.y
      ) {
        renderStaticLayer(width, height, currentZoom, currentPan);
      }

      // Blit static layer onto main canvas
      ctx.drawImage(staticCanvas, 0, 0);

      // Dynamic content — pan & zoom transform
      ctx.save();
      ctx.translate(width / 2 + currentPan.x, height / 2 + currentPan.y);
      ctx.scale(currentZoom, currentZoom);
      ctx.translate(-width / 2, -height / 2);

      const mapWidth = width * 0.92;
      const mapHeight = height * 0.85;
      const mapX = (width - mapWidth) / 2;
      const mapY = (height - mapHeight) / 2;

      const toXY = (lon: number, lat: number) => {
        const x = mapX + ((lon + 180) / 360) * mapWidth;
        const y = mapY + ((90 - lat) / 180) * mapHeight;
        return { x, y };
      };

      // 4. Connecting Flight Arcs
      for (let i = 0; i < Math.min(currentEvents.length - 1, 6); i++) {
        const e1 = currentEvents[i];
        const e2 = currentEvents[i + 1];
        if (!e1.location || !e2.location) continue;

        const p1 = toXY(e1.location.longitude, e1.location.latitude);
        const p2 = toXY(e2.location.longitude, e2.location.latitude);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - Math.min(80, Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.25);
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 5. Incident Pins and Sonar Shockwaves
      currentEvents.forEach((evt) => {
        if (!evt.location) return;
        const pt = toXY(evt.location.longitude, evt.location.latitude);
        const color = getEventColor(evt.category, evt.source);
        const isSelected = currentSelected?.id === evt.id;

        // Expanding sonar shockwave ring
        if (evt.importance >= 5.5 || isSelected) {
          const waveRadius = 12 + ((shockwaveTick * 15 + evt.importance * 3) % 36);
          const waveAlpha = Math.max(0, 1 - waveRadius / 36);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, waveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = waveAlpha;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Incident marker dot
        const dotRadius = Math.max(4, (evt.importance / 10) * 8);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Core white pin
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Selected Reticle
        if (isSelected) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(pt.x - 12, pt.y - 12, 24, 24);
        }
      });

      ctx.restore();
    };

    render();

    return () => cancelAnimationFrame(animId);
    // Run once — all dynamic data is read from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipDebounceRef.current) clearTimeout(tooltipDebounceRef.current);
    };
  }, []);

  // Mouse Interaction (Pan & Coordinates) — throttled via ref + debounce
  const isDraggingRef = useRef(isDragging);
  const dragStartRef = useRef(dragStart);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  useEffect(() => { dragStartRef.current = dragStart; }, [dragStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    if (isDraggingRef.current) {
      const ds = dragStartRef.current;
      setPan({ x: e.clientX - ds.x, y: e.clientY - ds.y });
    }

    // Calculate real-time coordinates
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;

    const mapWidth = width * 0.92 * currentZoom;
    const mapHeight = height * 0.85 * currentZoom;
    const mapX = (width - mapWidth) / 2 + currentPan.x;
    const mapY = (height - mapHeight) / 2 + currentPan.y;

    const lon = ((clickX - mapX) / mapWidth) * 360 - 180;
    const lat = 90 - ((clickY - mapY) / mapHeight) * 180;

    if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
      cursorCoordsRef.current = { lat: Number(lat.toFixed(2)), lon: Number(lon.toFixed(2)) };
    } else {
      cursorCoordsRef.current = null;
    }

    // Hit test against incident points
    const currentEvents = visibleEventsRef.current;
    const hit = currentEvents.find((evt) => {
      if (!evt.location) return false;
      const ptX = mapX + ((evt.location.longitude + 180) / 360) * mapWidth;
      const ptY = mapY + ((90 - evt.location.latitude) / 180) * mapHeight;
      return Math.hypot(clickX - ptX, clickY - ptY) < 14;
    });

    hoveredEventRef.current = hit ?? null;
    tooltipPosRef.current = hit ? { x: e.clientX, y: e.clientY } : null;
    document.body.style.cursor = hit ? 'pointer' : isDraggingRef.current ? 'grabbing' : 'default';

    // Debounced setState for tooltip display (avoids re-render on every pixel)
    if (tooltipDebounceRef.current) clearTimeout(tooltipDebounceRef.current);
    tooltipDebounceRef.current = setTimeout(() => {
      const hovered = hoveredEventRef.current;
      const tPos = tooltipPosRef.current;
      if (hovered && tPos) {
        setTooltipData({ event: hovered, x: tPos.x, y: tPos.y });
      } else {
        setTooltipData(null);
      }
    }, 50);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredEventRef.current) {
      setSelectedEvent(hoveredEventRef.current);
    }
  }, [setSelectedEvent]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(4.0, prev - e.deltaY * 0.0015)));
  }, []);

  // Derive display values from refs for the telemetry footer (re-read via visibleEvents memo)
  const visibleCount = visibleEvents.length;
  const cursorCoords = cursorCoordsRef.current;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none bg-[#02050e] cursor-crosshair"
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Floating Holographic Tooltip */}
      {tooltipData && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipData.x, top: tooltipData.y - 12 }}
        >
          <div className="bg-slate-950/95 backdrop-blur-xl border border-cyan-400/60 rounded-xl p-3 shadow-[0_0_20px_rgba(56,189,248,0.25)] text-left max-w-xs transition-opacity duration-150">
            <div className="flex items-center justify-between gap-2 mb-1.5 font-mono">
              <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {tooltipData.event.source}
              </span>
              <span className="text-xs font-bold text-amber-400">
                ★ {tooltipData.event.importance.toFixed(1)}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
              {tooltipData.event.title}
            </p>
            {tooltipData.event.country && (
              <p className="text-[10px] text-cyan-400/80 mt-1 font-mono">
                📍 {tooltipData.event.region ? `${tooltipData.event.region}, ` : ''}{tooltipData.event.country}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick 2D Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setViewMode('3d')}
          title="Switch to 3D Globe Projection"
          className="p-2 rounded bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.2)] flex items-center gap-1.5 font-mono text-[10px] font-bold"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">3D GLOBE</span>
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(4.0, z + 0.3))}
          title="Zoom In"
          className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 backdrop-blur-xl transition-all cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.3))}
          title="Zoom Out"
          className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 backdrop-blur-xl transition-all cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset 2D Map Position"
          className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 backdrop-blur-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Telemetry Footer */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl text-[10px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider">MERCATOR 2D RADAR</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">{visibleCount} PLOTTED</span>
        </div>

        {cursorCoords && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-slate-950/90 border border-slate-800 backdrop-blur-xl text-[10px] font-mono text-slate-300 shadow-lg">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>
              LAT: <strong className="text-cyan-300">{cursorCoords.lat}°</strong> LON:{' '}
              <strong className="text-cyan-300">{cursorCoords.lon}°</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const FlatMapCanvas = memo(FlatMapCanvasInner);
