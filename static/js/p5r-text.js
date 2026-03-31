(function(){
  'use strict';

  function isLight() {
    return document.documentElement.classList.contains('light');
  }

  function swapAll() {
    var light = isLight();
    var els = document.querySelectorAll('[data-p5r]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      // Store original dark-mode text on first encounter
      if (!el.hasAttribute('data-dark-text')) {
        el.setAttribute('data-dark-text', el.textContent);
      }
      el.textContent = light
        ? el.getAttribute('data-p5r')
        : el.getAttribute('data-dark-text');
    }
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', swapAll);
  } else {
    swapAll();
  }

  // Watch theme changes via class attribute on <html>
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === 'class') {
        swapAll();
        return; // one swap per batch is enough
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Re-run after SPA-style navigation
  var origPush = history.pushState;
  history.pushState = function() {
    origPush.apply(this, arguments);
    setTimeout(swapAll, 200);
  };
  window.addEventListener('popstate', function() {
    setTimeout(swapAll, 200);
  });

  // Public handle for manual re-scans
  window.P5RText = { swap: swapAll };
})();
