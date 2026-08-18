(function() {
  let activeBannersList = [];
  let currentSlideIndex = 0;
  let playbackTimeout = null;

  // Retrieve TV identity from URL parameter (e.g. tv.html?id=tv-entrance) or default
  const urlParams = new URLSearchParams(window.location.search);
  let tvId = urlParams.get('id') || 'tv-entrance';

  // DOM Elements
  const carouselWrapper = document.getElementById('carousel-wrapper');
  const fallbackPane = document.getElementById('fallback-pane');
  const offlineOverlay = document.getElementById('tv-offline-overlay');
  const fsBtn = document.getElementById('btn-toggle-fs');
  const tvCanvas = document.getElementById('tv-canvas');

  // --- PLAYLIST CONFIG & LOOPER ---

  function loadPlaylist() {
    const tvs = KioskStore.getTVs() || [];
    const playlists = KioskStore.getPlaylists() || [];
    const allBanners = KioskStore.getBanners() || [];

    // Find self config
    let selfTV = tvs.find(t => t.id === tvId);
    if (!selfTV && tvs.length > 0) {
      // Fallback to first registered TV
      selfTV = tvs[0];
      tvId = selfTV.id;
    }

    if (selfTV) {
      document.getElementById('hud-tv-name').textContent = selfTV.name;
      document.getElementById('hud-tv-id').textContent = `ID: ${selfTV.id}`;

      // Load mapped playlist
      const playlist = playlists.find(p => p.id === selfTV.assignedPlaylistId);
      if (playlist) {
        const now = new Date();
        // Extract banners linked in this playlist
        activeBannersList = allBanners.filter(b => {
          if (!b.active) return false;
          if (!playlist.bannerIds.includes(b.id)) return false;

          const start = new Date(b.startDate);
          const end = new Date(b.endDate);
          return now >= start && now <= end;
        });
      } else {
        activeBannersList = [];
      }
    } else {
      activeBannersList = [];
    }

    // Sort by priority ascending
    activeBannersList.sort((a, b) => a.priority - b.priority);

    // Stop current playback
    clearTimeout(playbackTimeout);

    if (activeBannersList.length === 0) {
      showFallbackBillboard();
    } else {
      buildSlidesHTML();
      currentSlideIndex = 0;
      startLoop();
    }
  }

  function showFallbackBillboard() {
    carouselWrapper.style.display = 'none';
    fallbackPane.classList.add('active');

    const config = KioskStore.getConfig();
    if (config && config.fallbackContent) {
      document.getElementById('fallback-img').src = config.fallbackContent.image;
      document.getElementById('fallback-hero-title').textContent = config.fallbackContent.title;
      document.getElementById('fallback-hero-desc').textContent = config.fallbackContent.description;
    }
  }

  function buildSlidesHTML() {
    fallbackPane.classList.remove('active');
    carouselWrapper.style.display = 'block';
    carouselWrapper.innerHTML = '';

    activeBannersList.forEach((b, idx) => {
      const slide = document.createElement('div');
      slide.className = `banner-slide ${idx === 0 ? 'active' : ''}`;
      slide.id = `slide-${idx}`;

      const img = document.createElement('img');
      img.src = b.image;
      img.className = 'banner-img';
      img.alt = b.title;

      // Handle image failure
      img.onerror = () => {
        console.warn(`Signage image load error: "${b.title}". Skipping slide.`);
        handleSlideLoadError(idx);
      };

      slide.appendChild(img);
      carouselWrapper.appendChild(slide);
    });
  }

  function startLoop() {
    if (activeBannersList.length === 0) return;

    const slideDom = document.getElementById(`slide-${currentSlideIndex}`);
    if (!slideDom) return;

    document.querySelectorAll('.banner-slide').forEach(s => s.classList.remove('active'));
    slideDom.classList.add('active');

    const bannerObj = activeBannersList[currentSlideIndex];
    const durationMs = (bannerObj.duration || 5) * 1000;

    const failures = KioskStore.getFailures();
    if (failures.bannerLoadFail) {
      if (currentSlideIndex % 2 === 0) {
        setTimeout(() => {
          handleSlideLoadError(currentSlideIndex);
        }, 800);
        return;
      }
    }

    playbackTimeout = setTimeout(() => {
      nextSlide();
    }, durationMs);
  }

  function nextSlide() {
    if (activeBannersList.length === 0) return;
    currentSlideIndex = (currentSlideIndex + 1) % activeBannersList.length;
    startLoop();
  }

  function handleSlideLoadError(index) {
    if (index === currentSlideIndex) {
      clearTimeout(playbackTimeout);
      nextSlide();
    }
  }

  // --- CONNECTIVITY & FULLSCREEN ---

  function updateStatusAlerts() {
    const failures = KioskStore.getFailures();
    if (failures.networkOffline || failures.backendCrash) {
      offlineOverlay.classList.add('active');
    } else {
      offlineOverlay.classList.remove('active');
    }
  }

  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      tvCanvas.requestFullscreen()
        .then(() => {
          fsBtn.textContent = 'Exit Widescreen';
        })
        .catch(err => {
          console.error('Fullscreen toggle failure:', err);
        });
    } else {
      document.exitFullscreen();
      fsBtn.textContent = '🖥️ Fullscreen';
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fsBtn.textContent = '🖥️ Fullscreen';
    }
  });

  // Init loads
  loadPlaylist();
  updateStatusAlerts();

  // Storage Sync
  KioskStore.subscribe((key, val) => {
    if (key === KioskStore.KEYS.BANNERS || key === KioskStore.KEYS.PLAYLISTS || key === KioskStore.KEYS.TVS || key === 'reset') {
      loadPlaylist();
    }
    if (key === KioskStore.KEYS.SIMULATED_FAILURES || key === 'reset') {
      updateStatusAlerts();
    }
    if (key === KioskStore.KEYS.CONFIG || key === 'reset') {
      if (activeBannersList.length === 0) {
        showFallbackBillboard();
      }
    }
  });
})();
