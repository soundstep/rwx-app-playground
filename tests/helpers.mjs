import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;

function walk(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
	);
}

/** Every markdown page under src/content/docs/<section> has a frontmatter title. */
export function testFrontmatterTitles(section) {
	test(`${section}: every page has a frontmatter title`, () => {
		const pages = walk(join(root, 'src/content/docs', section)).filter((f) => /\.mdx?$/.test(f));
		assert.ok(pages.length > 0, `no pages in ${section}`);
		for (const page of pages) {
			const fm = readFileSync(page, 'utf8').match(/^---\n([\s\S]*?)\n---/);
			assert.ok(fm, `${page} has no frontmatter`);
			assert.match(fm[1], /^title:\s*\S+/m, `${page} has no title`);
		}
	});
}

/** Every sidebar slug in astro.config.mjs under <section>/ points to an existing page. */
export function testSidebarSlugs(section) {
	test(`${section}: sidebar slugs point to existing pages`, () => {
		const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
		const slugs = [...config.matchAll(/slug:\s*'([^']+)'/g)]
			.map((m) => m[1])
			.filter((s) => s.startsWith(`${section}/`));
		assert.ok(slugs.length > 0, `no sidebar slugs for ${section}`);
		for (const slug of slugs) {
			const exists = ['.md', '.mdx'].some((ext) =>
				existsSync(join(root, 'src/content/docs', slug + ext)),
			);
			assert.ok(exists, `no page for slug "${slug}"`);
		}
	});
}
