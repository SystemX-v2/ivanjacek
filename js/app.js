(function () {
  "use strict";

  var DEFAULT_LANG = "sk";
  var STORAGE_KEY = "ij-lang";
  var current = null;
  var content = null;
  var statsSeen = false;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var dialog = document.getElementById("project-dialog");
  var revealObserver = null;
  var statObserver = null;

  root.classList.add("js");

  /* ---------- helpers ---------- */

  function storedLang() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      return v === "sk" || v === "en" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function saveLang(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* súkromné okno */ }
  }

  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function formatNumber(n) {
    try {
      return new Intl.NumberFormat(current === "sk" ? "sk-SK" : "en-US").format(n);
    } catch (e) {
      return String(n);
    }
  }

  /* ---------- scroll effects ---------- */

  function observeReveals() {
    var items = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    }
    items.forEach(function (n) { revealObserver.observe(n); });
  }

  function statText(node, n) {
    return formatNumber(n) + (node.getAttribute("data-suffix") || "");
  }

  function animateCount(node, target) {
    if (reduceMotion.matches) {
      node.textContent = statText(node, target);
      return;
    }
    var start = null;
    var duration = 1600;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = statText(node, Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function observeStats() {
    var list = document.getElementById("stat-list");
    if (statsSeen) {
      list.querySelectorAll(".stat-value").forEach(function (n) {
        n.textContent = statText(n, Number(n.getAttribute("data-value")));
      });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      statsSeen = true;
      list.querySelectorAll(".stat-value").forEach(function (n) {
        n.textContent = statText(n, Number(n.getAttribute("data-value")));
      });
      return;
    }
    if (statObserver) statObserver.disconnect();
    statObserver = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      statsSeen = true;
      statObserver.disconnect();
      list.querySelectorAll(".stat-value").forEach(function (n) {
        animateCount(n, Number(n.getAttribute("data-value")));
      });
    }, { threshold: 0.4 });
    statObserver.observe(list);
  }

  function initScrollProgress() {
    var bar = document.querySelector(".progress");
    var ticking = false;
    function update() {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    var backdrop = document.getElementById("nav-backdrop");
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      backdrop.hidden = !open;
    }
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    backdrop.addEventListener("click", function () { setOpen(false); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 760) setOpen(false); });
  }

  function initToTop() {
    var btn = document.getElementById("to-top");
    var ticking = false;
    function update() {
      var show = window.scrollY > window.innerHeight * 0.6;
      btn.classList.toggle("is-visible", show);
      btn.setAttribute("aria-hidden", show ? "false" : "true");
      btn.tabIndex = show ? 0 : -1;
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    btn.addEventListener("click", function () {
      var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    });
    update();
  }

  /* ---------- rendering ---------- */

  var rotatorTimer = null;

  function renderRotator(words) {
    var box = document.getElementById("rotator");
    box.textContent = "";
    if (rotatorTimer) { window.clearInterval(rotatorTimer); rotatorTimer = null; }
    var spans = words.map(function (w, i) {
      var s = el("span", i === 0 ? "is-active" : null, w);
      box.appendChild(s);
      return s;
    });
    if (reduceMotion.matches || spans.length < 2) return;
    var index = 0;
    rotatorTimer = window.setInterval(function () {
      if (document.hidden) return;
      var current = spans[index];
      index = (index + 1) % spans.length;
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      spans[index].classList.remove("is-leaving");
      spans[index].classList.add("is-active");
      window.setTimeout(function () { current.classList.remove("is-leaving"); }, 600);
    }, 2600);
  }

  function renderOrbit(projects, label) {
    var orbit = document.getElementById("orbit");
    var ring = document.getElementById("orbit-ring");
    var svg = document.getElementById("orbit-lines");
    orbit.setAttribute("aria-label", label);

    /* On a language switch only refresh the texts: rebuilding the nodes would restart their
       counter-rotation animation and leave the logos tilted against the spinning ring. */
    var existing = ring.querySelectorAll(".node");
    if (existing.length === projects.length) {
      existing.forEach(function (node, i) {
        node.setAttribute("aria-label", projects[i].name);
        node.querySelector(".node-label").textContent = projects[i].name;
        var initial = node.querySelector(".node-inner > span:not(.node-label)");
        if (initial) initial.textContent = projects[i].name.charAt(0);
      });
      return;
    }
    existing.forEach(function (n) { n.remove(); });
    svg.querySelectorAll(".orbit-link").forEach(function (n) { n.remove(); });

    var ns = "http://www.w3.org/2000/svg";
    var radius = 42;
    projects.forEach(function (p, i) {
      var angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
      var x = 50 + radius * Math.cos(angle);
      var y = 50 + radius * Math.sin(angle);

      var line = document.createElementNS(ns, "line");
      line.setAttribute("class", "orbit-link");
      line.setAttribute("x1", "50");
      line.setAttribute("y1", "50");
      line.setAttribute("x2", x.toFixed(2));
      line.setAttribute("y2", y.toFixed(2));
      svg.appendChild(line);

      var node = el("button", "node");
      node.type = "button";
      node.style.setProperty("--x", x.toFixed(2) + "%");
      node.style.setProperty("--y", y.toFixed(2) + "%");
      node.setAttribute("aria-label", p.name);
      var inner = el("span", "node-inner");
      if (p.image) {
        var img = el("img", p.image_kind === "cover" ? "cover" : null);
        img.src = p.image;
        img.alt = "";
        img.decoding = "async";
        inner.appendChild(img);
      } else {
        inner.appendChild(el("span", null, p.name.charAt(0)));
      }
      inner.appendChild(el("span", "node-label", p.name));
      node.appendChild(inner);
      node.addEventListener("click", function () { openProject(p.id, node); });
      ring.appendChild(node);
    });
  }

  function renderMarquee(m) {
    document.getElementById("marquee-label").textContent = m.label;
    ["marquee-a", "marquee-b"].forEach(function (id) {
      var ul = document.getElementById(id);
      ul.textContent = "";
      m.items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    });
  }

  function renderStats(items) {
    var list = document.getElementById("stat-list");
    list.textContent = "";
    items.forEach(function (s, i) {
      var li = el("li", "stat reveal");
      li.style.setProperty("--d", (i * 0.08) + "s");
      var v = el("span", "stat-value", "0");
      v.setAttribute("data-value", String(s.value));
      v.setAttribute("data-suffix", s.suffix || "");
      v.textContent = statsSeen ? statText(v, s.value) : "0";
      li.appendChild(v);
      li.appendChild(el("span", "stat-label", s.label));
      list.appendChild(li);
    });
    observeStats();
  }

  function renderProjects(items, ui) {
    var list = document.getElementById("project-list");
    list.textContent = "";
    items.forEach(function (p, i) {
      var card = el("article", "project reveal" + (p.status === "archive" ? " archive" : ""));
      card.id = "project-" + p.id;
      card.style.setProperty("--d", (i * 0.07) + "s");

      if (p.image) {
        var fig = el("div", "media " + (p.image_kind === "cover" ? "cover" : "logo"));
        var img = el("img");
        img.src = p.image;
        img.alt = p.image_alt || "";
        img.loading = "lazy";
        img.decoding = "async";
        fig.appendChild(img);
        card.appendChild(fig);
      }

      card.appendChild(el("h3", null, p.name));
      if (p.status === "archive") card.appendChild(el("span", "tag", ui.archive));
      card.appendChild(el("p", "role", p.role));
      card.appendChild(el("p", "text", p.text));

      var btn = el("button", "open", ui.detail);
      btn.type = "button";
      btn.setAttribute("aria-label", ui.detail + ": " + p.name);
      btn.addEventListener("click", function (e) { e.stopPropagation(); openProject(p.id, btn); });
      card.appendChild(btn);

      card.addEventListener("click", function () { openProject(p.id, btn); });
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      list.appendChild(card);
    });
  }

  function renderSegments(items, projects) {
    var list = document.getElementById("segment-list");
    list.textContent = "";
    var names = {};
    projects.forEach(function (p) { names[p.id] = p.name; });
    items.forEach(function (s, i) {
      var box = el("article", "segment reveal");
      box.style.setProperty("--d", (i * 0.07) + "s");
      box.appendChild(el("h3", null, s.name));
      box.appendChild(el("p", null, s.text));
      var chips = el("div", "chips");
      s.projects.forEach(function (id) {
        var c = el("button", "chip", names[id]);
        c.type = "button";
        c.addEventListener("click", function () { openProject(id, c); });
        chips.appendChild(c);
      });
      box.appendChild(chips);
      list.appendChild(box);
    });
  }

  function renderExpertise(items) {
    var list = document.getElementById("expertise-list");
    list.textContent = "";
    items.forEach(function (it, i) {
      var box = el("article", "expertise-item reveal");
      box.style.setProperty("--d", (i * 0.06) + "s");
      box.appendChild(el("h3", null, it.title));
      box.appendChild(el("p", null, it.text));
      list.appendChild(box);
    });
  }

  function renderArticles(items, ui) {
    var list = document.getElementById("article-list");
    list.textContent = "";
    items.forEach(function (a, i) {
      var card = el("article", "article reveal");
      card.style.setProperty("--d", (i * 0.07) + "s");
      card.appendChild(el("p", "meta", a.tag + " – " + a.minutes + " " + ui.minutes_label));
      card.appendChild(el("h3", null, a.title));
      card.appendChild(el("p", "perex", a.perex));
      var btn = el("button", "open", ui.read);
      btn.type = "button";
      btn.setAttribute("aria-label", ui.read + ": " + a.title);
      btn.addEventListener("click", function (e) { e.stopPropagation(); openArticle(a.id, btn); });
      card.appendChild(btn);
      card.addEventListener("click", function () { openArticle(a.id, btn); });
      list.appendChild(card);
    });
  }

  /* ---------- dialogs ---------- */

  function showDialog(opener) {
    dialog._opener = opener || null;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      document.body.classList.add("locked");
    } else {
      dialog.setAttribute("open", "");
    }
    dialog.scrollTop = 0;
  }

  function openArticle(id, opener) {
    var a = content.articles.items.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    var ui = content.ui;

    dialog.textContent = "";
    var close = el("button", "dialog-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", ui.close);
    close.addEventListener("click", function () { dialog.close(); });
    dialog.appendChild(close);

    var body = el("div", "dialog-body");
    body.appendChild(el("p", "meta", a.tag + " – " + a.minutes + " " + ui.minutes_label));
    var h = el("h3", null, a.title);
    h.id = "dialog-title";
    body.appendChild(h);
    body.appendChild(el("p", "summary", a.perex));

    var text = el("div", "article-body");
    a.body.forEach(function (block) {
      text.appendChild(el("h4", null, block.h));
      block.p.forEach(function (para) { text.appendChild(el("p", null, para)); });
    });
    body.appendChild(text);
    dialog.appendChild(body);
    showDialog(opener);
  }

  /* ---------- project dialog ---------- */

  function buildList(tag, className, entries) {
    var list = el(tag, className);
    entries.forEach(function (t) { list.appendChild(el("li", null, t)); });
    return list;
  }

  function openProject(id, opener) {
    var p = content.projects.items.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var ui = content.ui;
    var d = p.details;

    dialog.textContent = "";
    var body = el("div", "dialog-body");

    var close = el("button", "dialog-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", ui.close);
    close.addEventListener("click", function () { dialog.close(); });
    dialog.appendChild(close);

    if (p.image) {
      var fig = el("div", "media " + (p.image_kind === "cover" ? "cover" : "logo"));
      var img = el("img");
      img.src = p.image;
      img.alt = p.image_alt || "";
      fig.appendChild(img);
      body.appendChild(fig);
    }

    var h = el("h3", null, p.name);
    h.id = "dialog-title";
    body.appendChild(h);
    body.appendChild(el("p", "role", p.role));
    if (p.status === "archive") body.appendChild(el("p", "ended-note", ui.ended));
    body.appendChild(el("p", "summary", d.summary));

    var tabs = el("div", "tabs");
    tabs.setAttribute("role", "tablist");
    var defs = [
      { key: "how", label: ui.tab_how, panel: buildList("ol", "steps", d.how) },
      { key: "benefits", label: ui.tab_benefits, panel: buildList("ul", "benefits", d.benefits) },
      { key: "for", label: ui.tab_for, panel: buildList("ul", "audience", d.for) }
    ];
    var buttons = [];
    var panels = [];

    function select(index, focus) {
      buttons.forEach(function (b, i) {
        b.setAttribute("aria-selected", String(i === index));
        b.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) buttons[index].focus();
    }

    defs.forEach(function (def, i) {
      var b = el("button", "tab", def.label);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.id = "tab-" + def.key;
      b.setAttribute("aria-controls", "panel-" + def.key);
      b.addEventListener("click", function () { select(i, false); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % defs.length, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); select((i + defs.length - 1) % defs.length, true); }
      });
      buttons.push(b);
      tabs.appendChild(b);

      var panel = el("div", "panel");
      panel.id = "panel-" + def.key;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", b.id);
      panel.appendChild(def.panel);
      panels.push(panel);
    });
    body.appendChild(tabs);
    panels.forEach(function (pn) { body.appendChild(pn); });
    select(0, false);

    if (p.url) {
      var a = el("a", "button visit", ui.visit + " – " + p.name);
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      body.appendChild(a);
    }

    dialog.appendChild(body);
    showDialog(opener);
  }

  dialog.addEventListener("close", function () {
    document.body.classList.remove("locked");
    if (dialog._opener && dialog._opener.focus) dialog._opener.focus();
  });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
  });

  /* ---------- page ---------- */

  function render(c) {
    content = c;
    root.lang = current;
    document.title = c.meta.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", c.meta.description);

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var value = get(c, node.getAttribute("data-i18n"));
      if (typeof value === "string") node.textContent = value;
    });

    renderRotator(c.hero.words);
    renderOrbit(c.projects.items, c.hero.orbit_label);
    var photo = document.getElementById("hero-photo");
    photo.src = c.hero.photo;
    photo.alt = c.hero.photo_alt;

    renderExpertise(c.expertise.items);
    renderArticles(c.articles.items, c.ui);
    renderMarquee(c.marquee);
    renderStats(c.stats.items);
    renderProjects(c.projects.items, c.ui);
    renderSegments(c.segments.items, c.projects.items);

    var email = document.getElementById("contact-email");
    email.href = "mailto:" + c.contact.email;
    email.textContent = c.contact.email;
    var phone = document.getElementById("contact-phone");
    phone.href = "tel:" + c.contact.phone.replace(/\s+/g, "");
    phone.textContent = c.contact.phone;
    var li = document.getElementById("contact-linkedin");
    li.href = c.contact.linkedin;
    li.textContent = c.contact.linkedin_label;

    document.getElementById("year").textContent = String(new Date().getFullYear());
    document.querySelector(".lang").setAttribute("aria-label", c.ui.language);
    document.getElementById("to-top").setAttribute("aria-label", c.ui.to_top);
    document.getElementById("nav-toggle").setAttribute("aria-label", c.ui.menu);
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === current));
    });

    observeReveals();
  }

  function showError(lang) {
    var msg = lang === "en"
      ? "Could not load the content. Run the page through a local server: python3 -m http.server 8000"
      : "Obsah sa nepodarilo načítať. Spusti stránku cez lokálny server: python3 -m http.server 8000";
    var p = el("p", "load-error", msg);
    p.setAttribute("role", "alert");
    var main = document.querySelector("main");
    main.insertBefore(p, main.firstChild);
  }

  function loadLang(lang) {
    var previous = current;
    current = lang;
    return fetch("content/" + lang + ".json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (c) {
        var old = document.querySelector(".load-error");
        if (old) old.remove();
        if (dialog.open) dialog.close();
        render(c);
        saveLang(lang);
      })
      .catch(function () {
        current = previous || lang;
        showError(lang);
      });
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { loadLang(b.getAttribute("data-lang")); });
  });

  initScrollProgress();
  initToTop();
  initNav();
  window.loadLang = loadLang;
  window.render = render;
  loadLang(storedLang() || DEFAULT_LANG);
})();
