import { type ClassValue, clsx } from "clsx";
import { Play, Settings2, X } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../atoms/Button";
import { Slider } from "../atoms/Slider";
import { Typography } from "../atoms/Typography";
import { SpeedPresetSelector } from "../molecules/SpeedPresetSelector";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface RouteSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onPlay: (settings: {
		speed: number;
		inaccuracy: number;
		loopMode: string;
	}) => void;
	initialSpeed?: number;
}

/**
 * Route Settings Organism.
 *
 * **Why**: Ported directly from `RouteSettingsDialog` in Flutter. This is the
 * primary control center for simulation parameters.
 * **How**: Uses a glassmorphism design with nested atoms/molecules for speed
 * slider, presets, and loop mode selection.
 */
export const RouteSettingsModal = ({
	isOpen,
	onClose,
	onPlay,
	initialSpeed = 15,
}: RouteSettingsModalProps) => {
	const [speed, setSpeed] = useState(initialSpeed);
	const [inaccuracy, setInaccuracy] = useState(0);
	const [loopMode, setLoopMode] = useState("stop");
	const [activePreset, setActivePreset] = useState<"walk" | "bike" | "drive">(
		"bike",
	);

	if (!isOpen) return null;

	const handlePresetChange = (mode: "walk" | "bike" | "drive") => {
		setActivePreset(mode);
		if (mode === "walk") setSpeed(5);
		if (mode === "bike") setSpeed(15);
		if (mode === "drive") setSpeed(60);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
				{/* Header */}
				<div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Settings2 className="w-5 h-5 text-primary" />
						<Typography
							variant="h3"
							className="m-0 text-xl font-bold tracking-tight text-white"
						>
							Simulation Settings
						</Typography>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full hover:bg-white/5"
					>
						<X className="w-5 h-5 text-white/60" />
					</Button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-8">
					{/* Speed Section */}
					<div className="space-y-4">
						<SpeedPresetSelector
							activeMode={activePreset}
							onModeChange={handlePresetChange}
						/>
						<Slider
							label="Simulation Speed"
							valueDisplay={`${speed} km/h`}
							min={1}
							max={120}
							value={speed}
							onChange={(e) => setSpeed(Number(e.target.value))}
						/>
					</div>

					{/* Inaccuracy Section */}
					<Slider
						label="Location Inaccuracy"
						valueDisplay={`${inaccuracy} m`}
						min={0}
						max={50}
						value={inaccuracy}
						onChange={(e) => setInaccuracy(Number(e.target.value))}
						className="opacity-80"
					/>

					{/* Loop Mode Section */}
					<div className="space-y-3">
						<Typography
							variant="small"
							className="text-white/40 uppercase tracking-widest"
						>
							End of Route Behavior
						</Typography>
						<div className="grid grid-cols-3 gap-2">
							{["stop", "reverse", "restart"].map((mode) => (
								<Button
									key={mode}
									variant={loopMode === mode ? "primary" : "glass"}
									size="sm"
									onClick={() => setLoopMode(mode)}
									className={cn(
										"text-[10px] uppercase font-bold tracking-tighter transition-all",
										loopMode === mode
											? ""
											: "bg-white/5 border-transparent opacity-60",
									)}
								>
									{mode}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 bg-white/5 border-t border-white/5 flex gap-4">
					<Button
						variant="ghost"
						className="flex-1 text-white/60"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						className="flex-1 gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95"
						onClick={() => onPlay({ speed, inaccuracy, loopMode })}
					>
						<Play className="w-4 h-4 fill-current" />
						Launch Simulation
					</Button>
				</div>
			</div>
		</div>
	);
};
