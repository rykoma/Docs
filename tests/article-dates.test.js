const assert = require('node:assert/strict');
const path = require('node:path');
const {before, test} = require('node:test');
const Hexo = require('hexo');

const published = '2024-01-10T09:00:00+09:00';
let hexo;

before(async () => {
  hexo = new Hexo(path.join(__dirname, '..'), {silent: true});
  await hexo.init();
  await hexo.theme.process();
});

function makePost(lang, updated) {
  return hexo.model('Post').new({
    title: 'Example',
    slug: `${lang}/example`,
    source: `_posts/${lang}/example.md`,
    lang,
    layout: 'post',
    date: new Date(published),
    updated: new Date(updated),
  });
}

function render(view, page, root) {
  return hexo.theme.getView(view).renderSync({
    page,
    config: {...hexo.config, root},
    theme: hexo.theme.config,
    view_dir: path.join(hexo.theme.base, 'layout') + path.sep,
    __: hexo.theme.i18n.__(page.lang),
  });
}

for (const root of ['/', '/Docs/']) {
  for (const lang of ['ja', 'en']) {
    const publishedLabel = lang === 'ja' ? '公開日' : 'Published';
    const updatedLabel = lang === 'ja' ? '更新日' : 'Updated';

    test(`${root} ${lang}: keeps publication outside the card and shows an update below the title`, () => {
      const html = render('post', makePost(lang, '2025-03-05T10:00:00+09:00'), root);

      assert.match(html, /class="dt-published"/);
      assert.ok(!html.includes(`${publishedLabel}:`));
      assert.match(html, /datetime="2024-01-10T00:00:00.000Z" itemprop="datePublished">2024-01-10<\/time>/);
      assert.match(html, new RegExp(`${updatedLabel}: <time class="dt-updated"`));
      assert.match(html, /datetime="2025-03-05T01:00:00.000Z" itemprop="dateModified">2025-03-05<\/time>/);
      assert.ok(html.indexOf('dt-published') < html.indexOf('article-inner'));
      assert.ok(html.indexOf('article-title') < html.indexOf('article-updated'));
      assert.ok(html.indexOf('article-updated') < html.indexOf('</header>'));
      assert.match(html, /class="fa fa-clock-o" aria-hidden="true"/);
      assert.ok(html.indexOf('article-updated') < html.indexOf('article-entry'));
      assert.doesNotMatch(html, /<a[^>]+class="article-date/);
    });

    for (const updated of [published, '2024-01-10T00:00:00Z']) {
      test(`${root} ${lang}: omits the update date for the same instant (${updated})`, () => {
        const html = render('post', makePost(lang, updated), root);

        assert.match(html, /class="dt-published"/);
        assert.doesNotMatch(html, /article-updated|dt-updated|dateModified/);
      });
    }

    test(`${root} ${lang}: shows a same-day update without displaying times`, () => {
      const html = render('post', makePost(lang, '2024-01-10T09:00:01+09:00'), root);

      assert.match(html, /datetime="2024-01-10T00:00:01.000Z" itemprop="dateModified">2024-01-10<\/time>/);
      assert.equal((html.match(/>2024-01-10<\/time>/g) || []).length, 2);
    });

    for (const view of ['index', 'archive', 'category', 'tag']) {
      test(`${root} ${lang}: preserves the ${view} date display`, () => {
        const post = makePost(lang, '2025-03-05T10:00:00+09:00');
        const html = render(view, {
          lang,
          posts: {each: callback => callback(post)},
          total: 1,
        }, root);

        assert.match(html, /itemprop="datePublished"/);
        assert.doesNotMatch(html, /article-updated|dt-updated|dateModified/);
        assert.ok(!html.includes(`${publishedLabel}:`));
        assert.ok(!html.includes(`${updatedLabel}:`));
        if (view !== 'index') {
          const expectedDate = lang === 'ja' ? '1 月 10 日' : 'Jan 10';
          assert.ok(html.includes(`>${expectedDate}</time>`));
        }
      });
    }

    test(`${root} ${lang}: omits both dates on fixed pages`, () => {
      const page = hexo.model('Page').new({
        title: 'About',
        source: `${lang}/about.md`,
        lang,
        layout: 'page',
        date: new Date(published),
        updated: new Date('2025-03-05T10:00:00+09:00'),
      });
      const html = render('page', page, root);

      assert.match(html, /article-type-page/);
      assert.doesNotMatch(html, /<time|datePublished|dateModified|article-updated/);
    });
  }
}
