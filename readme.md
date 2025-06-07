# express-to-postman

Generate Postman Collections automatically from your Express.js application routes.

## Features

- Auto-detect Express routes including nested routers
- Generates a valid Postman Collection v2.1 JSON file
- Groups routes by first URL segment for better organization
- CLI tool with simple usage and flexible input/output options

## Installation

```sh
npm install -g express-to-postman
```

or locally

```sh
npm install --save-dev express-to-postman
```

## Usage

```sh
express-to-postman -i path/to/your/express/app.js -o output/collection.json
```

`-i`, `--input` — Entry file path for your Express app (must export your Express instance as app)

`-o`, `--output` — Output path for the generated Postman collection JSON (default: collection.json)

## flags and options

```sh
express-to-postman -h
Usage: express-to-postman [options]

Generate a Postman Collection from an Express v5 app

Options:
  -V, --version        output the version number
  -i, --input <path>   Path to your Express app entry file (JS or TS)
  -o, --output <path>  Output path for collection JSON (default: "postman.collection.json")
  -v, --verbose        Enable verbose logging (default: false)
  -h, --help           display help for command
```
