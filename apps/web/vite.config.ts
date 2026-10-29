import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cesium from 'vite-plugin-cesium'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    cesium({
      cesiumBuildRootPath: path.resolve(import.meta.dirname, '../../node_modules/cesium/Build'),
      cesiumBuildPath: path.resolve(import.meta.dirname, '../../node_modules/cesium/Build/Cesium'),
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@world-pulse/shared-types': path.resolve(import.meta.dirname, '../../packages/shared-types/index.ts'),
      '@world-pulse/shared-utils': path.resolve(import.meta.dirname, '../../packages/shared-utils/src/index.ts'),
    },
  },
})
