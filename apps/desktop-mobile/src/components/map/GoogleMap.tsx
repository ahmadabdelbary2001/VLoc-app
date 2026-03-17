import React, { useEffect, useRef } from "react";
import { useMap } from "../../providers/MapProvider";
import { useSimulation } from "../../providers/SimulationProvider";

interface GoogleMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

// Modern Dark Mode styling for Google Maps
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

export const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 33.5138, lng: 36.2765 },
  zoom = 15,
  className,
  onMapClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError, setMap, map, theme } = useMap();
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const { waypoints } = useSimulation();

  // Initialize Map
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const gMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: theme === "dark" ? darkMapStyle : [],
        disableDefaultUI: true,
        clickableIcons: false,
      });
// ... (rest of initialize effect)
      if (onMapClick) {
        gMap.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });
      }

      setMap(gMap);
    }
  }, [isLoaded, onMapClick, map, setMap, theme, center, zoom]);

  // Handle Theme changes on existing map
  useEffect(() => {
    if (map) {
      map.setOptions({ styles: theme === "dark" ? darkMapStyle : [] });
    }
  }, [theme, map]);

  // Update Markers & Polyline when waypoints change
  useEffect(() => {
    if (!map) return;

    // Clear old markers
    for (const marker of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];

    // Add new markers
    for (const [index, wp] of waypoints.entries()) {
      const marker = new google.maps.Marker({
        position: wp,
        map,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#3b82f6", // tailwind blue-500
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white",
          scale: 10,
        },
      });
      markersRef.current.push(marker);
    }

    // Update Polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    if (waypoints.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: waypoints,
        geodesic: true,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });
    }
  }, [waypoints, map]);

  if (loadError) return <div className="text-red-500 p-4 font-mono text-xs">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="animate-pulse bg-zinc-900 w-full h-full flex items-center justify-center text-white/20 uppercase tracking-[0.3em] text-xs">Loading Satellite Engine...</div>;

  return (
    <div 
      ref={mapRef} 
      className={className} 
      style={{ width: "100%", height: "100%" }} 
    />
  );
};
