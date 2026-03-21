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
	initialSpeed = 2.25,
}: RouteSettingsModalProps) => {
	const [speed, setSpeed] = useState(initialSpeed);
	const [inaccuracy, setInaccuracy] = useState(0);
	const [loopMode, setLoopMode] = useState("stop");
	const [transportMode, setTransportMode] = useState<
		"foot" | "bike" | "drive"
	>("foot");

	if (!isOpen) return null;

	const handleTransportModeChange = (
		mode: "foot" | "bike" | "drive",
	) => {
		setTransportMode(mode);
		if (mode === "foot") setSpeed(2.25); // Jog center
		if (mode === "bike") setSpeed(15.0);
		if (mode === "drive") setSpeed(30.0);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-lg bg-background rounded-3xl overflow-hidden shadow-2xl border border-border/50 animate-in fade-in zoom-in duration-300">
				{/* Header */}
				<div className="p-6 bg-muted/40 border-b border-border/50 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-xl">
							<Settings2 className="w-5 h-5 text-primary" />
						</div>
						<Typography
							variant="h3"
							className="m-0 text-xl font-bold tracking-tight text-foreground/90"
						>
							Simulation Settings
						</Typography>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full hover:bg-muted/80 transition-colors"
					>
						<X className="w-5 h-5 text-muted-foreground" />
					</Button>
				</div>

				{/* Content */}
				<div className="p-8 space-y-10">
					{/* Speed Section */}
					<div className="space-y-6">
						<SpeedPresetSelector
							transportMode={transportMode}
							speed={speed}
							onTransportModeChange={handleTransportModeChange}
							onSpeedSet={setSpeed}
						/>
						<Slider
							label="Simulation Speed"
							valueDisplay={`${speed.toFixed(1)} m/s`}
							min={0.1}
							max={transportMode === "foot" ? 12 : 120}
							step={0.1}
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
						className="opacity-90"
					/>

					{/* Loop Mode Section */}
					<div className="space-y-4">
						<Typography
							variant="small"
							className="text-muted-foreground font-bold uppercase tracking-[0.15em] text-[10px]"
						>
							End of Route Behavior
						</Typography>
						<div className="grid grid-cols-3 gap-3">
							{["stop", "reverse", "restart"].map((mode) => (
								<Button
									key={mode}
									variant={loopMode === mode ? "primary" : "glass"}
									size="sm"
									onClick={() => setLoopMode(mode)}
									className={cn(
										"text-[10px] uppercase font-black tracking-widest transition-all h-12 rounded-xl",
										loopMode === mode
											? "shadow-lg shadow-primary/20"
											: "bg-muted/30 border-transparent opacity-70 hover:opacity-100",
									)}
								>
									{mode}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 bg-muted/80 backdrop-blur-xl border-t border-border/50 flex gap-4">
					<Button
						variant="glass"
						className="flex-1 text-muted-foreground font-bold hover:bg-background/50"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
					variant="success"
					className="flex-1 gap-2 shadow-2xl shadow-[#6ECFAA]/50 border-2 border-white/20 hover:scale-[1.02] active:scale-95 transition-all opacity-100"
					onClick={() => onPlay({ speed, inaccuracy, loopMode })}
				>
					<Play className="w-4 h-4 fill-current" />
					<span className="font-bold tracking-tight">Launch Simulation</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
