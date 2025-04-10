import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  base: './',
  plugins: [
    wasm(),
    react({
      include: /\\.(js|jsx)$/,
    })
  ],
  server: {
    open: true
  }
});
  