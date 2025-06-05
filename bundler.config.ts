import { defineConfig } from '@hypernym/bundler'

export default defineConfig({
  entries: [
    // Main
    { input: './src/frame/index.ts', output: './dist/index.mjs' },
    {
      input: './src/frame/index.ts',
      output: './dist/index.min.mjs',
      minify: true,
    },
    { dts: './src/frame/types.ts', output: './dist/index.d.mts' },
    {
      input: './src/frame/index.ts',
      output: './dist/index.iife.js',
      name: 'Frame',
      format: 'iife',
      minify: true,
    },
    {
      input: './src/frame/index.ts',
      output: './dist/index.umd.js',
      name: 'Frame',
      format: 'umd',
      minify: true,
    },
    // Compact
    { input: './src/compact/index.ts', output: './dist/compact/index.mjs' },
    {
      input: './src/compact/index.ts',
      output: './dist/compact/index.min.mjs',
      minify: true,
    },
    { dts: './src/compact/types.ts', output: './dist/compact/index.d.mts' },
    {
      input: './src/compact/index.ts',
      output: './dist/compact/index.iife.js',
      name: 'Frame',
      format: 'iife',
      minify: true,
    },
    {
      input: './src/compact/index.ts',
      output: './dist/compact/index.umd.js',
      name: 'Frame',
      format: 'umd',
      minify: true,
    },
  ],
})
