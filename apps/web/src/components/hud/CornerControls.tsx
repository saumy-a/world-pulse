import { useState, type FC } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plane, RotateCw } from 'lucide-react';
import { useEventStore } from '../../store/useEventStore';

export const CornerControls: FC = () => {
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const flightsEnabled = useEventStore((s) => s.activeLayers.flights ?? false);
  const setCameraTarget = useEventStore((s) => s.setCameraTarget);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);

  const handleZoomIn = () => {
    window.dispatchEvent(new CustomEvent('wp:zoom', { detail: { delta: -2.5 } }));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent('wp:zoom', { detail: { delta: 2.5 } }));
  };

  const handleResetView = () => {
    setSelectedEvent(null);
    setCameraTarget({ lat: 20, lon: 0 });
    window.dispatchEvent(new CustomEvent('wp:reset-view'));
  };

  const handleRotationToggle = () => {
    const next = !isAutoRotate;
    setIsAutoRotate(next);
    window.dispatchEvent(new CustomEvent('wp:auto-rotate', { detail: { enabled: next } }));
  };

  return (
    <div
      aria-label="Navigation Controls"
      className="wp-controls"
    >
      <button
        type="button"
        aria-pressed={flightsEnabled}
        onClick={() => useEventStore.setState((state) => ({ activeLayers: { ...state.activeLayers, flights: !flightsEnabled } }))}
        aria-label={flightsEnabled ? 'Hide live flights' : 'Show live flights'}
        title={flightsEnabled ? 'Hide live flights' : 'Show live flights'}
        className={`wp-control ${flightsEnabled ? 'is-active' : ''}`}
      >
        <Plane className="w-4 h-4" /><span className="hidden sm:inline text-[11px]">Flights</span>
      </button>

      <button
        type="button"
        onClick={handleRotationToggle}
        aria-label={isAutoRotate ? 'Pause globe rotation' : 'Resume globe rotation'}
        title={isAutoRotate ? 'Pause globe rotation' : 'Resume globe rotation'}
        className="wp-control"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={handleZoomIn}
        aria-label="Zoom in"
        title="Zoom in (+)"
        className="wp-control"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={handleZoomOut}
        aria-label="Zoom out"
        title="Zoom out (-)"
        className="wp-control"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span className="wp-control-divider" />

      <button
        type="button"
        onClick={handleResetView}
        aria-label="Reset globe view"
        title="Reset view (↺)"
        className="wp-control"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
};
