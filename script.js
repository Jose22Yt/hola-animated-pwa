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
    });
  });
});
