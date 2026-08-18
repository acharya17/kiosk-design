(function() {
  // State variables
  let cart = [];
  let orderType = 'dinein'; // 'dinein' or 'takeaway'
  let currentCategoryId = 'cat-burgers';
  let activePromo = null;
  let inactivityTimer = null;
  let inactivityCountdownTimer = null;
  let activeKioskId = 'kiosk-01';

  // Modal customizer state
  let currentProduct = null;
  let customizerQty = 1;

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

    // Trigger actions on screen entry
    if (screenId === 'welcome') {
      resetSession();
      stopInactivityTimer();
    } else if (screenId === 'confirmation') {
      stopInactivityTimer();
      // Auto return to home in 15 seconds
      let timeLeft = 15;
      const finishBtn = document.getElementById('btn-finish-order');
      finishBtn.textContent = `Complete & Return Home (${timeLeft}s)`;
      const autoReturnInterval = setInterval(() => {
        timeLeft--;
        if (screens.confirmation.classList.contains('active') && timeLeft > 0) {
          finishBtn.textContent = `Complete & Return Home (${timeLeft}s)`;
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
    activePromo = null;
    currentProduct = null;
    customizerQty = 1;
    document.getElementById('checkout-form').reset();
    document.getElementById('promo-input').value = '';
    document.getElementById('promo-msg').textContent = '';
    document.getElementById('calc-discount-row').style.display = 'none';
    updateCartSummary();
  }

  // --- INACTIVITY HANDLERS ---
  function startInactivityTimer() {
    stopInactivityTimer();
    const config = KioskStore.getConfig() || { inactivityTimeout: 30 };
    const timeoutMs = (config.inactivityTimeout || 30) * 1000;

    inactivityTimer = setTimeout(() => {
      triggerInactivityWarning();
    }, timeoutMs);
  }

  function stopInactivityTimer() {
    clearTimeout(inactivityTimer);
    clearInterval(inactivityCountdownTimer);
    document.getElementById('inactivity-modal').classList.remove('visible');
  }

  function resetInactivityOnInteraction() {
    // Only reset if we are on active interactive screens
    if (screens.browse.classList.contains('active') || 
        screens.cart.classList.contains('active') || 
        screens.payment.classList.contains('active')) {
      startInactivityTimer();
    }
  }

  // Bind interaction listeners to reset the liveness timer
  ['mousedown', 'mousemove', 'keypress', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, resetInactivityOnInteraction);
  });

  function triggerInactivityWarning() {
    stopInactivityTimer(); // Stop main timer
    document.getElementById('inactivity-modal').classList.add('visible');

    let countdown = 10;
    const countdownEl = document.getElementById('inactivity-countdown-number');
    countdownEl.textContent = countdown;

    inactivityCountdownTimer = setInterval(() => {
      countdown--;
      countdownEl.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(inactivityCountdownTimer);
        document.getElementById('inactivity-modal').classList.remove('visible');
        showScreen('welcome'); // Return home
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
    showScreen('orderType');
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('btn-type-dinein').addEventListener('click', () => {
    orderType = 'dinein';
    document.getElementById('browse-type-badge').textContent = 'Dine In';
    document.getElementById('table-number-group').style.display = 'block';
    document.getElementById('check-table').required = true;
    showScreen('browse');
  });

  document.getElementById('btn-type-takeaway').addEventListener('click', () => {
    orderType = 'takeaway';
    document.getElementById('browse-type-badge').textContent = 'Takeaway';
    document.getElementById('table-number-group').style.display = 'none';
    document.getElementById('check-table').required = false;
    document.getElementById('check-table').value = '';
    showScreen('browse');
  });

  document.querySelectorAll('.btn-to-welcome').forEach(btn => {
    btn.addEventListener('click', () => showScreen('welcome'));
  });

  document.getElementById('btn-browse-back').addEventListener('click', () => {
    showScreen('orderType');
  });


  // --- MENU BROWSE LOGICS ---

  function renderMenuCategories() {
    const categories = KioskStore.getCategories() || [];
    const container = document.getElementById('kiosk-category-list');
    container.innerHTML = '';

    categories.forEach((cat, idx) => {
      const isFirst = idx === 0 && !currentCategoryId;
      if (isFirst) currentCategoryId = cat.id;

      const item = document.createElement('div');
      item.className = `category-item ${currentCategoryId === cat.id ? 'active' : ''}`;
      item.setAttribute('data-id', cat.id);
      item.innerHTML = `
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
      `;
      item.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
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
  }

  function renderProductsGrid() {
    const products = KioskStore.getProducts() || [];
    const container = document.getElementById('kiosk-products-grid');
    const searchVal = document.getElementById('product-search').value.toLowerCase();
    container.innerHTML = '';

    const filtered = products.filter(p => {
      const matchesCat = p.categoryId === currentCategoryId;
      const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column: span 2; text-align: center; color: var(--text-kiosk-muted); padding: 2rem;">No items found in this section.</div>';
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = `product-card ${!p.available ? 'oos' : ''}`;
      card.innerHTML = `
        ${!p.available ? '<span class="oos-badge">Out of Stock</span>' : ''}
        <img src="${p.image}" class="product-card-img" alt="${p.name}">
        <div class="product-card-info">
          <h4>${p.name}</h4>
          <div class="product-card-price-row">
            <span class="product-card-price">$${p.price.toFixed(2)}</span>
            ${p.available ? `<span class="product-card-add-icon">${p.customizable ? '✏️' : '+'}</span>` : ''}
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
  }

  document.getElementById('product-search').addEventListener('input', renderProductsGrid);


  // --- PRODUCT CUSTOMIZER ---

  function openCustomizer(product) {
    currentProduct = product;
    customizerQty = 1;
    document.getElementById('cust-qty-val').textContent = customizerQty;
    document.getElementById('cust-instructions').value = '';

    document.getElementById('cust-product-name').textContent = product.name;
    document.getElementById('cust-product-image').src = product.image;
    document.getElementById('cust-product-desc').textContent = product.description;

    // Variants list
    const varContainer = document.getElementById('cust-variants-section');
    varContainer.innerHTML = '';
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v, vIdx) => {
        const title = document.createElement('h4');
        title.textContent = v.name;
        varContainer.appendChild(title);

        const list = document.createElement('div');
        list.className = 'options-list';

        v.options.forEach((opt, oIdx) => {
          const row = document.createElement('div');
          row.className = `option-row ${oIdx === 0 ? 'selected' : ''}`;
          row.innerHTML = `
            <label>
              <input type="radio" name="variant-${vIdx}" value="${opt.name}" data-price="${opt.price}" ${oIdx === 0 ? 'checked' : ''}>
              ${opt.name}
            </label>
            <span class="option-price">${opt.price > 0 ? '+$' + opt.price.toFixed(2) : 'Free'}</span>
          `;

          row.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
              row.querySelector('input').checked = true;
            }
            list.querySelectorAll('.option-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            updateCustomizerPrice();
          });
          list.appendChild(row);
        });
        varContainer.appendChild(list);
      });
    }

    // Addons list
    const addonContainer = document.getElementById('cust-addons-section');
    addonContainer.innerHTML = '';
    if (product.addOns && product.addOns.length > 0) {
      const title = document.createElement('h4');
      title.textContent = 'Add Extra Goodies';
      addonContainer.appendChild(title);

      const list = document.createElement('div');
      list.className = 'options-list';

      product.addOns.forEach((addon, aIdx) => {
        const row = document.createElement('div');
        row.className = 'option-row';
        row.innerHTML = `
          <label>
            <input type="checkbox" value="${addon.name}" data-price="${addon.price}">
            ${addon.name}
          </label>
          <span class="option-price">+$${addon.price.toFixed(2)}</span>
        `;

        row.addEventListener('click', (e) => {
          if (e.target.tagName !== 'INPUT') {
            const chk = row.querySelector('input');
            chk.checked = !chk.checked;
          }
          row.classList.toggle('selected', row.querySelector('input').checked);
          updateCustomizerPrice();
        });
        list.appendChild(row);
      });
      addonContainer.appendChild(list);
    }

    updateCustomizerPrice();
    document.getElementById('customizer-modal').classList.add('visible');
  }

  function getCustomizerSelections() {
    let extraPrice = 0;
    const selectedOptions = [];

    // Checked variants
    if (currentProduct.variants) {
      currentProduct.variants.forEach((v, vIdx) => {
        const checked = document.querySelector(`input[name="variant-${vIdx}"]:checked`);
        if (checked) {
          const price = parseFloat(checked.getAttribute('data-price')) || 0;
          extraPrice += price;
          // Only show extra cost if any
          selectedOptions.push(`${checked.value}${price > 0 ? ' (+$' + price.toFixed(2) + ')' : ''}`);
        }
      });
    }

    // Checked addons
    const addons = document.querySelectorAll('#cust-addons-section input:checked');
    addons.forEach(chk => {
      const price = parseFloat(chk.getAttribute('data-price')) || 0;
      extraPrice += price;
      selectedOptions.push(`${chk.value} (+$${price.toFixed(2)})`);
    });

    const unitPrice = currentProduct.price + extraPrice;
    return { unitPrice, selectedOptions };
  }

  function updateCustomizerPrice() {
    if (!currentProduct) return;
    const { unitPrice } = getCustomizerSelections();
    const total = unitPrice * customizerQty;
    document.getElementById('cust-total-price').textContent = `$${total.toFixed(2)}`;
  }

  // Customizer quantity controllers
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
    document.getElementById('customizer-modal').classList.remove('visible');
  });

  // Add to cart click
  document.getElementById('btn-cust-add-cart').addEventListener('click', () => {
    if (!currentProduct) return;

    const { unitPrice, selectedOptions } = getCustomizerSelections();
    const notes = document.getElementById('cust-instructions').value.trim();

    // Check if duplicate item exists in cart already
    const hash = currentProduct.id + '|' + selectedOptions.join(',') + '|' + notes;
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
        customizations: selectedOptions,
        notes: notes
      });
    }

    updateCartSummary();
    document.getElementById('customizer-modal').classList.remove('visible');
  });


  // --- CART CALCULATIONS ---

  function updateCartSummary() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const summaryBar = document.getElementById('cart-summary-bar');
    const badge = document.getElementById('summary-cart-count');
    const totalVal = document.getElementById('summary-cart-total');

    if (totalCount > 0) {
      summaryBar.classList.add('visible');
      badge.textContent = totalCount;
      totalVal.textContent = `$${subtotal.toFixed(2)}`;
    } else {
      summaryBar.classList.remove('visible');
    }
  }

  document.getElementById('btn-view-cart').addEventListener('click', () => {
    renderCartScreen();
    showScreen('cart');
  });

  document.getElementById('btn-cart-back').addEventListener('click', () => {
    showScreen('browse');
  });

  function renderCartScreen() {
    const container = document.getElementById('cart-items-list');
    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 3rem 0; color: var(--text-kiosk-muted);">Your cart is empty.</div>';
      calculateCheckoutTotals();
      return;
    }

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      const detailStr = item.customizations.join(', ');
      const notesStr = item.notes ? `<div style="color: var(--warning); margin-top: 0.25rem;">Note: "${item.notes}"</div>` : '';

      row.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          ${detailStr ? `<p>${detailStr}</p>` : ''}
          ${notesStr}
        </div>
        <div class="cart-item-price-actions">
          <span class="cart-item-price">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
          <div class="qty-controls">
            <button class="qty-btn-inline btn-cart-dec" data-hash="${item.cartItemHash}">-</button>
            <span class="qty-val-inline">${item.quantity}</span>
            <button class="qty-btn-inline btn-cart-inc" data-hash="${item.cartItemHash}">+</button>
          </div>
        </div>
      `;
      container.appendChild(row);
    });

    // Inline Qty hooks
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

    calculateCheckoutTotals();
  }

  function calculateCheckoutTotals() {
    const config = KioskStore.getConfig() || { taxPercent: 8, discountCode: 'WELCOME10', discountPercent: 10 };
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    let discountAmount = 0;
    if (activePromo) {
      discountAmount = subtotal * (config.discountPercent / 100);
      document.getElementById('calc-discount-row').style.display = 'flex';
      document.getElementById('calc-discount').textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      document.getElementById('calc-discount-row').style.display = 'none';
    }

    const taxBase = subtotal - discountAmount;
    const taxAmount = taxBase * (config.taxPercent / 100);
    const grandTotal = taxBase + taxAmount;

    document.getElementById('calc-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('calc-tax-percent').textContent = config.taxPercent;
    document.getElementById('calc-tax').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('calc-grand-total').textContent = `$${grandTotal.toFixed(2)}`;
    
    // Hold final payable in temp storage
    document.getElementById('btn-pay-now').setAttribute('data-payable', grandTotal.toFixed(2));
  }

  // Coupon promo code apply hook
  document.getElementById('btn-apply-promo').addEventListener('click', () => {
    const val = document.getElementById('promo-input').value.toUpperCase().trim();
    const config = KioskStore.getConfig();
    const msg = document.getElementById('promo-msg');

    if (!val) return;

    if (val === config.discountCode) {
      activePromo = val;
      msg.textContent = `Promo code "${config.discountCode}" applied! ${config.discountPercent}% Off.`;
      msg.style.color = 'var(--success)';
      calculateCheckoutTotals();
    } else {
      activePromo = null;
      msg.textContent = 'Invalid promo code coupon.';
      msg.style.color = 'var(--danger)';
      calculateCheckoutTotals();
    }
  });


  // --- CHECKOUT SUBMISSION ---

  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Cart is empty.');
      return;
    }

    // Check if backend or network offline is toggled on
    const failures = KioskStore.getFailures();
    if (failures.networkOffline || failures.backendCrash) {
      alert('Terminal system offline. Cannot process checkouts at this moment.');
      return;
    }

    // Capture user details
    const name = document.getElementById('check-name').value.trim();
    const mobile = document.getElementById('check-mobile').value.trim();
    const table = document.getElementById('check-table').value.trim();

    // Render payment display amounts
    const payable = document.getElementById('btn-pay-now').getAttribute('data-payable');
    document.getElementById('payment-grand-total').textContent = `$${payable}`;

    // Show dynamic payment choices based on store settings
    const config = KioskStore.getConfig();
    const payUpi = document.getElementById('pay-opt-upi');
    const payCard = document.getElementById('pay-opt-card');
    const payCash = document.getElementById('pay-opt-cash');

    payUpi.style.display = config.paymentMethods.upi ? 'flex' : 'none';
    payCard.style.display = config.paymentMethods.card ? 'flex' : 'none';
    payCash.style.display = config.paymentMethods.cash ? 'flex' : 'none';

    showScreen('payment');
  });

  document.getElementById('btn-cancel-payment').addEventListener('click', () => {
    showScreen('cart');
  });


  // --- SIMULATED PAYMENT TRANSACTIONS ---

  let paymentProgressInterval = null;

  document.querySelectorAll('.payment-card').forEach(card => {
    card.addEventListener('click', () => {
      const method = card.getAttribute('data-method');
      startPaymentProcessing(method);
    });
  });

  function startPaymentProcessing(method) {
    const modal = document.getElementById('payment-status-modal');
    const stateProcessing = document.getElementById('pay-state-processing');
    const stateFailed = document.getElementById('pay-state-failed');
    const stateTimeout = document.getElementById('pay-state-timeout');

    // Reset popup states
    stateProcessing.classList.add('active');
    stateFailed.classList.remove('active');
    stateTimeout.classList.remove('active');
    modal.classList.add('visible');

    const progressBar = document.getElementById('pay-progress-bar');
    progressBar.style.width = '0%';

    let progress = 0;
    clearInterval(paymentProgressInterval);

    // Dynamic payment step simulation (2.5 seconds)
    paymentProgressInterval = setInterval(() => {
      progress += 4;
      progressBar.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(paymentProgressInterval);
        resolvePaymentTransaction(method);
      }
    }, 100);
  }

  function resolvePaymentTransaction(method) {
    const stateProcessing = document.getElementById('pay-state-processing');
    const stateFailed = document.getElementById('pay-state-failed');
    const stateTimeout = document.getElementById('pay-state-timeout');

    const failures = KioskStore.getFailures();

    // Outage/failures routes
    if (method === 'card' && failures.cardTerminalOffline) {
      // Card Outage simulation
      stateProcessing.classList.remove('active');
      stateFailed.classList.add('active');
      document.getElementById('payment-fail-reason').textContent = 'Card Terminal Offline. Hardware error, retry or select cash payment.';
      return;
    }

    if (method === 'upi' && failures.networkOffline) {
      // UPI connection loss
      stateProcessing.classList.remove('active');
      stateFailed.classList.add('active');
      document.getElementById('payment-fail-reason').textContent = 'Network Timeout. Unable to reach UPI gateway provider.';
      return;
    }

    // Random failure simulation to make UI interesting (say 15% rate if no hardware outage is checked)
    // To keep prototype controllable, let's just let it succeed unless specified.
    // If Cash is chosen, it's always successful since it is processed at counter.
    
    // We confirm the order!
    completeCheckoutOrder(method);
  }

  // Complete order processing
  function completeCheckoutOrder(method) {
    // Hide payment modal
    document.getElementById('payment-status-modal').classList.remove('visible');

    // Read details
    const name = document.getElementById('check-name').value.trim();
    const mobile = document.getElementById('check-mobile').value.trim();
    const table = document.getElementById('check-table').value.trim();
    const config = KioskStore.getConfig();

    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    let discountAmount = 0;
    if (activePromo) {
      discountAmount = subtotal * (config.discountPercent / 100);
    }
    const taxBase = subtotal - discountAmount;
    const taxAmount = taxBase * (config.taxPercent / 100);
    const grandTotal = taxBase + taxAmount;

    // Generate unique ID & token
    const orderId = 'ord-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
    const orderToken = (KioskStore.getOrders().length + 101).toString(); // Start token count from 101

    const order = {
      orderId,
      orderToken,
      kioskId: activeKioskId,
      dateTime: new Date().toISOString(),
      items: cart,
      subtotalAmount: subtotal,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      totalAmount: grandTotal,
      paymentMethod: method,
      paymentStatus: method === 'cash' ? 'pending_counter' : 'success',
      orderStatus: method === 'cash' ? 'created' : 'payment_successful',
      customerInfo: {
        name,
        mobile,
        dineIn: orderType === 'dinein',
        tableNumber: orderType === 'dinein' ? table : null
      }
    };

    // Add to shared Store
    KioskStore.addOrder(order);

    // Populate confirmation display
    document.getElementById('conf-token-number').textContent = `#${orderToken}`;
    document.getElementById('conf-order-id').textContent = orderId;
    document.getElementById('conf-payment-status').textContent = method === 'cash' ? 'PAY AT COUNTER' : 'SUCCESS';
    document.getElementById('conf-payment-status').className = `badge ${method === 'cash' ? 'warning-bg' : 'touch-badge'}`;

    // Populate receipt printed slip
    document.getElementById('receipt-date').textContent = `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    document.getElementById('receipt-table').textContent = orderType === 'dinein' ? table : 'Takeaway';
    document.getElementById('receipt-token').textContent = `#${orderToken}`;

    const receiptItemsContainer = document.getElementById('receipt-items-list');
    receiptItemsContainer.innerHTML = '';
    cart.forEach(item => {
      const row = document.createElement('div');
      row.innerHTML = `
        <span>${item.quantity}x ${item.name}</span>
        <span>$${(item.unitPrice * item.quantity).toFixed(2)}</span>
      `;
      receiptItemsContainer.appendChild(row);
    });

    document.getElementById('receipt-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('receipt-tax').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('receipt-discount').textContent = `-$${discountAmount.toFixed(2)}`;
    document.getElementById('receipt-total').textContent = `$${grandTotal.toFixed(2)}`;

    // Printer simulation check
    const failures = KioskStore.getFailures();
    const paperReceipt = document.getElementById('paper-receipt');
    if (failures.printerOffline) {
      paperReceipt.style.animation = 'none';
      paperReceipt.style.maxHeight = '0px';
      alert('Printer offline alert: Kiosk was unable to print a paper receipt. Copying order token digitally.');
    } else {
      paperReceipt.style.animation = 'feedPaper 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards';
    }

    showScreen('confirmation');
  }

  // Payment popup action cancellations
  document.getElementById('btn-payment-cancel-failed').addEventListener('click', () => {
    document.getElementById('payment-status-modal').classList.remove('visible');
    showScreen('cart');
  });

  document.getElementById('btn-payment-retry').addEventListener('click', () => {
    const option = document.querySelector('.payment-card:hover'); // Quick guess
    startPaymentProcessing(option ? option.getAttribute('data-method') : 'card');
  });

  document.getElementById('btn-finish-order').addEventListener('click', () => {
    showScreen('welcome');
  });


  // --- STORE CHANGE SYNC SUBSCRIPTIONS ---

  function syncKioskConfig() {
    const config = KioskStore.getConfig();
    if (!config) return;

    // Apply store name
    document.getElementById('welcome-store-name').textContent = config.storeName;
    document.getElementById('welcome-store-name').parentElement.querySelector('h1').textContent = config.storeName;

    // Redraw menu grids based on active price changes
    renderProductsGrid();
    calculateCheckoutTotals();
  }

  function checkOfflineStatus() {
    const failures = KioskStore.getFailures();
    const shield = document.getElementById('offline-shield');

    if (failures.networkOffline || failures.backendCrash) {
      shield.classList.add('active');
    } else {
      shield.classList.remove('active');
    }
  }

  // Initialize
  renderMenuCategories();
  renderProductsGrid();
  syncKioskConfig();
  checkOfflineStatus();

  // Handle cross window changes
  KioskStore.subscribe((key, val) => {
    if (key === KioskStore.KEYS.PRODUCTS || key === 'reset') {
      renderProductsGrid();
    }
    if (key === KioskStore.KEYS.CATEGORIES || key === 'reset') {
      renderMenuCategories();
    }
    if (key === KioskStore.KEYS.CONFIG || key === 'reset') {
      syncKioskConfig();
    }
    if (key === KioskStore.KEYS.SIMULATED_FAILURES || key === 'reset') {
      checkOfflineStatus();
    }
  });

})();
