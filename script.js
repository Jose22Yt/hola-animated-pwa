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
