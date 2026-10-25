import * as THREE from 'three';
import { CONTINENTAL_POLYGONS, METRO_HUBS } from './worldPolygons';

// Cache the generated texture so it's only built once across component remounts
let cachedTexture: THREE.CanvasTexture | null = null;

export function createProceduralGlobeTexture(): THREE.CanvasTexture {
  // Return cached texture if already generated (avoids expensive re-generation on remount)
  if (cachedTexture) {
    return cachedTexture;
  }

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Deep space / cyber ocean background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#02050e');
  oceanGrad.addColorStop(0.5, '#050c1f');
  oceanGrad.addColorStop(1, '#02050e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  const toXY = (lon: number, lat: number) => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  // 2. Tactical Latitude / Longitude Matrix Grid
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = 'rgba(14, 116, 144, 0.18)';

  // Longitude lines
  for (let lon = -180; lon <= 180; lon += 15) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Latitude lines
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Highlight Major Parallels (Equator, Tropics, Prime Meridian)
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';

  // Equator
  const eqY = height / 2;
  ctx.beginPath();
  ctx.moveTo(0, eqY);
  ctx.lineTo(width, eqY);
  ctx.stroke();

  // Prime Meridian
  const pmX = width / 2;
  ctx.beginPath();
  ctx.moveTo(pmX, 0);
  ctx.lineTo(pmX, height);
  ctx.stroke();

  // Tropic of Cancer (23.5° N) & Capricorn (23.5° S)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  const cancerY = ((90 - 23.5) / 180) * height;
  const capricornY = ((90 - -23.5) / 180) * height;

  ctx.beginPath();
  ctx.moveTo(0, cancerY);
  ctx.lineTo(width, cancerY);
  ctx.moveTo(0, capricornY);
  ctx.lineTo(width, capricornY);
  ctx.stroke();

  // 3. Draw Accurate Continental Landmasses
  CONTINENTAL_POLYGONS.forEach((polygon) => {
    if (polygon.length < 3) return;

    ctx.beginPath();
    const first = toXY(polygon[0][0], polygon[0][1]);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < polygon.length; i++) {
      const pt = toXY(polygon[i][0], polygon[i][1]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();

    // Fill continent with tactical dark cyber slate
    ctx.fillStyle = '#08172b';
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fill();

    // Glowing Neon Coastline Border
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.shadowBlur = 0;
  });

  // 4. Draw Intercontinental Cyber Data Highways (Faint arcs on map)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < METRO_HUBS.length - 1; i += 2) {
    const h1 = toXY(METRO_HUBS[i].lon, METRO_HUBS[i].lat);
    const h2 = toXY(METRO_HUBS[i + 1].lon, METRO_HUBS[i + 1].lat);
    ctx.beginPath();
    ctx.moveTo(h1.x, h1.y);
    ctx.lineTo(h2.x, h2.y);
    ctx.stroke();
  }

  // 5. Draw Metropolitan Night City Lights (Warm golden & cyan nodes)
  METRO_HUBS.forEach((hub) => {
    const pt = toXY(hub.lon, hub.lat);

    // Outer glow halo
    const outerHalo = ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, 12 * hub.intensity);
    outerHalo.addColorStop(0, 'rgba(251, 191, 36, 0.9)'); // Gold center
    outerHalo.addColorStop(0.4, 'rgba(56, 189, 248, 0.5)'); // Cyan rim
    outerHalo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = outerHalo;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 12 * hub.intensity, 0, Math.PI * 2);
    ctx.fill();

    // Core bright star dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.5 * hub.intensity, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  cachedTexture = texture;
  return texture;
}
