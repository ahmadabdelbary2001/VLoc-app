import { clsx } from "clsx";

// --- Types ---

export type MapStyleId =
  | "dataviz-dark"
  | "dataviz-light"
  | "satellite"
  | "hybrid"
  | "outdoor-v2"
  | "streets-v2";

export interface MapStyleOption {
  id: MapStyleId;
  label: string;
  requiresKey?: boolean;
  cartoFallback?: "dark" | "light";
}

/**
 * All available MapTiler map styles, in display order.
 * Each entry contains an SVG-based preview icon since we don't want
 * to make live tile requests just for thumbnails.
 */
export const MAP_STYLES: MapStyleOption[] = [
  { id: "dataviz-dark",  label: "Dark",      cartoFallback: "dark",  requiresKey: false },
  { id: "dataviz-light", label: "Light",     cartoFallback: "light", requiresKey: false },
  { id: "streets-v2",    label: "Streets",   requiresKey: true },
  { id: "outdoor-v2",    label: "Outdoor",   requiresKey: true },
  { id: "satellite",     label: "Satellite", requiresKey: true },
  { id: "hybrid",        label: "Hybrid",    requiresKey: true },
];

/** Hardcoded preview colours for each style so no network request is needed. */
const STYLE_COLORS: Record<MapStyleId, { bg: string; road: string; water: string }> = {
  "dataviz-dark":  { bg: "#1c2333", road: "#3a4760", water: "#1a2a40" },
  "dataviz-light": { bg: "#e8edf4", road: "#c5cdd9", water: "#a9c4d3" },
  "streets-v2":    { bg: "#f4f1ec", road: "#d3c9bd", water: "#aad3df" },
  "outdoor-v2":    { bg: "#cde8c8", road: "#d0c5b7", water: "#9dc9de" },
  "satellite":     { bg: "#2e3f31", road: "#3d4f40", water: "#1b3a54" },
  "hybrid":        { bg: "#2e3f31", road: "#e8d46e", water: "#1b3a54" },
};

interface MapStyleCardProps {
  style: MapStyleOption;
  isActive: boolean;
  isAvailable: boolean;
  onClick: () => void;
}

const MapStyleCard = ({ style, isActive, isAvailable, onClick }: MapStyleCardProps) => {
  const colors = STYLE_COLORS[style.id];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      title={!isAvailable ? "Requires MapTiler API key" : style.label}
      className={clsx(
        "relative flex flex-col items-center gap-1.5 p-0 rounded-xl border-2 transition-all duration-200 focus:outline-none group",
        isActive
          ? "border-[#6ECFAA] shadow-[0_0_12px_rgba(110,207,170,0.5)]"
          : "border-transparent hover:border-[#6ECFAA]/40",
        !isAvailable && "opacity-40 cursor-not-allowed",
      )}
    >
      {/* Mini-map SVG preview */}
      <div
        className="w-14 h-10 rounded-lg overflow-hidden ring-1 ring-white/10"
        style={{ backgroundColor: colors.bg }}
      >
        <svg viewBox="0 0 56 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Water */}
          <rect x="0" y="24" width="56" height="16" fill={colors.water} opacity="0.7" />
          {/* Roads */}
          <rect x="18" y="0" width="4" height="40" rx="2" fill={colors.road} />
          <rect x="0" y="16" width="56" height="3" rx="1.5" fill={colors.road} />
          {/* Active ping dot */}
          {isActive && (
            <circle cx="20" cy="17.5" r="3" fill="#6ECFAA" opacity="0.9" />
          )}
        </svg>
      </div>

      {/* Label */}
      <span
        className={clsx(
          "text-[10px] font-semibold leading-none",
          isActive ? "text-[#6ECFAA]" : "text-foreground/70 group-hover:text-foreground/90",
        )}
      >
        {style.label}
      </span>
    </button>
  );
};

interface MapStyleSelectorProps {
  currentStyleId: MapStyleId;
  hasApiKey: boolean;
  onStyleChange: (id: MapStyleId) => void;
}

/**
 * Horizontal scrollable row of map-style preview cards.
 *
 * **Why**: Lets users switch between Satellite, Hybrid, Outdoor etc. without
 * hiding the map. Placed in the overlay so it floats above the canvas.
 */
export const MapStyleSelector = ({
  currentStyleId,
  hasApiKey,
  onStyleChange,
}: MapStyleSelectorProps) => {
  return (
    <div
      className={clsx(
        "flex gap-2 px-3 py-2.5 rounded-2xl",
        "bg-white/60 dark:bg-black/50 backdrop-blur-md",
        "border border-white/20 dark:border-white/10 shadow-xl",
      )}
    >
      {MAP_STYLES.map((style) => {
        const isAvailable = !style.requiresKey || hasApiKey;
        return (
          <MapStyleCard
            key={style.id}
            style={style}
            isActive={currentStyleId === style.id}
            isAvailable={isAvailable}
            onClick={() => isAvailable && onStyleChange(style.id)}
          />
        );
      })}
    </div>
  );
};
