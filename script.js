/*
 * script.js for Hola Animated PWA
 *
 * Registers a service worker for offline support and responds to the
 * "beforeinstallprompt" event to show a custom install button. When
 * clicked, the button will trigger the installation prompt for the PWA
 * on supported devices. After installation, the button disappears.
 */

// Register the service worker if supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .catch((err) => console.error('Service worker registration failed:', err));
  });
}

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
// Hide the install button by default until the event fires
if (installBtn) {
  installBtn.style.display = 'none';
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the browser from showing its default install UI
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', async () => {
      installBtn.disabled = true;
      // Show the install prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log('User response to the install prompt:', choiceResult.outcome);
        deferredPrompt = null;
      }
      installBtn.style.display = 'none';
    });
  }
});

/*
 * Navigation handling for the bottom navigation bar.
 *
 * The application consists of multiple <section> elements, each representing
 * a different page (home, music, theme, settings, profile). A
 * corresponding set of buttons in the bottom navigation bar controls
 * which section is visible. When a nav item is clicked, the script
 * removes the `active` class from all sections and nav items, then
 * adds it to the selected ones. This ensures only one section is
 * visible at a time, creating a simple single‑page app experience.
 */

// Attach click listeners after the DOM has loaded
window.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-section');
      // Update nav item active state
      navItems.forEach((btn) => btn.classList.remove('active'));
      item.classList.add('active');
      // Update section visibility
      sections.forEach((section) => section.classList.remove('active'));
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
      // Play click sound on navigation change
      playClickSound();
    });
  });

  // Theme selection handling
  const lightBtn = document.getElementById('theme-light');
  const darkBtn = document.getElementById('theme-dark');
  const glassBtn = document.getElementById('theme-glass');
  // Apply saved theme preference on load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('theme-light');
  } else if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
  } else if (savedTheme === 'glass') {
    document.body.classList.add('theme-glass');
  }
  // Theme button click handlers
  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      document.body.classList.remove('theme-dark', 'theme-glass');
      document.body.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
      playClickSound();
    });
  }
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      document.body.classList.remove('theme-light', 'theme-glass');
      document.body.classList.add('theme-dark');
      localStorage.setItem('theme', 'dark');
      playClickSound();
    });
  }
  if (glassBtn) {
    glassBtn.addEventListener('click', () => {
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add('theme-glass');
      localStorage.setItem('theme', 'glass');
      playClickSound();
    });
  }

  // Settings controls
  const animationsToggle = document.getElementById('animations-toggle');
  const soundsToggle = document.getElementById('sounds-toggle');
  const dpiRange = document.getElementById('dpi-range');
  const fontSelect = document.getElementById('font-select');
  const animationRange = document.getElementById('animation-range');

  // Helper to play a short beep when interactions occur. Uses Web Audio API
  function playClickSound() {
    // Only play if sounds are enabled
    const soundsPref = localStorage.getItem('sounds') || 'on';
    if (soundsPref !== 'on') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Fallback: do nothing if AudioContext is not supported
    }
  }

  // Load saved preferences and apply
  if (animationsToggle) {
    const animationsPref = localStorage.getItem('animations');
    if (animationsPref === 'off') {
      animationsToggle.checked = false;
      document.body.classList.add('no-animations');
    }
    animationsToggle.addEventListener('change', () => {
      if (animationsToggle.checked) {
        document.body.classList.remove('no-animations');
        localStorage.setItem('animations', 'on');
      } else {
        document.body.classList.add('no-animations');
        localStorage.setItem('animations', 'off');
      }
    });
  }
  if (soundsToggle) {
    const soundsPref = localStorage.getItem('sounds');
    if (soundsPref === 'off') {
      soundsToggle.checked = false;
    }
    soundsToggle.addEventListener('change', () => {
      localStorage.setItem('sounds', soundsToggle.checked ? 'on' : 'off');
    });
  }
  if (dpiRange) {
    const savedDpi = localStorage.getItem('dpi');
    if (savedDpi) {
      dpiRange.value = savedDpi;
      document.documentElement.style.setProperty('--dpi-scale', savedDpi);
    }
    dpiRange.addEventListener('input', () => {
      const val = dpiRange.value;
      document.documentElement.style.setProperty('--dpi-scale', val);
      localStorage.setItem('dpi', val);
    });
  }
  if (fontSelect) {
    const applyFontClass = (font) => {
      // Remove all possible font classes first
      document.body.classList.remove(
        'font-serif',
        'font-cursive',
        'font-mono',
        'font-fantasy',
        'font-elegant'
      );
      if (font === 'serif') {
        document.body.classList.add('font-serif');
      } else if (font === 'cursive') {
        document.body.classList.add('font-cursive');
      } else if (font === 'mono') {
        document.body.classList.add('font-mono');
      } else if (font === 'fantasy') {
        document.body.classList.add('font-fantasy');
      } else if (font === 'elegant') {
        document.body.classList.add('font-elegant');
      }
    };
    const savedFont = localStorage.getItem('font');
    if (savedFont) {
      fontSelect.value = savedFont;
      applyFontClass(savedFont);
    }
    fontSelect.addEventListener('change', () => {
      const selected = fontSelect.value;
      applyFontClass(selected);
      localStorage.setItem('font', selected);
      playClickSound();
    });
  }

  // Animation speed control: adjust the global animation multiplier
  if (animationRange) {
    const savedSpeed = localStorage.getItem('animSpeed');
    if (savedSpeed) {
      animationRange.value = savedSpeed;
      document.documentElement.style.setProperty('--anim-speed', savedSpeed);
    }
    animationRange.addEventListener('input', () => {
      const val = animationRange.value;
      document.documentElement.style.setProperty('--anim-speed', val);
      localStorage.setItem('animSpeed', val);
    });
  }
});