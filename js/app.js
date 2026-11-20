/**
 * ====================================================================
 * MAIN APPLICATION & FLOW STATE MACHINE
 * ====================================================================
 * State Machine: scene1 -> scene2 -> scene3 -> scene4
 * Audio manager with fade-in, mute toggle, volume ducking, & synth fallback
 * Dynamic rendering from config.js
 * PWA Service Worker & Install Prompt handler
 */

class BirthdayApp {
  constructor() {
    this.currentScene = "scene1";
    this.audioElement = null;
    this.isMuted = false;
    this.audioPlaying = false;
    this.synthMusicActive = false;
    this.deferredInstallPrompt = null;
    this.typewriterTimeouts = [];

    // Web Audio synth chime fallback
    this.synthAudioCtx = null;
    this.synthTimer = null;

    this.init = this.init.bind(this);
    this.goToScene = this.goToScene.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.handleBoxClick = this.handleBoxClick.bind(this);
    this.resetToStart = this.resetToStart.bind(this);
  }

  init() {
    // 1. Audio setup
    this.audioElement = document.getElementById("bgMusic");
    const muteBtn = document.getElementById("muteToggleBtn");
    if (muteBtn) {
      muteBtn.addEventListener("click", this.toggleMute);
    }

    // 2. Setup Canvas Fireworks
    const fireworksCanvas = document.getElementById("fireworksCanvas");
    if (window.Fireworks && fireworksCanvas) {
      window.Fireworks.init(fireworksCanvas);
    }

    // 3. Setup Cake Controller
    if (window.Cake) {
      window.Cake.init({
        onFinaleComplete: () => {
          this.goToScene("scene4");
        }
      });
    }

    // 4. Generate Scene 1 Stars & Sparkles
    this.generateStarfield();

    // 5. Render dynamic content from config.js
    this.renderFromConfig();

    // 6. Scene 1 Box tap handler
    const giftBox = document.getElementById("goldenGiftBox");
    if (giftBox) {
      giftBox.addEventListener("click", this.handleBoxClick);
    }

    // 7. Scene 4 Replay button
    const replayBtn = document.getElementById("replaySurpriseBtn");
    if (replayBtn) {
      replayBtn.addEventListener("click", this.resetToStart);
    }

    // 8. PWA Install handler & Service Worker registration
    this.setupPWA();

    // 9. Initial Scene
    this.goToScene("scene1");
  }

