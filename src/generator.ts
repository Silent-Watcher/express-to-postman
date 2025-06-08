import { readFile, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import type { Application } from 'express';
import type { Collection, Item, ItemGroup } from './types';
import { extractRoutes, findProjectRoot } from './utils';

export async function loadApp(entryPath: string): Promise<unknown> {
	const entryDir = dirname(entryPath);

	const outFile = join(
		entryDir,
		`${basename(entryPath, '.ts')}-${Date.now()}.js`,
	);

	const projectRoot = (await findProjectRoot(entryDir)) || entryDir;
	const pkgJsonPath = join(projectRoot, 'package.json');
	let deps: string[] = [];
	try {
		const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf-8'));
		deps = Object.keys(pkg.dependencies || {});
	} catch {
		// no package.json, or it’s unreadable — fall back to zero deps
	}

	await build({
		entryPoints: [entryPath],
		outfile: outFile,
		bundle: true,
		format: 'esm',
		platform: 'node',
		external: [...deps],
	});

	const mod = await import(pathToFileURL(outFile).href);
	await unlink(outFile);
	return mod;
}

export async function generateCollection(
	entryPath: string,
	outputPath: string,
	verbose: boolean,
): Promise<void> {
	const mod = (await loadApp(entryPath)) as { app?: unknown };
	const app = mod.app;
	if (!app) {
		throw new Error(`No named export "app" found in ${entryPath}`);
	}

	const collection: Collection = {
		info: {
			name: entryPath.split(/[\\/]/).pop() || 'Express App',
			schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
		},
		item: [],
	};

	const groups: Record<string, ItemGroup> = {};

	console.log(
		' extractRoutes(app as Application): ',
		extractRoutes(app as Application),
	);
	for (const { method, path } of extractRoutes(app as Application)) {
		const segments = path.split('/').filter(Boolean);
		const groupName = segments[0] || '/';
		if (!groups[groupName]) {
			groups[groupName] = { name: groupName, item: [] };
		}

		const item: Item = {
			name: `${method} ${path}`,
			request: {
				method,
				header: [],
				url: {
					raw: `{{baseUrl}}${path}`,
					host: ['{{baseUrl}}'],
					path: segments,
				},
			},
		};

		groups[groupName].item.push(item);
	}

	for (const key of Object.keys(groups)) {
		collection.item.push(groups[key] as ItemGroup);
	}

	if (verbose) {
		console.log(JSON.stringify(collection, null, 2));
	}

	await writeFile(outputPath, JSON.stringify(collection, null, 2), 'utf-8');
}
