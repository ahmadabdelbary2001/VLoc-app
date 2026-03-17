import { type ClassValue, clsx } from "clsx";
import { Bike, Car, Footprints } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "../atoms/Button";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type Mode = "walk" | "bike" | "drive";

interface SpeedPresetSelectorProps {
	activeMode: Mode;
	onModeChange: (mode: Mode) => void;
	className?: string;
}

/**
 * Speed Preset Selector Molecule.
 *
 * **Why**: Replicates the icon-based speed selection from the Flutter legacy app.
 * **How**: Combines Lucide icons with custom active state logic inside glass tiles.
 */
export const SpeedPresetSelector = ({
	activeMode,
	onModeChange,
	className,
}: SpeedPresetSelectorProps) => {
	const presets = [
		{ id: "walk", icon: Footprints, label: "5 km/h" },
		{ id: "bike", icon: Bike, label: "15 km/h" },
		{ id: "drive", icon: Car, label: "60 km/h" },
	] as const;

	return (
		<div
			className={cn(
				"flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10",
				className,
			)}
		>
			{presets.map((preset) => {
				const Icon = preset.icon;
				const isActive = activeMode === preset.id;

				return (
					<Button
						key={preset.id}
						variant={isActive ? "primary" : "ghost"}
						size="sm"
						onClick={() => onModeChange(preset.id)}
						className={cn(
							"flex-1 flex flex-col items-center gap-1 h-auto py-3 rounded-lg transition-all",
							isActive ? "shadow-lg scale-105" : "hover:bg-white/10",
						)}
					>
						<Icon
							className={cn(
								"w-5 h-5",
								isActive ? "text-white" : "text-white/60",
							)}
						/>
						<span
							className={cn(
								"text-[10px] font-bold uppercase tracking-wider",
								isActive ? "text-white" : "text-white/40",
							)}
						>
							{preset.id}
						</span>
					</Button>
				);
			})}
		</div>
	);
};
