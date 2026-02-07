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
          manualChunks: {
            // React core - separate chunk for React ecosystem
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],

            // UI libraries - icons, themes, notifications
            'ui-vendor': [
              '@base-ui/react',
              'lucide-react',
              'next-themes',
              'sonner',
              'vaul',
              'cmdk',
            ],

            // Form libraries - form handling and validation
            'form-vendor': [
              'react-hook-form',
              '@hookform/resolvers',
              'zod',
            ],

            // Editor libraries - Monaco and TipTap
            'editor-vendor': [
              '@monaco-editor/react',
              '@tiptap/react',
              '@tiptap/starter-kit',
              '@tiptap/extension-link',
              '@tiptap/extension-placeholder',
            ],

            // Chart libraries
            'chart-vendor': ['recharts'],

            // Table libraries
            'table-vendor': ['@tanstack/react-table'],

            // Query libraries
            'query-vendor': ['@tanstack/react-query', 'axios'],
          },
        },
      },
      // Increase chunk size warning limit to 1MB
      chunkSizeWarningLimit: 1000,
    },
    server: {
      proxy: {
        "/api": {
          target: env.API_URL || "http://localhost:8080",
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
