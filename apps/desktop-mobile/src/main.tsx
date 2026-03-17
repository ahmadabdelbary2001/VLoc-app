import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { MapProvider } from "./providers/MapProvider";
import { SimulationProvider } from "./providers/SimulationProvider";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <MapProvider>
      <SimulationProvider>
        <App />
      </SimulationProvider>
    </MapProvider>
  </StrictMode>
);
