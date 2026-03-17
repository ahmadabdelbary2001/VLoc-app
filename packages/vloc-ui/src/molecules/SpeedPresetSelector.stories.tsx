import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SpeedPresetSelector } from "./SpeedPresetSelector";

const meta: Meta<typeof SpeedPresetSelector> = {
	title: "Molecules/SpeedPresetSelector",
	component: SpeedPresetSelector,
	tags: ["autodocs"],
	parameters: {
		backgrounds: { default: "dark" },
	},
};

export default meta;
type Story = StoryObj<typeof SpeedPresetSelector>;

export const Default: Story = {
	render: (args) => {
		const [mode, setMode] = useState<"walk" | "bike" | "drive">("walk");
		return (
			<div className="w-80">
				<SpeedPresetSelector
					{...args}
					activeMode={mode}
					onModeChange={setMode}
				/>
			</div>
		);
	},
};
