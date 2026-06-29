/* =====================================================================
   lightning.js — Moteur d'éclairs sur <canvas>
   ---------------------------------------------------------------------
   Génère de vrais éclairs ramifiés (subdivision récursive + branches),
   avec halo lumineux (glow), étincelles et flash d'arrière-plan.
   Réutilisable :
     - mode "ambiance"  : éclairs qui tombent du haut (hero, contact)
     - mode "souris"    : éclairs qui suivent le curseur (overlay global)
   Couleurs reconfigurables à chaud (pour le thème clair / sombre).
   ===================================================================== */

class LightningCanvas {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} opts
   *   color       couleur des branches
   *   glow        couleur du halo
   *   core        couleur du cœur lumineux (blanc en sombre, foncé en clair)
   *   bg          couleur de la traînée de fond (ex "rgba(5,6,12,0.32)")
   *   intensity   fréquence des éclairs auto (0.2 calme → 1.5 orageux)
   *   maxBolts    nombre max d'éclairs simultanés
   *   pointer     true => éclairs déclenchés par la souris (pas d'auto)
   *   transparent true => efface au lieu de laisser une traînée (overlay)
   *   blend       mix-blend-mode du canvas ("screen", "multiply"...)
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.color = opts.color || "#9fd8ff";
    this.glow = opts.glow || "#4cc9f0";
    this.core = opts.core || "#ffffff";
    this.bg = opts.bg || "rgba(5, 6, 12, 0.32)";
    this.intensity = opts.intensity ?? 0.6;
    this.maxBolts = opts.maxBolts ?? 3;
    this.pointer = opts.pointer || false;
    this.transparent = opts.transparent || false;

    this.bolts = [];
    this.sparks = [];
    this.flash = 0;
    this.running = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this._last = null;          // dernière position souris
    this._moveCd = 0;           // throttle souris

    this._resize = this._resize.bind(this);
    this._loop = this._loop.bind(this);
    this._onMove = this._onMove.bind(this);

    window.addEventListener("resize", this._resize);
    if (this.pointer) {
      window.addEventListener("pointermove", this._onMove, { passive: true });
    }
    if (opts.blend) this.canvas.style.mixBlendMode = opts.blend;
    this._resize();
  }

  /* --- reconfiguration à chaud (changement de thème) --- */
  configure(opts = {}) {
    if (opts.color) this.color = opts.color;
    if (opts.glow) this.glow = opts.glow;
    if (opts.core) this.core = opts.core;
    if (opts.bg) this.bg = opts.bg;
    if (opts.blend !== undefined) this.canvas.style.mixBlendMode = opts.blend;
  }

  _resize() {
    const r = this.canvas.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.max(1, this.w * this.dpr);
    this.canvas.height = Math.max(1, this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /* --- souris : éclair entre l'ancienne et la nouvelle position --- */
  _onMove(e) {
    const x = e.clientX, y = e.clientY;
    if (this._last) {
      const dist = Math.hypot(x - this._last.x, y - this._last.y);
      const now = performance.now();
      if (dist > 16 && now > this._moveCd) {
        this.spawnBolt(this._last.x, this._last.y, x, y);
        this._moveCd = now + 26;
      }
    }
    this._last = { x, y };
  }

  /* --- chemin d'un éclair (déplacement de point milieu) --- */
  _makeBolt(x1, y1, x2, y2, displace, detail = 7) {
    let points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    let d = displace;
    for (let i = 0; i < detail; i++) {
      const next = [];
      for (let j = 0; j < points.length - 1; j++) {
        const a = points[j], b = points[j + 1];
        const midx = (a.x + b.x) / 2, midy = (a.y + b.y) / 2;
        const nx = -(b.y - a.y), ny = b.x - a.x;
        const len = Math.hypot(nx, ny) || 1;
        const off = (Math.random() - 0.5) * d;
        next.push(a, { x: midx + (nx / len) * off, y: midy + (ny / len) * off });
      }
      next.push(points[points.length - 1]);
      points = next;
      d *= 0.55;
    }
    return points;
  }

  spawnBolt(x1, y1, x2, y2) {
    if (this.bolts.length >= this.maxBolts) return;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const displace = Math.max(6, len * 0.38);
    const main = this._makeBolt(x1, y1, x2, y2, displace);
    const branches = [];

    const nBranch = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < nBranch; i++) {
      const p = main[Math.floor(Math.random() * (main.length - 2)) + 1];
      const angle = Math.random() * Math.PI * 2;
      const reach = Math.min(160, 30 + len * 0.5) * (0.4 + Math.random() * 0.6);
      branches.push(this._makeBolt(p.x, p.y, p.x + Math.cos(angle) * reach,
                                   p.y + Math.sin(angle) * reach, reach * 0.35, 5));
    }

    this.bolts.push({ main, branches, life: 1 });
    this.flash = Math.min(1, this.flash + 0.5);

    // étincelles au point d'arrivée
    const end = main[main.length - 1];
    const n = this.transparent ? 8 : 14;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 4;
      this.sparks.push({ x: end.x, y: end.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 1 });
    }
  }

  _drawPath(points, width, alpha) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.stroke();
  }

  _drawBolt(bolt) {
    const ctx = this.ctx;
    const a = bolt.life;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1) halo large et diffus
    ctx.shadowBlur = 22;
    ctx.shadowColor = this.glow;
    ctx.strokeStyle = this.glow;
    this._drawPath(bolt.main, 6, 0.25 * a);
    bolt.branches.forEach((b) => this._drawPath(b, 3, 0.18 * a));

    // 2) cœur net
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.core;
    this._drawPath(bolt.main, 1.6, 0.95 * a);
    ctx.strokeStyle = this.color;
    bolt.branches.forEach((b) => this._drawPath(b, 1, 0.7 * a));

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  _loop() {
    if (!this.running) return;
    const ctx = this.ctx;

    if (this.transparent) {
      ctx.clearRect(0, 0, this.w, this.h);
    } else {
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.bg;
      ctx.fillRect(0, 0, this.w, this.h);
      // flash plein écran (uniquement en mode opaque)
      if (this.flash > 0.01) {
        ctx.globalAlpha = this.flash * 0.12;
        ctx.fillStyle = this.glow;
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.globalAlpha = 1;
      }
    }
    if (this.flash > 0.01) this.flash *= 0.86;

    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.life -= 0.05;
      if (b.life <= 0) { this.bolts.splice(i, 1); continue; }
      this._drawBolt(b);
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.life -= 0.03;
      if (s.life <= 0) { this.sparks.splice(i, 1); continue; }
      ctx.globalAlpha = s.life;
      ctx.fillStyle = this.color;
      ctx.fillRect(s.x, s.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // éclairs automatiques (uniquement hors mode souris)
    if (!this.pointer && Math.random() < 0.015 * this.intensity) this._random();

    requestAnimationFrame(this._loop);
  }

  _random() {
    const x1 = Math.random() * this.w;
    const x2 = x1 + (Math.random() - 0.5) * this.w * 0.4;
    this.spawnBolt(x1, -20, x2, this.h * (0.5 + Math.random() * 0.5));
  }

  start() { if (!this.running) { this.running = true; requestAnimationFrame(this._loop); } }
  stop() { this.running = false; }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this._resize);
    if (this.pointer) window.removeEventListener("pointermove", this._onMove);
  }
}

window.LightningCanvas = LightningCanvas;
