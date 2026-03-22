import { type ClassValue, clsx } from "clsx";
import { Bike, Car, Footprints } from "lucide-react";
import { FaMotorcycle, FaBicycle, FaWalking, FaRunning, FaRoute } from 'react-icons/fa';
import { MdElectricBike, MdDirectionsRun, MdSpeed } from 'react-icons/md';
import { twMerge } from "tailwind-merge";
import { Button } from "../atoms/Button";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type TransportMode = "foot" | "bike" | "drive";
export type GaitMode = "walk" | "jog" | "run" | "marathon" | "sprint";
export type BikeType = "bicycle" | "ebike" | "motorcycle";

interface SpeedPresetSelectorProps {
	transportMode: TransportMode;
	speed: number;
	bikeType: BikeType;
	onTransportModeChange: (mode: TransportMode) => void;
	onSpeedSet: (speed: number) => void;
	onBikeTypeChange: (type: BikeType) => void;
	className?: string;
}

const GAIT_CONFIG = [
	{ id: "walk", icon: FaWalking, range: [0, 1.7], center: 0.85 },
	{ id: "jog", icon: FaRunning, range: [1.7, 2.8], center: 2.25 },
	{ id: "run", icon: MdDirectionsRun, range: [2.8, 6.0], center: 4.4 },
	{ id: "marathon", icon: FaRoute, range: [6.0, 10.0], center: 8.0 },
	{ id: "sprint", icon: MdSpeed, range: [10.0, 12.0], center: 11.0 },
] as const;

const BIKE_CONFIG = [
	{ id: "bicycle", icon: FaBicycle, maxSpeed: 25, center: 12.5, label: "Bicycle" },
	{ id: "ebike", icon: MdElectricBike, maxSpeed: 32, center: 16.0, label: "E-Bike" },
	{ id: "motorcycle", icon: FaMotorcycle, maxSpeed: 40, center: 20.0, label: "Motorcycle" },
] as const;

/**
 * Hierarchical Speed Preset Selector.
 * 
 * **Tier 1**: Transport Mode (Foot, Bike, Drive)
 * **Tier 2**: Dynamic Gaits (Foot) or Vehicle Types (Bike).
 */
export const SpeedPresetSelector = ({
	transportMode,
	speed,
	bikeType,
	onTransportModeChange,
	onSpeedSet,
	onBikeTypeChange,
	className,
}: SpeedPresetSelectorProps) => {

	const mainPresets = [
		{ id: "foot", icon: Footprints, label: "On Foot" },
		{ id: "bike", icon: Bike, label: "Riding" },
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
						// Identify current gait based on speed range
						const isActive = (speed >= gait.range[0] && speed < gait.range[1]) || (gait.id === "sprint" && speed >= 12);
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

			{/* Tier 2: Bike Types (Only shown if transportMode is 'bike') */}
			{transportMode === "bike" && (
				<div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-300">
					{BIKE_CONFIG.map((bike) => {
						const Icon = bike.icon;
						const isActive = bikeType === bike.id;
						return (
							<Button
								key={bike.id}
								variant={isActive ? "secondary" : "glass"}
								onClick={() => {
									onBikeTypeChange(bike.id as BikeType);
									if (speed > bike.maxSpeed) onSpeedSet(bike.maxSpeed);
									else onSpeedSet(bike.center);
								}}
								className={cn(
									"flex flex-col items-center gap-1.5 h-auto py-3 rounded-xl transition-all duration-300",
									!isActive && "bg-muted/30 border-transparent opacity-70 hover:opacity-100",
								)}
							>
								<Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
								<span className="text-[8px] font-black uppercase tracking-tight">
									{bike.label}
								</span>
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
};
