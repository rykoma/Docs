const assert = require('node:assert/strict');
const path = require('node:path');
const {after, before, test} = require('node:test');
const Hexo = require('hexo');

let hexo;

before(async () => {
  hexo = new Hexo(path.join(__dirname, '..'), {silent: true});
  await hexo.init();
});

after(async () => {
  if (hexo) await hexo.exit();
});

function context(language, root = '/') {
  return {
    page: {language},
    config: {language, archive_dir: 'archives', category_dir: 'categories', tag_dir: 'tags'},
    site: {
      categories: {toArray: () => []},
      tags: {toArray: () => []},
    },
    url_for: value => root + value,
    date: (value, format) => format === 'YYYY 年 M 月'
      ? `${value.getFullYear()} 年 ${value.getMonth() + 1} 月`
      : `${value.getMonth() + 1}/${value.getFullYear()}`,
    __: (key, year) => ({
      more_tags: language === 'ja' ? 'その他のタグを表示' : 'Show more tags',
      archive_year_posts: language === 'ja' ? `${year} 年のすべての記事` : `All posts in ${year}`,
    })[key],
  };
}

function post(year, month, tags = [], categories = []) {
  return {
    date: {year: () => year, month: () => month - 1},
    tags: tags.map(name => ({name})),
    categories: categories.map(name => ({name})),
  };
}

for (const language of ['ja', 'en']) {
  for (const root of ['/', '/Docs/']) {
    test(`${language} ${root}: ranks tags, keeps each link once, and collapses the remainder`, () => {
      const tags = Array.from({length: 12}, (_, index) => `Tag-${String(index).padStart(2, '0')}`);
      const posts = [post(2024, 1, tags), post(2024, 2, ['Tag-11'])];
      const html = hexo.extend.helper.get('language_tags').call(context(language, root), posts, {show_count: true});
      const beforeDisclosure = html.split('<details')[0];

      assert.equal((beforeDisclosure.match(/class="tag-list-item"/g) || []).length, 10);
      assert.ok(beforeDisclosure.indexOf('Tag-11') < beforeDisclosure.indexOf('Tag-00'));
      assert.ok(beforeDisclosure.indexOf('Tag-00') < beforeDisclosure.indexOf('Tag-01'));
      assert.match(html, /<details class="more-tags"><summary>/);
      assert.match(html, /Tag-11<\/a><span class="tag-list-count">2<\/span>/);
      for (const tag of tags) {
        assert.equal((html.match(new RegExp(`>${tag}</a>`, 'g')) || []).length, 1);
        assert.ok(html.includes(`href="${root}${language}/tags/${tag}/"`));
      }
    });

    test(`${language} ${root}: groups archive links by year and sorts months`, () => {
      const posts = [post(2022, 1), post(2024, 3), post(2024, 1), post(2024, 3)];
      const html = hexo.extend.helper.get('language_archives').call(context(language, root), posts, {show_count: true});
      const yearLink = `href="${root}${language}/archives/2024/"`;
      const marchLink = `href="${root}${language}/archives/2024/03/"`;
      const januaryLink = `href="${root}${language}/archives/2024/01/"`;

      assert.ok(html.indexOf(yearLink) < html.indexOf(`href="${root}${language}/archives/2022/"`));
      assert.ok(html.indexOf(marchLink) < html.indexOf(januaryLink));
      assert.equal((html.match(/<details class="archive-months">/g) || []).length, 2);
      assert.match(html, new RegExp(`<details class="archive-months"><summary>${language === 'ja' ? '2024 年' : '2024'}<span class="archive-list-count">3</span></summary><ul class="archive-month-list"><li class="archive-list-item"><a class="archive-list-link" ${yearLink}>${language === 'ja' ? '2024 年のすべての記事' : 'All posts in 2024'}</a>`));
      assert.match(html, new RegExp(`${marchLink}>[^<]+</a><span class="archive-list-count">2</span>`));
      assert.ok(html.includes(language === 'ja' ? '2024 年 3 月' : '3/2024'));
    });
  }
}

test('omits tag disclosure for ten or fewer tags and handles empty data', () => {
  const helper = hexo.extend.helper.get('language_tags');
  const posts = [post(2024, 1, Array.from({length: 10}, (_, index) => `Tag-${index}`))];
  assert.doesNotMatch(helper.call(context('ja'), posts), /<details/);
  assert.equal(helper.call(context('ja'), []), '');
  assert.equal(hexo.extend.helper.get('language_archives').call(context('ja'), []), '');
});

test('yearly archives show year labels without monthly disclosures', () => {
  const html = hexo.extend.helper.get('language_archives').call(
    context('ja'), [post(2024, 3)], {type: 'yearly'}
  );
  assert.match(html, /archives\/2024\/">2024 年<\/a>/);
  assert.doesNotMatch(html, /<details|2024 年 3 月/);
});
