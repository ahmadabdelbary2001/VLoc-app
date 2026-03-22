import { type ClassValue, clsx } from "clsx";
import { Bike, Car, Footprints } from "lucide-react";
import { FaMotorcycle, FaBicycle, FaWalking, FaRunning, FaRoute, FaCarSide, FaCar, FaFlagCheckered } from 'react-icons/fa';
import { MdElectricBike, MdDirectionsRun, MdSpeed } from 'react-icons/md';
import { IoCarSport } from 'react-icons/io5';
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
	{ id: "walk", icon: FaWalking, range: [0, 1.7], center: 0.85 },
	{ id: "jog", icon: FaRunning, range: [1.7, 2.8], center: 2.25 },
	{ id: "run", icon: MdDirectionsRun, range: [2.8, 6.0], center: 4.4 },
	{ id: "marathon", icon: FaRoute, range: [6.0, 10.0], center: 8.0 },
	{ id: "sprint", icon: MdSpeed, range: [10.0, 12.0], center: 11.0 },
] as const;

const BIKE_CONFIG = [
	{ id: "bicycle", icon: FaBicycle, range: [0, 15], center: 10, label: "Bicycle" },
	{ id: "ebike", icon: MdElectricBike, range: [15, 25], center: 20, label: "E-Bike" },
	{ id: "motorcycle", icon: FaMotorcycle, range: [25, 40], center: 32, label: "Motorcycle" },
] as const;

const DRIVE_CONFIG = [
	{ id: "city", icon: FaCarSide, range: [0, 20], center: 10, label: "City" },
	{ id: "highway", icon: FaCar, range: [20, 40], center: 30, label: "Highway" },
	{ id: "sports", icon: IoCarSport, range: [40, 70], center: 55, label: "Sports" },
	{ id: "racing", icon: FaFlagCheckered, range: [70, 120], center: 90, label: "Racing" },
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
	onTransportModeChange,
	onSpeedSet,
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
						const isActive = (speed >= bike.range[0] && speed < bike.range[1]) || (bike.id === "motorcycle" && speed >= 40);
						return (
							<Button
								key={bike.id}
								variant={isActive ? "secondary" : "glass"}
								onClick={() => onSpeedSet(bike.center)}
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

			{/* Tier 2: Drive Types (Only shown if transportMode is 'drive') */}
			{transportMode === "drive" && (
				<div className="grid grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-300">
					{DRIVE_CONFIG.map((drive) => {
						const Icon = drive.icon;
						const isActive = (speed >= drive.range[0] && speed < drive.range[1]) || (drive.id === "racing" && speed >= 120);
						return (
							<Button
								key={drive.id}
								variant={isActive ? "secondary" : "glass"}
								onClick={() => onSpeedSet(drive.center)}
								className={cn(
									"flex flex-col items-center gap-1.5 h-auto py-3 rounded-xl transition-all duration-300",
									!isActive && "bg-muted/30 border-transparent opacity-70 hover:opacity-100",
								)}
							>
								<Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
								<span className="text-[8px] font-black uppercase tracking-tight">
									{drive.label}
								</span>
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
};
