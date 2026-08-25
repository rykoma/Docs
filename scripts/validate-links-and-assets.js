const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const contentDirectories = ['source/_posts', 'source/ja', 'source/en'];
const markdownPattern = /\.(?:md|markdown)$/i;
const externalPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(filePath));
    else if (entry.isFile() && markdownPattern.test(entry.name)) files.push(filePath);
  }
  return files;
}

function isExistingPath(candidate) {
  return fs.existsSync(candidate) || fs.existsSync(path.join(candidate, 'index.md')) ||
    fs.existsSync(path.join(candidate, 'index.html'));
}

function validate(baseRoot = root) {
  const errors = [];
  const slugs = new Set();
  for (const directory of ['source/_posts/ja', 'source/_posts/en', 'source/ja', 'source/en']) {
    for (const filePath of markdownFiles(path.join(baseRoot, directory))) {
      const text = fs.readFileSync(filePath, 'utf8');
      const match = text.match(/^slug:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/m);
      if (match) slugs.add(match[1]);
    }
  }
  for (const directory of contentDirectories) {
    for (const filePath of markdownFiles(path.join(baseRoot, directory))) {
      const text = fs.readFileSync(filePath, 'utf8');
      const references = [
        ...text.matchAll(/(!?)\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g),
        ...text.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),
      ];
      for (const match of references) {
        const isMarkdownImage = match[1] === '!';
        const reference = (match[2] || match[1]).replace(/[?#].*$/, '');
        if (!reference || externalPattern.test(reference)) continue;
        const assetPathMatch = reference.match(/^\{%\s*asset_path\s+([^%]+?)\s*%\}$/);
        if (assetPathMatch) {
          const assetDirectory = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
          const target = path.resolve(assetDirectory, assetPathMatch[1].trim());
          if (!isExistingPath(target)) errors.push(`${path.relative(baseRoot, filePath)}: 参照先がありません "${assetPathMatch[1].trim()}"`);
          continue;
        }
        if (isMarkdownImage || match[0].startsWith('<img')) {
          const target = path.resolve(path.dirname(filePath), reference);
          if (!isExistingPath(target)) errors.push(`${path.relative(baseRoot, filePath)}: 参照先がありません "${reference}"`);
        } else {
          const slugMatch = reference.match(/(?:^|\/)(?:ja|en)\/([^/]+)\/?$/);
          const slug = slugMatch ? slugMatch[1] : null;
          if (!slug || !slugs.has(slug)) errors.push(`${path.relative(baseRoot, filePath)}: 記事・固定ページへのリンク先がありません "${reference}"`);
        }
      }
    }
  }
  return errors;
}

if (require.main === module) {
  const errors = validate();
  if (errors.length) {
    console.error(`リンク・画像参照検証に失敗しました (${errors.length} 件):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('リンク・画像参照検証に成功しました。');
  }
}

module.exports = { validate };
