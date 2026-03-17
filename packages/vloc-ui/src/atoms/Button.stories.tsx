import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
	title: "Atoms/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "ghost", "danger", "glass"],
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg", "icon"],
		},
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		variant: "primary",
		children: "Primary Button",
	},
};

export const Glass: Story = {
	args: {
		variant: "glass",
		children: "Glass Button",
	},
	parameters: {
		backgrounds: { default: "dark" },
	},
};

export const Icon: Story = {
	args: {
		variant: "primary",
		size: "icon",
		children: "🚀",
	},
};
