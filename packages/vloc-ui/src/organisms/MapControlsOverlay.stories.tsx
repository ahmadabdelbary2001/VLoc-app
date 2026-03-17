import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MapControlsOverlay } from "./MapControlsOverlay";

const meta: Meta<typeof MapControlsOverlay> = {
	title: "Organisms/MapControlsOverlay",
	component: MapControlsOverlay,
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof MapControlsOverlay>;

export const InteractiveState: Story = {
	render: () => {
		const [isPlaying, setIsPlaying] = useState(false);
		const [hasSelection, setHasSelection] = useState(true);

		return (
			<div className="h-screen w-full bg-zinc-800 relative overflow-hidden">
				<div className="flex items-center justify-center h-full text-white/5 font-black text-9xl">
					MAP
				</div>
				<MapControlsOverlay
					isPlaying={isPlaying}
					isMovingMode={true}
					hasSelection={hasSelection}
					onPlayToggle={() => setIsPlaying(!isPlaying)}
					onRecenter={() => console.log("Recenter")}
					onClear={() => setHasSelection(false)}
					onThemeToggle={() => console.log("Theme")}
					onRemoveLast={() => console.log("Remove last")}
				/>
			</div>
		);
	},
};
