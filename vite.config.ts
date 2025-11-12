import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const repoBase = process.env.VITE_BASE ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base: repoBase,
  plugins: [vue(), vueDevTools()],
  preview: {
    allowedHosts: true,
    port: 8080,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
