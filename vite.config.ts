import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works both from a web server and from the iOS app bundle.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