  /* -------------------------------------------------------------
   * STATE MACHINE & SCENE TRANSITIONS
   * ----------------------------------------------------------- */
  goToScene(sceneId) {
    const scenes = ["scene1", "scene2", "scene3", "scene4"];
    if (!scenes.includes(sceneId)) return;

    this.currentScene = sceneId;

    scenes.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      if (id === sceneId) {
        el.classList.remove("scene-hidden");
        el.classList.add("scene-active");
      } else {
        el.classList.remove("scene-active");
        el.classList.add("scene-hidden");
      }
    });

    // Scene-specific hooks
    if (sceneId === "scene1") {
      if (window.Fireworks) window.Fireworks.stop();
      if (window.Cake) window.Cake.destroy();
    } else if (sceneId === "scene2") {
      // Fireworks active ONLY for the memories/images scene
      if (window.Fireworks) window.Fireworks.start();
      this.initMemoryScrollObservers();
    } else if (sceneId === "scene3") {
      // Stop background fireworks so Scene 3 is calm and focused on the cake
      if (window.Fireworks) window.Fireworks.stop();
      if (window.Cake) window.Cake.activate();
    } else if (sceneId === "scene4") {
      if (window.Fireworks) window.Fireworks.stop();
      this.playLoveLetterAnimation();
    }
  }

  /* -------------------------------------------------------------
   * SCENE 1: GIFT BOX OPENING
   * ----------------------------------------------------------- */
  handleBoxClick() {
    const giftBox = document.getElementById("goldenGiftBox");
    if (!giftBox || giftBox.classList.contains("opening")) return;

    giftBox.classList.add("opening");

    // Start audio on user gesture (bypasses browser autoplay policy)
    this.startAudioWithFade();

    // Burst golden sparkles around the box
    this.burstSparkles(giftBox);

    // Transition smoothly after lid pop animation
    setTimeout(() => {
      this.goToScene("scene2");
    }, 1200);
  }

  burstSparkles(parentElement) {
    const rect = parentElement.getBoundingClientRect();
    const count = 30;
    const colors = ["#FFE082", "#FFD700", "#FFF9C4", "#FF6584", "#FFFFFF"];

    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "box-sparkle-burst";
      s.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 120;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 40; // upward bias
      
      s.style.setProperty("--tx", `${tx}px`);
      s.style.setProperty("--ty", `${ty}px`);
      
      parentElement.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  }

  generateStarfield() {
    const container = document.getElementById("starfield");
    if (!container) return;
    container.innerHTML = "";

    const starCount = 55;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "twinkle-star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      const size = 1 + Math.random() * 2.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.animationDuration = `${2 + Math.random() * 3}s`;
      container.appendChild(star);
    }
  }

  /* -------------------------------------------------------------
   * SCENE 2: MEMORIES SCROLL RENDERING & OBSERVERS
   * ----------------------------------------------------------- */
  renderFromConfig() {
    const config = window.CONFIG || {};

    // 1. Box Person Name
    const nameSpan = document.getElementById("boxPersonName");
    if (nameSpan && config.personName) {
      nameSpan.textContent = config.personName;
    }

    // 2. Render Memories into Scene 2 scroll snap container
    const memoriesList = document.getElementById("memoriesContainer");
    if (memoriesList && Array.isArray(config.memories)) {
      memoriesList.innerHTML = "";

      config.memories.forEach((mem, index) => {
        const item = document.createElement("div");
        item.className = "memory-snap-item";
        item.setAttribute("data-index", index);

        // Alternate animation variant classes: scale, slide-left, slide-right, tilt
        const variants = ["anim-scale", "anim-slide-left", "anim-slide-right", "anim-polaroid"];
        const variantClass = variants[index % variants.length];

        item.innerHTML = `
          <div class="memory-card-wrapper ${variantClass}">
            <div class="polaroid-frame">
              <div class="tape-strip"></div>
              <div class="photo-wrapper">
                <img 
                  src="${mem.src}" 
                  alt="${mem.caption || 'Memory'}"
                  loading="lazy"
                  class="memory-img"
                  onerror="this.onerror=null; this.src='assets/icons/icon-512.png'; this.classList.add('fallback-img');"
                />
                <div class="photo-sparkle-badge">✨</div>
              </div>
              <div class="polaroid-caption-box">
                <span class="memory-date-tag">${mem.date || `Memory #${index + 1}`}</span>
                <p class="memory-caption-text">${mem.caption || ''}</p>
              </div>
            </div>
            <div class="floating-heart-bubble">💖</div>
          </div>
        `;

        memoriesList.appendChild(item);
      });

      // Append End of Memories celebration trigger card
      const endItem = document.createElement("div");
      endItem.className = "memory-snap-item memory-end-card";
      endItem.innerHTML = `
        <div class="surprise-reveal-box">
          <div class="floating-cake-icon">🎂</div>
          <h3 class="surprise-prompt-title">The night is just getting started...</h3>
          <p class="surprise-prompt-subtitle">There is one more sweet surprise waiting for you.</p>
          <button id="toCakeBtn" class="primary-gold-btn pulse-glow">
            <span>One More Surprise... ✨</span>
          </button>
        </div>
      `;
      memoriesList.appendChild(endItem);

      const toCakeBtn = endItem.querySelector("#toCakeBtn");
      if (toCakeBtn) {
        toCakeBtn.addEventListener("click", () => this.goToScene("scene3"));
      }
    }

    // 3. Setup Audio Source
    if (this.audioElement && config.musicSrc) {
      this.audioElement.src = config.musicSrc;
    }
  }

  initMemoryScrollObservers() {
    const memoriesList = document.getElementById("memoriesContainer");
    const progressBar = document.getElementById("memoryScrollProgress");
    if (!memoriesList) return;

    // Scroll progress indicator
    memoriesList.addEventListener("scroll", () => {
      const scrollTotal = memoriesList.scrollHeight - memoriesList.clientHeight;
      const progress = scrollTotal > 0 ? (memoriesList.scrollTop / scrollTotal) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }, { passive: true });

    // IntersectionObserver for entrance animations
    const cards = memoriesList.querySelectorAll(".memory-card-wrapper, .surprise-reveal-box");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const wasInView = entry.target.classList.contains("in-view");
          entry.target.classList.add("in-view");
          // Launch perimeter celebration fireworks on both flanks when a photo scrolls into view
          if (!wasInView && window.Fireworks && window.Fireworks.isRunning) {
            window.Fireworks.launchTwinRockets();
          }
        } else {
          entry.target.classList.remove("in-view");
        }
      });
    }, {
      root: memoriesList,
      threshold: 0.55
    });

    cards.forEach((card) => observer.observe(card));
  }

  /* -------------------------------------------------------------
   * SCENE 4: LOVE NOTE UNFOLDING & TYPEWRITER
   * ----------------------------------------------------------- */
  playLoveLetterAnimation() {
    const config = window.CONFIG || {};
    const noteCard = document.getElementById("loveNoteCard");
    const headline = document.getElementById("loveNoteHeadline");
    const content = document.getElementById("loveNoteBody");
    const signature = document.getElementById("loveNoteSignature");
    const container = document.getElementById("letterHeartsContainer");

    // Clear previous timeouts
    this.typewriterTimeouts.forEach((t) => clearTimeout(t));
    this.typewriterTimeouts = [];

    if (headline) headline.textContent = config.birthdayWishHeadline || "Happy Birthday!";
    if (signature) signature.textContent = `— ${config.fromName || "Forever Yours ❤️"}`;
    if (content) content.innerHTML = "";

    if (noteCard) {
      noteCard.classList.remove("unfolded");
      void noteCard.offsetWidth; // reflow
      noteCard.classList.add("unfolded");
    }

    // Spawn floating romantic background hearts
    if (container) {
      container.innerHTML = "";
      for (let i = 0; i < 15; i++) {
        const heart = document.createElement("div");
        heart.className = "floating-bg-heart";
        heart.textContent = ["💖", "✨", "🌸", "💕"][i % 4];
        heart.style.left = `${Math.random() * 90 + 5}%`;
        heart.style.animationDelay = `${Math.random() * 4}s`;
        heart.style.animationDuration = `${3 + Math.random() * 4}s`;
        container.appendChild(heart);
      }
    }

    // Typewriter effect for paragraphs
    const paragraphs = Array.isArray(config.loveNote)
      ? config.loveNote
      : [config.loveNote || "Wishing you the happiest birthday!"];

    let totalDelay = 900; // wait for letter unfold

    paragraphs.forEach((pText) => {
      const pEl = document.createElement("p");
      pEl.className = "letter-paragraph typing";
      if (content) content.appendChild(pEl);

      const delayPerChar = 22;
      const pDelay = totalDelay;

      const t1 = setTimeout(() => {
        let charIndex = 0;
        const interval = setInterval(() => {
          if (charIndex < pText.length) {
            pEl.textContent += pText.charAt(charIndex);
            charIndex++;
          } else {
            clearInterval(interval);
            pEl.classList.remove("typing");
          }
        }, delayPerChar);
      }, pDelay);

      this.typewriterTimeouts.push(t1);
      totalDelay += pText.length * delayPerChar + 350;
    });

    // Fade in signature and replay button at the end
    const t2 = setTimeout(() => {
      if (signature) signature.classList.add("visible");
      const replayBox = document.getElementById("replayBtnWrapper");
      if (replayBox) replayBox.classList.add("visible");
    }, totalDelay + 400);

    this.typewriterTimeouts.push(t2);
  }

  /* -------------------------------------------------------------
   * RESET SURPRISE FLOW
   * ----------------------------------------------------------- */
  resetToStart() {
    // 1. Reset Box
    const giftBox = document.getElementById("goldenGiftBox");
    if (giftBox) {
      giftBox.classList.remove("opening");
    }

    // 2. Reset scroll position of memories
    const memoriesList = document.getElementById("memoriesContainer");
    if (memoriesList) {
      memoriesList.scrollTop = 0;
    }
    const progressBar = document.getElementById("memoryScrollProgress");
    if (progressBar) {
      progressBar.style.width = "0%";
    }

    // 3. Reset Cake
    if (window.Cake) {
      window.Cake.destroy();
    }

    // 4. Return to Scene 1
    this.goToScene("scene1");
  }

  /* -------------------------------------------------------------
   * AUDIO ENGINE (Audio element + Web Audio Synth Fallback)
   * ----------------------------------------------------------- */
  startAudioWithFade() {
    if (this.audioPlaying) return;

    if (this.audioElement) {
      this.audioElement.volume = 0;
      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.audioPlaying = true;
            this.fadeInAudio();
            this.updateMuteUI();
          })
          .catch((err) => {
            console.warn("HTML5 audio playback failed, activating soothing synth chime fallback:", err);
            // Fallback to Web Audio API ambient music-box chime
            this.startSynthChimes();
          });
      }
    } else {
      this.startSynthChimes();
    }
  }

  fadeInAudio() {
    if (!this.audioElement || this.isMuted) return;
    let vol = 0;
    const interval = setInterval(() => {
      vol = Math.min(0.85, vol + 0.05);
      if (this.audioElement) this.audioElement.volume = vol;
      if (vol >= 0.85) clearInterval(interval);
    }, 120);
  }

  duckAudio(duck = true) {
    if (!this.audioElement || this.isMuted) return;
    const target = duck ? 0.25 : 0.85;
    let current = this.audioElement.volume;
    const step = duck ? -0.05 : 0.05;

    const interval = setInterval(() => {
      current += step;
      if ((duck && current <= target) || (!duck && current >= target)) {
        current = target;
        clearInterval(interval);
      }
      if (this.audioElement) this.audioElement.volume = Math.max(0, Math.min(1, current));
    }, 80);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
    }
    if (this.synthAudioCtx) {
      if (this.isMuted && this.synthAudioCtx.state === "running") {
        this.synthAudioCtx.suspend();
      } else if (!this.isMuted && this.synthAudioCtx.state === "suspended") {
        this.synthAudioCtx.resume();
      }
    }
    this.updateMuteUI();
  }

  updateMuteUI() {
    const icon = document.getElementById("muteIcon");
    if (!icon) return;
    if (this.isMuted) {
      icon.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
    } else {
      icon.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
    }
  }

  /* Dreamy Web Audio API Ambient Music Box */
  startSynthChimes() {
    if (this.synthMusicActive) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.synthAudioCtx = new AudioContextClass();
    this.synthMusicActive = true;
    this.audioPlaying = true;
    this.updateMuteUI();

    // Pentatonic romantic notes in Hz: C4, D4, E4, G4, A4, C5, D5, E5, G5
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
    let step = 0;

    const playNote = () => {
      if (!this.synthMusicActive || this.isMuted || !this.synthAudioCtx) return;
      if (this.synthAudioCtx.state === "suspended") {
        this.synthAudioCtx.resume();
      }

      const osc = this.synthAudioCtx.createOscillator();
      const gain = this.synthAudioCtx.createGain();

      osc.type = "sine";
      const freq = notes[step % notes.length];
      osc.frequency.setValueAtTime(freq, this.synthAudioCtx.currentTime);

      gain.gain.setValueAtTime(0, this.synthAudioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.synthAudioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.synthAudioCtx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(this.synthAudioCtx.destination);

      osc.start();
      osc.stop(this.synthAudioCtx.currentTime + 1.8);

      step = (step + Math.floor(Math.random() * 3 + 1)) % notes.length;
      const nextTime = 400 + Math.random() * 500;
      this.synthTimer = setTimeout(playNote, nextTime);
    };

    playNote();
  }

  /* -------------------------------------------------------------
   * PWA SERVICE WORKER & INSTALL PROMPT
   * ----------------------------------------------------------- */
  setupPWA() {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => {
            console.log("PWA Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.log("Service Worker registration skipped or failed:", err.message);
          });
      });
    }

    // Non-intrusive Install Prompt handler
    const installBtn = document.getElementById("pwaInstallBtn");
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      if (installBtn) {
        installBtn.classList.remove("hidden");
        installBtn.addEventListener("click", () => {
          installBtn.classList.add("hidden");
          if (this.deferredInstallPrompt) {
            this.deferredInstallPrompt.prompt();
            this.deferredInstallPrompt.userChoice.then(() => {
              this.deferredInstallPrompt = null;
            });
          }
        });
      }
    });
  }
}

// Instantiate and launch when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.App = new BirthdayApp();
  window.App.init();
});
