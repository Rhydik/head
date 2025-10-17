import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages
  // Change this to match your repository name if it's not at the root
  // For example, if your repo is "username.github.io/repo-name", use "/repo-name/"
  base: './',
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  
  // Server configuration
  server: {
    port: 5176,
    open: true,
  },
});
