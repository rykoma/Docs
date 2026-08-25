const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const contentRoots = [
  ['source/_posts/ja', 'post', 'ja'],
  ['source/_posts/en', 'post', 'en'],
  ['source/ja', 'page', 'ja'],
  ['source/en', 'page', 'en'],
];
const allowedKeys = new Set([
  'title', 'date', 'updated', 'lang', 'slug', 'categories', 'tags',
  'description', 'alias',
]);
const postRequired = ['title', 'date', 'updated', 'lang', 'slug', 'categories', 'tags', 'description'];
const pageRequired = ['title', 'lang', 'slug', 'description'];
const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const aliasPattern = /^\/(?:[^?#\s/]+\/)*[^?#\s/]*\/?$/;

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(entryPath));
    else if (entry.isFile() && /\.(?:md|markdown)$/i.test(entry.name)) files.push(entryPath);
  }
  return files;
}

function readFrontMatter(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('Front Matter が先頭にありません');
  const data = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {};
  if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Front Matter は YAML オブジェクトである必要があります');
  return data;
}

function addError(errors, baseRoot, filePath, message) {
  errors.push(`${path.relative(baseRoot, filePath)}: ${message}`);
}

function validateDate(value, key, filePath, errors) {
  if (typeof value !== 'string' || !datePattern.test(value) || Number.isNaN(Date.parse(value))) {
    addError(errors, filePath, `${key} はタイムゾーン付き ISO 8601 形式で指定してください`);
  }
}

function validateContent(baseRoot, filePath, kind, expectedLanguage, errors, entries) {
  let data;
  try {
    data = readFrontMatter(filePath);
  } catch (error) {
    addError(errors, baseRoot, filePath, error.message);
    return;
  }

  const required = kind === 'post' ? postRequired : pageRequired;
  for (const key of required) {
    if (!(key in data) || data[key] === null || data[key] === '') {
      addError(errors, baseRoot, filePath, `必須キー "${key}" がありません`);
    }
  }
  for (const key of Object.keys(data)) {
    if (!allowedKeys.has(key)) addError(errors, baseRoot, filePath, `未定義のキー "${key}" があります`);
  }
  if (kind === 'page') {
    for (const key of ['date', 'updated', 'categories', 'tags']) {
      if (key in data) addError(errors, baseRoot, filePath, `固定ページでは "${key}" を使用できません`);
    }
  }
  if (typeof data.title !== 'string' || !data.title.trim()) addError(errors, baseRoot, filePath, 'title は空でない文字列にしてください');
  if (typeof data.description !== 'string' || !data.description.trim()) addError(errors, baseRoot, filePath, 'description は空でない文字列にしてください');
  if (data.lang !== expectedLanguage || !['ja', 'en'].includes(data.lang)) {
    addError(errors, baseRoot, filePath, `lang は配置先に対応する "${expectedLanguage}" にしてください`);
  }
  if (typeof data.slug !== 'string' || data.slug.length > 60 || !slugPattern.test(data.slug)) {
    addError(errors, baseRoot, filePath, 'slug は 60 文字以下の kebab-case にしてください');
  }
  if (kind === 'post') {
    if (!Array.isArray(data.categories) || data.categories.length !== 1 || typeof data.categories[0] !== 'string' || !data.categories[0].trim()) {
      addError(errors, baseRoot, filePath, 'categories は 1 件の文字列配列にしてください');
    }
    if (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string' || !tag.trim())) {
      addError(errors, baseRoot, filePath, 'tags は空でない文字列配列にしてください');
    } else if (Array.isArray(data.categories) && data.categories.length === 1 && !data.tags.includes(data.categories[0])) {
      addError(errors, baseRoot, filePath, 'categories の値を tags にも含めてください');
    }
    validateDate(data.date, 'date', filePath, errors);
    validateDate(data.updated, 'updated', filePath, errors);
  }
  if ('alias' in data) {
    const aliases = Array.isArray(data.alias) ? data.alias : [data.alias];
    if (!aliases.length || aliases.some(alias => typeof alias !== 'string' || !aliasPattern.test(alias))) {
      addError(errors, baseRoot, filePath, 'alias はルート相対 URL の文字列または配列にしてください');
    }
  }
  if (typeof data.slug === 'string' && slugPattern.test(data.slug)) {
    entries.push({ filePath, language: expectedLanguage, slug: data.slug });
  }
}

function validate(baseRoot = root) {
  const errors = [];
  const entries = [];
  for (const [relativeRoot, kind, language] of contentRoots) {
    for (const filePath of markdownFiles(path.join(baseRoot, relativeRoot))) {
      validateContent(baseRoot, filePath, kind, language, errors, entries);
    }
  }
  const bySlug = new Map();
  for (const entry of entries) {
    const list = bySlug.get(entry.slug) || [];
    list.push(entry);
    bySlug.set(entry.slug, list);
  }
  for (const [slug, list] of bySlug) {
    const kinds = new Set(list.map(entry => entry.filePath.includes(`${path.sep}source${path.sep}_posts${path.sep}`) ? 'post' : 'page'));
    const languages = new Set(list.map(entry => entry.language));
    if (list.length > 2 || kinds.size > 1 || languages.size !== list.length) {
      for (const entry of list) addError(errors, baseRoot, entry.filePath, `slug "${slug}" が翻訳ペア以外で重複しています`);
    }
  }
  return errors;
}

if (require.main === module) {
  const errors = validate();
  if (errors.length) {
    console.error(`Front Matter 検証に失敗しました (${errors.length} 件):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('Front Matter 検証に成功しました。');
  }
}

module.exports = { validate, readFrontMatter };
