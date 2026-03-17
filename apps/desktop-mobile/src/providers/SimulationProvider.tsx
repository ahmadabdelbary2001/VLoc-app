import React, { createContext, useContext, useState, useCallback } from "react";
import { useEngine } from "../hooks/useEngine";

interface SimulationContextType {
  isActive: boolean;
  waypoints: Array<{ lat: number; lng: number }>;
  addWaypoint: (lat: number, lng: number) => void;
  clearWaypoints: () => void;
  removeLastWaypoint: () => void;
  start: (settings: any) => Promise<void>;
  stop: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [waypoints, setWaypoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const engine = useEngine();

  const addWaypoint = useCallback((lat: number, lng: number) => {
    setWaypoints((prev) => [...prev, { lat, lng }]);
  }, []);

  const clearWaypoints = useCallback(() => {
    setWaypoints([]);
  }, []);

  const removeLastWaypoint = useCallback(() => {
    setWaypoints((prev) => prev.slice(0, -1));
  }, []);

  const start = useCallback(async (settings: any) => {
    if (waypoints.length < 1) return;
    
    // Construct the Route object expected by Rust
    const route = {
      waypoints: waypoints.map(w => ({ lat: w.lat, lng: w.lng, altitude: null })),
      is_loop: settings.loopMode !== "None",
    };

    try {
      await engine.startSimulation(route, settings.speed);
      setIsActive(true);
    } catch (e) {
      console.error("Simulation start failed:", e);
    }
  }, [waypoints, engine]);

  const stop = useCallback(async () => {
    try {
      await engine.stopSimulation();
      setIsActive(false);
    } catch (e) {
      console.error("Simulation stop failed:", e);
    }
  }, [engine]);

  return (
    <SimulationContext.Provider 
      value={{ 
        isActive, 
        waypoints, 
        addWaypoint, 
        clearWaypoints, 
        removeLastWaypoint,
        start,
        stop 
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
