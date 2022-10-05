import { fileURLToPath, URL } from 'node:url';
import { join } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { STATIC_RESOURCE_ROUTE_PREFIX } from '../src/share/constant';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => ({
  base: STATIC_RESOURCE_ROUTE_PREFIX + '/',
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@share': fileURLToPath(
        new URL(join('../src', 'share'), import.meta.url)
      ),
    },
  },
  ssr: {
    format: 'cjs',
  },
}));
