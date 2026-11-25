const assert = require('node:assert/strict');
const test = require('node:test');
const googleAdsenseTag = require('../scripts/google-adsense');

const adsense = {publisher_id: 'ca-pub-6208566823743408'};

test('omits the AdSense loader when no publisher is configured', () => {
  assert.equal(googleAdsenseTag(), '');
});

test('loads AdSense only for the production site and browser hostname', () => {
  const html = googleAdsenseTag(adsense, 'https://blog.rykoma.net');

  assert.match(html, /window\.location\.hostname === 'blog\.rykoma\.net'/);
  assert.match(html, /adsenseScript\.src = 'https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client='/);
  assert.match(html, /encodeURIComponent\("ca-pub-6208566823743408"\)/);
  assert.match(html, /adsenseScript\.crossOrigin = 'anonymous'/);
  assert.ok(html.indexOf("hostname === 'blog.rykoma.net'") < html.indexOf('adsenseScript.src'));
});

test('omits the loader from project-site builds', () => {
  assert.equal(googleAdsenseTag(adsense, 'https://rykoma.github.io/Docs'), '');
});

test('rejects malformed publisher IDs', () => {
  assert.throws(
    () => googleAdsenseTag({publisher_id: 'pub-123'}, 'https://blog.rykoma.net'),
    /Invalid Google AdSense publisher ID/,
  );
});

test('rejects malformed site URLs', () => {
  assert.throws(() => googleAdsenseTag(adsense, 'not-a-url'), /Invalid site URL/);
});
