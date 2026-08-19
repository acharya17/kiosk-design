(function() {
  // --- STATE VARIABLES ---
  let cart = [];
  let orderType = 'dinein'; // 'dinein' or 'takeaway'
  let currentCategoryId = null;
  let inactivityTimer = null;
  let inactivityCountdownTimer = null;
  let activeKioskId = 'kiosk-01';

  // Modal customizer state
  let currentProduct = null;
  let customizerQty = 1;
  let activePaymentMethod = null;
  let pendingOrderId = null;

  // DOM Screens
  const screens = {
    welcome: document.getElementById('screen-welcome'),
    orderType: document.getElementById('screen-order-type'),
    browse: document.getElementById('screen-browse'),
    cart: document.getElementById('screen-cart'),
    payment: document.getElementById('screen-payment'),
    confirmation: document.getElementById('screen-confirmation')
  };

  // --- NAVIGATION ---
  function showScreen(screenId) {
    Object.keys(screens).forEach(key => {
      screens[key].classList.remove('active');
    });
    screens[screenId].classList.add('active');

    if (screenId === 'welcome') {
      resetSession();
      stopInactivityTimer();
    } else if (screenId === 'confirmation') {
      stopInactivityTimer();
      let timeLeft = 15;
      const finishBtn = document.getElementById('btn-finish-order');
      finishBtn.textContent = `Done (${timeLeft}s)`;
      const autoReturnInterval = setInterval(() => {
        timeLeft--;
        if (screens.confirmation.classList.contains('active') && timeLeft > 0) {
          finishBtn.textContent = `Done (${timeLeft}s)`;
        } else {
          clearInterval(autoReturnInterval);
          if (screens.confirmation.classList.contains('active')) {
            showScreen('welcome');
          }
        }
      }, 1000);
    } else {
      startInactivityTimer();
    }
  }

  // --- SESSION RESET ---
  function resetSession() {
    cart = [];
    currentProduct = null;
    customizerQty = 1;
    activePaymentMethod = null;
    pendingOrderId = null;
    
    // Clear search
    document.getElementById('product-search').value = '';
    
    updateCartSummary();
  }

  // --- INACTIVITY HANDLERS ---
  function startInactivityTimer() {
    stopInactivityTimer();
    const config = KioskStore.getConfig() || { inactivityTimeout: 60 };
    const timeoutMs = (config.inactivityTimeout || 60) * 1000;

    inactivityTimer = setTimeout(() => {
      triggerInactivityWarning();
    }, timeoutMs);
  }

  function stopInactivityTimer() {
    clearTimeout(inactivityTimer);
    clearInterval(inactivityCountdownTimer);
    document.getElementById('inactivity-modal').style.display = 'none';
  }

  function resetInactivityOnInteraction() {
    if (screens.browse.classList.contains('active') || 
        screens.cart.classList.contains('active') || 
        screens.payment.classList.contains('active')) {
      startInactivityTimer();
    }
  }

  ['mousedown', 'mousemove', 'touchstart', 'scroll', 'click'].forEach(event => {
    window.addEventListener(event, resetInactivityOnInteraction);
  });

  function triggerInactivityWarning() {
    stopInactivityTimer();
    const modal = document.getElementById('inactivity-modal');
    modal.style.display = 'flex';

    let countdown = 30;
    const countdownEl = document.getElementById('inactivity-countdown-number');
    countdownEl.textContent = countdown;

    inactivityCountdownTimer = setInterval(() => {
      countdown--;
      countdownEl.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(inactivityCountdownTimer);
        modal.style.display = 'none';
        showScreen('welcome');
      }
    }, 1000);
  }

  document.getElementById('btn-inactivity-continue').addEventListener('click', () => {
    stopInactivityTimer();
    startInactivityTimer();
  });

  document.getElementById('btn-inactivity-exit').addEventListener('click', () => {
    stopInactivityTimer();
    showScreen('welcome');
  });

  // --- WELCOME & ORDER TYPE EVENT LISTENERS ---
  document.getElementById('btn-start-order').addEventListener('click', () => {
    // If order type is configured to be skipped, we could skip it here.
    // For now, proceed to order type screen per prompt flow
    showScreen('orderType');
  });

  document.getElementById('btn-type-dinein').addEventListener('click', () => {
    orderType = 'dinein';
    document.getElementById('browse-type-badge').textContent = 'Dine In';
    showScreen('browse');
    renderProductsGrid();
  });

  document.getElementById('btn-type-takeaway').addEventListener('click', () => {
    orderType = 'takeaway';
    document.getElementById('browse-type-badge').textContent = 'Takeaway';
    showScreen('browse');
    renderProductsGrid();
  });

  document.querySelectorAll('.btn-to-welcome').forEach(btn => {
    btn.addEventListener('click', () => showScreen('welcome'));
  });

  // --- MENU BROWSE LOGIC ---
  function renderMenuCategories() {
    const categories = KioskStore.getCategories() || [];
    const container = document.getElementById('kiosk-category-list');
    container.innerHTML = '';

    // Add 'All' Category Chip
    const allChip = document.createElement('div');
    allChip.className = `category-item ${!currentCategoryId ? 'active' : ''}`;
    allChip.style.cssText = `padding: 0.4rem 1rem; border-radius: var(--radius-full); border: 1px solid var(--border-admin); font-size: 0.85rem; font-weight: ${!currentCategoryId ? '700' : '500'}; background: ${!currentCategoryId ? 'var(--primary)' : '#ffffff'}; color: ${!currentCategoryId ? '#ffffff' : 'var(--text-admin-muted)'}; cursor: pointer; white-space: nowrap; transition: all 0.2s;`;
    allChip.innerHTML = `<span>All</span>`;
    allChip.addEventListener('click', () => {
      document.querySelectorAll('#kiosk-category-list .category-item').forEach(el => {
        el.style.background = '#ffffff';
        el.style.color = 'var(--text-admin-muted)';
        el.style.fontWeight = '500';
      });
      allChip.style.background = 'var(--primary)';
      allChip.style.color = '#ffffff';
      allChip.style.fontWeight = '700';
      currentCategoryId = null;
      document.getElementById('current-category-title').textContent = 'Our Menu';
      renderProductsGrid();
    });
    container.appendChild(allChip);

    categories.forEach((cat) => {
      const item = document.createElement('div');
      const isSelected = currentCategoryId === cat.id;
      item.className = `category-item ${isSelected ? 'active' : ''}`;
      item.setAttribute('data-id', cat.id);
      item.style.cssText = `padding: 0.4rem 1rem; border-radius: var(--radius-full); border: 1px solid var(--border-admin); font-size: 0.85rem; font-weight: ${isSelected ? '700' : '500'}; background: ${isSelected ? 'var(--primary)' : '#ffffff'}; color: ${isSelected ? '#ffffff' : 'var(--text-admin-muted)'}; cursor: pointer; white-space: nowrap; transition: all 0.2s;`;
      
      item.innerHTML = `<span>${cat.name}</span>`;
      
      item.addEventListener('click', () => {
        document.querySelectorAll('#kiosk-category-list .category-item').forEach(el => {
          el.style.background = '#ffffff';
          el.style.color = 'var(--text-admin-muted)';
          el.style.fontWeight = '500';
        });
        item.style.background = 'var(--primary)';
        item.style.color = '#ffffff';
        item.style.fontWeight = '700';
        currentCategoryId = cat.id;
        document.getElementById('current-category-title').textContent = cat.name;
        renderProductsGrid();
      });
      container.appendChild(item);
    });

    const activeCat = categories.find(c => c.id === currentCategoryId);
    if (activeCat) {
      document.getElementById('current-category-title').textContent = activeCat.name;
    } else if (!currentCategoryId) {
      document.getElementById('current-category-title').textContent = 'Our Menu';
    }
  }

  // --- KIOSK SORT AND FILTER STATE ---
  let activeFilters = {
    categories: [],
    prices: [],
    ratings: [],
    availabilityOnly: false
  };
  let activeSort = 'popular'; // 'popular' | 'price-low' | 'price-high' | 'rating' | 'name'

  // Open modals
  document.getElementById('btn-kiosk-filter').addEventListener('click', () => {
    populateFilterCategoryCheckboxes();
    document.getElementById('kiosk-filter-modal').style.display = 'flex';
  });

  document.getElementById('btn-kiosk-sort').addEventListener('click', () => {
    document.getElementById('kiosk-sort-modal').style.display = 'flex';
  });

  // Close modals
  document.getElementById('btn-close-kiosk-filter').addEventListener('click', () => {
    document.getElementById('kiosk-filter-modal').style.display = 'none';
  });
  document.getElementById('btn-cancel-kiosk-filter').addEventListener('click', () => {
    document.getElementById('kiosk-filter-modal').style.display = 'none';
  });
  document.getElementById('btn-close-kiosk-sort').addEventListener('click', () => {
    document.getElementById('kiosk-sort-modal').style.display = 'none';
  });

  // Clear filters
  document.getElementById('btn-clear-kiosk-filter').addEventListener('click', () => {
    activeFilters.categories = [];
    activeFilters.prices = [];
    activeFilters.ratings = [];
    activeFilters.availabilityOnly = false;
    
    // Reset DOM controls
    document.getElementById('filter-availability-only').checked = false;
    document.querySelectorAll('input[name="filter-price"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="filter-rating"]').forEach(el => el.checked = false);
    
    applyFilters();
    document.getElementById('kiosk-filter-modal').style.display = 'none';
  });

  // Apply filters
  document.getElementById('btn-apply-kiosk-filter').addEventListener('click', () => {
    // Read categories
    activeFilters.categories = [];
    document.querySelectorAll('input[name="filter-category"]:checked').forEach(el => {
      activeFilters.categories.push(el.value);
    });

    // Read prices
    activeFilters.prices = [];
    document.querySelectorAll('input[name="filter-price"]:checked').forEach(el => {
      activeFilters.prices.push(el.value);
    });

    // Read ratings
    activeFilters.ratings = [];
    document.querySelectorAll('input[name="filter-rating"]:checked').forEach(el => {
      activeFilters.ratings.push(parseInt(el.value));
    });

    // Availability
    activeFilters.availabilityOnly = document.getElementById('filter-availability-only').checked;

    applyFilters();
    document.getElementById('kiosk-filter-modal').style.display = 'none';
  });

  // Sort Options binding
  document.querySelectorAll('.sort-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-option-btn').forEach(el => {
        el.classList.remove('active');
        el.style.color = 'var(--text-admin-main)';
        el.style.fontWeight = '500';
        const icon = el.querySelector('i');
        if (icon) icon.remove();
      });
      btn.classList.add('active');
      btn.style.color = 'var(--primary)';
      btn.style.fontWeight = '700';
      btn.innerHTML += ` <i data-lucide="circle-check" style="width: 16px; height: 16px;"></i>`;
      if (window.lucide) lucide.createIcons();

      activeSort = btn.getAttribute('data-sort');
      renderProductsGrid();
      document.getElementById('kiosk-sort-modal').style.display = 'none';
    });
  });

  function populateFilterCategoryCheckboxes() {
    const categories = KioskStore.getCategories() || [];
    const container = document.getElementById('filter-category-options');
    container.innerHTML = '';
    categories.forEach(cat => {
      const isChecked = activeFilters.categories.includes(cat.id);
      container.innerHTML += `
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-admin-main); cursor: pointer;">
          <input type="checkbox" name="filter-category" value="${cat.id}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--primary);"> ${cat.name}
        </label>
      `;
    });
  }

  function applyFilters() {
    renderActiveFilterChips();
    renderProductsGrid();
  }

  function renderActiveFilterChips() {
    const row = document.getElementById('active-filter-chips-row');
    row.innerHTML = '';
    let count = 0;

    // Categories chips
    activeFilters.categories.forEach(catId => {
      const cat = KioskStore.getCategories().find(c => c.id === catId);
      if (cat) {
        createChip(row, 'cat-' + catId, `Cat: ${cat.name}`, () => {
          activeFilters.categories = activeFilters.categories.filter(id => id !== catId);
          applyFilters();
        });
        count++;
      }
    });

    // Prices chips
    activeFilters.prices.forEach(pr => {
      createChip(row, 'pr-' + pr, `Price: ${pr}`, () => {
        activeFilters.prices = activeFilters.prices.filter(p => p !== pr);
        applyFilters();
      });
      count++;
    });

    // Ratings chips
    activeFilters.ratings.forEach(rt => {
      createChip(row, 'rt-' + rt, `Rating: ${rt}★+`, () => {
        activeFilters.ratings = activeFilters.ratings.filter(r => r !== rt);
        applyFilters();
      });
      count++;
    });

    // Availability chip
    if (activeFilters.availabilityOnly) {
      createChip(row, 'avail-only', 'Available Only', () => {
        activeFilters.availabilityOnly = false;
        applyFilters();
      });
      count++;
    }

    if (count > 0) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  }

  function createChip(parent, id, text, onRemove) {
    const chip = document.createElement('div');
    chip.style.cssText = 'display: inline-flex; align-items: center; gap: 0.25rem; background: rgba(79, 70, 229, 0.05); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid rgba(79, 70, 229, 0.15); font-size: 0.75rem; font-weight: 600; cursor: pointer;';
    chip.innerHTML = `${text} <i data-lucide="x" style="width: 12px; height: 12px;"></i>`;
    chip.addEventListener('click', onRemove);
    parent.appendChild(chip);
    if (window.lucide) lucide.createIcons();
  }

  function renderProductsGrid() {
    const products = KioskStore.getProducts() || [];
    const container = document.getElementById('kiosk-products-grid');
    const searchVal = document.getElementById('product-search').value.toLowerCase();
    container.innerHTML = '';

    // Apply Filter constraints
    let filtered = products.filter(p => {
      // 1. Search bar match
      if (searchVal) {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || (p.description && p.description.toLowerCase().includes(searchVal));
        if (!matchesSearch) return false;
      }

      // 2. Horizontal active Category selection (if no multi-select filter categories are active)
      if (activeFilters.categories.length === 0 && currentCategoryId) {
        if (p.categoryId !== currentCategoryId) return false;
      }

      // 3. Multi-select Filter category constraint
      if (activeFilters.categories.length > 0) {
        if (!activeFilters.categories.includes(p.categoryId)) return false;
      }

      // 4. Availability Filter constraint
      if (activeFilters.availabilityOnly && !p.available) return false;

      // 5. Ratings Filter constraint (default 5 stars if empty)
      if (activeFilters.ratings.length > 0) {
        const rating = p.rating || 5;
        const matchesRating = activeFilters.ratings.some(r => rating >= r);
        if (!matchesRating) return false;
      }

      // 6. Prices filter constraint
      if (activeFilters.prices.length > 0) {
        const price = p.price;
        const matchesPrice = activeFilters.prices.some(pr => {
          if (pr === '0-100') return price <= 100;
          if (pr === '100-200') return price > 100 && price <= 200;
          if (pr === '200-300') return price > 200 && price <= 300;
          if (pr === '300-max') return price > 300;
          return false;
        });
        if (!matchesPrice) return false;
      }

      return true;
    });

    // Apply Sorting logic
    if (activeSort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'rating') {
      filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (activeSort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; color: var(--text-admin-muted); text-align: center;">
          <i data-lucide="package" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3 style="font-size: 1.25rem;">No products found.</h3>
          ${searchVal ? '<button class="btn btn-secondary" onclick="document.getElementById(\'product-search-clear\').click()" style="margin-top: 1rem;">Clear Search</button>' : ''}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = `product-card ${!p.available ? 'oos' : ''}`;
      card.style.cssText = `background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s; box-shadow: var(--shadow-sm); position: relative; ${!p.available ? 'opacity: 0.6;' : 'cursor: pointer;'}`;
      
      const imageSrc = p.image || '';
      const imageEl = imageSrc ? `<img src="${imageSrc}" style="width: 100%; height: 120px; object-fit: cover;" alt="${p.name}">` : `<div style="width: 100%; height: 120px; background: #f8fafc; border-bottom: 1px solid var(--border-admin); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-admin-muted);"><i data-lucide="image" style="width: 32px; height: 32px; opacity: 0.5;"></i></div>`;

      // Rating stars markup helper
      const starsCount = p.rating || 5;
      let starsMarkup = '';
      for (let i = 0; i < 5; i++) {
        starsMarkup += `<i data-lucide="star" style="width: 12px; height: 12px; fill: ${i < starsCount ? 'var(--warning)' : 'none'}; color: ${i < starsCount ? 'var(--warning)' : 'var(--text-admin-muted)'}; margin-right: 1px;"></i>`;
      }

      card.innerHTML = `
        ${!p.available ? '<div style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(15, 23, 42, 0.85); color: white; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; z-index: 10;">OOS</div>' : ''}
        ${imageEl}
        <div style="padding: 0.75rem; display: flex; flex-direction: column; flex: 1; gap: 0.25rem;">
          <h4 style="margin: 0; font-size: 0.85rem; font-weight: 700; color: var(--text-admin-main); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</h4>
          <div style="display: flex; align-items: center;">${starsMarkup}</div>
          ${p.description ? `<p style="margin: 0; font-size: 0.75rem; color: var(--text-admin-muted); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.6em;">${p.description}</p>` : '<div style="height: 2.6em;"></div>'}
          <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 0.25rem;">
            <span style="font-size: 0.95rem; font-weight: 700; color: var(--primary);">$${p.price.toFixed(2)}</span>
            ${p.available ? `<button class="btn btn-primary btn-add-fast" data-id="${p.id}" style="padding: 0 0.5rem; font-size: 0.75rem; height: 26px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 0.2rem; font-weight: 700;"><i data-lucide="plus" style="width: 12px; height: 12px;"></i> Add</button>` : `<span style="color: var(--danger); font-size: 0.75rem; font-weight: 700;">Sold Out</span>`}
          </div>
        </div>
      `;

      // Fast Add order button click logic or variant details drawer modal opening logic
      if (p.available) {
        card.querySelector('.btn-add-fast').addEventListener('click', (e) => {
          e.stopPropagation();
          handleProductAddFast(p);
        });
        card.addEventListener('click', () => {
          openCustomizer(p);
        });
      }
      container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  function handleProductAddFast(product) {
    // If customizations exist, we must configure options inside the customizer drawer modal
    const hasVariants = product.variants && product.variants.length > 0;
    const hasAddons = product.addOns && product.addOns.length > 0;

    if (hasVariants || hasAddons) {
      openCustomizer(product);
      return;
    }

    // Direct checkout addition
    const hash = product.id + '|';
    const duplicate = cart.find(item => item.cartItemHash === hash);
    if (duplicate) {
      duplicate.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        cartItemHash: hash,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        customizations: []
      });
    }

    updateCartSummary();
    
    // Success feedback overlay / banner toast
    showCartSuccessFeedback(`${product.name} added to cart`);
  }

  function showCartSuccessFeedback(message) {
    const feedback = document.createElement('div');
    feedback.style.cssText = 'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--success); color: white; padding: 0.5rem 1.25rem; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 700; z-index: 1000; box-shadow: var(--shadow-md); display: flex; align-items: center; gap: 0.35rem;';
    feedback.innerHTML = `<i data-lucide="circle-check" style="width: 16px; height: 16px;"></i> ${message}`;
    document.body.appendChild(feedback);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      feedback.style.transition = 'opacity 0.5s';
      feedback.style.opacity = '0';
      setTimeout(() => feedback.remove(), 500);
    }, 1500);
  }

  // --- SEARCH ---
  const searchInput = document.getElementById('product-search');
  const searchClear = document.getElementById('product-search-clear');
  
  searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 0) {
      searchClear.style.display = 'block';
    } else {
      searchClear.style.display = 'none';
    }
    renderProductsGrid();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    renderProductsGrid();
  });

  // --- PRODUCT CUSTOMIZER ---
  function openCustomizer(product) {
    currentProduct = product;
    customizerQty = 1;
    document.getElementById('cust-qty-val').textContent = customizerQty;

    document.getElementById('cust-product-name').textContent = product.name;
    document.getElementById('cust-product-desc').textContent = product.description || '';
    
    const imgEl = document.getElementById('cust-product-image');
    if (product.image) {
      imgEl.src = product.image;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none'; // Could replace with placeholder
    }

    // Render Variants (Required Customizations)
    const varContainer = document.getElementById('cust-variants-section');
    varContainer.innerHTML = '';
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v, vIdx) => {
        const title = document.createElement('h4');
        title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--text-admin); display: flex; justify-content: space-between; align-items: center;';
        title.innerHTML = `${v.name} <span style="font-size: 0.8rem; background: var(--warning-light); color: var(--warning); padding: 0.2rem 0.6rem; border-radius: 20px; text-transform: uppercase; font-weight: 700;">Required</span>`;
        varContainer.appendChild(title);

        const list = document.createElement('div');
        list.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;';

        v.options.forEach((opt, oIdx) => {
          const row = document.createElement('label');
          row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--border-admin); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;';
          row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="radio" name="variant-${vIdx}" value="${opt.name}" data-price="${opt.price}" style="width: 18px; height: 18px; accent-color: var(--primary);">
              <span style="font-size: 1.1rem; color: var(--text-admin);">${opt.name}</span>
            </div>
            <span style="color: var(--text-admin-muted);">${opt.price > 0 ? '+$' + opt.price.toFixed(2) : 'Free'}</span>
          `;

          // Add listener to style row when selected
          row.querySelector('input').addEventListener('change', () => {
            Array.from(list.children).forEach(child => {
              child.style.borderColor = 'var(--border-admin)';
              child.style.background = 'transparent';
            });
            row.style.borderColor = 'var(--primary)';
            row.style.background = 'var(--primary-kiosk-light)';
            updateCustomizerPrice();
          });

          list.appendChild(row);
        });
        varContainer.appendChild(list);
      });
    }

    // Render Addons (Optional)
    const addonContainer = document.getElementById('cust-addons-section');
    addonContainer.innerHTML = '';
    if (product.addOns && product.addOns.length > 0) {
      const title = document.createElement('h4');
      title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--text-admin); display: flex; justify-content: space-between; align-items: center;';
      title.innerHTML = `Add Extras <span style="font-size: 0.8rem; color: var(--text-admin-muted); font-weight: 500;">Optional</span>`;
      addonContainer.appendChild(title);

      const list = document.createElement('div');
      list.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;';

      product.addOns.forEach((addon, aIdx) => {
        const row = document.createElement('label');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--border-admin); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;';
        row.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <input type="checkbox" value="${addon.name}" data-price="${addon.price}" style="width: 18px; height: 18px; accent-color: var(--primary);">
            <span style="font-size: 1.1rem; color: var(--text-admin);">${addon.name}</span>
          </div>
          <span style="color: var(--text-admin-muted);">+$${addon.price.toFixed(2)}</span>
        `;

        row.querySelector('input').addEventListener('change', (e) => {
          if(e.target.checked) {
            row.style.borderColor = 'var(--primary)';
            row.style.background = 'var(--primary-kiosk-light)';
          } else {
            row.style.borderColor = 'var(--border-admin)';
            row.style.background = 'transparent';
          }
          updateCustomizerPrice();
        });
        
        list.appendChild(row);
      });
      addonContainer.appendChild(list);
    }

    updateCustomizerPrice();
    document.getElementById('customizer-modal').style.display = 'flex';
  }

  function getCustomizerSelections() {
    let extraPrice = 0;
    const selectedOptions = [];
    let isValid = true;

    // Check Variants
    if (currentProduct.variants) {
      currentProduct.variants.forEach((v, vIdx) => {
        const checked = document.querySelector(`input[name="variant-${vIdx}"]:checked`);
        if (checked) {
          const price = parseFloat(checked.getAttribute('data-price')) || 0;
          extraPrice += price;
          selectedOptions.push(`${checked.value}${price > 0 ? ' (+$' + price.toFixed(2) + ')' : ''}`);
        } else {
          isValid = false; // Missing required selection
        }
      });
    }

    // Check Addons
    const addons = document.querySelectorAll('#cust-addons-section input:checked');
    addons.forEach(chk => {
      const price = parseFloat(chk.getAttribute('data-price')) || 0;
      extraPrice += price;
      selectedOptions.push(`${chk.value} (+$${price.toFixed(2)})`);
    });

    const unitPrice = currentProduct.price + extraPrice;
    return { unitPrice, selectedOptions, isValid };
  }

  function updateCustomizerPrice() {
    if (!currentProduct) return;
    const { unitPrice, isValid } = getCustomizerSelections();
    const total = unitPrice * customizerQty;
    document.getElementById('cust-product-price').textContent = `$${currentProduct.price.toFixed(2)}`;
    document.getElementById('cust-total-price').textContent = `$${total.toFixed(2)}`;

    const addBtn = document.getElementById('btn-cust-add-cart');
    if (!isValid) {
      addBtn.style.opacity = '0.5';
      addBtn.innerHTML = `Please select an option`;
    } else {
      addBtn.style.opacity = '1';
      addBtn.innerHTML = `Add to Cart &bull; <span id="cust-total-price">$${total.toFixed(2)}</span>`;
    }
  }

  document.getElementById('btn-cust-plus').addEventListener('click', () => {
    customizerQty++;
    document.getElementById('cust-qty-val').textContent = customizerQty;
    updateCustomizerPrice();
  });

  document.getElementById('btn-cust-minus').addEventListener('click', () => {
    if (customizerQty > 1) {
      customizerQty--;
      document.getElementById('cust-qty-val').textContent = customizerQty;
      updateCustomizerPrice();
    }
  });

  document.getElementById('btn-close-customizer').addEventListener('click', () => {
    document.getElementById('customizer-modal').style.display = 'none';
  });

  document.getElementById('btn-cust-add-cart').addEventListener('click', () => {
    if (!currentProduct) return;

    const { unitPrice, selectedOptions, isValid } = getCustomizerSelections();
    if (!isValid) return; // Prevent adding if invalid

    const hash = currentProduct.id + '|' + selectedOptions.join(',');
    const duplicate = cart.find(item => item.cartItemHash === hash);

    if (duplicate) {
      duplicate.quantity += customizerQty;
    } else {
      cart.push({
        id: currentProduct.id,
        cartItemHash: hash,
        name: currentProduct.name,
        quantity: customizerQty,
        unitPrice: unitPrice,
        customizations: selectedOptions
      });
    }

    updateCartSummary();
    document.getElementById('customizer-modal').style.display = 'none';
  });


  // --- CART ---
  function updateCartSummary() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('header-cart-count');
    badge.textContent = totalCount;
    if (totalCount > 0) {
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  document.getElementById('btn-header-cart').addEventListener('click', () => {
    renderCartScreen();
    showScreen('cart');
  });

  document.getElementById('btn-cart-back').addEventListener('click', () => {
    showScreen('browse');
  });
  
  document.getElementById('btn-continue-ordering').addEventListener('click', () => {
    showScreen('browse');
  });

  function renderCartScreen() {
    const container = document.getElementById('cart-items-list');
    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; color: var(--text-admin-muted);">
          <i data-lucide="shopping-cart" style="width: 64px; height: 64px; margin-bottom: 1.5rem; opacity: 0.5;"></i>
          <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Your cart is empty.</h3>
          <button class="btn btn-primary" onclick="document.getElementById('btn-cart-back').click()" style="padding: 1rem 2rem; border-radius: var(--radius-md);">Continue Ordering</button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      calculateCheckoutTotals();
      return;
    }

    cart.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = 'background: #fff; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-admin); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; box-shadow: var(--shadow-sm);';
      
      const detailStr = item.customizations.join('<br>');
      
      row.innerHTML = `
        <div style="flex: 1;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1.15rem; color: var(--text-admin-main); font-weight: 700;">${item.name}</h4>
          ${detailStr ? `<p style="margin: 0; font-size: 0.85rem; color: var(--text-admin-muted); line-height: 1.4;">${detailStr}</p>` : ''}
          <div style="margin-top: 0.75rem; font-weight: 700; color: var(--primary); font-size: 1.05rem;">$${(item.unitPrice * item.quantity).toFixed(2)}</div>
        </div>
        <div style="display: flex; align-items: center; background: #f8fafc; border-radius: var(--radius-md); padding: 0.25rem; border: 1px solid var(--border-admin);">
          <button class="btn-cart-dec" data-hash="${item.cartItemHash}" style="background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-sm); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-admin-main);"><i data-lucide="minus" style="width: 14px; height: 14px;"></i></button>
          <span style="width: 36px; text-align: center; font-weight: 600; font-size: 0.95rem; color: var(--text-admin-main);">${item.quantity}</span>
          <button class="btn-cart-inc" data-hash="${item.cartItemHash}" style="background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-sm); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-admin-main);"><i data-lucide="plus" style="width: 14px; height: 14px;"></i></button>
        </div>
      `;
      container.appendChild(row);
    });

    document.querySelectorAll('.btn-cart-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        const item = cart.find(i => i.cartItemHash === hash);
        if (item) {
          item.quantity++;
          renderCartScreen();
          updateCartSummary();
        }
      });
    });

    document.querySelectorAll('.btn-cart-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        const idx = cart.findIndex(i => i.cartItemHash === hash);
        if (idx > -1) {
          if (cart[idx].quantity > 1) {
            cart[idx].quantity--;
          } else {
            cart.splice(idx, 1);
          }
          renderCartScreen();
          updateCartSummary();
        }
      });
    });

    if (window.lucide) lucide.createIcons();
    calculateCheckoutTotals();
  }

  function calculateCheckoutTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    // Fetch active discounts
    const discounts = KioskStore.getDiscounts() || [];
    const todayStr = new Date().toISOString().split('T')[0];
    let discountAmount = 0;
    let appliedDiscountName = '';

    const activeDiscounts = discounts.filter(d => {
      if (d.status !== 'active') return false;
      if (d.startDate && d.startDate > todayStr) return false;
      if (d.endDate && d.endDate < todayStr) return false;
      return true;
    });

    if (activeDiscounts.length > 0) {
      // Find the highest discount
      activeDiscounts.forEach(d => {
        let amt = 0;
        if (d.type === 'percentage') {
          amt = subtotal * (d.value / 100);
        } else {
          amt = d.value;
        }
        if (amt > discountAmount) {
          discountAmount = amt;
          appliedDiscountName = d.name;
        }
      });
    }

    // Fetch active taxes
    const taxes = KioskStore.getTaxes() || [];
    const activeTaxes = taxes.filter(t => t.status === 'active');
    const taxPercent = activeTaxes.reduce((sum, t) => sum + t.percentage, 0);

    const taxBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxBase * (taxPercent / 100);
    const grandTotal = taxBase + taxAmount;

    document.getElementById('calc-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    
    const discRow = document.getElementById('calc-discount-row');
    if (discountAmount > 0) {
      discRow.style.display = 'flex';
      document.getElementById('calc-discount').textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      discRow.style.display = 'none';
    }

    document.getElementById('calc-tax-percent').textContent = taxPercent.toString();
    document.getElementById('calc-tax').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('calc-grand-total').textContent = `$${grandTotal.toFixed(2)}`;
    
    const payBtn = document.getElementById('btn-pay-now');
    payBtn.setAttribute('data-payable', grandTotal.toFixed(2));
    
    if (cart.length === 0) {
      payBtn.disabled = true;
      payBtn.style.opacity = '0.5';
    } else {
      payBtn.disabled = false;
      payBtn.style.opacity = '1';
    }
  }


  // --- PRE-PAYMENT VALIDATION ---
  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Cart Validation against latest Admin Store
    const products = KioskStore.getProducts();
    let hasChanges = false;
    
    // Ensure all items are still available
    const validCart = [];
    cart.forEach(item => {
      const storeItem = products.find(p => p.id === item.id);
      if (!storeItem || !storeItem.available) {
        hasChanges = true;
      } else {
        // Technically we should validate price/customizations here as well.
        validCart.push(item);
      }
    });

    if (hasChanges) {
      alert("Some items in your cart are no longer available. Please review your cart before continuing.");
      cart = validCart;
      renderCartScreen();
      updateCartSummary();
      return;
    }

    const failures = KioskStore.getFailures();
    if (failures.networkOffline || failures.backendCrash) {
      alert('Unable to connect. Please try again.');
      return;
    }

    // Render payment methods dynamically
    const payContainer = document.getElementById('payment-options-container');
    payContainer.innerHTML = '';

    const storePayments = KioskStore.getPayments() || [];
    const isEnabled = (methodId) => {
      const p = storePayments.find(item => item.id === methodId);
      return p ? p.status === 'enabled' : false;
    };
    
    if (isEnabled('upi')) {
      payContainer.innerHTML += `
        <button class="payment-card" data-method="upi" style="width: 100%; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(79, 70, 229, 0.05); display: flex; align-items: center; justify-content: center; color: var(--primary);">
            <i data-lucide="smartphone" style="width: 22px; height: 22px;"></i>
          </div>
          <div style="text-align: left;">
            <h3 style="margin: 0 0 0.15rem 0; font-size: 1.05rem; font-weight: 700; color: var(--text-admin-main);">UPI / QR Code</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-admin-muted);">Scan and pay instantly</p>
          </div>
        </button>
      `;
    }
    if (isEnabled('card')) {
      payContainer.innerHTML += `
        <button class="payment-card" data-method="card" style="width: 100%; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(79, 70, 229, 0.05); display: flex; align-items: center; justify-content: center; color: var(--primary);">
            <i data-lucide="credit-card" style="width: 22px; height: 22px;"></i>
          </div>
          <div style="text-align: left;">
            <h3 style="margin: 0 0 0.15rem 0; font-size: 1.05rem; font-weight: 700; color: var(--text-admin-main);">Credit / Debit Card</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-admin-muted);">Swipe or tap to pay</p>
          </div>
        </button>
      `;
    }
    if (isEnabled('cash')) {
      payContainer.innerHTML += `
        <button class="payment-card" data-method="cash" style="width: 100%; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(79, 70, 229, 0.05); display: flex; align-items: center; justify-content: center; color: var(--primary);">
            <i data-lucide="banknote" style="width: 22px; height: 22px;"></i>
          </div>
          <div style="text-align: left;">
            <h3 style="margin: 0 0 0.15rem 0; font-size: 1.05rem; font-weight: 700; color: var(--text-admin-main);">Pay at Counter (Cash)</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-admin-muted);">Pay with cash at the counter</p>
          </div>
        </button>
      `;
    }

    if (window.lucide) lucide.createIcons();

    // Bind events
    document.querySelectorAll('.payment-card').forEach(card => {
      card.addEventListener('click', () => {
        const method = card.getAttribute('data-method');
        startPaymentProcessing(method);
      });
      // hover states
      card.addEventListener('mouseover', () => { card.style.borderColor = 'var(--primary)'; card.style.boxShadow = 'var(--shadow-md)'; });
      card.addEventListener('mouseout', () => { card.style.borderColor = 'var(--border-admin)'; card.style.boxShadow = 'var(--shadow-sm)'; });
    });

    const payable = document.getElementById('btn-pay-now').getAttribute('data-payable');
    document.getElementById('payment-grand-total').textContent = `$${payable}`;

    showScreen('payment');
  });

  document.getElementById('btn-payment-back').addEventListener('click', () => {
    showScreen('cart');
  });
  
  document.getElementById('btn-cancel-payment').addEventListener('click', () => {
    showScreen('cart');
  });

  // --- PAYMENT PROCESSING ---
  function startPaymentProcessing(method) {
    activePaymentMethod = method;
    const modal = document.getElementById('payment-status-modal');
    const stateProcessing = document.getElementById('pay-state-processing');
    const stateFailed = document.getElementById('pay-state-failed');
    const stateTimeout = document.getElementById('pay-state-timeout');

    stateProcessing.style.display = 'block';
    stateFailed.style.display = 'none';
    stateTimeout.style.display = 'none';
    modal.style.display = 'flex';

    // Simulated network delay
    setTimeout(() => {
      resolvePaymentTransaction(method);
    }, 2500);
  }

  function resolvePaymentTransaction(method) {
    const failures = KioskStore.getFailures();
    
    // Duplicate Payment Protection check
    if (pendingOrderId && method !== 'cash') {
      showTimeoutVerification();
      return;
    }

    if (method === 'card' && failures.cardTerminalOffline) {
      showPaymentFailed();
      return;
    }

    if (method === 'upi' && failures.networkOffline) {
      // Simulate timeout where payment succeeded but kiosk didn't get response
      pendingOrderId = 'ord-timeout-' + Date.now();
      showTimeoutVerification();
      return;
    }

    // Success
    completeCheckoutOrder(method);
  }

  function showPaymentFailed() {
    document.getElementById('pay-state-processing').style.display = 'none';
    document.getElementById('pay-state-timeout').style.display = 'none';
    document.getElementById('pay-state-failed').style.display = 'block';
  }

  function showTimeoutVerification() {
    document.getElementById('pay-state-processing').style.display = 'none';
    document.getElementById('pay-state-failed').style.display = 'none';
    document.getElementById('pay-state-timeout').style.display = 'block';
    
    // Auto resolve timeout verification
    setTimeout(() => {
      // We assume recovery state finds the order was successful
      completeCheckoutOrder(activePaymentMethod, pendingOrderId);
      pendingOrderId = null; // Clear lock
    }, 3000);
  }

  document.getElementById('btn-payment-retry').addEventListener('click', () => {
    startPaymentProcessing(activePaymentMethod);
  });

  document.getElementById('btn-payment-cancel-failed').addEventListener('click', () => {
    document.getElementById('payment-status-modal').style.display = 'none';
    showScreen('cart');
  });

  function completeCheckoutOrder(method, recoveredOrderId = null) {
    document.getElementById('payment-status-modal').style.display = 'none';

    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    // Fetch active discounts
    const discounts = KioskStore.getDiscounts() || [];
    const todayStr = new Date().toISOString().split('T')[0];
    let discountAmount = 0;
    const activeDiscounts = discounts.filter(d => {
      if (d.status !== 'active') return false;
      if (d.startDate && d.startDate > todayStr) return false;
      if (d.endDate && d.endDate < todayStr) return false;
      return true;
    });
    if (activeDiscounts.length > 0) {
      activeDiscounts.forEach(d => {
        let amt = 0;
        if (d.type === 'percentage') amt = subtotal * (d.value / 100);
        else amt = d.value;
        if (amt > discountAmount) discountAmount = amt;
      });
    }

    // Fetch active taxes
    const taxes = KioskStore.getTaxes() || [];
    const activeTaxes = taxes.filter(t => t.status === 'active');
    const taxPercent = activeTaxes.reduce((sum, t) => sum + t.percentage, 0);

    const taxBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxBase * (taxPercent / 100);
    const grandTotal = taxBase + taxAmount;

    const orderId = recoveredOrderId || ('ord-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4));
    const orderToken = (KioskStore.getOrders().length + 101).toString();

    const order = {
      orderId,
      orderToken,
      kioskId: activeKioskId,
      dateTime: new Date().toISOString(),
      items: cart,
      subtotalAmount: subtotal,
      discountAmount: discountAmount,
      taxAmount: taxAmount,
      totalAmount: grandTotal,
      paymentMethod: method,
      paymentStatus: method === 'cash' ? 'pending_counter' : 'success',
      orderStatus: method === 'cash' ? 'created' : 'payment_successful',
      customerInfo: { dineIn: orderType === 'dinein' }
    };

    KioskStore.addOrder(order);

    document.getElementById('conf-order-id').textContent = orderId;
    document.getElementById('conf-grand-total').textContent = `$${grandTotal.toFixed(2)}`;

    const itemsContainer = document.getElementById('conf-items-list');
    itemsContainer.innerHTML = '';
    cart.forEach(item => {
      itemsContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>${item.quantity}x ${item.name}</span>
          <span>$${(item.unitPrice * item.quantity).toFixed(2)}</span>
        </div>
      `;
    });

    showScreen('confirmation');
  }

  // --- INIT & SYNC ---
  function syncKioskConfig() {
    const config = KioskStore.getConfig();
    if (!config) return;
    
    // Store Name
    document.getElementById('welcome-store-name').textContent = config.storeName;
    const browseHeader = document.querySelector('#screen-browse .header-logo');
    if(browseHeader) browseHeader.innerHTML = `<i data-lucide="store" style="width:24px;height:24px;"></i> ${config.storeName}`;
    
    renderProductsGrid();
    calculateCheckoutTotals();
    if (window.lucide) lucide.createIcons();
  }

  function checkOfflineStatus() {
    const failures = KioskStore.getFailures();
    const shield = document.getElementById('offline-shield');
    if (failures.networkOffline || failures.backendCrash) {
      shield.style.display = 'flex';
    } else {
      shield.style.display = 'none';
    }
  }

  document.getElementById('btn-kiosk-logout').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('kiosk_auth');
    window.location.href = 'index.html';
  });

  renderMenuCategories();
  renderProductsGrid();
  syncKioskConfig();
  checkOfflineStatus();

  KioskStore.subscribe((key, val) => {
    if (key === KioskStore.KEYS.PRODUCTS || key === 'reset') renderProductsGrid();
    if (key === KioskStore.KEYS.CATEGORIES || key === 'reset') renderMenuCategories();
    if (key === KioskStore.KEYS.CONFIG || key === 'reset') syncKioskConfig();
    if (key === KioskStore.KEYS.SIMULATED_FAILURES || key === 'reset') checkOfflineStatus();
  });

})();
