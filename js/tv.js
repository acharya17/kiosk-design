(function() {
  let activeBannersList = [];
  let currentSlideIndex = 0;
  let playbackTimeout = null;
  let tvId = 'tv-entrance';

  // DOM Elements
  const tvSetupOverlay = document.getElementById('tv-setup-overlay');
  const tvSelectDropdown = document.getElementById('setup-tv-select');
  const btnStartDisplay = document.getElementById('btn-start-display');
  const btnSetupLogout = document.getElementById('btn-setup-logout');
  
  const carouselWrapper = document.getElementById('carousel-wrapper');
  const fallbackPane = document.getElementById('fallback-pane');
  const offlineOverlay = document.getElementById('tv-offline-overlay');
  const fsBtn = document.getElementById('btn-toggle-fs');
  const btnExitLoop = document.getElementById('btn-exit-loop');
  const tvCanvas = document.getElementById('tv-canvas');

  // --- 1. TV DISPLAY SETUP FLOW ---

  function initSetupScreen() {
    const tvs = KioskStore.getTVs() || [];
    tvSelectDropdown.innerHTML = '';
    
    tvs.forEach(tv => {
      const option = document.createElement('option');
      option.value = tv.id;
      option.textContent = `${tv.name} (${tv.location || 'Default Location'})`;
      tvSelectDropdown.appendChild(option);
    });

    if (tvs.length === 0) {
      const option = document.createElement('option');
      option.value = 'tv-entrance';
      option.textContent = 'Entrance Display TV (tv-entrance)';
      tvSelectDropdown.appendChild(option);
    }
  }

  btnStartDisplay.addEventListener('click', () => {
    tvId = tvSelectDropdown.value;
    tvSetupOverlay.style.display = 'none';
    tvCanvas.style.display = 'block';
    
    loadPlaylist();
    updateStatusAlerts();
  });

  btnExitLoop.addEventListener('click', () => {
    clearTimeout(playbackTimeout);
    tvCanvas.style.display = 'none';
    tvSetupOverlay.style.display = 'flex';
  });

  btnSetupLogout.addEventListener('click', () => {
    sessionStorage.removeItem('kiosk_auth');
    window.location.href = 'index.html';
  });

  // --- 2. PLAYLIST CONFIG & LOOPER ---

  function loadPlaylist() {
    const tvs = KioskStore.getTVs() || [];
    const playlists = KioskStore.getPlaylists() || [];
    const allBanners = KioskStore.getBanners() || [];

    // Find self config
    let selfTV = tvs.find(t => t.id === tvId);
    if (!selfTV && tvs.length > 0) {
      selfTV = tvs[0];
      tvId = selfTV.id;
    }

    if (selfTV) {
      document.getElementById('hud-tv-name').textContent = selfTV.name;
      document.getElementById('hud-tv-id').textContent = `ID: ${selfTV.id}`;

      const playlist = playlists.find(p => p.id === selfTV.assignedPlaylistId);
      if (playlist) {
        const now = new Date();
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

    activeBannersList.sort((a, b) => a.priority - b.priority);
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
    
    if (window.lucide) lucide.createIcons();
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

  // --- 3. CONNECTIVITY & FULLSCREEN ---

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
          fsBtn.innerHTML = '<i data-lucide="minimize" style="width: 16px; height: 16px;"></i> Exit Widescreen';
          if (window.lucide) lucide.createIcons();
        })
        .catch(err => {
          console.error('Fullscreen toggle failure:', err);
        });
    } else {
      document.exitFullscreen();
      fsBtn.innerHTML = '<i data-lucide="maximize" style="width: 16px; height: 16px;"></i> Fullscreen';
      if (window.lucide) lucide.createIcons();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fsBtn.innerHTML = '<i data-lucide="maximize" style="width: 16px; height: 16px;"></i> Fullscreen';
      if (window.lucide) lucide.createIcons();
    }
  });

  // Init TV Setup selector dropdown on load
  initSetupScreen();
  updateStatusAlerts();

  // Storage Sync
  KioskStore.subscribe((key, val) => {
    if (tvCanvas.style.display !== 'none') {
      if (key === KioskStore.KEYS.BANNERS || key === KioskStore.KEYS.PLAYLISTS || key === KioskStore.KEYS.TVS || key === 'reset') {
        loadPlaylist();
      }
      if (key === KioskStore.KEYS.CONFIG || key === 'reset') {
        if (activeBannersList.length === 0) {
          showFallbackBillboard();
        }
      }
    }
    if (key === KioskStore.KEYS.SIMULATED_FAILURES || key === 'reset') {
      updateStatusAlerts();
    }
  });
})();
