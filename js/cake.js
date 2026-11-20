/**
 * ====================================================================
 * CAKE & CANDLE CONTROLLER (Blow Detection + Grand Finale)
 * ====================================================================
 * - Microphone blow detection using Web Audio API AnalyserNode
 * - Tap fallback on candle & dedicated "Tap to blow" button
 * - Smoke wisp extinguishing animation
 * - 3-second countdown with pulse
 * - Grand Finale: Confetti cannon + screen shake + Fireworks + "HAPPY BIRTHDAY!" text burst
 */

class CakeController {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.micStream = null;
    this.isListening = false;
    this.isBlownOut = false;
    this.animFrameId = null;

    // Thresholds for blow detection
    this.blowThreshold = 45; // RMS threshold
    this.blowSustainedFrames = 0;
    this.requiredSustainedFrames = 4; // Require consecutive frames to prevent false trigger on click

    // Callback when candle is blown and countdown finishes
    this.onFinaleComplete = null;

    // DOM Elements
    this.candleElement = null;
    this.flameElement = null;
    this.smokeElement = null;
    this.cakeContainer = null;
    this.blowBtn = null;
    this.micHint = null;
    this.countdownOverlay = null;
    this.countdownNumber = null;
    this.celebrationBanner = null;

    this.checkBlow = this.checkBlow.bind(this);
    this.extinguishCandle = this.extinguishCandle.bind(this);
  }

  init(options = {}) {
    this.onFinaleComplete = options.onFinaleComplete || null;

    this.candleElement = document.getElementById("candle");
    this.flameElement = document.getElementById("candleFlame");
    this.smokeElement = document.getElementById("candleSmoke");
    this.cakeContainer = document.getElementById("cakeWrapper");
    this.blowBtn = document.getElementById("tapBlowBtn");
    this.micHint = document.getElementById("micStatusText");
    this.countdownOverlay = document.getElementById("countdownOverlay");
    this.countdownNumber = document.getElementById("countdownNumber");
    this.celebrationBanner = document.getElementById("celebrationBanner");
    this.scene3Element = document.getElementById("scene3");
    this.wishPrompt = document.getElementById("wishPromptArea");
    this.cakeControls = document.getElementById("cakeControlsArea");

    // Click/tap fallbacks
    if (this.blowBtn) {
      this.blowBtn.addEventListener("click", () => this.extinguishCandle("button"));
    }
    if (this.candleElement) {
      this.candleElement.addEventListener("click", () => this.extinguishCandle("candle-tap"));
    }
  }

  activate() {
    this.isBlownOut = false;
    this.blowSustainedFrames = 0;

    // Reset visual elements
    if (this.flameElement) {
      this.flameElement.style.display = "block";
      this.flameElement.classList.remove("blown-out");
      this.flameElement.classList.add("flicker");
    }
    if (this.smokeElement) {
      this.smokeElement.classList.remove("active");
    }
    if (this.celebrationBanner) {
      this.celebrationBanner.classList.remove("visible");
    }
    if (this.cakeContainer) {
      this.cakeContainer.classList.remove("celebrating-shake");
    }
    if (this.scene3Element) {
      this.scene3Element.classList.remove("scene3-celebrating");
    }

    // Try starting microphone blow detection
    this.startMicListening();
  }

  async startMicListening() {
    if (this.isListening || this.isBlownOut) return;

    // Check if getUserMedia is supported and in secure context (or localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.updateMicStatus("Tap candle or button below to blow ✨");
      return;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        this.updateMicStatus("Tap candle or button below to blow ✨");
        return;
      }

      this.audioContext = new AudioContextClass();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.2;
      source.connect(this.analyser);

      this.isListening = true;
      this.updateMicStatus("🌬️ Blow gently into your mic, or tap candle!");
      this.checkBlow();
    } catch (err) {
      console.warn("Microphone access unavailable or denied:", err.message);
      this.updateMicStatus("Tap candle or button below to blow ✨");
    }
  }

  checkBlow() {
    if (!this.isListening || this.isBlownOut) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate energy in low-to-mid frequencies characteristic of blowing breath
    let sum = 0;
    const binLimit = Math.min(60, dataArray.length);
    for (let i = 0; i < binLimit; i++) {
      sum += dataArray[i];
    }
    const average = sum / binLimit;

    // Reactively pulse candle flame slightly on breath input for delightful realism
    if (average > 18 && this.flameElement) {
      const wobble = 1 + (average / 70) * 0.4;
      this.flameElement.style.transform = `scale(${wobble}, ${Math.max(0.6, 1.4 - average / 60)}) rotate(${(Math.random() - 0.5) * 15}deg)`;
    }

    if (average > this.blowThreshold) {
      this.blowSustainedFrames++;
      if (this.blowSustainedFrames >= this.requiredSustainedFrames) {
        this.extinguishCandle("mic");
        return;
      }
    } else {
      this.blowSustainedFrames = Math.max(0, this.blowSustainedFrames - 1);
    }

    this.animFrameId = requestAnimationFrame(this.checkBlow);
  }

  stopMicListening() {
    this.isListening = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  updateMicStatus(text) {
    if (this.micHint) {
      this.micHint.textContent = text;
    }
  }

  extinguishCandle(triggerSource = "tap") {
    if (this.isBlownOut) return;
    this.isBlownOut = true;
    this.stopMicListening();

    this.updateMicStatus("Wish made! ✨");

    // 1. Extinguish flame & trigger smoke wisp
    if (this.flameElement) {
      this.flameElement.classList.remove("flicker");
      this.flameElement.classList.add("blown-out");
      setTimeout(() => {
        if (this.flameElement) this.flameElement.style.display = "none";
      }, 350);
    }

    if (this.smokeElement) {
      this.smokeElement.classList.add("active");
    }

    // Tell app to temporarily lower audio volume during countdown
    if (window.App && typeof window.App.duckAudio === "function") {
      window.App.duckAudio(true);
    }

    // 2. Start 3-second countdown
    setTimeout(() => {
      this.startCountdown();
    }, 700);
  }

  startCountdown() {
    let count = 3;
    if (!this.countdownOverlay || !this.countdownNumber) {
      this.triggerGrandFinale();
      return;
    }

    this.countdownOverlay.classList.add("active");
    this.countdownNumber.textContent = count;
    this.countdownNumber.classList.add("pulse-tick");

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownNumber.classList.remove("pulse-tick");
        // Force reflow for animation restart
        void this.countdownNumber.offsetWidth;
        this.countdownNumber.textContent = count;
        this.countdownNumber.classList.add("pulse-tick");
      } else {
        clearInterval(timer);
        this.countdownOverlay.classList.remove("active");
        this.triggerGrandFinale();
      }
    }, 1000);
  }

  triggerGrandFinale() {
    // Restore audio volume to full
    if (window.App && typeof window.App.duckAudio === "function") {
      window.App.duckAudio(false);
    }

    // Toggle celebration state so prompt & buttons vanish cleanly
    if (this.scene3Element) {
      this.scene3Element.classList.add("scene3-celebrating");
    }

    // 1. Gentle celebration bounce on cake
    if (this.cakeContainer) {
      this.cakeContainer.classList.add("celebrating-shake");
    }

    // 2. Show "HAPPY BIRTHDAY!" cute popup banner
    if (this.celebrationBanner) {
      this.celebrationBanner.classList.add("visible");
      const person = (window.CONFIG && window.CONFIG.personName) ? window.CONFIG.personName : "You";
      const titleSpan = document.getElementById("celebrationName");
      if (titleSpan) titleSpan.textContent = person;
    }

    // 3. Simple, cute sparkle blast right around the cake
    this.launchSimpleCakeBlast();

    // 4. Soft gentle confetti pop
    this.launchConfetti();

    // 5. Auto-transition to Scene 4 after celebration
    setTimeout(() => {
      if (typeof this.onFinaleComplete === "function") {
        this.onFinaleComplete();
      }
    }, 4200);
  }

  /**
   * Simple, small celebratory sparkle pop directly around the cake
   */
  launchSimpleCakeBlast() {
    if (!this.cakeContainer) return;
    const colors = ["#FFD700", "#FF6584", "#64FFDA", "#FFA500", "#FFFFFF", "#FF4081"];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "cake-sparkle-burst";
      sparkle.style.color = colors[i % colors.length];
      sparkle.style.backgroundColor = colors[i % colors.length];

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const distance = 45 + Math.random() * 55;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 20;

      sparkle.style.setProperty("--tx", `${tx}px`);
      sparkle.style.setProperty("--ty", `${ty}px`);

      this.cakeContainer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 950);
    }
  }

  launchConfetti() {
    const confettiContainer = document.getElementById("confettiContainer") || document.body;
    // Gentle, pleasant pop of confetti (40 pieces instead of 120+)
    const count = 40;
    const colors = ["#FFD700", "#FF6584", "#64FFDA", "#FFA500", "#FFFFFF", "#FF7EB3"];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-particle";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      const startX = 15 + Math.random() * 70; // within viewport center area
      const size = 5 + Math.random() * 6;
      const duration = 2.4 + Math.random() * 2.0;
      const delay = Math.random() * 0.5;
      const rotation = Math.random() * 540 - 270;

      piece.style.width = `${size}px`;
      piece.style.height = `${size * 1.4}px`;
      piece.style.left = `${startX}%`;
      piece.style.top = "10%";
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${delay}s`;
      piece.style.setProperty("--rot", `${rotation}deg`);

      confettiContainer.appendChild(piece);

      setTimeout(() => {
        piece.remove();
      }, (duration + delay + 0.3) * 1000);
    }
  }

  destroy() {
    this.stopMicListening();
    this.isBlownOut = false;
    if (this.scene3Element) {
      this.scene3Element.classList.remove("scene3-celebrating");
    }
  }
}

// Global instance for access
window.Cake = new CakeController();
