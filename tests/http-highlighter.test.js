const assert = require('node:assert/strict');
const test = require('node:test');
const {renderHttpBlock} = require('../scripts/http-highlighter');

const context = {
  config: {
    highlight: {
      line_number: true,
    },
  },
};

test('highlights request methods and header values without changing HTTP structure', () => {
  const html = renderHttpBlock([
    'POST https://example.com/comments',
    'Content-Type: application/json',
    'X-Request-Id: 123',
    '',
    '{"message":"Hello"}',
  ].join('\n'), 'http-request', context);

  assert.match(html, /http-method-post">POST<\/span>/);
  assert.match(html, /Content-Type: <span class="http-header-value">application\/json<\/span>/);
  assert.match(html, /X-Request-Id: <span class="http-header-value">123<\/span>/);
  assert.match(html, /class="attr">&quot;message&quot;<\/span>/);
  assert.match(html, /<span class="line"><\/span><br>/);
});

test('highlights response status families and leaves non-JSON bodies plain', () => {
  const html = renderHttpBlock([
    'HTTP/1.1 404 Not Found',
    'Content-Type: text/plain',
    '',
    '<not-json>',
  ].join('\n'), 'http-response', context);

  assert.match(html, /http-status-4xx">404<\/span>/);
  assert.match(html, /Content-Type: <span class="http-header-value">text\/plain<\/span>/);
  assert.match(html, /&lt;not-json&gt;/);
  assert.doesNotMatch(html, /class="attr"/);
});

test('keeps other highlighters delegated to the default implementation', () => {
  const calls = [];
  const store = {
    'highlight.js': function (code, options) {
      calls.push({code, options, context: this});
      return 'default-highlight';
    },
  };
  const fakeHexo = {
    extend: {
      highlight: {
        query: name => store[name],
        register: (name, fn) => {
          store[name] = fn;
        },
      },
    },
  };

  require('../scripts/http-highlighter').registerHttpHighlighters(fakeHexo);
  const result = store['highlight.js'].call(context, 'const value = 1;', {lang: 'javascript'});

  assert.equal(result, 'default-highlight');
  assert.deepEqual(calls[0], {
    code: 'const value = 1;',
    options: {lang: 'javascript'},
    context,
  });
});
