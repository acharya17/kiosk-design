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

    categories.forEach((cat, idx) => {
      // Ensure we only use valid Lucide icons. Map old standard emojis to lucide if needed, 
      // but assuming Admin panel uses lucide string (e.g. 'grid-2x2')
      let iconName = 'grid-2x2';
      
      const isFirst = idx === 0 && !currentCategoryId;
      if (isFirst) currentCategoryId = cat.id;

      const item = document.createElement('div');
      item.className = `category-item ${currentCategoryId === cat.id ? 'active' : ''}`;
      item.setAttribute('data-id', cat.id);
      item.style.cssText = `display: flex; flex-direction: column; align-items: center; padding: 1rem 0.5rem; text-align: center; border-radius: var(--radius-md); margin: 0 0.5rem 0.5rem; cursor: pointer; color: ${currentCategoryId === cat.id ? 'var(--primary)' : 'var(--text-admin-muted)'}; background: ${currentCategoryId === cat.id ? 'var(--primary-light)' : 'transparent'}; font-weight: ${currentCategoryId === cat.id ? '700' : '500'}; transition: all 0.2s;`;
      
      item.innerHTML = `
        <i data-lucide="${iconName}" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
        <span style="font-size: 0.85rem; line-height: 1.2;">${cat.name}</span>
      `;
      
      item.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(el => {
          el.classList.remove('active');
          el.style.color = 'var(--text-admin-muted)';
          el.style.background = 'transparent';
          el.style.fontWeight = '500';
        });
        item.classList.add('active');
        item.style.color = 'var(--primary)';
        item.style.background = 'var(--primary-light)';
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
    }
    
    if (window.lucide) lucide.createIcons();
  }

  function renderProductsGrid() {
    const products = KioskStore.getProducts() || [];
    const container = document.getElementById('kiosk-products-grid');
    const searchVal = document.getElementById('product-search').value.toLowerCase();
    container.innerHTML = '';

    const filtered = products.filter(p => {
      // If search is active, show across all categories, otherwise just current category
      const matchesCat = searchVal ? true : p.categoryId === currentCategoryId;
      const matchesSearch = p.name.toLowerCase().includes(searchVal) || (p.description && p.description.toLowerCase().includes(searchVal));
      return matchesCat && matchesSearch;
    });

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
      card.style.cssText = `background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); position: relative; ${!p.available ? 'opacity: 0.6;' : 'cursor: pointer;'}`;
      
      // Handle missing images
      const imageSrc = p.image || '';
      const imageEl = imageSrc ? `<img src="${imageSrc}" style="width: 100%; height: 180px; object-fit: cover;" alt="${p.name}">` : `<div style="width: 100%; height: 180px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: var(--text-admin-muted);"><i data-lucide="image" style="width: 48px; height: 48px;"></i><span style="display:block; margin-top: 0.5rem;">Image unavailable</span></div>`;

      card.innerHTML = `
        ${!p.available ? '<div style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.7); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; z-index: 10;">Unavailable</div>' : ''}
        ${imageEl}
        <div style="padding: 1.5rem; display: flex; flex-direction: column; flex: 1;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2rem; color: var(--text-admin);">${p.name}</h4>
          ${p.description ? `<p style="margin: 0 0 1rem 0; font-size: 0.9rem; color: var(--text-admin-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.description}</p>` : ''}
          <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.25rem; font-weight: 700; color: var(--text-admin);">$${p.price.toFixed(2)}</span>
            ${p.available ? `<button class="btn btn-primary" style="padding: 0.5rem 1rem; border-radius: var(--radius-full); display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="plus" style="width: 16px; height: 16px;"></i> Add</button>` : `<span style="color: var(--text-admin-muted); font-weight: 600;">Unavailable</span>`}
          </div>
        </div>
      `;

      if (p.available) {
        card.addEventListener('click', () => {
          openCustomizer(p);
        });
      }
      container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
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
            row.style.background = 'var(--primary-light)';
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
            row.style.background = 'var(--primary-light)';
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
      row.style.cssText = 'background: #fff; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-admin); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;';
      
      const detailStr = item.customizations.join('<br>');
      
      row.innerHTML = `
        <div style="flex: 1;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1.25rem; color: var(--text-admin);">${item.name}</h4>
          ${detailStr ? `<p style="margin: 0; font-size: 0.95rem; color: var(--text-admin-muted); line-height: 1.5;">${detailStr}</p>` : ''}
          <div style="margin-top: 1rem; font-weight: 700; color: var(--text-admin); font-size: 1.1rem;">$${(item.unitPrice * item.quantity).toFixed(2)}</div>
        </div>
        <div style="display: flex; align-items: center; background: #f1f5f9; border-radius: var(--radius-md); padding: 0.25rem;">
          <button class="btn-cart-dec" data-hash="${item.cartItemHash}" style="background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-sm); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-admin);"><i data-lucide="minus" style="width: 16px; height: 16px;"></i></button>
          <span style="width: 40px; text-align: center; font-weight: 600;">${item.quantity}</span>
          <button class="btn-cart-inc" data-hash="${item.cartItemHash}" style="background: #fff; border: 1px solid var(--border-admin); border-radius: var(--radius-sm); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-admin);"><i data-lucide="plus" style="width: 16px; height: 16px;"></i></button>
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

    document.getElementById('calc-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    
    const discRow = document.getElementById('calc-discount-row');
    if (discountAmount > 0) {
      discRow.style.display = 'flex';
      document.getElementById('calc-discount').textContent = `-₹${discountAmount.toFixed(2)}`;
    } else {
      discRow.style.display = 'none';
    }

    document.getElementById('calc-tax-percent').textContent = taxPercent.toString();
    document.getElementById('calc-tax').textContent = `₹${taxAmount.toFixed(2)}`;
    document.getElementById('calc-grand-total').textContent = `₹${grandTotal.toFixed(2)}`;
    
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
        <button class="payment-card" data-method="upi" style="width: 200px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 2px solid var(--border-admin); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s;">
          <i data-lucide="smartphone" class="pay-icon" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">UPI</h3>
        </button>
      `;
    }
    if (isEnabled('card')) {
      payContainer.innerHTML += `
        <button class="payment-card" data-method="card" style="width: 200px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 2px solid var(--border-admin); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s;">
          <i data-lucide="credit-card" class="pay-icon" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Card</h3>
        </button>
      `;
    }
    if (isEnabled('cash')) {
      payContainer.innerHTML += `
        <button class="payment-card" data-method="cash" style="width: 200px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 2px solid var(--border-admin); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s;">
          <i data-lucide="banknote" class="pay-icon" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Cash</h3>
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
      card.addEventListener('mouseover', () => { card.style.borderColor = 'var(--primary)'; card.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; });
      card.addEventListener('mouseout', () => { card.style.borderColor = 'var(--border-admin)'; card.style.boxShadow = 'none'; });
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
    document.getElementById('conf-grand-total').textContent = `₹${grandTotal.toFixed(2)}`;

    const itemsContainer = document.getElementById('conf-items-list');
    itemsContainer.innerHTML = '';
    cart.forEach(item => {
      itemsContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>${item.quantity}x ${item.name}</span>
          <span>₹${(item.unitPrice * item.quantity).toFixed(2)}</span>
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
