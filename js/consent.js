(function () {
  "use strict";

  var GTM_ID = "GTM-KFTT22ZR";
  var KEY = "ij-consent";
  var TEXTS = {
    sk: {
      title: "Cookies a meranie návštevnosti",
      body: "Ak súhlasíte, použijem Google Analytics (cez Google Tag Manager) na anonymné meranie návštevnosti. Bez vášho súhlasu sa nič z Googlu nenačíta.",
      accept: "Súhlasím",
      reject: "Odmietnuť",
      more: "Viac informácií",
      settings: "Nastavenia cookies"
    },
    en: {
      title: "Cookies and traffic measurement",
      body: "If you agree, I use Google Analytics (via Google Tag Manager) to measure traffic anonymously. Nothing from Google is loaded without your consent.",
      accept: "Accept",
      reject: "Reject",
      more: "Learn more",
      settings: "Cookie settings"
    }
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  /* Consent Mode v2: všetko zamietnuté, kým návštevník nesúhlasí */
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  var loaded = false;
  function loadGtm() {
    if (loaded) return;
    loaded = true;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(s);
  }

  function readChoice() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === "granted" || v === "denied" ? v : null;
    } catch (e) { return null; }
  }

  function saveChoice(v) {
    try { window.localStorage.setItem(KEY, v); } catch (e) { /* súkromné okno */ }
  }

  function apply(choice) {
    if (choice === "granted") {
      gtag("consent", "update", { analytics_storage: "granted" });
      loadGtm();
    } else {
      gtag("consent", "update", {
        ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied"
      });
    }
  }

  var root = document.documentElement;
  var banner = null;
  function lang() { return root.lang === "en" ? "en" : "sk"; }

  function fill() {
    if (!banner) return;
    var t = TEXTS[lang()];
    banner.setAttribute("aria-label", t.title);
    banner.querySelector(".cc-title").textContent = t.title;
    banner.querySelector(".cc-body").textContent = t.body;
    banner.querySelector(".cc-accept").textContent = t.accept;
    banner.querySelector(".cc-reject").textContent = t.reject;
    banner.querySelector(".cc-more").textContent = t.more;
  }

  function node(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function choose(v) {
    saveChoice(v);
    apply(v);
    root.classList.add("cc-off");
    if (v === "denied" && loaded) window.location.reload(); /* odstráni už načítaný GTM */
  }

  /* Lištu nájdeme v HTML (index.html ju má predvykreslenú, aby bola súčasťou prvého vykreslenia),
     inak ju vytvoríme. */
  function ensureBanner() {
    if (banner) return;
    banner = document.querySelector(".cc");
    if (!banner) {
      banner = node("div", "cc");
      banner.setAttribute("role", "dialog");
      var title = node("p", "cc-title");
      var body = node("p", "cc-body");
      var actions = node("div", "cc-actions");
      var reject = node("button", "cc-btn cc-reject"); reject.type = "button";
      var accept = node("button", "cc-btn cc-accept"); accept.type = "button";
      var more = node("a", "cc-more"); more.href = "/sukromie.html";
      actions.appendChild(reject); actions.appendChild(accept);
      banner.appendChild(title); banner.appendChild(body); banner.appendChild(actions); banner.appendChild(more);
      document.body.appendChild(banner);
    }
    banner.querySelector(".cc-reject").addEventListener("click", function () { choose("denied"); });
    banner.querySelector(".cc-accept").addEventListener("click", function () { choose("granted"); });
    fill();
  }

  function show() {
    ensureBanner();
    root.classList.remove("cc-off");
    banner.querySelector(".cc-accept").focus();
  }

  var choice = readChoice();
  if (choice) {
    apply(choice);
    root.classList.add("cc-off"); /* skryje predvykreslenú lištu ešte pred prvým vykreslením */
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureBanner();
    var link = document.getElementById("cookie-settings");
    if (link) {
      if (!link.textContent) link.textContent = TEXTS[lang()].settings;
      link.addEventListener("click", show);
    }
    new MutationObserver(fill).observe(root, { attributes: true, attributeFilter: ["lang"] });
  });
})();
