# ✨ Birthday Surprise Progressive Web App (PWA)

A mobile-first, offline-ready, responsive Birthday Surprise website built using **pure vanilla HTML, CSS, and JavaScript**. No frameworks, no bundlers, and zero build tools. It runs immediately by opening `index.html` or hosting on any static web host.

---

## 🎁 Features & Scenes

1. **Scene 1: Golden Surprise Box**
   - Twinkling night sky starfield with floating golden particles.
   - 3D CSS golden gift box with ribbon and bow, pulsing gently.
   - First user tap pops the lid open with a golden sparkle explosion and starts the background music (unlocking browser audio policies).
2. **Scene 2: Memories Scroll with Fireworks**
   - Real-time 60fps canvas fireworks engine running continuously in the background (capped particles, battery-friendly, auto-pausing on hidden tabs).
   - Vertical full-height scroll-snap experience (`100dvh`).
   - Alternating entrance animations (polaroids, slide-in, rotation, scale, tilt) with sticky tape effect and typewriter captions.
   - Live scroll progress bar on top.
   - "One more surprise..." button at the end to advance.
3. **Scene 3: Cake & Candle with Blow Detection**
   - Handcrafted CSS/SVG tiered cake with dripping icing and candle.
   - **Microphone blow detection**: Detects real-life blowing into the phone's microphone using Web Audio API to extinguish the candle!
   - **Double fallback**: "Tap to blow" button and direct tapping on the candle or flame in case microphone permission is blocked.
   - Smoke wisp animation upon extinguishing, followed by a glowing 3-second countdown (3... 2... 1...).
   - **Grand Celebration Blast**: Screen-shaking celebration, confetti cannon explosion, full-screen fireworks finale, and glowing "HAPPY BIRTHDAY!" headline burst.
4. **Scene 4: Love Note**
   - Gentle 3D parchment letter unfolding animation.
   - Headline wish, realistic typewriter effect printing each line of your personal letter, and custom signature.
   - Rising romantic hearts and a "Replay surprise" button.
5. **PWA & Offline Capable**
   - `manifest.json` configured for standalone portrait mode.
   - Service worker (`sw.js`) with cache-first strategy for instant offline loading.
   - Safe-area insets (`env(safe-area-inset-top)`), `touch-action: manipulation`, no bounce zoom.

---

## 📁 Project Structure

```text
/
├── index.html          # Main HTML entry point
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker with offline caching
├── README.md           # Documentation & instructions
├── css/
│   └── style.css       # Deep midnight gold styling & animations
├── js/
│   ├── config.js       # SINGLE place to edit all text, names & photos
│   ├── app.js          # State machine, audio manager, & scene coordinator
│   ├── fireworks.js    # 60fps canvas fireworks engine
│   └── cake.js         # Cake, microphone blow detection, & celebration blast
└── assets/
    ├── icons/          # PWA icons (icon-192.png, icon-512.png)
    ├── photos/         # 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg (add your own!)
    └── music.mp3       # Background song (add your own favorite song!)
```

---

## ✏️ How to Customize (Only edit `js/config.js`!)

Open `js/config.js` in any text editor. Everything is customized here:

```javascript
const CONFIG = {
  // Birthday person's name
  personName: "Asmath famitha",

  // Your name or sign-off
  fromName: "With All My Love ❤️",

  // Headline in Scene 4 letter
  birthdayWishHeadline: "Happy Birthday, My Favorite Human! ✨",

  // Path to background music
  musicSrc: "assets/music.mp3",

  // Memories array: add or remove as many as you like!
  memories: [
    {
      src: "assets/photos/1.jpg",
      caption: "The day your smile made the whole room light up... ✨",
      date: "Golden Moments"
    },
    {
      src: "assets/photos/2.jpg",
      caption: "All the laughter and silly inside jokes we share 💖",
      date: "Pure Joy"
    }
  ],

  // Love letter paragraphs (each item is typed out line by line)
  loveNote: [
    "To the most wonderful person in the world,",
    "On your special day, I wanted to celebrate everything about you...",
    "Happy Birthday! You deserve the universe and so much more. 🎂✨💖"
  ]
};
```

---

## 📷 Adding Your Photos & Music

1. **Photos**:
   - Place your photos inside `assets/photos/` named `1.jpg`, `2.jpg`, `3.jpg`, etc.
   - Portrait or square photos work best for mobile screens.
   - If a photo fails to load or is missing, a graceful placeholder appears automatically.
2. **Music**:
   - Place your favorite song into `assets/music.mp3`.
   - Any standard `.mp3` file works.
   - If no audio file is provided or playback fails, the app automatically switches to a dreamy built-in Web Audio API music-box chime so sound is never silent!

---

## 🚀 How to Test Locally

### Option 1: Direct File Opening
Double-click `index.html` in your browser. All visual scenes, animations, fireworks, and cake tapping work directly!

### Option 2: Local HTTP Server (Recommended for PWA & Mic testing)
To test microphone blow detection and PWA Service Worker caching locally, run a lightweight local static server:

```bash
# Using npx (Node.js)
npx serve .

# Or using Python 3
python -m http.server 8000

# Or using VS Code "Live Server" extension
# Right click index.html -> "Open with Live Server"
```
Then visit `http://localhost:3000` or `http://localhost:8000` in your browser.

> **Testing on Mobile**: Open Chrome or Safari DevTools (`F12`), click the **Toggle device toolbar** button (`Ctrl + Shift + M`), and select **iPhone 14 Pro** or **Pixel 7** to experience the exact mobile feel.

---

## 🌐 Deploy for Free (100% Free Static Hosting)

> **Important Note**: Web browsers require **HTTPS** for the **Microphone (blow detection)** and **PWA offline service worker** to work. All the platforms below automatically provide a free HTTPS certificate!

### 1. Netlify (Easiest - Drag & Drop)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the `Bday` folder into the browser window.
3. Your site is live in 10 seconds with a free HTTPS URL (e.g., `https://asmath-birthday.netlify.app`)!

### 2. Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory, or link your GitHub repository on [vercel.com](https://vercel.com).
3. Instant deployment with HTTPS!

### 3. GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to repository **Settings** -> **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
4. Your site will be published at `https://<your-username>.github.io/<repo-name>/`.

---

## 📱 Installing on Phone (PWA "Add to Home Screen")

- **iOS (Safari)**: Tap the **Share** button (box with upward arrow) -> scroll down and select **"Add to Home Screen"**.
- **Android (Chrome)**: Tap the **three dots menu** (top right) or the on-screen **"📲 Install App"** button -> select **"Add to Home screen"** / **"Install app"**.

Once installed, it opens like a native mobile app with full-screen experience and works even when offline!
