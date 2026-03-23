import React, { createContext, useContext, useState, useCallback } from "react";
import { useEngine } from "../hooks/useEngine";
import { Coordinates } from "@vloc/api-bindings";
import { getRoadRoute } from "../hooks/useRouting";

interface SimulationContextType {
  isActive: boolean;
  currentLocation: Coordinates | null;
  realLocation: Coordinates | null;
  waypoints: Array<{ lat: number; lng: number }>;
  transportMode: "foot" | "bike" | "drive";
  speed: number;
  addWaypoint: (lat: number, lng: number) => void;
  clearWaypoints: () => void;
  removeLastWaypoint: () => void;
  start: (settings: any) => Promise<void>;
  stop: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [realLocation, setRealLocation] = useState<Coordinates | null>(null);
  const [waypoints, setWaypoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [transportMode, setTransportMode] = useState<"foot" | "bike" | "drive">("foot");
  const [speed, setSpeed] = useState<number>(1.4);
  const engine = useEngine();

  // 1. Polling loop to sync with the Rust engine (Spoofed Location)
  React.useEffect(() => {
    const poll = async () => {
      try {
        const state = await engine.getCurrentState();
        setIsActive(state.is_active);
        setCurrentLocation(state.current_location);
      } catch (e) {
        console.error("Failed to poll engine state:", e);
      }
    };

    const interval = setInterval(poll, 500);
    return () => clearInterval(interval);
  }, [engine]);

  // 2. Real-time Device Geolocation (Real Location)
  React.useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setRealLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            altitude: pos.coords.altitude,
          });
        },
        (err) => console.warn("Geolocation denied/unavailable:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

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
    
    const mode = settings.transportMode || "foot";

    // FETCH FULL REAL-ROAD GEOMETRY FOR THE CHOSEN TRANSPORT MODE
    // We do this right before starting the engine so we get the exact 
    // real-road path (e.g., walking paths vs driving streets) for the simulation.
    const routeGeom = await getRoadRoute(waypoints, mode);
    
    // If we successfully fetched a road geometry, use its hundreds of coordinate points.
    // Otherwise (or if only 1 waypoint), fall back to the straight-line user waypoints.
    const finalPoints = routeGeom && routeGeom.coordinates.length > 0
      ? routeGeom.coordinates.map((coord: [number, number]) => ({ lat: coord[1], lng: coord[0], altitude: null }))
      : waypoints.map(w => ({ lat: w.lat, lng: w.lng, altitude: null }));

    // Construct the Route object expected by Rust
    const route = {
      waypoints: finalPoints,
      end_behavior: settings.loopMode || "stop",
    };

    try {
      await engine.startSimulation(route, settings.speed, settings.inaccuracy || 0);
      setTransportMode(mode);
      setSpeed(settings.speed);
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
        currentLocation,
        realLocation,
        waypoints, 
        transportMode,
        speed,
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
