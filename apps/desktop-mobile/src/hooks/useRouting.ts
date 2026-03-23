import { useState, useEffect, useRef } from "react";
import { VITE_MAPTILER_API_KEY } from "../providers/MapProvider";

type LatLng = { lat: number; lng: number };
type TransportMode = "foot" | "bike" | "drive";

export interface RouteGeometry {
  /** Ordered [lng, lat] pairs forming the snapped road path. */
  coordinates: [number, number][];
  /** Approx total distance in metres. */
  distanceMeters: number;
}

// ─── MapTiler Directions profiles ────────────────────────────────────────────
const MAPTILER_PROFILE: Record<TransportMode, string> = {
  foot:  "walking",
  bike:  "cycling",
  drive: "driving",
};

// ─── OSRM profiles ───────────────────────────────────────────────────────────
// OSRM demo servers: each transport mode is a separate service.
// All are free, open, and use real OpenStreetMap road/path data.
const OSRM_BASE: Record<TransportMode, string> = {
  drive: "https://router.project-osrm.org/route/v1/driving",
  bike:  "https://router.project-osrm.org/route/v1/driving",  // cycling uses OSRM driving as best free option
  foot:  "https://routing.openstreetmap.de/routed-foot/route/v1/foot",
};

function buildCoordString(wps: LatLng[]): string {
  return wps.map((w) => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join(";");
}

async function fetchMaptilerRoute(
  waypoints: LatLng[],
  mode: TransportMode,
  signal: AbortSignal,
): Promise<RouteGeometry | null> {
  const profile = MAPTILER_PROFILE[mode];
  const coords  = buildCoordString(waypoints);
  const url = `https://api.maptiler.com/directions/v2/${profile}/${coords}` +
              `?key=${VITE_MAPTILER_API_KEY}&geometries=geojson`;

  const res  = await fetch(url, { signal });
  if (!res.ok) return null;           // 402/403 = not on paid plan, silently bail

  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route?.geometry?.coordinates?.length) return null;

  return {
    coordinates:   route.geometry.coordinates,
    distanceMeters: route.distance ?? 0,
  };
}

async function fetchOsrmRoute(
  waypoints: LatLng[],
  mode: TransportMode,
  signal: AbortSignal,
): Promise<RouteGeometry | null> {
  const base   = OSRM_BASE[mode];
  const coords = buildCoordString(waypoints);
  const url    = `${base}/${coords}?geometries=geojson&overview=full`;

  const res  = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);

  const data  = await res.json();
  const route = data?.routes?.[0];
  if (!route?.geometry?.coordinates?.length) return null;

  return {
    coordinates:   route.geometry.coordinates,
    distanceMeters: route.distance ?? 0,
  };
}

export async function getRoadRoute(
  waypoints: LatLng[],
  mode: TransportMode,
  signal?: AbortSignal,
): Promise<RouteGeometry | null> {
  if (waypoints.length < 2) return null;

  try {
    let result: RouteGeometry | null = null;
    const dummyController = new AbortController();
    const activeSignal = signal || dummyController.signal;

    // 1. MapTiler (premium — silently skip if plan doesn't include it)
    if (VITE_MAPTILER_API_KEY !== "demo") {
      result = await fetchMaptilerRoute(waypoints, mode, activeSignal).catch(() => null);
    }

    // 2. OSRM fallback — always works and always follows real roads
    if (!result) {
      result = await fetchOsrmRoute(waypoints, mode, activeSignal);
    }

    return result;
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== "AbortError") {
      console.error("[getRoadRoute] Failed to fetch road route:", err);
    }
    return null;
  }
}

/**
 * Hook to reactively fetch a real road-network route between waypoints.
 */
export function useRouting(
  waypoints: LatLng[],
  mode: TransportMode,
): RouteGeometry | null {
  const [geometry, setGeometry] = useState<RouteGeometry | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (waypoints.length < 2) {
      setGeometry(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    getRoadRoute(waypoints, mode, controller.signal).then((res) => {
      // Avoid setting state if aborted
      if (!controller.signal.aborted) {
        setGeometry(res);
      }
    });

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints.map((w) => `${w.lat},${w.lng}`).join("|"), mode]);

  return geometry;
}
