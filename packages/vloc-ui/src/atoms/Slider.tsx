import { type ClassValue, clsx } from "clsx";
import type { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface SliderProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	label?: string;
	valueDisplay?: string;
}

/**
 * Custom Slider Atom.
 *
 * **Why**: Replaces the standard browser slider with a premium, themed version
 * that matches the app's aesthetic.
 * **How**: Uses a range input with custom CSS variables and Tailwind classes.
 */
export const Slider = ({
	label,
	valueDisplay,
	className,
	...props
}: SliderProps) => {
	return (
		<div className={cn("w-full space-y-2", className)}>
			{(label || valueDisplay) && (
				<div className="flex justify-between items-center text-sm font-medium text-foreground/80">
					{label && <span>{label}</span>}
					{valueDisplay && (
						<span className="text-primary font-bold">{valueDisplay}</span>
					)}
				</div>
			)}
			<input
				type="range"
				className={cn(
					"h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary focus:outline-none transition-all",
					// Webkit (Chrome, Safari, Edge)
					"[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--primary))] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125 active:[&::-webkit-slider-thumb]:scale-110",
					// Firefox
					"[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[hsl(var(--primary))] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white dark:[&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-125 active:[&::-moz-range-thumb]:scale-110 [&::-moz-range-thumb]:border-none",
				)}
				{...props}
			/>
		</div>
	);
};
