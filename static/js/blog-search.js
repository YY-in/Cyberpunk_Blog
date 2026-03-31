/**
 * blog-search.js - Blog enhancement features (tag filter, search, reading time)
 * Cyberpunk-styled, vanilla JS.
 */
(function () {
  'use strict';

  function isLight() {
    return document.documentElement.classList.contains('light');
  }

  function getColors() {
    var light = isLight();
    return {
      yellow: light ? '#d92323' : '#f5e642',
      cyan:   light ? '#0d0d0d' : '#00d4ff',
      pink:   light ? '#732424' : '#ff2d78',
      bg:     light ? '#faf7f3' : '#131318'
    };
  }

  var COLORS = getColors();

  /* ========== Inject shared styles ========== */
  function injectStyles() {
    // Re-check theme at injection time (DOM is ready by now)
    COLORS = getColors();
    if (document.getElementById('blog-enhance-styles')) return;
    var style = document.createElement('style');
    style.id = 'blog-enhance-styles';
    style.textContent = [
      '.blog-tag-btn {',
      '  display:inline-block; padding:4px 10px; margin:0 6px 6px 0;',
      '  font-family:"Share Tech Mono",monospace; font-size:10px;',
      '  text-transform:uppercase; letter-spacing:0.1em; cursor:pointer;',
      '  background:transparent; color:' + COLORS.yellow + ';',
      '  border:1px solid ' + COLORS.yellow + '40;',
      '  transition:all .2s;',
      '}',
      '.blog-tag-btn:hover, .blog-tag-btn.active {',
      '  background:' + COLORS.yellow + '18; border-color:' + COLORS.yellow + ';',
      '  color:#fff;',
      '}',
      '.blog-search-input {',
      '  display:block; width:100%; padding:10px 14px;',
      '  font-family:"Share Tech Mono",monospace; font-size:13px;',
      '  letter-spacing:0.08em; text-transform:uppercase;',
      '  background:transparent; color:#fff;',
      '  border:none; border-bottom:2px solid ' + COLORS.cyan + ';',
      '  outline:none; box-sizing:border-box;',
      '}',
      '.blog-search-input::placeholder { color:' + COLORS.cyan + '80; }',
      '.blog-search-count {',
      '  font-family:"Share Tech Mono",monospace; font-size:10px;',
      '  color:' + COLORS.cyan + '; letter-spacing:0.1em; margin-top:6px;',
      '}',
      '.blog-reading-time {',
      '  display:inline-block; font-family:"Share Tech Mono",monospace;',
      '  font-size:10px; color:' + COLORS.cyan + ';',
      '  letter-spacing:0.1em; text-transform:uppercase; margin-left:12px;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ========== Tag Filter System ========== */
  var BlogTags = {};

  BlogTags.init = function () {
    // Only run on blog listing page
    var entries = document.querySelectorAll('a[href^="/blog/"][data-tags]');
    if (!entries.length) return;

    injectStyles();

    // Gather all tags
    var tagSet = {};
    entries.forEach(function (el) {
      var raw = el.getAttribute('data-tags');
      if (!raw) return;
      raw.split(',').forEach(function (t) {
        t = t.trim().toLowerCase();
        if (t) tagSet[t] = true;
      });
    });

    var tags = Object.keys(tagSet).sort();
    if (!tags.length) return;

    // Create filter bar
    var bar = document.createElement('div');
    bar.style.cssText = 'margin-bottom:16px;padding:8px 0;';

    var allBtn = document.createElement('button');
    allBtn.className = 'blog-tag-btn active';
    allBtn.textContent = 'ALL';
    bar.appendChild(allBtn);

    var tagBtns = [];
    tags.forEach(function (tag) {
      var btn = document.createElement('button');
      btn.className = 'blog-tag-btn';
      btn.textContent = tag;
      btn.setAttribute('data-tag', tag);
      bar.appendChild(btn);
      tagBtns.push(btn);
    });

    // Insert before the entries container
    var entriesParent = entries[0].parentElement;
    entriesParent.parentElement.insertBefore(bar, entriesParent);

    var activeTag = null;

    function filterByTag(tag) {
      activeTag = tag;
      allBtn.classList.toggle('active', !tag);
      tagBtns.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-tag') === tag);
      });
      entries.forEach(function (el) {
        var elTags = (el.getAttribute('data-tags') || '').toLowerCase().split(',').map(function (s) { return s.trim(); });
        if (!tag || elTags.indexOf(tag) !== -1) {
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });
    }

    allBtn.addEventListener('click', function () { filterByTag(null); });
    tagBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterByTag(btn.getAttribute('data-tag'));
      });
    });
  };

  /* ========== Search Bar ========== */
  var BlogSearch = {};

  BlogSearch.init = function () {
    // Only on blog listing page - find entry links
    var entries = document.querySelectorAll('a[href^="/blog/"]');
    if (!entries.length) return;

    // Make sure we're on the listing page (multiple entries or space-y container)
    var container = entries[0].parentElement;
    if (!container || !container.classList.contains('space-y-6')) return;

    injectStyles();

    // Create search wrapper
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom:20px;';

    var bracketLeft = document.createElement('span');
    bracketLeft.textContent = '[ ';
    bracketLeft.style.cssText = 'color:' + COLORS.cyan + ';font-family:"Share Tech Mono",monospace;font-size:13px;';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'blog-search-input';
    input.placeholder = 'SEARCH_LOGS...';
    input.style.display = 'inline';
    input.style.width = 'calc(100% - 40px)';

    var bracketRight = document.createElement('span');
    bracketRight.textContent = ' ]';
    bracketRight.style.cssText = 'color:' + COLORS.cyan + ';font-family:"Share Tech Mono",monospace;font-size:13px;';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;';
    row.appendChild(bracketLeft);
    row.appendChild(input);
    row.appendChild(bracketRight);

    var countEl = document.createElement('div');
    countEl.className = 'blog-search-count';

    wrapper.appendChild(row);
    wrapper.appendChild(countEl);

    container.parentElement.insertBefore(wrapper, container);

    function doSearch() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      entries.forEach(function (el) {
        var title = (el.querySelector('h2') || {}).textContent || '';
        var summary = (el.querySelector('p') || {}).textContent || '';
        var text = (title + ' ' + summary).toLowerCase();
        if (!query || text.indexOf(query) !== -1) {
          el.style.display = '';
          visible++;
        } else {
          el.style.display = 'none';
        }
      });
      if (query) {
        countEl.textContent = '> ' + visible + ' MATCH' + (visible !== 1 ? 'ES' : '') + ' FOUND';
      } else {
        countEl.textContent = '';
      }
    }

    input.addEventListener('input', doSearch);
  };

  /* ========== Reading Time Estimate ========== */
  var ReadingTime = {};

  ReadingTime.init = function () {
    // Only on individual blog post pages
    var article = document.querySelector('article .md-content');
    if (!article) return;

    injectStyles();

    var text = article.textContent || '';
    var words = text.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    var minutes = Math.ceil(words / 200);

    // Find the date element in the header
    var dateLine = document.querySelector('header .font-label');
    // Walk up to header level to be safe - look for date-like element
    var header = document.querySelector('main > header');
    if (!header) return;

    var dateEl = header.querySelector('p.font-label');
    if (!dateEl) {
      // Fallback: just append to header
      dateEl = header;
    }

    var badge = document.createElement('span');
    badge.className = 'blog-reading-time';
    badge.textContent = '~ ' + minutes + ' MIN READ';

    dateEl.appendChild(badge);
  };

  /* ========== Expose & Auto-init ========== */
  window.BlogTags = BlogTags;
  window.BlogSearch = BlogSearch;
  window.ReadingTime = ReadingTime;

  document.addEventListener('DOMContentLoaded', function () {
    BlogTags.init();
    BlogSearch.init();
    ReadingTime.init();
  });
})();
