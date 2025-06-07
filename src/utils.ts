// src/utils.ts
import type { Application } from 'express';

export interface ExpressLayer {
	// layers with a .route are “real” endpoints
	route?: {
		path: string;
		methods: Record<string, boolean>;
	};
	// name is 'router' for nested routers
	name: string;
	// router-handles have their own .stack of layers
	handle?: {
		stack: ExpressLayer[];
	};
	// the regexp the router uses to match its prefix
	regexp: RegExp;
}

export interface RouteInfo {
	method: string;
	path: string;
}

/**
 * Walk the Express v5 router stack and yield all the routes.
 *
 * Under the hood, Express mounts everything in `app._router.stack` (or
 * on a nested router’s `.stack`).  We filter for layers that have
 * `.route`, and for nested routers we re-walk their `handle.stack`.
 *
 * (Using app._router.stack is the community-accepted way to list routes :contentReference[oaicite:0]{index=0},
 * and in Express v5 the private `_router` is now exposed as a getter `router` :contentReference[oaicite:1]{index=1}.)
 */
export function* extractRoutes(app: Application): Generator<RouteInfo> {
	// express v5 exposes the router getter, but it still ends up here
	const routerStack =
		(app as Application)._router?.stack ??
		(app as Application).router?.stack;
	if (!routerStack) return;

	for (const layer of routerStack as ExpressLayer[]) {
		// direct route
		if (layer.route?.path) {
			for (const m of Object.keys(layer.route.methods)) {
				yield { method: m.toUpperCase(), path: layer.route.path };
			}
		} // nested router
		else if (layer.name === 'router' && layer.handle?.stack) {
			// derive the mount path prefix from the layer’s regexp
			const prefix = layer.regexp.source
				.replace('\\/?(?=\\/|$)', '') // Express’s own suffix
				.replace('^', '')
				.replace('$', '');
			for (const child of layer.handle.stack) {
				if (child.route?.path) {
					for (const m of Object.keys(child.route.methods)) {
						yield {
							method: m.toUpperCase(),
							path: prefix + child.route.path,
						};
					}
				}
			}
		}
	}
}
