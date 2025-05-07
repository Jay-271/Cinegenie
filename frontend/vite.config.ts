import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    visualizer({
      open: true, // report auto open
      filename: "dist/bundle-stats.html", // Saves the report in the dist folder
      gzipSize: true, // Shows gzipped sizes too
      brotliSize: true, // Shows brotli sizes too (optional)
    }),
  ],
})
