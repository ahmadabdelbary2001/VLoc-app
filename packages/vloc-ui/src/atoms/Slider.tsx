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
				className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary focus:outline-none"
				{...props}
			/>
		</div>
	);
};
