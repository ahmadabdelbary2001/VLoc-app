import { type ClassValue, clsx } from "clsx";
import { Bike, Car, Footprints, Activity, Wind, Zap, Gauge } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "../atoms/Button";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type TransportMode = "foot" | "bike" | "drive";
export type GaitMode = "walk" | "jog" | "run" | "marathon" | "sprint";

interface SpeedPresetSelectorProps {
	transportMode: TransportMode;
	speed: number;
	onTransportModeChange: (mode: TransportMode) => void;
	onSpeedSet: (speed: number) => void;
	className?: string;
}

const GAIT_CONFIG = [
	{ id: "walk", icon: Footprints, range: [0, 1.7], center: 0.85 },
	{ id: "jog", icon: Activity, range: [1.7, 2.8], center: 2.25 },
	{ id: "run", icon: Wind, range: [2.8, 6.0], center: 4.4 },
	{ id: "marathon", icon: Gauge, range: [6.0, 10.0], center: 8.0 },
	{ id: "sprint", icon: Zap, range: [10.0, 12.0], center: 11.0 },
] as const;

/**
 * Hierarchical Speed Preset Selector.
 * 
 * **Tier 1**: Transport Mode (Foot, Bike, Drive)
 * **Tier 2**: Dynamic Gaits (Only for Foot) synchronized with slider.
 */
export const SpeedPresetSelector = ({
	transportMode,
	speed,
	onTransportModeChange,
	onSpeedSet,
	className,
}: SpeedPresetSelectorProps) => {
	// Identify current gait based on speed range
	const activeGait = GAIT_CONFIG.find(
		(g) => speed >= g.range[0] && speed < g.range[1],
	)?.id || (speed >= 12 ? "sprint" : "walk");

	const mainPresets = [
		{ id: "foot", icon: Footprints, label: "On Foot" },
		{ id: "bike", icon: Bike, label: "Cycling" },
		{ id: "drive", icon: Car, label: "Driving" },
	] as const;

	return (
		<div className={cn("space-y-4", className)}>
			{/* Tier 1: Transport Modes */}
			<div className="flex gap-2 p-1 bg-muted/30 rounded-2xl border border-border/30">
				{mainPresets.map((preset) => {
					const Icon = preset.icon;
					const isActive = transportMode === preset.id;
					return (
						<Button
							key={preset.id}
							variant={isActive ? "primary" : "glass"}
							size="sm"
							onClick={() => onTransportModeChange(preset.id as TransportMode)}
							className={cn(
								"flex-1 gap-2 h-10 rounded-xl transition-all duration-300",
								!isActive && "bg-muted/30 border-transparent opacity-70 hover:opacity-100",
							)}
						>
							<Icon className="w-4 h-4" />
							<span className="text-[10px] font-bold uppercase tracking-wider">
								{preset.label}
							</span>
						</Button>
					);
				})}
			</div>

			{/* Tier 2: Gaits (Only shown if transportMode is 'foot') */}
			{transportMode === "foot" && (
				<div className="grid grid-cols-5 gap-2 animate-in slide-in-from-top-2 duration-300">
					{GAIT_CONFIG.map((gait) => {
						const Icon = gait.icon;
						const isActive = activeGait === gait.id;
						return (
							<Button
								key={gait.id}
								variant={isActive ? "secondary" : "glass"}
								onClick={() => onSpeedSet(gait.center)}
								className={cn(
									"flex flex-col items-center gap-1.5 h-auto py-3 rounded-xl transition-all duration-300",
									!isActive && "bg-muted/30 border-transparent opacity-70 hover:opacity-100",
								)}
							>
								<Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
								<span className="text-[8px] font-black uppercase tracking-tight">
									{gait.id}
								</span>
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
};
