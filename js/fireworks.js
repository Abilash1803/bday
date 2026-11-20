/**
 * ====================================================================
 * FIREWORKS ENGINE (Performant & Cinematic Canvas Fireworks)
 * ====================================================================
 * Enhanced 60fps canvas fireworks engine designed specifically to burst
 * AROUND the centered photo cards (left, right, top corners & canopy)
 * with vivid neon colors, glittering trails, twin launches, and 3D depth.
 */

class FireworksEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.rockets = [];
    this.particles = [];
    this.sparkTrails = [];

    // Particle capping for smooth 60fps on phones
    this.maxParticles = 180;
    this.maxRockets = 6;

    this.isRunning = false;
    this.animId = null;
    this.lastLaunchTime = 0;
    this.launchInterval = 950; // Faster, livelier cadence

    // Highly vibrant, rich celebratory palettes
    this.palettes = [
      ["#FF1493", "#00FFFF", "#FFD700", "#FF4500", "#FFFFFF"], // Neon Fiesta (Hot Pink, Cyan, Gold)
      ["#FFD700", "#FFA500", "#FFEC8B", "#FF8C00", "#FFFFFF"], // Royal Gold & Champagne
      ["#9400D3", "#00F5FF", "#FF69B4", "#7B68EE", "#FFFFFF"], // Cosmic Purple & Electric Cyan
      ["#00FF7F", "#00E5FF", "#FFFF00", "#76FF03", "#FFFFFF"], // Aurora Emerald & Aqua
      ["#FF3366", "#FF7EB3", "#FF9933", "#FFCC00", "#FFFFFF"], // Sunset Romance (Rose, Coral, Amber)
      ["#E040FB", "#00E676", "#FFEA00", "#FF1744", "#00B0FF"]  // Vivid Festival Rainbow
    ];

    this.launchSideToggle = false;
    this.prefersReducedMotion = false;
    this.handleResize = this.handleResize.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.loop = this.loop.bind(this);
  }

  init(canvasElement) {
    if (!canvasElement) return;
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d", { alpha: true });

    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.prefersReducedMotion) {
      this.maxParticles = 50;
      this.launchInterval = 2800;
    }

    this.handleResize();
    window.addEventListener("resize", this.handleResize, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibility);
  }

  handleResize() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  handleVisibility() {
    if (document.hidden) {
      this.pause();
    } else if (this.isRunning) {
      this.resume();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastLaunchTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.clear();
  }

  pause() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resume() {
    if (this.isRunning && !this.animId) {
      this.lastLaunchTime = performance.now();
      this.loop();
    }
  }

  clear() {
    this.rockets = [];
    this.particles = [];
    this.sparkTrails = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Launch rockets intentionally targeting zones OUTSIDE the central photo:
   * Left Flank (5% - 22% width), Right Flank (78% - 95% width),
   * or High Canopy (above photo at 7% - 20% height).
   */
  launchPerimeterRocket(forcedSide = null) {
    if (this.rockets.length >= this.maxRockets) return;

    // Pick side: left, right, or top canopy
    let side = forcedSide;
    if (!side) {
      const rand = Math.random();
      if (rand < 0.42) side = "left";
      else if (rand < 0.84) side = "right";
      else side = "top";
    }

    let startX, targetX, targetY;
    const startY = this.height + 25;

    if (side === "left") {
      startX = this.width * (0.05 + Math.random() * 0.18);
      targetX = this.width * (0.06 + Math.random() * 0.18);
      // Explode along left side of the photo
      targetY = this.height * (0.18 + Math.random() * 0.45);
    } else if (side === "right") {
      startX = this.width * (0.76 + Math.random() * 0.18);
      targetX = this.width * (0.76 + Math.random() * 0.18);
      // Explode along right side of the photo
      targetY = this.height * (0.18 + Math.random() * 0.45);
    } else {
      // High canopy above the photo card
      startX = this.width * (0.2 + Math.random() * 0.6);
      targetX = this.width * (0.12 + Math.random() * 0.76);
      targetY = this.height * (0.07 + Math.random() * 0.14);
    }

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    const speed = 10 + Math.random() * 3.5;

    const palette = this.palettes[Math.floor(Math.random() * this.palettes.length)];

    this.rockets.push({
      x: startX,
      y: startY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      targetY: targetY,
      color: palette[Math.floor(Math.random() * palette.length)],
      palette: palette,
      trail: [],
      maxTrail: 8,
      sparkTimer: 0
    });
  }

  /**
   * Launch twin rockets on both sides simultaneously for high visual drama
   */
  launchTwinRockets() {
    this.launchPerimeterRocket("left");
    setTimeout(() => {
      this.launchPerimeterRocket("right");
    }, 120);
  }

  burst(x, y, count = 38, palette) {
    const selectedPalette = palette || this.palettes[Math.floor(Math.random() * this.palettes.length)];
    const allowed = Math.min(count, this.maxParticles - this.particles.length);
    if (allowed <= 0) return;

    const burstType = Math.random(); // 0-0.7: standard sphere, 0.7-1: sparkling willow

    for (let i = 0; i < allowed; i++) {
      const angle = (Math.PI * 2 * i) / allowed + (Math.random() - 0.5) * 0.35;
      const speed = burstType > 0.7 ? 2.0 + Math.random() * 4.8 : 2.5 + Math.random() * 5.2;
      const color = selectedPalette[Math.floor(Math.random() * selectedPalette.length)];

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: burstType > 0.7 ? 0.012 + Math.random() * 0.014 : 0.016 + Math.random() * 0.018,
        color: color,
        size: 2.2 + Math.random() * 2.5,
        gravity: burstType > 0.7 ? 0.075 : 0.062,
        drag: burstType > 0.7 ? 0.96 : 0.968,
        twinkle: Math.random() > 0.35,
        sparklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  megaFinale() {
    // Grand celebration multi-burst across top and sides
    const positions = [
      { x: 0.12, y: 0.15 },
      { x: 0.88, y: 0.15 },
      { x: 0.10, y: 0.35 },
      { x: 0.90, y: 0.35 },
      { x: 0.50, y: 0.10 },
      { x: 0.20, y: 0.22 },
      { x: 0.80, y: 0.22 }
    ];

    positions.forEach((pos, idx) => {
      setTimeout(() => {
        const x = this.width * pos.x + (Math.random() - 0.5) * 20;
        const y = this.height * pos.y + (Math.random() - 0.5) * 20;
        this.burst(x, y, 42);
      }, idx * 190);
    });
  }

  loop() {
    if (!this.isRunning) return;

    const now = performance.now();
    if (now - this.lastLaunchTime > this.launchInterval) {
      // 35% chance of synchronized twin launch (left and right)
      if (Math.random() < 0.38) {
        this.launchTwinRockets();
      } else {
        this.launchPerimeterRocket();
      }

      this.lastLaunchTime = now + (Math.random() - 0.5) * 250;
    }

    this.update();
    this.render();

    this.animId = requestAnimationFrame(this.loop);
  }

  update() {
    // Update rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > r.maxTrail) r.trail.shift();

      // Emit glittering trail sparks while rising
      r.sparkTimer++;
      if (r.sparkTimer % 2 === 0 && this.sparkTrails.length < 50) {
        this.sparkTrails.push({
          x: r.x + (Math.random() - 0.5) * 4,
          y: r.y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1.5 + 0.5,
          alpha: 0.85,
          decay: 0.045,
          color: r.color,
          size: 1.5 + Math.random() * 1.5
        });
      }

      r.x += r.vx;
      r.y += r.vy;

      // Rocket reached apex or target height
      if (r.vy >= 0 || r.y <= r.targetY) {
        this.burst(r.x, r.y, 40, r.palette);
        this.rockets.splice(i, 1);
      }
    }

    // Update trail sparks
    for (let i = this.sparkTrails.length - 1; i >= 0; i--) {
      const s = this.sparkTrails[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;
      if (s.alpha <= 0) {
        this.sparkTrails.splice(i, 1);
      }
    }

    // Update burst particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.sparklePhase += 0.25;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    if (!this.ctx) return;

    // Fade trail for glowing comet trails
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.globalCompositeOperation = "lighter";

    // 1. Draw Rocket Trails & Rocket Heads
    for (let i = 0; i < this.rockets.length; i++) {
      const r = this.rockets[i];
      this.ctx.strokeStyle = r.color;
      this.ctx.lineWidth = 2.8;
      this.ctx.beginPath();
      if (r.trail.length > 0) {
        this.ctx.moveTo(r.trail[0].x, r.trail[0].y);
        for (let j = 1; j < r.trail.length; j++) {
          this.ctx.lineTo(r.trail[j].x, r.trail[j].y);
        }
      }
      this.ctx.lineTo(r.x, r.y);
      this.ctx.stroke();

      // Glowing Rocket Head
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.shadowColor = r.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Draw Glittering Trail Sparks
    for (let i = 0; i < this.sparkTrails.length; i++) {
      const s = this.sparkTrails[i];
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, s.alpha);
      this.ctx.fillStyle = s.color;
      this.ctx.shadowColor = s.color;
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 3. Draw Burst Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      let currentAlpha = p.alpha;
      if (p.twinkle) {
        currentAlpha = p.alpha * (0.65 + 0.35 * Math.sin(p.sparklePhase));
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, currentAlpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}

// Global instance for simple access
window.Fireworks = new FireworksEngine();
