const normalizePostDates = require('./post-date-normalizer');

// Project processors run after Hexo's built-in post processor and before generators.
hexo.extend.processor.register(/^_posts\/.*\.(?:md|markdown)$/i, async file => {
  if (file.type === 'skip') return;

  const post = hexo.model('Post').findOne({source: file.path});
  if (!post) return;

  normalizePostDates([post], hexo.config.timezone, hexo.extend.helper.get('moment'));
  await post.save();
});
