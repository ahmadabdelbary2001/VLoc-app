import { type ClassValue, clsx } from "clsx";
import {
	Crosshair,
	Layers,
	Pause,
	Play as PlayIcon,
	Trash2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "../atoms/Button";
import vlocLogo from "../assets/vloc-logo.png";

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
						variant={isPlaying ? "danger" : "success"}
						size="lg"
						onClick={onPlayToggle}
						className={cn(
							"rounded-full w-24 h-24 border-4 border-white dark:border-white/20 transition-all duration-500",
							isPlaying 
								? "animate-pulse shadow-[0_0_50px_-5px_rgba(239,68,68,0.7)]" 
								: "hover:scale-110 shadow-[0_0_50px_-5px_rgba(110,207,170,0.8)]",
						)}
						title={isPlaying ? "Stop Simulation" : "Start Simulation"}
					>
						{isPlaying ? (
							<Pause className="w-10 h-10 fill-current" />
						) : (
							<PlayIcon className="w-10 h-10 fill-current translate-x-1" />
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

			{/* Top Center: VLoc Brand Header */}
			<div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/70 dark:bg-black/50 backdrop-blur-md border border-[#6ECFAA]/25 rounded-full flex items-center gap-2.5 shadow-lg">
				<img src={vlocLogo} alt="VLoc" className="h-6 w-auto object-contain" />
				<span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2F6856] dark:text-[#6ECFAA]">
					{isMovingMode ? "Route Planner" : "Direct Teleport"}
				</span>
			</div>
		</div>
	);
};
