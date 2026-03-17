import { commands, Route } from "@vloc/api-bindings";

/**
 * Hook to interact with the VLoc Engine.
 * 
 * **Why**: Provides a high-level Typescript interface for frontend-to-Rust communication.
 * **How**: Wraps Tauri/Specta commands for simulation control.
 */
export const useEngine = () => {
  const startSimulation = async (route: Route, speedKmh: number) => {
    try {
      return await commands.start_route(route, speedKmh);
    } catch (e) {
      console.error("Failed to start simulation:", e);
      throw e;
    }
  };

  const stopSimulation = async () => {
    try {
      return await commands.stop_route();
    } catch (e) {
      console.error("Failed to stop simulation:", e);
      throw e;
    }
  };

  const getCurrentState = async () => {
    try {
      return await commands.get_current_state();
    } catch (e) {
      console.error("Failed to get engine state:", e);
      throw e;
    }
  };

  return {
    startSimulation,
    stopSimulation,
    getCurrentState,
  };
};
