import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/*'],
	format: ['esm'], // Keep ESM format
	outDir: 'dist',
	clean: true,
	sourcemap: true,
	splitting: false,
	bundle: true,
	dts: false,
	minify: true,
	external: ['fs/promises', 'url', 'os', 'path', 'commander', 'esbuild'],
	outExtension: () => ({ js: '.js' }), // Force .js instead of .mjs
	esbuildOptions: (options) => {
		options.alias = {
			'#app': './src', // Resolve #app/* to the src folder
		};
	},
});
