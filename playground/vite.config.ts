import { cwd } from 'node:process'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(cwd(), './src') },
  },
})
