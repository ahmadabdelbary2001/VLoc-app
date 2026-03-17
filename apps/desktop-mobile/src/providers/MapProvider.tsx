import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface MapContextType {
  map: google.maps.Map | null;
  isLoaded: boolean;
  loadError: Error | null;
  theme: "dark" | "light";
  setMap: (map: google.maps.Map | null) => void;
  toggleTheme: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Global initialization to ensure it's only called once
if (GOOGLE_MAPS_API_KEY) {
  setOptions({
    key: GOOGLE_MAPS_API_KEY,
    v: "weekly",
    libraries: ["geometry"],
  });
}

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Sync theme with document classList for Tailwind's "class" dark mode
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setLoadError(new Error("VITE_GOOGLE_MAPS_API_KEY is missing in .env"));
      return;
    }

    // Modern way to load Google Maps libraries
    Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ])
      .then(() => setIsLoaded(true))
      .catch((e: Error) => setLoadError(e));
  }, []);

  return (
    <MapContext.Provider value={{ map, isLoaded, loadError, theme, setMap, toggleTheme }}>
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
