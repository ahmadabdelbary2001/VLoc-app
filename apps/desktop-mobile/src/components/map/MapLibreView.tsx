import React, { useMemo, useEffect, useState } from "react";
import Map, { Source, Layer, Marker, MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMap, VITE_MAPTILER_API_KEY } from "../../providers/MapProvider";
import { useSimulation } from "../../providers/SimulationProvider";
import { FaWalking, FaRunning, FaBicycle } from "react-icons/fa";
import { IoCarSport } from "react-icons/io5";
import { MapStyleSelector } from "@vloc/ui";
import type { MapStyleId } from "@vloc/ui";

interface MapLibreViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
}

// Resolve a MapTiler style URL (or CARTO fallback) from a style ID.
function resolveStyleUrl(styleId: MapStyleId, apiKey: string): string {
  const hasKey = apiKey !== "demo";

  // CARTO free fallback for styles that don't require a key.
  if (!hasKey) {
    return styleId === "dataviz-light"
      ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
  }

  // Direct MapTiler style URLs.
  const MAPTILER_STYLES: Record<MapStyleId, string> = {
    "dataviz-dark":  `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${apiKey}`,
    "dataviz-light": `https://api.maptiler.com/maps/dataviz-light/style.json?key=${apiKey}`,
    "streets-v2":    `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
    "outdoor-v2":    `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${apiKey}`,
    "satellite":     `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
    "hybrid":        `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`,
  };

  return MAPTILER_STYLES[styleId];
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({
  center = { lat: 35.0, lng: 39.0 },
  zoom = 6.2,
  onMapClick,
}) => {
  const { theme, setMap, map, mapStyleId, setMapStyleId } = useMap();
  const { waypoints, currentLocation, realLocation, isActive, transportMode, speed } = useSimulation();

  // Show/hide the style selector panel via a small toggle button.
  const [selectorOpen, setSelectorOpen] = useState(false);

  const mapStyleUrl = useMemo(
    () => resolveStyleUrl(mapStyleId, VITE_MAPTILER_API_KEY),
    [mapStyleId]
  );

  // Hardware-accelerated Vector route.
  const routeGeoJSON = useMemo(() => {
    if (waypoints.length < 2) return null;
    return {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: waypoints.map((w) => [w.lng, w.lat]),
        },
      }],
    };
  }, [waypoints]);

  const loc = (isActive && currentLocation) ? currentLocation : realLocation;
  const isSpoofed = isActive && !!currentLocation;
  const isMoving = waypoints.length > 1;

  // Dynamic Camera Pitching Feature (Navigator Mode).
  useEffect(() => {
    if (map && isSpoofed && isMoving) {
      map.easeTo({ pitch: transportMode === 'drive' ? 65 : 45, duration: 1000 });
    } else if (map && (!isSpoofed || !isMoving)) {
      map.easeTo({ pitch: 0, duration: 1000 });
    }
  }, [isSpoofed, isMoving, map, transportMode]);

  const hasApiKey = VITE_MAPTILER_API_KEY !== "demo";

  return (
    <>
      <Map
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: zoom,
          pitch: 0,
        }}
        mapStyle={mapStyleUrl}
        style={{ width: "100%", height: "100%" }}
        ref={(ref: MapRef | null) => setMap(ref)}
        onClick={(e: MapLayerMouseEvent) => {
          if (onMapClick) onMapClick(e.lngLat.lat, e.lngLat.lng);
        }}
        interactiveLayerIds={[]}
        dragRotate={true}
        dragPan={true}
      >
        {/* 3D Buildings Layer for Immersive WebGL Mapping (Requires MapTiler Key) */}
        {hasApiKey && (
          <Source id="openmaptiles" type="vector" url={`https://api.maptiler.com/tiles/v3/tiles.json?key=${VITE_MAPTILER_API_KEY}`}>
            <Layer
              id="3d-buildings"
              source="openmaptiles"
              source-layer="building"
              filter={["==", "extrude", "true"]}
              type="fill-extrusion"
              minzoom={15}
              paint={{
                "fill-extrusion-color": theme === "dark" ? "#242f3e" : "#e2e8f0",
                "fill-extrusion-height": ["get", "render_height"],
                "fill-extrusion-base": ["get", "render_min_height"],
                "fill-extrusion-opacity": 0.6,
              }}
            />
          </Source>
        )}

        {/* Route Rendered on Top */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON as any}>
            <Layer
              id="route-layer"
              type="line"
              paint={{
                "line-color": "#3b82f6",
                "line-width": 5,
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}

        {/* Target Waypoint Markers */}
        {waypoints.map((wp, i) => (
          <Marker key={i} longitude={wp.lng} latitude={wp.lat} anchor="bottom">
            <div className="flex flex-col items-center justify-center translate-y-[2px]">
              <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                {i + 1}
              </div>
              <div className="w-1 h-2 bg-blue-500 rounded-b"></div>
            </div>
          </Marker>
        ))}

        {/* Active User Target Marker */}
        {loc && (
          <Marker longitude={loc.lng} latitude={loc.lat} anchor="center" style={{ zIndex: 1000 }} rotationAlignment="map" pitchAlignment="map">
            {isSpoofed ? (
               isMoving ? (
                  <div
                    className="relative w-10 h-10 flex items-center justify-center rounded-full border-[2.5px] border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300"
                    style={{ backgroundColor: transportMode === 'drive' ? '#f43f5e' : transportMode === 'bike' ? '#10b981' : '#3b82f6' }}
                  >
                    {transportMode === 'drive' && <IoCarSport size={22} color="white" />}
                    {transportMode === 'bike' && <FaBicycle size={22} color="white" />}
                    {transportMode === 'foot' && (speed >= 2.8 ? <FaRunning size={22} color="white" /> : <FaWalking size={22} color="white" />)}
                  </div>
               ) : (
                  <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-[0_0_10px_rgba(34,197,94,0.7)]"></div>
               )
             ) : (
               <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.7)] animate-pulse"></div>
             )}
          </Marker>
        )}
      </Map>

      {/* Floating Map Style Selector — positioned bottom-right above the attribution */}
      <div className="absolute bottom-8 right-4 flex flex-col items-end gap-2 z-10">
        {/* Toggle button */}
        <button
          type="button"
          aria-label="Toggle map style selector"
          onClick={() => setSelectorOpen((v) => !v)}
          className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-foreground" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-10.498l4.875 2.437c.381.19.622.58.622.998v8.25a1.125 1.125 0 01-1.496 1.066L13 21m0-13.5L9 9m4.5-1.5L7.128 4.815A1.125 1.125 0 006 5.877v8.25m0 0l-3.129 1.562A1.125 1.125 0 001.5 16.716V8.467c0-.418.241-.808.622-.997L6 5.877" />
          </svg>
        </button>

        {/* Selector panel */}
        {selectorOpen && (
          <MapStyleSelector
            currentStyleId={mapStyleId}
            hasApiKey={hasApiKey}
            onStyleChange={(id) => {
              setMapStyleId(id);
              setSelectorOpen(false);
            }}
          />
        )}
      </div>
    </>
  );
};
