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
				"flex gap-2 p-1.5 bg-muted/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm",
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
							"flex-1 flex flex-col items-center gap-1.5 h-auto py-3.5 rounded-xl transition-all duration-300",
							isActive 
								? "shadow-xl shadow-primary/30 scale-[1.02]" 
								: "hover:bg-muted/80 text-muted-foreground/60 hover:text-muted-foreground",
						)}
					>
						<Icon
							className={cn(
								"w-5 h-5 transition-transform duration-300",
								isActive ? "scale-110" : "",
							)}
						/>
						<span
							className={cn(
								"text-[10px] font-black uppercase tracking-widest transition-colors",
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
