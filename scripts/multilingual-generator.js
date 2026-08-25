const pagination = require('hexo-pagination');

const languages = ['ja', 'en'];

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const resolveSiteTitle = (config, lang) => {
  const titles = config.titles || {};
  return (lang && titles[lang]) || config.title;
};

const absoluteUrl = (config, path) => {
  let baseUrl = String(config.url || '').replace(/\/+$/, '');
  const root = String(config.root || '/').replace(/^\/?/, '/').replace(/\/+$/, '');
  const rootPath = root.replace(/^\/+|\/+$/g, '');
  if (root && baseUrl.endsWith(root)) baseUrl = baseUrl.slice(0, -root.length);
  let relativePath = String(path).replace(/^\/+/, '');
  if (rootPath && (relativePath === rootPath || relativePath.startsWith(`${rootPath}/`))) {
    relativePath = relativePath.slice(rootPath.length).replace(/^\/+/, '');
  }
  relativePath = relativePath.replace(/index\.html$/, '');
  return `${baseUrl}${root}/${relativePath}`;
};

const rssDate = date => new Date(date).toUTCString();

const rssFeed = (config, language, posts) => {
  const description = (config.rss_descriptions || {})[language] || '';
  // Match hexo-generator-feed's default `limit: 20` (0 = unlimited) so the
  // feed doesn't grow without bound as more posts are published.
  const limit = (config.feed || {}).limit ?? 20;
  const limitedPosts = limit > 0 ? posts.slice(0, limit) : posts;
  const items = limitedPosts.map(post => {
    const postUrl = absoluteUrl(config, post.path);
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${escapeXml(rssDate(post.date))}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(resolveSiteTitle(config, language))}</title>
    <link>${escapeXml(absoluteUrl(config, `${language}/`))}</link>
    <description>${escapeXml(description)}</description>
    <language>${language}</language>
    <atom:link href="${escapeXml(absoluteUrl(config, `${language}/rss.xml`))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
};

hexo.extend.helper.register('site_title', function (lang) {
  return resolveSiteTitle(this.config, lang);
});

hexo.extend.helper.register('absolute_url', function (path) {
  return absoluteUrl(this.config, path);
});

const sortPosts = (posts, orderBy = '-date') =>
  posts.sort((a, b) => {
    const direction = orderBy.startsWith('-') ? -1 : 1;
    const field = orderBy.replace(/^-/, '');
    return (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * direction;
  });

const localizedPath = (path, language) =>
  `${language}/${String(path).replace(/^\/+/, '')}`;

const languageSelector = (jaUrl, enUrl, title) => {
  const serializedJaUrl = JSON.stringify(jaUrl);
  const serializedEnUrl = JSON.stringify(enUrl);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <title>${escapeHtml(title)}</title>
  <script>
    (() => {
      const languages = navigator.languages || [navigator.language];
      const language = languages.find((value) => /^(ja|en)(-|$)/i.test(value));
      const destination = language && /^en/i.test(language) ? ${serializedEnUrl} : ${serializedJaUrl};
      window.location.replace(destination);
    })();
  </script>
</head>
<body>
  <p>Select a language:</p>
  <ul>
    <li><a href="${escapeHtml(jaUrl)}">日本語</a></li>
    <li><a href="${escapeHtml(enUrl)}">English</a></li>
  </ul>
</body>
</html>
`;
};

const addLanguageSelector = (pages, root, path, localizedUrls, title) => {
  pages.push({
    path: `${path.replace(/^\/+/, '').replace(/\/?$/, '/')}index.html`,
    language_selector: true,
    data: languageSelector(
      `${root}${localizedUrls.ja}`,
      `${root}${localizedUrls.en}`,
      title,
    ),
  });
};

const pageData = (language, urls, data = {}) => ({
  ...data,
  language,
  language_switcher: urls,
});

hexo.extend.helper.register('language_archives', function (posts, options = {}) {
  const type = options.type || 'monthly';
  const showCount = options.show_count === true;
  const language = this.page.lang || this.page.language || this.config.language;
  const format = language === 'ja' ? 'YYYY 年 M 月' : 'MMMM YYYY';
  const groups = new Map();

  posts.forEach(post => {
    const year = post.date.year();
    const month = post.date.month() + 1;
    const key = type === 'monthly' ? `${year}-${month}` : String(year);
    const group = groups.get(key) || {year, month, count: 0};
    group.count++;
    groups.set(key, group);
  });

  const items = [...groups.values()].sort((a, b) =>
    b.year - a.year || b.month - a.month
  );
  const archiveDir = this.config.archive_dir;
  const list = items.map(item => {
    const date = this.date(new Date(item.year, item.month - 1), format);
    const monthPath = type === 'monthly' ? `${item.month < 10 ? '0' : ''}${item.month}/` : '';
    const path = localizedPath(`${archiveDir}/${item.year}/${monthPath}`, language);
    const count = showCount ? `<span class="archive-list-count">${item.count}</span>` : '';
    return `<li class="archive-list-item"><a class="archive-list-link" href="${escapeHtml(this.url_for(path))}">${escapeHtml(date)}</a>${count}</li>`;
  }).join('');

  return items.length ? `<ul class="archive-list">${list}</ul>` : '';
});

const taxonomyHelper = (posts, type) => function (options = {}) {
  const language = this.page.lang || this.page.language || this.config.language;
  const counts = new Map();
  posts.forEach(post => {
    const values = type === 'category' ? post.categories : post.tags;
    values.forEach(value => counts.set(value.name, (counts.get(value.name) || 0) + 1));
  });
  const directory = type === 'category' ? this.config.category_dir : this.config.tag_dir;
  const className = type === 'category' ? 'category' : 'tag';
  const items = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const links = items.map(([name, count]) => {
    const path = localizedPath(`${directory}/${encodeURIComponent(name)}/`, language);
    const countHtml = options.show_count ? `<span class="${className}-list-count">${count}</span>` : '';
    return `<li class="${className}-list-item"><a class="${className}-list-link" href="${escapeHtml(this.url_for(path))}">${escapeHtml(name)}</a>${countHtml}</li>`;
  }).join('');
  return items.length ? `<ul class="${className}-list">${links}</ul>` : '';
};

hexo.extend.helper.register('language_categories', function (posts, options) {
  return taxonomyHelper(posts, 'category').call(this, options);
});

hexo.extend.helper.register('language_tags', function (posts, options) {
  return taxonomyHelper(posts, 'tag').call(this, options);
});

hexo.extend.helper.register('language_tagcloud', function (posts) {
  const counts = new Map();
  posts.forEach(post => post.tags.forEach(tag => counts.set(tag.name, (counts.get(tag.name) || 0) + 1)));
  const max = Math.max(...counts.values(), 1);
  const language = this.page.lang || this.page.language || this.config.language;
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => {
    const size = 100 + Math.round((count / max) * 100);
    const path = localizedPath(`${this.config.tag_dir}/${encodeURIComponent(name)}/`, language);
    return `<a href="${escapeHtml(this.url_for(path))}" class="tagcloud-link" style="font-size: ${size}%;">${escapeHtml(name)}</a>`;
  }).join(' ');
});

hexo.extend.generator.register('multilingual-pages', function () {
  const config = this.config;
  const root = config.root.endsWith('/') ? config.root : `${config.root}/`;
  const allPosts = this.locals.get('posts').toArray();
  const {Query} = this.model('Post');
  const postQuery = posts => new Query(posts);
  const indexConfig = config.index_generator || {};
  const paginationFormat = `${config.pagination_dir || 'page'}/%d/`;
  const pages = [{
    path: 'index.html',
    language_selector: true,
    data: languageSelector(
      `${root}ja/`,
      `${root}en/`,
      `${resolveSiteTitle(config, 'ja')} / ${resolveSiteTitle(config, 'en')}`,
    ),
  }];
  const localizedUrls = {};

  for (const language of languages) {
    localizedUrls[language] = `${language}/`;
    const posts = sortPosts(allPosts.filter(post => post.lang === language), indexConfig.order_by);
    pages.push(...pagination(`${language}/`, postQuery(posts), {
      perPage: indexConfig.per_page || config.per_page,
      format: paginationFormat,
      layout: ['index', 'archive'],
      data: pageData(language, {ja: `${root}ja/`, en: `${root}en/`}),
    }));
  }

  const slugPairs = new Map();
  allPosts.forEach(post => {
    if (!post.lang || !post.slug) return;
    const slug = post.slug.split('/').pop();
    const pair = slugPairs.get(slug) || {};
    pair[post.lang] = post;
    slugPairs.set(slug, pair);
  });
  slugPairs.forEach(pair => {
    if (pair.ja && pair.en) {
      pages.push({
        path: `${pair.ja.slug.split('/').pop()}/index.html`,
        data: languageSelector(
          `${root}${pair.ja.path}`,
          `${root}${pair.en.path}`,
          `${pair.ja.title} / ${pair.en.title}`,
        ),
      });
    }
  });

  const archiveConfig = config.archive_generator || {};
  const perPage = archiveConfig.per_page || config.per_page;
  const makeArchivePages = (language, posts) => {
    const archiveDir = config.archive_dir;
    const archiveRoot = `${language}/${archiveDir}/`;
    const urls = {ja: `${root}ja/${archiveDir}/`, en: `${root}en/${archiveDir}/`};
    const archivePages = pagination(archiveRoot, postQuery(sortPosts(posts, archiveConfig.order_by)), {
      perPage,
      layout: ['archive', 'index'],
      format: paginationFormat,
      data: pageData(language, urls, {archive: true}),
    });
    const byYear = new Map();
    posts.forEach(post => {
      const year = post.date.year();
      const month = post.date.month() + 1;
      const yearPosts = byYear.get(year) || new Map();
      const monthPosts = yearPosts.get(month) || [];
      monthPosts.push(post);
      yearPosts.set(month, monthPosts);
      byYear.set(year, yearPosts);
    });
    byYear.forEach((months, year) => {
      const yearPath = `${archiveRoot}${year}/`;
      const yearUrls = {
        ja: `${root}ja/${archiveDir}/${year}/`,
        en: `${root}en/${archiveDir}/${year}/`,
      };
      archivePages.push(...pagination(yearPath, postQuery(sortPosts([].concat(...months.values()), archiveConfig.order_by)), {
        perPage, layout: ['archive', 'index'], format: paginationFormat,
        data: pageData(language, yearUrls, {archive: true, year}),
      }));
      months.forEach((monthPosts, month) => {
        const monthPath = `${yearPath}${String(month).padStart(2, '0')}/`;
        const monthUrls = {
          ja: `${root}ja/${archiveDir}/${year}/${String(month).padStart(2, '0')}/`,
          en: `${root}en/${archiveDir}/${year}/${String(month).padStart(2, '0')}/`,
        };
        archivePages.push(...pagination(monthPath, postQuery(sortPosts(monthPosts, archiveConfig.order_by)), {
          perPage, layout: ['archive', 'index'], format: paginationFormat,
          data: pageData(language, monthUrls, {archive: true, year, month}),
        }));
      });
    });
    return archivePages;
  };

  const archivePagesByLanguage = {};
  for (const language of languages) {
    const posts = allPosts.filter(post => post.lang === language);
    archivePagesByLanguage[language] = makeArchivePages(language, posts);
    pages.push(...archivePagesByLanguage[language]);
  }
  if (archivePagesByLanguage.ja.length && archivePagesByLanguage.en.length) {
    const archiveUrls = {
      ja: `${root}ja/${config.archive_dir}/`,
      en: `${root}en/${config.archive_dir}/`,
    };
    const archiveTitle = `${resolveSiteTitle(config, 'ja')} / ${resolveSiteTitle(config, 'en')}`;
    addLanguageSelector(pages, root, config.archive_dir, {
      ja: `ja/${config.archive_dir}/`,
      en: `en/${config.archive_dir}/`,
    }, archiveTitle);
    const archivePeriods = new Set();
    allPosts.forEach(post => {
      archivePeriods.add(`${config.archive_dir}/${post.date.year()}/`);
      archivePeriods.add(`${config.archive_dir}/${post.date.year()}/${String(post.date.month() + 1).padStart(2, '0')}/`);
    });
    archivePeriods.forEach(period => addLanguageSelector(pages, root, period, {
      ja: `ja/${period}`,
      en: `en/${period}`,
    }, archiveTitle));
  }

  const makeTaxonomyPages = (language, collection, directory, type) => {
    const posts = allPosts.filter(post => post.lang === language);
    const urls = {
      ja: `${root}ja/${directory}/`,
      en: `${root}en/${directory}/`,
    };
    const result = [];
    collection.forEach(item => {
      const itemPosts = posts.filter(post => {
        const values = type === 'category' ? post.categories : post.tags;
        return values.some(value => value.name === item.name);
      });
      if (!itemPosts.length) return;
      const basePath = `${language}/${item.path}`;
      const itemUrls = {
        ja: `${root}ja/${item.path}`,
        en: `${root}en/${item.path}`,
      };
      result.push(...pagination(basePath, postQuery(sortPosts(itemPosts)), {
        perPage: config[`${type}_generator`]?.per_page || config.per_page,
        layout: [type, 'archive', 'index'],
        format: paginationFormat,
        data: pageData(language, itemUrls, {[type]: item.name}),
      }));
    });
    return result;
  };

  for (const [collectionName, directory, type] of [
    ['categories', config.category_dir, 'category'],
    ['tags', config.tag_dir, 'tag'],
  ]) {
    const collection = this.locals.get(collectionName);
    const localized = {};
    for (const language of languages) {
      localized[language] = makeTaxonomyPages(language, collection, directory, type);
      pages.push(...localized[language]);
    }
    collection.forEach(item => {
      if (localized.ja.some(page => page.path.includes(`/${item.path}`)) &&
          localized.en.some(page => page.path.includes(`/${item.path}`))) {
        addLanguageSelector(pages, root, item.path, {
          ja: `ja/${item.path}`,
          en: `en/${item.path}`,
        }, `${item.name} - ${resolveSiteTitle(config, 'ja')} / ${resolveSiteTitle(config, 'en')}`);
      }
    });
  }

  return pages;
});

hexo.extend.generator.register('seo-files', function () {
  const config = this.config;
  const allPosts = this.locals.get('posts').toArray();
  const allPages = this.locals.get('pages').toArray();
  const generatedPages = [];
  const addPage = (path, lastmod) => {
    if (!path) return;
    const normalized = String(path).replace(/^\/+/, '');
    if (!normalized || normalized.includes('/page/')) return;
    generatedPages.push({path: normalized, lastmod});
  };

  languages.forEach(language => addPage(`${language}/`));
  [...allPosts, ...allPages]
    .filter(page => page.lang === 'ja' || page.lang === 'en')
    .forEach(page => addPage(page.path, page.updated || page.date));

  for (const language of languages) {
    const posts = allPosts.filter(post => post.lang === language);
    if (posts.length) addPage(`${language}/${config.archive_dir}/`);
    const years = new Map();
    posts.forEach(post => {
      const year = post.date.year();
      const month = post.date.month() + 1;
      const months = years.get(year) || new Set();
      months.add(month);
      years.set(year, months);
    });
    years.forEach((months, year) => {
      addPage(`${language}/${config.archive_dir}/${year}/`);
      months.forEach(month => addPage(
        `${language}/${config.archive_dir}/${year}/${String(month).padStart(2, '0')}/`,
      ));
    });

    for (const [collectionName, directory, type] of [
      ['categories', config.category_dir, 'category'],
      ['tags', config.tag_dir, 'tag'],
    ]) {
      const names = new Set();
      posts.forEach(post => {
        const values = type === 'category' ? post.categories : post.tags;
        values.forEach(value => names.add(value.name));
      });
      names.forEach(name => addPage(
        `${language}/${directory}/${encodeURIComponent(name)}/`,
      ));
    }
  }

  const uniquePages = new Map(generatedPages.map(page => [page.path, page]));
  const urls = [...uniquePages.values()].map(({path, lastmod}) => {
    const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : '';
    return `  <url>\n    <loc>${escapeXml(absoluteUrl(config, path))}</loc>${lastmodTag}\n  </url>`;
  }).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  const sitemapUrl = absoluteUrl(config, 'sitemap.xml');
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return [
    {path: 'sitemap.xml', data: sitemap},
    {path: 'robots.txt', data: robots},
  ];
});

hexo.extend.generator.register('multilingual-rss', function () {
  const config = this.config;
  const allPosts = this.locals.get('posts').toArray();

  return languages.map(language => ({
    path: `${language}/rss.xml`,
    data: rssFeed(config, language, sortPosts(
      allPosts.filter(post => post.lang === language),
      '-date',
    )),
  }));
});

// Replace the standard generators so they cannot emit unfiltered duplicate routes.
hexo.extend.generator.register('archive', () => []);
hexo.extend.generator.register('category', () => []);
hexo.extend.generator.register('tag', () => []);

hexo.extend.filter.register('before_generate', () => {
  hexo.extend.generator.register('archive', () => []);
  hexo.extend.generator.register('category', () => []);
  hexo.extend.generator.register('tag', () => []);
});

// RSS feed requires `description` on every post (used verbatim as the item
// description); missing values would otherwise silently fall back to an
// empty <description> tag or leak raw HTML content into the feed.
//
// `description` must stay plain text: it is XML-escaped, not wrapped in
// CDATA, so any HTML tags would show up as literal escaped text (e.g.
// `&lt;b&gt;`) in feed readers instead of being rendered. This regex is a
// heuristic, not a full HTML parser — it flags anything that looks like an
// opening/closing tag (`<name ...>` / `</name>`) and may produce false
// positives for things like generic type notation (`<T>`) or comparisons
// (`A<B`). Adjust the wording if that becomes a real problem.
const HTML_TAG_PATTERN = /<\/?[a-z][a-z0-9-]*(\s[^<>]*)?>/i;

hexo.extend.filter.register('before_generate', () => {
  const posts = hexo.locals.get('posts').toArray();
  const missing = posts
    .filter(post => post.lang && !post.description)
    .map(post => post.source);

  if (missing.length) {
    throw new Error(
      `RSS の description が未設定の記事があります。front matter に description を追加してください:\n${missing.map(path => `  - ${path}`).join('\n')}`,
    );
  }

  const htmlLike = posts
    .filter(post => post.lang && post.description && HTML_TAG_PATTERN.test(post.description))
    .map(post => post.source);

  if (htmlLike.length) {
    throw new Error(
      `description に HTML タグらしき記述を検出しました。description はプレーンテキストで記述してください (誤検知の場合は表現を調整してください):\n${htmlLike.map(path => `  - ${path}`).join('\n')}`,
    );
  }
});
