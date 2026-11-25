const assert = require('node:assert/strict');
const test = require('node:test');
const googleAnalyticsTag = require('../scripts/google-analytics');

test('omits analytics when no measurement ID is configured', () => {
  assert.equal(googleAnalyticsTag(), '');
});

test('loads analytics only on the production hostname', () => {
  const html = googleAnalyticsTag('G-HMDMWWKBVY');

  assert.match(html, /window\.location\.hostname === 'blog\.rykoma\.net'/);
  assert.match(html, /window\.gtag\('config', "G-HMDMWWKBVY"\)/);
  assert.match(html, /analyticsScript\.src = 'https:\/\/www\.googletagmanager\.com\/gtag\/js\?id='/);
  assert.ok(html.indexOf("hostname === 'blog.rykoma.net'") < html.indexOf('analyticsScript.src'));
  assert.doesNotMatch(html, /<script async src=/);
});

test('rejects malformed measurement IDs', () => {
  assert.throws(() => googleAnalyticsTag('not-a-measurement-id'), /Invalid Google Analytics measurement ID/);
});
