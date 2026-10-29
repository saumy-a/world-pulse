/**
 * @module hud
 * @description Intelligence HUD Overlay — NRO/NGA Satellite Aesthetic.
 *
 * Renders authentic reconnaissance metadata over the Cesium canvas:
 * classification banners, live MGRS/lat-lon coordinates, sensor metrics
 * (GSD, NIIRS, ONA), timestamps, and orbital data — all updating in
 * real-time at configurable cadences.
 *
 * The HUD auto-activates when a military-style shader (NVG, FLIR, CRT) is
 * selected and supports three layout variants: tactical, operator, minimal.
 *
 * Color theming is driven by the active shader mode via CSS custom properties.
 */

import * as Cesium from 'cesium';
import {
  ellipsoidalToMslDisplayM,
  ensureGeoidReady,
  geoidHeight,
} from './data/geoid.js';
import {
  applyHudUiTheme,
  DEFAULT_HUD_LAYOUT,
  normalizeHudLayout,
} from './hudLayouts.js';

/** Color palettes keyed by shader mode; applied as CSS custom properties. */
const HUD_COLORS = {
  surveillance: {
    main: 'rgba(51, 255, 51, 0.8)',
    glow: 'rgba(51, 255, 51, 0.5)',
    border: 'rgba(51, 255, 51, 0.2)',
  },
  thermal: {
    main: 'rgba(255, 255, 255, 0.7)',
    glow: 'rgba(255, 255, 255, 0.4)',
    border: 'rgba(255, 255, 255, 0.15)',
  },
  retro: {
    main: 'rgba(255, 170, 0, 0.8)',
    glow: 'rgba(255, 170, 0, 0.5)',
    border: 'rgba(255, 170, 0, 0.2)',
  },
  _default: {
    main: 'rgba(0, 255, 255, 0.6)',
    glow: 'rgba(0, 255, 255, 0.4)',
    border: 'rgba(0, 255, 255, 0.15)',
  },
};

/** Shader modes that automatically show the HUD overlay. */
const MILITARY_STYLES = new Set(['retro', 'surveillance', 'thermal']);

/**
 * Cell size (degrees) for the ALT readout's geoid-undulation cache. N changes
 * by well under a metre across 0.01° (~1.1 km), so one lookup per cell keeps
 * the 4 Hz telemetry tick off the EGM96 grid without a visible step.
 */
const HUD_GEOID_CELL_DEG = 0.01;

/**
 * Full-screen intelligence HUD overlay rendered on top of the Cesium canvas.
 *
 * Displays classification banners, MGRS/lat-lon readouts, sensor metrics
 * (GSD, NIIRS, off-nadir angle), sun elevation, orbital metadata, and a
 * rolling semantic summary line. All values derive from the live camera
 * position and update on independent timer cadences.
 */
export class IntelHUD {
  /**
   * @param {Cesium.Viewer} viewer - The Cesium Viewer instance used for
   *   camera telemetry and coordinate derivation.
   */
  constructor(viewer) {
    this.viewer = viewer;
    this._visible = false;
    this._autoMode = true; // auto show/hide based on style
    this._currentStyle = 'normal';
    this._el = null;
    this._variant = DEFAULT_HUD_LAYOUT;
    this._updateInterval = null;
    this._timestampInterval = null;
    // ALT readout datum: the camera height Cesium reports is ELLIPSOIDAL, the
    // number a viewer reads is MSL. N comes from the same lazy ~2.7 MB EGM96
    // chunk the flight layers use — requested on the first telemetry tick of a
    // VISIBLE HUD, never at construction, so a hidden HUD costs nothing — and
    // cached per coarse cell. Until it resolves, or if it never does,
    // `ellipsoidalToMslDisplayM` passes the raw height straight through.
    this._geoidRequested = false;
    this._geoidReady = false;
    this._geoidCellKey = null;
    this._geoidN = null;
    this._onCameraMoveEnd = () => {
      if (this._visible) this._updateCameraData();
    };

    this._buildDOM();
    this.viewer.camera.moveEnd.addEventListener(this._onCameraMoveEnd);
    this._startTimers();
  }

  /**
   * Construct the HUD DOM structure inside the existing `#intel-hud` element.
   * Builds one compact readout for time, coordinates, and altitude.
   */
  _buildDOM() {
    this._el = document.getElementById('intel-hud');
    if (!this._el) return;

    // i18n-ignore: sensor codes; the rest uses t()
    this._el.innerHTML = `
      <div id="hud-minimal-readout" aria-label="Current time and map location">
        <span id="hud-timestamp">--:--:-- UTC</span>
        <span class="hud-readout-separator" aria-hidden="true">·</span>
        <span id="hud-location">lat ---, lon ---</span>
        <span class="hud-readout-separator" aria-hidden="true">·</span>
        <span id="hud-alt">alt --- m</span>
      </div>
    `;
    this._el.dataset.variant = this._variant;
  }

  /**
   * Start the clock and camera-position refresh timers.
   */
  _startTimers() {
    const timestamp = document.getElementById('hud-timestamp');
    if (timestamp) timestamp.textContent = this._formatUTC();

    // Timestamp — every second
    this._timestampInterval = setInterval(() => {
      const el = document.getElementById('hud-timestamp');
      if (el) el.textContent = this._formatUTC();
    }, 1000);

    // Camera-derived data — 4 updates/second (250ms)
    this._updateInterval = setInterval(() => {
      if (!this._visible) return;
      this._updateCameraData();
    }, 250);

  }

