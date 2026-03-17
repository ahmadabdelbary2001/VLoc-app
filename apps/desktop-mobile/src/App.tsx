import { useState, useEffect } from "react";
import { 
  MapControlsOverlay, 
  RouteSettingsModal 
} from "@vloc/ui";
import { GoogleMap } from "./components/map/GoogleMap";
import { useSimulation } from "./providers/SimulationProvider";
import { useMap } from "./providers/MapProvider";

function App() {
  const { 
    isActive, 
    currentLocation,
    realLocation,
    waypoints, 
    addWaypoint, 
    clearWaypoints, 
    removeLastWaypoint,
    start,
    stop 
  } = useSimulation();

  const { map, toggleTheme } = useMap();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);

  // Default values from legacy project
  const DEFAULT_CENTER = { lat: 35.0, lng: 39.0 };
  const DEFAULT_ZOOM = 6.2;

  // Initial Position Logic: If realLocation is available, center on it. Otherwise, use DEFAULT.
  // We only do this ONCE (using hasCentered) to avoid snapping back repeatedly.
  useEffect(() => {
    if (map && realLocation && !isActive && waypoints.length === 0 && !hasCentered) {
      map.panTo({ lat: realLocation.lat, lng: realLocation.lng });
      map.setZoom(15);
      setHasCentered(true);
    }
  }, [map, realLocation, isActive, waypoints.length, hasCentered]);

  return (
    <div className="h-screen w-screen bg-zinc-950 overflow-hidden relative">
      {/* Real Map Surface */}
      <div className="absolute inset-0">
        <GoogleMap 
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          onMapClick={(lat, lng) => !isActive && addWaypoint(lat, lng)}
        />
      </div>

      {/* UI Overlay */}
      <MapControlsOverlay
        isPlaying={isActive}
        isMovingMode={waypoints.length > 1}
        hasSelection={waypoints.length > 0}
        onPlayToggle={() => {
          if (!isActive) {
            if (waypoints.length === 1) {
              // Static Mode: Start immediately with defaults
              start({ speed: 10, inaccuracy: 0, loopMode: "stop" });
            } else {
              // Moving Mode: Show settings
              setIsModalOpen(true);
            }
          } else {
            stop();
          }
        }}
        onRecenter={() => {
          if (map) {
            // Priority: 
            // 1. If simulation is ACTIVE, use Spoofed Location (currentLocation).
            // 2. If simulation is STOPPED, use Real Location.
            // 3. Fallback to Legacy Default.
            
            const target = (isActive && currentLocation)
              ? { lat: currentLocation.lat, lng: currentLocation.lng }
              : realLocation
              ? { lat: realLocation.lat, lng: realLocation.lng }
              : DEFAULT_CENTER;
            
            map.panTo(target);
            map.setZoom((isActive || realLocation) ? 15 : DEFAULT_ZOOM);
          }
        }}
        onClear={clearWaypoints}
        onThemeToggle={toggleTheme}
        onRemoveLast={removeLastWaypoint}
      />

      {/* Settings Modal */}
      <RouteSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlay={(settings: { speed: number; inaccuracy: number; loopMode: string }) => {
          start(settings);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;
