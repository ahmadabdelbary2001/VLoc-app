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

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    setOptions({
      key: "", // USER: Put your Google Maps API Key here
      v: "weekly",
      libraries: ["geometry"],
    });

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
