import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
	title: "Atoms/Slider",
	component: Slider,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		label: { control: "text" },
		valueDisplay: { control: "text" },
		disabled: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
	args: {
		label: "Volume",
		valueDisplay: "50%",
		min: 0,
		max: 100,
	},
	render: (args: any) => {
		const [val, setVal] = useState(50);
		return (
			<div className="w-[300px] p-6 bg-background rounded-xl border border-border shadow-sm">
				<Slider
					{...args}
					value={val}
					valueDisplay={`${val}%`}
					onChange={(e) => setVal(Number(e.target.value))}
				/>
			</div>
		);
	},
};

export const WithoutLabel: Story = {
	args: {
		min: 0,
		max: 100,
	},
	render: (args: any) => {
		const [val, setVal] = useState(50);
		return (
			<div className="w-[300px] p-6 bg-background rounded-xl border border-border shadow-sm">
				<Slider
					{...args}
					value={val}
					onChange={(e) => setVal(Number(e.target.value))}
				/>
			</div>
		);
	},
};
