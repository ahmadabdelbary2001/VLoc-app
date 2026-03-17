import { type ClassValue, clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "glass";
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
		primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
		secondary: "bg-muted text-secondary-foreground hover:bg-muted/80",
		ghost: "hover:bg-transparent text-foreground hover:bg-muted/50",
		danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
		glass:
			"bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-xl",
	};

	const sizes = {
		sm: "h-8 px-3 text-xs",
		md: "h-10 px-4 py-2",
		lg: "h-12 px-8 text-lg",
		icon: "h-10 w-10 flex items-center justify-center rounded-full",
	};

	return (
		<button
			className={cn(
				"inline-flex items-center justify-center rounded-md font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none",
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
