import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"

// Register core field components
import "@/components/forms/fields/index"

// Initialize plugins
import { initializePlugins } from "@/plugins/initialize"

// Initialize plugins before rendering
initializePlugins()
  .then(() => {
    console.log('[App] Plugins initialized successfully');

    // Render app
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error('[App] Failed to initialize plugins:', error);

    // Render app anyway (graceful degradation)
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
