import { defineConfig } from '@hypernym/bundler'

export default defineConfig({
  entries: [
    // Main
    { input: './src/index.ts', output: './dist/index.js' },
    { dts: './src/types.ts', output: './dist/index.d.ts' },
    {
      input: './src/index.ts',
      output: './dist/index.min.js',
      minify: true,
    },
    {
      input: './src/index.ts',
      output: './dist/index.iife.js',
      name: 'Frame',
      format: 'iife',
      minify: true,
    },
    {
      input: './src/index.ts',
      output: './dist/index.umd.js',
      name: 'Frame',
      format: 'umd',
      minify: true,
    },
  ],
})
