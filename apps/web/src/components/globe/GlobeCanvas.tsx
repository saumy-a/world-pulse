import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useEventStore } from '../../store/useEventStore';
import { latLongToVector3, getEventColor } from '../../utils/geo';
import { createProceduralGlobeTexture } from './textureGenerator';
import { createAtmosphereMaterial } from './AtmosphereShader';
import { GlobeControls } from './GlobeControls';
import type { WorldEvent } from '../../types';
import { Compass, RotateCw, ZoomIn, ZoomOut, Target, Map } from 'lucide-react';

const GLOBE_RADIUS = 5.0;

export const GlobeCanvas = memo(() => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredEvent, setHoveredEvent] = useState<WorldEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [hudCoords, setHudCoords] = useState<{ lat: number; lon: number } | null>(null);

  const events = useEventStore((s) => s.events);
  const filters = useEventStore((s) => s.filters);
  const activeLayers = useEventStore((s) => s.activeLayers);
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const cameraTarget = useEventStore((s) => s.cameraTarget);
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);
  const setViewMode = useEventStore((s) => s.setViewMode);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const photonsRef = useRef<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number; speed: number }[]>([]);
  const shockwavesRef = useRef<{ mesh: THREE.Mesh; scale: number; basePos: THREE.Vector3; color: string }[]>([]);
  const targetReticleRef = useRef<THREE.Mesh | null>(null);

  // Filter visible events (memoized to avoid recomputation & reference thrashing)
  const visibleEvents = useMemo(() => {
    return events.filter((evt) => {
      if (!evt.location) return false;
      // Check layer toggle
      if (activeLayers[evt.category] === false) return false;
      if (filters.minImportance > 0 && evt.importance < filters.minImportance) return false;
      if (
        filters.selectedCategories.length > 0 &&
        !filters.selectedCategories.includes(evt.category)
      ) {
        return false;
      }
      if (
        filters.selectedSources.length > 0 &&
        !filters.selectedSources.includes(evt.source)
      ) {
        return false;
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

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || (window.innerHeight - 64) || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 14.5);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.enablePan = true;
    controls.minDistance = 5.3;
    controls.maxDistance = 35;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.55;
    controlsRef.current = controls;

    // 4. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.6);
    keyLight.position.set(16, 12, 18);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    fillLight.position.set(-16, -10, -18);
    scene.add(fillLight);

    // 5. Starfield Particles (Thousands of deep-space stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 40 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.85,
      transparent: true,
      opacity: 0.7,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 6. Earth Mesh with High-Tech Procedural Textures
    const globeTexture = createProceduralGlobeTexture();
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.55,
      metalness: 0.35,
      emissive: new THREE.Color(0x061833),
      emissiveIntensity: 0.7,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);

    // 7. Outer Atmospheric Corona Shader (Fresnel Rim Glow)
    const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.14, 64, 64);
    const atmosMat = createAtmosphereMaterial(0x00f0ff);
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // 8. Equator / Orbital Rings
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.005, GLOBE_RADIUS * 1.015, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const eqRing = new THREE.Mesh(ringGeo, ringMat);
    eqRing.rotation.x = Math.PI / 2;
    scene.add(eqRing);

    // Target reticle ring for selected incident
    const reticleGeo = new THREE.RingGeometry(0.2, 0.26, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const reticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
    reticleMesh.visible = false;
    scene.add(reticleMesh);
    targetReticleRef.current = reticleMesh;

    // Groups for pins and arcs
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    // 9. Pointer Raycasting & Interaction Drag Detection
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let lastRaycastTime = 0;
    let mouseDownPos = { x: 0, y: 0 };
    let hasDragged = false;

    const handlePointerDown = (evt: MouseEvent) => {
      mouseDownPos = { x: evt.clientX, y: evt.clientY };
      hasDragged = false;
    };

    const handlePointerMove = (evt: MouseEvent) => {
      const now = performance.now();
      // Throttle raycasting to ~30fps to avoid main thread bottleneck
      if (now - lastRaycastTime < 32) return;
      lastRaycastTime = now;

      const rect = renderer.domElement.getBoundingClientRect();
      if (Math.hypot(evt.clientX - mouseDownPos.x, evt.clientY - mouseDownPos.y) > 6) {
        hasDragged = true;
      }
      pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast against Earth globe to calculate real-time Lat/Lon HUD coordinates
      raycaster.setFromCamera(pointer, camera);
      const earthHit = raycaster.intersectObject(globeMesh);
      if (earthHit.length > 0) {
        const point = earthHit[0].point.normalize();
        const lat = 90 - Math.acos(point.y) * (180 / Math.PI);
        const lon = ((Math.atan2(point.z, -point.x) * (180 / Math.PI) - 180 + 540) % 360) - 180;
        setHudCoords((prev) => {
          const newLat = Number(lat.toFixed(1));
          const newLon = Number(lon.toFixed(1));
          if (prev && prev.lat === newLat && prev.lon === newLon) return prev;
          return { lat: newLat, lon: newLon };
        });
      } else {
        setHudCoords((prev) => (prev === null ? prev : null));
      }

      // Raycast against event markers
      const intersects = raycaster.intersectObjects(markersGroup.children, true);
      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.userData?.event && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj?.userData?.event) {
          setHoveredEvent(rootObj.userData.event);
          setTooltipPos({ x: evt.clientX, y: evt.clientY });
          document.body.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredEvent((prev) => (prev === null ? prev : null));
      setTooltipPos((prev) => (prev === null ? prev : null));
      document.body.style.cursor = 'default';
    };

    const handleClick = () => {
      // Don't trigger incident selection if user was rotating/panning the globe
      if (hasDragged) return;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);
      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.userData?.event && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj?.userData?.event) {
          setSelectedEvent(rootObj.userData.event);
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', handlePointerDown);
    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth || 800;
      const h = container.clientHeight || (window.innerHeight - 64) || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. 60fps Animation Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Animate shockwaves expanding outwards
      shockwavesRef.current.forEach((item) => {
        item.scale += 0.018;
        if (item.scale > 2.0) item.scale = 0.2;
        item.mesh.scale.set(item.scale, item.scale, item.scale);
        const mat = item.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.85 * (1 - item.scale / 2.0));
      });

      // Animate illuminated data photons traveling along curves
      photonsRef.current.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pos = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pos);
      });

      // Rotate selected reticle if visible
      if (targetReticleRef.current && targetReticleRef.current.visible) {
        targetReticleRef.current.rotation.z += 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handlePointerDown);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      globeTexture.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      shockwavesRef.current = [];
      photonsRef.current = [];
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update target reticle on selectedEvent
  useEffect(() => {
    const reticle = targetReticleRef.current;
    if (!reticle) return;

    if (selectedEvent && selectedEvent.location) {
      const pos = latLongToVector3(selectedEvent.location.latitude, selectedEvent.location.longitude, GLOBE_RADIUS + 0.02);
      const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      reticle.position.copy(pos);
      reticle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      const color = getEventColor(selectedEvent.category, selectedEvent.source);
      (reticle.material as THREE.MeshBasicMaterial).color.set(color);
      reticle.visible = true;
    } else {
      reticle.visible = false;
    }
  }, [selectedEvent]);

  // Smooth camera fly-to on target using requestAnimationFrame
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current || !cameraRef.current) return;
    const { lat, lon } = cameraTarget;
    const targetPos = latLongToVector3(lat, lon, GLOBE_RADIUS * 2.2);

    const cam = cameraRef.current;
    const startPos = cam.position.clone();
    const destPos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);

    let progress = 0;
    let flyAnimId: number;
    const step = () => {
      progress += 0.04;
      cam.position.lerpVectors(startPos, destPos, Math.min(1, progress));
      controlsRef.current?.update();
      if (progress < 1) {
        flyAnimId = requestAnimationFrame(step);
      } else {
        setCameraTarget(null);
      }
    };
    flyAnimId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(flyAnimId);
  }, [cameraTarget, setCameraTarget]);

  // Rebuild 3D markers and animated data arcs
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    const arcsGroup = arcsGroupRef.current;
    if (!markersGroup || !arcsGroup) return;

    // Properly dispose existing geometries/materials to prevent memory leak
    const disposeGroup = (group: THREE.Group) => {
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
        obj.traverse((child) => {
          if ((child as THREE.Mesh).geometry) {
            (child as THREE.Mesh).geometry.dispose();
          }
          if ((child as THREE.Mesh).material) {
            const mat = (child as THREE.Mesh).material;
            if (Array.isArray(mat)) {
              mat.forEach((m) => m.dispose());
            } else {
              mat.dispose();
            }
          }
        });
      }
    };

    disposeGroup(markersGroup);
    disposeGroup(arcsGroup);
    shockwavesRef.current = [];
    photonsRef.current = [];

    // Render 3D Pins & Laser Beacons
    visibleEvents.forEach((evt) => {
      if (!evt.location) return;
      const { latitude, longitude } = evt.location;
      const pos = latLongToVector3(latitude, longitude, GLOBE_RADIUS);
      const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      const colorHex = getEventColor(evt.category, evt.source);
      const isSelected = selectedEvent?.id === evt.id;

      const markerObj = new THREE.Group();
      markerObj.userData = { event: evt };

      // Beacon pole
      const poleHeight = Math.max(0.3, (evt.importance / 10) * 0.6);
      const beamGeo = new THREE.CylinderGeometry(0.018, 0.018, poleHeight, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.85,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS + poleHeight / 2));
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      markerObj.add(beamMesh);

      // Glowing tip sphere
      const sphereRadius = Math.max(0.09, (evt.importance / 10) * 0.17);
      const tipGeo = new THREE.SphereGeometry(sphereRadius, 16, 16);
      const tipMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
      });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      const tipPos = normal.clone().multiplyScalar(GLOBE_RADIUS + poleHeight);
      tipMesh.position.copy(tipPos);
      markerObj.add(tipMesh);

      // Expanding Shockwave ring
      if (evt.importance >= 5.5 || isSelected) {
        const ringGeo = new THREE.RingGeometry(0.08, 0.16, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(colorHex),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS + 0.01));
        ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        markerObj.add(ringMesh);

        shockwavesRef.current.push({
          mesh: ringMesh,
          scale: 0.2,
          basePos: normal.clone().multiplyScalar(GLOBE_RADIUS + 0.01),
          color: colorHex,
        });
      }

      markersGroup.add(markerObj);
    });

    // Draw Dynamic Connecting Arcs & Traveling Photons
    for (let i = 0; i < Math.min(visibleEvents.length - 1, 6); i++) {
      const e1 = visibleEvents[i];
      const e2 = visibleEvents[i + 1];
      if (!e1.location || !e2.location) continue;

      const p1 = latLongToVector3(e1.location.latitude, e1.location.longitude, GLOBE_RADIUS);
      const p2 = latLongToVector3(e2.location.latitude, e2.location.longitude, GLOBE_RADIUS);
      const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
      const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);

      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const dist = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.38);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.4,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcsGroup.add(arcLine);

      // Glowing Data Photon that glides along the arc
      const photonGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      arcsGroup.add(photonMesh);

      photonsRef.current.push({
        mesh: photonMesh,
        curve,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.005,
      });
    }
  }, [visibleEvents, selectedEvent]);

  const handleZoom = useCallback((delta: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    cam.position.addScaledVector(dir, delta);
    controlsRef.current.update();
  }, []);

  const resetView = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 3.5, 14.5);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#02050e]">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Tactical Corner Reticles (Top Left & Bottom Right) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1">
        <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-500/60" />
        <span className="text-[9px] font-mono tracking-widest text-cyan-500/80 uppercase">
          RECON / ORBIT CAM
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex flex-col items-end gap-1">
        <span className="text-[9px] font-mono tracking-widest text-cyan-500/80 uppercase">
          SECTOR-01 // GL-3D
        </span>
        <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-500/60" />
      </div>

      {/* Floating Holographic Tooltip */}
      {hoveredEvent && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
        >
          <div className="bg-slate-950/95 backdrop-blur-xl border border-cyan-400/60 rounded-xl p-3 shadow-[0_0_20px_rgba(56,189,248,0.25)] text-left max-w-xs transition-opacity duration-150">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {hoveredEvent.source}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                ★ {hoveredEvent.importance.toFixed(1)}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
              {hoveredEvent.title}
            </p>
            {hoveredEvent.country && (
              <p className="text-[10px] text-cyan-400/80 mt-1 font-mono">
                📍 {hoveredEvent.region ? `${hoveredEvent.region}, ` : ''}{hoveredEvent.country}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Holographic 3D Layer Switcher */}
      <GlobeControls />

      {/* HUD Quick Globe Controls (Top Right Overlay) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setViewMode('2d')}
          title="Switch to 2D Mercator Radar Projection"
          className="p-2 rounded bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.2)] flex items-center gap-1.5 font-mono text-[10px] font-bold"
        >
          <Map className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">2D RADAR</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          className={`p-2 rounded border backdrop-blur-xl transition-all ${
            autoRotate
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '9s' }} />
        </button>

        <button
          onClick={() => handleZoom(2.0)}
          title="Zoom In"
          className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 backdrop-blur-xl transition-all"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(-2.0)}
          title="Zoom Out"
          className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 backdrop-blur-xl transition-all"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={resetView}
          title="Reset Camera View"
          className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 backdrop-blur-xl transition-all"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tactical Telemetry HUD Footer Badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl text-[10px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider">GOD'S EYE 3D</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">{visibleEvents.length} TARGETS</span>
        </div>

        {/* Real-time Cursor Geographic Telemetry */}
        {hudCoords && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-slate-950/90 border border-slate-800 backdrop-blur-xl text-[10px] font-mono text-slate-300 shadow-lg">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>
              LAT: <strong className="text-cyan-300">{hudCoords.lat}°</strong> LON:{' '}
              <strong className="text-cyan-300">{hudCoords.lon}°</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

GlobeCanvas.displayName = 'GlobeCanvas';
