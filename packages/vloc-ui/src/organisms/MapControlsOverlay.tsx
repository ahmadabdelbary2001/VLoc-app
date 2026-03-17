import { type ClassValue, clsx } from "clsx";
import {
	Crosshair,
	Layers,
	Map as MapIcon,
	Pause,
	Play as PlayIcon,
	Trash2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "../atoms/Button";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface MapControlsOverlayProps {
	isPlaying: boolean;
	isMovingMode: boolean;
	hasSelection: boolean;
	onPlayToggle: () => void;
	onRecenter: () => void;
	onClear: () => void;
	onThemeToggle: () => void;
	onRemoveLast?: () => void;
	className?: string;
}

/**
 * Map Controls Overlay Organism.
 *
 * **Why**: Manages all floating interactions around the map view. Ported
 * from the multiple UI containers in `google_maps_widget.dart`.
 * **How**: Uses absolute positioning and glass tiles to create a premium
 * mobile-first interface within the desktop shell.
 */
export const MapControlsOverlay = ({
	isPlaying,
	isMovingMode,
	hasSelection,
	onPlayToggle,
	onRecenter,
	onClear,
	onThemeToggle,
	onRemoveLast,
	className,
}: MapControlsOverlayProps) => {
	return (
		<div className={cn("absolute inset-0 pointer-events-none p-6", className)}>
			{/* Top Right: Theme & Tools */}
			<div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-auto">
				<Button
					variant="glass"
					size="icon"
					onClick={onThemeToggle}
					title="Toggle Map Theme"
				>
					<Layers className="w-5 h-5" />
				</Button>
			</div>

			{/* Top Left: GPS Recenter */}
			<div className="absolute top-6 left-6 pointer-events-auto">
				<Button
					variant="glass"
					size="icon"
					onClick={onRecenter}
					title="Recenter to My Position"
				>
					<Crosshair className="w-5 h-5 text-primary" />
				</Button>
			</div>

			{/* Bottom Center: Main Action & Clear */}
			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
				{/* Undo/Remove Point (if in moving mode) */}
				{isMovingMode && hasSelection && !isPlaying && (
					<Button
						variant="glass"
						size="md"
						onClick={onRemoveLast}
						className="rounded-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
					>
						Undo
					</Button>
				)}

				{/* Play/Stop Button - THE MAIN ACTION */}
				{(hasSelection || isPlaying) && (
					<Button
						variant={isPlaying ? "danger" : "primary"}
						size="lg"
						onClick={onPlayToggle}
						className={cn(
							"rounded-full w-16 h-16 shadow-2xl transition-all duration-500",
							isPlaying ? "animate-pulse" : "hover:scale-110 shadow-primary/40",
						)}
						title={isPlaying ? "Stop Simulation" : "Start Simulation"}
					>
						{isPlaying ? (
							<Pause className="w-8 h-8 fill-current" />
						) : (
							<PlayIcon className="w-8 h-8 fill-current translate-x-0.5" />
						)}
					</Button>
				)}

				{/* Clear All */}
				{hasSelection && !isPlaying && (
					<Button
						variant="glass"
						size="md"
						onClick={onClear}
						className="rounded-full bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
					>
						<Trash2 className="w-5 h-5" />
					</Button>
				)}
			</div>

			{/* Mode Indicator Overlay */}
			<div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
				<MapIcon className="w-4 h-4 text-primary" />
				<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
					{isMovingMode ? "Route Planner" : "Direct Teleport"}
				</span>
			</div>
		</div>
	);
};
