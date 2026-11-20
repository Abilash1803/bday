/**
 * ====================================================================
 * BIRTHDAY SURPRISE CONFIGURATION
 * ====================================================================
 * Edit this file to customize the birthday experience!
 * You do NOT need to touch any other file.
 */

const CONFIG = {
  // Birthday person's name (shown on Scene 1, Scene 3, and Scene 4)
  personName: "Asmath famitha",

  // Your name or sign-off (shown at the bottom of the love letter in Scene 4)
  fromName: "With All My Love ❤️",

  // Birthday wish headline (shown prominently at the top of the love letter in Scene 4)
  birthdayWishHeadline: "To My Forever & Always, Asmath Famitha 🤍✨",

  // Background music path (place your audio file in assets/music.mp3)
  musicSrc: "assets/music.mp3",

  // Memories gallery (Scene 2):
  // You can add as many memories as you like.
  // Add your photos to assets/photos/ (e.g. 1.jpg, 2.jpg)
  memories: [
    {
      src: "assets/photos/1.jpg",
      caption: "The way your sweet smile and laughter light up my whole world ✨",
      date: "Pure Joy"
    },
    {
      src: "assets/photos/2.jpg",
      caption: "Dancing through life and making every moment feel like magic 💖",
      date: "Together Forever"
    },
    {
      src: "assets/photos/3.jpg",
      caption: "Lost in beautiful places, but always found right with you 🌿✨",
      date: "Adventures"
    },
    {
      src: "assets/photos/4.jpg",
      caption: "In your eyes, I found my favorite place in the entire universe 🥂❤️",
      date: "My Everything"
    }
  ],

  // Love Note (Scene 4):
  // Each string in this array represents a paragraph typed out in the letter.
  loveNote: [
    "The day you walked into my life was the day my whole world became infinitely more beautiful. 🌍✨",
    "Happy Birthday to the girl who holds my heart, my happiness, and my entire forever. Every beat of my heart whispers your name, and every single prayer of mine asks for your happiness.",
    "You are not just a part of my life, Asmath; you are my favourite part of life. In your shy laughter, your gentle touch, and your sweet eyes, I found my home, my peace, and my greatest blessing.",
    "Whether we are dancing under the open sky, getting lost together in misty tea gardens, or simply looking into each other's eyes — every second with you feels like a dream I never want to wake up from.",
    "Thank you for being my dream come true, my best friend, and my endless love. I promise to hold your hand through every chapter of life, cherish you in every moment, and love you more with every passing breath.",
    "May your radiant smile shine forever and ever, my love! Happy Birthday, my precious Asmath Famitha. 🤍✨🎂"
  ],

  // Extra options (can be left at defaults)
  options: {
    // Enable Web Audio ambient music-box fallback if music.mp3 is silent or missing
    enableSynthMusicFallback: true,
    // Delay before showing the 'One more surprise' button on the last photo (ms)
    memoryEndDelay: 1200,
    // Confetti count for the grand finale blast
    finaleConfettiCount: 160
  }
};

// Make accessible to all scripts whether in browser or module environments
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
