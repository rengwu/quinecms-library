import { expect, it } from 'vitest';
import { readFile, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  contextFor,
  filesFor,
  parseFiles,
  validate,
} from 'quinecms/core/content';
import { definitions } from '../.quinecms/site/.quinecms/workspace/src/generated/definitions';
import { Projects, Gallery } from '../src/themes/intr/v1/components';
import type { Content, Block } from 'quinecms/core/types';

async function records(root: string) {
  const files: Record<string, string> = {};
  async function walk(dir: string) {
    for (const item of await readdir(join(root, dir), {
      withFileTypes: true,
    })) {
      const path = `${dir}/${item.name}`;
      if (item.isDirectory()) await walk(path);
      else if (item.name.endsWith('.json'))
        files[path] = await readFile(join(root, path), 'utf8');
    }
  }
  await walk('content');
  return files;
}
const renderProjects = (content: Content, block: Block) =>
  renderToStaticMarkup(
    createElement(Projects, {
      props: block.props,
      context: contextFor(content, block.id),
    }),
  );

it('validates Intr fixture records and local media without staging a CMS fork', async () => {
  const content = parseFiles(await records('tests/fixtures/intr'));
  expect(validate(content, definitions)).toEqual([]);
  expect(parseFiles(filesFor(content))).toEqual(content);
  expect(JSON.parse(await readFile('tests/fixtures/intr/backup.json','utf8'))).toEqual(content);
  for (const media of content.media) for (const file of [media.original,...media.variants])
    expect((await stat(join('public',file.url))).size).toBe(file.bytes);
});

it('shares project edits across ordered grids and maps only safe optional detail links', async () => {
  const content = parseFiles(await records('tests/fixtures/intr'));
  const home = content.pages
    .find((page) => page.path === '/')!
    .blocks.find((block) => block.type === 'intr-projects')!;
  const index = content.pages.find((page) => page.path === '/projects')!
    .blocks[0];
  const project = content.entries.find(
    (entry) => entry.id === 'entry_intr_private',
  )!;
  project.values.title = 'A newly named home';
  project.values.location = 'A new location';
  project.values.url = '/projects/maison-doree';
  for (const block of [home, index]) {
    const html = renderProjects(content, block);
    expect(html).toContain('A newly named home');
    expect(html).toContain('A new location');
    expect(html).toContain(
      'href="/projects/maison-doree" aria-label="View A newly named home"',
    );
    expect(html).not.toContain('href=""');
  }
  project.values.url = 'javascript:alert(1)';
  expect(renderProjects(content, home)).not.toContain('javascript:');
  home.props.projects = [];
  const empty = renderToStaticMarkup(
    createElement(Projects, {
      props: home.props,
      context: { ...contextFor(content, home.id), preview: true },
    }),
  );
  expect(empty).toContain('Select projects in this block');
});

it('keeps galleries readable without hydration and preserves captions and responsive media', async () => {
  const content = parseFiles(await records('tests/fixtures/intr'));
  const block = content.pages
    .find((page) => page.path === '/projects/maison-doree')!
    .blocks.find((block) => block.type === 'intr-gallery')!;
  const html = renderToStaticMarkup(
    createElement(Gallery, {
      props: block.props,
      context: contextFor(content, block.id),
    }),
  );
  expect(html).toContain('<figcaption>');
  expect(html).toContain('srcSet=');
  expect(html).toContain('loading="lazy"');
  expect(html).not.toContain('<video');
});
