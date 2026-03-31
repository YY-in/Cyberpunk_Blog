/**
 * radar-chart.js - Interactive cyberpunk radar/spider chart
 * Replaces the static SVG on the skills page with an animated canvas.
 * Vanilla JS, no dependencies.
 */
(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    labels: ['Game Dev', 'AI Workflow', 'Backend', 'HCI', 'VR/MR', 'IoT'],
    values: [9, 9, 7, 9, 8, 8],
    maxValue: 10
  };

  /* ---- helpers ---- */
  function hexVertex(cx, cy, r, index, total) {
    // Start from top (-PI/2) and go clockwise
    var angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function distToSegment(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    var len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - ax, py - ay);
    var t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  function isLight() {
    return document.documentElement.classList.contains('light');
  }

  /* ---- tooltip ---- */
  function createTooltip() {
    var tip = document.createElement('div');
    tip.style.cssText =
      'position:fixed;pointer-events:none;display:none;padding:6px 12px;' +
      'font-family:"Share Tech Mono",monospace;font-size:12px;z-index:9999;' +
      'white-space:nowrap;letter-spacing:0.08em;text-transform:uppercase;';
    function applyTooltipTheme() {
      if (isLight()) {
        tip.style.background = '#faf7f3';
        tip.style.color = '#1a1012';
        tip.style.border = '1px solid #d92323';
      } else {
        tip.style.background = '#131318';
        tip.style.color = '#f5e642';
        tip.style.border = '1px solid #f5e642';
      }
    }
    applyTooltipTheme();
    new MutationObserver(applyTooltipTheme).observe(
      document.documentElement, { attributes: true, attributeFilter: ['class'] }
    );
    document.body.appendChild(tip);
    return tip;
  }

  /* ---- main class ---- */
  function RadarChart() {}

  RadarChart.init = function (containerSelector, config) {
    config = config || {};
    var labels = config.labels || DEFAULT_CONFIG.labels;
    var values = config.values || DEFAULT_CONFIG.values;
    var maxValue = config.maxValue || DEFAULT_CONFIG.maxValue;
    var n = labels.length;

    // Resolve container
    var container;
    if (typeof containerSelector === 'string') {
      container = document.querySelector(containerSelector);
    } else {
      container = containerSelector;
    }
    if (!container) return;

    // Remove existing SVG if present
    var existingSvg = container.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    // Remove any previous canvas we created
    var existingCanvas = container.querySelector('canvas[data-radar]');
    if (existingCanvas) existingCanvas.remove();

    // Create canvas
    var canvas = document.createElement('canvas');
    canvas.setAttribute('data-radar', 'true');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    var tooltip = createTooltip();
    var activeAxis = -1;
    var animProgress = 0;
    var animStart = null;
    var ANIM_DURATION = 800;

    function resize() {
      var rect = container.getBoundingClientRect();
      var size = Math.min(rect.width, rect.height);
      var dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      return { size: size, dpr: dpr };
    }

    function draw(progress) {
      var info = resize();
      var size = info.size;
      var dpr = info.dpr;
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      var cx = size / 2;
      var cy = size / 2;
      var padding = size * 0.16;
      var R = size / 2 - padding;

      var light = isLight();

      // --- Grid rings (50% and 100%) ---
      var rings = [0.5, 1.0];
      for (var ri = 0; ri < rings.length; ri++) {
        var rr = R * rings[ri];
        ctx.beginPath();
        for (var i = 0; i <= n; i++) {
          var v = hexVertex(cx, cy, rr, i % n, n);
          if (i === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.strokeStyle = light ? 'rgba(217, 35, 35, 0.2)' : 'rgba(245, 230, 66, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- Axis lines ---
      for (var i = 0; i < n; i++) {
        var v = hexVertex(cx, cy, R, i, n);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(v.x, v.y);
        if (light) {
          ctx.strokeStyle = i === activeAxis ? 'rgba(255, 26, 68, 0.8)' : 'rgba(217, 35, 35, 0.2)';
        } else {
          ctx.strokeStyle = i === activeAxis ? 'rgba(245, 230, 66, 0.8)' : 'rgba(245, 230, 66, 0.2)';
        }
        ctx.lineWidth = i === activeAxis ? 1.5 : 0.6;
        ctx.stroke();
      }

      // --- Data polygon (animated) ---
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var ratio = (values[i] / maxValue) * progress;
        var v = hexVertex(cx, cy, R * ratio, i, n);
        if (i === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      }
      ctx.closePath();
      ctx.fillStyle = light ? 'rgba(217, 35, 35, 0.25)' : 'rgba(245, 230, 66, 0.3)';
      ctx.fill();
      ctx.strokeStyle = light ? '#0d0d0d' : '#00d4ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // --- Data vertices ---
      for (var i = 0; i < n; i++) {
        var ratio = (values[i] / maxValue) * progress;
        var v = hexVertex(cx, cy, R * ratio, i, n);
        ctx.beginPath();
        ctx.arc(v.x, v.y, i === activeAxis ? 4 : 2.5, 0, Math.PI * 2);
        if (light) {
          ctx.fillStyle = i === activeAxis ? '#ff1a44' : '#d92323';
        } else {
          ctx.fillStyle = i === activeAxis ? '#00d4ff' : '#f5e642';
        }
        ctx.fill();
      }

      // --- Labels ---
      ctx.font = Math.max(10, size * 0.034) + 'px "Share Tech Mono", monospace';
      ctx.textBaseline = 'middle';
      for (var i = 0; i < n; i++) {
        var labelR = R + size * 0.06;
        var v = hexVertex(cx, cy, labelR, i, n);
        var angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
        var cosA = Math.cos(angle);

        // Text alignment based on position
        if (Math.abs(cosA) < 0.01) {
          ctx.textAlign = 'center';
        } else if (cosA > 0) {
          ctx.textAlign = 'left';
        } else {
          ctx.textAlign = 'right';
        }

        if (light) {
          ctx.fillStyle = i === activeAxis ? '#0d0d0d' : '#d92323';
        } else {
          ctx.fillStyle = i === activeAxis ? '#ffffff' : '#f5e642';
        }
        ctx.fillText(labels[i].toUpperCase(), v.x, v.y);
      }
    }

    // --- Animation loop ---
    function animate(ts) {
      if (!animStart) animStart = ts;
      var elapsed = ts - animStart;
      animProgress = Math.min(1, elapsed / ANIM_DURATION);
      // Ease out cubic
      var t = 1 - Math.pow(1 - animProgress, 3);
      draw(t);
      if (animProgress < 1) {
        requestAnimationFrame(animate);
      }
    }

    // --- Hover interaction ---
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var size = rect.width;
      var cx = size / 2;
      var cy = size / 2;
      var padding = size * 0.16;
      var R = size / 2 - padding;

      var closest = -1;
      var closestDist = Infinity;

      for (var i = 0; i < n; i++) {
        var v = hexVertex(cx, cy, R, i, n);
        var d = distToSegment(mx, my, cx, cy, v.x, v.y);
        if (d < closestDist) {
          closestDist = d;
          closest = i;
        }
      }

      var threshold = size * 0.12;
      if (closestDist < threshold && closest !== -1) {
        activeAxis = closest;
        tooltip.style.display = 'block';
        tooltip.textContent = labels[closest].toUpperCase() + ' : ' + values[closest] + '/' + maxValue;
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
      } else {
        activeAxis = -1;
        tooltip.style.display = 'none';
      }

      // Redraw with highlight (only after animation done)
      if (animProgress >= 1) draw(1);
    });

    canvas.addEventListener('mouseleave', function () {
      activeAxis = -1;
      tooltip.style.display = 'none';
      if (animProgress >= 1) draw(1);
    });

    // --- Resize handling ---
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (animProgress >= 1) draw(1);
      }, 100);
    });

    // Re-draw on theme change
    new MutationObserver(function () {
      if (animProgress >= 1) draw(1);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Kick off
    requestAnimationFrame(animate);

    return { canvas: canvas, redraw: function () { draw(animProgress >= 1 ? 1 : animProgress); } };
  };

  // Expose
  window.RadarChart = RadarChart;

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    var svg = document.querySelector('.lg\\:col-span-5 svg');
    if (svg) {
      var parent = svg.parentElement;
      RadarChart.init(parent);
    }
  });
})();
