/* ============================================================
   hacker-game.js — Cyberpunk 2077 Breach Protocol Minigame
   Vanilla JS, no dependencies
   ============================================================ */

(function () {
  "use strict";

  var HEX_CODES = ["1C", "BD", "55", "E9", "7A", "FF"];
  var GRID_SIZE = 6;
  var BUFFER_SIZE = 4;
  var TIMER_SECONDS = 30;
  var TARGET_LENGTH = 3;
  var TARGET_COUNT = 3;

  function isLight() {
    return document.documentElement.classList.contains('light');
  }

  /* ── Utility ── */
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function injectStyles() {
    // Remove old styles to re-inject with current theme colors
    var old = document.getElementById("breach-styles");
    if (old) old.parentNode.removeChild(old);

    var light = isLight();
    var primaryColor = light ? '#d92323' : '#f5e642';
    var secondaryColor = light ? '#0d0d0d' : '#00d4ff';
    var tertiaryColor = light ? '#732424' : '#ff2d78';
    var cellBg = light ? '#f5f0eb' : '#0e0e13';
    var scanlineColor = light ? 'rgba(217,35,35,0.4)' : 'rgba(0,212,255,0.4)';

    var style = document.createElement("style");
    style.id = "breach-styles";
    style.textContent = [
      ".bp-grid-cell{",
      "  width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;",
      "  font-family:'Share Tech Mono',monospace;font-size:clamp(0.7rem,2vw,0.95rem);font-weight:700;",
      "  color:" + secondaryColor + ";background:" + cellBg + ";border:1px solid " + (light ? "rgba(217,35,35,0.15)" : "rgba(0,212,255,0.15)") + ";",
      "  cursor:pointer;transition:all 0.15s;position:relative;user-select:none;",
      "}",
      ".bp-grid-cell:hover:not(.bp-disabled):not(.bp-locked){",
      "  background:" + (light ? "rgba(217,35,35,0.12)" : "rgba(245,230,66,0.15)") + ";color:" + primaryColor + ";border-color:" + primaryColor + ";",
      "  box-shadow:0 0 12px " + (light ? "rgba(217,35,35,0.3)" : "rgba(245,230,66,0.3)") + ";z-index:2;",
      "}",
      ".bp-grid-cell.bp-highlight{",
      "  background:" + (light ? "rgba(217,35,35,0.06)" : "rgba(245,230,66,0.06)") + ";border-color:" + (light ? "rgba(217,35,35,0.3)" : "rgba(245,230,66,0.3)") + ";",
      "}",
      ".bp-grid-cell.bp-disabled{",
      "  opacity:0.2;cursor:default;text-decoration:line-through;color:#555;",
      "}",
      ".bp-grid-cell.bp-locked{",
      "  opacity:0.35;cursor:default;",
      "}",
      ".bp-grid-cell.bp-just-picked{",
      "  animation:bp-flash 0.3s ease;",
      "}",
      "@keyframes bp-flash{",
      "  0%{background:" + primaryColor + ";color:" + (light ? "#fff" : "#000") + ";transform:scale(1.15)}",
      "  100%{background:" + cellBg + ";color:#555;transform:scale(1)}",
      "}",
      ".bp-buffer-slot{",
      "  width:clamp(40px,10vw,56px);height:clamp(40px,10vw,56px);",
      "  display:flex;align-items:center;justify-content:center;",
      "  font-family:'Share Tech Mono',monospace;font-size:clamp(0.75rem,2vw,1rem);font-weight:700;",
      "  border:2px solid " + (light ? "rgba(115,36,36,0.4)" : "rgba(255,45,120,0.4)") + ";color:" + tertiaryColor + ";background:" + cellBg + ";",
      "  transition:all 0.2s;",
      "}",
      ".bp-buffer-slot.bp-filled{",
      "  border-color:" + tertiaryColor + ";color:" + (light ? "#fff" : "#fff") + ";background:" + (light ? "rgba(115,36,36,0.15)" : "rgba(255,45,120,0.15)") + ";",
      "  box-shadow:0 0 10px " + (light ? "rgba(115,36,36,0.3)" : "rgba(255,45,120,0.3)") + ";",
      "}",
      ".bp-buffer-slot.bp-active{",
      "  border-color:" + primaryColor + ";animation:bp-pulse 1s ease infinite;",
      "}",
      "@keyframes bp-pulse{",
      "  0%,100%{box-shadow:0 0 4px " + (light ? "rgba(217,35,35,0.3)" : "rgba(245,230,66,0.3)") + "}",
      "  50%{box-shadow:0 0 14px " + (light ? "rgba(217,35,35,0.6)" : "rgba(245,230,66,0.6)") + "}",
      "}",
      ".bp-target-code{",
      "  display:inline-block;padding:2px 8px;margin:0 2px;",
      "  font-family:'Share Tech Mono',monospace;font-size:clamp(0.65rem,1.5vw,0.85rem);font-weight:700;",
      "  background:" + (light ? "rgba(217,35,35,0.08)" : "rgba(0,212,255,0.08)") + ";border:1px solid " + (light ? "rgba(217,35,35,0.2)" : "rgba(0,212,255,0.2)") + ";color:" + secondaryColor + ";",
      "}",
      ".bp-target-matched .bp-target-code{",
      "  text-decoration:line-through;color:#22c55e;border-color:#22c55e;background:rgba(34,197,94,0.1);",
      "}",
      ".bp-timer-bar{",
      "  height:4px;background:" + secondaryColor + ";transition:width 0.25s linear;",
      "}",
      ".bp-timer-bar.bp-danger{",
      "  background:" + tertiaryColor + ";",
      "}",
      ".bp-scanline{",
      "  position:absolute;top:0;left:0;right:0;height:2px;background:" + scanlineColor + ";",
      "  animation:bp-scan 2.5s linear infinite;pointer-events:none;z-index:5;",
      "}",
      "@keyframes bp-scan{",
      "  0%{top:0;opacity:0.8}50%{opacity:0.3}100%{top:100%;opacity:0.8}",
      "}",
      ".bp-reward-text{",
      "  animation:bp-typein 0.5s ease both;",
      "}",
      "@keyframes bp-typein{",
      "  0%{opacity:0;transform:translateY(8px)}",
      "  100%{opacity:1;transform:translateY(0)}",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  /* ── Game State ── */
  var state = {
    grid: [],
    buffer: [],
    targets: [],
    selectingRow: true,   // true = pick from row, false = pick from column
    activeIndex: 0,       // row index for first pick, then alternating row/col index
    timer: TIMER_SECONDS,
    timerInterval: null,
    running: false,
    container: null
  };

  /* ── Generate Puzzle ── */
  function generateGrid() {
    var g = [];
    for (var r = 0; r < GRID_SIZE; r++) {
      var row = [];
      for (var c = 0; c < GRID_SIZE; c++) {
        row.push(pick(HEX_CODES));
      }
      g.push(row);
    }
    return g;
  }

  function generateTargets(grid) {
    var targets = [];
    for (var t = 0; t < TARGET_COUNT; t++) {
      var seq = [];
      for (var i = 0; i < TARGET_LENGTH; i++) {
        seq.push(pick(HEX_CODES));
      }
      targets.push({ codes: seq, matched: false });
    }
    return targets;
  }

  /* ── Check Targets ── */
  function checkTargets() {
    state.targets.forEach(function (target) {
      if (target.matched) return;
      // Check if target codes appear as a subsequence in buffer
      var ti = 0;
      for (var bi = 0; bi < state.buffer.length && ti < target.codes.length; bi++) {
        if (state.buffer[bi] === target.codes[ti]) {
          ti++;
        }
      }
      if (ti === target.codes.length) {
        target.matched = true;
      }
    });
  }

  /* ── Timer ── */
  function startTimer() {
    state.timer = TIMER_SECONDS;
    updateTimerDisplay();
    state.timerInterval = setInterval(function () {
      state.timer--;
      updateTimerDisplay();
      if (state.timer <= 0) {
        endGame();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    var bar = state.container.querySelector("#bp-timer-fill");
    var label = state.container.querySelector("#bp-timer-label");
    if (!bar || !label) return;
    var pct = (state.timer / TIMER_SECONDS) * 100;
    bar.style.width = pct + "%";
    label.textContent = state.timer + "s";
    var light = isLight();
    if (state.timer <= 10) {
      bar.classList.add("bp-danger");
      label.style.color = light ? "#732424" : "#ff2d78";
    } else {
      bar.classList.remove("bp-danger");
      label.style.color = light ? "#0d0d0d" : "#00d4ff";
    }
  }

  /* ── Render ── */
  function render() {
    // Re-inject styles to pick up current theme
    injectStyles();

    var light = isLight();
    var primaryColor = light ? '#d92323' : '#f5e642';
    var secondaryColor = light ? '#0d0d0d' : '#00d4ff';
    var tertiaryColor = light ? '#732424' : '#ff2d78';

    var c = state.container;
    c.innerHTML = "";
    c.style.position = "relative";
    c.style.overflow = "hidden";
    c.style.padding = "0";

    // Scanline effect
    var scanline = document.createElement("div");
    scanline.className = "bp-scanline";
    c.appendChild(scanline);

    var wrapper = document.createElement("div");
    wrapper.style.cssText = "padding:clamp(12px,3vw,24px);display:flex;flex-direction:column;gap:16px;position:relative;z-index:1;";
    c.appendChild(wrapper);

    // ── Timer row ──
    var timerRow = document.createElement("div");
    timerRow.style.cssText = "display:flex;align-items:center;gap:12px;";
    timerRow.innerHTML =
      '<span style="font-family:\'Share Tech Mono\',monospace;font-size:0.7rem;color:' + secondaryColor + ';letter-spacing:0.1em;" id="bp-timer-label">' + state.timer + 's</span>' +
      '<div style="flex:1;height:4px;background:' + (light ? 'rgba(217,35,35,0.1)' : 'rgba(0,212,255,0.1)') + ';overflow:hidden;">' +
      '<div class="bp-timer-bar" id="bp-timer-fill" style="width:' + ((state.timer / TIMER_SECONDS) * 100) + '%;"></div>' +
      '</div>' +
      '<span style="font-family:\'Share Tech Mono\',monospace;font-size:0.6rem;color:rgba(204,199,173,0.5);letter-spacing:0.15em;">BREACH ACTIVE</span>';
    wrapper.appendChild(timerRow);

    // ── Buffer ──
    var bufferSection = document.createElement("div");
    bufferSection.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap;";
    var bufLabel = document.createElement("span");
    bufLabel.style.cssText = "font-family:'Orbitron',sans-serif;font-size:clamp(0.55rem,1.2vw,0.7rem);color:" + tertiaryColor + ";letter-spacing:0.15em;font-weight:700;margin-right:4px;";
    bufLabel.textContent = "BUFFER";
    bufferSection.appendChild(bufLabel);
    for (var i = 0; i < BUFFER_SIZE; i++) {
      var slot = document.createElement("div");
      slot.className = "bp-buffer-slot" + (i < state.buffer.length ? " bp-filled" : "") + (i === state.buffer.length && state.running ? " bp-active" : "");
      slot.textContent = i < state.buffer.length ? state.buffer[i] : "";
      bufferSection.appendChild(slot);
    }
    wrapper.appendChild(bufferSection);

    // ── Main area: Grid + Targets ──
    var mainArea = document.createElement("div");
    mainArea.style.cssText = "display:grid;grid-template-columns:1fr;gap:16px;";
    // On larger screens, side by side
    if (window.innerWidth >= 640) {
      mainArea.style.gridTemplateColumns = "1fr auto";
    }

    // Grid
    var gridWrap = document.createElement("div");
    gridWrap.style.cssText = "display:flex;flex-direction:column;gap:4px;";

    // Column headers
    var colHeader = document.createElement("div");
    colHeader.style.cssText = "display:grid;grid-template-columns:repeat(" + GRID_SIZE + ",1fr);gap:3px;margin-bottom:2px;padding-left:0;";
    for (var ci = 0; ci < GRID_SIZE; ci++) {
      var ch = document.createElement("div");
      ch.style.cssText = "text-align:center;font-family:'Share Tech Mono',monospace;font-size:0.5rem;color:rgba(204,199,173,0.3);";
      ch.textContent = "C" + ci;
      colHeader.appendChild(ch);
    }
    gridWrap.appendChild(colHeader);

    // Grid cells
    var gridEl = document.createElement("div");
    gridEl.style.cssText = "display:grid;grid-template-columns:repeat(" + GRID_SIZE + ",1fr);gap:3px;";

    for (var r = 0; r < GRID_SIZE; r++) {
      for (var cc = 0; cc < GRID_SIZE; cc++) {
        var cell = document.createElement("div");
        cell.className = "bp-grid-cell";
        cell.textContent = state.grid[r][cc];
        cell.dataset.row = r;
        cell.dataset.col = cc;

        // Determine if cell is selectable
        var selectable = false;
        if (state.running && state.buffer.length < BUFFER_SIZE) {
          if (state.selectingRow) {
            if (r === state.activeIndex) selectable = true;
          } else {
            if (cc === state.activeIndex) selectable = true;
          }
        }

        // Check if already picked
        if (cell.dataset.picked === "true" || isDisabled(r, cc)) {
          cell.classList.add("bp-disabled");
          selectable = false;
        } else if (selectable) {
          cell.classList.add("bp-highlight");
        } else if (state.running) {
          cell.classList.add("bp-locked");
        }

        if (selectable) {
          (function (row, col) {
            cell.addEventListener("click", function () {
              onCellClick(row, col);
            });
          })(r, cc);
        }

        gridEl.appendChild(cell);
      }
    }
    gridWrap.appendChild(gridEl);
    mainArea.appendChild(gridWrap);

    // Targets panel
    var targetsWrap = document.createElement("div");
    targetsWrap.style.cssText = "display:flex;flex-direction:column;gap:10px;min-width:140px;";
    var tLabel = document.createElement("div");
    tLabel.style.cssText = "font-family:'Orbitron',sans-serif;font-size:clamp(0.55rem,1.2vw,0.7rem);color:" + primaryColor + ";letter-spacing:0.15em;font-weight:700;margin-bottom:4px;";
    tLabel.textContent = "TARGETS";
    targetsWrap.appendChild(tLabel);

    state.targets.forEach(function (target, idx) {
      var tRow = document.createElement("div");
      tRow.style.cssText = "display:flex;flex-direction:column;gap:4px;padding:8px;background:" + (light ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.3)") + ";border:1px solid " + (target.matched ? "rgba(34,197,94,0.4)" : (light ? "rgba(217,35,35,0.1)" : "rgba(0,212,255,0.1)")) + ";";
      if (target.matched) tRow.classList.add("bp-target-matched");

      var tTitle = document.createElement("div");
      tTitle.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:0.55rem;color:" + (target.matched ? "#22c55e" : "rgba(204,199,173,0.5)") + ";letter-spacing:0.15em;";
      tTitle.textContent = target.matched ? "CRACKED" : "SEQ_0" + (idx + 1);
      tRow.appendChild(tTitle);

      var tCodes = document.createElement("div");
      tCodes.style.cssText = "display:flex;gap:2px;flex-wrap:wrap;";
      target.codes.forEach(function (code) {
        var span = document.createElement("span");
        span.className = "bp-target-code";
        span.textContent = code;
        tCodes.appendChild(span);
      });
      tRow.appendChild(tCodes);
      targetsWrap.appendChild(tRow);
    });

    // Show match progress
    var matchCount = state.targets.filter(function (t) { return t.matched; }).length;
    var progress = document.createElement("div");
    progress.style.cssText = "margin-top:8px;font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:rgba(204,199,173,0.4);letter-spacing:0.1em;";
    progress.textContent = "BREACHED: " + matchCount + "/" + TARGET_COUNT;
    targetsWrap.appendChild(progress);

    mainArea.appendChild(targetsWrap);
    wrapper.appendChild(mainArea);
  }

  /* Disabled tracking */
  var disabledCells = {};

  function isDisabled(r, c) {
    return disabledCells[r + "," + c] === true;
  }

  /* ── Cell Click Handler ── */
  function onCellClick(row, col) {
    if (!state.running || state.buffer.length >= BUFFER_SIZE) return;

    var code = state.grid[row][col];
    state.buffer.push(code);
    disabledCells[row + "," + col] = true;

    // Toggle selection mode
    if (state.selectingRow) {
      // Was selecting from row, next must be from column = col
      state.selectingRow = false;
      state.activeIndex = col;
    } else {
      // Was selecting from column, next must be from row = row
      state.selectingRow = true;
      state.activeIndex = row;
    }

    checkTargets();
    render();

    // Check if buffer full
    if (state.buffer.length >= BUFFER_SIZE) {
      endGame();
    }
  }

  /* ── End Game ── */
  function endGame() {
    state.running = false;
    stopTimer();
    render();

    var matchCount = state.targets.filter(function (t) { return t.matched; }).length;
    var allCracked = matchCount === TARGET_COUNT;
    var success = matchCount > 0;

    // RPG integration
    if (typeof window.RPG !== "undefined") {
      if (success) {
        if (typeof window.RPG.addXP === "function") {
          window.RPG.addXP(50);
        }
        if (allCracked && typeof window.RPG.addXP === "function") {
          window.RPG.addXP(100);
        }
        if (window.RPG.achievements && typeof window.RPG.achievements.unlock === "function") {
          window.RPG.achievements.unlock("hacker");
        }
      }
    }

    showResults(success, allCracked, matchCount);
  }

  /* ── Results Display ── */
  function showResults(success, allCracked, matchCount) {
    var resultsEl = document.getElementById("breach-results");
    var contentEl = document.getElementById("breach-results-content");
    if (!resultsEl || !contentEl) return;

    var light = isLight();
    var primaryColor = light ? '#d92323' : '#f5e642';
    var secondaryColor = light ? '#0d0d0d' : '#00d4ff';
    var tertiaryColor = light ? '#732424' : '#ff2d78';

    resultsEl.classList.remove("hidden");

    var classifiedData = [
      "// CLASSIFIED FILE #0x7A3F\n// Project NIGHTWIRE — neural mesh prototype\n// Status: OPERATIONAL\n// \"The net is vast and infinite.\" — Motoko Kusanagi\n// Next checkpoint: Sector 7-G, 03:00 local time",
      "// INTERCEPTED TRANSMISSION\n// FROM: unknown@darknet.corp\n// TO: [REDACTED]\n// \"The corpo rats don't know we've\n//  already cracked their mainframe.\n//  Meet at the usual place. Bring chrome.\"\n// TRACE STATUS: FAILED",
      "// PERSONNEL DOSSIER #2077-NC\n// ALIAS: NightSt1tch\n// SPECIALTY: Full-stack netrunning\n// THREAT LEVEL: ████████░░ 80%\n// NOTE: Suspect has been observed\n//  deploying custom ICE breakers\n//  with alarming efficiency.",
      "// RECIPE.encrypted\n// DECRYPTED CONTENTS:\n// 1x Imperial Stout (barrel-aged)\n// 2x shots of synthetic espresso\n// 1x dash of liquid nitrogen\n// Shake in cryo-mixer. Serve in\n//  a circuit-board etched glass.\n// CODENAME: \"The Blackout\"",
      "// ACHIEVEMENT UNLOCKED\n// >> GHOST IN THE MACHINE <<\n// You breached the ICE without\n//  triggering a single alarm.\n// \"We are the music makers,\n//  and we are the dreamers of dreams.\"\n// XP BONUS: CLASSIFIED"
    ];

    var html = "";
    if (success) {
      html += '<div class="flex items-center gap-3 mb-4">';
      html += '<span class="material-symbols-outlined text-3xl text-[#22c55e]">lock_open</span>';
      html += '<div>';
      html += '<h3 class="font-headline text-xl sm:text-2xl font-black text-[#22c55e] tracking-wider">' + (allCracked ? "FULL BREACH — ALL ICE CRACKED" : "ACCESS GRANTED") + '</h3>';
      html += '<p class="font-label text-xs text-[#22c55e]/60 tracking-widest">' + matchCount + '/' + TARGET_COUNT + ' SEQUENCES MATCHED</p>';
      html += '</div></div>';

      if (allCracked) {
        html += '<div class="mb-4 px-3 py-2 bg-[#22c55e]/10 border border-[#22c55e]/20">';
        html += '<span class="font-label text-xs" style="color:' + primaryColor + '">BONUS: +150 XP (50 base + 100 all-clear)</span>';
        html += '</div>';
      } else {
        html += '<div class="mb-4 px-3 py-2" style="background:' + secondaryColor + '1a;border:1px solid ' + secondaryColor + '33;">';
        html += '<span class="font-label text-xs" style="color:' + secondaryColor + '">REWARD: +50 XP</span>';
        html += '</div>';
      }

      html += '<div class="font-label text-xs tracking-widest mb-2" style="color:' + primaryColor + '99;">DECRYPTED DATA:</div>';

      // Show 1-3 classified items based on match count
      for (var i = 0; i < Math.min(matchCount, classifiedData.length); i++) {
        html += '<pre class="bp-reward-text bg-black/50 p-3 mb-3 font-label text-xs overflow-x-auto whitespace-pre-wrap" style="border-left:2px solid ' + secondaryColor + ';color:' + secondaryColor + 'cc;animation-delay:' + (i * 0.2) + 's">' + classifiedData[i] + '</pre>';
      }

    } else {
      html += '<div class="flex items-center gap-3 mb-4">';
      html += '<span class="material-symbols-outlined text-3xl" style="color:' + tertiaryColor + '">gpp_bad</span>';
      html += '<div>';
      html += '<h3 class="font-headline text-xl sm:text-2xl font-black tracking-wider" style="color:' + tertiaryColor + '">BREACH FAILED</h3>';
      html += '<p class="font-label text-xs tracking-widest" style="color:' + tertiaryColor + '99;">ICE COUNTERMEASURES ACTIVATED — CONNECTION SEVERED</p>';
      html += '</div></div>';
      html += '<pre class="bg-black/50 p-3 font-label text-xs overflow-x-auto whitespace-pre-wrap" style="border-left:2px solid ' + tertiaryColor + ';color:' + tertiaryColor + '99;">// ERROR 0xDEAD: ACCESS DENIED\n// Intrusion detected at node ' + Math.floor(Math.random() * 256).toString(16).toUpperCase() + '\n// Trace initiated... deploying black ICE\n// Connection terminated.\n// \n// "Better luck next time, choomba."</pre>';
    }

    html += '<button id="bp-retry-btn" class="mt-6 font-bold py-3 px-8 uppercase tracking-widest text-xs diagonal-cut-tr hover:bg-white transition-all active:scale-95 inline-flex items-center gap-2" style="background:' + primaryColor + ';color:' + (light ? '#fff' : '#000') + ';">';
    html += '<span class="material-symbols-outlined text-sm">replay</span>JACK IN AGAIN</button>';

    contentEl.innerHTML = html;

    var retryBtn = document.getElementById("bp-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        resultsEl.classList.add("hidden");
        BreachProtocol.start();
      });
    }

    // Smooth scroll to results on mobile
    if (window.innerWidth < 1024) {
      resultsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /* ── Public API ── */
  var BreachProtocol = {
    init: function (containerId) {
      injectStyles();
      state.container = document.getElementById(containerId);
      if (!state.container) return;

      var startBtn = document.getElementById("breach-start-btn");
      if (startBtn) {
        startBtn.addEventListener("click", function () {
          BreachProtocol.start();
        });
      }
    },

    start: function () {
      if (!state.container) return;

      // Hide results
      var resultsEl = document.getElementById("breach-results");
      if (resultsEl) resultsEl.classList.add("hidden");

      // Hide idle state
      var idle = document.getElementById("breach-idle");
      if (idle) idle.style.display = "none";

      // Reset state
      stopTimer();
      disabledCells = {};
      state.grid = generateGrid();
      state.buffer = [];
      state.targets = generateTargets(state.grid);
      state.selectingRow = true;
      state.activeIndex = 0; // First pick from row 0
      state.running = true;

      render();
      startTimer();
    },

    reset: function () {
      stopTimer();
      state.running = false;
      state.buffer = [];
      state.targets = [];
      state.grid = [];
      disabledCells = {};

      if (state.container) {
        var light = isLight();
        var idlePrimary = light ? '#d92323' : '#f5e642';
        state.container.innerHTML =
          '<div class="flex flex-col items-center justify-center h-full min-h-[480px] sm:min-h-[520px] p-8 text-center" id="breach-idle">' +
          '<span class="material-symbols-outlined text-6xl mb-4" style="color:' + idlePrimary + ';opacity:0.3;">lock</span>' +
          '<p class="font-headline text-xl tracking-wider uppercase" style="color:' + idlePrimary + ';opacity:0.4;">Awaiting Breach Initiation</p>' +
          '<p class="font-label text-xs text-on-surface-variant/40 mt-2 tracking-widest">CLICK START TO BEGIN</p>' +
          '</div>';
      }

      var resultsEl = document.getElementById("breach-results");
      if (resultsEl) resultsEl.classList.add("hidden");
    }
  };

  window.BreachProtocol = BreachProtocol;

  /* ── Auto-init ── */
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("breach-game")) {
      BreachProtocol.init("breach-game");
    }
  });

})();
