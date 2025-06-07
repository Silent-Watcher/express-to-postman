// import "ts-node/register/transpile-only";
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Application } from 'express';
import type { Collection, Item, ItemGroup } from './types';
import { extractRoutes } from './utils';

/**
 * Load the user’s entry file via dynamic import (ESM-compatible).
 */
export async function loadApp(entryPath: string): Promise<unknown> {
	const fullPath = resolve(entryPath);
	const fileUrl = pathToFileURL(fullPath).href;

	// Note: dynamic imports are always uncached by default
	return await import(fileUrl);
}

export async function generateCollection(
	entryPath: string,
	outputPath: string,
	verbose: boolean,
): Promise<void> {
	// Dynamically import the user’s file
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

	// Group routes by first segment
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