  /**
   * Format the current wall-clock time as a UTC Zulu string.
   * @returns {string} The current UTC time.
   */
  _formatUTC() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const mi = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    return `${h}:${mi}:${s} UTC`;
  }

  /**
   * Geoid undulation N at the camera subpoint, memoized per coarse cell.
   * @param {number} latDeg - Camera latitude in decimal degrees.
   * @param {number} lonDeg - Camera longitude in decimal degrees.
   * @returns {number|null} N in metres, or null while the grid is unavailable.
   */
  _geoidUndulationM(latDeg, lonDeg) {
    if (!this._geoidReady) {
      if (!this._geoidRequested) {
        this._geoidRequested = true;
        ensureGeoidReady()
          .then(() => {
            this._geoidReady = true;
          })
          .catch(() => {
            /* readout falls back to the uncorrected height */
          });
      }
      return null;
    }
    const key = `${Math.round(latDeg / HUD_GEOID_CELL_DEG)}:${Math.round(lonDeg / HUD_GEOID_CELL_DEG)}`;
    if (key !== this._geoidCellKey) {
      try {
        this._geoidN = geoidHeight(latDeg, lonDeg);
      } catch {
        this._geoidN = null;
      }
      this._geoidCellKey = key;
    }
    return Number.isFinite(this._geoidN) ? this._geoidN : null;
  }

  /**
   * Derive all camera-based telemetry and push values to the DOM.
   * Reads the camera position and updates the minimal location readout.
   */
  _updateCameraData() {
    const camera = this.viewer.camera;
    const cartographic = camera.positionCartographic;
    if (!cartographic) return;

    const lonDeg = Cesium.Math.toDegrees(cartographic.longitude);
    const latDeg = Cesium.Math.toDegrees(cartographic.latitude);
    const altM = cartographic.height;
    const locationEl = document.getElementById('hud-location');
    if (locationEl)
      locationEl.textContent = `lat ${latDeg.toFixed(4)}°, lon ${lonDeg.toFixed(4)}°`;

    // Altitude — reported as height above MEAN SEA LEVEL. `altM` is the raw
    // ellipsoidal camera height, which reads far below zero wherever the geoid
    // sits under the ellipsoid: a cockpit parked on the SFO deck (N ≈ -32 m)
    // showed "ALT: -15m", and JFK "ALT: -18m". Subtracting N restores the
    // number a viewer expects without touching the camera or any render path.
    const altEl = document.getElementById('hud-alt');
    const geoidN = this._geoidUndulationM(latDeg, lonDeg);
    const altMslM = ellipsoidalToMslDisplayM(altM, geoidN);
    if (altEl)
      altEl.textContent = `alt ${Math.round(altMslM)} m`;

  }

  // ── Public API ──────────────────────────

  /**
   * React to a shader-style change. Updates the mode label, HUD color
   * scheme (via CSS custom properties), and auto-shows/hides the overlay
   * when in auto mode.
   * @param {string} styleName - Active style key (e.g. `'surveillance'`,
   *   `'thermal'`, `'retro'`, `'normal'`).
   */
  onStyleChange(styleName) {
    this._currentStyle = styleName;

    // Update color scheme
    const colors = HUD_COLORS[styleName] || HUD_COLORS._default;
    if (this._el) {
      this._el.style.setProperty('--hud-color', colors.main);
      this._el.style.setProperty('--hud-glow', colors.glow);
      this._el.style.setProperty('--hud-border', colors.border);
    }

    // Auto show/hide
    if (this._autoMode) {
      if (MILITARY_STYLES.has(styleName)) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  /** Show the minimal readout and immediately refresh its values. */
  show() {
    this._visible = true;
    if (this._el) this._el.classList.add('active');
    this._updateCameraData(); // immediate update
  }

  /** Hide the HUD overlay. */
  hide() {
    this._visible = false;
    if (this._el) this._el.classList.remove('active');
  }

  /** Toggle HUD visibility and disable auto-mode (user override). */
  toggle() {
    if (this._visible) {
      this._autoMode = false; // user override
      this.hide();
    } else {
      this._autoMode = false;
      this.show();
    }
  }

  /**
   * Explicit HUD mode control for scene/recording playback.
   * @param {'auto'|'on'|'off'} mode - `'auto'` re-enables style-driven
   *   show/hide; `'on'`/`'off'` force visibility and disable auto-mode.
   */
  setMode(mode) {
    if (mode === 'auto') {
      this._autoMode = true;
      this.onStyleChange(this._currentStyle);
      return;
    }

    this._autoMode = false;
    if (mode === 'on') this.show();
    else this.hide();
  }

  /**
   * Switch the HUD layout variant. Falls back to `'tactical'` if the
   * name is unrecognized. Cyber also applies a coordinated skin to the full
   * application shell; leaving Cyber restores the standard shell tokens.
   * @param {string} variantName - One of `'tactical'`, `'operator'`, `'minimal'`, `'cyber'`.
   */
  setVariant(variantName) {
    this._variant = normalizeHudLayout(variantName);
    if (this._el) {
      this._el.dataset.variant = this._variant;
    }
    applyHudUiTheme(document.documentElement, this._variant);
  }

  /**
   * @returns {string} The current HUD layout variant name.
   */
  getVariant() {
    return this._variant;
  }

  /**
   * @returns {'auto'|'on'|'off'} Current HUD mode — `'auto'` when style-driven
   *   show/hide is active, otherwise the explicit visibility override.
   */
  getMode() {
    if (this._autoMode) return 'auto';
    return this._visible ? 'on' : 'off';
  }

  /** @returns {boolean} Whether the HUD is currently visible. */
  get visible() {
    return this._visible;
  }

  /** Tear down all running intervals. Call when discarding the HUD instance. */
  destroy() {
    clearInterval(this._updateInterval);
    clearInterval(this._timestampInterval);
    this.viewer.camera.moveEnd.removeEventListener(this._onCameraMoveEnd);
  }
}
