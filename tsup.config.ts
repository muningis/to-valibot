import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./lib/index.ts', './lib/client/index.ts'],
  clean: true,
  format: ['esm', 'cjs'],
  minify: true,
  treeshake: true,
  dts: true,
  outDir: './dist',
});