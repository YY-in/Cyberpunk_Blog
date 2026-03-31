(function () {
  'use strict';

  var STORAGE_KEY = 'netrunner_visitor_stats';

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function formatUptime(ms) {
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    if (days > 0) return days + 'd ' + (hours % 24) + 'h ' + (minutes % 60) + 'm';
    if (hours > 0) return hours + 'h ' + (minutes % 60) + 'm ' + (seconds % 60) + 's';
    if (minutes > 0) return minutes + 'm ' + (seconds % 60) + 's';
    return seconds + 's';
  }

  function init() {
    var now = Date.now();
    var path = window.location.pathname;
    var data = load() || {
      visits: 0,
      pages: [],
      firstVisit: now,
      sessionPages: []
    };

    // Increment visit count on each page load
    data.visits += 1;

    // Track unique pages
    if (data.pages.indexOf(path) === -1) {
      data.pages.push(path);
    }

    // Track session pages
    if (data.sessionPages.indexOf(path) === -1) {
      data.sessionPages.push(path);
    }

    // Ensure firstVisit exists
    if (!data.firstVisit) {
      data.firstVisit = now;
    }

    save(data);

    // Theme detection
    var light = document.documentElement.classList.contains('light');
    var accentColor = light ? '#d92323' : '#00d4ff';
    var bgColor = light ? 'rgba(250,247,243,0.8)' : 'rgba(19,19,24,0.8)';
    var textColor = light ? '#0d0d0d' : '#00d4ff';

    // Build HUD widget
    var widget = document.createElement('div');
    widget.id = 'visitor-stats-hud';
    widget.style.cssText = [
      'position:fixed',
      'bottom:40px',
      'left:16px',
      'z-index:9999',
      'background:' + bgColor,
      'border-top:2px solid ' + accentColor,
      'padding:4px 10px',
      'font-family:"Share Tech Mono",monospace',
      'font-size:9px',
      'color:' + textColor,
      'letter-spacing:0.05em',
      'display:flex',
      'align-items:center',
      'gap:8px',
      'backdrop-filter:blur(4px)',
      'user-select:none'
    ].join(';');

    var label = document.createElement('span');
    label.id = 'visitor-stats-label';

    var closeBtn = document.createElement('span');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = [
      'cursor:pointer',
      'margin-left:6px',
      'color:' + accentColor,
      'opacity:0.6',
      'font-weight:bold'
    ].join(';');
    closeBtn.addEventListener('mouseenter', function () { closeBtn.style.opacity = '1'; });
    closeBtn.addEventListener('mouseleave', function () { closeBtn.style.opacity = '0.6'; });
    closeBtn.addEventListener('click', function () {
      widget.style.display = widget.style.display === 'none' ? 'flex' : 'none';
    });

    widget.appendChild(label);
    widget.appendChild(closeBtn);
    document.body.appendChild(widget);

    function update() {
      var elapsed = Date.now() - data.firstVisit;
      label.textContent = 'VISITS: ' + data.visits + ' | PAGES: ' + data.pages.length + ' | UPTIME: ' + formatUptime(elapsed);
    }

    update();
    setInterval(update, 1000);
  }

  // Expose API
  window.VisitorStats = {
    getData: function () { return load(); },
    reset: function () {
      localStorage.removeItem(STORAGE_KEY);
      var el = document.getElementById('visitor-stats-hud');
      if (el) el.remove();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
