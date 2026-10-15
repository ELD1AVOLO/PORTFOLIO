/* =====================================================================
   main.js — Logique du site
   - génère les cartes de projets
   - gère l'ouverture / fermeture de la grande fenêtre (modal)
   - démarre les éclairs (hero, contact, modal)
   - nav mobile, année du footer, apparition au scroll
   ===================================================================== */

// Marque le JS comme prêt dès le chargement de ce script.
// Si le JS ne se charge pas / plante, le contenu reste visible (pas de page blanche).
document.documentElement.classList.add("js-ready");

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Année footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} },
  };

  // Anti-cache pour les démos : valeur fixée au chargement de la page.
  // => la démo est rechargée si tu rafraîchis la page (tu vois tes maj),
  //    mais reste en cache si tu rouvres la fenêtre dans la même session.
  const DEMO_BUILD = Date.now();
  const withBust = (u) => u + (u.includes("?") ? "&" : "?") + "v=" + DEMO_BUILD;

  /* ---------- Palettes de thème (sombre / clair) ---------- */
  const THEMES = {
    dark: {
      fx:      { glow: "#4cc9f0", color: "#9fd8ff", core: "#ffffff", blend: "screen" },
      hero:    { glow: "#4cc9f0", color: "#9fd8ff", core: "#ffffff", bg: "rgba(5,6,12,0.32)" },
      connect: { glow: "#b14cff", color: "#e6c6ff", core: "#ffffff", bg: "rgba(5,6,12,0.32)" },
      modalCore: "#ffffff", modalBg: "rgba(8,10,18,0.40)", icon: "moon",
    },
    light: {
      fx:      { glow: "#7c3aed", color: "#4c1d95", core: "#160a36", blend: "multiply" },
      hero:    { glow: "#7c3aed", color: "#5b21b6", core: "#160a36", bg: "rgba(245,246,251,0.34)" },
      connect: { glow: "#2563eb", color: "#1e3a8a", core: "#0b1030", bg: "rgba(245,246,251,0.34)" },
      modalCore: "#160a36", modalBg: "rgba(245,246,251,0.42)", icon: "sun",
    },
  };
  // Icône du sprite SVG défini en haut de index.html
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const savedTheme = safeStorage.get("theme");
  let currentTheme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  /* ---------- Éclairs ---------- */
  // Overlay global : suit la souris sur toute la page
  // (toujours actifs, même si Windows a les animations réduites : c'est l'identité du site)
  let fx = null, hero = null, connect = null;
  if (window.LightningCanvas) {
    fx = new LightningCanvas(document.getElementById("fxCanvas"), {
      pointer: true, transparent: true, maxBolts: 4,
    });
    // Ambiance : éclairs qui tombent dans le hero et le contact
    hero = new LightningCanvas(document.getElementById("heroCanvas"), { intensity: 0.55, maxBolts: 2 });
    connect = new LightningCanvas(document.getElementById("connectCanvas"), { intensity: 0.4, maxBolts: 2 });
    fx.start(); hero.start(); connect.start();
  } else {
    document.querySelectorAll(".fx-canvas, .hero__canvas, .connect__canvas").forEach((canvas) => {
      canvas.hidden = true;
    });
  }

  /* ---------- Application d'un thème ---------- */
  function applyTheme(name) {
    if (!THEMES[name]) name = "dark";
    currentTheme = name;
    const t = THEMES[name];
    document.body.classList.toggle("light", name === "light");
    document.documentElement.dataset.theme = name;
    fx?.configure(t.fx);
    hero?.configure(t.hero);
    connect?.configure(t.connect);
    document.querySelector("#themeToggle .theme-toggle__icon").innerHTML = icon(t.icon);
    const themeButton = document.getElementById("themeToggle");
    themeButton.setAttribute("aria-pressed", String(name === "light"));
    themeButton.setAttribute("aria-label", name === "light" ? "Activer le thème sombre" : "Activer le thème clair");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", name === "light" ? "#f7f9fc" : "#070a12");
    safeStorage.set("theme", name);
  }
  applyTheme(currentTheme);

  document.getElementById("themeToggle").addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  document.addEventListener("visibilitychange", () => {
    [fx, hero, connect].filter(Boolean).forEach((canvas) => {
      if (document.hidden) canvas.stop(); else canvas.start();
    });
  });

  /* ---------- Logos distants : second essai puis repli texte ---------- */
  document.querySelectorAll("img[data-fallback-src], .brand-logo img, .edu__photo img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.fallbackSrc && img.dataset.fallbackTried !== "true") {
        img.dataset.fallbackTried = "true";
        img.src = img.dataset.fallbackSrc;
        return;
      }
      img.closest(".brand-logo")?.classList.add("has-error");
      img.closest(".edu__photo")?.classList.add("no-img");
    });
  });

  /* ---------- Compteurs animés (stats du hero) ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = target + suffix; return;
    }
    const dur = 1400, start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }
  // les stats sont visibles d'emblée (dans le hero) -> on lance après l'entrée du hero
  setTimeout(() => document.querySelectorAll("[data-count]").forEach(animateCount), 500);

  /* ---------- Boutons magnétiques (façon agence) ---------- */
  function attachMagnetic(el) {
    if (matchMedia("(hover: none)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const S = 0.3;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * S;
      const y = (e.clientY - r.top - r.height / 2) * S;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }
  document.querySelectorAll(".magnetic").forEach(attachMagnetic);

  /* ---------- Effet d'inclinaison 3D au survol (façon agence) ---------- */
  function attachTilt(el) {
    // pas d'effet sur écran tactile ni en mouvement réduit
    if (matchMedia("(hover: none)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const MAX = 6;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `perspective(800px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) translateY(-8px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }

  const INTERFACE_COPY = {
    fr: {
      open: "Ouvrir le projet", close: "Fermer", madeAt: "Réalisé chez", interactive: "Démo interactive (données factices) — naviguez à l’intérieur", reload: "Relancer la démo", live: "En production", contribution: "Contribution", personal: "Projet perso",
      demoLive: "Démo interactive", demoSoon: "Démo à venir",
      soonEyebrow: "Démo bientôt disponible", soonTitle: "Désolé, la démo de ce projet n’est pas encore en ligne.",
      soonText: "Je prépare une version interactive. En attendant, le détail du projet et sa stack technique sont juste à côté.",
      askDemo: "Demander une présentation", askDemoSubject: (t) => `Présentation du projet ${t}`,
      sending: "Envoi en cours…", sent: "Merci ! Votre message a bien été envoyé, je vous réponds rapidement.",
      invalid: "Merci de renseigner votre nom, un email valide et votre message.",
      failed: "L’envoi a échoué. Votre messagerie va s’ouvrir pour l’envoyer directement.",
    },
    en: {
      open: "Open project", close: "Close", madeAt: "Built at", interactive: "Interactive demo (sample data) — explore inside", reload: "Restart demo", live: "In production", contribution: "Contribution", personal: "Personal project",
      demoLive: "Interactive demo", demoSoon: "Demo coming soon",
      soonEyebrow: "Demo coming soon", soonTitle: "Sorry, the demo for this project isn’t online yet.",
      soonText: "I’m preparing an interactive version. In the meantime, the project details and tech stack are right next to this.",
      askDemo: "Request a walkthrough", askDemoSubject: (t) => `Walkthrough of ${t}`,
      sending: "Sending…", sent: "Thank you! Your message has been sent, I’ll get back to you quickly.",
      invalid: "Please enter your name, a valid email and your message.",
      failed: "Sending failed. Your email app will open so you can send it directly.",
    },
    ar: {
      open: "افتح المشروع", close: "إغلاق", madeAt: "أُنجز لدى", interactive: "تجربة تفاعلية ببيانات تجريبية", reload: "إعادة تشغيل العرض", live: "قيد الإنتاج", contribution: "مساهمة", personal: "مشروع شخصي",
      demoLive: "عرض تفاعلي", demoSoon: "العرض قريباً",
      soonEyebrow: "العرض التجريبي قريباً", soonTitle: "عذراً، العرض التجريبي لهذا المشروع غير متاح بعد.",
      soonText: "أعمل على نسخة تفاعلية. في الأثناء، تجد تفاصيل المشروع والتقنيات المستخدمة بجانب هذا النص.",
      askDemo: "اطلب عرضاً للمشروع", askDemoSubject: (t) => `عرض مشروع ${t}`,
      sending: "جارٍ الإرسال…", sent: "شكراً! تم إرسال رسالتك، وسأرد عليك قريباً.",
      invalid: "يرجى إدخال اسمك وبريد إلكتروني صحيح ورسالتك.",
      failed: "تعذّر الإرسال. سيُفتح تطبيق البريد لإرسالها مباشرة.",
    },
  };
  const interfaceLanguage = () => ["fr", "en", "ar"].includes(document.documentElement.lang) ? document.documentElement.lang : "fr";
  const interfaceText = () => INTERFACE_COPY[interfaceLanguage()];

  function translatedStatus(status) {
    if (/prod/i.test(status || "")) return interfaceText().live;
    if (/contribution/i.test(status || "")) return interfaceText().contribution;
    if (/perso/i.test(status || "")) return interfaceText().personal;
    return status || "";
  }

  /* ---------- Génération des cartes ---------- */
  const cardsEl = document.getElementById("cards");
  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  projects.forEach((p, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `${p.title} — ouvrir le projet`);
    card.style.setProperty("--accent", p.accent || "#4cc9f0");
    card.style.animationDelay = `${i * 80}ms`;
    const isLive = /prod/i.test(p.status || "");
    const hasDemo = !!(p.preview && p.preview.type === "app" && p.preview.url);
    const techPreview = (p.tech || []).slice(0, 4)
      .map((t) => `<span>${t}</span>`).join("");
    card.innerHTML = `
      <div class="card__glow"></div>
      <div class="card__sheen"></div>
      <div class="card__top">
        <span class="card__tag">${p.tag}</span>
        ${p.status ? `<span class="card__status ${isLive ? "is-live" : ""}">${isLive ? '<i></i>' : ""}<span>${translatedStatus(p.status)}</span></span>` : ""}
      </div>
      <h3 class="card__title">${p.title}</h3>
      <p class="card__short">${p.short}</p>
      <div class="card__stack">${techPreview}${(p.tech || []).length > 4 ? `<span class="card__more">+${p.tech.length - 4}</span>` : ""}</div>
      <div class="card__foot">
        <span class="card__open">${interfaceText().open} ${icon("arrow")}</span>
        <span class="card__demo ${hasDemo ? "is-ready" : ""}">${icon(hasDemo ? "play" : "clock")}<span>${hasDemo ? interfaceText().demoLive : interfaceText().demoSoon}</span></span>
      </div>
    `;
    card.addEventListener("click", () => openModal(p, card));
    attachTilt(card);
    cardsEl.appendChild(card);
    card._project = p;
  });

  function refreshGeneratedCopy() {
    cardsEl.querySelectorAll(".card").forEach((card) => {
      const project = card._project;
      if (!project) return;
      const openLabel = card.querySelector(".card__open");
      if (openLabel) openLabel.innerHTML = `${interfaceText().open} ${icon("arrow")}`;
      const demo = card.querySelector(".card__demo > span");
      if (demo) demo.textContent = card.querySelector(".card__demo").classList.contains("is-ready") ? interfaceText().demoLive : interfaceText().demoSoon;
      const status = card.querySelector(".card__status > span");
      if (status) status.textContent = translatedStatus(project.status);
      card.setAttribute("aria-label", `${project.title} — ${interfaceText().open}`);
    });
    document.querySelector(".modal__close")?.setAttribute("aria-label", interfaceText().close);
  }
  document.addEventListener("portfolio:locale-changed", refreshGeneratedCopy);

  /* ---------- Modal ---------- */
  const modal = document.getElementById("modal");
  const modalWindow = modal.querySelector(".modal__window");
  const modalCanvasEl = document.getElementById("modalCanvas");
  let modalLightning = null;
  let appResize = null; // listener resize pour mettre à l'échelle la démo
  let modalTrigger = null;
  let previewRun = 0;
  const previewTimers = new Set();
  modal.setAttribute("inert", "");

  function schedulePreview(callback, delay, run = previewRun) {
    const timer = window.setTimeout(() => {
      previewTimers.delete(timer);
      if (run === previewRun) callback();
    }, delay);
    previewTimers.add(timer);
    return timer;
  }

  function cancelPreview() {
    previewRun += 1;
    previewTimers.forEach((timer) => window.clearTimeout(timer));
    previewTimers.clear();
  }

  function openModal(p, trigger) {
    cancelPreview();
    const run = previewRun;
    modalTrigger = trigger || document.activeElement;
    // démo d'app interactive => fenêtre large, une seule colonne
    modal.classList.toggle("modal--wide", !!(p.preview && p.preview.type === "app"));
    document.getElementById("modalTag").textContent = p.tag;
    document.getElementById("modalTitle").textContent = p.title;
    document.getElementById("modalDesc").textContent = p.desc;

    // fonctionnalités clés (optionnel)
    const featEl = document.getElementById("modalFeatures");
    featEl.innerHTML = (p.features || []).map((f) => `<li>${f}</li>`).join("");

    // logos des entités (optionnel) — ex : "Réalisé chez ..."
    const orgsEl = document.getElementById("modalOrgs");
    orgsEl.innerHTML = (p.orgLogos && p.orgLogos.length)
      ? `<span class="modal__orgs-label">${interfaceText().madeAt}</span>` +
        p.orgLogos.map((o) => {
          const img = `<img src="${o.src}" alt="${o.alt || ""}" onerror="this.style.display='none'" />`;
          return o.url ? `<a href="${o.url}" target="_blank" rel="noopener">${img}</a>` : img;
        }).join("")
      : "";

    // technologies
    const techEl = document.getElementById("modalTech");
    techEl.innerHTML = p.tech.map((t) => `<li>${t}</li>`).join("");

    // liens
    const linksEl = document.getElementById("modalLinks");
    linksEl.innerHTML = (p.links || []).filter((link) => link.url && link.url !== "#")
      .map((l) => `<a href="${l.url}" target="_blank" rel="noopener" class="btn btn--ghost btn--sm">${l.label} ↗</a>`)
      .join("");

    // "simulation" du projet
    renderPreview(p, run);

    // ouverture
    modal.removeAttribute("inert");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-overlay");
    document.getElementById("nav").setAttribute("inert", "");
    document.getElementById("mainContent").setAttribute("inert", "");
    requestAnimationFrame(() => modalWindow.focus({ preventScroll: true }));

    // éclairs dans la fenêtre (couleur = accent du projet, cœur selon le thème)
    if (window.LightningCanvas) {
      const t = THEMES[currentTheme];
      modalLightning = new LightningCanvas(modalCanvasEl, {
        intensity: 0.65, glow: p.accent || "#4cc9f0", color: p.accent || "#9fd8ff",
        core: t.modalCore, bg: t.modalBg, maxBolts: 3,
      });
      modalLightning.start();
    }
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;
    cancelPreview();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-overlay");
    document.getElementById("nav").removeAttribute("inert");
    document.getElementById("mainContent").removeAttribute("inert");
    if (modalLightning) { modalLightning.destroy(); modalLightning = null; }
    if (appResize) { window.removeEventListener("resize", appResize); appResize = null; }
    document.getElementById("modalPreview").innerHTML = "";
    modal.setAttribute("inert", "");
    if (modalTrigger && document.contains(modalTrigger)) modalTrigger.focus({ preventScroll: true });
    modalTrigger = null;
  }

  modal.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
    if (e.key !== "Tab") return;
    const focusable = [...modalWindow.querySelectorAll('button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])')]
      .filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Rendu de la "simulation" (stateless) ---------- */
  function renderPreview(p, run) {
    const stage = document.getElementById("modalPreview");
    const pv = p.preview || { type: "lightning" };

    if (pv.type === "app" && pv.url) {
      // Flux : terminal "run dev" -> écran navigable (iframe) dans un cadre navigateur
      stage.innerHTML = `
        <div class="appsim">
          <div class="appsim__boot" id="appBoot">
            <div class="sim sim--code"><div class="sim__bar"><i></i><i></i><i></i></div><pre id="simPre"></pre></div>
          </div>
          <div class="appsim__screen" id="appScreen">
            <div class="browser">
              <div class="browser__bar">
                <span class="browser__dots"><i></i><i></i><i></i></span>
                <span class="browser__url">${pv.fakeUrl || "localhost:3000"}</span>
                <button class="browser__reload" id="appReload" type="button" aria-label="${interfaceText().reload}" title="${interfaceText().reload}">${icon("reload")}</button>
              </div>
              <div class="browser__viewport" id="appViewport">
                <iframe class="browser__frame" id="appFrame" title="${p.title}"></iframe>
              </div>
            </div>
            <p class="appsim__hint">${interfaceText().interactive}</p>
          </div>
        </div>`;
      const boot = pv.boot || ["$ npm run dev", "▲ démarrage du serveur…", "✓ compilé avec succès",
                               "→ http://" + (pv.fakeUrl || "localhost:3000")];
      const frame = document.getElementById("appFrame");
      const viewport = document.getElementById("appViewport");
      const loadDemo = () => { frame.src = withBust(pv.url); };

      // "Dézoom" : on rend la démo sur un écran virtuel large (baseWidth) puis
      // on la réduit pour tenir dans la fenêtre => les composants ne sont pas écrasés.
      const baseW = pv.baseWidth, baseH = pv.baseHeight;
      if (baseW && baseH) {
        const fit = () => {
          const w = viewport.clientWidth;
          if (!w) return;
          const s = w / baseW;
          frame.style.width = baseW + "px";
          frame.style.height = baseH + "px";
          frame.style.transformOrigin = "top left";
          frame.style.transform = "scale(" + s + ")";
          viewport.style.height = Math.round(baseH * s) + "px";
        };
        appResize = fit;
        window.addEventListener("resize", appResize);
        // applique une 1re fois dès que l'écran est révélé (largeur dispo)
        viewport._fit = fit;
      }

      typeLines(boot, document.getElementById("simPre"), () => {
        schedulePreview(() => {
          const bootElement = document.getElementById("appBoot");
          const screenElement = document.getElementById("appScreen");
          if (!bootElement || !screenElement || run !== previewRun) return;
          bootElement.classList.add("is-hidden");
          screenElement.classList.add("is-on");
          if (viewport._fit) viewport._fit();   // calcule l'échelle une fois visible
          loadDemo(); // chargement de l'iframe après le boot
        }, 500, run);
      }, run);
      const reloadBtn = document.getElementById("appReload");
      if (reloadBtn) reloadBtn.addEventListener("click", () => {
        frame.src = "about:blank"; schedulePreview(loadDemo, 60, run);
      });
    } else if (pv.type === "iframe" && pv.url) {
      stage.innerHTML = `<iframe class="sim sim--iframe" src="${pv.url}" loading="lazy" title="${p.title}"></iframe>`;
    } else if (pv.type === "image" && pv.url) {
      stage.innerHTML = `<img class="sim sim--img" src="${pv.url}" alt="${p.title}" />`;
    } else if (pv.type === "code") {
      stage.innerHTML = `<div class="sim sim--code"><div class="sim__bar"><i></i><i></i><i></i></div><pre id="simPre"></pre></div>`;
      typeLines(pv.lines || [], document.getElementById("simPre"), null, run);
    } else {
      // pas encore de démo jouable : message "démo à venir" + demande de présentation
      const copy = interfaceText();
      stage.innerHTML = `
        <div class="sim sim--soon">
          <span class="soon__icon">${icon("clock")}</span>
          <span class="soon__eyebrow">${copy.soonEyebrow}</span>
          <p class="soon__title">${copy.soonTitle}</p>
          <p class="soon__text">${copy.soonText}</p>
          <button class="btn btn--ghost btn--sm" type="button" id="askDemo">${copy.askDemo} ${icon("arrow")}</button>
        </div>`;
      document.getElementById("askDemo").addEventListener("click", () => {
        closeModal();
        const subject = document.getElementById("contactSubject");
        if (subject) subject.value = copy.askDemoSubject(p.title);
        goToAnchor("#connect");
        setTimeout(() => document.getElementById("contactForm")?.querySelector("input[name=name]")?.focus({ preventScroll: true }), reducedMotion ? 0 : 700);
      });
    }
  }

  // effet machine à écrire ; onDone() appelé à la fin
  function typeLines(lines, el, onDone, run = previewRun) {
    let li = 0, ci = 0;
    if (!el || run !== previewRun) return;
    if (reducedMotion) {
      el.textContent = lines.join("\n");
      if (onDone) onDone();
      return;
    }
    el.textContent = "";
    function tick() {
      if (run !== previewRun || !el.isConnected) return;
      if (li >= lines.length) { if (onDone) onDone(); return; }
      const line = lines[li];
      if (ci <= line.length) {
        el.textContent =
          lines.slice(0, li).join("\n") + (li > 0 ? "\n" : "") + line.slice(0, ci);
        ci++;
        schedulePreview(tick, 18 + Math.random() * 40, run);
      } else {
        li++; ci = 0;
        schedulePreview(tick, 280, run);
      }
    }
    tick();
  }

  /* ---------- Formulaire de contact ---------- */
  // Envoi via FormSubmit (pas de serveur à gérer). Le tout premier envoi déclenche
  // un email d'activation à CONTACT_EMAIL : il suffit de cliquer sur "Activate".
  const CONTACT_EMAIL = "elmoussaifmail@gmail.com";
  const CONTACT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const status = document.getElementById("contactStatus");
    const submit = document.getElementById("contactSubmit");
    const setStatus = (text, state = "") => { status.textContent = text; status.dataset.state = state; };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm));
      if (data._honey) return; // champ piège rempli => robot
      const name = String(data.name || "").trim();
      const email = String(data.email || "").trim();
      const subject = String(data.subject || "").trim();
      const message = String(data.message || "").trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      contactForm.querySelectorAll("[required]").forEach((field) => {
        const invalid = !field.value.trim() || (field.type === "email" && !emailOk);
        field.setAttribute("aria-invalid", String(invalid));
      });
      if (!name || !emailOk || !message) { setStatus(interfaceText().invalid, "error"); return; }

      submit.disabled = true;
      setStatus(interfaceText().sending, "pending");
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
        contactForm.reset();
        contactForm.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
        setStatus(interfaceText().sent, "success");
      } catch (_) {
        // repli : ouvre la messagerie du visiteur avec le message pré-rempli
        setStatus(interfaceText().failed, "error");
        const body = `${message}\n\n— ${name} (${email})`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || "Contact portfolio")}&body=${encodeURIComponent(body)}`;
      } finally {
        submit.disabled = false;
      }
    });
    contactForm.addEventListener("input", (event) => {
      if (event.target.getAttribute("aria-invalid") === "true") event.target.setAttribute("aria-invalid", "false");
    });
  }

  /* ---------- Nav : burger mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const primaryNav = document.getElementById("primaryNav");
  const mobileNavQuery = window.matchMedia("(max-width: 1050px)");

  function setMenu(open, { returnFocus = false } = {}) {
    const shouldOpen = Boolean(open && mobileNavQuery.matches);
    nav.classList.toggle("nav--open", shouldOpen);
    burger.setAttribute("aria-expanded", String(shouldOpen));
    burger.setAttribute("aria-label", shouldOpen ? "Fermer le menu" : "Ouvrir le menu");
    if (mobileNavQuery.matches && !shouldOpen) primaryNav.setAttribute("inert", "");
    else primaryNav.removeAttribute("inert");
    if (returnFocus) burger.focus({ preventScroll: true });
  }

  burger.addEventListener("click", () => setMenu(!nav.classList.contains("nav--open")));
  function goToAnchor(hash, { updateHistory = true, focus = false } = {}) {
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16);
    if (updateHistory && location.hash !== hash) history.pushState(null, "", hash);
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    if (focus) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      event.preventDefault();
      setMenu(false);
      goToAnchor(hash, { focus: link.classList.contains("skip-link") });
    });
  });
  document.addEventListener("pointerdown", (event) => {
    if (nav.classList.contains("nav--open") && !nav.contains(event.target)) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("nav--open")) setMenu(false, { returnFocus: true });
  });
  const syncMenuMode = () => setMenu(false);
  mobileNavQuery.addEventListener?.("change", syncMenuMode);
  syncMenuMode();

  /* ---------- Nav : fond, progression, retour haut et scroll-spy ---------- */
  const spyIds = ["about", "experience", "projects", "skills", "education", "certifications", "languages", "connect"];
  const spySections = spyIds.map((id) => document.getElementById(id)).filter(Boolean);
  const navLinks = [...document.querySelectorAll(".nav__links a")];
  const progress = document.getElementById("scrollProgress");
  const toTop = document.getElementById("toTop");
  let scrollTicking = false;

  function updateScrollUI() {
    scrollTicking = false;
    nav.classList.toggle("nav--scrolled", window.scrollY > 40);
    toTop.classList.toggle("is-visible", window.scrollY > 620);
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, window.scrollY / maxScroll)})`;

    const y = window.scrollY + Math.max(130, nav.offsetHeight + 48);
    let current = "";
    spySections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    if (current === "languages") current = "certifications";
    navLinks.forEach((a) => {
      const active = a.getAttribute("href") === "#" + current;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollUI);
    }
  }, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
  updateScrollUI();
  window.addEventListener("hashchange", () => goToAnchor(location.hash, { updateHistory: false }));
  window.addEventListener("load", () => {
    if (location.hash) requestAnimationFrame(() => goToAnchor(location.hash, { updateHistory: false }));
  });

  /* ---------- Apparition au scroll ---------- */
  const revealEls = [...document.querySelectorAll(
    ".about, .projects, .connect, .card, .experience, .skills, .education, .certifications, .languages, .tl-item, .cert, .edu__item, .lang"
  )];
  revealEls.forEach((el) => {
    el.classList.add("reveal");
    // apparition en cascade pour les éléments d'une même grille/liste
    if (el.matches(".card, .cert, .tl-item, .edu__item, .lang")) {
      const i = [...el.parentElement.children].indexOf(el);
      el.dataset.stagger = String(Math.min(i, 8));
    }
  });

  function doReveal(el) {
    if (el.classList.contains("reveal--in")) return;
    const delay = (parseInt(el.dataset.stagger || "0", 10)) * 70;
    el.style.transitionDelay = delay + "ms";
    el.classList.add("reveal--in");
    // on enlève le délai après l'apparition pour que le survol reste vif
    setTimeout(() => { el.style.transitionDelay = ""; }, delay + 850);
  }

  // 1) IntersectionObserver (efficace) quand disponible
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { doReveal(e.target); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  // 2) Filet de sécurité : révèle ce qui est dans la fenêtre via le scroll/chargement
  //    (garantit qu'aucun contenu ne reste invisible si l'IO ne se déclenche pas)
  function revealInView() {
    const h = window.innerHeight || 800;
    revealEls.forEach((el) => {
      if (el.classList.contains("reveal--in")) return;
      if (el.getBoundingClientRect().top < h * 0.92) { doReveal(el); if (io) io.unobserve(el); }
    });
  }
  window.addEventListener("scroll", revealInView, { passive: true });
  window.addEventListener("load", () => setTimeout(revealInView, 80));
  revealInView();
});
