/* =====================================================================
   inkpad.js — sur grand écran, l'espace libre à côté de l'intro devient
   une page où quelqu'un écrit : citations, mots, formules et dessins
   d'enfant, chacun avec son écriture, sa couleur et son outil (stylo
   plume, crayon, craie grasse… ou une main invisible, comme le journal
   de Tom Jedusor dans Harry Potter). Puis tout s'efface : à la gomme, ou
   l'encre s'enfonce dans la page. Parfois l'auteur se trompe : il
   s'arrête, efface la faute et corrige.
   - Les scènes sont dans SCENES, les dessins dans DOODLES.
   - Les polices manuscrites ne sont chargées que si l'animation tourne.
   - Elle s'arrête hors de l'écran, onglet caché ou fenêtre ouverte
     (accueil, démo), et passe à une autre scène si le thème change.
   ===================================================================== */

(() => {
  "use strict";

  const pad = document.querySelector(".inkpad");
  const canvas = pad?.querySelector("canvas");
  const ctx = canvas?.getContext("2d");
  if (!pad || !ctx) return;
  const root = document.documentElement;
  const wide = window.matchMedia("(min-width: 75rem)");
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const dialogs = [...document.querySelectorAll("dialog")];
  const pageLang = () => (["fr", "en", "ar"].includes(root.lang) ? root.lang : "fr");

  /* ---------- Écritures (Google Fonts) ---------- */
  const HANDS = {
    diary: { family: "La Belle Aurore", size: 30, speed: 95 },
    script: { family: "Mrs Saint Delafield", size: 46, speed: 120 },
    cursive: { family: "Homemade Apple", size: 21, speed: 120 },
    school: { family: "Cedarville Cursive", size: 25, speed: 115 },
    note: { family: "Caveat", weight: 500, size: 31, speed: 150 },
    kid: { family: "Reenie Beanie", size: 40, speed: 140 },
    arabic: { family: "Aref Ruqaa", size: 34, speed: 105, leading: 1.75 }, // hampes hautes : une ligne sur deux
  };
  const FONT_URL = "https://fonts.googleapis.com/css2?family=Aref+Ruqaa&family=Caveat:wght@500&family=Cedarville+Cursive&family=Homemade+Apple&family=La+Belle+Aurore&family=Mrs+Saint+Delafield&family=Reenie+Beanie&display=swap";

  /* ---------- Couleurs : encres, crayon, craies grasses ---------- */
  const PALETTES = {
    light: {
      black: "#25262b", pen: "#1f3a7a", pencil: "#5f6168", red: "#b52a22", orange: "#ec8a1f", yellow: "#e2ab12",
      green: "#3f9142", blue: "#3a6fc2", purple: "#7d4fb0", brown: "#8a5a2b", pink: "#e0708a", crumbs: ["#e9a0b2", "#9a9ca3"],
    },
    dark: {
      black: "#e6e4dc", pen: "#a9c1f0", pencil: "#b9bbc1", red: "#f0968b", orange: "#f5a14a", yellow: "#f2cc4a",
      green: "#71bf6b", blue: "#7fa6ea", purple: "#b292e0", brown: "#c99567", pink: "#f09ab0", crumbs: ["#f0b2c0", "#c3c5cb"],
    },
  };
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : darkQuery.matches);
  let palette = PALETTES.light;
  const colorOf = (name) => palette[name] || palette.black;

  /* ---------- Dessins d'enfant (coordonnées dans un carré de 100) ---------- */
  const ring = (cx, cy, r, n = 16, ry = r) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * ry];
    });
  const arc = (cx, cy, r, from, to, n = 12) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = from + ((to - from) * i) / n;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
  const star = (cx, cy, r) =>
    Array.from({ length: 11 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const radius = i % 2 ? r * 0.45 : r;
      return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius];
    });
  const heart = (cx, cy, s, n = 24) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const t = (i / n) * Math.PI * 2;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return [cx + (16 * Math.sin(t) ** 3 * s) / 16, cy - (y * s) / 16];
    });
  const rays = (cx, cy, from, to, n) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return { c: "orange", p: [[cx + Math.cos(a) * from, cy + Math.sin(a) * from], [cx + Math.cos(a) * to, cy + Math.sin(a) * to]] };
    });

  const DOODLES = {
    landscape: [
      { c: "yellow", p: ring(18, 18, 8) },
      ...rays(18, 18, 11, 16, 8),
      { c: "brown", p: [[34, 88], [34, 58], [66, 58], [66, 88], [34, 88]] },
      { c: "red", p: [[30, 59], [50, 40], [70, 59]] },
      { c: "brown", p: [[46, 88], [46, 74], [54, 74], [54, 88]] },
      { c: "blue", p: [[38, 64], [44, 64], [44, 70], [38, 70], [38, 64]] },
      { c: "blue", p: [[56, 64], [62, 64], [62, 70], [56, 70], [56, 64]] },
      { c: "brown", p: [[80, 88], [80, 68]] },
      { c: "brown", p: [[85, 88], [85, 68]] },
      { c: "green", p: ring(82.5, 60, 11, 14) },
      { c: "green", p: Array.from({ length: 24 }, (_, i) => [4 + i * 4, i % 2 ? 86 : 90]) },
    ],
    family: [
      { c: "red", p: heart(50, 16, 7) },
      { c: "blue", p: ring(25, 40, 6, 12) },
      { c: "blue", p: [[25, 46], [25, 68]] },
      { c: "blue", p: [[13, 55], [25, 52], [37, 55]] },
      { c: "blue", p: [[18, 86], [25, 68], [32, 86]] },
      { c: "purple", p: ring(50, 40, 6, 12) },
      { c: "purple", p: [[50, 46], [50, 68]] },
      { c: "purple", p: [[38, 55], [50, 52], [63, 63]] },
      { c: "purple", p: [[43, 86], [50, 68], [57, 86]] },
      { c: "orange", p: ring(74, 55, 4.5, 10) },
      { c: "orange", p: [[74, 59.5], [74, 73]] },
      { c: "orange", p: [[63, 64], [74, 63], [84, 64]] },
      { c: "orange", p: [[69, 86], [74, 73], [79, 86]] },
      { c: "green", p: [[4, 90], [96, 90]] },
    ],
    cat: [
      { c: "orange", p: ring(50, 56, 25, 22, 22) },
      { c: "orange", p: [[31, 42], [29, 20], [45, 33]] },
      { c: "orange", p: [[55, 33], [71, 20], [69, 42]] },
      { c: "green", p: ring(40, 52, 3, 8) },
      { c: "green", p: ring(60, 52, 3, 8) },
      { c: "pink", p: [[47, 61], [53, 61], [50, 65], [47, 61]] },
      { c: "black", p: [[42, 69], [46, 72], [50, 67], [54, 72], [58, 69]] },
      { c: "black", p: [[20, 60], [38, 63]] },
      { c: "black", p: [[20, 68], [38, 67]] },
      { c: "black", p: [[62, 63], [80, 60]] },
      { c: "black", p: [[62, 67], [80, 68]] },
    ],
    flower: [
      { c: "green", p: [[50, 94], [49, 70], [50, 50]] },
      { c: "green", p: [[49, 78], [38, 72], [34, 64], [44, 67], [49, 74]] },
      { c: "green", p: [[50, 72], [61, 66], [66, 58], [56, 60], [50, 67]] },
      ...[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return { c: i % 2 ? "purple" : "red", p: ring(50 + Math.cos(a) * 12, 36 + Math.sin(a) * 12, 7, 12) };
      }),
      { c: "yellow", p: ring(50, 36, 6, 12) },
    ],
    rocket: [
      { c: "yellow", p: star(16, 18, 6) },
      { c: "yellow", p: star(84, 30, 4.5) },
      { c: "yellow", p: [...arc(20, 74, 10, Math.PI * 0.35, Math.PI * 1.65, 14), ...arc(25, 74, 8, Math.PI * 1.55, Math.PI * 0.45, 12)] },
      { c: "blue", p: [[50, 16], [61, 33], [61, 68], [39, 68], [39, 33], [50, 16]] },
      { c: "yellow", p: ring(50, 42, 5.5, 12) },
      { c: "red", p: [[39, 56], [30, 72], [39, 68]] },
      { c: "red", p: [[61, 56], [70, 72], [61, 68]] },
      { c: "orange", p: [[43, 68], [45, 80], [50, 72], [55, 84], [57, 68]] },
      { c: "yellow", p: star(80, 80, 5) },
    ],
    // Un petit réseau de neurones au crayon de papier
    network: (() => {
      const r = 5.5;
      const layers = [
        [[16, 28], [16, 50], [16, 72]],
        [[50, 18], [50, 39], [50, 61], [50, 82]],
        [[84, 38], [84, 62]],
      ];
      const link = (a, b) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
        return { c: "pencil", p: [[a[0] + (dx / d) * r, a[1] + (dy / d) * r], [b[0] - (dx / d) * r, b[1] - (dy / d) * r]] };
      };
      const nodes = layers.flat().map(([x, y]) => ({ c: "pencil", p: ring(x, y, r, 12) }));
      const edges = [layers[0].flatMap((a) => layers[1].map((b) => link(a, b))), layers[1].flatMap((a) => layers[2].map((b) => link(a, b)))].flat();
      return [...nodes, ...edges];
    })(),
    smiley: [
      { c: "yellow", p: ring(50, 50, 30, 22) },
      { c: "blue", p: ring(40, 42, 3.2, 8) },
      { c: "blue", p: ring(60, 42, 3.2, 8) },
      { c: "red", p: arc(50, 52, 17, Math.PI * 0.15, Math.PI * 0.85, 12) },
    ],
  };

  /* ---------- Scènes ----------
     kind "write" : des lignes ; une partie ["faute", "correction"] fait se tromper l'auteur.
     kind "draw"  : un dessin de DOODLES, avec une légende éventuelle.
     tool : "pen", "pencil", "crayon" ou null (main invisible, façon journal de Tom Jedusor).
     erase : "rub" (gomme), "sink" (l'encre s'enfonce dans la page), "fade".
     lined : écrit sur les lignes du cahier ; sinon posé de travers, n'importe où.
     en / ar : ce qui change dans une ligne quand la page est en anglais ou en arabe. */
  const SCENES = [
    {
      kind: "dialogue",
      fr: { ask: "Qui es-tu ?", answer: ["Je m’appelle Yahya.", "Bienvenue dans mon cahier."] },
      en: { ask: "Who are you?", answer: ["My name is Yahya.", "Welcome to my notebook."] },
      ar: { ask: "من أنت؟", answer: ["اسمي يحيى.", "مرحباً بك في دفتري."] },
    },
    { kind: "draw", doodle: "landscape", tool: "crayon", erase: "rub" },
    {
      kind: "write", lined: true, tool: null, erase: "sink",
      lines: [
        { hand: "diary", color: "black", parts: ["Je pen", ["ce", "se"], ", donc je suis."] },
        { hand: "note", color: "pencil", scale: 0.62, align: "end", parts: ["Descartes, 1637"] },
      ],
    },
    { kind: "write", lined: false, tool: "pencil", erase: "rub", lines: [{ hand: "note", color: "pencil", scale: 1.6, parts: ["E = mc", ["³", "²"]] }] },
    { kind: "draw", doodle: "family", tool: "crayon", erase: "rub" },
    {
      kind: "write", lined: true, tool: "pen", erase: "sink",
      lines: [
        { hand: "cursive", color: "pen", parts: ["Retr", ["ei", "ie"], "val-Augmented"] },
        { hand: "cursive", color: "pen", parts: ["Generation"] },
        {
          hand: "note", color: "red", scale: 0.8, align: "end", parts: ["→ ma thèse"],
          en: { parts: ["→ my thesis"] },
          ar: { hand: "arabic", dir: "rtl", scale: 0.75, parts: ["← أطروحتي"] },
        },
      ],
    },
    { kind: "draw", doodle: "cat", tool: "crayon", erase: "rub" },
    {
      kind: "write", lined: true, tool: null, erase: "sink", dir: "rtl",
      lines: [
        { hand: "arabic", color: "black", parts: ["العلم في الصغر"] },
        { hand: "arabic", color: "black", parts: ["كالنقش على الحجر"] },
      ],
    },
    { kind: "draw", doodle: "rocket", tool: "crayon", erase: "rub" },
    {
      kind: "write", lined: true, tool: "pen", erase: "fade",
      lines: [
        { hand: "school", color: "pen", parts: ["We can only see a short"] },
        { hand: "school", color: "pen", parts: ["distan", ["se", "ce"], " ahead, but we can"] },
        { hand: "school", color: "pen", parts: ["see plenty there that"] },
        { hand: "school", color: "pen", parts: ["needs to be done."] },
        { hand: "note", color: "pencil", scale: 0.62, align: "end", parts: ["Alan Turing, 1950"] },
      ],
    },
    { kind: "draw", doodle: "flower", tool: "crayon", erase: "rub" },
    {
      kind: "write", lined: false, tool: null, erase: "sink",
      lines: [
        { hand: "script", color: "pen", parts: ["the Analytical Engine"] },
        { hand: "script", color: "pen", parts: ["weaves algebraical patterns"] },
        { hand: "script", color: "pen", parts: ["just as the Jacquard-loom"] },
        { hand: "script", color: "pen", parts: ["weaves flowers and leaves."] },
        { hand: "note", color: "pencil", scale: 0.62, align: "end", parts: ["Ada Lovelace, 1843"] },
      ],
    },
    {
      kind: "draw", doodle: "network", tool: "pencil", erase: "rub",
      caption: { hand: "note", color: "pencil", parts: ["RAG ?"], en: { parts: ["RAG?"] }, ar: { parts: ["RAG?"] } },
    },
    {
      kind: "write", lined: true, tool: "pencil", erase: "rub",
      lines: [
        { hand: "kid", color: "orange", parts: ["Bonjour !"] },
        { hand: "cursive", color: "pen", parts: ["Hello!"] },
        { hand: "arabic", color: "black", dir: "rtl", parts: ["مرحبا"] },
      ],
    },
    {
      kind: "write", lined: true, tool: "pen", erase: "sink",
      lines: [
        { hand: "school", color: "black", parts: ["Le cœur a ses raisons"] },
        { hand: "school", color: "black", parts: ["que la raison ne"] },
        { hand: "school", color: "black", parts: ["conna", ["it", "ît"], " point."] },
        { hand: "note", color: "pencil", scale: 0.62, align: "end", parts: ["Pascal, 1670"] },
      ],
    },
    {
      kind: "draw", doodle: "smiley", tool: "crayon", erase: "rub",
      caption: { hand: "kid", color: "blue", parts: ["coucou !"], en: { parts: ["hi!"] }, ar: { hand: "arabic", dir: "rtl", parts: ["أهلاً!"] } },
    },
  ];

  /* ---------- Moteur : de petites animations (tweens) dans une seule boucle ---------- */
  const tweens = new Set();
  const tween = (duration, onUpdate = () => {}) =>
    new Promise((resolve) => tweens.add({ t: 0, duration: Math.max(1, duration), onUpdate, resolve }));
  const sleep = (ms) => tween(ms);
  const rand = (a, b) => a + Math.random() * (b - a);
  const shuffle = (list) => list.map((item) => [Math.random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);

  const ink = document.createElement("canvas"); // ce qui est déjà écrit
  const inkCtx = ink.getContext("2d");
  const state = { time: 0, scene: null, active: null, stroke: null, eraser: null, toolColor: "black", inkAlpha: 1, inkBlur: 0, inkShift: 0 };
  const crumbs = [];
  let generation = 0;
  let onScreen = true;
  let started = false;
  let rafId = 0;
  let last = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    const box = pad.getBoundingClientRect();
    const w = Math.round(box.width);
    const h = Math.round(box.height);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    if (Math.abs(w - width) < 2 && Math.abs(h - height) < 2 && ratio === dpr) return false;
    width = w;
    height = h;
    dpr = ratio;
    for (const c of [canvas, ink]) {
      c.width = Math.max(1, Math.round(w * dpr));
      c.height = Math.max(1, Math.round(h * dpr));
    }
    return true;
  }

  // Les lignes du cahier (fond du body), en ordonnées du canvas
  function ruleLines() {
    const style = getComputedStyle(root);
    const raw = style.getPropertyValue("--rule-gap").trim();
    const gap = raw.endsWith("rem") ? parseFloat(raw) * parseFloat(style.fontSize) : parseFloat(raw) || 28;
    const top = canvas.getBoundingClientRect().top + window.scrollY;
    const lines = [];
    for (let k = Math.ceil((top + 1) / gap); ; k++) {
      const y = k * gap - 1 - top;
      if (y > height) break;
      if (y >= 0) lines.push(y);
    }
    return { gap, lines };
  }

  const fontOf = (hand, size) => `${hand.weight || 400} ${size.toFixed(1)}px "${hand.family}", cursive`;
  const measure = (font, text) => {
    ctx.font = font;
    return ctx.measureText(text).width;
  };
  const toCanvas = (scene, x, y) => {
    const cos = Math.cos(scene.angle);
    const sin = Math.sin(scene.angle);
    return [scene.ox + x * cos - y * sin, scene.oy + x * sin + y * cos];
  };
  const place = (c, scene) => {
    c.translate(scene.ox, scene.oy);
    c.rotate(scene.angle);
  };
  function boundsOf(scene) {
    const { x0, y0, x1, y1 } = scene.box;
    const corners = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => toCanvas(scene, x, y));
    const xs = corners.map((p) => p[0]);
    const ys = corners.map((p) => p[1]);
    return { x0: Math.min(...xs) - 10, y0: Math.min(...ys) - 10, x1: Math.max(...xs) + 10, y1: Math.max(...ys) + 10 };
  }

  /* ---------- Mise en page d'une scène ---------- */
  const MARGIN = 14;

  function layoutWrite(spec) {
    const lang = pageLang();
    const lines = spec.lines.map((raw) => {
      const line = { ...raw, ...raw[lang] };
      const hand = HANDS[line.hand];
      const finalText = line.parts.map((part) => (typeof part === "string" ? part : part[1])).join("");
      return { ...line, hand, dir: line.dir || spec.dir || "ltr", finalText, baseSize: hand.size * (line.scale || 1) };
    });
    const widest = Math.max(...lines.map((line) => measure(fontOf(line.hand, line.baseSize), line.finalText)));
    const fit = Math.min(1, (width - MARGIN * 2) / widest);
    for (const line of lines) {
      line.size = line.baseSize * fit;
      line.font = fontOf(line.hand, line.size);
      line.width = measure(line.font, line.finalText);
      line.speed = line.hand.speed * Math.max(0.6, fit);
    }
    const blockW = Math.max(...lines.map((line) => line.width));
    const scene = { kind: "write", tool: spec.tool, erase: spec.erase, lines, angle: 0, ox: 0, oy: 0, lined: false };

    if (spec.lined) {
      // Sur les lignes : chaque ligne d'écriture se pose sur une ligne du cahier
      const { gap, lines: rules } = ruleLines();
      const steps = lines.map((line) => Math.max(1, Math.round((line.size * (line.hand.leading || 1.15)) / gap)));
      const span = steps.slice(1).reduce((sum, step) => sum + step, 0);
      const first = lines[0];
      const lastLine = lines[lines.length - 1];
      const fits = rules
        .map((_, i) => i)
        .filter((i) => rules[i] - first.size * 0.95 >= MARGIN && i + span < rules.length && rules[i + span] + lastLine.size * 0.35 <= height - MARGIN);
      if (fits.length) {
        let index = fits[Math.floor(Math.random() * fits.length)];
        lines.forEach((line, i) => {
          if (i) index += steps[i];
          line.baseline = rules[index] - 2;
        });
        scene.ox = rand(MARGIN, Math.max(MARGIN, width - blockW - MARGIN));
        scene.lined = true;
      }
    }
    if (!scene.lined) {
      // Hors des lignes : le bloc est posé de travers, n'importe où
      scene.angle = (rand(-4, 4) * Math.PI) / 180;
      let y = 0;
      lines.forEach((line, i) => {
        y += i ? line.size * ((line.hand.leading || 1.15) + 0.15) : line.size;
        line.baseline = y;
      });
      const blockH = y + lastOf(lines).size * 0.4;
      const slack = Math.abs(Math.sin(scene.angle)) * blockW;
      scene.ox = rand(MARGIN, Math.max(MARGIN, width - blockW - MARGIN));
      scene.oy = rand(MARGIN + slack, Math.max(MARGIN + slack, height - blockH - MARGIN - slack));
    }
    for (const line of lines) {
      const end = line.align === "end" || line.dir === "rtl";
      line.x = end ? blockW - line.width : 0;
      line.xEnd = line.x + line.width;
    }
    scene.box = { x0: 0, y0: lines[0].baseline - lines[0].size, x1: blockW, y1: lastOf(lines).baseline + lastOf(lines).size * 0.45 };
    scene.bounds = boundsOf(scene);
    return scene;
  }
  const lastOf = (list) => list[list.length - 1];

  function layoutDraw(spec) {
    const size = Math.min(width, height) * rand(0.6, 0.78);
    const k = size / 100;
    const jitter = spec.tool === "pencil" ? 0.35 : 0.9; // un enfant ne trace pas droit
    const strokes = DOODLES[spec.doodle].map((stroke) => ({
      color: stroke.c,
      kind: spec.tool === "pencil" ? "pencil" : "crayon",
      points: stroke.p.map(([x, y]) => [(x + rand(-jitter, jitter)) * k, (y + rand(-jitter, jitter)) * k]),
    }));
    let caption = null;
    let blockW = size;
    let blockH = size;
    if (spec.caption) {
      const cap = { ...spec.caption, ...spec.caption[pageLang()] };
      const hand = HANDS[cap.hand];
      const s = hand.size * Math.min(1, size / 200);
      caption = { ...cap, hand, size: s, font: fontOf(hand, s), dir: cap.dir || "ltr", speed: hand.speed };
      caption.width = measure(caption.font, cap.parts.join(""));
      caption.x = (size - caption.width) / 2;
      caption.xEnd = caption.x + caption.width;
      caption.baseline = size + s * 1.05;
      blockH = caption.baseline + s * 0.4;
      blockW = Math.max(size, caption.width);
    }
    const scene = {
      kind: "draw", tool: spec.tool, erase: spec.erase, strokes, caption,
      angle: (rand(-6, 6) * Math.PI) / 180,
      speed: spec.tool === "pencil" ? 650 : 480,
      ox: rand(MARGIN + 8, Math.max(MARGIN + 8, width - blockW - MARGIN - 8)),
      oy: rand(MARGIN + 8, Math.max(MARGIN + 8, height - blockH - MARGIN - 8)),
      box: { x0: 0, y0: 0, x1: blockW, y1: blockH },
    };
    scene.bounds = boundsOf(scene);
    return scene;
  }

  /* ---------- Écrire, se tromper, corriger ---------- */
  async function writeLine(scene, line, alive) {
    const active = { ...line, text: "", reveal: 0, inked: 0, fade: null };
    state.active = active;
    for (const part of line.parts) {
      if (typeof part === "string") {
        await type(active, part, alive);
      } else {
        const [wrong, right] = part;
        await type(active, wrong, alive);
        if (!alive()) return;
        await sleep(rand(420, 680)); // l'auteur s'arrête : il a vu la faute
        if (!alive()) return;
        await unwrite(scene, active, [...wrong].length, alive);
        if (!alive()) return;
        await sleep(rand(160, 300));
        if (!alive()) return;
        await type(active, right, alive);
      }
      if (!alive()) return;
    }
    await sleep(160); // le temps que l'encre sèche
    if (!alive()) return;
    commit(scene, (c) => paintText(c, active, active.text));
    state.active = null;
  }

  // L'encre rattrape la plume en un instant
  const settleInk = (a, dt) => {
    a.inked = Math.min(a.reveal, a.inked + (a.reveal - a.inked) * Math.min(1, dt * 14));
  };

  async function type(active, chunk, alive) {
    for (const char of chunk) {
      const before = active.text;
      active.text = before + char;
      const from = measure(active.font, before);
      const to = measure(active.font, active.text);
      const speed = active.speed * rand(0.75, 1.25);
      await tween(((to - from) / speed) * 1000, (p) => {
        active.reveal = from + (to - from) * p;
      });
      if (!alive()) return;
      if (char === " ") await sleep(rand(50, 140));
      else if (/[,.;:!?،؟]/.test(char)) await sleep(rand(180, 320));
      if (!alive()) return;
    }
  }

  async function unwrite(scene, active, count, alive) {
    const keep = [...active.text].slice(0, -count).join("");
    const from = measure(active.font, active.text);
    const to = measure(active.font, keep);
    if (scene.tool) {
      // La gomme frotte la fin du mot pendant que l'encre disparaît
      await tween(rand(700, 950), (p, t) => {
        active.reveal = from - (from - to) * Math.min(1, p * 1.15);
        const x = active.x + to + (from - to) * (0.5 + 0.5 * Math.sin(t / 55));
        const [cx, cy] = toCanvas(scene, x, active.baseline - active.size * 0.3);
        state.eraser = { x: cx, y: cy + 6, tilt: Math.sin(t / 90) * 0.15 };
        if (Math.random() < 0.5) spawnCrumb(cx, cy + 4);
      });
      state.eraser = null;
    } else {
      // Main invisible : les lettres fausses s'enfoncent dans la page
      active.fade = { at: to, alpha: 1 };
      await tween(750, (p) => {
        active.fade.alpha = 1 - p;
      });
      active.fade = null;
    }
    if (!alive()) return;
    active.text = keep;
    active.reveal = to;
  }

  /* ---------- Dessiner ---------- */
  const lengthOf = (points) => points.slice(1).reduce((sum, [x, y], i) => sum + Math.hypot(x - points[i][0], y - points[i][1]), 0);
  function pointAt(points, at) {
    let done = 0;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const seg = Math.hypot(x1 - x0, y1 - y0);
      if (done + seg >= at) {
        const f = seg ? (at - done) / seg : 0;
        return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
      }
      done += seg;
    }
    return lastOf(points);
  }

  async function drawDoodle(scene, alive) {
    let lastColor = null;
    for (const stroke of scene.strokes) {
      // Changer de couleur, c'est reposer une craie et en prendre une autre
      await sleep(lastColor === null ? 120 : stroke.color !== lastColor ? rand(320, 480) : rand(80, 170));
      if (!alive()) return;
      lastColor = stroke.color;
      state.toolColor = stroke.color;
      const total = lengthOf(stroke.points);
      state.stroke = { stroke, upto: 0 };
      await tween((total / scene.speed) * 1000, (p) => {
        state.stroke.upto = total * p;
      });
      if (!alive()) return;
      commit(scene, (c) => paintStroke(c, stroke, Infinity));
      state.stroke = null;
    }
    if (scene.caption) {
      await sleep(300);
      if (!alive()) return;
      await writeLine(scene, scene.caption, alive);
    }
  }

  /* ---------- Effacer ---------- */
  async function eraseAll(scene) {
    if (scene.erase === "rub") await rub(scene);
    else if (scene.erase === "sink") await sink(1600);
    else await tween(900, (p) => { state.inkAlpha = 1 - p; });
    clearInk();
  }

  // Comme dans le journal : l'encre pâlit, se brouille et s'enfonce dans la page
  const sink = (duration) =>
    tween(duration, (p) => {
      state.inkAlpha = 1 - p * p;
      state.inkBlur = 2.6 * p;
      state.inkShift = 2 * p;
    });

  async function rub(scene) {
    const { x0, y0, x1, y1 } = scene.bounds;
    const path = [];
    for (let y = y0, row = 0; y <= y1 + 14; y += 16, row++) {
      path.push(row % 2 ? [x1, y] : [x0, y], row % 2 ? [x0, y] : [x1, y]);
    }
    const total = lengthOf(path);
    let done = 0;
    await tween(Math.min(3400, Math.max(1100, (total / 1400) * 1000)), (p, t) => {
      const target = total * p;
      for (; done <= target; done += 5) {
        const [x, y] = pointAt(path, done);
        eraseDot(x, y);
      }
      const [x, y] = pointAt(path, target);
      state.eraser = { x, y: y + 7, tilt: Math.sin(t / 70) * 0.12 };
      if (Math.random() < 0.45) spawnCrumb(x, y + 6);
    });
    state.eraser = null;
  }

  function eraseDot(x, y) {
    inkCtx.save();
    inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    inkCtx.globalCompositeOperation = "destination-out";
    inkCtx.beginPath();
    inkCtx.arc(x, y, 13, 0, Math.PI * 2);
    inkCtx.fill();
    inkCtx.restore();
  }

  function clearInk() {
    inkCtx.setTransform(1, 0, 0, 1, 0, 0);
    inkCtx.clearRect(0, 0, ink.width, ink.height);
    state.inkAlpha = 1;
    state.inkBlur = 0;
    state.inkShift = 0;
  }

  // Une fois fini, un trait ou une ligne passe sur la couche « déjà écrit »
  function commit(scene, paint) {
    inkCtx.save();
    inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    place(inkCtx, scene);
    paint(inkCtx);
    inkCtx.restore();
  }

  function spawnCrumb(x, y) {
    if (crumbs.length > 70) return;
    crumbs.push({
      x, y, vx: rand(-45, 45), vy: rand(-70, -10), age: 0, life: rand(0.45, 0.9),
      size: rand(1.2, 2.6), color: palette.crumbs[Math.random() < 0.6 ? 0 : 1],
    });
  }
  function updateCrumbs(dt) {
    for (let i = crumbs.length - 1; i >= 0; i--) {
      const crumb = crumbs[i];
      crumb.age += dt;
      if (crumb.age >= crumb.life) {
        crumbs.splice(i, 1);
        continue;
      }
      crumb.vy += 540 * dt;
      crumb.x += crumb.vx * dt;
      crumb.y += crumb.vy * dt;
    }
  }

  /* ---------- Peinture ---------- */
  function paintText(c, line, text, clip = null, alpha = 1) {
    c.font = line.font;
    c.fillStyle = colorOf(line.color);
    c.globalAlpha = (line.color === "pencil" ? 0.86 : 0.94) * alpha;
    c.direction = line.dir;
    c.textAlign = line.dir === "rtl" ? "right" : "left";
    c.textBaseline = "alphabetic";
    if (clip) {
      c.save();
      c.beginPath();
      c.rect(clip[0], line.baseline - line.size * 1.4, clip[1] - clip[0], line.size * 2.1);
      c.clip();
    }
    c.fillText(text, line.dir === "rtl" ? line.xEnd : line.x, line.baseline);
    if (clip) c.restore();
  }

  function paintActive(c, scene, a) {
    // Distances comptées depuis le début de la ligne, à gauche ou à droite selon le sens
    const rtl = a.dir === "rtl";
    const at = (d) => (rtl ? a.xEnd - d : a.x + d);
    const span = (d0, d1, alpha = 1) => paintText(c, a, a.text, rtl ? [at(d1), at(d0)] : [at(d0), at(d1)], alpha);
    c.save();
    place(c, scene);
    if (a.fade) {
      // Main invisible : les lettres fausses pâlissent et se brouillent
      span(-2, a.fade.at);
      c.filter = `blur(${((1 - a.fade.alpha) * 2).toFixed(2)}px)`;
      span(a.fade.at, a.reveal + 2, a.fade.alpha);
      c.filter = "none";
    } else {
      // L'encre fraîche, juste derrière la plume, est encore pâle
      const mid = (a.inked + a.reveal) / 2;
      span(-2, a.inked);
      if (a.reveal - a.inked > 0.5) {
        span(a.inked, mid, 0.6);
        span(mid, a.reveal, 0.25);
      }
    }
    c.restore();
  }

  function tracePath(c, points, upto) {
    c.beginPath();
    c.moveTo(points[0][0], points[0][1]);
    let done = 0;
    let tip = points[0];
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const seg = Math.hypot(x1 - x0, y1 - y0);
      if (done + seg >= upto) {
        const f = seg ? (upto - done) / seg : 0;
        tip = [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
        c.lineTo(tip[0], tip[1]);
        return tip;
      }
      done += seg;
      c.lineTo(x1, y1);
      tip = [x1, y1];
    }
    return tip;
  }

  function paintStroke(c, stroke, upto) {
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = colorOf(stroke.color);
    let tip;
    if (stroke.kind === "crayon") {
      // Craie grasse : un trait épais, puis un second décalé pour le grain
      c.globalAlpha = 0.86;
      c.lineWidth = 3.4;
      tip = tracePath(c, stroke.points, upto);
      c.stroke();
      c.save();
      c.translate(0.9, 0.7);
      c.globalAlpha = 0.42;
      c.lineWidth = 2;
      tracePath(c, stroke.points, upto);
      c.stroke();
      c.restore();
    } else {
      c.globalAlpha = 0.8;
      c.lineWidth = 1.6;
      tip = tracePath(c, stroke.points, upto);
      c.stroke();
    }
    return tip;
  }

  /* ---------- Les outils (dessinés, pointe en 0,0) ---------- */
  function withShadow(c) {
    c.shadowColor = "rgba(0, 0, 0, 0.25)";
    c.shadowBlur = 4;
    c.shadowOffsetY = 2;
  }
  function drawPencil(c, x, y) {
    c.save();
    c.translate(x, y);
    c.rotate(-0.95);
    withShadow(c);
    c.fillStyle = "#f2c230";
    c.fillRect(16, -4.5, 46, 9);
    c.shadowColor = "transparent";
    c.fillStyle = "rgba(255, 255, 255, 0.35)";
    c.fillRect(16, -4.5, 46, 2.5);
    c.fillStyle = "rgba(0, 0, 0, 0.12)";
    c.fillRect(16, 2, 46, 2.5);
    c.fillStyle = "#b9bcc2";
    c.fillRect(62, -4.5, 6, 9);
    c.fillStyle = "#e88fa1";
    c.fillRect(68, -4.5, 7, 9);
    c.fillStyle = "#e9c99b";
    c.beginPath();
    c.moveTo(16, -4.5);
    c.lineTo(4, -1.3);
    c.lineTo(4, 1.3);
    c.lineTo(16, 4.5);
    c.fill();
    c.fillStyle = "#3d3f45";
    c.beginPath();
    c.moveTo(4.5, -1.4);
    c.lineTo(0, 0);
    c.lineTo(4.5, 1.4);
    c.fill();
    c.restore();
  }
  function drawCrayon(c, x, y, color) {
    c.save();
    c.translate(x, y);
    c.rotate(-0.9);
    withShadow(c);
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(10, -4.2);
    c.lineTo(10, 4.2);
    c.fill();
    c.fillRect(10, -5, 46, 10);
    c.shadowColor = "transparent";
    c.fillStyle = "rgba(255, 255, 255, 0.55)";
    c.fillRect(20, -5, 26, 10);
    c.strokeStyle = "rgba(0, 0, 0, 0.25)";
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(24, -5);
    c.lineTo(24, 5);
    c.moveTo(42, -5);
    c.lineTo(42, 5);
    c.stroke();
    c.restore();
  }
  function drawPen(c, x, y) {
    c.save();
    c.translate(x, y);
    c.rotate(-1);
    withShadow(c);
    c.fillStyle = "#c9a24a";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(13, -3.6);
    c.lineTo(13, 3.6);
    c.fill();
    c.shadowColor = "transparent";
    c.strokeStyle = "#7a5d1c";
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(1.5, 0);
    c.lineTo(10, 0);
    c.stroke();
    c.fillStyle = "#1d1f24";
    c.fillRect(13, -4, 14, 8);
    c.fillStyle = "#24345f";
    c.fillRect(27, -5, 40, 10);
    c.fillStyle = "rgba(255, 255, 255, 0.28)";
    c.fillRect(27, -5, 40, 2.4);
    c.fillStyle = "#c9a24a";
    c.fillRect(44, -6.2, 18, 1.7);
    c.restore();
  }
  function drawEraser(c, x, y, tilt) {
    c.save();
    c.translate(x, y);
    c.rotate(tilt);
    withShadow(c);
    c.beginPath();
    if (c.roundRect) c.roundRect(-17, -15, 34, 15, 3);
    else c.rect(-17, -15, 34, 15);
    c.fillStyle = "#f2a7b8";
    c.fill();
    c.shadowColor = "transparent";
    c.clip();
    c.fillStyle = "#3e66b3";
    c.fillRect(1, -15, 17, 15);
    c.fillStyle = "rgba(255, 255, 255, 0.35)";
    c.fillRect(-17, -15, 34, 3);
    c.restore();
  }
  function drawTool(c, tool, x, y) {
    if (tool === "pen") drawPen(c, x, y);
    else if (tool === "pencil") drawPencil(c, x, y);
    else if (tool === "crayon") drawCrayon(c, x, y, colorOf(state.toolColor));
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.globalAlpha = state.inkAlpha;
    if (state.inkBlur > 0.05) ctx.filter = `blur(${(state.inkBlur * dpr).toFixed(2)}px)`;
    ctx.drawImage(ink, 0, state.inkShift * dpr);
    ctx.restore();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scene = state.scene;
    let tip = null;
    if (scene && state.active) {
      const a = state.active;
      paintActive(ctx, scene, a);
      const x = a.dir === "rtl" ? a.xEnd - a.reveal : a.x + a.reveal;
      tip = toCanvas(scene, x, a.baseline - a.size * 0.3 + Math.sin(state.time / 38) * a.size * 0.18);
    }
    if (scene && state.stroke) {
      ctx.save();
      place(ctx, scene);
      const local = paintStroke(ctx, state.stroke.stroke, state.stroke.upto);
      ctx.restore();
      tip = toCanvas(scene, local[0], local[1]);
    }
    for (const crumb of crumbs) {
      ctx.globalAlpha = 1 - crumb.age / crumb.life;
      ctx.fillStyle = crumb.color;
      ctx.fillRect(crumb.x, crumb.y, crumb.size, crumb.size);
    }
    ctx.globalAlpha = 1;
    if (state.eraser) drawEraser(ctx, state.eraser.x, state.eraser.y, state.eraser.tilt);
    else if (tip && scene?.tool) drawTool(ctx, scene.tool, tip[0], tip[1]);
  }

  /* ---------- Les scènes, l'une après l'autre ---------- */
  async function playScene(spec, alive) {
    palette = isDark() ? PALETTES.dark : PALETTES.light;
    if (spec.kind === "dialogue") return playDialogue(spec, alive);
    const scene = spec.kind === "draw" ? layoutDraw(spec) : layoutWrite(spec);
    state.scene = scene;
    if (scene.kind === "draw") {
      await drawDoodle(scene, alive);
    } else {
      for (const line of scene.lines) {
        await writeLine(scene, line, alive);
        if (!alive()) return;
        await sleep(rand(120, 260));
        if (!alive()) return;
      }
    }
    if (!alive()) return;
    await sleep(scene.kind === "draw" ? 2000 : 2600);
    if (!alive()) return;
    await eraseAll(scene);
    state.scene = null;
  }

  // Le journal qui répond : la question s'enfonce dans la page, puis une main invisible répond
  async function playDialogue(spec, alive) {
    const lang = pageLang();
    const words = spec[lang];
    const dir = lang === "ar" ? "rtl" : "ltr";
    const ask = layoutWrite({ lined: true, tool: "pen", lines: [{ hand: lang === "ar" ? "arabic" : "note", color: "pen", dir, parts: [words.ask] }] });
    state.scene = ask;
    await writeLine(ask, ask.lines[0], alive);
    if (!alive()) return;
    await sleep(1000);
    if (!alive()) return;
    await sink(1400);
    clearInk();
    if (!alive()) return;
    await sleep(600);
    if (!alive()) return;
    const answer = layoutWrite({
      lined: true, tool: null,
      lines: words.answer.map((text) => ({ hand: lang === "ar" ? "arabic" : "diary", color: "black", dir, parts: [text] })),
    });
    state.scene = answer;
    for (const line of answer.lines) {
      await writeLine(answer, line, alive);
      if (!alive()) return;
      await sleep(rand(200, 380));
      if (!alive()) return;
    }
    await sleep(2600);
    if (!alive()) return;
    await sink(1700);
    clearInk();
    state.scene = null;
  }

  async function run() {
    let order = SCENES.map((_, i) => i);
    // ?ink=4 commence à la scène n° 4 (pratique pour voir une scène précise)
    const first = Math.max(0, Math.min(SCENES.length - 1, Number(new URLSearchParams(location.search).get("ink")) || 0));
    for (let n = first; ; n++) {
      if (n && n % order.length === 0) order = shuffle(order);
      const gen = generation;
      const alive = () => gen === generation;
      await playScene(SCENES[order[n % order.length]], alive);
      if (alive()) await sleep(rand(500, 900));
    }
  }

  // Tout recommencer (par exemple quand la zone change de taille)
  function restart() {
    generation += 1;
    for (const item of tweens) item.resolve();
    tweens.clear();
    Object.assign(state, { scene: null, active: null, stroke: null, eraser: null });
    crumbs.length = 0;
    clearInk();
  }

  /* ---------- Boucle et conditions de marche ---------- */
  const running = () => !document.hidden && onScreen && wide.matches && !dialogs.some((dialog) => dialog.open);

  function frame(now) {
    rafId = 0;
    if (!running()) {
      last = 0;
      return;
    }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    state.time += dt * 1000;
    for (const item of [...tweens]) {
      item.t += dt * 1000;
      const p = Math.min(1, item.t / item.duration);
      item.onUpdate(p, item.t);
      if (p >= 1) {
        tweens.delete(item);
        item.resolve();
      }
    }
    if (state.active) settleInk(state.active, dt);
    updateCrumbs(dt);
    render();
    rafId = requestAnimationFrame(frame);
  }
  const wake = () => {
    if (started && !rafId) rafId = requestAnimationFrame(frame);
  };

  async function loadFonts() {
    let link = document.querySelector("link[data-inkpad-fonts]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      link.dataset.inkpadFonts = "";
      document.head.appendChild(link);
      await new Promise((resolve) => {
        link.addEventListener("load", resolve, { once: true });
        link.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 4000);
      });
    }
    const loads = Object.values(HANDS).map((hand) => document.fonts.load(fontOf(hand, 32)).catch(() => []));
    await Promise.race([Promise.all(loads), new Promise((resolve) => setTimeout(resolve, 5000))]);
  }

  async function start() {
    if (started || !wide.matches) return;
    started = true;
    await loadFonts();
    resize();
    run();
    wake();
  }

  new ResizeObserver(() => {
    if (resize() && started) restart();
  }).observe(pad);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      wake();
    }).observe(pad);
  }
  document.addEventListener("visibilitychange", wake);
  // Les encres déjà posées ne vont plus avec le nouveau thème : on passe à la scène suivante
  const recolor = () => {
    if (started) restart();
  };
  new MutationObserver(recolor).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  darkQuery.addEventListener?.("change", recolor);
  dialogs.forEach((dialog) => dialog.addEventListener("close", wake));
  wide.addEventListener?.("change", () => {
    if (wide.matches) start();
    wake();
  });

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
})();
