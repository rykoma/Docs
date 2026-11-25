const googleAnalyticsTag = (measurementId) => {
  if (!measurementId) return '';
  if (typeof measurementId !== 'string' || !/^G-[A-Z0-9]+$/.test(measurementId)) {
    throw new Error(`Invalid Google Analytics measurement ID: ${measurementId}`);
  }

  const serializedId = JSON.stringify(measurementId);
  return `<!-- Google Analytics -->
<script>
  if (window.location.hostname === 'blog.rykoma.net') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', ${serializedId});

    var analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(${serializedId});
    document.head.appendChild(analyticsScript);
  }
</script>
<!-- End Google Analytics -->`;
};

module.exports = googleAnalyticsTag;
