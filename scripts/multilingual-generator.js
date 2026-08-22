const pagination = require('hexo-pagination');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const languageSelector = (jaUrl, enUrl, title) => {
  const serializedJaUrl = JSON.stringify(jaUrl);
  const serializedEnUrl = JSON.stringify(enUrl);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
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

hexo.extend.generator.register('multilingual-pages', function () {
  const root = this.config.root.endsWith('/') ? this.config.root : `${this.config.root}/`;
  const posts = this.locals.get('posts');
  const jaUrl = `${root}ja/`;
  const enUrl = `${root}en/`;
  const indexConfig = this.config.index_generator || {};
  const paginationFormat = `${this.config.pagination_dir || 'page'}/%d/`;
  const pages = [
    {
      path: 'index.html',
      data: languageSelector(jaUrl, enUrl, this.config.title),
    },
  ];

  for (const language of ['ja', 'en']) {
    const languagePosts = posts
      .filter(post => post.lang === language)
      .sort(indexConfig.order_by || '-date');
    pages.push(...pagination(`${language}/`, languagePosts, {
      perPage: indexConfig.per_page || this.config.per_page,
      format: paginationFormat,
      layout: ['index', 'archive'],
      data: {
        language,
        language_switcher: {
          ja: jaUrl,
          en: enUrl,
        },
      },
    }));
  }

  const postsForPairing = posts.toArray();
  const slugs = new Map();
  postsForPairing.forEach((post) => {
    if (!post.lang || !post.slug) {
      return;
    }

    const slug = post.slug.split('/').pop();
    if (!slugs.has(slug)) {
      slugs.set(slug, {});
    }
    slugs.get(slug)[post.lang] = post;
  });

  slugs.forEach((localizedPosts, slug) => {
    const jaPost = localizedPosts.ja;
    const enPost = localizedPosts.en;
    if (jaPost && enPost) {
      pages.push({
        path: `${slug}/index.html`,
        data: languageSelector(
          `${root}${jaPost.path}`,
          `${root}${enPost.path}`,
          `${jaPost.title} / ${enPost.title}`,
        ),
      });
    }
  });

  return pages;
});
