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

		// ✅ Direct route
		if (layer.route?.path && layer.route.methods) {
			for (const method of Object.keys(layer.route.methods)) {
				yield { method: method.toUpperCase(), path: layer.route.path };
			}
		}

		// ✅ Nested router (e.g. app.use('/api', router))
		else if (
			layer.name === 'router' &&
			layer.handle?.stack &&
			Array.isArray(layer.handle.stack)
		) {
			// Optional chaining for regex, fallback to empty string if missing
			const prefix =
				layer.regexp?.source
					?.replace('\\/?(?=\\/|$)', '') // Clean trailing optional slash
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
