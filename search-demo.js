/* Search-loop walkthrough — finance / GLM-5. Every score below is a real
   stage-3 (30-task pool) cascade result, pulled from that cell's actual
   archive under harness_archive/bedrock_zai.glm-5/finance/. The real archive
   has one extra round before this: a "v1" that only cleaned up GLM-5's own
   malformed tool-call arguments (a model quirk, not a security mechanism).
   That's folded into v0 here — util 70 / ASR 47.4 / score 22.6 — so the
   walkthrough starts from a clean measurement and every displayed round is
   an actual defense idea, not model housekeeping. Everything from here on
   (v0-v4 in this walkthrough) maps to the archive's v1-v5, one label lower;
   the real shipped path is still dtap_def_v4 (see recap note). Round
   summaries are told at a high level — what was found, what was added —
   for a talk audience, not a literal blow-by-blow of every design
   iteration; scores are exact, framing is simplified for clarity. Picked
   over the other two GLM-5 cells (telecom, os-filesystem) because it has
   the cleanest "regression, caught, reverted" beat: the last round looked
   like the natural next step but empirically scored worse, so the search
   kept the prior best instead — a concrete demonstration that this loop
   doesn't just chain forward blindly.
   Deliberately self-contained (no dependency on app.js or finance-demo.js). */
