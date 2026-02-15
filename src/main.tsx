import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"

// Register core field components
import "@/components/forms/fields/index"

// Initialize plugins
import { initializePlugins } from "@/plugins/initialize"

type InitI18n = {
  lang?: string
  direction?: "ltr" | "rtl"
}

const resolveHtmlLang = (lang?: string): string | undefined => {
  if (!lang) return undefined
  const trimmed = lang.trim()
  if (!trimmed || trimmed.includes("{{")) return undefined
  return trimmed
}

function ensureDocumentLanguage() {
  const init = (window as Window & { Init?: { i18n?: InitI18n } }).Init
  const i18n = init?.i18n
  const html = document.documentElement

  const currentLang = resolveHtmlLang(html.lang)
  const resolvedLang =
    resolveHtmlLang(i18n?.lang) ||
    currentLang ||
    resolveHtmlLang(typeof navigator !== "undefined" ? navigator.language : undefined) ||
    "en"

  html.lang = resolvedLang

  if (i18n?.direction === "rtl" || i18n?.direction === "ltr") {
    html.dir = i18n.direction
  } else if (html.dir !== "rtl" && html.dir !== "ltr") {
    html.dir = "ltr"
  }
}

ensureDocumentLanguage()

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
