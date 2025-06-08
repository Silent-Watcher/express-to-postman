# express-to-postman

Generate Postman Collections automatically from your Express.js application routes.

## Features

* Auto-detect Express routes including nested routers
* Supports both JavaScript (ESM/CJS) and TypeScript entry files
* Bundles local route modules while externalizing npm dependencies
* Generates a valid Postman Collection v2.1 JSON file
* Groups routes by first URL segment for better organization
* CLI tool with simple usage and flexible input/output options

## Installation

Install globally for system-wide use:

```sh
npm install -g express-to-postman
```

Or add as a dev dependency in your project:

```sh
npm install --save-dev express-to-postman
```

## Basic Usage

Run the CLI against your Express app entry point:

```sh
express-to-postman -i path/to/your/express/app.js -o output/collection.json
```

* `-i`, `--input` — Entry file path for your Express app (must export `app`)
* `-o`, `--output` — Output path for the generated Postman collection JSON (default: `postman.collection.json`)
* `-v`, `--verbose` — Enable verbose logging (default: `false`)

## Detailed Examples

### JavaScript (ESM)

Assume your `server.js` looks like:

```js
import express from 'express';
export const app = express();
app.get('/users', (req, res) => res.json([]));
```

Generate a collection:

```sh
express-to-postman -i ./server.js -o ./users-collection.json
```

### TypeScript

Support for `.ts` entry files is built-in via on-the-fly transpilation:

```ts
import express from 'express';
import router from './routes';
export const app = express();
app.use(router);
```

```sh
express-to-postman -i ./src/app.ts -o postman.json
```

## Advanced Options

* **Auto-detect dependencies**: Reads your project’s `package.json` to externalize all npm packages during bundling.
* **Custom grouping**: Routes are grouped by the first path segment (`/users`, `/comments`).
* **Verbose logging**: Pass `-v` or `--verbose` to print intermediate logs and the full generated collection JSON.

## Troubleshooting

* **Missing dependencies**: If the CLI complains it cannot find a package (e.g. `express`), make sure your app’s root `package.json` is detected correctly. The CLI searches upward from your entry file for `package.json`.
* **Routes not detected**: Verify that your Express app exports a named `app` and that routes are registered before `app.listen()`.

## Configuration

You can also import and use `generateCollection()` programmatically in Node:

```js
import { generateCollection } from 'express-to-postman';

(async () => {
  await generateCollection(
    './dist/app.js',
    './collection.json',
    true // verbose
  );
})();
```

## License

[project License](./LICENSE)
