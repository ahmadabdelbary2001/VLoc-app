import { useState } from "react";
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
    waypoints, 
    addWaypoint, 
    clearWaypoints, 
    removeLastWaypoint,
    start,
    stop 
  } = useSimulation();

  const { map, toggleTheme } = useMap();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-zinc-950 overflow-hidden relative">
      {/* Real Map Surface */}
      <div className="absolute inset-0">
        <GoogleMap 
          center={{ lat: 33.5138, lng: 36.2765 }} // Default center (e.g., Damascus)
          zoom={15}
          onMapClick={(lat, lng) => !isActive && addWaypoint(lat, lng)}
        />
      </div>

      {/* UI Overlay */}
      <MapControlsOverlay
        isPlaying={isActive}
        isMovingMode={true}
        hasSelection={waypoints.length > 0}
        onPlayToggle={() => {
          if (!isActive) {
            setIsModalOpen(true);
          } else {
            stop();
          }
        }}
        onRecenter={() => {
          if (map) {
            map.panTo({ lat: 33.5138, lng: 36.2765 });
            map.setZoom(15);
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
