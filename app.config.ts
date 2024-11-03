import { defineConfig } from '@solidjs/start/config';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  middleware: './src/lib/middleware.ts',
  server: {
    preset: 'node-server',
  },
  vite: {
    plugins: [UnoCSS()],
  },
});
