import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import 'ts-node/register';
import type { Collection, Item, ItemGroup } from './types';
import { extractRoutes } from './utils';

export async function generateCollection(
	entryPath: string,
	outputPath: string,
	verbose: boolean,
): Promise<void> {
	// Dynamically import the user’s file
	const mod = await import(pathToFileURL(entryPath).href);
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

	// Group routes by first segment
	const groups: Record<string, ItemGroup> = {};

	for (const { method, path } of extractRoutes(app)) {
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

	// Push groups into collection
	for (const key of Object.keys(groups)) {
		collection.item.push(groups[key] as ItemGroup);
	}

	if (verbose) {
		console.log(JSON.stringify(collection, null, 2));
	}

	// Write to disk
	await writeFile(outputPath, JSON.stringify(collection, null, 2), 'utf-8');
}
