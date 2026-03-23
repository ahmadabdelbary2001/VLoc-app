import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { MapStyleId } from "@vloc/ui";

interface MapContextType {
  map: MapRef | null;
  isLoaded: boolean;
  loadError: Error | null;
  theme: "dark" | "light";
  mapStyleId: MapStyleId;
  setMap: (map: MapRef | null) => void;
  toggleTheme: () => void;
  setMapStyleId: (id: MapStyleId) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const VITE_MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || "demo";

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMap] = useState<MapRef | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>("dataviz-dark");
  const isLoaded = true;
  const loadError = null;

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      // Sync map style to match the new theme when on a basic style.
      setMapStyleId((current: MapStyleId) =>
        current === "dataviz-dark" || current === "dataviz-light"
          ? next === "dark" ? "dataviz-dark" : "dataviz-light"
          : current
      );
      return next;
    });
  }, []);

  // Sync theme with document classList for Tailwind's "class" dark mode.
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (VITE_MAPTILER_API_KEY === "demo") {
      console.warn("VITE_MAPTILER_API_KEY is missing. Falling back to demo mode.");
    }
  }, []);

  return (
    <MapContext.Provider value={{ map, isLoaded, loadError, theme, mapStyleId, setMap, toggleTheme, setMapStyleId }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};
