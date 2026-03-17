import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../atoms/Button";
import { RouteSettingsModal } from "./RouteSettingsModal";

const meta: Meta<typeof RouteSettingsModal> = {
	title: "Organisms/RouteSettingsModal",
	component: RouteSettingsModal,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof RouteSettingsModal>;

export const Interactive: Story = {
	render: () => {
		const [isOpen, setIsOpen] = useState(true);
		return (
			<div className="h-[600px] w-[800px] bg-zinc-800 flex items-center justify-center rounded-xl relative overflow-hidden">
				<div className="text-white/20 text-4xl font-black rotate-12 pointer-events-none absolute">
					MAP PREVIEW SURFACE
				</div>
				<Button onClick={() => setIsOpen(true)}>Open Settings</Button>
				<RouteSettingsModal
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					onPlay={(settings) => {
						console.log("Starting simulation with:", settings);
						setIsOpen(false);
					}}
				/>
			</div>
		);
	},
};
