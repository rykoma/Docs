const millisecondsPerMinute = 60 * 1000;

function normalizePostDates(posts, timezone, moment) {
  const zone = moment.tz.zone(timezone);
  if (!zone) throw new Error(`Unknown timezone in Hexo configuration: ${timezone}`);

  for (const post of posts) {
    const normalizedDates = {};
    for (const key of ['date', 'updated']) {
      const date = post[key];
      const isMoment = moment.isMoment(date);
      if ((!isMoment && !(date instanceof Date)) || Number.isNaN(date.valueOf())) {
        throw new TypeError(`Expected a valid ${key} Date for ${post.source || post.slug || 'an unnamed post'}`);
      }

      const timestamp = date.valueOf();
      const offset = zone.utcOffset(timestamp);
      if (!Number.isFinite(offset)) {
        throw new Error(`Could not determine the ${timezone} offset for ${post.source || post.slug || 'an unnamed post'}`);
      }

      // Restore the original instant after Hexo's timezone adjustment.
      normalizedDates[key] = isMoment
        ? date.clone().subtract(offset, 'minutes')
        : new Date(timestamp - offset * millisecondsPerMinute);
    }

    Object.assign(post, normalizedDates);
  }
}

module.exports = normalizePostDates;
