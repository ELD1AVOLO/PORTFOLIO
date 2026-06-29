/* =====================================================================
   main.js — Logique du site
   - génère les cartes de projets
   - gère l'ouverture / fermeture de la grande fenêtre (modal)
   - démarre les éclairs (hero, contact, modal)
   - nav mobile, année du footer, apparition au scroll
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Année footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

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
      modalCore: "#ffffff", modalBg: "rgba(8,10,18,0.40)", icon: "🌙",
    },
    light: {
      fx:      { glow: "#7c3aed", color: "#4c1d95", core: "#160a36", blend: "multiply" },
      hero:    { glow: "#7c3aed", color: "#5b21b6", core: "#160a36", bg: "rgba(245,246,251,0.34)" },
      connect: { glow: "#2563eb", color: "#1e3a8a", core: "#0b1030", bg: "rgba(245,246,251,0.34)" },
      modalCore: "#160a36", modalBg: "rgba(245,246,251,0.42)", icon: "☀️",
    },
  };
  let currentTheme = localStorage.getItem("theme") || "dark";

  /* ---------- Éclairs ---------- */
  // Overlay global : suit la souris sur toute la page
  const fx = new LightningCanvas(document.getElementById("fxCanvas"), {
    pointer: true, transparent: true, maxBolts: 4,
  });
  // Ambiance : éclairs qui tombent dans le hero et le contact
  const hero = new LightningCanvas(document.getElementById("heroCanvas"), { intensity: 0.55, maxBolts: 2 });
  const connect = new LightningCanvas(document.getElementById("connectCanvas"), { intensity: 0.4, maxBolts: 2 });
  fx.start(); hero.start(); connect.start();

  /* ---------- Application d'un thème ---------- */
  function applyTheme(name) {
    currentTheme = name;
    const t = THEMES[name];
    document.body.classList.toggle("light", name === "light");
    fx.configure(t.fx);
    hero.configure(t.hero);
    connect.configure(t.connect);
    document.querySelector("#themeToggle .theme-toggle__icon").textContent = t.icon;
    localStorage.setItem("theme", name);
  }
  applyTheme(currentTheme);

  document.getElementById("themeToggle").addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  /* ---------- Génération des cartes ---------- */
  const cardsEl = document.getElementById("cards");
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("button");
    card.className = "card";
    card.style.setProperty("--accent", p.accent || "#4cc9f0");
    card.style.animationDelay = `${i * 80}ms`;
    const isLive = /prod/i.test(p.status || "");
    const techPreview = (p.tech || []).slice(0, 4)
      .map((t) => `<span>${t}</span>`).join("");
    card.innerHTML = `
      <div class="card__glow"></div>
      <div class="card__sheen"></div>
      <div class="card__top">
        <span class="card__tag">${p.tag}</span>
        ${p.status ? `<span class="card__status ${isLive ? "is-live" : ""}">${isLive ? '<i></i>' : ""}${p.status}</span>` : ""}
      </div>
      <h3 class="card__title">${p.title}</h3>
      <p class="card__short">${p.short}</p>
      <div class="card__stack">${techPreview}${(p.tech || []).length > 4 ? `<span class="card__more">+${p.tech.length - 4}</span>` : ""}</div>
      <span class="card__open">Ouvrir le projet <b>⚡</b></span>
    `;
    card.addEventListener("click", () => openModal(p));
    attachTilt(card);
    cardsEl.appendChild(card);
  });

  /* ---------- Modal ---------- */
  const modal = document.getElementById("modal");
  const modalCanvasEl = document.getElementById("modalCanvas");
  let modalLightning = null;
  let appResize = null; // listener resize pour mettre à l'échelle la démo

  function openModal(p) {
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
      ? `<span class="modal__orgs-label">Réalisé chez</span>` +
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
    linksEl.innerHTML = (p.links || [])
      .map((l) => `<a href="${l.url}" target="_blank" rel="noopener" class="btn btn--ghost btn--sm">${l.label} ↗</a>`)
      .join("");

    // "simulation" du projet
    renderPreview(p);

    // ouverture
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // éclairs dans la fenêtre (couleur = accent du projet, cœur selon le thème)
    const t = THEMES[currentTheme];
    modalLightning = new LightningCanvas(modalCanvasEl, {
      intensity: 1.1, glow: p.accent || "#4cc9f0", color: p.accent || "#9fd8ff",
      core: t.modalCore, bg: t.modalBg, maxBolts: 4,
    });
    modalLightning.start();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalLightning) { modalLightning.destroy(); modalLightning = null; }
    if (appResize) { window.removeEventListener("resize", appResize); appResize = null; }
    document.getElementById("modalPreview").innerHTML = "";
  }

  modal.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* ---------- Rendu de la "simulation" (stateless) ---------- */
  function renderPreview(p) {
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
                <button class="browser__reload" id="appReload" title="Relancer la démo">⟳</button>
              </div>
              <div class="browser__viewport" id="appViewport">
                <iframe class="browser__frame" id="appFrame" title="${p.title}"></iframe>
              </div>
            </div>
            <p class="appsim__hint">Démo interactive (données factices) — navigue à l'intérieur ⚡</p>
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
        setTimeout(() => {
          document.getElementById("appBoot").classList.add("is-hidden");
          document.getElementById("appScreen").classList.add("is-on");
          if (viewport._fit) viewport._fit();   // calcule l'échelle une fois visible
          loadDemo(); // chargement de l'iframe après le boot
        }, 500);
      });
      const reloadBtn = document.getElementById("appReload");
      if (reloadBtn) reloadBtn.addEventListener("click", () => {
        frame.src = "about:blank"; setTimeout(loadDemo, 60);
      });
    } else if (pv.type === "iframe" && pv.url) {
      stage.innerHTML = `<iframe class="sim sim--iframe" src="${pv.url}" loading="lazy" title="${p.title}"></iframe>`;
    } else if (pv.type === "image" && pv.url) {
      stage.innerHTML = `<img class="sim sim--img" src="${pv.url}" alt="${p.title}" />`;
    } else if (pv.type === "code") {
      stage.innerHTML = `<div class="sim sim--code"><div class="sim__bar"><i></i><i></i><i></i></div><pre id="simPre"></pre></div>`;
      typeLines(pv.lines || [], document.getElementById("simPre"));
    } else {
      // ambiance pure : seulement les éclairs derrière
      stage.innerHTML = `<div class="sim sim--ambient"><span>⚡</span><p>${p.title}</p></div>`;
    }
  }

  // effet machine à écrire ; onDone() appelé à la fin
  function typeLines(lines, el, onDone) {
    let li = 0, ci = 0;
    el.textContent = "";
    function tick() {
      if (li >= lines.length) { if (onDone) onDone(); return; }
      const line = lines[li];
      if (ci <= line.length) {
        el.textContent =
          lines.slice(0, li).join("\n") + (li > 0 ? "\n" : "") + line.slice(0, ci);
        ci++;
        setTimeout(tick, 18 + Math.random() * 40);
      } else {
        li++; ci = 0;
        setTimeout(tick, 280);
      }
    }
    tick();
  }

  /* ---------- Nav : burger mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  burger.addEventListener("click", () => nav.classList.toggle("nav--open"));
  document.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("nav--open"))
  );

  /* ---------- Nav : fond au scroll ---------- */
  const spyIds = ["about", "experience", "projects", "skills", "education", "connect"];
  const spySections = spyIds.map((id) => document.getElementById(id)).filter(Boolean);
  const navLinks = [...document.querySelectorAll(".nav__links a")];
  window.addEventListener("scroll", () => {
    nav.classList.toggle("nav--scrolled", window.scrollY > 40);
    // scroll-spy : surligne le lien de la section courante
    const y = window.scrollY + 130;
    let current = "";
    spySections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
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
