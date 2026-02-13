import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import removeConsole from "vite-plugin-remove-console"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Remove console.log in production builds
      isProduction && removeConsole(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Node modules vendor chunks
            if (id.includes('node_modules')) {
              // React core + Router - keep together to avoid circular deps
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor'
              }

              // UI libraries - icons, themes, notifications
              if (
                id.includes('@base-ui/react') ||
                id.includes('lucide-react') ||
                id.includes('next-themes') ||
                id.includes('sonner') ||
                id.includes('vaul') ||
                id.includes('cmdk')
              ) {
                return 'ui-vendor'
              }

              // Form libraries - form handling and validation
              if (
                id.includes('react-hook-form') ||
                id.includes('@hookform/resolvers') ||
                id.includes('zod')
              ) {
                return 'form-vendor'
              }

              // Editor libraries - Monaco and TipTap
              if (
                id.includes('@monaco-editor') ||
                id.includes('@tiptap')
              ) {
                return 'editor-vendor'
              }

              // Table libraries
              if (id.includes('@tanstack/react-table')) {
                return 'table-vendor'
              }

              // Query libraries
              if (id.includes('@tanstack/react-query') || id.includes('axios')) {
                return 'query-vendor'
              }
            }

            // Plugin chunks - plugin field'ları için
            if (id.includes('/plugins/')) {
              return 'plugin-vendor'
            }
          },
        },
      },
      // Increase chunk size warning limit to 2MB to avoid warnings
      chunkSizeWarningLimit: 2000,
    },
    server: {
      proxy: {
        "/api": {
          target: env.API_URL || "http://localhost:8787",
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
