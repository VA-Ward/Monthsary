/* ============================================================
   Eleven moons — the moving parts
   Every word and photo comes from content.js (window.SITE_CONTENT),
   which the editor (admin.html) writes for you.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var HEART_D = "M50 88C20 66 2 48 2 28 2 12 14 2 28 2c10 0 18 6 22 14C54 8 62 2 72 2c14 0 26 10 26 26 0 20-18 38-48 60z";
  var WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
    "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

  var DEFAULT = {
    name: "my love",
    together: "",
    greeting: "Happy monthsary",
    headline: "Eleven moons",
    heroLine: "One for every month of us.",
    seal: { on: false, opensAt: "", line: "Not yet. Come back soon." },
    letter: { greeting: "Hi,", body: ["Write your letter in the editor."], signature: "Yours" },
    months: [],
    nextMoon: { month: "Next month", title: "Next", text: "One more moon." },
    photos: [],
    heart: {
      hint: "Press and hold", holding: "Keep holding…", over: "Still going…",
      early: "Don't let go…", done: "It doesn't fit. That's how much."
    },
    reasonsIntro: "Tap the jar.",
    reasons: [],
    coupons: [],
    question: {
      ask: "Will you keep choosing me?", yes: "Yes", no: "No",
      dodges: ["Are you sure?", "Think again", "Nice try"], giveIn: "Okay, yes",
      replyTitle: "I knew it.", reply: ""
    },
    lantern: { placeholder: "I wish…", sent: "It's on its way." },
    closing: "Made by hand, for you.",
    music: { url: "", title: "Play our song" }
  };

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function merge(base, over) {
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    if (!over || typeof over !== "object") return out;
    for (k in over) {
      if (!Object.prototype.hasOwnProperty.call(over, k)) continue;
      var v = over[k];
      if (v === null || v === undefined || v === "") continue;
      if (Array.isArray(v)) { if (v.length) out[k] = v; }
      else if (typeof v === "object") out[k] = merge(base[k] || {}, v);
      else out[k] = v;
    }
    return out;
  }
  function parseLocal(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(String(s || "").trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  function addMonths(d, n) {
    var t = new Date(d.getFullYear(), d.getMonth() + n, 1, d.getHours(), d.getMinutes(), d.getSeconds());
    var last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    t.setDate(Math.min(d.getDate(), last));
    return t;
  }
  function monthsSince(start, now) {
    var m = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    while (m > 0 && addMonths(start, m) > now) m--;
    while (addMonths(start, m + 1) <= now) m++;
    return Math.max(0, m);
  }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function ordinal(n) {
    var s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function plural(n, w) { return "<b>" + n + "</b> " + w + (n === 1 ? "" : "s"); }
  function word(n) { return WORDS[n] || String(n); }
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not supported */ } }
  function centre(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* moon phase as an SVG path: f is the lit fraction, 0 = new, 1 = full, lit from the right */
  function phase(cx, cy, r, f) {
    f = Math.max(0, Math.min(1, f));
    if (f < 0.002) return "";
    if (f > 0.998) {
      return "M" + (cx - r) + "," + cy + "a" + r + "," + r + " 0 1,0 " + (2 * r) + ",0a" + r + "," + r + " 0 1,0 " + (-2 * r) + ",0z";
    }
    var rx = r * Math.abs(1 - 2 * f), sweep = f < 0.5 ? 0 : 1;
    return "M" + cx + "," + (cy - r) + "A" + r + "," + r + " 0 0,1 " + cx + "," + (cy + r) +
      "A" + rx.toFixed(3) + "," + r + " 0 0," + sweep + " " + cx + "," + (cy - r) + "z";
  }

  /* ---------------- boot ---------------- */
  function load(cb) {
    if (window.SITE_CONTENT) { cb(window.SITE_CONTENT); return; }
    var s = document.createElement("script"), done = false;
    s.src = "content.js" + (/^https?:$/.test(location.protocol) ? "?v=" + Date.now() : "");
    function go() { if (done) return; done = true; cb(window.SITE_CONTENT || {}); }
    s.onload = go;
    s.onerror = go;
    document.head.appendChild(s);
  }

  function start(C) {
    document.title = C.greeting || "Happy monthsary";
    $("greeting").textContent = C.greeting;
    $("headline").textContent = C.headline;
    $("closing").textContent = C.closing;

    sky.start();
    fx.init();
    tapHearts();
    safe(buildMusic, C);

    var preview = /(^|[?&#])preview\b/.test(location.search + location.hash);
    var opensAt = parseLocal(C.seal && C.seal.opensAt);
    var sealedNow = !!(C.seal && C.seal.on === true && opensAt && Date.now() < opensAt.getTime());
    var locked = sealedNow && !preview;
    if (sealedNow && preview) $("preview-flag").hidden = false;

    requestAnimationFrame(function () { $("top").classList.add("awake"); });

    if (locked) {
      document.body.classList.add("locked");
      $("hero-line").textContent = C.seal.line || DEFAULT.seal.line;
      moon.set(0.02);
      moon.wax(0.17, 2400);
      sealCountdown(opensAt, function () { unseal(C); });
    } else {
      $("hero-line").textContent = C.heroLine;
      moon.set(REDUCED ? 1 : 0.04);
      moon.wax(1, 2800);
      together(C);
      openUp(C);
    }
  }

  function safe(fn, C) {
    try { fn(C); } catch (e) { if (window.console) console.error(e); }
  }

  var opened = false;
  function openUp(C) {
    if (opened) return;
    opened = true;
    [buildLetter, buildMonths, buildPhotos, buildHeart, buildJar, buildCoupons, buildQuestion, buildLantern]
      .forEach(function (fn) { safe(fn, C); });
  }

  function unseal(C) {
    document.body.classList.remove("locked");
    $("preview-flag").hidden = true;
    var line = $("hero-line");
    line.style.opacity = "0";
    setTimeout(function () { line.textContent = C.heroLine; line.style.opacity = ""; }, 500);
    moon.wax(1, 3200);
    together(C);
    openUp(C);
    var c = centre($("moon-wrap"));
    fx.burst(c.x, c.y, 90, "spark", { speed: 5 });
    setTimeout(function () { fx.rain(50); }, 900);
  }

  /* ---------------- the big moon ---------------- */
  var moon = (function () {
    var path = null, f = 0, raf = 0;
    function el() { return path || (path = $("moon-phase")); }
    function set(v) { f = v; el().setAttribute("d", phase(100, 100, 88, v)); }
    function wax(to, ms, done) {
      cancelAnimationFrame(raf);
      if (REDUCED) { set(to); if (done) done(); return; }
      var from = f, t0 = 0;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
        set(from + (to - from) * e);
        if (k < 1) raf = requestAnimationFrame(step);
        else if (done) done();
      }
      raf = requestAnimationFrame(step);
    }
    return { set: set, wax: wax };
  })();

  /* ---------------- counting up, and counting down ---------------- */
  function together(C) {
    var start = parseLocal(C.together), out = $("together"), ms = $("milestone");
    if (!start) { out.hidden = true; ms.hidden = true; return; }
    out.hidden = false;
    ms.hidden = false;
    function render() {
      var now = new Date();
      if (now < start) { out.textContent = "It all starts soon."; ms.textContent = ""; return; }
      var m = monthsSince(start, now), anchor = addMonths(start, m), diff = now - anchor;
      var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
          mi = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
      out.innerHTML = "We've been us for " + plural(m, "month") + ", " + plural(d, "day") + ", " +
        plural(h, "hour") + ", " + plural(mi, "minute") + " and " + plural(s, "second") + ".";

      var n = m + 1, left = addMonths(start, n) - now;
      var what = n % 12 === 0 ? (n === 12 ? "Our first year" : "Year " + (n / 12)) : "Month " + n;
      var days = Math.ceil(left / 864e5);
      var away = left < 864e5 ? " is less than a day away." : " is " + days + " day" + (days === 1 ? "" : "s") + " away.";
      var label = m % 12 === 0 ? (m === 12 ? "first anniversary" : ordinal(m / 12) + " anniversary") : ordinal(m) + " monthsary";
      var today = m > 0 && sameDay(now, anchor);
      ms.textContent = (today ? "It's our " + label + " today. " : "") + what + away;
    }
    render();
    setInterval(render, 1000);
  }

  function sealCountdown(opensAt, onOpen) {
    var out = $("together"), timer = 0;
    function render() {
      var left = opensAt.getTime() - Date.now();
      if (left <= 0) { clearInterval(timer); onOpen(); return; }
      var d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24,
          mi = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60, parts = [];
      if (d) parts.push(plural(d, "day"));
      if (d || h) parts.push(plural(h, "hour"));
      parts.push(plural(mi, "minute"));
      out.innerHTML = "It opens in " + parts.join(", ") + " and " + plural(s, "second") + ".";
    }
    render();
    timer = setInterval(render, 1000);
  }

  /* ---------------- the letter ---------------- */
  function buildLetter(C) {
    var L = C.letter || {}, body = $("letter-body"), env = $("envelope"), paper = $("paper");
    var g = $("letter-greeting"), sign = $("letter-sign"), paras = L.body || [];
    g.textContent = L.greeting || "";
    g.className = "paper-greeting ink";
    g.style.setProperty("--i", 0);
    body.innerHTML = "";
    paras.forEach(function (p, i) {
      var el = document.createElement("p");
      el.className = "ink";
      el.style.setProperty("--i", i + 1);
      el.textContent = p;
      body.appendChild(el);
    });
    sign.textContent = L.signature || "";
    sign.className = "paper-sign ink";
    sign.style.setProperty("--i", paras.length + 1);

    env.addEventListener("click", function () {
      env.classList.add("opening");
      env.setAttribute("aria-expanded", "true");
      var c = centre(env);
      fx.burst(c.x, c.y, 24, "heart", { speed: 3.2 });
      buzz(12);
      setTimeout(function () {
        env.classList.add("gone");
        paper.hidden = false;
        paper.classList.add("in");
        paper.setAttribute("tabindex", "-1");
        try { paper.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
        setTimeout(function () { env.hidden = true; }, 650);
      }, REDUCED ? 0 : 1500);
    }, { once: true });
  }

  /* ---------------- month by month ---------------- */
  function buildMonths(C) {
    var list = (C.months || []).filter(function (m) { return m && (m.month || m.title || m.text); });
    if (!list.length) { $("months").hidden = true; return; }
    var ring = $("ring"), num = $("rc-num"), name = $("rc-name"), note = $("month-note"),
        nt = $("mn-title"), nx = $("mn-text"), M = C.nextMoon || {};
    var n = list.length, slots = n + 1, dots = [], lit = [], complete = false, celebrated = false;

    for (var i = 0; i < slots; i++) {
      var a = (-90 + (i + 1) * 360 / slots) * Math.PI / 180;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "moon-dot" + (i === n ? " future" : "");
      b.style.setProperty("--x", (50 + 41 * Math.cos(a)).toFixed(3) + "%");
      b.style.setProperty("--y", (50 + 41 * Math.sin(a)).toFixed(3) + "%");
      b.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="md-dark" cx="20" cy="20" r="17"/>' +
        '<path class="md-lit" d=""/></svg><span class="md-num" aria-hidden="true">' + (i + 1) + "</span>";
      b.setAttribute("aria-label", i === n
        ? "Month " + (i + 1) + ", still to come"
        : "Month " + (i + 1) + (list[i].month ? ", " + list[i].month : ""));
      b.addEventListener("click", tap.bind(null, i));
      ring.appendChild(b);
      dots.push(b);
      lit.push(false);
    }

    function waxDot(k) {
      var p = dots[k].querySelector(".md-lit");
      if (REDUCED) { p.setAttribute("d", phase(20, 20, 17, 1)); return; }
      var t0 = 0;
      function step(t) {
        if (!t0) t0 = t;
        var q = Math.min(1, (t - t0) / 950), e = 1 - Math.pow(1 - q, 3);
        p.setAttribute("d", phase(20, 20, 17, e));
        if (q < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function show(title, text, numTxt, nameTxt) {
      num.textContent = numTxt;
      name.textContent = nameTxt;
      nt.textContent = title;
      nx.textContent = text;
      note.classList.remove("swap");
      void note.offsetWidth;
      note.classList.add("swap");
    }
    function select(k) { dots.forEach(function (d, j) { d.classList.toggle("current", j === k); }); }
    function hint() {
      var next = lit.indexOf(false);
      dots.forEach(function (d, j) { d.classList.toggle("next", j === next && j < n); });
    }
    function tap(k) {
      if (k === n) {
        select(k);
        if (complete) {
          show(M.title || "", M.text || "", String(k + 1), M.month || "");
          if (!celebrated) {
            celebrated = true;
            var c = centre(ring);
            fx.burst(c.x, c.y, 80, "heart", { speed: 5.5 });
            buzz([20, 40, 20]);
          }
        } else {
          var left = lit.filter(function (x, j) { return !x && j < n; }).length;
          show("Not yet", "That one's for next month. Fill the other " + word(left) + " first.", String(k + 1), "soon");
        }
        return;
      }
      var m = list[k];
      if (!lit[k]) {
        lit[k] = true;
        dots[k].classList.add("lit");
        waxDot(k);
        var c2 = centre(dots[k]);
        fx.burst(c2.x, c2.y, 14, "spark", { speed: 2.2 });
        buzz(8);
      }
      select(k);
      show(m.title || "", m.text || "", String(k + 1), m.month || "");
      hint();
      if (!complete && lit.slice(0, n).every(Boolean)) {
        complete = true;
        dots[n].classList.add("ready");
        dots[n].setAttribute("aria-label", "Month " + (n + 1) + ", tap me");
        var c3 = centre(ring);
        fx.burst(c3.x, c3.y, 36, "spark", { speed: 3.5 });
      }
    }
    hint();
  }

  /* ---------------- the photo stack ---------------- */
  function buildPhotos(C) {
    var stage = $("stack"), count = $("stack-count");
    var photos = (C.photos || []).filter(function (p) { return p && p.src; });
    if (!photos.length) { $("photos").hidden = true; return; }

    var cards = photos.map(function (p, i) {
      var fig = document.createElement("figure"), rot = ((i * 7) % 11) - 5;
      if (rot === 0) rot = 2;
      fig.className = "polaroid";
      fig.innerHTML = '<div class="shot"><img src="' + esc(p.src) + '" alt="' + esc(p.caption || "A photo of us") +
        '" draggable="false" loading="lazy" decoding="async"></div><figcaption>' + esc(p.caption || "") + "</figcaption>";
      stage.appendChild(fig);
      return { el: fig, rot: rot };
    });
    var order = cards.map(function (x, i) { return i; }), busy = false, drag = null, N = cards.length;

    function rest(c, depth) {
      var d = Math.min(depth, 3);
      return "translate(-50%,0) translateY(" + (d * 7) + "px) scale(" + (1 - d * 0.035).toFixed(3) + ") rotate(" + c.rot + "deg)";
    }
    function layout(skip) {
      order.forEach(function (ci, depth) {
        if (ci === skip) return;
        var c = cards[ci];
        c.el.style.zIndex = String(100 - depth);
        c.el.style.transform = rest(c, depth);
        c.el.style.opacity = depth > 3 ? "0" : "1";
        c.el.setAttribute("aria-hidden", depth === 0 ? "false" : "true");
      });
      count.textContent = (order[0] + 1) + " of " + N;
    }
    function next(dir) {
      if (busy || N < 2) return;
      busy = true;
      var ci = order.shift();
      order.push(ci);
      var c = cards[ci], w = Math.max(window.innerWidth, 640);
      c.el.style.transition = "";
      c.el.style.zIndex = "150";
      c.el.style.transform = "translate(-50%,0) translate(" + Math.round(dir * w * 0.9) + "px,-30px) rotate(" + (c.rot + dir * 24) + "deg)";
      c.el.style.opacity = "0";
      layout(ci);
      setTimeout(function () {
        c.el.style.transition = "none";
        c.el.style.zIndex = String(100 - (N - 1));
        c.el.style.transform = rest(c, N - 1);
        c.el.style.opacity = N - 1 > 3 ? "0" : "1";
        void c.el.offsetWidth;
        c.el.style.transition = "";
        busy = false;
      }, REDUCED ? 30 : 460);
    }
    function prev() {
      if (busy || N < 2) return;
      busy = true;
      var ci = order.pop();
      order.unshift(ci);
      var c = cards[ci], w = Math.max(window.innerWidth, 640);
      c.el.style.transition = "none";
      c.el.style.zIndex = "150";
      c.el.style.opacity = "0";
      c.el.style.transform = "translate(-50%,0) translate(" + Math.round(-w * 0.9) + "px,-30px) rotate(" + (c.rot - 24) + "deg)";
      void c.el.offsetWidth;
      c.el.style.transition = "";
      layout();
      setTimeout(function () { busy = false; }, REDUCED ? 30 : 460);
    }

    stage.addEventListener("pointerdown", function (e) {
      if (busy || (e.pointerType === "mouse" && e.button !== 0)) return;
      var c = cards[order[0]];
      if (!c.el.contains(e.target)) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, dy: 0, moved: false, c: c };
      try { c.el.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      c.el.classList.add("dragging");
    });
    stage.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      drag.dy = e.clientY - drag.y;
      if (Math.abs(drag.dx) > 6 || Math.abs(drag.dy) > 6) drag.moved = true;
      drag.c.el.style.transform = "translate(-50%,0) translate(" + drag.dx + "px," + (drag.dy * 0.3) + "px) rotate(" +
        (drag.c.rot + drag.dx * 0.06).toFixed(2) + "deg)";
    });
    function release(e, cancelled) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag;
      drag = null;
      d.c.el.classList.remove("dragging");
      var v = d.dx / Math.max(1, performance.now() - d.t);
      if (!cancelled && !d.moved) { next(1); return; }
      if (!cancelled && (Math.abs(d.dx) > 85 || Math.abs(v) > 0.5)) { next(d.dx > 0 ? 1 : -1); return; }
      layout();
    }
    stage.addEventListener("pointerup", function (e) { release(e, false); });
    stage.addEventListener("pointercancel", function (e) { release(e, true); });
    stage.addEventListener("lostpointercapture", function (e) { release(e, true); });

    $("stack-next").addEventListener("click", function () { next(1); });
    $("stack-prev").addEventListener("click", prev);
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    });
    layout();
  }

  /* ---------------- hold the heart ---------------- */
  function buildHeart(C) {
    var H = C.heart || {}, btn = $("heart-btn"), liquid = $("heart-liquid"), pctEl = $("heart-pct"), msg = $("heart-msg");
    var FILL = 2.6, OVER = 2.2, TOTAL = FILL + OVER;
    var v = 0, holding = false, done = false, raf = 0, last = 0, wave = 0, spill = 0, marks = {};
    msg.textContent = H.hint || "";

    function level() { return Math.min(1, v / FILL); }
    function pct() {
      if (v <= FILL) return Math.round(v / FILL * 100) + "%";
      var k = Math.min(1, (v - FILL) / OVER);
      return Math.round(100 + Math.pow(k, 2.3) * 899) + "%";
    }
    function liquidPath(lv, off) {
      var y = 92 - lv * 98, amp = lv <= 0.001 ? 0 : 2.6, x = off - 50, up = true;
      var d = "M" + x.toFixed(2) + "," + y.toFixed(2);
      while (x < 150) {
        d += "Q" + (x + 12.5).toFixed(2) + "," + (y + (up ? -amp : amp)).toFixed(2) + " " + (x + 25).toFixed(2) + "," + y.toFixed(2);
        x += 25;
        up = !up;
      }
      return d + "V100H" + (off - 50).toFixed(2) + "Z";
    }
    function frame(t) {
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      if (!done) v = holding ? Math.min(TOTAL, v + dt) : Math.max(0, v - dt * 1.8);
      wave = (wave + dt * (holding ? 40 : 14)) % 50;
      liquid.setAttribute("d", liquidPath(level(), wave));
      var over = Math.max(0, (v - FILL) / OVER);
      btn.style.setProperty("--s", (1 + over * 0.14 + (holding ? 0.03 : 0)).toFixed(3));
      if (!done) pctEl.textContent = pct();
      [25, 50, 75, 100].forEach(function (m) {
        if (holding && !marks[m] && level() * 100 >= m) { marks[m] = 1; buzz(8); }
      });
      if (holding && over > 0) {
        spill -= dt;
        if (spill <= 0) {
          spill = 0.13 - over * 0.09;
          var r = btn.getBoundingClientRect();
          fx.float(r.left + r.width * (0.25 + Math.random() * 0.5), r.top + r.height * 0.18, 1);
        }
      }
      if (holding) msg.textContent = v < FILL ? (H.holding || "") : (H.over || "");
      if (!done && v >= TOTAL) finish();
      if (holding || (v > 0 && !done)) { raf = requestAnimationFrame(frame); }
      else {
        raf = 0;
        last = 0;
        if (!done) { msg.textContent = H.hint || ""; marks = {}; btn.style.setProperty("--s", "1"); }
      }
    }
    function begin(e) {
      if (e && e.cancelable) e.preventDefault();
      if (done) reset();
      holding = true;
      btn.classList.add("holding");
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function end() {
      if (!holding) return;
      holding = false;
      btn.classList.remove("holding");
      if (!done && v > 0) msg.textContent = H.early || "";
    }
    function finish() {
      done = true;
      holding = false;
      btn.classList.remove("holding");
      btn.classList.add("full");
      pctEl.textContent = "∞";
      msg.textContent = H.done || "";
      btn.setAttribute("aria-label", "The heart is full. Press and hold to fill it again.");
      var c = centre(btn);
      fx.burst(c.x, c.y, 80, "heart", { speed: 6 });
      fx.rain(36);
      buzz([30, 50, 30, 50, 90]);
    }
    function reset() {
      done = false;
      v = 0;
      marks = {};
      btn.classList.remove("full");
      btn.setAttribute("aria-label", "Press and hold to fill the heart");
    }

    btn.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      begin(e);
    });
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointercancel", end);
    btn.addEventListener("lostpointercapture", end);
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    btn.addEventListener("keydown", function (e) {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin(); }
    });
    btn.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); end(); }
    });
    btn.addEventListener("blur", end);
    liquid.setAttribute("d", liquidPath(0, 0));
  }

  /* ---------------- the jar ---------------- */
  function buildJar(C) {
    var reasons = (C.reasons || []).filter(Boolean), N = reasons.length;
    if (!N) { $("jar").hidden = true; return; }
    $("jar-intro").textContent = C.reasonsIntro || "";
    var box = $("jar-hearts"), btn = $("jar-btn"), note = $("note"), noteText = $("note-text"), count = $("jar-count");
    var COLS = ["#F29BB2", "#FBF6EC", "#F6C36F", "#E86F92", "#F7D3DC", "#C9456B"];
    var KEY = "eleven-moons-jar";
    var hearts = [], st = restore();

    function fresh() {
      var o = [], i, j, t;
      for (i = 0; i < N - 1; i++) o.push(i);
      for (j = o.length - 1; j > 0; j--) { i = Math.floor(Math.random() * (j + 1)); t = o[j]; o[j] = o[i]; o[i] = t; }
      o.push(N - 1); // the last reason is always the last one out
      return { order: o, pos: 0, n: N };
    }
    function restore() {
      try {
        var s = JSON.parse(localStorage.getItem(KEY) || "null");
        if (s && s.n === N && Array.isArray(s.order) && s.order.length === N && s.pos >= 0 && s.pos <= N) return s;
      } catch (e) { /* storage unavailable */ }
      return fresh();
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage unavailable */ } }

    for (var i = 0; i < N; i++) {
      var row = Math.floor(i / 5), col = i % 5;
      var x = ((col + 0.5 + (row % 2 ? 0.5 : 0)) / 5.5) * 100 + (Math.random() * 6 - 3);
      var y = row * 12 + (Math.random() * 4 - 2);
      var s = document.createElement("span"), colour = COLS[i % COLS.length];
      s.className = "paper-heart";
      s.dataset.c = colour;
      s.style.setProperty("--x", x.toFixed(1) + "%");
      s.style.setProperty("--y", Math.max(0, y).toFixed(1) + "%");
      s.style.setProperty("--r", Math.round(Math.random() * 70 - 35) + "deg");
      s.style.setProperty("--c", colour);
      s.innerHTML = '<svg viewBox="0 0 100 92"><path d="' + HEART_D + '"/></svg>';
      box.appendChild(s);
      hearts.push(s);
    }
    function paint() { hearts.forEach(function (h, k) { h.classList.toggle("gone", k >= N - st.pos); }); }
    function label() {
      count.textContent = st.pos === 0 ? "All " + N + " are still inside"
        : (st.pos >= N ? "All " + N + " pulled. Tap the jar to put them back." : st.pos + " of " + N + " pulled");
    }
    function flyOut(h) {
      if (REDUCED || !h.animate) return;
      var r = h.getBoundingClientRect(), jr = btn.getBoundingClientRect();
      var f = document.createElement("span");
      f.className = "fly-heart";
      f.style.cssText = "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px";
      f.innerHTML = '<svg viewBox="0 0 100 92"><path fill="' + h.dataset.c + '" d="' + HEART_D + '"/></svg>';
      document.body.appendChild(f);
      var dx = (jr.left + jr.width / 2) - (r.left + r.width / 2), up = jr.top - r.top - r.height;
      var anim = f.animate([
        { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
        { transform: "translate(" + dx + "px," + up + "px) rotate(18deg) scale(1.5)", opacity: 1, offset: 0.62 },
        { transform: "translate(" + dx + "px," + (up + 50) + "px) rotate(-8deg) scale(2.3)", opacity: 0 }
      ], { duration: 720, easing: "cubic-bezier(.3,.7,.4,1)" });
      anim.onfinish = function () { f.remove(); };
    }

    btn.addEventListener("click", function () {
      if (st.pos >= N) {
        st = fresh();
        save();
        paint();
        label();
        note.hidden = true;
        return;
      }
      var h = hearts[N - 1 - st.pos];
      flyOut(h);
      var text = reasons[st.order[st.pos]];
      st.pos++;
      save();
      h.classList.add("gone");
      btn.classList.remove("wobble");
      void btn.offsetWidth;
      btn.classList.add("wobble");
      note.hidden = false;
      note.style.setProperty("--nr", (Math.random() * 4 - 2).toFixed(1) + "deg");
      noteText.textContent = text;
      note.classList.remove("pop");
      void note.offsetWidth;
      note.classList.add("pop");
      label();
      buzz(10);
    });
    paint();
    label();
  }

  /* ---------------- scratch cards ---------------- */
  function buildCoupons(C) {
    var list = (C.coupons || []).filter(function (c) { return c && (c.title || c.text); });
    if (!list.length) { $("coupons").hidden = true; return; }
    var wrap = $("tickets");
    var cards = list.map(function (c, i) {
      var t = document.createElement("div");
      t.className = "ticket";
      t.innerHTML = '<div class="ticket-face"><div class="ticket-stub"><svg viewBox="0 0 100 92" aria-hidden="true"><path d="' + HEART_D + '"/></svg></div>' +
        '<div class="ticket-body"><h3>' + esc(c.title) + "</h3><p>" + esc(c.text) + "</p>" +
        (c.valid ? '<p class="valid">' + esc(c.valid) + "</p>" : "") + "</div></div>" +
        '<canvas class="foil" tabindex="0" role="button" aria-label="Scratch card ' + (i + 1) + '. Scratch it, or press Enter to reveal it."></canvas>';
      wrap.appendChild(t);
      return scratch(t, t.querySelector(".foil"));
    });
    cards.forEach(function (c) { c.paint(); });
    if (document.fonts && document.fonts.load) {
      document.fonts.load('600 30px "Caveat"').then(function () {
        cards.forEach(function (c) { if (!c.touched()) c.paint(); });
      }, function () {});
    }
    var lastW = window.innerWidth;
    window.addEventListener("resize", function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      cards.forEach(function (c) { if (!c.done()) c.paint(); });
    });
  }

  function scratch(ticket, cv) {
    var ctx = cv.getContext("2d"), GX = 24, GY = 12, W = 0, H = 0, grid = new Uint8Array(GX * GY);
    var cleared = 0, revealed = false, touched = false, down = null;

    function paint() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      if (!W || !H) return;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#D9A2B3");
      g.addColorStop(0.3, "#F7DCE3");
      g.addColorStop(0.52, "#C88AA0");
      g.addColorStop(0.78, "#F2CAD5");
      g.addColorStop(1, "#B57189");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      for (var i = 0, n = Math.round(W * H / 50); i < n; i++) {
        ctx.fillStyle = "rgba(255,255,255," + (Math.random() * 0.4 + 0.05).toFixed(2) + ")";
        ctx.fillRect(Math.random() * W, Math.random() * H, 1.3, 1.3);
      }
      ctx.fillStyle = "rgba(255,255,255,.2)";
      for (var y = 16, row = 0; y < H; y += 30, row++) {
        for (var x = row % 2 ? 26 : 9; x < W; x += 34) { ctx.save(); ctx.translate(x, y); fx.heart(ctx, 10); ctx.restore(); }
      }
      ctx.fillStyle = "rgba(78,24,52,.85)";
      ctx.font = "600 " + Math.round(Math.min(36, H * 0.25)) + 'px "Caveat", cursive';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Scratch me", W / 2, H / 2);
      grid = new Uint8Array(GX * GY);
      cleared = 0;
      touched = false;
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function mark(p) {
      var R = 18, R2 = R * R;
      var gx0 = Math.max(0, Math.floor((p.x - R) / W * GX)), gx1 = Math.min(GX - 1, Math.floor((p.x + R) / W * GX));
      var gy0 = Math.max(0, Math.floor((p.y - R) / H * GY)), gy1 = Math.min(GY - 1, Math.floor((p.y + R) / H * GY));
      for (var gy = gy0; gy <= gy1; gy++) {
        for (var gx = gx0; gx <= gx1; gx++) {
          var cx = (gx + 0.5) / GX * W, cy = (gy + 0.5) / GY * H, k = gy * GX + gx;
          if (!grid[k] && (cx - p.x) * (cx - p.x) + (cy - p.y) * (cy - p.y) <= R2) { grid[k] = 1; cleared++; }
        }
      }
    }
    function stroke(a, b) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 36;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x + 0.01, b.y);
      ctx.stroke();
      var steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8));
      for (var i = 0; i <= steps; i++) mark({ x: a.x + (b.x - a.x) * i / steps, y: a.y + (b.y - a.y) * i / steps });
      touched = true;
      if (cleared / (GX * GY) > 0.5) reveal();
    }
    function reveal() {
      if (revealed) return;
      revealed = true;
      down = null;
      cv.classList.add("gone");
      ticket.classList.add("revealed");
      cv.setAttribute("aria-hidden", "true");
      cv.tabIndex = -1;
      var c = centre(ticket);
      fx.burst(c.x, c.y, 30, "heart", { speed: 3.6 });
      buzz(20);
    }
    cv.addEventListener("pointerdown", function (e) {
      if (revealed) return;
      down = pos(e);
      stroke(down, down);
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
    });
    cv.addEventListener("pointermove", function (e) {
      if (!down || revealed) return;
      var p = pos(e);
      stroke(down, p);
      down = p;
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (ev) {
      cv.addEventListener(ev, function () { down = null; });
    });
    cv.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); }
    });
    return { paint: paint, done: function () { return revealed; }, touched: function () { return touched; } };
  }

  /* ---------------- the question ---------------- */
  function buildQuestion(C) {
    var Q = C.question || {}, yes = $("yes"), no = $("no"), zone = $("ask-zone"), reply = $("ask-reply");
    var dodges = (Q.dodges || []).filter(Boolean), tries = 0, given = false, givenAt = 0, answered = false, touchAt = -1e9;
    $("ask-q").textContent = Q.ask || "";
    yes.textContent = Q.yes || "Yes";
    no.textContent = Q.no || "No";

    function place() {
      var z = zone.getBoundingClientRect(), y = yes.getBoundingClientRect(), w = no.offsetWidth, h = no.offsetHeight;
      var maxX = Math.max(0, z.width - w), maxY = Math.max(0, z.height - h), pad = 14;
      var yx = y.left - z.left, yy = y.top - z.top, best = null;
      var cx = parseFloat(no.style.left) || 0, cy = parseFloat(no.style.top) || 0;
      for (var i = 0; i < 30; i++) {
        var px = Math.random() * maxX, py = Math.random() * maxY;
        var hit = px < yx + y.width + pad && px + w > yx - pad && py < yy + y.height + pad && py + h > yy - pad;
        var far = Math.hypot(px - cx, py - cy) > Math.min(z.width, 300) * 0.35;
        if (!hit && far) { best = { x: px, y: py }; break; }
        if (!hit && !best) best = { x: px, y: py };
      }
      if (!best) best = { x: 0, y: 0 };
      no.style.left = Math.round(best.x) + "px";
      no.style.top = Math.round(best.y) + "px";
    }
    function dodge(e) {
      if (given || answered) return;
      if (e && e.cancelable) e.preventDefault();
      if (!no.classList.contains("loose")) {
        var z = zone.getBoundingClientRect(), r = no.getBoundingClientRect();
        no.style.left = Math.round(r.left - z.left) + "px";
        no.style.top = Math.round(r.top - z.top) + "px";
        no.classList.add("loose");
        void no.offsetWidth;
      }
      tries++;
      if (tries > dodges.length) {
        given = true;
        givenAt = performance.now();
        no.textContent = Q.giveIn || Q.yes || "Yes";
        return;
      }
      no.textContent = dodges[tries - 1];
      yes.style.setProperty("--grow", Math.min(1.4, 1 + tries * 0.07).toFixed(2));
      place();
    }
    function sayYes(from) {
      if (answered) return;
      answered = true;
      var c = centre(from);
      fx.burst(c.x, c.y, 90, "heart", { speed: 7 });
      fx.rain(70);
      buzz([40, 60, 40, 60, 120]);
      zone.hidden = true;
      $("reply-title").textContent = Q.replyTitle || "";
      $("reply-text").textContent = Q.reply || "";
      reply.hidden = false;
      reply.classList.add("in");
    }
    no.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") dodge(e); });
    no.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      touchAt = performance.now();
      dodge(e);
    });
    no.addEventListener("click", function (e) {
      if (given) { if (performance.now() - givenAt > 400) sayYes(no); return; }
      e.preventDefault();
      if (performance.now() - touchAt < 700) return; // the same tap already dodged
      dodge();
    });
    yes.addEventListener("click", function () { sayYes(yes); });
  }

  /* ---------------- the lantern ---------------- */
  function buildLantern(C) {
    var L = C.lantern || {}, form = $("wish-form"), input = $("wish-input"), btn = $("wish-btn"),
        lan = $("lantern"), tag = $("lantern-tag"), stage = $("lantern-stage"), after = $("wish-after");
    var state = "idle";
    input.placeholder = L.placeholder || "";

    function minis() {
      if (REDUCED) return;
      for (var i = 0; i < 7; i++) {
        var m = document.createElement("span");
        m.className = "mini";
        m.style.left = (8 + Math.random() * 84).toFixed(1) + "%";
        m.style.setProperty("--t", (8 + Math.random() * 6).toFixed(1) + "s");
        m.style.setProperty("--d", (0.4 + Math.random() * 3).toFixed(1) + "s");
        m.style.setProperty("--dx", Math.round(Math.random() * 60 - 30) + "px");
        stage.appendChild(m);
        setTimeout(m.remove.bind(m), 18000);
      }
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (state === "idle") {
        state = "lit";
        lan.classList.add("lit");
        btn.textContent = "Let it go";
        buzz(10);
        return;
      }
      if (state === "lit") {
        state = "flying";
        tag.textContent = input.value.trim();
        input.value = "";
        input.blur();
        input.disabled = true;
        btn.disabled = true;
        lan.classList.add("fly");
        minis();
        setTimeout(function () {
          state = "sent";
          after.textContent = L.sent || "";
          after.hidden = false;
          after.classList.add("in");
          btn.disabled = false;
          btn.textContent = "Send another";
        }, REDUCED ? 300 : 4300);
        return;
      }
      if (state === "sent") {
        state = "idle";
        lan.classList.remove("fly", "lit");
        tag.textContent = "";
        lan.classList.add("back");
        setTimeout(function () { lan.classList.remove("back"); }, 1100);
        input.disabled = false;
        input.value = "";
        btn.textContent = "Light the lantern";
        after.hidden = true;
        after.classList.remove("in");
      }
    });
  }

  /* ---------------- music ---------------- */
  var STREAM = /youtu\.be|youtube\.com|spotify\.com|soundcloud\.com|music\.apple\.com|deezer\.com|tidal\.com/i;
  function buildMusic(C) {
    var M = C.music || {};
    if (!M.url) return;
    var btn = $("music"), label = $("music-label"), raw = String(M.url).trim(), title = M.title || "Play our song";
    btn.hidden = false;
    label.textContent = title;
    if (STREAM.test(raw)) {
      label.textContent = "Needs an audio file";
      btn.title = "Streaming links cannot play here. Upload an mp3 in the editor instead.";
      return;
    }
    var audio = new Audio(), problem = "";
    audio.loop = true;
    audio.volume = 0.6;
    audio.preload = "none";
    audio.src = raw.replace(/ /g, "%20");
    audio.addEventListener("error", function () {
      var code = audio.error && audio.error.code;
      problem = code === 3 || code === 4 ? "That file will not play" : "Song not found";
      label.textContent = problem;
    });
    btn.addEventListener("click", function () {
      if (problem) { label.textContent = problem; return; }
      if (audio.paused) {
        audio.play().then(function () {
          btn.setAttribute("aria-pressed", "true");
          label.textContent = "Pause";
        }).catch(function (err) {
          label.textContent = err && err.name === "NotAllowedError" ? "Tap once more" : (problem || "Song will not play");
        });
      } else {
        audio.pause();
        btn.setAttribute("aria-pressed", "false");
        label.textContent = title;
      }
    });
  }

  /* ---------------- little hearts wherever you tap ---------------- */
  function tapHearts() {
    document.addEventListener("click", function (e) {
      if (e.detail === 0) return;
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("button, a, input, textarea, select, label, canvas, form, .stack, .ring, .paper, .note")) return;
      if (t.closest("#moon-wrap")) { fx.burst(e.clientX, e.clientY, 36, "spark", { speed: 3.6 }); return; }
      fx.float(e.clientX, e.clientY, 5);
    });
  }

  /* ---------------- the sky ---------------- */
  var sky = (function () {
    var c, ctx, w = 0, h = 0, stars = [], shot = null, nextShot = 0, last = 0;
    function size() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (REDUCED) draw(0);
    }
    function seed() {
      var n = Math.min(190, Math.round(window.innerWidth * window.innerHeight / 6500));
      stars = [];
      for (var i = 0; i < n; i++) {
        var big = Math.random() < 0.08, roll = Math.random();
        stars.push({
          x: Math.random(), y: Math.random(),
          r: big ? 1 + Math.random() * 0.7 : 0.35 + Math.random() * 0.6,
          a: 0.25 + Math.random() * 0.65, s: 0.4 + Math.random() * 1.4, p: Math.random() * 6.283,
          c: roll < 0.1 ? "246,195,111" : (roll < 0.18 ? "242,155,178" : "245,239,223")
        });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        ctx.globalAlpha = s.a * (REDUCED ? 1 : 0.6 + 0.4 * Math.sin(t * 0.001 * s.s + s.p));
        ctx.fillStyle = "rgb(" + s.c + ")";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283);
        ctx.fill();
      }
      if (shot) {
        var k = (t - shot.t0) / shot.life;
        if (k >= 1) { shot = null; }
        else {
          var el = t - shot.t0, hx = shot.x + shot.vx * el, hy = shot.y + shot.vy * el;
          var sp = Math.hypot(shot.vx, shot.vy), tx = hx - shot.vx / sp * 120, ty = hy - shot.vy / sp * 120;
          var gr = ctx.createLinearGradient(tx, ty, hx, hy);
          gr.addColorStop(0, "rgba(245,239,223,0)");
          gr.addColorStop(1, "rgba(255,250,235,.95)");
          ctx.globalAlpha = Math.sin(k * Math.PI);
          ctx.strokeStyle = gr;
          ctx.lineWidth = 1.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx, hy);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    function frame(t) {
      requestAnimationFrame(frame);
      if (!shot && t > nextShot) {
        var left = Math.random() < 0.5;
        shot = {
          t0: t, life: 1100,
          x: (left ? 0.1 + Math.random() * 0.4 : 0.5 + Math.random() * 0.4) * w, y: Math.random() * h * 0.35,
          vx: (left ? 1 : -1) * (0.55 + Math.random() * 0.3), vy: 0.22 + Math.random() * 0.15
        };
        nextShot = t + 10000 + Math.random() * 14000;
      }
      if (!shot && t - last < 40) return;
      last = t;
      draw(t);
    }
    function start() {
      c = $("sky");
      ctx = c.getContext("2d");
      seed();
      size();
      window.addEventListener("resize", size);
      if (!REDUCED) {
        nextShot = performance.now() + 5000 + Math.random() * 6000;
        requestAnimationFrame(frame);
      }
    }
    return { start: start };
  })();

  /* ---------------- hearts and sparks ---------------- */
  var fx = (function () {
    var c, ctx, w = 0, h = 0, parts = [], running = false, HP = null;
    var COLS = ["242,155,178", "245,239,223", "246,195,111", "232,111,146", "255,214,224"];
    try { HP = new Path2D(HEART_D); } catch (e) { HP = null; }

    function heart(g, s) {
      if (HP) {
        g.scale(s / 100, s / 100);
        g.translate(-50, -46);
        g.beginPath();
        g.fill(HP);
        g.beginPath();
        return;
      }
      g.beginPath();
      g.moveTo(0, -0.18 * s);
      g.bezierCurveTo(-0.1 * s, -0.46 * s, -0.52 * s, -0.42 * s, -0.5 * s, -0.1 * s);
      g.bezierCurveTo(-0.48 * s, 0.16 * s, -0.16 * s, 0.32 * s, 0, 0.5 * s);
      g.bezierCurveTo(0.16 * s, 0.32 * s, 0.48 * s, 0.16 * s, 0.5 * s, -0.1 * s);
      g.bezierCurveTo(0.52 * s, -0.42 * s, 0.1 * s, -0.46 * s, 0, -0.18 * s);
      g.closePath();
      g.fill();
    }
    function size() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      c = $("fx");
      ctx = c.getContext("2d");
      size();
      window.addEventListener("resize", size);
    }
    function add(p) {
      parts.push(p);
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.life -= p.decay;
        if (p.life <= 0 || p.y > h + 60 || (p.vy < 0 && p.y < -60)) { parts.splice(i, 1); continue; }
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.globalAlpha = Math.min(1, p.life * 1.6);
        ctx.fillStyle = "rgb(" + p.col + ")";
        if (p.kind === "heart") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          heart(ctx, p.s);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, 6.283);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(loop);
      else { running = false; ctx.clearRect(0, 0, w, h); }
    }
    function pick() { return COLS[(Math.random() * COLS.length) | 0]; }
    function burst(x, y, n, kind, o) {
      if (!ctx) return;
      if (REDUCED) n = Math.min(n, 10);
      var sp = (o && o.speed) || 5;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, v = sp * (0.35 + Math.random() * 0.75);
        var isHeart = kind === "heart" ? Math.random() < 0.8 : Math.random() < 0.15;
        add({
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.35, g: 0.09, drag: 0.985,
          s: isHeart ? 8 + Math.random() * 10 : 1 + Math.random() * 2.2,
          rot: Math.random() * 0.8 - 0.4, vr: (Math.random() - 0.5) * 0.08,
          life: 1, decay: 0.009 + Math.random() * 0.01, col: pick(), kind: isHeart ? "heart" : "dot"
        });
      }
    }
    function float(x, y, n) {
      if (!ctx) return;
      for (var i = 0; i < n; i++) {
        add({
          x: x + (Math.random() - 0.5) * 16, y: y, vx: (Math.random() - 0.5) * 1.1, vy: -(1 + Math.random() * 1.4),
          g: -0.012, drag: 0.99, s: 8 + Math.random() * 8, rot: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 0.04,
          life: 1, decay: 0.014 + Math.random() * 0.01, col: COLS[(Math.random() * 3) | 0], kind: "heart"
        });
      }
    }
    function rain(n) {
      if (!ctx || REDUCED) return;
      for (var i = 0; i < n; i++) {
        add({
          x: Math.random() * w, y: -20 - Math.random() * h * 0.6, vx: (Math.random() - 0.5) * 0.8, vy: 1.4 + Math.random() * 2,
          g: 0.02, drag: 0.995, s: 9 + Math.random() * 12, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.06,
          life: 1, decay: 0.0035 + Math.random() * 0.003, col: pick(), kind: "heart"
        });
      }
    }
    return { init: init, burst: burst, float: float, rain: rain, heart: heart };
  })();

  /* go */
  load(function (json) { start(merge(DEFAULT, json)); });
})();
