import { cwd } from 'node:process'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(cwd(), './src') },
  },
  plugins: [tailwindcss()],
})
