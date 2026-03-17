import { type ClassValue, clsx } from "clsx";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type TypographyVariant = "h1" | "h2" | "h3" | "p" | "small" | "lead";

interface TypographyProps {
	variant?: TypographyVariant;
	children: ReactNode;
	className?: string;
}

/**
 * Centralized Typography system.
 *
 * **Why**: Ensures text consistency across the monorepo and follows the "Intermediate English"
 * professional standard.
 * **How**: Maps variants to semantic HTML tags and predefined Tailwind styles.
 */
export const Typography = ({
	variant = "p",
	children,
	className,
}: TypographyProps) => {
	const styles = {
		h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
		h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
		h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
		p: "leading-7 [&:not(:first-child)]:mt-6",
		small: "text-sm font-medium leading-none",
		lead: "text-xl text-muted-foreground",
	};

	const Component = variant === "lead" || variant === "small" ? "p" : variant;

	return (
		<Component className={cn(styles[variant], className)}>{children}</Component>
	);
};
