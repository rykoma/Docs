const googleAdsenseTag = (adsense, siteUrl) => {
  if (!adsense) return '';

  const publisherId = adsense.publisher_id;
  if (typeof publisherId !== 'string' || !/^ca-pub-\d+$/.test(publisherId)) {
    throw new Error(`Invalid Google AdSense publisher ID: ${publisherId}`);
  }

  let site;
  try {
    site = new URL(siteUrl);
  } catch {
    throw new Error(`Invalid site URL for Google AdSense: ${siteUrl}`);
  }
  if (site.origin !== 'https://blog.rykoma.net') return '';

  const serializedId = JSON.stringify(publisherId);
  return `<!-- Google AdSense -->
<script>
  if (window.location.hostname === 'blog.rykoma.net') {
    var adsenseScript = document.createElement('script');
    adsenseScript.async = true;
    adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(${serializedId});
    adsenseScript.crossOrigin = 'anonymous';
    document.head.appendChild(adsenseScript);
  }
</script>
<!-- End Google AdSense -->`;
};

module.exports = googleAdsenseTag;
