import { cwd } from 'node:process'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  server: { hmr: false },
  resolve: {
    alias: {
      '@': resolve(cwd(), './src'),
      '@/*': resolve(cwd(), './src'),
    },
  },
})
