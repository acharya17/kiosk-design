(function() {
  // Authentication State
  let isAuthenticated = true;

  // Logout trigger
  document.getElementById('btn-auth-logout').addEventListener('click', () => {
    sessionStorage.removeItem('kiosk_auth');
    window.location.href = 'index.html';
  });


  // --- 2. WORKSPACE TAB CONTROL & UNIFORM LAYOUT ---

  const tabLinks = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const tabTitle = document.getElementById('tab-title');
  const tabDescription = document.getElementById('tab-description');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');

  const tabMeta = {
    'dashboard': { title: 'Dashboard', desc: 'Overview of system status and performance.' },
    'banners': { title: 'Banners', desc: 'Manage promotional banners and media.' },
    'playlists': { title: 'Playlists', desc: 'Create and configure media loops.' },
    'tvs': { title: 'TV Displays', desc: 'Assign signage schedules and configure fallback contents.' },
    'categories': { title: 'Categories', desc: 'Browse and edit catalog menu partitions.' },
    'products': { title: 'Products', desc: 'Manage menu items, taxes, and promotional discount campaigns.' },
    'customisation': { title: 'Customisation', desc: 'Configure product modifications and addon matrix.' },
    'kiosks': { title: 'Kiosks', desc: 'Register self-order customer terminals and apply configurations.' },
    'payments': { title: 'Payments', desc: 'Manage UPI, Card, and Cash gateway settings.' },
    'orders': { title: 'Orders', desc: 'Monitor kiosk generated orders logs.' },
    'devices': { title: 'Device Status', desc: 'Hardware peripheral diagnostic logs.' },
    'roles': { title: 'Roles & Access', desc: 'Pending clarification. Placeholders active.' }
  };

  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');

      tabLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `tab-${targetTab}`) {
          pane.classList.add('active');
        }
      });

      const meta = tabMeta[targetTab] || { title: 'Dashboard', desc: '' };
      tabTitle.textContent = meta.title;
      tabDescription.textContent = meta.desc;
      breadcrumbCurrent.textContent = meta.title;
    });
  });

  // Products Inner Sub-Tabs Switcher
  document.addEventListener('click', (e) => {
    const subtabBtn = e.target.closest('.subtab-link');
    if (subtabBtn) {
      const targetSubtab = subtabBtn.getAttribute('data-subtab');
      const parent = subtabBtn.parentElement;
      
      parent.querySelectorAll('.subtab-link').forEach(btn => {
        btn.classList.remove('active-subtab');
        btn.style.color = 'var(--text-admin-muted)';
        btn.style.borderBottom = 'none';
      });
      subtabBtn.classList.add('active-subtab');
      subtabBtn.style.color = 'var(--primary)';
      subtabBtn.style.borderBottom = '2px solid var(--primary)';

      const container = parent.parentElement;
      container.querySelectorAll('.subtab-content').forEach(pane => {
        pane.style.display = 'none';
      });
      const targetPane = document.getElementById(`subtab-${targetSubtab}`);
      if (targetPane) {
        targetPane.style.display = 'block';
      }
    }
  });

  // Simulator Drawer
  const simToggle = document.getElementById('simulation-toggle');
  const simDrawer = document.querySelector('.simulation-drawer');
  if (simToggle) {
    simToggle.addEventListener('click', () => {
      simDrawer.classList.toggle('expanded');
    });
  }


  // --- 3. TOAST NOTIFICATIONS WRAPPER ---

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '⚠️'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.2s reverse';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }


  // --- 4. RENDER PROCEDURES ---

  // 4.1 Dashboard overview widgets
  function renderDashboard() {
    const banners = KioskStore.getBanners() || [];
    const tvs = KioskStore.getTVs() || [];
    const kiosks = KioskStore.getKiosks() || [];
    const orders = KioskStore.getOrders() || [];

    const activeBanners = banners.filter(b => b.active).length;
    const activeTvs = tvs.filter(t => t.connectionStatus === 'online').length;
    const activeKiosks = kiosks.filter(k => k.connectionStatus === 'online').length;

    // Set metrics
    document.getElementById('kpi-active-tvs').textContent = activeTvs;
    document.getElementById('kpi-active-banners').textContent = activeBanners;
    document.getElementById('kpi-active-kiosks').textContent = activeKiosks;
    document.getElementById('kpi-orders-count').textContent = orders.length;

    // Render TV status table
    const tvTbody = document.getElementById('dash-tv-tbody');
    tvTbody.innerHTML = '';
    tvs.forEach(t => {
      const pl = KioskStore.getPlaylists().find(p => p.id === t.assignedPlaylistId)?.name || 'None';
      tvTbody.innerHTML += `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td>${t.location || 'Foyer'}</td>
          <td><span class="badge desktop-badge">${pl}</span></td>
          <td><span class="badge ${t.connectionStatus === 'online' ? 'touch-badge' : 'danger-badge'}">${t.connectionStatus.toUpperCase()}</span></td>
        </tr>
      `;
    });

    // Render Kiosk status table
    const kioskTbody = document.getElementById('dash-kiosk-tbody');
    kioskTbody.innerHTML = '';
    kiosks.forEach(k => {
      kioskTbody.innerHTML += `
        <tr>
          <td><strong>${k.name}</strong></td>
          <td>${k.location || 'Lobby'}</td>
          <td><span class="badge ${k.connectionStatus === 'online' ? 'touch-badge' : 'danger-badge'}">${k.connectionStatus.toUpperCase()}</span></td>
        </tr>
      `;
    });

    // Render Recent Orders table
    const ordersTbody = document.getElementById('dash-orders-tbody');
    ordersTbody.innerHTML = '';
    if (orders.length === 0) {
      ordersTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No orders processed.</td></tr>';
    } else {
      orders.slice(0, 5).forEach(o => {
        ordersTbody.innerHTML += `
          <tr>
            <td><span style="font-family: monospace; font-size: 0.75rem;">${o.orderId.slice(0, 8)}</span></td>
            <td>Kiosk ${o.kioskId}</td>
            <td><strong>$${o.totalAmount.toFixed(2)}</strong></td>
            <td><span class="badge touch-badge">${o.paymentStatus.toUpperCase()}</span></td>
            <td><span class="badge desktop-badge">${o.orderStatus.toUpperCase()}</span></td>
          </tr>
        `;
      });
    }

    // Dynamic alerts
    const alertsBar = document.getElementById('dashboard-alerts-bar');
    alertsBar.innerHTML = '';
    const failures = KioskStore.getFailures();
    let alertFound = false;

    if (failures.networkOffline) {
      alertsBar.innerHTML += `<div class="alert-strip danger"><span class="alert-icon">⚠️</span> [NETWORK OUTAGE] active. Kiosk orders locked.</div>`;
      alertFound = true;
    }
    if (failures.backendCrash) {
      alertsBar.innerHTML += `<div class="alert-strip danger"><span class="alert-icon">⚠️</span> [SERVER OUTAGE] active. Offline warnings triggered.</div>`;
      alertFound = true;
    }
    if (failures.printerOffline) {
      alertsBar.innerHTML += `<div class="alert-strip danger"><span class="alert-icon">⚠️</span> [PRINTER ERROR] active. Thermal ticket printer offline.</div>`;
      alertFound = true;
    }
    if (failures.cardTerminalOffline) {
      alertsBar.innerHTML += `<div class="alert-strip danger"><span class="alert-icon">⚠️</span> [TERMINAL OUTAGE] active. Card swipes restricted.</div>`;
      alertFound = true;
    }

    if (!alertFound) {
      alertsBar.innerHTML = `<div class="alert-strip success"><span class="alert-icon">✓</span> All displays, peripheral systems, and payment endpoints operating online.</div>`;
    }
  }

  // 4.2 Banners CRUD
  function renderBanners() {
    const banners = KioskStore.getBanners() || [];
    const playlists = KioskStore.getPlaylists() || [];
    const tbody = document.getElementById('banners-tbody');
    tbody.innerHTML = '';

    const search = document.getElementById('banner-search').value.toLowerCase();
    const fStatus = document.getElementById('banner-filter-status').value;
    const fType = document.getElementById('banner-filter-type').value;
    const fPlaylist = document.getElementById('banner-filter-playlist').value;

    // Populate dropdown
    const playlistSelect = document.getElementById('banner-filter-playlist');
    if (playlistSelect.options.length === 1) {
      playlists.forEach(p => {
        playlistSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
      });
    }

    const filtered = banners.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(search);
      const matchStatus = fStatus === 'all' || (fStatus === 'active' && b.active) || (fStatus === 'inactive' && !b.active);
      const matchType = fType === 'all' || b.contentType === fType;
      const matchPlaylist = fPlaylist === 'all' || b.playlistId === fPlaylist;
      return matchSearch && matchStatus && matchType && matchPlaylist;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No scheduled banners found.</td></tr>';
      return;
    }

    filtered.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${b.title}</strong></td>
          <td><img src="${b.image}" class="thumbnail" alt="thumbnail"></td>
          <td><span class="badge desktop-badge">${b.contentType.toUpperCase()}</span></td>
          <td>${b.duration}s</td>
          <td><small>${b.startDate} @ ${b.startTime}</small></td>
          <td><small>${b.endDate} @ ${b.endTime}</small></td>
          <td>Priority ${b.priority}</td>
          <td><span class="badge ${b.active ? 'touch-badge' : 'danger-badge'}">${b.active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button class="btn btn-secondary btn-view-banner" data-id="${b.id}">View</button>
            <button class="btn btn-secondary btn-edit-banner" data-id="${b.id}">Edit</button>
            <button class="btn btn-danger btn-delete-banner" data-id="${b.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-banner', previewBanner);
    bindEvents('.btn-edit-banner', editBanner);
    bindEvents('.btn-delete-banner', deleteBanner);
  }

  // 4.3 Playlists CRUD
  function renderPlaylists() {
    const playlists = KioskStore.getPlaylists() || [];
    const tbody = document.getElementById('playlists-tbody');
    tbody.innerHTML = '';

    playlists.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${p.name}</strong><br><small style="color: var(--text-admin-muted);">ID: ${p.id}</small></td>
          <td>${p.bannerIds?.length || 0} Banners</td>
          <td>${p.assignedTVs || '0 TVs'}</td>
          <td><span class="badge touch-badge">${p.status.toUpperCase()}</span></td>
          <td>${p.updatedDate}</td>
          <td>
            <button class="btn btn-secondary btn-view-playlist" data-id="${p.id}">View</button>
            <button class="btn btn-secondary btn-edit-playlist" data-id="${p.id}">Edit</button>
            <button class="btn btn-danger btn-delete-playlist" data-id="${p.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-playlist', simulatePlaylistSequence);
    bindEvents('.btn-edit-playlist', editPlaylist);
    bindEvents('.btn-delete-playlist', deletePlaylist);
  }

  // 4.4 TVs CRUD
  function renderTVs() {
    const tvs = KioskStore.getTVs() || [];
    const playlists = KioskStore.getPlaylists() || [];
    const tbody = document.getElementById('tvs-tbody');
    tbody.innerHTML = '';

    tvs.forEach(t => {
      const pl = playlists.find(p => p.id === t.assignedPlaylistId)?.name || 'None';
      tbody.innerHTML += `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td><span style="font-family: monospace;">${t.id}</span></td>
          <td>${t.location || 'Counter'}</td>
          <td><span class="badge desktop-badge">${pl}</span></td>
          <td><span class="badge touch-badge">${t.status.toUpperCase()}</span></td>
          <td><span class="badge ${t.connectionStatus === 'online' ? 'touch-badge' : 'danger-badge'}">${t.connectionStatus.toUpperCase()}</span></td>
          <td>${t.lastActive}</td>
          <td>
            <button class="btn btn-secondary btn-view-tv" data-id="${t.id}">View</button>
            <button class="btn btn-secondary btn-edit-tv" data-id="${t.id}">Edit</button>
            <button class="btn btn-danger btn-delete-tv" data-id="${t.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-tv', showTVDetails);
    bindEvents('.btn-edit-tv', editTV);
    bindEvents('.btn-delete-tv', deleteTV);
  }

  // 4.5 Fallback config Content
  function renderFallback() {
    const config = KioskStore.getConfig();
    if (!config || !config.fallbackContent) return;

    const f = config.fallbackContent;
    document.getElementById('fallback-preview-image').src = f.image;
    document.getElementById('fallback-preview-type').textContent = f.contentType.toUpperCase();
    document.getElementById('fallback-preview-date').textContent = f.lastUpdated;

    document.getElementById('fallback-title').value = f.title;
    document.getElementById('fallback-desc').value = f.description;
    document.getElementById('fallback-image').value = f.image;
  }

  // 4.6 Categories CRUD
  function renderCategories() {
    const categories = KioskStore.getCategories() || [];
    const tbody = document.getElementById('categories-tbody');
    tbody.innerHTML = '';

    categories.forEach(c => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td style="font-size: 1.5rem;">${c.icon}</td>
          <td>${c.count || 0} Items</td>
          <td><span class="badge touch-badge">${c.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-secondary btn-view-category" data-id="${c.id}">View</button>
            <button class="btn btn-secondary btn-edit-category" data-id="${c.id}">Edit</button>
            <button class="btn btn-danger btn-delete-category" data-id="${c.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-category', showCategoryDetails);
    bindEvents('.btn-edit-category', editCategory);
    bindEvents('.btn-delete-category', deleteCategory);
  }

  // 4.7 Products CRUD
  function renderProducts() {
    const products = KioskStore.getProducts() || [];
    const categories = KioskStore.getCategories() || [];
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';

    const search = document.getElementById('product-search').value.toLowerCase();
    const cVal = document.getElementById('product-category-filter').value;

    const filterCatDropdown = document.getElementById('product-category-filter');
    if (filterCatDropdown.options.length === 1) {
      categories.forEach(c => {
        filterCatDropdown.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
      const mSelect = document.getElementById('product-category');
      mSelect.innerHTML = '';
      categories.forEach(c => {
        mSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }

    const filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search);
      const matchCat = cVal === 'all' || p.categoryId === cVal;
      return matchSearch && matchCat;
    });

    filtered.forEach(p => {
      const cat = categories.find(c => c.id === p.categoryId)?.name || p.categoryId;
      tbody.innerHTML += `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td><img src="${p.image}" class="thumbnail" alt="product"></td>
          <td><span class="badge desktop-badge">${cat}</span></td>
          <td><strong>$${p.price.toFixed(2)}</strong></td>
          <td><span class="badge ${p.available ? 'touch-badge' : 'danger-badge'}">${p.available ? 'Available' : 'Out of stock'}</span></td>
          <td><span class="badge touch-badge">${p.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-secondary btn-view-product" data-id="${p.id}">View</button>
            <button class="btn btn-secondary btn-edit-product" data-id="${p.id}">Edit</button>
            <button class="btn btn-danger btn-delete-product" data-id="${p.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-product', showProductDetails);
    bindEvents('.btn-edit-product', editProduct);
    bindEvents('.btn-delete-product', deleteProduct);
  }

  // 4.8 Customisations CRUD
  function renderModifiers() {
    const products = KioskStore.getProducts() || [];
    const tbody = document.getElementById('modifiers-tbody');
    tbody.innerHTML = '';

    let modifiers = KioskStore.get('kiosk_modifiers') || [];

    modifiers.forEach(m => {
      const linked = m.productIds.map(pid => products.find(p => p.id === pid)?.name || pid).join(', ');

      tbody.innerHTML += `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td><span class="badge desktop-badge">${m.type.toUpperCase()}</span></td>
          <td>+$${m.price.toFixed(2)}</td>
          <td>${m.required ? 'Mandatory' : 'Optional'}</td>
          <td style="font-size:0.8rem; max-width: 150px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${linked || 'None'}</td>
          <td><span class="badge touch-badge">${m.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-secondary btn-view-modifier" data-id="${m.id}">View</button>
            <button class="btn btn-secondary btn-edit-modifier" data-id="${m.id}">Edit</button>
            <button class="btn btn-danger btn-delete-modifier" data-id="${m.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-modifier', showModifierDetails);
    bindEvents('.btn-edit-modifier', editModifier);
    bindEvents('.btn-delete-modifier', deleteModifier);
  }

  // 4.9 Taxes CRUD
  function renderTaxes() {
    const taxes = KioskStore.getTaxes() || [];
    const tbody = document.getElementById('taxes-tbody');
    tbody.innerHTML = '';

    taxes.forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td>${t.percentage}%</td>
          <td><span class="badge touch-badge">${t.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-secondary btn-view-tax" data-id="${t.id}">View</button>
            <button class="btn btn-secondary btn-edit-tax" data-id="${t.id}">Edit</button>
            <button class="btn btn-danger btn-delete-tax" data-id="${t.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-tax', showTaxDetails);
    bindEvents('.btn-edit-tax', editTax);
    bindEvents('.btn-delete-tax', deleteTax);
  }

  // 4.10 Discounts CRUD
  function renderDiscounts() {
    const discounts = KioskStore.getDiscounts() || [];
    const tbody = document.getElementById('discounts-tbody');
    tbody.innerHTML = '';

    discounts.forEach(d => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td><span class="badge desktop-badge">${d.type.toUpperCase()}</span></td>
          <td>${d.type === 'percentage' ? d.value + '%' : '$' + d.value.toFixed(2)}</td>
          <td>${d.applicableProducts}</td>
          <td>${d.startDate}</td>
          <td>${d.endDate}</td>
          <td><span class="badge touch-badge">${d.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-secondary btn-view-discount" data-id="${d.id}">View</button>
            <button class="btn btn-secondary btn-edit-discount" data-id="${d.id}">Edit</button>
            <button class="btn btn-danger btn-delete-discount" data-id="${d.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-discount', showDiscountDetails);
    bindEvents('.btn-edit-discount', editDiscount);
    bindEvents('.btn-delete-discount', deleteDiscount);
  }

  // 4.11 Kiosks CRUD details
  function renderKiosks() {
    const kiosks = KioskStore.getKiosks() || [];
    const tbody = document.getElementById('kiosks-tbody');
    tbody.innerHTML = '';

    kiosks.forEach(k => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${k.name}</strong></td>
          <td><span style="font-family: monospace;">${k.id}</span></td>
          <td>${k.location || 'Lobby'}</td>
          <td><span class="badge ${k.availability === 'available' ? 'touch-badge' : 'warning-badge'}">${k.availability === 'available' ? 'Available' : 'Maintenance'}</span></td>
          <td><span class="badge touch-badge">${k.status.toUpperCase()}</span></td>
          <td>${k.lastActive}</td>
          <td>
            <button class="btn btn-secondary btn-view-kiosk" data-id="${k.id}">View</button>
            <button class="btn btn-secondary btn-edit-kiosk" data-id="${k.id}">Edit</button>
            <button class="btn btn-danger btn-delete-kiosk" data-id="${k.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-kiosk', showKioskDetails);
    bindEvents('.btn-edit-kiosk', editKiosk);
    bindEvents('.btn-delete-kiosk', deleteKiosk);
  }

  // 4.12 Kiosk Config settings
  function loadKioskConfigs() {
    const config = KioskStore.getConfig();
    if (!config) return;
    document.getElementById('set-kiosk-store-name').value = config.storeName;
    document.getElementById('set-inactivity-time').value = config.inactivityTimeout;
  }

  // 4.13 Payment configuration
  function renderPayments() {
    const payments = KioskStore.getPayments() || [];
    const grid = document.getElementById('payment-gateways-grid');
    grid.innerHTML = '';

    payments.forEach(p => {
      grid.innerHTML += `
        <div class="settings-card">
          <h3>${p.name}</h3>
          <p><strong>Config:</strong> ${p.configuration}</p>
          <p><strong>Status:</strong> <span class="badge ${p.status === 'enabled' ? 'touch-badge' : 'danger-badge'}">${p.status.toUpperCase()}</span></p>
          <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
            <button class="btn ${p.status === 'enabled' ? 'btn-danger' : 'btn-checkout'} btn-toggle-payment" data-id="${p.id}">
              ${p.status === 'enabled' ? 'Disable Method' : 'Enable Method'}
            </button>
          </div>
        </div>
      `;
    });

    bindEvents('.btn-toggle-payment', togglePaymentGateway);
  }

  // 4.14 Orders List details
  function renderOrders() {
    const orders = KioskStore.getOrders() || [];
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';

    const search = document.getElementById('order-search').value.toLowerCase();
    const statusVal = document.getElementById('order-filter-status').value;
    const kioskVal = document.getElementById('order-filter-kiosk').value;
    const payVal = document.getElementById('order-filter-pay').value;

    const kioskSelect = document.getElementById('order-filter-kiosk');
    if (kioskSelect.options.length === 1) {
      const kiosks = KioskStore.getKiosks() || [];
      kiosks.forEach(k => {
        kioskSelect.innerHTML += `<option value="${k.id}">${k.name}</option>`;
      });
    }

    const filtered = orders.filter(o => {
      const matchSearch = o.orderId.toLowerCase().includes(search) || o.customerInfo.name.toLowerCase().includes(search);
      const matchStatus = statusVal === 'all' || o.orderStatus === statusVal;
      const matchKiosk = kioskVal === 'all' || o.kioskId === kioskVal;
      const matchPay = payVal === 'all' || o.paymentStatus === payVal;
      return matchSearch && matchStatus && matchKiosk && matchPay;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">No orders mapped.</td></tr>';
      return;
    }

    filtered.forEach(o => {
      const date = new Date(o.dateTime).toLocaleString();
      const itemsText = o.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

      tbody.innerHTML += `
        <tr>
          <td><span style="font-family: monospace; font-size: 0.75rem;">${o.orderId.slice(0, 8)}</span></td>
          <td><strong>#${o.orderToken}</strong></td>
          <td>${o.kioskId}</td>
          <td><small>${date}</small></td>
          <td><strong>${o.customerInfo.name || 'Guest'}</strong></td>
          <td style="font-size: 0.8rem; max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${itemsText}</td>
          <td><strong>$${o.totalAmount.toFixed(2)}</strong></td>
          <td><span class="badge touch-badge">${o.paymentStatus.toUpperCase()}</span></td>
          <td><span class="badge desktop-badge">${o.orderStatus.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-secondary btn-view-order" data-id="${o.orderId}">View Details</button>
          </td>
        </tr>
      `;
    });

    bindEvents('.btn-view-order', showOrderDetails);
  }

  // 4.15 Devices Health monitoring
  function renderDevices() {
    const hw = KioskStore.getHardware();
    if (!hw) return;

    const fields = {
      touchscreen: document.getElementById('hw-touchscreen'),
      printer: document.getElementById('hw-printer'),
      qrDisplay: document.getElementById('hw-qr'),
      cardTerminal: document.getElementById('hw-card'),
      customerDisplay: document.getElementById('hw-display')
    };

    Object.keys(fields).forEach(k => {
      const el = fields[k];
      if (el) {
        const val = hw[k] || 'online';
        el.textContent = val.toUpperCase();
        el.className = `badge ${val === 'online' ? 'touch-badge' : 'danger-badge'}`;
      }
    });

    const container = document.getElementById('devices-live-screens');
    container.innerHTML = '';
    const kiosks = KioskStore.getKiosks() || [];
    const tvs = KioskStore.getTVs() || [];

    kiosks.forEach(k => {
      container.innerHTML += `
        <div class="device-row">
          <span>🖥️ Lobby Kiosk: ${k.name}</span>
          <span class="badge ${k.connectionStatus === 'online' ? 'touch-badge' : 'danger-badge'}">${k.connectionStatus.toUpperCase()}</span>
        </div>
      `;
    });

    tvs.forEach(t => {
      container.innerHTML += `
        <div class="device-row">
          <span>📺 Billboard TV: ${t.name}</span>
          <span class="badge ${t.connectionStatus === 'online' ? 'touch-badge' : 'danger-badge'}">${t.connectionStatus.toUpperCase()}</span>
        </div>
      `;
    });
  }


  // --- 5. EVENT BINDINGS AND MODAL CRUD HANDLERS ---

  function bindEvents(selector, callback) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        callback(btn.getAttribute('data-id'));
      });
    });
  }

  let confirmCallback = null;
  function triggerConfirm(title, body, executeCallback) {
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-body').textContent = body;
    confirmCallback = executeCallback;
    document.getElementById('confirm-modal').classList.add('visible');
  }

  document.getElementById('btn-confirm-execute').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    document.getElementById('confirm-modal').classList.remove('visible');
  });

  // PRESETS BANNERS LINKS
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('banner-image').value = btn.getAttribute('data-url');
    });
  });

  // CRUD actions for Banners
  document.getElementById('btn-add-banner').addEventListener('click', () => {
    document.getElementById('banner-form').reset();
    document.getElementById('banner-id').value = '';
    document.getElementById('banner-modal-title').textContent = 'Add Banner';
    document.getElementById('banner-start-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('banner-start-time').value = '08:00';
    document.getElementById('banner-end-date').value = new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0];
    document.getElementById('banner-end-time').value = '22:00';
    document.getElementById('banner-modal').classList.add('visible');
  });

  document.getElementById('banner-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveBannerData(false);
  });

  document.getElementById('btn-save-activate-banner').addEventListener('click', () => {
    saveBannerData(true);
  });

  function saveBannerData(activate = false) {
    const id = document.getElementById('banner-id').value;
    const title = document.getElementById('banner-title').value.trim();
    const image = document.getElementById('banner-image').value.trim();
    const duration = parseInt(document.getElementById('banner-duration').value) || 5;
    const priority = parseInt(document.getElementById('banner-priority').value) || 1;
    const startDate = document.getElementById('banner-start-date').value;
    const startTime = document.getElementById('banner-start-time').value;
    const endDate = document.getElementById('banner-end-date').value;
    const endTime = document.getElementById('banner-end-time').value;
    const contentType = document.getElementById('banner-content-type').value;

    const list = KioskStore.getBanners();
    if (id) {
      const b = list.find(item => item.id === id);
      if (b) {
        Object.assign(b, { title, image, duration, priority, startDate, startTime, endDate, endTime, contentType, active: activate ? true : b.active });
      }
    } else {
      list.push({ id: 'banner-' + Date.now(), title, image, duration, priority, startDate, startTime, endDate, endTime, contentType, active: activate, playlistId: 'play-default' });
    }

    KioskStore.setBanners(list);
    document.getElementById('banner-modal').classList.remove('visible');
    showToast(`Banner "${title}" saved successfully.`);
  }

  function editBanner(id) {
    const banners = KioskStore.getBanners();
    const b = banners.find(item => item.id === id);
    if (!b) return;

    document.getElementById('banner-id').value = b.id;
    document.getElementById('banner-title').value = b.title;
    document.getElementById('banner-image').value = b.image;
    document.getElementById('banner-duration').value = b.duration;
    document.getElementById('banner-priority').value = b.priority;
    document.getElementById('banner-start-date').value = b.startDate;
    document.getElementById('banner-start-time').value = b.startTime || '08:00';
    document.getElementById('banner-end-date').value = b.endDate;
    document.getElementById('banner-end-time').value = b.endTime || '22:00';
    document.getElementById('banner-content-type').value = b.contentType;

    document.getElementById('banner-modal-title').textContent = 'Edit Banner';
    document.getElementById('banner-modal').classList.add('visible');
  }

  function previewBanner(id) {
    const banners = KioskStore.getBanners();
    const b = banners.find(item => item.id === id);
    if (!b) return;

    document.getElementById('preview-modal-title').textContent = b.title;
    document.getElementById('preview-modal-image').src = b.image;
    document.getElementById('preview-modal-type').textContent = b.contentType.toUpperCase();
    document.getElementById('preview-modal-duration').textContent = b.duration;
    document.getElementById('preview-modal-priority').textContent = b.priority;
    document.getElementById('preview-modal-schedule').textContent = `${b.startDate} to ${b.endDate}`;
    document.getElementById('preview-modal-status').textContent = b.active ? 'ACTIVE PLAYBACK' : 'INACTIVE';

    document.getElementById('banner-preview-modal').classList.add('visible');
  }

  function deleteBanner(id) {
    triggerConfirm('Delete Banner', 'Are you sure you want to delete this promotional banner slide?', () => {
      const list = KioskStore.getBanners();
      KioskStore.setBanners(list.filter(b => b.id !== id));
      showToast('Banner deleted.');
    });
  }

  // Playlists add/edit
  document.getElementById('btn-add-playlist').addEventListener('click', () => {
    document.getElementById('playlist-form').reset();
    document.getElementById('playlist-id').value = '';
    document.getElementById('playlist-modal-title').textContent = 'Add Playlist';

    const banners = KioskStore.getBanners() || [];
    const checklist = document.getElementById('playlist-banners-checklist');
    checklist.innerHTML = '';
    banners.forEach(b => {
      checklist.innerHTML += `
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" name="pl-banners" value="${b.id}">
          ${b.title} (Priority ${b.priority})
        </label>
      `;
    });

    document.getElementById('playlist-modal').classList.add('visible');
  });

  document.getElementById('playlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('playlist-id').value;
    const name = document.getElementById('playlist-name').value.trim();

    const checked = document.querySelectorAll('input[name="pl-banners"]:checked');
    const bannerIds = Array.from(checked).map(c => c.value);

    const list = KioskStore.getPlaylists() || [];
    if (id) {
      const p = list.find(item => item.id === id);
      if (p) Object.assign(p, { name, bannerIds, updatedDate: new Date().toLocaleDateString() });
    } else {
      list.push({ id: 'play-' + Date.now(), name, bannerCount: bannerIds.length, bannerIds, assignedTVs: 'None', status: 'active', updatedDate: new Date().toLocaleDateString() });
    }

    KioskStore.setPlaylists(list);
    document.getElementById('playlist-modal').classList.remove('visible');
    showToast(`Playlist "${name}" saved.`);
  });

  function editPlaylist(id) {
    const playlists = KioskStore.getPlaylists();
    const p = playlists.find(item => item.id === id);
    if (!p) return;

    document.getElementById('playlist-id').value = p.id;
    document.getElementById('playlist-name').value = p.name;
    document.getElementById('playlist-modal-title').textContent = 'Edit Playlist';

    const banners = KioskStore.getBanners() || [];
    const checklist = document.getElementById('playlist-banners-checklist');
    checklist.innerHTML = '';
    banners.forEach(b => {
      const checked = p.bannerIds.includes(b.id) ? 'checked' : '';
      checklist.innerHTML += `
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" name="pl-banners" value="${b.id}" ${checked}>
          ${b.title} (Priority ${b.priority})
        </label>
      `;
    });

    document.getElementById('playlist-modal').classList.add('visible');
  }

  function simulatePlaylistSequence(id) {
    const playlists = KioskStore.getPlaylists();
    const p = playlists.find(item => item.id === id);
    if (!p || p.bannerIds.length === 0) {
      showToast('Cannot simulate empty playlist.', 'error');
      return;
    }

    const banners = KioskStore.getBanners() || [];
    const playlistBanners = p.bannerIds.map(bid => banners.find(b => b.id === bid)).filter(Boolean);

    if (playlistBanners.length === 0) {
      showToast('No active banners linked in this playlist.', 'error');
      return;
    }

    document.getElementById('playlist-preview-modal').classList.add('visible');
    const imageEl = document.getElementById('playlist-preview-image');
    const labelEl = document.getElementById('playlist-preview-label');

    let idx = 0;
    const playNext = () => {
      const banner = playlistBanners[idx];
      imageEl.style.opacity = 0;
      setTimeout(() => {
        imageEl.src = banner.image;
        imageEl.style.opacity = 1;
        labelEl.textContent = `${banner.title} (${banner.duration}s)`;
        idx = (idx + 1) % playlistBanners.length;
      }, 500);
    };

    playNext();
    clearInterval(window.playlistPreviewInterval);
    window.playlistPreviewInterval = setInterval(playNext, 3000);
  }

  function deletePlaylist(id) {
    triggerConfirm('Delete Playlist', 'Are you sure you want to delete this playlist?', () => {
      const pl = KioskStore.getPlaylists();
      KioskStore.setPlaylists(pl.filter(p => p.id !== id));
      showToast('Playlist deleted.');
    });
  }

  // TVs CRUD
  document.getElementById('btn-add-tv').addEventListener('click', () => {
    document.getElementById('tv-form').reset();
    document.getElementById('tv-id').value = '';
    document.getElementById('tv-modal-title').textContent = 'Add TV';

    const playlists = KioskStore.getPlaylists() || [];
    const select = document.getElementById('tv-playlist-select');
    select.innerHTML = '';
    playlists.forEach(pl => {
      select.innerHTML += `<option value="${pl.id}">${pl.name}</option>`;
    });

    document.getElementById('tv-modal').classList.add('visible');
  });

  document.getElementById('tv-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('tv-id').value;
    const name = document.getElementById('tv-name').value.trim();
    const loc = document.getElementById('tv-location').value.trim();
    const grp = document.getElementById('tv-group').value.trim();
    const plid = document.getElementById('tv-playlist-select').value;
    const status = document.getElementById('tv-status').value;

    const list = KioskStore.getTVs() || [];
    if (id) {
      const t = list.find(item => item.id === id);
      if (t) Object.assign(t, { name, location: loc, tvGroup: grp, assignedPlaylistId: plid, status });
    } else {
      list.push({ id: 'tv-' + Date.now().toString(36), name, location: loc, tvGroup: grp, assignedPlaylistId: plid, status, connectionStatus: 'online', lastActive: 'Just now' });
    }

    KioskStore.setTVs(list);
    document.getElementById('tv-modal').classList.remove('visible');
    showToast(`TV Screen "${name}" configured.`);
  });

  function editTV(id) {
    const tvs = KioskStore.getTVs();
    const t = tvs.find(item => item.id === id);
    if (!t) return;

    document.getElementById('tv-id').value = t.id;
    document.getElementById('tv-name').value = t.name;
    document.getElementById('tv-location').value = t.location || '';
    document.getElementById('tv-group').value = t.tvGroup || '';
    document.getElementById('tv-status').value = t.status;

    const playlists = KioskStore.getPlaylists() || [];
    const select = document.getElementById('tv-playlist-select');
    select.innerHTML = '';
    playlists.forEach(pl => {
      const sel = pl.id === t.assignedPlaylistId ? 'selected' : '';
      select.innerHTML += `<option value="${pl.id}" ${sel}>${pl.name}</option>`;
    });

    document.getElementById('tv-modal-title').textContent = 'Edit TV Settings';
    document.getElementById('tv-modal').classList.add('visible');
  }

  function deleteTV(id) {
    triggerConfirm('Remove TV', 'Delete TV configuration from mapped screens?', () => {
      const list = KioskStore.getTVs();
      KioskStore.setTVs(list.filter(t => t.id !== id));
      showToast('TV display unregistered.');
    });
  }

  // Fallback setup form
  document.getElementById('fallback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    triggerConfirm('Replace Fallback Content', 'This will immediately update fallback contents on mapped TV displays. Continue?', () => {
      const title = document.getElementById('fallback-title').value.trim();
      const description = document.getElementById('fallback-desc').value.trim();
      const image = document.getElementById('fallback-image').value.trim();

      const config = KioskStore.getConfig();
      config.fallbackContent = {
        title, description, image, contentType: 'image', status: 'active', lastUpdated: new Date().toLocaleDateString()
      };
      KioskStore.setConfig(config);
      showToast('Active Fallback Content replaced successfully.');
    });
  });

  document.getElementById('btn-preview-fallback').addEventListener('click', () => {
    const image = document.getElementById('fallback-image').value.trim();
    if (!image) {
      showToast('Please provide an image link first.', 'error');
      return;
    }
    document.getElementById('preview-modal-title').textContent = 'Fallback Preview';
    document.getElementById('preview-modal-image').src = image;
    document.getElementById('preview-modal-type').textContent = 'FALLBACK';
    document.getElementById('preview-modal-duration').textContent = '∞';
    document.getElementById('preview-modal-priority').textContent = 'N/A';
    document.getElementById('preview-modal-schedule').textContent = 'Unconditional Fallback';
    document.getElementById('preview-modal-status').textContent = 'DEFAULT STATE';

    document.getElementById('banner-preview-modal').classList.add('visible');
  });

  // Category forms
  document.getElementById('btn-add-category').addEventListener('click', () => {
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-modal-title').textContent = 'Add Category';
    document.getElementById('category-modal').classList.add('visible');
  });

  document.getElementById('category-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value.trim();
    const status = document.getElementById('category-status').value;

    const list = KioskStore.getCategories() || [];
    if (id) {
      const c = list.find(item => item.id === id);
      if (c) Object.assign(c, { name, icon, status });
    } else {
      list.push({ id: 'cat-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'), name, icon, status, count: 0 });
    }

    KioskStore.setCategories(list);
    document.getElementById('category-modal').classList.remove('visible');
    showToast(`Category "${name}" saved.`);
  });

  function editCategory(id) {
    const cats = KioskStore.getCategories();
    const c = cats.find(item => item.id === id);
    if (!c) return;

    document.getElementById('category-id').value = c.id;
    document.getElementById('category-name').value = c.name;
    document.getElementById('category-icon').value = c.icon;
    document.getElementById('category-status').value = c.status;

    document.getElementById('category-modal-title').textContent = 'Edit Category';
    document.getElementById('category-modal').classList.add('visible');
  }

  function deleteCategory(id) {
    triggerConfirm('Delete Category', 'Delete this product category? Products will remain in database.', () => {
      const list = KioskStore.getCategories();
      KioskStore.setCategories(list.filter(c => c.id !== id));
      showToast('Category deleted.');
    });
  }

  // Product Add/Edit
  document.getElementById('btn-add-product').addEventListener('click', () => {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Add Product';
    document.getElementById('product-modal').classList.add('visible');
  });

  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const categoryId = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value) || 0.01;
    const image = document.getElementById('product-image').value.trim();
    const description = document.getElementById('product-desc').value.trim();
    const status = document.getElementById('product-status').value;
    const available = document.getElementById('product-available').value === 'true';

    const list = KioskStore.getProducts() || [];
    if (id) {
      const p = list.find(item => item.id === id);
      if (p) Object.assign(p, { name, categoryId, price, image, description, status, available });
    } else {
      list.push({ id: 'prod-' + Date.now(), categoryId, name, description, price, image, available, status, customizable: false });
    }

    KioskStore.setProducts(list);
    document.getElementById('product-modal').classList.remove('visible');
    showToast(`Product "${name}" saved.`);
  });

  function editProduct(id) {
    const products = KioskStore.getProducts();
    const p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.name;
    document.getElementById('product-category').value = p.categoryId;
    document.getElementById('product-price').value = p.price;
    document.getElementById('product-image').value = p.image;
    document.getElementById('product-desc').value = p.description;
    document.getElementById('product-status').value = p.status;
    document.getElementById('product-available').value = p.available ? 'true' : 'false';

    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('product-modal').classList.add('visible');
  }

  function deleteProduct(id) {
    triggerConfirm('Delete Product', 'Remove this product item from database listings?', () => {
      const list = KioskStore.getProducts();
      KioskStore.setProducts(list.filter(p => p.id !== id));
      showToast('Product item deleted.');
    });
  }

  function showProductDetails(id) {
    const products = KioskStore.getProducts();
    const categories = KioskStore.getCategories() || [];
    const p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById('details-product-name').textContent = p.name;
    document.getElementById('details-product-image').src = p.image;
    document.getElementById('details-product-desc').textContent = p.description;
    document.getElementById('details-product-price').textContent = `$${p.price.toFixed(2)}`;
    document.getElementById('details-product-category').textContent = categories.find(c => c.id === p.categoryId)?.name || p.categoryId;
    document.getElementById('details-product-stock').textContent = p.available ? 'Available' : 'Out of stock';
    document.getElementById('details-product-status').textContent = p.status.toUpperCase();

    const modConfig = document.getElementById('details-product-customisation');
    modConfig.innerHTML = '';
    if (p.customizable) {
      modConfig.innerHTML += '<p style="color: var(--success); font-weight:bold; margin-bottom:0.5rem;">Modifiers Configurations</p>';
      if (p.variants) {
        p.variants.forEach(v => {
          modConfig.innerHTML += `<p><strong>Variants:</strong> ${v.name} (${v.options.map(o => `${o.name} +$${o.price.toFixed(2)}`).join(', ')})</p>`;
        });
      }
      if (p.addOns) {
        modConfig.innerHTML += `<p><strong>Add-ons:</strong> ${p.addOns.map(a => `${a.name} (+$${a.price.toFixed(2)})`).join(', ')}</p>`;
      }
    } else {
      modConfig.innerHTML = '<p>Standard catalog item. Modifiers disabled.</p>';
    }

    document.getElementById('product-details-drawer').classList.add('visible');
  }

  // Modifiers setup CRUD
  document.getElementById('btn-add-modifier').addEventListener('click', () => {
    document.getElementById('modifier-form').reset();
    document.getElementById('modifier-id').value = '';
    document.getElementById('modifier-modal-title').textContent = 'Add Modifier';

    const products = KioskStore.getProducts() || [];
    const container = document.getElementById('modifier-products-checklist');
    container.innerHTML = '';
    products.forEach(p => {
      container.innerHTML += `
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #fff; font-weight: normal;">
          <input type="checkbox" name="mod-prods" value="${p.id}">
          ${p.name}
        </label>
      `;
    });

    document.getElementById('modifier-modal').classList.add('visible');
  });

  document.getElementById('modifier-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modifier-id').value;
    const name = document.getElementById('modifier-name').value.trim();
    const type = document.getElementById('modifier-type').value;
    const price = parseFloat(document.getElementById('modifier-price').value) || 0;
    const required = document.getElementById('modifier-required').value === 'true';
    const status = document.getElementById('modifier-status').value;

    const checked = document.querySelectorAll('input[name="mod-prods"]:checked');
    const productIds = Array.from(checked).map(c => c.value);

    let modifiers = KioskStore.get('kiosk_modifiers') || [];
    if (id) {
      const m = modifiers.find(item => item.id === id);
      if (m) Object.assign(m, { name, type, price, required, productIds, status });
    } else {
      modifiers.push({ id: 'mod-' + Date.now(), name, type, price, required, productIds, status });
    }

    KioskStore.set('kiosk_modifiers', modifiers);
    document.getElementById('modifier-modal').classList.remove('visible');
    showToast(`Modifier option "${name}" saved.`);
    renderModifiers();
  });

  function editModifier(id) {
    const modifiers = KioskStore.get('kiosk_modifiers') || [];
    const m = modifiers.find(item => item.id === id);
    if (!m) return;

    document.getElementById('modifier-id').value = m.id;
    document.getElementById('modifier-name').value = m.name;
    document.getElementById('modifier-type').value = m.type;
    document.getElementById('modifier-price').value = m.price;
    document.getElementById('modifier-required').value = m.required ? 'true' : 'false';
    document.getElementById('modifier-status').value = m.status;

    const products = KioskStore.getProducts() || [];
    const container = document.getElementById('modifier-products-checklist');
    container.innerHTML = '';
    products.forEach(p => {
      const checked = m.productIds.includes(p.id) ? 'checked' : '';
      container.innerHTML += `
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #fff; font-weight: normal;">
          <input type="checkbox" name="mod-prods" value="${p.id}" ${checked}>
          ${p.name}
        </label>
      `;
    });

    document.getElementById('modifier-modal-title').textContent = 'Edit Modifier';
    document.getElementById('modifier-modal').classList.add('visible');
  }

  function deleteModifier(id) {
    triggerConfirm('Delete Modifier', 'Delete modifier configurations option?', () => {
      const list = KioskStore.get('kiosk_modifiers') || [];
      KioskStore.set('kiosk_modifiers', list.filter(m => m.id !== id));
      showToast('Modifier option removed.');
      renderModifiers();
    });
  }

  // Taxes
  document.getElementById('btn-add-tax').addEventListener('click', () => {
    document.getElementById('tax-form').reset();
    document.getElementById('tax-id').value = '';
    document.getElementById('tax-modal-title').textContent = 'Add Tax Profile';
    document.getElementById('tax-modal').classList.add('visible');
  });

  document.getElementById('tax-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('tax-id').value;
    const name = document.getElementById('tax-name').value.trim();
    const val = parseFloat(document.getElementById('tax-percentage').value) || 0;
    const status = document.getElementById('tax-status').value;

    const list = KioskStore.getTaxes() || [];
    if (id) {
      const t = list.find(item => item.id === id);
      if (t) Object.assign(t, { name, percentage: val, status });
    } else {
      list.push({ id: 'tax-' + Date.now(), name, percentage: val, status });
    }

    KioskStore.setTaxes(list);
    document.getElementById('tax-modal').classList.remove('visible');
    showToast(`Tax Profile "${name}" saved.`);
  });

  function editTax(id) {
    const list = KioskStore.getTaxes();
    const t = list.find(item => item.id === id);
    if (!t) return;

    document.getElementById('tax-id').value = t.id;
    document.getElementById('tax-name').value = t.name;
    document.getElementById('tax-percentage').value = t.percentage;
    document.getElementById('tax-status').value = t.status;

    document.getElementById('tax-modal-title').textContent = 'Edit Tax Profile';
    document.getElementById('tax-modal').classList.add('visible');
  }

  function deleteTax(id) {
    triggerConfirm('Delete Tax Profile', 'Delete this tax profile?', () => {
      const list = KioskStore.getTaxes();
      KioskStore.setTaxes(list.filter(t => t.id !== id));
      showToast('Tax profile removed.');
    });
  }

  // Discounts
  document.getElementById('btn-add-discount').addEventListener('click', () => {
    document.getElementById('discount-form').reset();
    document.getElementById('discount-id').value = '';
    document.getElementById('discount-modal-title').textContent = 'Add Discount';
    document.getElementById('discount-modal').classList.add('visible');
  });

  document.getElementById('discount-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('discount-id').value;
    const name = document.getElementById('discount-name').value.toUpperCase().trim();
    const type = document.getElementById('discount-type').value;
    const value = parseFloat(document.getElementById('discount-value').value) || 0;
    const products = document.getElementById('discount-products').value;
    const start = document.getElementById('discount-start').value;
    const end = document.getElementById('discount-end').value;
    const status = document.getElementById('discount-status').value;

    const list = KioskStore.getDiscounts() || [];
    if (id) {
      const d = list.find(item => item.id === id);
      if (d) Object.assign(d, { name, type, value, applicableProducts: products, startDate: start, endDate: end, status });
    } else {
      list.push({ id: 'disc-' + Date.now(), name, type, value, applicableProducts: products, startDate: start, endDate: end, status });
    }

    KioskStore.setDiscounts(list);
    document.getElementById('discount-modal').classList.remove('visible');
    showToast(`Promotion "${name}" saved.`);
  });

  function editDiscount(id) {
    const list = KioskStore.getDiscounts();
    const d = list.find(item => item.id === id);
    if (!d) return;

    document.getElementById('discount-id').value = d.id;
    document.getElementById('discount-name').value = d.name;
    document.getElementById('discount-type').value = d.type;
    document.getElementById('discount-value').value = d.value;
    document.getElementById('discount-products').value = d.applicableProducts;
    document.getElementById('discount-start').value = d.startDate;
    document.getElementById('discount-end').value = d.endDate;
    document.getElementById('discount-status').value = d.status;

    document.getElementById('discount-modal-title').textContent = 'Edit Discount';
    document.getElementById('discount-modal').classList.add('visible');
  }

  function deleteDiscount(id) {
    triggerConfirm('Delete Discount', 'Deletes discount campaign?', () => {
      const list = KioskStore.getDiscounts();
      KioskStore.setDiscounts(list.filter(d => d.id !== id));
      showToast('Discount campaign deleted.');
    });
  }

  // Kiosk Add/Edit/View
  document.getElementById('btn-add-kiosk').addEventListener('click', () => {
    document.getElementById('kiosk-form').reset();
    document.getElementById('kiosk-id').value = '';
    document.getElementById('kiosk-id-val').disabled = false;
    document.getElementById('kiosk-modal-title').textContent = 'Add Kiosk';
    document.getElementById('kiosk-modal').classList.add('visible');
  });

  document.getElementById('kiosk-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('kiosk-id').value;
    const idVal = document.getElementById('kiosk-id-val').value.trim();
    const name = document.getElementById('kiosk-name').value.trim();
    const loc = document.getElementById('kiosk-location').value.trim();
    const status = document.getElementById('kiosk-status').value;
    const avail = document.getElementById('kiosk-availability').value;

    const list = KioskStore.getKiosks() || [];
    if (id) {
      const k = list.find(item => item.id === id);
      if (k) Object.assign(k, { name, location: loc, status, availability: avail });
    } else {
      list.push({ id: idVal, name, location: loc, status, availability: avail, lastActive: 'Just now', connectionStatus: 'online' });
    }

    KioskStore.setKiosks(list);
    document.getElementById('kiosk-modal').classList.remove('visible');
    showToast(`Kiosk "${name}" saved.`);
  });

  function editKiosk(id) {
    const list = KioskStore.getKiosks();
    const k = list.find(item => item.id === id);
    if (!k) return;

    document.getElementById('kiosk-id').value = k.id;
    document.getElementById('kiosk-id-val').value = k.id;
    document.getElementById('kiosk-id-val').disabled = true;
    document.getElementById('kiosk-name').value = k.name;
    document.getElementById('kiosk-location').value = k.location || '';
    document.getElementById('kiosk-status').value = k.status;
    document.getElementById('kiosk-availability').value = k.availability;

    document.getElementById('kiosk-modal-title').textContent = 'Edit Kiosk';
    document.getElementById('kiosk-modal').classList.add('visible');
  }

  function deleteKiosk(id) {
    triggerConfirm('Delete Kiosk', 'Remove this kiosk terminal?', () => {
      const list = KioskStore.getKiosks();
      KioskStore.setKiosks(list.filter(k => k.id !== id));
      showToast('Kiosk terminal removed.');
    });
  }

  function showKioskDetails(id) {
    const list = KioskStore.getKiosks() || [];
    const k = list.find(item => item.id === id);
    if (!k) return;

    document.getElementById('details-kiosk-name').textContent = k.name;
    document.getElementById('details-kiosk-lbl').textContent = k.name;
    document.getElementById('details-kiosk-id').textContent = k.id;
    document.getElementById('details-kiosk-loc').textContent = k.location || 'Lobby';
    document.getElementById('details-kiosk-avail').textContent = k.availability === 'available' ? 'Available' : 'Maintenance';
    document.getElementById('details-kiosk-status').textContent = k.connectionStatus.toUpperCase();
    document.getElementById('details-kiosk-active').textContent = k.lastActive || 'Just now';

    // Hardware checklist
    const hwList = document.getElementById('details-kiosk-hardware-list');
    hwList.innerHTML = `
      <p><strong>Touchscreen Link:</strong> <span class="badge touch-badge">OK</span></p>
      <p><strong>Ticket Printer:</strong> <span class="badge touch-badge">OK</span></p>
      <p><strong>Card reader terminal:</strong> <span class="badge touch-badge">OK</span></p>
    `;

    // Populate order history
    const orders = KioskStore.getOrders() || [];
    const kioskOrders = orders.filter(o => o.kioskId === k.id);
    const container = document.getElementById('details-kiosk-orders');
    container.innerHTML = '';
    if (kioskOrders.length === 0) {
      container.innerHTML = '<p>No orders processed from this kiosk.</p>';
    } else {
      kioskOrders.slice(0, 3).forEach(o => {
        container.innerHTML += `
          <div style="padding:0.4rem; background:rgba(0,0,0,0.2); border-radius:4px; margin-bottom:0.4rem;">
            <strong>Token #${o.orderToken}</strong> - $${o.totalAmount.toFixed(2)}<br>
            <small style="color:var(--text-admin-muted)">Status: ${o.orderStatus}</small>
          </div>
        `;
      });
    }

    document.getElementById('kiosk-details-drawer').classList.add('visible');
  }

  // Save kiosk configs
  document.getElementById('btn-save-kiosk-config').addEventListener('click', () => {
    const config = KioskStore.getConfig();
    config.storeName = document.getElementById('set-kiosk-store-name').value.trim();
    config.inactivityTimeout = parseInt(document.getElementById('set-inactivity-time').value) || 30;
    KioskStore.setConfig(config);
    showToast('Kiosk configurations saved.');
  });

  // Enable/Disable gateway
  function togglePaymentGateway(id) {
    const list = KioskStore.getPayments() || [];
    const p = list.find(item => item.id === id);
    if (p) {
      p.status = p.status === 'enabled' ? 'disabled' : 'enabled';
      KioskStore.setPayments(list);
      showToast(`${p.name} configured as ${p.status}.`);
    }
  }

  // Order Details Drawer View
  function showOrderDetails(id) {
    const list = KioskStore.getOrders() || [];
    const o = list.find(item => item.orderId === id);
    if (!o) return;

    document.getElementById('details-order-id').textContent = o.orderId;
    document.getElementById('details-order-token').textContent = o.orderToken;
    document.getElementById('details-order-time').textContent = new Date(o.dateTime).toLocaleString();
    document.getElementById('details-order-kiosk').textContent = o.kioskId;
    
    document.getElementById('details-order-cust-name').textContent = o.customerInfo.name || 'Guest';
    document.getElementById('details-order-cust-mobile').textContent = o.customerInfo.mobile || 'None';

    const itemsBox = document.getElementById('details-order-items-list');
    itemsBox.innerHTML = '';
    o.items.forEach(i => {
      const mods = i.customizations.length > 0 ? ` (${i.customizations.join(', ')})` : '';
      itemsBox.innerHTML += `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
          <span>${i.quantity}x ${i.name}${mods}</span>
          <span>$${(i.unitPrice * i.quantity).toFixed(2)}</span>
        </div>
      `;
    });

    document.getElementById('details-order-subtotal').textContent = `$${o.subtotalAmount.toFixed(2)}`;
    document.getElementById('details-order-discount').textContent = `-$${(o.discountAmount || 0).toFixed(2)}`;
    document.getElementById('details-order-tax').textContent = `$${(o.taxAmount || 0).toFixed(2)}`;
    document.getElementById('details-order-total').textContent = `$${o.totalAmount.toFixed(2)}`;

    document.getElementById('details-order-payment').textContent = o.paymentStatus.toUpperCase();
    document.getElementById('details-order-prep').textContent = o.orderStatus.toUpperCase().replace('_', ' ');

    document.getElementById('order-details-drawer').classList.add('visible');
  }

  function showTVDetails(id) {
    const tvs = KioskStore.getTVs() || [];
    const playlists = KioskStore.getPlaylists() || [];
    const t = tvs.find(item => item.id === id);
    if (!t) return;

    const pl = playlists.find(p => p.id === t.assignedPlaylistId)?.name || 'None';
    document.getElementById('details-tv-name-header').textContent = t.name;
    document.getElementById('details-tv-name').textContent = t.name;
    document.getElementById('details-tv-id').textContent = t.id;
    document.getElementById('details-tv-loc').textContent = t.location || 'Counter';
    document.getElementById('details-tv-group').textContent = t.tvGroup || 'None';
    document.getElementById('details-tv-playlist').textContent = pl;
    document.getElementById('details-tv-status').textContent = t.status.toUpperCase();
    document.getElementById('details-tv-conn').textContent = t.connectionStatus.toUpperCase();
    document.getElementById('details-tv-active').textContent = t.lastActive;

    document.getElementById('tv-details-drawer').classList.add('visible');
  }

  function showCategoryDetails(id) {
    const cats = KioskStore.getCategories() || [];
    const products = KioskStore.getProducts() || [];
    const c = cats.find(item => item.id === id);
    if (!c) return;

    document.getElementById('details-cat-name-header').textContent = c.name;
    document.getElementById('details-cat-name').textContent = c.name;
    document.getElementById('details-cat-icon').textContent = c.icon;
    document.getElementById('details-cat-count').textContent = c.count || 0;
    document.getElementById('details-cat-status').textContent = c.status.toUpperCase();

    const related = products.filter(p => p.categoryId === c.id);
    const container = document.getElementById('details-cat-products-list');
    container.innerHTML = '<strong>Products in this category:</strong>';
    if (related.length === 0) {
      container.innerHTML += '<p>No products linked.</p>';
    } else {
      related.forEach(p => {
        container.innerHTML += `<div style="margin-top:0.25rem;">• ${p.name} ($${p.price.toFixed(2)})</div>`;
      });
    }

    document.getElementById('category-details-drawer').classList.add('visible');
  }

  function showModifierDetails(id) {
    const modifiers = KioskStore.get('kiosk_modifiers') || [];
    const products = KioskStore.getProducts() || [];
    const m = modifiers.find(item => item.id === id);
    if (!m) return;

    document.getElementById('details-mod-name-header').textContent = m.name;
    document.getElementById('details-mod-name').textContent = m.name;
    document.getElementById('details-mod-type').textContent = m.type.toUpperCase();
    document.getElementById('details-mod-price').textContent = `+$${m.price.toFixed(2)}`;
    document.getElementById('details-mod-required').textContent = m.required ? 'Mandatory' : 'Optional';

    const linked = m.productIds.map(pid => products.find(p => p.id === pid)?.name || pid);
    const container = document.getElementById('details-mod-products-list');
    container.innerHTML = '';
    if (linked.length === 0) {
      container.innerHTML = 'No products linked.';
    } else {
      linked.forEach(name => {
        container.innerHTML += `<div style="margin-top:0.25rem;">• ${name}</div>`;
      });
    }

    document.getElementById('modifier-details-drawer').classList.add('visible');
  }

  function showTaxDetails(id) {
    const taxes = KioskStore.getTaxes() || [];
    const t = taxes.find(item => item.id === id);
    if (!t) return;

    document.getElementById('details-tax-name-header').textContent = t.name;
    document.getElementById('details-tax-name').textContent = t.name;
    document.getElementById('details-tax-percentage').textContent = `${t.percentage}%`;
    document.getElementById('details-tax-status').textContent = t.status.toUpperCase();

    document.getElementById('tax-details-drawer').classList.add('visible');
  }

  function showDiscountDetails(id) {
    const discounts = KioskStore.getDiscounts() || [];
    const d = discounts.find(item => item.id === id);
    if (!d) return;

    document.getElementById('details-disc-name-header').textContent = d.name;
    document.getElementById('details-disc-name').textContent = d.name;
    document.getElementById('details-disc-type').textContent = d.type.toUpperCase();
    document.getElementById('details-disc-value').textContent = d.type === 'percentage' ? `${d.value}%` : `$${d.value.toFixed(2)}`;
    document.getElementById('details-disc-products').textContent = d.applicableProducts;
    document.getElementById('details-disc-start').textContent = d.startDate;
    document.getElementById('details-disc-end').textContent = d.endDate;
    document.getElementById('details-disc-status').textContent = d.status.toUpperCase();

    document.getElementById('discount-details-drawer').classList.add('visible');
  }

  function showRoleDetails() {
    document.getElementById('role-details-drawer').classList.add('visible');
  }

  // Bind key inputs filter render loops
  document.getElementById('banner-search').addEventListener('input', renderBanners);
  document.getElementById('banner-filter-status').addEventListener('change', renderBanners);
  document.getElementById('banner-filter-type').addEventListener('change', renderBanners);
  document.getElementById('banner-filter-playlist').addEventListener('change', renderBanners);

  document.getElementById('product-search').addEventListener('input', renderProducts);
  document.getElementById('product-category-filter').addEventListener('change', renderProducts);

  document.getElementById('order-search').addEventListener('input', renderOrders);
  document.getElementById('order-filter-status').addEventListener('change', renderOrders);
  document.getElementById('order-filter-kiosk').addEventListener('change', renderOrders);
  document.getElementById('order-filter-pay').addEventListener('change', renderOrders);


  // --- 6. SIMULATIONS LISTENERS ---

  const simElements = {
    networkOffline: document.getElementById('sim-network'),
    backendCrash: document.getElementById('sim-backend'),
    printerOffline: document.getElementById('sim-printer'),
    cardTerminalOffline: document.getElementById('sim-card-term'),
    bannerLoadFail: document.getElementById('sim-banner-fail')
  };

  Object.keys(simElements).forEach(k => {
    const el = simElements[k];
    if (el) {
      // Sync on load
      const failures = KioskStore.getFailures();
      el.checked = failures[k];

      el.addEventListener('change', () => {
        KioskStore.updateFailure(k, el.checked);
        showToast(`Simulation state updated.`);
      });
    }
  });


  function decorateDynamicIcons() {
    // 1. View actions
    document.querySelectorAll('.btn-view-banner, .btn-view-playlist, .btn-view-tv, .btn-view-category, .btn-view-product, .btn-view-modifier, .btn-view-tax, .btn-view-discount, .btn-view-kiosk, .btn-view-order, .btn-view-role').forEach(btn => {
      if (!btn.querySelector('.lucide')) {
        const text = btn.textContent.trim();
        btn.innerHTML = `<i data-lucide="eye"></i> <span>${text}</span>`;
      }
    });

    // 2. Edit actions
    document.querySelectorAll('.btn-edit-banner, .btn-edit-playlist, .btn-edit-tv, .btn-edit-category, .btn-edit-product, .btn-edit-modifier, .btn-edit-tax, .btn-edit-discount, .btn-edit-kiosk').forEach(btn => {
      if (!btn.querySelector('.lucide')) {
        const text = btn.textContent.trim();
        btn.innerHTML = `<i data-lucide="pencil"></i> <span>${text}</span>`;
      }
    });

    // 3. Delete actions
    document.querySelectorAll('.btn-delete-banner, .btn-delete-playlist, .btn-delete-tv, .btn-delete-category, .btn-delete-product, .btn-delete-modifier, .btn-delete-tax, .btn-delete-discount, .btn-delete-kiosk').forEach(btn => {
      if (!btn.querySelector('.lucide')) {
        const text = btn.textContent.trim();
        btn.innerHTML = `<i data-lucide="trash-2"></i> <span>${text}</span>`;
      }
    });

    // 4. Primary add action buttons
    document.querySelectorAll('.pane-header-row .btn-primary').forEach(btn => {
      if (!btn.querySelector('.lucide') && btn.id !== 'btn-preview-fallback') {
        const text = btn.textContent.trim().replace('+', '').trim();
        btn.innerHTML = `<i data-lucide="plus"></i> <span>${text}</span>`;
      }
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- 7. WORKSPACE REFRESH ---

  function refreshAll() {
    if (!isAuthenticated) return;
    renderDashboard();
    renderBanners();
    renderPlaylists();
    renderTVs();
    renderFallback();
    renderCategories();
    renderProducts();
    renderModifiers();
    renderTaxes();
    renderDiscounts();
    renderKiosks();
    renderPayments();
    renderOrders();
    renderDevices();

    decorateDynamicIcons();
  }

  // Subscribe state syncing
  KioskStore.subscribe((key, val) => {
    refreshAll();
    if (key === KioskStore.KEYS.CONFIG || key === 'reset') {
      loadKioskConfigs();
    }
  });

  // Delegated event for static role views
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-view-role')) {
      showRoleDetails();
    }
  });

  // Pre-load setups
  loadKioskConfigs();

})();
