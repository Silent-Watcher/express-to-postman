import { promises as fs } from 'node:fs';
import { symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
// test/generator.test.ts
import { afterEach, describe, expect, it } from 'vitest';
import { generateCollection } from '../src/generator';

const tmp = tmpdir();
const entryPath = join(tmp, 'app-test.ts');
const outputPath = join(tmp, 'out.json');

describe('generateCollection', () => {
	it('should produce a collection for simple routes', async () => {
		// Symlink node_modules to the temporary directory
		const nodeModulesPath = resolve(__dirname, '..', 'node_modules'); // Adjust path if needed
		const tmpNodeModules = join(tmp, 'node_modules');
		await symlink(nodeModulesPath, tmpNodeModules, 'junction').catch(
			() => {},
		);
		const content = `
      import express from 'express';
      export const app = express();
      app.get('/users', (req, res) => res.send('ok'));
      app.post('/orders/:id', (req, res) => res.send('ok'));
    `;
		await fs.writeFile(entryPath, content, 'utf-8');

		await generateCollection(entryPath, outputPath, false);

		const raw = await fs.readFile(outputPath, 'utf-8');
		const col = JSON.parse(raw);

		expect(col.info.schema).toContain('v2.1');
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const flat = col.item.flatMap((g: any) => g.item);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const names = flat.map((i: any) => i.name);
		expect(names).toContain('GET /users');
		expect(names).toContain('POST /orders/:id');
	});
});

afterEach(async () => {
	await fs.unlink(entryPath).catch(() => {});
	await fs.unlink(outputPath).catch(() => {});
	await fs.unlink(join(tmp, 'node_modules')).catch(() => {});
});
