interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/** Small +/- overlay buttons for zooming a map by clicking. */
export default function MapZoomControls({
  onZoomIn,
  onZoomOut,
}: MapZoomControlsProps) {
  // Stop clicks from falling through to the map's guess handler.
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="map-zoom" onClick={stop}>
      <button
        type="button"
        className="map-zoom-btn"
        onClick={onZoomIn}
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        className="map-zoom-btn"
        onClick={onZoomOut}
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
    </div>
  );
}
