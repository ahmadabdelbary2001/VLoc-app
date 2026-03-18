import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "./Typography";

const meta: Meta<typeof Typography> = {
	title: "Atoms/Typography",
	component: Typography,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["h1", "h2", "h3", "p", "small", "lead"],
		},
		children: {
			control: "text",
		},
	},
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Heading1: Story = {
	args: {
		variant: "h1",
		children: "The quick brown fox jumps over the lazy dog",
	},
};

export const Heading2: Story = {
	args: {
		variant: "h2",
		children: "The quick brown fox jumps over the lazy dog",
	},
};

export const Heading3: Story = {
	args: {
		variant: "h3",
		children: "The quick brown fox jumps over the lazy dog",
	},
};

export const Paragraph: Story = {
	args: {
		variant: "p",
		children:
			"This is a paragraph. It is typically used for long blocks of text that span multiple lines. It ensures good readability and line height.",
	},
};

export const Small: Story = {
	args: {
		variant: "small",
		children: "Small text for captions or secondary information.",
	},
};

export const Lead: Story = {
	args: {
		variant: "lead",
		children: "A lead paragraph that stands out slightly more than normal text.",
	},
};

export const AllVariants = {
	render: () => (
		<div className="flex flex-col gap-6 max-w-2xl p-8 bg-background rounded-xl border border-border shadow-sm">
			<div>
				<span className="text-muted-foreground text-xs uppercase mb-1 block">h1</span>
				<Typography variant="h1">Simulation Settings</Typography>
			</div>
			<div>
				<span className="text-muted-foreground text-xs uppercase mb-1 block">h2</span>
				<Typography variant="h2">Route Parameters</Typography>
			</div>
			<div>
				<span className="text-muted-foreground text-xs uppercase mb-1 block">h3</span>
				<Typography variant="h3">Location Inaccuracy</Typography>
			</div>
			<div>
				<span className="text-muted-foreground text-xs uppercase mb-1 block">lead</span>
				<Typography variant="lead">
					Adjust the simulation parameters to test your application's behavior under different conditions.
				</Typography>
			</div>
			<div>
				<span className="text-muted-foreground text-xs uppercase mb-1 block">p</span>
				<Typography variant="p">
					By enabling location inaccuracy, the engine will add a randomized drift to the GPS coordinates, simulating poor signal reception or urban canyon effects.
				</Typography>
			</div>
			<div>
				<span className="text-muted-foreground text-xs uppercase mb-1 block">small</span>
				<Typography variant="small">
					Note: High inaccuracy may cause erratic routing updates.
				</Typography>
			</div>
		</div>
	),
};
