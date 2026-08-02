import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH is only set by the GitHub Pages Actions workflow (to the
// repo's subpath, e.g. "/nape-and-sons-plumbing/"). Local dev, Netlify and
// Vercel builds leave it unset and get the default root base.
const basePath = process.env.VITE_BASE_PATH
  ? process.env.VITE_BASE_PATH.replace(/\/?$/, '/')
  : '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
