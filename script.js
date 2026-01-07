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
  const musicPlayer = document.getElementById('music-player');
  const coverEl = document.getElementById('player-cover');
  const titleEl = document.getElementById('player-title');
  const artistEl = document.getElementById('player-artist');
  const progressBar = document.getElementById('player-progress-bar');
  const progressContainer = document.getElementById('player-progress');
  const miniProgressBar = document.getElementById('mini-progress-bar');
  const playerCurrentTimeEl = document.getElementById('player-current-time');
  const playerDurationEl = document.getElementById('player-duration');
  const playBtn = document.getElementById('player-play');
  const prevBtn = document.getElementById('player-prev');
  const nextBtn = document.getElementById('player-next');
  const volumeRange = document.getElementById('player-volume');
  const playerToggleBtn = document.getElementById('player-toggle');
  const playerCloseBtn = document.getElementById('player-close');
  let isPlayerExpanded = false;
  // Shuffle and repeat state flags
  const shuffleBtn = document.getElementById('player-shuffle');
  const repeatBtn = document.getElementById('player-repeat');
  let isShuffle = false;
  let isRepeat = false;
  // Radio buttons to filter music source
  const sourceRadios = document.querySelectorAll('input[name="music-source"]');
  // Create a single Audio element for playback
  const audio = new Audio();
  let currentTrack = null;
  let currentPlaylist = [];
  let currentTrackIndex = -1;

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

  // Play a selected track
  async function playTrack(track) {
    currentTrack = track;
    // If currentTrackIndex is still -1, set it based on playlist
    if (currentTrackIndex < 0 && Array.isArray(currentPlaylist)) {
      currentTrackIndex = currentPlaylist.findIndex((t) => t === track);
    }
    if (musicPlayer) {
      musicPlayer.style.display = 'flex';
    }
    if (coverEl) {
      coverEl.src = track.cover || 'icons/icon-192.png';
    }
    if (titleEl) {
      titleEl.textContent = track.title;
    }
    if (artistEl) {
      artistEl.textContent = track.artist || '';
    }
    // Determine source and set audio
    if (track.source === 'audius') {
      audio.src = track.stream;
      audio.play().catch(() => {});
    } else if (track.source === 'youtube') {
      try {
        const res = await fetch(
          `https://pipedapi.kavin.rocks/api/v1/streams/${track.videoId}`
        );
        const info = await res.json();
        const audioStream = (info.audioStreams || []).find(
          (s) => !s.videoOnly
        );
        if (audioStream && audioStream.url) {
          audio.src = audioStream.url;
          audio.play().catch(() => {});
        }
      } catch (err) {
        console.error('Stream fetch error:', err);
      }
    }
    // Update play button icon
    if (playBtn) {
      playBtn.textContent = '⏸';
    }
  }

  // Play/pause toggle
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        playBtn.textContent = '⏸';
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });
  }

  // Helper to format seconds into mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  // Update progress bars and time labels
  if (audio) {
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        if (progressBar) {
          progressBar.style.width = isNaN(progress) ? '0%' : progress + '%';
        }
        if (miniProgressBar) {
          miniProgressBar.style.width = isNaN(progress) ? '0%' : progress + '%';
        }
      }
      if (playerCurrentTimeEl) {
        playerCurrentTimeEl.textContent = formatTime(audio.currentTime);
      }
      if (playerDurationEl) {
        playerDurationEl.textContent = formatTime(audio.duration);
      }
    });
    // Ensure duration label updates once metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
      if (playerDurationEl) {
        playerDurationEl.textContent = formatTime(audio.duration);
      }
    });
  }
  // Seek when clicking the progress bar
  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = percent * audio.duration;
      }
    });
  }

  // Seek when clicking the mini progress bar
  const miniProgress = document.getElementById('mini-progress');
  if (miniProgress) {
    miniProgress.addEventListener('click', (e) => {
      const rect = miniProgress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = percent * audio.duration;
      }
    });
  }
  // Handle end of track: repeat or play next
  audio.addEventListener('ended', () => {
    if (isRepeat) {
      // Restart current track
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      // Advance to next track if available
      if (currentPlaylist && currentPlaylist.length > 0) {
        playNext();
      }
    }
    if (playBtn) {
      playBtn.textContent = '⏸';
    }
  });

  // Navigate to the next track in the playlist
  function playNext() {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    if (isShuffle) {
      // pick a random track different from current
      let nextIndex = currentTrackIndex;
      if (currentPlaylist.length > 1) {
        while (nextIndex === currentTrackIndex) {
          nextIndex = Math.floor(Math.random() * currentPlaylist.length);
        }
      }
      currentTrackIndex = nextIndex;
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
    }
    const nextTrack = currentPlaylist[currentTrackIndex];
    if (nextTrack) {
      playTrack(nextTrack);
    }
  }
  // Navigate to the previous track in the playlist
  function playPrev() {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    const prevTrack = currentPlaylist[currentTrackIndex];
    if (prevTrack) {
      playTrack(prevTrack);
    }
  }
  // Attach event listeners to navigation buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playNext();
      playClickSound();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      playPrev();
      playClickSound();
    });
  }
  // Volume control
  if (volumeRange) {
    // Load saved volume or default to 1
    const savedVol = localStorage.getItem('musicVolume');
    if (savedVol !== null) {
      volumeRange.value = savedVol;
      audio.volume = parseFloat(savedVol);
    }
    volumeRange.addEventListener('input', () => {
      const vol = parseFloat(volumeRange.value);
      audio.volume = vol;
      localStorage.setItem('musicVolume', vol);
    });
  }

  // Toggle shuffle and repeat
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      isShuffle = !isShuffle;
      if (isShuffle) {
        shuffleBtn.classList.add('active');
      } else {
        shuffleBtn.classList.remove('active');
      }
    });
  }
  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      isRepeat = !isRepeat;
      if (isRepeat) {
        repeatBtn.classList.add('active');
      } else {
        repeatBtn.classList.remove('active');
      }
    });
  }

  // Toggle expand/collapse of the music player
  if (playerToggleBtn && musicPlayer) {
    playerToggleBtn.addEventListener('click', () => {
      isPlayerExpanded = !isPlayerExpanded;
      const bottomNav = document.querySelector('.bottom-nav');
      if (isPlayerExpanded) {
        musicPlayer.classList.add('expanded');
        playerToggleBtn.textContent = '▼';
        playerToggleBtn.title = 'Minimizar';
        // Hide the bottom navigation bar when expanded
        if (bottomNav) bottomNav.style.display = 'none';
      } else {
        musicPlayer.classList.remove('expanded');
        playerToggleBtn.textContent = '▲';
        playerToggleBtn.title = 'Expandir';
        // Show the bottom navigation bar again
        if (bottomNav) bottomNav.style.display = 'flex';
      }
    });
  }

  // Close the music player and stop playback
  if (playerCloseBtn && musicPlayer) {
    playerCloseBtn.addEventListener('click', () => {
      audio.pause();
      audio.currentTime = 0;
      musicPlayer.style.display = 'none';
      musicPlayer.classList.remove('expanded');
      isPlayerExpanded = false;
      // Reset toggle button
      if (playerToggleBtn) {
        playerToggleBtn.textContent = '▲';
        playerToggleBtn.title = 'Expandir';
      }
      // Show the bottom navigation bar again when closed
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav) bottomNav.style.display = 'flex';
    });
  }
});