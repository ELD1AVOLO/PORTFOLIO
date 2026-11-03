/* =====================================================================
   welcome.js — diapositives d'accueil, à la première visite, sur une petite
   feuille arrachée au cahier, posée au milieu de la page :
   1. la langue, 2. qui visite (et un prénom facultatif), 3. par où commencer.
   Les réponses restent dans le navigateur (localStorage « site-visitor ») :
   elles servent à saluer le visiteur et à pré-remplir le formulaire de contact.
   Le lien « Revoir l'introduction » du pied de page rouvre l'accueil.
   Pas d'accueil quand le lien vise une section (#contact…) ou avec ?welcome=0.
   ===================================================================== */

(() => {
  "use strict";

  const dialog = document.getElementById("welcome");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const root = document.documentElement;
  const site = window.Site || {};
  const KEY = "site-visitor";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const slides = [...dialog.querySelectorAll("[data-slide]")];
  const bars = [...dialog.querySelectorAll(".welcome__progress span")];
  const back = dialog.querySelector("[data-welcome-back]");
  const next = dialog.querySelector("[data-welcome-next]");
  const enter = dialog.querySelector("[data-welcome-enter]");
  const nameInput = document.getElementById("welcome-name");
  const named = dialog.querySelector("[data-welcome-named]");
  const greeting = document.getElementById("greeting");

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
  const write = (value) => { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (_) {} };
  const fill = (key, name) => (site.uiText ? site.uiText(key) : "").replace("{name}", name);

  let visitor = read();
  let role = visitor.role || "";
  let current = 0;
  let moving = false;

  /* ---------- Ce que l'accueil change sur la page ---------- */
  function personalise() {
    const name = (visitor.name || "").trim();
    if (greeting) {
      greeting.hidden = !name;
      greeting.textContent = name ? fill("greet", name) : "";
    }
    if (named) {
      named.hidden = !name;
      named.textContent = name ? fill("welcomeNamed", name) : "";
      named.previousElementSibling.hidden = Boolean(name);
    }
    const contactName = document.getElementById("f-name");
    if (contactName && name && !contactName.value) contactName.value = name;
  }

  function save(extra = {}) {
    visitor = { v: 1, ...visitor, role, name: nameInput.value.trim().slice(0, 40), ...extra };
    write(visitor);
    personalise();
  }

  /* ---------- Choix ---------- */
  function markLanguage() {
    dialog.querySelectorAll("[data-welcome-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.welcomeLang === root.lang));
    });
  }

  function setRole(value) {
    role = value;
    dialog.querySelectorAll("[data-role]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.role === value));
    });
    showForRole();
  }

  // Diapositive 3 : texte et boutons selon le profil (« curieux » par défaut).
  // Les diapositives sont superposées : sans ce tri, la 3e, avec tous ses textes,
  // donnerait sa hauteur à la feuille.
  function showForRole() {
    const profile = role || "curious";
    dialog.querySelectorAll("[data-for]").forEach((element) => {
      element.hidden = !element.dataset.for.split(" ").includes(profile);
    });
  }

  /* ---------- Navigation entre diapositives ---------- */
  function updateChrome(index) {
    bars.forEach((bar, i) => {
      bar.classList.toggle("is-current", i === index);
      bar.classList.toggle("is-done", i < index);
    });
    back.hidden = index === 0;
    next.hidden = index === slides.length - 1;
    enter.hidden = index !== slides.length - 1;
    dialog.setAttribute("aria-labelledby", slides[index].querySelector("h2").id);
  }

  function go(index) {
    if (moving || index === current || index < 0 || index >= slides.length) return;
    const from = slides[current];
    const to = slides[index];
    const forward = index > current;
    current = index;
    updateChrome(index);

    const show = () => {
      from.hidden = true;
      to.hidden = false;
      to.querySelector("h2").focus({ preventScroll: true });
    };
    if (!to.animate) { show(); return; }

    // La diapositive glisse dans le sens de lecture (inversé en arabe) ;
    // simple fondu, sans glissement, si le système réduit les animations.
    const shift = reducedMotion.matches ? 0 : (forward ? 1 : -1) * (root.dir === "rtl" ? -1 : 1) * 28;
    moving = true;
    const exit = from.animate(
      [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-shift}px)` }],
      { duration: 180, easing: "ease-in", fill: "forwards" },
    );
    exit.finished
      .catch(() => {})
      .then(() => {
        show();
        exit.cancel();
        return to.animate(
          [{ opacity: 0, transform: `translateX(${shift}px)` }, { opacity: 1, transform: "none" }],
          { duration: 380, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
        ).finished.catch(() => {});
      })
      .finally(() => { moving = false; });
  }

  /* ---------- Ouverture et fermeture ---------- */
  function open(index = 0) {
    visitor = read();
    nameInput.value = visitor.name || "";
    setRole(visitor.role || "");
    markLanguage();
    current = index;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    updateChrome(index);
    dialog.showModal();
  }

  function finish() {
    save({ done: true });
    if (dialog.open) dialog.close();
  }

  dialog.querySelectorAll("[data-welcome-lang]").forEach((button) => {
    button.addEventListener("click", () => site.setLanguage?.(button.dataset.welcomeLang));
  });
  dialog.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });
  next.addEventListener("click", () => {
    if (current === 1) save();
    go(current + 1);
  });
  back.addEventListener("click", () => go(current - 1));
  enter.addEventListener("click", finish);
  dialog.querySelector("[data-welcome-skip]").addEventListener("click", finish);
  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); next.click(); }
  });
  // Liens de la diapositive 3 : l'accueil se ferme, puis le lien fait son travail
  // (défiler vers une section, télécharger le CV, ouvrir la démo).
  dialog.querySelectorAll("[data-welcome-close]").forEach((link) => link.addEventListener("click", finish));
  // Échap : comme « Passer »
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); finish(); });
  dialog.addEventListener("close", () => site.replayIntro?.());
  document.addEventListener("site:language", () => { markLanguage(); personalise(); });
  document.querySelectorAll("[data-welcome-open]").forEach((button) => {
    button.addEventListener("click", () => open(0));
  });

  /* ---------- Première visite ---------- */
  personalise();
  const deepLink = location.hash && location.hash !== "#top";
  const optOut = new URLSearchParams(location.search).get("welcome") === "0";
  if (!visitor.done && !deepLink && !optOut) open(0);
})();
