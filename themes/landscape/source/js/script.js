(function($){
  // Search
  var $searchWrap = $('#search-form-wrap'),
    $searchInput = $('.search-form-input'),
    $searchSubmit = $('.search-form-submit'),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function(){
    isSearchAnim = true;
  };

  var stopSearchAnim = function(callback){
    setTimeout(function(){
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  var setSearchFocusable = function(isFocusable){
    var tabIndex = isFocusable ? '0' : '-1';
    $searchInput.attr('tabindex', tabIndex);
    $searchSubmit.attr('tabindex', tabIndex);
  };

  $('.nav-search-btn').on('click', function(){
    if (isSearchAnim) return;

    startSearchAnim();
    $searchWrap.addClass('on');
    setSearchFocusable(true);
    stopSearchAnim(function(){
      $searchInput.focus();
    });

  });

  $searchInput.on('blur', function(e){
    if (e.relatedTarget && $(e.relatedTarget).closest('.nav-search-btn').length) return;
    startSearchAnim();
    $searchWrap.removeClass('on');
    stopSearchAnim(function(){
      setSearchFocusable(false);
    });
  });

  $searchInput.on('keydown', function(e){
    if (e.key !== 'Escape') return;

    e.preventDefault();
    startSearchAnim();
    $searchWrap.removeClass('on');
    stopSearchAnim(function(){
      setSearchFocusable(false);
      $('.nav-search-btn').focus();
    });
  });

  setSearchFocusable(false);

  // Language menu
  var $languageSwitcher = $('.language-switcher'),
    $languageButton = $('.language-switcher-button'),
    $languageMenu = $('.language-switcher-menu');

  var closeLanguageMenu = function(){
    $languageButton.attr('aria-expanded', 'false');
    $languageMenu.prop('hidden', true);
    $languageMenu.find('[role="menuitem"]').attr('tabindex', '-1');
  };

  var enableLanguageMenuItems = function(){
    $languageMenu.find('[role="menuitem"]').each(function(){
      var $item = $(this);
      $item.attr('tabindex', $item.attr('aria-disabled') === 'true' ? '-1' : '0');
    });
  };

  $languageButton.on('click', function(){
    var isOpen = $(this).attr('aria-expanded') === 'true';
    $(this).attr('aria-expanded', String(!isOpen));
    $languageMenu.prop('hidden', isOpen);
    if (!isOpen) {
      enableLanguageMenuItems();
      $languageMenu.find('[role="menuitem"]:not([aria-disabled="true"])').first().focus();
    } else {
      closeLanguageMenu();
    }
  });

  $languageButton.on('keydown', function(e){
    if (e.key === 'Escape' && $(this).attr('aria-expanded') === 'true') {
      e.preventDefault();
      closeLanguageMenu();
    }
  });

  $languageMenu.on('keydown', '[role="menuitem"]', function(e){
    var $items = $languageMenu.find('[role="menuitem"]:not([aria-disabled="true"])'),
      index = $items.index(this);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      $items.eq((index + (e.key === 'ArrowDown' ? 1 : -1) + $items.length) % $items.length).focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeLanguageMenu();
      $languageButton.focus();
    }
  });

  $(document).on('click', function(e){
    if ($languageSwitcher.length && !$(e.target).closest('.language-switcher').length) closeLanguageMenu();
  });

  closeLanguageMenu();

  // Share
  $('body').on('click', function(){
    $('.article-share-box.on').removeClass('on');
  }).on('click', '.article-share-link', function(e){
    e.stopPropagation();

    var $this = $(this),
      url = $this.attr('data-url'),
      encodedUrl = encodeURIComponent(url),
      id = 'article-share-box-' + $this.attr('data-id'),
      title = $this.attr('data-title'),
      offset = $this.offset();

    if ($('#' + id).length){
      var box = $('#' + id);

      if (box.hasClass('on')){
        box.removeClass('on');
        return;
      }
    } else {
      var html = [
        '<div id="' + id + '" class="article-share-box">',
          '<input class="article-share-input" value="' + url + '">',
          '<div class="article-share-links">',
            '<a href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"><span class="fa fa-twitter"></span></a>',
            '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"><span class="fa fa-facebook"></span></a>',
            '<a href="http://pinterest.com/pin/create/button/?url=' + encodedUrl + '" class="article-share-pinterest" target="_blank" title="Pinterest"><span class="fa fa-pinterest"></span></a>',
            '<a href="https://www.linkedin.com/shareArticle?mini=true&url=' + encodedUrl + '" class="article-share-linkedin" target="_blank" title="LinkedIn"><span class="fa fa-linkedin"></span></a>',
          '</div>',
        '</div>'
      ].join('');

      var box = $(html);

      $('body').append(box);
    }

    $('.article-share-box.on').hide();

    box.css({
      top: offset.top + 25,
      left: offset.left
    }).addClass('on');
  }).on('click', '.article-share-box', function(e){
    e.stopPropagation();
  }).on('click', '.article-share-box-input', function(){
    $(this).select();
  }).on('click', '.article-share-box-link', function(e){
    e.preventDefault();
    e.stopPropagation();

    window.open(this.href, 'article-share-box-window-' + Date.now(), 'width=500,height=450');
  });

  // Caption
  $('.article-entry').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox') || $(this).parent().is('a')) return;

      var alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a href="' + this.src + '" data-fancybox=\"gallery\" data-caption="' + alt + '"></a>')
    });

    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
  });

  if ($.fancybox){
    $('.fancybox').fancybox();
  }

  // Remove heading anchors from tab order
  $('.article-entry .headerlink').attr('tabindex', '-1');

  // Code block actions
  var codeBlockLanguageLabels = {
      'bash': 'Bash',
      'csharp': 'C#',
      'css': 'CSS',
      'html': 'HTML',
      'http-request': 'HTTP Request',
      'http-response': 'HTTP Response',
      'java': 'Java',
      'javascript': 'JavaScript',
      'json': 'JSON',
      'markdown': 'Markdown',
      'powershell': 'PowerShell',
      'python': 'Python',
      'shell': 'Shell',
      'sql': 'SQL',
      'typescript': 'TypeScript',
      'xml': 'XML',
      'yaml': 'YAML'
    },
    isJapanesePage = window.location.pathname.indexOf('/ja/') === 0,
    codeBlockLabels = isJapanesePage ? {
      copy: 'コピー',
      copied: 'コピーしました',
      copyFailed: 'コピーに失敗しました',
      selectAll: 'すべて選択',
      toolbar: 'コード ブロックの操作',
      language: '言語'
    } : {
      copy: 'Copy',
      copied: 'Copied!',
      copyFailed: 'Copy failed',
      selectAll: 'Select all',
      toolbar: 'Code block actions',
      language: 'Language'
    };

  var getCodeLanguage = function($block, $code){
    var classes = (($block.attr('class') || '') + ' ' + ($code.attr('class') || '')).split(/\s+/),
      language;

    $.each(classes, function(i, className){
      var match = className.match(/^(?:lang|language)-(.+)$/);
      if (match) language = match[1].toLowerCase();
      if (codeBlockLanguageLabels[className]) language = className;
    });

    if (!language) return codeBlockLabels.language;
    if (language === 'js') language = 'javascript';
    if (language === 'ps') language = 'powershell';
    if (language === 'sh') language = 'shell';
    if (codeBlockLanguageLabels[language]) return codeBlockLanguageLabels[language];

    return language.split(/[-_]/).map(function(part){
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
  };

  var getCodeText = function(codeTarget){
    var text = typeof codeTarget.innerText === 'string'
      ? codeTarget.innerText
      : codeTarget.textContent;
    return text.replace(/\r\n?/g, '\n').replace(/\n$/, '');
  };

  var copyCodeWithFallback = function(text){
    return new Promise(function(resolve, reject){
      var $textarea = $('<textarea>')
        .val(text)
        .attr({
          'aria-hidden': 'true',
          tabindex: '-1'
        })
        .css({
          position: 'fixed',
          left: '-9999px',
          top: '0'
        })
        .appendTo('body');
      $textarea[0].select();
      var copied;
      try {
        copied = document.execCommand('copy');
      } finally {
        $textarea.remove();
      }
      if (copied) {
        resolve();
      } else {
        reject(new Error('The browser could not copy the code block.'));
      }
    });
  };

  var copyCode = function(text){
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text).catch(function(){
        return copyCodeWithFallback(text);
      });
    }

    return copyCodeWithFallback(text);
  };

  var selectCode = function(codeTarget){
    var selection = window.getSelection(),
      range = document.createRange();
    range.selectNodeContents(codeTarget);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  var enableCodeScrolling = function($codeTarget){
    if ($codeTarget.parent().hasClass('code-block-scroll')) return;
    $codeTarget.wrap($('<div>', {class: 'code-block-scroll'}));
    $codeTarget.parent()
      .on('focusin', function(){
        $(this).addClass('is-focused');
      })
      .on('focusout', function(){
        $(this).removeClass('is-focused');
      });
  };

  var createCodeBlockHeader = function($block, $code, codeTarget){
    if ($block.is('pre') && $block.prev('.code-block-header').length) return;
    if (!$block.is('pre') && $block.children('.code-block-header').length) return;

    var $header = $('<div>', {
        class: 'code-block-header',
        role: 'toolbar',
        'aria-label': codeBlockLabels.toolbar
      }),
      $language = $('<span>', {
        class: 'code-block-language',
        text: getCodeLanguage($block, $code)
      }),
      $actions = $('<span>', {class: 'code-block-actions'}),
      $copyButton = $('<button>', {
        type: 'button',
        class: 'code-block-action',
        'aria-label': codeBlockLabels.copy
      }),
      $selectButton = $('<button>', {
        type: 'button',
        class: 'code-block-action',
        'aria-label': codeBlockLabels.selectAll
      });

    $copyButton.append($('<span>', {
      class: 'fa fa-copy',
      'aria-hidden': 'true'
    })).append($('<span>', {
      class: 'code-block-action-label',
      text: codeBlockLabels.copy
    }));
    $selectButton.append($('<span>', {
      class: 'fa fa-i-cursor',
      'aria-hidden': 'true'
    })).append($('<span>', {
      class: 'code-block-action-label',
      text: codeBlockLabels.selectAll
    }));

    $copyButton.on('click', function(){
      var $label = $(this).find('.code-block-action-label');
      copyCode(getCodeText(codeTarget)).then(function(){
        $label.text(codeBlockLabels.copied);
        $copyButton.attr('aria-label', codeBlockLabels.copied);
        setTimeout(function(){
          $label.text(codeBlockLabels.copy);
          $copyButton.attr('aria-label', codeBlockLabels.copy);
        }, 2000);
      }, function(){
        $label.text(codeBlockLabels.copyFailed);
        $copyButton.attr('aria-label', codeBlockLabels.copyFailed);
      });
    });
    $selectButton.on('click', function(){
      selectCode(codeTarget);
    });

    $actions.append($copyButton, $selectButton);
    $header.append($language, $actions);
    if ($block.is('pre')) {
      $header.insertBefore($block);
    } else {
      $block.prepend($header);
    }
  };

  $('.article-entry figure.highlight').each(function(){
    var $figure = $(this),
      $codeTarget = $figure.find('td.code > pre').first(),
      $code = $codeTarget.find('code').first();
    if ($codeTarget.length) {
      enableCodeScrolling($codeTarget);
      createCodeBlockHeader($figure, $code, $codeTarget[0]);
    }
  });

  $('.article-entry pre > code').each(function(){
    var $code = $(this),
      $pre = $code.parent();
    if (!$pre.closest('figure.highlight, .gist').length) {
      createCodeBlockHeader($pre, $code, $pre[0]);
    }
  });

  // Mobile nav
  var $container = $('#container'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function(){
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function(){
    setTimeout(function(){
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  }

  $('#main-nav-toggle').on('click', function(){
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $container.toggleClass('mobile-nav-on');
    $(this).attr('aria-expanded', String($container.hasClass('mobile-nav-on')));
    stopMobileNavAnim();
  });

  $('#wrap').on('click', function(){
    if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

    $container.removeClass('mobile-nav-on');
    $('#main-nav-toggle').attr('aria-expanded', 'false');
  });
})(jQuery);