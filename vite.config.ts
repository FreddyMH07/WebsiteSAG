import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // Expose PUBLIC_ and CONTENTFUL_ vars to client (in addition to VITE_)
  envPrefix: ['VITE_', 'PUBLIC_', 'CONTENTFUL_'],
});
