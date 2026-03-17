import { type ClassValue, clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "glass" | "success";
	size?: "sm" | "md" | "lg" | "icon";
	children: ReactNode;
}

/**
 * Foundational Button Atom.
 *
 * **Why**: Standardizes interactive elements across the app with consistent
 * micro-animations and style variants.
 * **How**: Uses Tailwind for styling and `clsx`/`tailwind-merge` for dynamic classes.
 */
export const Button = ({
	variant = "primary",
	size = "md",
	className,
	children,
	...props
}: ButtonProps) => {
	const variants = {
		primary:
			"bg-blue-600 text-white hover:bg-blue-700 opacity-100 shadow-lg shadow-blue-500/50 border-none",
		success:
			"bg-emerald-600 text-white hover:bg-emerald-700 opacity-100 shadow-lg shadow-emerald-500/50 border-none",
		secondary: "bg-muted text-foreground hover:bg-muted/80",
		ghost: "hover:bg-transparent text-foreground hover:bg-muted/50",
		danger: "bg-rose-600 text-white hover:bg-rose-700 opacity-100 shadow-lg shadow-rose-500/40 border-none",
		glass:
			"bg-white/40 dark:bg-black/60 backdrop-blur-md border-[1.5px] border-white/60 dark:border-white/30 text-foreground dark:text-white hover:bg-white/50 dark:hover:bg-black/80 transition-all duration-300 shadow-2xl",
	};

	const sizes = {
		sm: "h-8 px-3 text-xs",
		md: "h-10 px-4 py-2",
		lg: "h-14 px-10 text-lg font-bold uppercase tracking-wider",
		icon: "h-10 w-10 flex items-center justify-center rounded-full",
	};

	return (
		<button
			className={cn(
				"inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none",
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
};
