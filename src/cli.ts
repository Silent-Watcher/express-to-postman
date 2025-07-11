#!/usr/bin/env node

import { resolve } from 'node:path';
import { Command } from 'commander';
import { version } from '../package.json';
import { generateCollection } from './generator';

const program = new Command();

program
	.name('express-to-postman')
	.description('Generate a Postman Collection from an Express v5 app')
	.version(version)
	.showHelpAfterError()
	.requiredOption(
		'-i, --input <path>',
		'Path to your Express app entry file (JS or TS)',
	)
	.option(
		'-o, --output <path>',
		'Output path for collection JSON',
		'postman.collection.json',
	)
	.option('-v, --verbose', 'Enable verbose logging', false);

if (process.argv.length <= 2) {
	program.outputHelp();
	process.exit(0);
}

program.exitOverride((err) => {
	console.error(err.message);
	program.outputHelp();
	process.exit(1);
});

program.parse(process.argv);

const opts = program.opts();
const inputPath = resolve(process.cwd(), opts.input);
const outputPath = resolve(process.cwd(), opts.output);

if (opts.verbose) {
	console.log(`Loading app from: ${inputPath}`);
}

generateCollection(inputPath, outputPath, opts.verbose)
	.then(() => {
		console.log(`✅ Postman collection written to ${outputPath}`);
	})
	.catch((err: unknown) => {
		console.error('❌ Error generating collection:', err);
		process.exit(1);
	});
