import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Application } from 'express';

export interface ExpressLayer {
	route?: {
		path: string;
		methods: Record<string, boolean>;
	};
	name: string;
	handle?: {
		stack?: ExpressLayer[];
	};
	regexp?: RegExp;
}

export interface RouteInfo {
	method: string;
	path: string;
}

export function* extractRoutes(app: Application): Generator<RouteInfo> {
	const routerStack =
		(app as Application)._router?.stack ??
		(app as Application).router?.stack;

	if (!routerStack || !Array.isArray(routerStack)) return;

	for (const layer of routerStack as ExpressLayer[]) {
		if (!layer) continue;

		if (layer.route?.path && layer.route.methods) {
			for (const method of Object.keys(layer.route.methods)) {
				yield { method: method.toUpperCase(), path: layer.route.path };
			}
		} else if (
			layer.name === 'router' &&
			layer.handle?.stack &&
			Array.isArray(layer.handle.stack)
		) {
			const prefix =
				layer.regexp?.source
					?.replace('\\/?(?=\\/|$)', '')
					.replace('^', '')
					.replace('$', '') || '';

			for (const nested of layer.handle.stack) {
				if (nested?.route?.path && nested.route.methods) {
					for (const method of Object.keys(nested.route.methods)) {
						yield {
							method: method.toUpperCase(),
							path: prefix + nested.route.path,
						};
					}
				}
			}
		}
	}
}

export async function findProjectRoot(
	startDir: string,
): Promise<string | null> {
	let dir = startDir;
	while (true) {
		try {
			const pkgPath = join(dir, 'package.json');
			await access(pkgPath);
			return dir;
		} catch {
			const parent = dirname(dir);
			if (parent === dir) {
				return null;
			}
			dir = parent;
		}
	}
}
