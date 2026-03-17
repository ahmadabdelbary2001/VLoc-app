import { useState } from "react";
import { 
  Typography, 
  MapControlsOverlay, 
  RouteSettingsModal 
} from "@vloc/ui";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSelection, setHasSelection] = useState(true);

  return (
    <div className="h-screen w-screen bg-zinc-950 overflow-hidden relative">
      {/* Simulation Surface Dummy */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Typography variant="h1" className="text-white/5 font-black text-9xl uppercase tracking-tighter rotate-12">
          VLOC ENGINE
        </Typography>
      </div>

      {/* UI Overlay */}
      <MapControlsOverlay
        isPlaying={isPlaying}
        isMovingMode={true}
        hasSelection={hasSelection}
        onPlayToggle={() => {
          if (!isPlaying) {
            setIsModalOpen(true);
          } else {
            setIsPlaying(false);
          }
        }}
        onRecenter={() => alert("Recentering...")}
        onClear={() => setHasSelection(false)}
        onThemeToggle={() => alert("Theme Toggled")}
        onRemoveLast={() => console.log("Remove last")}
      />

      {/* Settings Modal */}
      <RouteSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlay={(settings: { speed: number; inaccuracy: number; loopMode: string }) => {
          console.log("Settings applied:", settings);
          setIsModalOpen(false);
          setIsPlaying(true);
        }}
      />
    </div>
  );
}

export default App;
