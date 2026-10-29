import { memo, useEffect, useMemo, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { useEventStore } from '../../store/useEventStore';
import { getEventColor } from '../../utils/geo';
import type { WorldEvent } from '../../types';
import { createEsriImagery } from '../../maps/imagery.js';
import { createKeylessTerrain } from '../../maps/terrain.js';
import { loadPhotorealisticTileset } from '../../maps/google3d.js';

const INITIAL_GLOBE_HEIGHT = 32_000_000;
const EVENT_FLY_HEIGHT = 420_000;
const PLACE_FLY_HEIGHT = 480_000;

/** Cesium globe with tiled satellite imagery, live event markers and flight tracking. */
export const GlobeCanvas = memo(() => {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const eventsDataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  const entitiesRef = useRef(new Map<string, Cesium.Entity>());
  const [viewerReady, setViewerReady] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<WorldEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const events = useEventStore((state) => state.events);
  const filters = useEventStore((state) => state.filters);
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const trackedFlightId = useEventStore((state) => state.trackedFlightId);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  const visibleEvents = useMemo(() => events.filter((event) => {
    if (!event.location) return false;
    return filters.selectedCategories.length === 0 || filters.selectedCategories.includes(event.category);
  }), [events, filters.selectedCategories]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const viewer = new Cesium.Viewer(container, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      vrButton: false,
      selectionIndicator: false,
      infoBox: false,
      baseLayer: false,
      requestRenderMode: false,
      msaaSamples: 4,
    });
    viewerRef.current = viewer;
    viewer.targetFrameRate = 60;
    viewer.scene.globe.show = true;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.maximumScreenSpaceError = 2;
    viewer.scene.globe.tileCacheSize = 512;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b1421');
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.fog.enabled = true;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 180;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 45_000_000;
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);

    void createEsriImagery().then((imagery) => {
      if (viewer.isDestroyed()) return;
      viewer.imageryLayers.addImageryProvider(imagery);
      viewer.scene.requestRender();
    }).catch((error) => console.warn('[World Pulse] Satellite imagery unavailable:', error));
    const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (googleMapsKey) {
      void loadPhotorealisticTileset(Cesium, { googleApiKey: googleMapsKey }).then(({ tileset, errors }) => {
        if (viewer.isDestroyed()) {
          if (tileset && !tileset.isDestroyed()) tileset.destroy();
          return;
        }
        if (tileset) {
          viewer.scene.primitives.add(tileset);
          viewer.scene.globe.show = false;
        } else if (errors.length) {
          console.warn('[World Pulse] 3D imagery unavailable; keeping satellite tiles:', errors.at(-1));
        }
      });
    }
    void createKeylessTerrain().then(({ provider }) => {
      if (viewer.isDestroyed()) {
        provider.destroy();
        return;
      }
      viewer.terrainProvider = provider;
      viewer.scene.requestRender();
    }).catch((error) => console.warn('[World Pulse] Terrain unavailable:', error));

    const eventDataSource = new Cesium.CustomDataSource('world-pulse-events');
    viewer.dataSources.add(eventDataSource);
    eventsDataSourceRef.current = eventDataSource;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-20, 18, INITIAL_GLOBE_HEIGHT),
      orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
    });

    const flyToCoordinates = (latitude: number, longitude: number, height = PLACE_FLY_HEIGHT) => {
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || viewer.isDestroyed()) return;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-42), roll: 0 },
        duration: 1.8,
      });
    };

    const handleFlyTo = (event: Event) => {
      const detail = (event as CustomEvent<{ latitude: number; longitude: number }>).detail;
      if (detail) flyToCoordinates(detail.latitude, detail.longitude);
    };
    const handleZoom = (event: Event) => {
      const delta = (event as CustomEvent<{ delta?: number }>).detail?.delta ?? 1;
      const height = viewer.camera.positionCartographic.height;
      if (delta < 0) viewer.camera.zoomIn(Math.max(height * 0.28, 140));
      else viewer.camera.zoomOut(Math.max(height * 0.28, 140));
    };
    const handleReset = () => {
      viewer.trackedEntity = undefined;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-20, 18, INITIAL_GLOBE_HEIGHT),
        orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
        duration: 1.5,
      });
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let autoRotate = !reduceMotion;
    let idleTimer = 0;
    const rotateGlobe = () => {
      if (autoRotate && !viewer.trackedEntity && viewer.camera.positionCartographic.height > 8_000_000) viewer.camera.rotateRight(0.000015);
    };
    viewer.scene.preRender.addEventListener(rotateGlobe);
    const pauseForInteraction = () => {
      autoRotate = false;
      window.clearTimeout(idleTimer);
      if (!reduceMotion) idleTimer = window.setTimeout(() => { autoRotate = true; }, 3_000);
    };
    viewer.canvas.addEventListener('pointerdown', pauseForInteraction);
    viewer.canvas.addEventListener('wheel', pauseForInteraction);

    const handleAutoRotate = (event: Event) => {
      const enabled = Boolean((event as CustomEvent<{ enabled: boolean }>).detail?.enabled);
      autoRotate = enabled && !reduceMotion;
    };

    const handler = viewer.screenSpaceEventHandler;
    handler.setInputAction((movement: { position: Cesium.Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.position);
      const id = (picked?.id as Cesium.Entity | undefined)?.id;
      const eventId = typeof id === 'string' ? id.replace(/^world-pulse:/, '') : '';
      const eventRecord = useEventStore.getState().events.find((item) => item.id === eventId);
      if (eventRecord) setSelectedEvent(eventRecord);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction((movement: { endPosition: Cesium.Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.endPosition);
      const id = (picked?.id as Cesium.Entity | undefined)?.id;
      const eventId = typeof id === 'string' ? id.replace(/^world-pulse:/, '') : '';
      const eventRecord = useEventStore.getState().events.find((item) => item.id === eventId);
      setHoveredEvent(eventRecord ?? null);
      if (eventRecord) {
        const bounds = viewer.canvas.getBoundingClientRect();
        setTooltipPosition({ x: bounds.left + movement.endPosition.x, y: bounds.top + movement.endPosition.y });
      }
      else setTooltipPosition(null);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    window.addEventListener('wp:fly-to', handleFlyTo);
    window.addEventListener('wp:zoom', handleZoom);
    window.addEventListener('wp:reset-view', handleReset);
    window.addEventListener('wp:auto-rotate', handleAutoRotate);
    const resizeObserver = new ResizeObserver(() => viewer.resize());
    resizeObserver.observe(container);
    setViewerReady(true);

    return () => {
      setViewerReady(false);
      window.removeEventListener('wp:fly-to', handleFlyTo);
      window.removeEventListener('wp:zoom', handleZoom);
      window.removeEventListener('wp:reset-view', handleReset);
      window.removeEventListener('wp:auto-rotate', handleAutoRotate);
      viewer.scene.preRender.removeEventListener(rotateGlobe);
      viewer.canvas.removeEventListener('pointerdown', pauseForInteraction);
      viewer.canvas.removeEventListener('wheel', pauseForInteraction);
      window.clearTimeout(idleTimer);
      resizeObserver.disconnect();
      entitiesRef.current.clear();
      viewerRef.current = null;
      eventsDataSourceRef.current = null;
      if (!viewer.isDestroyed()) viewer.destroy();
    };
  }, [setSelectedEvent]);

  useEffect(() => {
    const source = eventsDataSourceRef.current;
    const viewer = viewerRef.current;
    if (!viewerReady || !source || !viewer || viewer.isDestroyed()) return;

    const wanted = new Set(visibleEvents.map((event) => event.id));
    for (const [id, entity] of entitiesRef.current) {
      if (!wanted.has(id)) {
        source.entities.remove(entity);
        entitiesRef.current.delete(id);
      }
    }

    for (const event of visibleEvents) {
      const location = event.location;
      if (!location) continue;
      const altitudeFt = Number(event.metadata?.altitude);
      const altitudeM = event.source === 'flight' && Number.isFinite(altitudeFt) ? Math.max(0, altitudeFt * 0.3048) : 0;
      const position = Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, altitudeM);
      const color = Cesium.Color.fromCssColorString(getEventColor(event.category, event.source));
      const magnitude = Number(event.metadata?.magnitude) || 1;
      const existing = entitiesRef.current.get(event.id);
      if (existing) {
        existing.position = position;
        existing.point!.color = color;
        existing.ellipse && (existing.ellipse.semiMajorAxis = magnitude * 10_000);
        existing.ellipse && (existing.ellipse.semiMinorAxis = magnitude * 10_000);
        continue;
      }
      const entity = source.entities.add({
        id: `world-pulse:${event.id}`,
        position,
        point: {
          pixelSize: event.source === 'flight' ? 8 : 7,
          color,
          outlineColor: color.withAlpha(0.5),
          outlineWidth: 2,
          scaleByDistance: new Cesium.NearFarScalar(2_000, 1.35, 20_000_000, 0.65),
        },
        ...(event.source === 'usgs' ? {
          ellipse: {
            semiMajorAxis: magnitude * 10_000,
            semiMinorAxis: magnitude * 10_000,
            material: color.withAlpha(0.08),
            outline: true,
            outlineColor: color.withAlpha(0.52),
            outlineWidth: 1,
          },
        } : {}),
      });
      entitiesRef.current.set(event.id, entity);
    }
  }, [visibleEvents, viewerReady]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewerReady || !viewer || viewer.isDestroyed()) return;
    if (!trackedFlightId) {
      viewer.trackedEntity = undefined;
      return;
    }
    const trackedEntity = entitiesRef.current.get(trackedFlightId);
    if (trackedEntity) {
      if (viewer.trackedEntity !== trackedEntity) {
        viewer.trackedEntity = trackedEntity;
        viewer.camera.zoomIn(Math.max(0, viewer.camera.positionCartographic.height - 260_000));
      }
    } else {
      viewer.trackedEntity = undefined;
      useEventStore.getState().setTrackedFlightId(null);
    }
  }, [trackedFlightId, viewerReady, visibleEvents]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewerReady || !viewer || viewer.isDestroyed() || !selectedEvent?.location) return;
    if (selectedEvent.source === 'flight' && trackedFlightId === selectedEvent.id) return;
    viewer.trackedEntity = undefined;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(selectedEvent.location.longitude, selectedEvent.location.latitude, EVENT_FLY_HEIGHT),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-38), roll: 0 },
      duration: 1.8,
    });
  }, [selectedEvent, trackedFlightId, viewerReady]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#070a12]">
      <div ref={mountRef} className="h-full w-full" aria-label="Interactive 3D Earth globe" />
      {hoveredEvent && tooltipPosition && (
        <div role="tooltip" className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-[#0c1220]/90 px-3 py-2 text-xs text-slate-100 shadow-2xl backdrop-blur-md" style={{ left: tooltipPosition.x, top: tooltipPosition.y - 12 }}>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide" style={{ color: getEventColor(hoveredEvent.category, hoveredEvent.source) }}>{hoveredEvent.source === 'flight' ? 'Live flight' : hoveredEvent.type}</span>
          <span>{hoveredEvent.title}</span>
        </div>
      )}
    </div>
  );
});