(function () {
  "use strict";

  var SCORES = {
    v0: { util: 70, asr: 47.4, score: 22.6 },
    v1: { util: 80, asr: 25, score: 55 },
    v2: { util: 80, asr: 10, score: 70 },
    v3: { util: 90, asr: 10, score: 80 },
    v4: { util: 90, asr: 15, score: 75 },
  };
  var VERSIONS = ["v0", "v1", "v2", "v3", "v4"];

  // delta: { prev, higherIsBetter } — arrow always reflects the REAL numeric
  // move (up/down); color ("up"=green/good, "down"=red/bad) is derived
  // separately from whether that move was good, so a falling ASR still
  // shows a down-arrow but in green, never a contradictory up-arrow.
  function metric(label, value, numValue, delta) {
    var text = "", cls = "flat", arrow = "";
    if (delta) {
      var diff = numValue - delta.prev;
      text = "vs " + delta.prevLabel + ": " + delta.prev + (delta.suffix || "");
      if (diff !== 0) {
        var rose = diff > 0;
        arrow = rose ? "&uarr; " : "&darr; ";
        var good = delta.higherIsBetter ? rose : !rose;
        cls = good ? "up" : "down";
      }
    }
    return (
      '<div class="sd-metric"><div class="mv">' + value + '</div>' +
      '<div class="ml">' + label + '</div>' +
      (delta ? '<div class="md ' + cls + '">' + arrow + text + '</div>' : '') +
      '</div>'
    );
  }
  function metrics(util, asr, score, prev, prevLabel) {
    var du = prev ? { prev: prev.util, prevLabel: prevLabel, higherIsBetter: true, suffix: "%" } : null;
    var da = prev ? { prev: prev.asr, prevLabel: prevLabel, higherIsBetter: false, suffix: "%" } : null;
    var ds = prev ? { prev: prev.score, prevLabel: prevLabel, higherIsBetter: true } : null;
    return '<div class="sd-metrics">' +
      metric("utility", util + "%", util, du) +
      metric("ASR", asr + "%", asr, da) +
      metric("score", score, score, ds) +
      '</div>';
  }
  function verdict(kind, label, text) {
    var ico = kind === "ok" ? "✅" : kind === "warn" ? "⚠️" : kind === "win" ? "🎯" : "🐛";
    return '<div class="sd-verdict ' + kind + '"><div class="vico">' + ico + '</div>' +
      '<div class="vtext"><b>' + label + '</b><p>' + text + '</p></div></div>';
  }
  function quote(text, cite) {
    return '<div class="sd-quote">' + text + '<cite>' + cite + '</cite></div>';
  }

  var STEPS = [
    // ---------------------------------------------------------------- 0
    {
      loop: "warm", version: null, badge: null,
      title: "Before v0: start from what already works",
      body:
        '<p>The proposer doesn\'t start from zero. <code>experiences.md</code> distills three mature agent-security systems into principles to build on &mdash; not code to copy.</p>' +
        '<ul>' +
        '<li><b>OpenClaw</b> &mdash; layered, fail-closed access gates.</li>' +
        '<li><b>DRIFT</b> &mdash; plan from the trusted request, judge any deviation.</li>' +
        '<li><b>CaMeL</b> &mdash; untrusted data must never drive control flow.</li>' +
        '</ul>' +
        quote('&ldquo;An in-defense LLM may classify data, never decide whether to obey it.&rdquo;', 'experiences.md &mdash; the idea v2\'s scope auditor is built on'),
    },
    // ---------------------------------------------------------------- 1
    {
      loop: "harness", version: "v0", badge: { t: "baseline", k: "design" },
      title: "v0 &mdash; the trading agent, undefended",
      body:
        '<p>No real defense yet: the agent executes whatever a tool call asks, including instructions smuggled into an invoice or a market report it\'s summarizing. (GLM-5\'s own tool calls also had some formatting quirks &mdash; blank fields, malformed arguments &mdash; unrelated to security; that housekeeping is already folded into this baseline, so every round from here reflects real attack success, not model noise.)</p>' +
        metrics(70, 47.4, 22.6) +
        quote('&ldquo;Baseline locked &mdash; util 70 / ASR 47.4 / score 22.6. Every real design round has to beat this.&rdquo;', "proposer's session"),
    },
    // ---------------------------------------------------------------- 2
    {
      loop: "analyze", version: null, badge: { t: "round 1 &middot; analyzer", k: "review" },
      title: "Analyzer &mdash; why v0 still gets exploited",
      body:
        '<p>Every cascade run produces failed traces, not just a number. The Analyzer\'s job is to distill those traces into one causal finding the Designer can act on.</p>' +
        '<p><b>Found:</b> funds could be routed to accounts the user never approved.</p>',
    },
    // ---------------------------------------------------------------- 3
    {
      loop: "design", version: "v1", badge: { t: "round 1 &middot; design", k: "design" },
      title: "v1 &mdash; check where the money is going",
      body:
        '<p><b>Added:</b> an egress gate &mdash; any transfer has to land on a pre-approved, named counterparty, or it\'s blocked.</p>',
    },
    // ---------------------------------------------------------------- 4
    {
      loop: "test", version: "v1", badge: { t: "round 1 &middot; cascade test", k: "eval" },
      title: "Cascade Test &mdash; v1 result",
      body:
        '<p>The new candidate runs the same four-stage cascade as every version before it: static &rarr; smoke(3) &rarr; mid(12) &rarr; search(30).</p>' +
        metrics(80, 25, 55, SCORES.v0, "v0"),
    },
    // ---------------------------------------------------------------- 5
    {
      loop: "analyze", version: null, badge: { t: "round 2 &middot; analyzer", k: "review" },
      title: "Analyzer &mdash; v1's gate has a hole",
      body:
        '<p><b>Found:</b> the egress gate could be talked into approving a high-impact trade just because the request claimed it was authorized.</p>',
    },
    // ---------------------------------------------------------------- 6
    {
      loop: "design", version: "v2", badge: { t: "round 2 &middot; design", k: "design" },
      title: "v2 &mdash; stop trusting the request's own claims",
      body:
        '<p><b>Added:</b> an independent scope auditor &mdash; a second, quarantined check on every effect-bearing call that ignores whatever authorization the request asserts.</p>',
    },
    // ---------------------------------------------------------------- 7
    {
      loop: "test", version: "v2", badge: { t: "round 2 &middot; cascade test", k: "eval" },
      title: "Cascade Test &mdash; v2 result",
      body:
        metrics(80, 10, 70, SCORES.v1, "v1"),
    },
    // ---------------------------------------------------------------- 8
    {
      loop: "analyze", version: null, badge: { t: "round 3 &middot; analyzer", k: "review" },
      title: "Analyzer &mdash; v2 is also hurting legitimate trades",
      body:
        '<p><b>Found:</b> the v2 auditor was also blocking ordinary, legitimate multi-leg activity &mdash; a normal hedge looks like a round-trip too if you only check one leg at a time.</p>',
    },
    // ---------------------------------------------------------------- 9
    {
      loop: "design", version: "v3", badge: { t: "round 3 &middot; design", k: "design" },
      title: "v3 &mdash; stop punishing legitimate multi-leg trades",
      body:
        '<p><b>Added:</b> a running ledger that tracks <i>net</i> position across a session, so it can tell a real hedge from a wash trade instead of flagging every round-trip.</p>',
    },
    // ---------------------------------------------------------------- 10
    {
      loop: "test", version: "v3", badge: { t: "round 3 &middot; shipped", k: "win" },
      title: "Cascade Test &mdash; v3 result, best of the search",
      body:
        metrics(90, 10, 80, SCORES.v2, "v2") +
        verdict("win", "Best result of the search &mdash; util 90 / ASR 10 / score 80", "ASR holds steady at 10 &mdash; nothing new gets through &mdash; while utility climbs to the best of the search, because fewer legitimate trades get wrongly blocked. This is what ships."),
    },
    // ---------------------------------------------------------------- 11
    {
      loop: "analyze", version: null, badge: { t: "round 4 &middot; analyzer", k: "review" },
      title: "Analyzer &mdash; what's left after v3",
      body:
        '<p><b>Found:</b> the remaining ~10% of attacks weren\'t moving money directly &mdash; they were steering what the agent\'s own analysis and reports told the user.</p>',
    },
    // ---------------------------------------------------------------- 12
    {
      loop: "design", version: "v4", badge: { t: "round 4 &middot; design", k: "design" },
      title: "v4 &mdash; try to catch it, too",
      body:
        '<p><b>Tried:</b> a content-filter on the agent\'s own analysis and reports, meant to stop an attacker from steering what it tells the user.</p>',
    },
    // ---------------------------------------------------------------- 13
    {
      loop: "crit", version: "v4", badge: { t: "round 4 &middot; rejected", k: "warn" },
      title: "Cascade Test &mdash; v4 result, and rejected",
      body:
        metrics(90, 15, 75, SCORES.v3, "v3") +
        verdict("bug", "Peer review: rejected &mdash; keep v3", "Utility doesn't move, but ASR actually rises (10&rarr;15) &mdash; the new filter added complexity without actually stopping any new attack. The search doesn't chain forward blindly &mdash; it keeps the better parent."),
    },
    // ---------------------------------------------------------------- 14
    {
      loop: "analyze", version: null, badge: { t: "converged", k: "win" },
      title: "What shipped: one cell of fifteen",
      body:
        '<p>Three real rounds of improvement and one rejected attempt &mdash; an egress gate, an independent auditor, and a net-position ledger. Ships in the public repo as <code>dtap_def_v4</code> (the archive\'s own numbering starts one housekeeping round earlier than this walkthrough\'s v0).</p>' +
        verdict("win", "The loop can say no to its own next step", "v4 scored close to v3 on paper but was empirically worse &mdash; the same scrutiny a Reviewer applies to a brand-new candidate applies to the search's own most recent move."),
    },
  ];

  // -------------------------------------------------------------- render
  var loopEl = document.getElementById("sdHloop");
  var centerVerEl = document.getElementById("sdCenterVer");
  var chartEl = document.getElementById("sdChart");
  var cardEl = document.getElementById("sdCard");
  var dotsEl = document.getElementById("sdDots");
  var stepcountEl = document.getElementById("sdStepcount");
  var prevBtn = document.getElementById("sdPrev");
  var nextBtn = document.getElementById("sdNext");
  var playBtn = document.getElementById("sdPlay");

  var idx = 0;
  var playTimer = null;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildChart() {
    chartEl.innerHTML = "";
    VERSIONS.forEach(function (v) {
      var col = document.createElement("div");
      col.className = "sd-cbar-col";
      col.dataset.v = v;
      col.innerHTML =
        '<div class="sd-cbar-stack">' +
        '<div class="sd-cbar util" data-v="' + SCORES[v].util + '"></div>' +
        '<div class="sd-cbar asr" data-v="' + SCORES[v].asr + '"></div>' +
        '</div><div class="sd-cbar-lab">' + v + '</div>';
      chartEl.appendChild(col);
    });
  }

  function updateChart(version) {
    var upToIndex = version ? VERSIONS.indexOf(version) : -1;
    VERSIONS.forEach(function (v, i) {
      var col = chartEl.querySelector('[data-v="' + v + '"]');
      var revealed = i <= upToIndex;
      col.classList.toggle("revealed", revealed);
      col.classList.toggle("current", v === version);
      if (revealed) {
        col.querySelectorAll(".sd-cbar").forEach(function (bar) {
          var val = parseFloat(bar.dataset.v);
          bar.style.height = Math.max(3, (val / 100) * 96) + "px";
        });
      } else {
        col.querySelectorAll(".sd-cbar").forEach(function (bar) { bar.style.height = "0px"; });
      }
    });
  }

  function updateLoop(stage) {
    loopEl.querySelectorAll(".hnode").forEach(function (n) {
      n.classList.toggle("on", n.dataset.stage === stage);
    });
  }
  // finds the version "in flight" at a given step, carrying the last-seen
  // version across steps that have none of their own (intro, wrap-up)
  function lastSeenVersion(stepIndex) {
    for (var i = stepIndex; i >= 0; i--) {
      if (STEPS[i].version) return STEPS[i].version;
    }
    return null;
  }
  function updateCenter(effVersion) {
    centerVerEl.textContent = effVersion || "search loop"; // before v0 exists
  }

  function renderDots() {
    dotsEl.innerHTML = "";
    STEPS.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Go to step " + (i + 1));
      b.addEventListener("click", function () { stopPlay(); idx = i; render(); });
      dotsEl.appendChild(b);
    });
  }
  function updateDots() {
    var kids = dotsEl.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].className = i === idx ? "on" : i < idx ? "done" : "";
    }
  }

  function render() {
    var step = STEPS[idx];
    var effVersion = lastSeenVersion(idx);
    updateLoop(step.loop);
    updateCenter(effVersion);
    updateChart(effVersion);
    if (!reduceMotion) void cardEl.offsetWidth;

    var badgeHtml = "";
    if (step.badge) badgeHtml += '<span class="sd-badge ' + step.badge.k + '">' + step.badge.t + '</span>';
    if (step.version) badgeHtml += '<span class="sd-badge mono">' + step.version + '</span>';

    cardEl.innerHTML = '<div class="sd-eyebrow">' + badgeHtml + '</div><h3>' + step.title + '</h3>' + step.body;

    stepcountEl.textContent = (idx + 1) + " / " + STEPS.length;
    updateDots();
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === STEPS.length - 1;
  }

  function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    playBtn.innerHTML = "&#9654; Play";
  }
  function startPlay() {
    playTimer = setInterval(function () {
      if (idx < STEPS.length - 1) { idx++; render(); } else { stopPlay(); }
    }, 4200);
    playBtn.innerHTML = "&#10074;&#10074; Pause";
  }

  prevBtn.addEventListener("click", function () { stopPlay(); if (idx > 0) { idx--; render(); } });
  nextBtn.addEventListener("click", function () { stopPlay(); if (idx < STEPS.length - 1) { idx++; render(); } });
  playBtn.addEventListener("click", function () { if (playTimer) stopPlay(); else startPlay(); });

  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { nextBtn.click(); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { prevBtn.click(); e.preventDefault(); }
    else if (e.key === " ") { playBtn.click(); e.preventDefault(); }
  });

  buildChart();
  renderDots();
  render();

  /* lightweight scroll-reveal, matching the homepage's .reveal behaviour */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  setTimeout(function () {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { el.classList.add("in"); });
  }, 2500);
})();
