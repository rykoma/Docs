'use strict';

const {highlight: highlightWithHexo} = require('hexo-util');

const requestMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const headerPattern = /^([!#$%&'*+\-.^_`|~0-9A-Za-z]+)(:[ \t]*)(.*)$/;

const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const requestMethodClass = method => `http-method-${method.toLowerCase()}`;

const responseStatusClass = status => {
  const family = Math.floor(Number(status) / 100);
  return {
    2: 'http-status-2xx',
    3: 'http-status-3xx',
    4: 'http-status-4xx',
    5: 'http-status-5xx',
  }[family];
};

const renderRequestLine = line => {
  const match = line.match(/^(\s*)(GET|POST|PUT|PATCH|DELETE)(?=\s|$)(.*)$/i);
  if (!match || !requestMethods.has(match[2].toUpperCase())) return escapeHtml(line);

  return `${escapeHtml(match[1])}<span class="${requestMethodClass(match[2])}">${escapeHtml(match[2])}</span>${escapeHtml(match[3])}`;
};

const renderResponseLine = line => {
  const versioned = line.match(/^(\s*)(HTTP\/\d(?:\.\d)?)(\s+)(\d{3})(.*)$/i);
  const bare = line.match(/^(\s*)(\d{3})(.*)$/);
  const match = versioned || bare;
  if (!match) return escapeHtml(line);

  const statusIndex = versioned ? 4 : 2;
  const status = match[statusIndex];
  const className = responseStatusClass(status);
  if (!className) return escapeHtml(line);

  const prefix = match.slice(1, statusIndex).map(escapeHtml).join('');
  return `${prefix}<span class="${className}">${escapeHtml(status)}</span>${escapeHtml(match[statusIndex + 1])}`;
};

const renderHeaderLine = line => {
  const match = line.match(headerPattern);
  if (!match) return escapeHtml(line);

  return `${escapeHtml(match[1])}${escapeHtml(match[2])}<span class="http-header-value">${escapeHtml(match[3])}</span>`;
};

const highlightJsonLines = bodyLines => {
  const body = bodyLines.join('\n');
  if (!body.trim()) return null;

  try {
    JSON.parse(body);
  } catch {
    return null;
  }

  const highlighted = highlightWithHexo(body, {
    lang: 'json',
    gutter: false,
    hljs: false,
    stripIndent: false,
    wrap: false,
  });
  const match = highlighted.match(/^<pre><code class="[^"]*">([\s\S]*)<\/code><\/pre>$/);
  if (!match) return null;

  const lines = match[1].split('\n');
  return lines.length === bodyLines.length ? lines : null;
};

const renderHttpBlock = (code, language, context, options = {}) => {
  const normalized = String(code).replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const blankLine = lines.findIndex((line, index) => index > 0 && line === '');
  const headerEnd = blankLine === -1 ? lines.length : blankLine;
  const bodyLines = blankLine === -1 ? [] : lines.slice(blankLine + 1);
  const jsonBodyLines = highlightJsonLines(bodyLines);
  const renderedLines = [];

  renderedLines.push(language === 'http-request'
    ? renderRequestLine(lines[0] || '')
    : renderResponseLine(lines[0] || ''));

  for (const line of lines.slice(1, headerEnd)) {
    renderedLines.push(renderHeaderLine(line));
  }

  if (blankLine !== -1) {
    renderedLines.push('');
    const sourceBodyLines = jsonBodyLines || bodyLines.map(escapeHtml);
    renderedLines.push(...sourceBodyLines);
  }

  const highlightConfig = context?.config?.highlight || {};
  const showLineNumbers = typeof options.line_number === 'undefined'
    ? highlightConfig.line_number !== false
    : options.line_number;
  const firstLine = Number(options.firstLine || 1) || 1;
  const markedLines = Array.isArray(options.mark) ? options.mark : [];
  const lineContent = renderedLines.map((line, index) => {
    const lineNumber = firstLine + index;
    const marked = markedLines.includes(lineNumber) ? ' marked' : '';
    return `<span class="line${marked}">${line}</span><br>`;
  }).join('');

  if (options.wrap === false) {
    return `<pre><code class="highlight ${language}">${renderedLines.join('\n')}</code></pre>`;
  }

  const gutter = showLineNumbers
    ? `<td class="gutter"><pre>${renderedLines.map((_, index) =>
      `<span class="line">${firstLine + index}</span><br>`).join('')}</pre></td>`
    : '';
  return `<figure class="highlight ${language}"><table><tr>${gutter}<td class="code"><pre>${lineContent}</pre></td></tr></table></figure>`;
};

const registerHttpHighlighters = hexoInstance => {
  const defaultHighlighter = hexoInstance.extend.highlight.query('highlight.js');
  if (!defaultHighlighter) {
    throw new Error('The default highlight.js highlighter is not registered');
  }

  hexoInstance.extend.highlight.register('highlight.js', function (code, options = {}) {
    if (options.lang === 'http-request' || options.lang === 'http-response') {
      return renderHttpBlock(code, options.lang, this, options);
    }
    return defaultHighlighter.call(this, code, options);
  });
};

if (typeof hexo !== 'undefined') {
  registerHttpHighlighters(hexo);
}

module.exports = {
  highlightJsonLines,
  registerHttpHighlighters,
  renderHttpBlock,
};
