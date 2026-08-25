const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { validate: validateFrontMatter } = require('../scripts/validate-front-matter');
const { validate: validateLinks } = require('../scripts/validate-links-and-assets');

function fixtureRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hexo-validation-'));
}

function write(root, relativePath, content) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const validPost = `---
title: Example
date: 2026-08-19T22:45:36+09:00
updated: 2026-08-19T22:45:36+09:00
lang: ja
slug: example-post
categories:
  - Hexo
tags:
  - Hexo
description: Example description.
---

[English](../../en/example-post/)
`;

test('accepts valid translated posts and pages', () => {
  const root = fixtureRoot();
  write(root, 'source/_posts/ja/example.md', validPost);
  write(root, 'source/_posts/en/example.md', validPost.replaceAll('lang: ja', 'lang: en'));
  write(root, 'source/ja/about.md', `---
title: About
lang: ja
slug: about
description: About this site.
---
`);
  assert.deepEqual(validateFrontMatter(root), []);
});

test('reports invalid page keys, values, and duplicate slugs', () => {
  const root = fixtureRoot();
  write(root, 'source/ja/about.md', `---
title: About
date: invalid
lang: en
slug: about
description:
tags:
  - tag
unknown: value
---
`);
  write(root, 'source/ja/bad.md', `---
title: Bad
lang: ja
slug: Bad Slug
description: Bad.
---
`);
  write(root, 'source/ja/other.md', `---
title: Other
lang: en
slug: about
description: Other.
---
`);
  const errors = validateFrontMatter(root);
  assert.ok(errors.some(error => error.includes('固定ページでは "date"')));
  assert.ok(errors.some(error => error.includes('未定義のキー "unknown"')));
  assert.ok(errors.some(error => error.includes('slug は')));
  assert.ok(errors.some(error => error.includes('翻訳ペア以外で重複')));
});

test('reports missing internal links and images', () => {
  const root = fixtureRoot();
  write(root, 'source/_posts/ja/example.md', `${validPost}
![missing](./assets/missing.png)
[missing](../../en/missing/)
`);
  assert.equal(validateLinks(root).length, 2);
});
