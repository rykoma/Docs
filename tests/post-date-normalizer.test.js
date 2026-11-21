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

test('preserves post dates across builds, server restarts, and source updates', async t => {
  const site = fs.mkdtempSync(path.join(os.tmpdir(), 'hexo-post-dates-'));
  const posts = path.join(site, 'source', '_posts');
  fs.mkdirSync(posts, {recursive: true});
  fs.writeFileSync(path.join(site, 'package.json'), JSON.stringify({hexo: {version: '8.1.2'}}));
  fs.writeFileSync(path.join(site, '_config.yml'), 'timezone: Asia/Tokyo\n');
  t.after(() => fs.rmSync(site, {recursive: true, force: true}));

  const source = path.join(posts, 'example.md');
  const writePost = (date, updated, body) => fs.writeFileSync(source, [
    '---',
    'title: Example',
    `date: ${date}`,
    `updated: ${updated}`,
    '---',
    body,
  ].join('\n'));
  writePost('2026-11-22T00:43:29+09:00', '2026-11-22T00:43:29+09:00', 'Initial content');

  const processSite = async (watch, expectedDate, expectedUpdated) => {
    const instance = new Hexo(site, {silent: true});
    try {
      await instance.init();
      await instance.loadPlugin(require.resolve('hexo-renderer-marked'));
      await instance.loadPlugin(path.join(root, 'scripts', 'post-date-timezone.js'));
      if (watch) await instance.watch();
      else await instance.load();
      const post = instance.model('Post').findOne({source: '_posts/example.md'});
      assert.ok(post);
      assert.equal(post.date.toISOString(), expectedDate);
      assert.equal(post.updated.toISOString(), expectedUpdated);
    } finally {
      instance.unwatch();
      await instance.exit();
    }
  };

  const date = '2026-11-21T15:43:29.000Z';
  await processSite(false, date, date);
  await processSite(false, date, date);
  await processSite(true, date, date);
  await processSite(true, date, date);

  writePost('2021-07-27T15:48:51Z', '2026-11-21T09:28:41-05:00', 'Changed content');
  const changedDate = '2021-07-27T15:48:51.000Z';
  const changedUpdated = '2026-11-21T14:28:41.000Z';
  await processSite(false, changedDate, changedUpdated);
  await processSite(true, changedDate, changedUpdated);
});
