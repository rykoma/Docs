const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {after, before, test} = require('node:test');
const Hexo = require('hexo');
const frontMatter = require('hexo-front-matter');
const {adjustDateForTimezone} = require('hexo/dist/plugins/processor/common');
const normalizePostDates = require('../scripts/post-date-normalizer');

const root = path.resolve(__dirname, '..');
let hexo;
let databaseDirectory;

before(async () => {
  databaseDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'hexo-date-normalizer-'));
  hexo = new Hexo(root, {silent: true, output: databaseDirectory});
  await hexo.init();
});

after(async () => {
  if (hexo) await hexo.exit();
  if (databaseDirectory) fs.rmSync(databaseDirectory, {recursive: true, force: true});
});

test('restores JST publication and update instants after Hexo timezone adjustment', () => {
  const source = fs.readFileSync(
    path.join(root, 'source/_posts/ja/propose-alternative-meeting-time-with-microsoft-graph.md'),
    'utf8',
  ).replace(/\r/g, '');
  const data = frontMatter.parse(source);
  const moment = hexo.extend.helper.get('moment');
  const post = {
    ...data,
    date: moment(adjustDateForTimezone(data.date, hexo.config.timezone)),
    updated: moment(adjustDateForTimezone(data.updated, hexo.config.timezone)),
  };

  assert.equal(post.date.toISOString(), '2020-07-27T06:48:51.000Z');
  assert.equal(post.updated.toISOString(), '2026-11-21T05:28:41.000Z');

  normalizePostDates([post], hexo.config.timezone, moment);

  assert.equal(post.date.toISOString(), '2020-07-27T15:48:51.000Z');
  assert.equal(post.updated.toISOString(), '2026-11-21T14:28:41.000Z');
});

test('preserves article instants through Hexo source processing', async () => {
  await hexo.load();

  const post = hexo.model('Post').findOne({
    source: '_posts/ja/propose-alternative-meeting-time-with-microsoft-graph.md',
  });

  assert.equal(post.date.toISOString(), '2020-07-27T15:48:51.000Z');
  assert.equal(post.updated.toISOString(), '2026-11-21T14:28:41.000Z');
});
