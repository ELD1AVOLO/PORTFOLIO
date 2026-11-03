/* =====================================================================
   main.js — langue (FR / EN / AR), thème, démos plein écran, formulaire.
   Le contenu est dans index.html ; les traductions dans js/i18n.js.
   Sans JavaScript, la page reste lisible en français et les démos
   s'ouvrent dans un nouvel onglet.
   ===================================================================== */

(() => {
  "use strict";

  const root = document.documentElement;
  const LANGS = ["fr", "en", "ar"];
  const { strings: STRINGS = {}, ui: UI = {} } = window.SITE_I18N || {};
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} },
  };
  const uiText = (key) => (UI[root.lang] && UI[root.lang][key]) || (UI.fr && UI.fr[key]) || "";
  // Fondu enchaîné quand le navigateur sait le faire (View Transitions), sinon changement direct.
  // Un fondu ne déplace rien : il reste actif même quand le système réduit les animations.
  const withTransition = (change) => {
    if (document.startViewTransition) document.startViewTransition(change);
    else change();
  };

  // Clés de l'ancienne version : thème enregistré d'office et profil du visiteur (nom, métier).
  try { ["theme", "yahya_portfolio_profile_v1"].forEach((key) => localStorage.removeItem(key)); } catch (_) {}

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Langue ---------- */
  // Le français d'origine est mémorisé au premier passage, pour pouvoir y revenir.
  const originalHTML = new WeakMap();
  const originalAttrs = new WeakMap();
  const parsePairs = (spec) => spec.split(";").map((pair) => pair.split(":").map((part) => part.trim()));

  function translate(lang) {
    const table = lang === "fr" ? null : STRINGS[lang] || {};
    const missing = (key) => table && console.warn(`[i18n] ${lang} : clé manquante « ${key} »`);

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      if (!originalHTML.has(element)) originalHTML.set(element, element.innerHTML);
      const value = table ? table[element.dataset.i18n] : undefined;
      if (value === undefined) missing(element.dataset.i18n);
      const next = value ?? originalHTML.get(element);
      if (element.innerHTML !== next) element.innerHTML = next;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      const pairs = parsePairs(element.dataset.i18nAttr);
      if (!originalAttrs.has(element)) {
        originalAttrs.set(element, Object.fromEntries(pairs.map(([attr]) => [attr, element.getAttribute(attr)])));
      }
      const saved = originalAttrs.get(element);
      pairs.forEach(([attr, key]) => {
        const value = table ? table[key] : undefined;
        if (value === undefined) missing(key);
        if (value ?? saved[attr]) element.setAttribute(attr, value ?? saved[attr]);
      });
    });
  }

  function setLanguage(lang, { remember = false } = {}) {
    if (!LANGS.includes(lang)) lang = "fr";
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    translate(lang);
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
    if (remember) {
      store.set("lang", lang);
      // L'URL garde la langue : un lien partagé s'ouvre dans la même langue.
      const url = new URL(location.href);
      if (lang === "fr") url.searchParams.delete("lang");
      else url.searchParams.set("lang", lang);
      history.replaceState(history.state, "", url);
    }
    document.dispatchEvent(new CustomEvent("site:language", { detail: { lang } }));
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => withTransition(() => setLanguage(button.dataset.lang, { remember: true })));
  });
  setLanguage(root.lang);

  /* ---------- Thème ---------- */
  const themeButton = document.getElementById("theme");
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : darkQuery.matches);

  function syncTheme() {
    const dark = isDark();
    themeButton?.setAttribute("aria-pressed", String(dark));
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", dark ? "#121315" : "#fcfcfa");
    });
  }

  themeButton?.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    store.set("site-theme", next);
    withTransition(() => {
      root.dataset.theme = next;
      syncTheme();
    });
  });
  darkQuery.addEventListener?.("change", syncTheme);
  syncTheme();

  /* ---------- Apparitions au défilement ---------- */
  // data-reveal n'est posé (donc l'élément masqué) que si ce script tourne :
  // sans JavaScript, tout reste visible. Le CSS fait un fondu, et ajoute la
  // montée seulement si le système n'a pas demandé moins d'animations.
  const REVEAL = ".section__title, .section > .project, .minor > .project, .entry, .skills > div, .certs li, .sub, .langlist, .contact > *";
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      // Les éléments qui entrent ensemble arrivent en cascade (70 ms d'écart, 5 au plus).
      entries.filter((entry) => entry.isIntersecting).forEach((entry, index) => {
        entry.target.style.setProperty("--i", String(Math.min(index, 5)));
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    document.querySelectorAll(REVEAL).forEach((element) => {
      element.setAttribute("data-reveal", "");
      observer.observe(element);
    });
  }

  // Rejoue l'entrée de l'intro (appelé quand l'accueil se ferme).
  function replayIntro() {
    document.querySelectorAll(".intro > *").forEach((element) => {
      element.style.animation = "none";
      void element.offsetWidth;
      element.style.animation = "";
    });
  }

  /* ---------- Statut sous le nom : change toutes les 7 secondes ---------- */
  // Le suivant descend du haut, l'actuel sort par le bas. Pause au survol, quand
  // l'onglet est caché ou quand l'intro n'est plus à l'écran.
  const roles = document.querySelector(".roles");
  if (roles) {
    const items = [...roles.querySelectorAll(".roles__item")];
    const SWITCH_EVERY = 7000;
    let index = Math.max(0, items.findIndex((item) => item.classList.contains("is-current")));
    let timer = null;
    let onScreen = true;
    let hovered = false;

    const showNext = () => {
      const from = items[index];
      index = (index + 1) % items.length;
      const to = items[index];
      from.classList.remove("is-current");
      to.classList.add("is-current");
      if (!to.animate) return;
      const timing = { duration: 650, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" };
      from.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(100%)", opacity: 0 }], timing);
      to.animate([{ transform: "translateY(-100%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], timing);
    };
    const schedule = () => {
      clearInterval(timer);
      timer = !document.hidden && onScreen && !hovered ? setInterval(showNext, SWITCH_EVERY) : null;
    };
    const line = roles.closest(".intro__role");
    line.addEventListener("pointerenter", () => { hovered = true; schedule(); });
    line.addEventListener("pointerleave", () => { hovered = false; schedule(); });
    document.addEventListener("visibilitychange", schedule);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; schedule(); }).observe(roles);
    }
    schedule();
  }

  /* ---------- Marque-page : le ruban suit la lecture ---------- */
  // Son bout descend quand on descend et remonte quand on remonte. Sur grand écran,
  // il s'arrête en face de la section en cours, dans la marge ; sur mobile, c'est
  // une simple jauge de lecture.
  const ribbon = document.querySelector(".ribbon");
  const marginLinks = [...document.querySelectorAll(".margin-nav a")];
  const marginSections = marginLinks.map((link) => document.querySelector(link.getAttribute("href")));
  const wideScreen = window.matchMedia("(min-width: 64rem)");
  let ribbonQueued = false;

  function placeRibbon() {
    ribbonQueued = false;
    if (!ribbon) return;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    let end;
    let current = -1;
    if (wideScreen.matches && marginLinks.length) {
      // Milieu de chaque lien de la marge, en pixels depuis le haut de l'écran
      const marks = marginLinks.map((link) => {
        const box = link.getBoundingClientRect();
        return box.top + box.height / 2;
      });
      const reading = scrollY + innerHeight * 0.3; // la ligne de lecture
      const tops = marginSections.map((section) => section.getBoundingClientRect().top + scrollY);
      if (scrollY >= maxScroll - 2) {
        current = marks.length - 1;
        end = marks[current];
      } else if (reading < tops[0]) {
        end = marks[0] * Math.max(0.35, reading / tops[0]);
      } else {
        current = tops.findLastIndex((top) => top <= reading);
        const next = tops[current + 1] ?? document.documentElement.scrollHeight;
        const through = Math.min(1, (reading - tops[current]) / Math.max(1, next - tops[current]));
        end = marks[current] + through * ((marks[current + 1] ?? marks[current]) - marks[current]);
      }
      end += 12; // le bout dépasse un peu le lien
    } else {
      end = 48 + (scrollY / maxScroll) * innerHeight * 0.35;
    }
    ribbon.style.setProperty("--ribbon-h", `${Math.round(end)}px`);
    marginLinks.forEach((link, i) => {
      if (i === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  const queueRibbon = () => {
    if (ribbonQueued) return;
    ribbonQueued = true;
    requestAnimationFrame(placeRibbon);
  };
  window.addEventListener("scroll", queueRibbon, { passive: true });
  window.addEventListener("resize", queueRibbon);
  wideScreen.addEventListener?.("change", queueRibbon);
  document.addEventListener("site:language", queueRibbon);
  if (ribbon) {
    // Le ruban se déroule une fois à l'arrivée, puis suit le défilement sans délai.
    const unroll = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (unroll) ribbon.classList.add("is-unrolling");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      placeRibbon();
      if (unroll) setTimeout(() => ribbon.classList.remove("is-unrolling"), 1200);
    }));
  }

  /* ---------- Démos plein écran ---------- */
  // Chaque projet avec démo porte data-demo (fichier) et data-demo-size (ex. "1600x920").
  // La démo est rendue à cette taille puis réduite pour tenir dans la fenêtre.
  const dialog = document.getElementById("demo");
  const stage = dialog?.querySelector(".demo__stage");
  const frame = dialog?.querySelector(".demo__frame");
  const loading = dialog?.querySelector(".demo__loading");
  const demoTitle = dialog?.querySelector(".demo__title");
  const demoTab = dialog?.querySelector(".demo__tab");
  const roomForDemo = window.matchMedia("(min-width: 48rem) and (min-height: 30rem)");
  let demoSize = null;
  let demoLoading = false;

  function fitDemo() {
    if (!demoSize || !stage || !frame) return;
    const { width, height } = stage.getBoundingClientRect();
    const scale = Math.min(width / demoSize.w, height / demoSize.h);
    frame.style.width = `${demoSize.w}px`;
    frame.style.height = `${demoSize.h}px`;
    frame.style.left = `${Math.max(0, (width - demoSize.w * scale) / 2)}px`;
    frame.style.top = `${Math.max(0, (height - demoSize.h * scale) / 2)}px`;
    frame.style.transform = `scale(${scale})`;
  }

  function openDemo(project) {
    const [w, h] = (project.dataset.demoSize || "1440x900").split("x").map(Number);
    demoSize = { w, h };
    demoTitle.textContent = project.dataset.demoTitle || "";
    demoTab.href = project.dataset.demo;
    frame.title = project.dataset.demoTitle || "Demo";
    loading.hidden = false;
    demoLoading = true;
    frame.src = project.dataset.demo;
    dialog.showModal();
    fitDemo();
  }

  if (dialog && typeof dialog.showModal === "function") {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-demo-open]");
      if (!trigger) return;
      // Petit écran, ou Ctrl/Cmd/Maj-clic : on laisse le lien ouvrir un nouvel onglet.
      if (!roomForDemo.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
      const project = trigger.closest("[data-demo]");
      if (!project) return;
      event.preventDefault();
      openDemo(project);
    });

    frame.addEventListener("load", () => {
      if (demoLoading) loading.hidden = true;
    });
    dialog.querySelector(".demo__close").addEventListener("click", () => dialog.close());
    // Clic sur le fond assombri
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      demoLoading = false;
      demoSize = null;
      frame.src = "about:blank"; // arrête l'app de démo
    });
    window.addEventListener("resize", () => { if (dialog.open) fitDemo(); });
  }

  /* ---------- « Demander une démonstration » : pré-remplit le sujet ---------- */
  document.querySelectorAll("[data-subject]").forEach((link) => {
    link.addEventListener("click", () => {
      const subject = document.getElementById("f-subject");
      if (subject) subject.value = link.dataset.subject;
      document.getElementById("f-name")?.focus({ preventScroll: true });
    });
  });

  /* ---------- Formulaire de contact ---------- */
  // Envoi via FormSubmit (pas de serveur à gérer). Le tout premier envoi déclenche
  // un email d'activation à CONTACT_EMAIL : il suffit de cliquer sur "Activate".
  const CONTACT_EMAIL = "elmoussaifmail@gmail.com";
  const CONTACT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
  const form = document.getElementById("contact-form");

  if (form) {
    const status = document.getElementById("f-status");
    const submit = document.getElementById("f-submit");
    const setStatus = (key, state = "") => {
      status.textContent = key ? uiText(key) : "";
      status.dataset.state = state;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return; // champ piège rempli => robot
      const name = String(data.name || "").trim();
      const email = String(data.email || "").trim();
      const subject = String(data.subject || "").trim();
      const message = String(data.message || "").trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      form.querySelectorAll("[required]").forEach((field) => {
        const invalid = !field.value.trim() || (field.type === "email" && !emailOk);
        field.setAttribute("aria-invalid", String(invalid));
      });
      if (!name || !emailOk || !message) {
        setStatus("invalid", "error");
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      submit.disabled = true;
      setStatus("sending", "pending");
      try {
        const response = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name, email, message,
            _subject: `Portfolio — ${subject || "Nouveau message"} (${name})`,
            _replyto: email,
            _template: "table",
            _captcha: "false",
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || String(result.success) === "false") throw new Error(result.message || String(response.status));
        form.reset();
        form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
        setStatus("sent", "success");
      } catch (_) {
        // Repli : ouvre la messagerie du visiteur avec le message pré-rempli
        setStatus("failed", "error");
        const body = `${message}\n\n— ${name} (${email})`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || "Contact portfolio")}&body=${encodeURIComponent(body)}`;
      } finally {
        submit.disabled = false;
      }
    });

    form.addEventListener("input", (event) => {
      if (event.target.getAttribute("aria-invalid") === "true") event.target.setAttribute("aria-invalid", "false");
    });
  }

  // Utilisé par welcome.js (diapositives d'accueil)
  window.Site = {
    setLanguage: (lang) => withTransition(() => setLanguage(lang, { remember: true })),
    uiText,
    replayIntro,
  };
})();
