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

  /*
   * Música: búsqueda y reproducción
   *
   * Esta sección implementa un buscador de canciones que consulta dos
   * APIs sin autenticación: Audius y Piped (front‑end de YouTube). Las
   * canciones encontradas se muestran en una lista. Al hacer clic en
   * una canción, se reproduce su audio de 30‑90 segundos en un
   * reproductor personalizable integrado en la misma pantalla.
   */
  const musicQuery = document.getElementById('music-query');
  const musicBtn = document.getElementById('music-search-btn');
  const musicResults = document.getElementById('music-results');
  /*
   * Reproductor avanzado
   *
   * La interfaz consta de un mini‑player flotante y un reproductor a
   * pantalla completa. Los dos comparten el mismo audio y estado,
   * por lo que aquí se referencian sus elementos y se gestiona la
   * interacción para expandir/minimizar, reproducir/pausar, avanzar,
   * retroceder, aleatorio y repetición. Además se actualizan las
   * barras de progreso y los tiempos.
   */

  // Mini player elements
  const miniPlayer = document.getElementById('miniPlayer');
  const miniExpandBtn = document.getElementById('miniExpand');
  const miniCloseBtn = document.getElementById('miniClose');
  const miniProgressBar = document.getElementById('miniProgressBar');
  const miniTitle = document.getElementById('miniTitle');
  const miniArtist = document.getElementById('miniArtist');
  const btnShuffle = document.getElementById('btnShuffle');
  const btnPrev = document.getElementById('btnPrev');
  const btnPlay = document.getElementById('btnPlay');
  const btnNext = document.getElementById('btnNext');
  const btnRepeat = document.getElementById('btnRepeat');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');

  // Full player elements
  const fullPlayer = document.getElementById('fullPlayer');
  const fullMinimizeBtn = document.getElementById('fullMinimize');
  const fullCloseBtn = document.getElementById('fullClose');
  const fullProgressBar = document.getElementById('fullProgressBar');
  const fullCurrent = document.getElementById('fullCurrent');
  const fullTotal = document.getElementById('fullTotal');
  const fullTrack = document.getElementById('fullTrack');
  const fullArtist = document.getElementById('fullArtist');
  const fullCover = document.getElementById('fullCover');
  const fShuffle = document.getElementById('fShuffle');
  const fPrev = document.getElementById('fPrev');
  const fPlay = document.getElementById('fPlay');
  const fNext = document.getElementById('fNext');
  const fRepeat = document.getElementById('fRepeat');
  const fPlayIcon = document.getElementById('fPlayIcon');
  const fPauseIcon = document.getElementById('fPauseIcon');

  // Player state
  let isShuffle = false;
  let isRepeat = false;

  // Audio element for playback
  const audio = new Audio();
  let currentTrack = null;
  let currentPlaylist = [];
  let currentTrackIndex = -1;

  // Helper: format seconds to mm:ss
  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  }

  // Show mini player and hide full player
  function showMini() {
    miniPlayer.classList.remove('hidden');
    fullPlayer.classList.add('hidden');
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.classList.remove('hidden');
  }

  // Show full player and hide mini player
  function showFull() {
    fullPlayer.classList.remove('hidden');
    miniPlayer.classList.add('hidden');
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.classList.add('hidden');
  }

  // Toggle play/pause state and update icons
  function togglePlay() {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  // Update play/pause icons on both players
  function updatePlayIcons() {
    if (audio.paused) {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      fPlayIcon.classList.remove('hidden');
      fPauseIcon.classList.add('hidden');
    } else {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      fPlayIcon.classList.add('hidden');
      fPauseIcon.classList.remove('hidden');
    }
  }

  // Update progress bars and time labels based on current time
  function updateProgress() {
    if (!audio.duration) return;
    const percentage = (audio.currentTime / audio.duration) * 100;
    miniProgressBar.style.width = `${percentage}%`;
    fullProgressBar.style.width = `${percentage}%`;
    fullCurrent.textContent = formatTime(audio.currentTime);
    fullTotal.textContent = formatTime(audio.duration);
  }

  // Play a specific track
  async function playTrack(track) {
    currentTrack = track;
    // Determine index in playlist
    if (currentTrackIndex < 0) {
      currentTrackIndex = currentPlaylist.findIndex((t) => t === track);
    }
    // Stop current audio
    audio.pause();
    audio.src = '';
    // If YouTube track: fetch audio stream from Piped API
    if (track.source === 'youtube') {
      try {
        const res = await fetch(`https://pipedapi.kavin.rocks/api/v1/streams/${encodeURIComponent(track.videoId)}`);
        const data = await res.json();
        const audioStream = (data?.audioStreams || [])[0];
        if (audioStream && audioStream.url) {
          audio.src = audioStream.url;
        } else {
          console.error('No se encontró stream de audio');
          return;
        }
      } catch (err) {
        console.error('Error al cargar audio de YouTube:', err);
        return;
      }
    } else {
      audio.src = track.stream;
    }
    // Update UI titles and cover
    miniTitle.textContent = track.title || 'Sin título';
    miniArtist.textContent = track.artist || '';
    fullTrack.textContent = track.title || 'Sin título';
    fullArtist.textContent = track.artist || '';
    if (track.cover) {
      fullCover.src = track.cover;
    } else {
      fullCover.src = 'icons/icon-512.png';
    }
    // Play the track
    await audio.play().catch((e) => console.error('Reproducción fallida:', e));
    // Show mini player
    showMini();
    updatePlayIcons();
  }

  // Play next track
  function playNext() {
    if (!currentPlaylist.length) return;
    if (isShuffle) {
      currentTrackIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
    }
    playTrack(currentPlaylist[currentTrackIndex]);
  }

  // Play previous track
  function playPrev() {
    if (!currentPlaylist.length) return;
    if (isShuffle) {
      currentTrackIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    }
    playTrack(currentPlaylist[currentTrackIndex]);
  }

  // Toggle shuffle state
  function toggleShuffle() {
    isShuffle = !isShuffle;
    // Toggle active class on both buttons
    btnShuffle.classList.toggle('active', isShuffle);
    fShuffle.classList.toggle('active', isShuffle);
  }

  // Toggle repeat state
  function toggleRepeat() {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active', isRepeat);
    fRepeat.classList.toggle('active', isRepeat);
  }

  // Audio events
  audio.addEventListener('play', updatePlayIcons);
  audio.addEventListener('pause', updatePlayIcons);
  audio.addEventListener('timeupdate', () => {
    updateProgress();
    // Auto next track when finished
    if (audio.currentTime >= audio.duration - 0.3 && audio.duration) {
      if (isRepeat) {
        // Restart same track
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    }
  });

  // Bind controls for mini and full players
  btnPlay.addEventListener('click', () => {
    togglePlay();
    playClickSound();
  });
  fPlay.addEventListener('click', () => {
    togglePlay();
    playClickSound();
  });
  btnPrev.addEventListener('click', () => {
    playPrev();
    playClickSound();
  });
  fPrev.addEventListener('click', () => {
    playPrev();
    playClickSound();
  });
  btnNext.addEventListener('click', () => {
    playNext();
    playClickSound();
  });
  fNext.addEventListener('click', () => {
    playNext();
    playClickSound();
  });
  btnShuffle.addEventListener('click', () => {
    toggleShuffle();
    playClickSound();
  });
  fShuffle.addEventListener('click', () => {
    toggleShuffle();
    playClickSound();
  });
  btnRepeat.addEventListener('click', () => {
    toggleRepeat();
    playClickSound();
  });
  fRepeat.addEventListener('click', () => {
    toggleRepeat();
    playClickSound();
  });

  // Expand/collapse and close actions
  miniExpandBtn.addEventListener('click', () => {
    showFull();
    playClickSound();
  });
  fullMinimizeBtn.addEventListener('click', () => {
    showMini();
    playClickSound();
  });
  // Close completely: stop audio and hide players
  miniCloseBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    miniPlayer.classList.add('hidden');
    fullPlayer.classList.add('hidden');
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.classList.remove('hidden');
    playClickSound();
  });
  fullCloseBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    miniPlayer.classList.add('hidden');
    fullPlayer.classList.add('hidden');
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.classList.remove('hidden');
    playClickSound();
  });

  // Allow seeking by tapping on the progress bars
  // Mini progress bar (wrapper is the parent of the bar)
  const miniProgressWrapper = miniProgressBar ? miniProgressBar.parentElement : null;
  if (miniProgressWrapper) {
    miniProgressWrapper.addEventListener('click', (e) => {
      const rect = miniProgressWrapper.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = ratio * audio.duration;
      }
    });
  }
  // Full progress bar wrapper
  const fullBarWrapper = fullPlayer.querySelector('.bar');
  if (fullBarWrapper) {
    fullBarWrapper.addEventListener('click', (e) => {
      const rect = fullBarWrapper.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = ratio * audio.duration;
      }
    });
  }
  // Radio buttons to filter music source
  const sourceRadios = document.querySelectorAll('input[name="music-source"]');

  // Search button handler
  if (musicBtn && musicQuery) {
    musicBtn.addEventListener('click', () => {
      const query = musicQuery.value.trim();
      if (query) searchMusic(query);
    });
    musicQuery.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = musicQuery.value.trim();
        if (query) searchMusic(query);
      }
    });
  }

  // Perform a search across Audius and Piped
  async function searchMusic(query) {
    // Clear previous results and show a loading message
    if (musicResults) {
      musicResults.innerHTML = '<p>Buscando…</p>';
    }
    let tracks = [];
    // Determine selected source filter
    let filter = 'all';
    sourceRadios.forEach((radio) => {
      if (radio.checked) filter = radio.value;
    });
    // Fetch from Audius if allowed
    if (filter === 'all' || filter === 'audius') {
      try {
        const resAudius = await fetch(
          `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(
            query
          )}&app_name=holaPWA`
        );
        const dataAudius = await resAudius.json();
        const audiusTracks = (dataAudius.data || [])
          .slice(0, 6)
          .map((t) => {
            return {
              source: 'audius',
              title: t.title || '',
              artist: (t.user && (t.user.name || t.user.handle)) || '',
              cover:
                (t.artwork &&
                  (t.artwork['150x150'] || t.artwork['480x480'])) ||
                '',
              stream: t.stream && t.stream.url ? t.stream.url : '',
            };
          })
          .filter((t) => t.stream);
        tracks = tracks.concat(audiusTracks);
      } catch (err) {
        console.error('Audius API error:', err);
      }
    }
    // Fetch from Piped (YouTube proxy) if allowed
    if (filter === 'all' || filter === 'youtube') {
      try {
        const resYoutube = await fetch(
          `https://pipedapi.kavin.rocks/api/v1/search?q=${encodeURIComponent(
            query
          )}&region=US`
        );
        const dataYoutube = await resYoutube.json();
        const items = dataYoutube.items || dataYoutube;
        const youtubeTracks = Array.isArray(items)
          ? items.slice(0, 6).map((item) => {
              const videoId = item.id || item.url?.split('v=')[1] || item.url || '';
              return {
                source: 'youtube',
                title: item.title || '',
                artist: item.uploader || '',
                cover: item.thumbnail || '',
                videoId: videoId,
              };
            })
          : [];
        tracks = tracks.concat(youtubeTracks);
      } catch (err) {
        console.error('Piped API error:', err);
      }
    }
    // Save playlist for navigation
    currentPlaylist = tracks;
    // Render results
    if (musicResults) {
      musicResults.innerHTML = '';
      if (!tracks.length) {
        musicResults.innerHTML = '<p>No se encontraron resultados.</p>';
      } else {
        tracks.forEach((track, index) => {
          const item = document.createElement('div');
          item.className = 'music-item';
          item.dataset.index = index;
          const img = document.createElement('img');
          img.src = track.cover || 'icons/icon-192.png';
          const info = document.createElement('div');
          info.className = 'music-info';
          const titleDiv = document.createElement('div');
          titleDiv.className = 'music-title';
          titleDiv.textContent = track.title;
          const artistDiv = document.createElement('div');
          artistDiv.className = 'music-artist';
          artistDiv.textContent = track.artist || track.source.toUpperCase();
          info.appendChild(titleDiv);
          info.appendChild(artistDiv);
          item.appendChild(img);
          item.appendChild(info);
          item.addEventListener('click', () => {
            currentTrackIndex = parseInt(item.dataset.index, 10);
            playTrack(track);
            playClickSound();
          });
          musicResults.appendChild(item);
        });
      }
    }
  }

  /* La función playTrack antigua se ha eliminado en favor de la nueva
     implementación de reproductor avanzado definida al principio de esta
     sección. */

  // El control de reproducción, progreso y búsqueda se gestiona
  // mediante los manejadores definidos en la sección del reproductor
  // avanzado.  Esta implementación antigua se ha eliminado.
  // La lógica de final de pista, navegación, volumen y toggles se gestiona
  // mediante las funciones definidas en la nueva sección del reproductor.
});