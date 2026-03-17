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
  center = { lat: 35.0, lng: 39.0 },
  zoom = 6.2,
  className,
  onMapClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError, setMap, map, theme } = useMap();
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const { waypoints, currentLocation, realLocation } = useSimulation();

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

  // Update User Location Marker (Real or Spoofed)
  useEffect(() => {
    const loc = currentLocation || realLocation;
    
    if (!map || !loc) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      return;
    }

    const position = { lat: loc.lat, lng: loc.lng };
    const isSpoofed = !!currentLocation;
    const isMoving = waypoints.length > 1;

    // Standard "Teardrop" Pin SVG Path
    const pinPath = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

    // Define Dynamic Icons
    const getIcon = () => {
      if (!isSpoofed) {
        // Real Location: Standard Blue Pulse Dot
        return {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white",
        };
      }
      
      if (isMoving) {
        // Moving Spoof: Blue Arrow (Directional)
        return {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white",
        };
      } else {
        // Static Spoof: Standard Green Pin
        return {
          path: pinPath,
          anchor: new google.maps.Point(12, 22),
          fillColor: "#22c55e", 
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: "white",
          scale: 1.5,
        };
      }
    };

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position,
        map,
        title: isSpoofed ? (isMoving ? "Moving Spoof" : "Static Spoof") : "Real Location",
        icon: getIcon(),
        zIndex: 1000,
      });
    } else {
      userMarkerRef.current.setPosition(position);
      userMarkerRef.current.setTitle(isSpoofed ? (isMoving ? "Moving Spoof" : "Static Spoof") : "Real Location");
      userMarkerRef.current.setIcon(getIcon());
    }
  }, [currentLocation, realLocation, waypoints.length, map]);

  // Update Waypoint Markers & Polyline when waypoints change
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
          fontSize: "11px",
          fontWeight: "bold",
        },
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
          anchor: new google.maps.Point(12, 22),
          fillColor: "#3b82f6",
          fillOpacity: 0.9,
          strokeWeight: 1,
          strokeColor: "white",
          scale: 1.2,
          labelOrigin: new google.maps.Point(12, 9),
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
