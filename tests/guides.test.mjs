import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { testFrontmatterTitles, testSidebarSlugs } from './helpers.mjs';

const root = new URL('../', import.meta.url).pathname;

testFrontmatterTitles('guides');
testSidebarSlugs('guides');

test('guides: every page has a description', () => {
	const dir = join(root, 'src/content/docs/guides');
	const pages = readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
	assert.ok(pages.length > 0, 'no guide pages');
	for (const page of pages) {
		const fm = readFileSync(join(dir, page), 'utf8').match(/^---\n([\s\S]*?)\n---/);
		assert.ok(fm && /^description:\s*\S+/m.test(fm[1]), `${page} has no description`);
	}
});
