(function() {
  // Authentication State
  let isAuthenticated = true;

  // Logout trigger
  document.getElementById('btn-auth-logout').addEventListener('click', () => {
    triggerConfirm('Logout', 'Are you sure you want to logout?', () => {
      sessionStorage.removeItem('kiosk_auth');
      window.location.href = 'index.html';
    }, { isDestructive: true, confirmText: 'Yes, Logout' });
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
    'tvs': { title: 'TVs', desc: 'Assign and map signage loop schedules.' },
    'fallback': { title: 'Default / Fallback Content', desc: 'Manage screens running when no schedule matches.' },
    'categories': { title: 'Categories', desc: 'Browse and edit catalog menu partitions.' },
    'products': { title: 'Products', desc: 'Manage products prices and menu listings.' },
    'customisation': { title: 'Customisation', desc: 'Configure product modifications and addon matrix.' },
    'taxes': { title: 'Taxes', desc: 'Manage VAT and local service cess tax configs.' },
    'discounts': { title: 'Discounts', desc: 'Configure promotional coupon campaigns.' },
    'kiosks': { title: 'Kiosks', desc: 'Register self-order customer terminals.' },
    'kiosk-config': { title: 'Kiosk Configuration', desc: 'Global settings profiles for kiosks.' },
    'payments': { title: 'Payment Configuration', desc: 'Manage UPI, Card, and Cash gateway settings.' },
    'payment-history': { title: 'Payment History', desc: 'Monitor payment transactions and order links.' },
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


  // --- 3. TOAST NOTIFICATIONS WRAPPER ---

  window.tableSorts = {
    banners: null,
    categories: null,
    products: null,
    orders: null,
    taxes: null,
    discounts: null,
    kiosks: null,
    payments: null,
    'payment-history': null,
    devices: null,
    roles: null
  };

  // Generic sort handler
  function handleTableSort(e) {
    const th = e.currentTarget;
    const thead = th.closest('thead');
    const type = thead.getAttribute('data-type');
    const field = th.getAttribute('data-field');
    
    if (!type || !field) return;
    
    let currentDir = 'asc';
    if (window.tableSorts[type] && window.tableSorts[type].field === field) {
      currentDir = window.tableSorts[type].dir === 'asc' ? 'desc' : 'asc';
    }
    
    window.tableSorts[type] = { field, dir: currentDir };
    
    // Reset all icons in this header
    thead.querySelectorAll('th').forEach(h => {
      const icon = h.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'arrow-up-down');
        icon.style.opacity = '0.5';
      }
    });
    
    // Set active icon
    const activeIcon = th.querySelector('i');
    if (activeIcon) {
      activeIcon.setAttribute('data-lucide', currentDir === 'asc' ? 'arrow-up' : 'arrow-down');
      activeIcon.style.opacity = '1';
      if (window.lucide) lucide.createIcons();
    }
    
    // Trigger re-render
    if (type === 'banners') renderBanners();
    if (type === 'categories') renderCategories();
    if (type === 'products') renderProducts();
    if (type === 'orders') renderOrders();
    if (type === 'taxes') renderTaxes();
    if (type === 'discounts') renderDiscounts();
    if (type === 'kiosks') renderKiosks();
    if (type === 'payments') renderPayments();
    if (type === 'payment-history') renderPaymentHistory();
    if (type === 'devices') renderDevices();
    if (type === 'roles') renderRoles();
  }

  function attachSortListeners() {
    document.querySelectorAll('.sortable-header th[data-field]').forEach(th => {
      th.addEventListener('click', handleTableSort);
    });
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="display: flex; align-items: center;"><i data-lucide="${type === 'success' ? 'check-circle' : 'alert-triangle'}" style="width: 16px; height: 16px;"></i></span>
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
    const onlineTvs = tvs.filter(t => t.connectionStatus === 'online').length;
    const onlineKiosks = kiosks.filter(k => k.connectionStatus === 'online' || k.connectionStatus === 'warning').length;

    // Set metrics
    document.getElementById('kpi-active-tvs').textContent = onlineTvs;
    document.getElementById('kpi-active-tvs-sub').textContent = `${onlineTvs} of ${tvs.length} TVs online`;

    document.getElementById('kpi-active-banners').textContent = activeBanners;
    document.getElementById('kpi-active-banners-sub').textContent = `3 scheduled today`;

    document.getElementById('kpi-active-kiosks').textContent = onlineKiosks;
    document.getElementById('kpi-active-kiosks-sub').textContent = `${onlineKiosks} of ${kiosks.length} kiosks online`;

    document.getElementById('kpi-orders-count').textContent = '126';
    document.getElementById('kpi-orders-sub').innerHTML = '<i data-lucide="trending-up" style="width: 12px; height: 12px;"></i> 12.4% from yesterday';

    // Destroy previous chart instances if they exist
    try {
      if (window.myOrdersOverviewChart) { window.myOrdersOverviewChart.destroy(); }
      if (window.myOrderStatusChart) { window.myOrderStatusChart.destroy(); }
      if (window.myDeviceStatusChart) { window.myDeviceStatusChart.destroy(); }

      if (window.Chart) {
        // 1. Orders Overview Line Chart
      const ctx1 = document.getElementById('chart-orders-overview').getContext('2d');
      window.myOrdersOverviewChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Orders',
            data: [18, 24, 21, 27, 19, 34, 29],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.05)',
            borderWidth: 2.5,
            pointBackgroundColor: '#4f46e5',
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: '#1f2937',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#374151',
              borderWidth: 1,
              callbacks: {
                label: function(context) { return ` ${context.raw} Orders`; }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#9ca3af', font: { size: 10 } }
            },
            y: {
              grid: { color: 'rgba(75, 85, 99, 0.15)' },
              ticks: { color: '#9ca3af', font: { size: 10 } }
            }
          }
        }
      });

      // 2. Order Status Donut Chart
      const ctx2 = document.getElementById('chart-order-status').getContext('2d');
      window.myOrderStatusChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Pending', 'Cancelled', 'Failed'],
          datasets: [{
            data: [82, 14, 8, 4],
            backgroundColor: ['#10b981', '#f59e0b', '#6b7280', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#e5e7eb',
                font: { size: 10 },
                padding: 10,
                boxWidth: 10
              }
            },
            tooltip: {
              backgroundColor: '#1f2937',
              callbacks: {
                label: function(context) { return ` ${context.label}: ${context.raw} orders`; }
              }
            }
          }
        }
      });

      // 3. Device Status Horizontal Bar Chart
      const ctx3 = document.getElementById('chart-device-status').getContext('2d');
      window.myDeviceStatusChart = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['TVs', 'Kiosks'],
          datasets: [
            {
              label: 'Online',
              data: [
                tvs.filter(t => t.connectionStatus === 'online').length,
                kiosks.filter(k => k.connectionStatus === 'online').length
              ],
              backgroundColor: '#10b981',
              barThickness: 12
            },
            {
              label: 'Warning',
              data: [
                0,
                kiosks.filter(k => k.connectionStatus === 'warning').length
              ],
              backgroundColor: '#f59e0b',
              barThickness: 12
            },
            {
              label: 'Offline',
              data: [
                tvs.filter(t => t.connectionStatus === 'offline').length,
                kiosks.filter(k => k.connectionStatus === 'offline').length
              ],
              backgroundColor: '#ef4444',
              barThickness: 12
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#e5e7eb',
                font: { size: 10 },
                boxWidth: 8
              }
            },
            tooltip: {
              backgroundColor: '#1f2937'
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { color: '#9ca3af', font: { size: 10 } }
            },
            y: {
              stacked: true,
              grid: { display: false },
              ticks: { color: '#9ca3af', font: { size: 10 } }
            }
          }
        }
      });
      }
    } catch (chartErr) {
      console.error('Error rendering charts:', chartErr);
    }

    // Render TV status table
    const tvTbody = document.getElementById('dash-tv-tbody');
    tvTbody.innerHTML = '';
    tvs.forEach(t => {
      const pl = KioskStore.getPlaylists().find(p => p.id === t.assignedPlaylistId)?.name || 'None';
      const statusClass = t.connectionStatus === 'online' ? 'touch-badge' : 'danger-badge';
      const statusText = t.connectionStatus === 'online' ? 'Online' : 'Offline';
      tvTbody.innerHTML += `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td>${t.location || 'Foyer'}</td>
          <td><span class="badge desktop-badge">${pl}</span></td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    });

    // Render Kiosk status table
    const kioskTbody = document.getElementById('dash-kiosk-tbody');
    kioskTbody.innerHTML = '';
    kiosks.forEach(k => {
      let statusClass = 'touch-badge';
      let statusText = 'Online';
      if (k.connectionStatus === 'warning') {
        statusClass = 'warning-badge';
        statusText = 'Warning';
      } else if (k.connectionStatus === 'offline') {
        statusClass = 'danger-badge';
        statusText = 'Offline';
      }
      kioskTbody.innerHTML += `
        <tr>
          <td><strong>${k.id}</strong></td>
          <td>${k.location || 'Lobby'}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
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
        let payClass = 'touch-badge';
        let payText = 'Successful';
        if (o.paymentStatus === 'pending') {
          payClass = 'warning-badge';
          payText = 'Pending';
        } else if (o.paymentStatus === 'failed') {
          payClass = 'danger-badge';
          payText = 'Failed';
        }

        let orderClass = 'desktop-badge';
        let orderText = 'Completed';
        if (o.orderStatus === 'created') {
          orderClass = 'warning-badge';
          orderText = 'Created';
        } else if (o.orderStatus === 'cancelled') {
          orderClass = 'danger-badge';
          orderText = 'Cancelled';
        }

        ordersTbody.innerHTML += `
          <tr>
            <td><strong>${o.orderId}</strong></td>
            <td>${o.kioskId}</td>
            <td><strong>Γé╣${o.totalAmount.toFixed(2)}</strong></td>
            <td><span class="badge ${payClass}">${payText}</span></td>
            <td><span class="badge ${orderClass}">${orderText}</span></td>
          </tr>
        `;
      });
    }

    // Render System Alerts
    const alertsList = document.getElementById('dashboard-alerts-list');
    if (alertsList) {
      alertsList.innerHTML = `
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.5rem 0; border-bottom: 1px dashed var(--border-admin);">
          <i data-lucide="triangle-alert" style="width: 16px; height: 16px; color: var(--danger); flex-shrink: 0; margin-top: 0.25rem;"></i>
          <div>
            <strong style="font-size: 0.85rem; color: var(--text-admin-main);">TV-004 Offline</strong>
            <p style="font-size: 0.75rem; color: var(--text-admin-muted); margin: 0.15rem 0 0 0;">Display connection lost 12 minutes ago.</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.5rem 0; border-bottom: 1px dashed var(--border-admin);">
          <i data-lucide="alert-circle" style="width: 16px; height: 16px; color: var(--warning); flex-shrink: 0; margin-top: 0.25rem;"></i>
          <div>
            <strong style="font-size: 0.85rem; color: var(--text-admin-main);">Kiosk-004 Warning</strong>
            <p style="font-size: 0.75rem; color: var(--text-admin-muted); margin: 0.15rem 0 0 0;">Printer requires attention.</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.5rem 0;">
          <i data-lucide="bell" style="width: 16px; height: 16px; color: var(--warning); flex-shrink: 0; margin-top: 0.25rem;"></i>
          <div>
            <strong style="font-size: 0.85rem; color: var(--text-admin-main);">Banner Expiring</strong>
            <p style="font-size: 0.75rem; color: var(--text-admin-muted); margin: 0.15rem 0 0 0;">"Weekend Special" expires today at 11:00 PM.</p>
          </div>
        </div>
      `;
    }

    // Render Recent Activity
    const activityList = document.getElementById('dashboard-activity-list');
    if (activityList) {
      activityList.innerHTML = `
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.5rem 0; border-bottom: 1px dashed var(--border-admin);">
          <i data-lucide="refresh-cw" style="width: 16px; height: 16px; color: var(--primary); flex-shrink: 0; margin-top: 0.25rem;"></i>
          <div>
            <strong style="font-size: 0.85rem; color: var(--text-admin-main);">Banner updated</strong>
            <p style="font-size: 0.75rem; color: var(--text-admin-muted); margin: 0.15rem 0 0 0;">Summer Offer was updated by Admin &bull; 8 minutes ago</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.5rem 0; border-bottom: 1px dashed var(--border-admin);">
          <i data-lucide="link" style="width: 16px; height: 16px; color: var(--primary); flex-shrink: 0; margin-top: 0.25rem;"></i>
          <div>
            <strong style="font-size: 0.85rem; color: var(--text-admin-main);">Playlist assigned</strong>
            <p style="font-size: 0.75rem; color: var(--text-admin-muted); margin: 0.15rem 0 0 0;">Weekend Playlist assigned to TV-002 &bull; 22 minutes ago</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.5rem 0; border-bottom: 1px dashed var(--border-admin);">
          <i data-lucide="settings" style="width: 16px; height: 16px; color: var(--primary); flex-shrink: 0; margin-top: 0.25rem;"></i>
          <div>
            <strong style="font-size: 0.85rem; color: var(--text-admin-main);">Kiosk updated</strong>
            <p style="font-size: 0.75rem; color: var(--text-admin-muted); margin: 0.15rem 0 0 0;">Kiosk-004 configuration updated &bull; 45 minutes ago</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.5rem 0;">
          <i data-lucide="check-circle" style="width: 16px; height: 16px; color: var(--green); flex-shrink: 0; margin-top: 0.25rem;"></i>
          <div>
            <strong style="font-size: 0.85rem; color: var(--text-admin-main);">Order completed</strong>
            <p style="font-size: 0.75rem; color: var(--text-admin-muted); margin: 0.15rem 0 0 0;">ORD-1026 completed &bull; 1 hour ago</p>
          </div>
        </div>
      `;
    }

    // Set up click listeners for the view details dashboard anchors
    document.querySelectorAll('.btn-dashboard-nav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.getAttribute('data-tab');
        const sidebarItem = document.querySelector(`.nav-item[data-tab="${targetTab}"]`);
        if (sidebarItem) {
          sidebarItem.click();
        }
      });
    });
  }

  // --- FILTER SYSTEM STATE AND DRAWERS ---
  const activeFilters = {};
  let activeFilterTab = 'banners';

  // Toggle filter drawer
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-filter-toggle');
    if (btn) {
      const tab = btn.getAttribute('data-tab');
      openFilterDrawer(tab);
    }
  });

  function openFilterDrawer(tab) {
    activeFilterTab = tab;
    const body = document.getElementById('filter-drawer-body');
    body.innerHTML = '';

    if (!activeFilters[tab]) {
      activeFilters[tab] = { status: [], type: [], playlist: [], priority: [], location: [], category: [], availability: [], paymentStatus: [], orderStatus: [], kiosk: [], startDate: '', endDate: '' };
    }
    const current = activeFilters[tab];

    if (tab === 'banners') {
      const banners = KioskStore.getBanners() || [];
      const playlists = KioskStore.getPlaylists() || [];
      body.innerHTML += `
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Status</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('status', 'active', 'Active', banners.filter(b => b.active).length, current.status)}
          ${renderCheckboxOption('status', 'inactive', 'Inactive', banners.filter(b => !b.active).length, current.status)}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Content Type</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('type', 'image', 'Image', banners.filter(b => b.contentType === 'image').length, current.type)}
          ${renderCheckboxOption('type', 'video', 'Video', banners.filter(b => b.contentType === 'video').length, current.type)}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Playlist</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${playlists.map(pl => renderCheckboxOption('playlist', pl.id, pl.name, banners.filter(b => b.playlistId === pl.id).length, current.playlist)).join('')}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Priority</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('priority', '1', 'Priority 1', banners.filter(b => b.priority === 1).length, current.priority)}
          ${renderCheckboxOption('priority', '2', 'Priority 2', banners.filter(b => b.priority === 2).length, current.priority)}
          ${renderCheckboxOption('priority', '3', 'Priority 3', banners.filter(b => b.priority === 3).length, current.priority)}
        </div>
      `;
    } else if (tab === 'playlists') {
      const playlists = KioskStore.getPlaylists() || [];
      body.innerHTML += `
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Status</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('status', 'active', 'Active', playlists.filter(p => p.status === 'active').length, current.status)}
          ${renderCheckboxOption('status', 'inactive', 'Inactive', playlists.filter(p => p.status === 'inactive').length, current.status)}
        </div>
      `;
    } else if (tab === 'tvs') {
      const tvs = KioskStore.getTVs() || [];
      const playlists = KioskStore.getPlaylists() || [];
      const locations = Array.from(new Set(tvs.map(t => t.location).filter(Boolean)));
      body.innerHTML += `
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Status</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('status', 'active', 'Active', tvs.filter(t => t.status === 'active').length, current.status)}
          ${renderCheckboxOption('status', 'inactive', 'Inactive', tvs.filter(t => t.status === 'inactive').length, current.status)}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Connection Status</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('type', 'online', 'Online', tvs.filter(t => t.connectionStatus === 'online').length, current.type)}
          ${renderCheckboxOption('type', 'offline', 'Offline', tvs.filter(t => t.connectionStatus === 'offline').length, current.type)}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Playlist</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${playlists.map(pl => renderCheckboxOption('playlist', pl.id, pl.name, tvs.filter(t => t.assignedPlaylistId === pl.id).length, current.playlist)).join('')}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Location</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${locations.map(loc => renderCheckboxOption('location', loc, loc, tvs.filter(t => t.location === loc).length, current.location)).join('')}
        </div>
      `;
    } else if (tab === 'payment-history') {
      const orders = KioskStore.getOrders() || [];
      const kiosks = Array.from(new Set(orders.map(o => o.kioskId).filter(Boolean)));
      const methods = Array.from(new Set(orders.map(o => o.paymentMethod).filter(Boolean)));
      body.innerHTML += `
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Payment Status</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('paymentStatus', 'success', 'Successful', orders.filter(o => o.paymentStatus === 'success').length, current.paymentStatus)}
          ${renderCheckboxOption('paymentStatus', 'pending', 'Pending', orders.filter(o => o.paymentStatus === 'pending').length, current.paymentStatus)}
          ${renderCheckboxOption('paymentStatus', 'failed', 'Failed', orders.filter(o => o.paymentStatus === 'failed').length, current.paymentStatus)}
          ${renderCheckboxOption('paymentStatus', 'cancelled', 'Cancelled', orders.filter(o => o.paymentStatus === 'cancelled').length, current.paymentStatus)}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Payment Method</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${methods.map(m => renderCheckboxOption('paymentMethod', m, m, orders.filter(o => o.paymentMethod === m).length, current.paymentMethod)).join('')}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Kiosk</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${kiosks.map(k => renderCheckboxOption('kiosk', k, k, orders.filter(o => o.kioskId === k).length, current.kiosk)).join('')}
        </div>
        <h4 class="form-section-title" style="color: var(--text-admin-main); margin-bottom: 0.5rem;">Order Status</h4>
        <div class="filter-group" style="margin-bottom: 1.25rem;">
          ${renderCheckboxOption('orderStatus', 'completed', 'Completed', orders.filter(o => o.orderStatus === 'completed').length, current.orderStatus)}
          ${renderCheckboxOption('orderStatus', 'created', 'Created', orders.filter(o => o.orderStatus === 'created').length, current.orderStatus)}
          ${renderCheckboxOption('orderStatus', 'cancelled', 'Cancelled', orders.filter(o => o.orderStatus === 'cancelled').length, current.orderStatus)}
        </div>
      `;
    }

    if (window.lucide) { lucide.createIcons(); }
    document.getElementById('filter-drawer-modal').classList.add('visible');
  }

  function renderCheckboxOption(groupName, value, label, count, activeList) {
    const isChecked = activeList.includes(value) ? 'checked' : '';
    return `
      <label style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; cursor: pointer; color: var(--text-admin-main); font-weight: normal; margin-bottom: 0.5rem;">
        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" name="filter-${groupName}" value="${value}" ${isChecked} style="cursor: pointer;">
          ${label}
        </span>
        <span style="font-size: 0.75rem; color: var(--text-admin-muted);">${count || 0}</span>
      </label>
    `;
  }

  // Clear filters
  document.getElementById('btn-filter-clear-all').addEventListener('click', () => {
    const tab = activeFilterTab;
    activeFilters[tab] = { status: [], type: [], playlist: [], priority: [], location: [], category: [], availability: [], paymentStatus: [], orderStatus: [], kiosk: [], startDate: '', endDate: '' };
    document.querySelectorAll('#filter-drawer-body input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('filter-drawer-modal').classList.remove('visible');
    updateFilterChips(tab);
    refreshActiveTabList(tab);
  });

  // Apply filters
  document.getElementById('btn-filter-apply').addEventListener('click', () => {
    const tab = activeFilterTab;
    const current = activeFilters[tab];

    const getChecked = (name) => Array.from(document.querySelectorAll(`input[name="filter-${name}"]:checked`)).map(c => c.value);
    current.status = getChecked('status');
    current.type = getChecked('type');
    current.playlist = getChecked('playlist');
    current.priority = getChecked('priority');
    current.location = getChecked('location');
    current.paymentStatus = getChecked('paymentStatus');
    current.paymentMethod = getChecked('paymentMethod');
    current.kiosk = getChecked('kiosk');
    current.orderStatus = getChecked('orderStatus');

    document.getElementById('filter-drawer-modal').classList.remove('visible');
    updateFilterChips(tab);
    refreshActiveTabList(tab);
  });

  function updateFilterChips(tab) {
    const container = document.getElementById(`${tab}-filter-chips`);
    if (!container) return;
    container.innerHTML = '';

    const current = activeFilters[tab] || { status: [], type: [], playlist: [], priority: [], location: [], paymentStatus: [], paymentMethod: [], kiosk: [], orderStatus: [] };
    let totalCount = 0;

    const renderChip = (group, value, label) => {
      totalCount++;
      container.innerHTML += `
        <span class="badge desktop-badge" style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; padding: 0.25rem 0.5rem; background-color: var(--border-admin); color: var(--text-admin);">
          ${group}: ${label}
          <i data-lucide="x" class="remove-chip" data-tab="${tab}" data-group="${group.toLowerCase()}" data-value="${value}" style="width: 12px; height: 12px; cursor: pointer;"></i>
        </span>
      `;
    };

    if (current.status) current.status.forEach(val => renderChip('Status', val, val.charAt(0).toUpperCase() + val.slice(1)));
    if (current.type) current.type.forEach(val => renderChip('Type', val, val.charAt(0).toUpperCase() + val.slice(1)));
    if (current.playlist) {
      current.playlist.forEach(val => {
        const pl = KioskStore.getPlaylists().find(p => p.id === val);
        renderChip('Playlist', val, pl ? pl.name : val);
      });
    }
    if (current.priority) current.priority.forEach(val => renderChip('Priority', val, `P${val}`));
    if (current.location) current.location.forEach(val => renderChip('Location', val, val));

    if (tab === 'payment-history') {
      if (current.paymentStatus) current.paymentStatus.forEach(val => renderChip('PaymentStatus', val, val.charAt(0).toUpperCase() + val.slice(1)));
      if (current.paymentMethod) current.paymentMethod.forEach(val => renderChip('PaymentMethod', val, val));
      if (current.kiosk) current.kiosk.forEach(val => renderChip('Kiosk', val, val));
      if (current.orderStatus) current.orderStatus.forEach(val => renderChip('OrderStatus', val, val.charAt(0).toUpperCase() + val.slice(1)));
    }

    if (totalCount > 0) {
      container.innerHTML += `
        <button class="btn-clear-chips" data-tab="${tab}" style="background: transparent; border: none; color: var(--danger); font-size: 0.75rem; font-weight: 600; cursor: pointer;">Clear All</button>
      `;
    }

    const btn = document.querySelector(`.btn-filter-toggle[data-tab="${tab}"]`);
    if (btn) {
      const badge = btn.querySelector('.filter-count');
      if (badge) {
        if (totalCount > 0) {
          badge.textContent = totalCount;
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }
      }
    }
    if (window.lucide) { lucide.createIcons(); }
  }

  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.remove-chip');
    if (chip) {
      const tab = chip.getAttribute('data-tab');
      const group = chip.getAttribute('data-group');
      const val = chip.getAttribute('data-value');
      const current = activeFilters[tab];

      if (group === 'status') current.status = current.status.filter(v => v !== val);
      if (group === 'type') current.type = current.type.filter(v => v !== val);
      if (group === 'playlist') current.playlist = current.playlist.filter(v => v !== val);
      if (group === 'priority') current.priority = current.priority.filter(v => v !== val);
      if (group === 'location') current.location = current.location.filter(v => v !== val);
      if (group === 'paymentstatus') current.paymentStatus = current.paymentStatus.filter(v => v !== val);
      if (group === 'paymentmethod') current.paymentMethod = current.paymentMethod.filter(v => v !== val);
      if (group === 'kiosk') current.kiosk = current.kiosk.filter(v => v !== val);
      if (group === 'orderstatus') current.orderStatus = current.orderStatus.filter(v => v !== val);

      updateFilterChips(tab);
      refreshActiveTabList(tab);
    }

    const clearAll = e.target.closest('.btn-clear-chips');
    if (clearAll) {
      const tab = clearAll.getAttribute('data-tab');
      activeFilters[tab] = { status: [], type: [], playlist: [], priority: [], location: [], category: [], availability: [], paymentStatus: [], orderStatus: [], kiosk: [], startDate: '', endDate: '' };
      updateFilterChips(tab);
      refreshActiveTabList(tab);
    }
  });

  function refreshActiveTabList(tab) {
    if (tab === 'banners') renderBanners();
    if (tab === 'playlists') renderPlaylists();
    if (tab === 'tvs') renderTVs();
    if (tab === 'categories') renderCategories();
    if (tab === 'products') renderProducts();
    if (tab === 'customisation') renderModifiers();
    if (tab === 'taxes') renderTaxes();
    if (tab === 'discounts') renderDiscounts();
    if (tab === 'kiosks') renderKiosks();
    if (tab === 'payments') renderPayments();
    if (tab === 'payment-history') renderPaymentHistory();
    if (tab === 'orders') renderOrders();
    if (tab === 'devices') renderDevices();
    if (tab === 'roles') renderRoles();
  }


  // 4.2 Banners CRUD
  let bannerPage = 1;
  let bannerPageSize = 10;

  function formatDatePretty(dateStr, timeStr) {
    if (!dateStr) return 'ΓÇö';
    const d = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
    if (isNaN(d)) return dateStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const time = timeStr || '';
    return time ? `${day} ${month} ${year}, ${time}` : `${day} ${month} ${year}`;
  }

  function renderBanners() {
    const banners = KioskStore.getBanners() || [];
    const tbody = document.getElementById('banners-tbody');
    const paginationEl = document.getElementById('banners-pagination');
    tbody.innerHTML = '';

    const search = document.getElementById('banner-search').value.toLowerCase();
    const current = activeFilters.banners || { status: [], type: [], playlist: [], priority: [] };

    const filtered = banners.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(search);
      let matchStatus = true;
      if (current.status.length > 0) {
        matchStatus = false;
        if (current.status.includes('active') && b.active) matchStatus = true;
        if (current.status.includes('inactive') && !b.active) matchStatus = true;
      }
      let matchType = true;
      if (current.type.length > 0) {
        matchType = current.type.includes(b.contentType);
      }
      let matchPlaylist = true;
      if (current.playlist.length > 0) {
        matchPlaylist = current.playlist.includes(b.playlistId);
      }
      let matchPriority = true;
      if (current.priority.length > 0) {
        matchPriority = current.priority.includes(b.priority.toString());
      }
      return matchSearch && matchStatus && matchType && matchPlaylist && matchPriority;
    });

    if (window.tableSorts && window.tableSorts.banners) {
      const { field, dir } = window.tableSorts.banners;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / bannerPageSize));
    if (bannerPage > totalPages) bannerPage = totalPages;
    const startIdx = (bannerPage - 1) * bannerPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + bannerPageSize);

    // Empty states
    if (totalItems === 0) {
      const hasSearch = search.length > 0;
      const hasFilters = current.status.length > 0 || current.type.length > 0 || current.playlist.length > 0 || current.priority.length > 0;
      let emptyHtml = '';
      if (hasSearch) {
        emptyHtml = `<tr><td colspan="8"><div class="table-empty-state"><i data-lucide="search" class="empty-icon"></i><h4>No banners match your search</h4><p>Try a different search term.</p><button class="btn btn-secondary" onclick="document.getElementById('banner-search').value='';document.getElementById('banner-search').dispatchEvent(new Event('input'));">Clear Search</button></div></td></tr>`;
      } else if (hasFilters) {
        emptyHtml = `<tr><td colspan="8"><div class="table-empty-state"><i data-lucide="filter-x" class="empty-icon"></i><h4>No banners match the selected filters</h4><p>Adjust your filters or clear them.</p><button class="btn btn-secondary" onclick="activeFilters.banners={status:[],type:[],playlist:[],priority:[]};updateFilterChips('banners');renderBanners();">Clear Filters</button></div></td></tr>`;
      } else {
        emptyHtml = `<tr><td colspan="8"><div class="table-empty-state"><i data-lucide="image" class="empty-icon"></i><h4>No banners found</h4><p>Create your first promotional banner.</p><button class="btn btn-primary" onclick="document.getElementById('btn-add-banner').click();">Create Banner</button></div></td></tr>`;
      }
      tbody.innerHTML = emptyHtml;
      paginationEl.innerHTML = '';
      if (window.lucide) lucide.createIcons();
      return;
    }

    pageItems.forEach(b => {
      const startFormatted = formatDatePretty(b.startDate, b.startTime);
      const endFormatted = formatDatePretty(b.endDate, b.endTime);
      const isActive = b.active;
      const statusBadge = isActive
        ? '<span class="badge touch-badge">Active</span>'
        : '<span class="badge danger-badge">Inactive</span>';

      tbody.innerHTML += `
        <tr>
          <td>
            <strong style="display:block;line-height:1.3;">${b.title}</strong>
            <small style="color: var(--text-admin-muted); font-size: 0.7rem;">Promotional Banner</small>
          </td>
          <td>
            <img src="${b.image}" style="width: 64px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-admin); display: block;"
              alt="${b.title}" onerror="this.outerHTML='<div class=\\'thumb-placeholder\\'><i data-lucide=\\'image\\' style=\\'width:18px;height:18px;\\'></i></div>'">
          </td>
          <td><span class="badge desktop-badge">${b.contentType.toUpperCase()}</span></td>
          <td>
            <small style="display:block;line-height:1.5;white-space:nowrap;">${startFormatted}<br><span style="color:var(--text-admin-muted);">to</span><br>${endFormatted}</small>
          </td>
          <td>${b.duration} sec</td>
          <td>P${b.priority}</td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              ${statusBadge}
              <label class="status-switch" title="${isActive ? 'Deactivate' : 'Activate'}">
                <input type="checkbox" class="banner-status-toggle" data-id="${b.id}" ${isActive ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 0.25rem; align-items: center; justify-content: flex-end;">
              <button class="btn-action btn-view-banner" data-id="${b.id}" title="View Details">
                <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-edit-banner" data-id="${b.id}" title="Edit">
                <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-action-danger btn-delete-banner" data-id="${b.id}" title="Delete">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    // Pagination
    const showFrom = startIdx + 1;
    const showTo = Math.min(startIdx + bannerPageSize, totalItems);
    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<button class="page-btn ${i === bannerPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationEl.innerHTML = `
      <div class="pagination-info">
        Showing <strong>${showFrom}ΓÇô${showTo}</strong> of <strong>${totalItems}</strong> banners
        <span style="margin-left: 0.75rem; color: var(--text-admin-muted);">Rows per page</span>
        <select class="page-size-select" id="banner-page-size-select">
          <option value="10" ${bannerPageSize === 10 ? 'selected' : ''}>10</option>
          <option value="20" ${bannerPageSize === 20 ? 'selected' : ''}>20</option>
          <option value="50" ${bannerPageSize === 50 ? 'selected' : ''}>50</option>
        </select>
      </div>
      <div class="pagination-controls">
        <button class="page-btn" data-page="prev" ${bannerPage <= 1 ? 'disabled' : ''}><i data-lucide="chevron-left" style="width:14px;height:14px;"></i></button>
        ${pagesHtml}
        <button class="page-btn" data-page="next" ${bannerPage >= totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" style="width:14px;height:14px;"></i></button>
      </div>
    `;

    // Bind pagination events
    paginationEl.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pg = btn.getAttribute('data-page');
        if (pg === 'prev') bannerPage = Math.max(1, bannerPage - 1);
        else if (pg === 'next') bannerPage = Math.min(totalPages, bannerPage + 1);
        else bannerPage = parseInt(pg);
        renderBanners();
      });
    });
    const pageSizeSel = document.getElementById('banner-page-size-select');
    if (pageSizeSel) {
      pageSizeSel.addEventListener('change', (e) => {
        bannerPageSize = parseInt(e.target.value);
        bannerPage = 1;
        renderBanners();
      });
    }

    // Bind toggle switches
    document.querySelectorAll('.banner-status-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        e.preventDefault();
        const bid = toggle.getAttribute('data-id');
        const allBanners = KioskStore.getBanners();
        const banner = allBanners.find(x => x.id === bid);
        if (!banner) return;
        const wasActive = banner.active;
        // Revert immediately ΓÇö wait for confirmation
        toggle.checked = wasActive;
        const action = wasActive ? 'Deactivate' : 'Activate';
        triggerConfirm(`${action} ${banner.title}?`, `Are you sure you want to ${action.toLowerCase()} this banner?`, () => {
          banner.active = !wasActive;
          KioskStore.setBanners(allBanners);
          showToast(`${banner.title} ${wasActive ? 'deactivated' : 'activated'}.`);
        }, { isDestructive: wasActive, confirmText: `Yes, ${action}` });
      });
    });

    bindEvents('.btn-view-banner', previewBanner);
    bindEvents('.btn-edit-banner', editBanner);
    bindEvents('.btn-delete-banner', deleteBanner);
  }

  let paymentPage = 1;
  let paymentPageSize = 10;
  
  function renderPayments() {
    const payments = KioskStore.getPayments() || [];
    const tbody = document.getElementById('payments-tbody');
    const searchInput = document.getElementById('payments-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = payments.filter(p => {
      return !searchVal || p.name.toLowerCase().includes(searchVal);
    });

    if (window.tableSorts && window.tableSorts.payments) {
      const { field, dir } = window.tableSorts.payments;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 3rem; color: var(--text-admin-muted);">
        <i data-lucide="credit-card" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem; display: block; margin: 0 auto;"></i>
        No payment methods found.
      </td></tr>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalPages = Math.ceil(filtered.length / paymentPageSize);
    if (paymentPage > totalPages) paymentPage = Math.max(1, totalPages);
    const startIndex = (paymentPage - 1) * paymentPageSize;
    const paginated = filtered.slice(startIndex, startIndex + paymentPageSize);

    tbody.innerHTML = '';
    paginated.forEach(p => {
      const statusBadge = p.status === 'enabled'
        ? `<span class="badge touch-badge" style="background: rgba(34,197,94,0.1); color: #22c55e;"><i data-lucide="check-circle" style="width:12px;height:12px;margin-right:4px;"></i> Enabled</span>`
        : `<span class="badge touch-badge" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i data-lucide="x-circle" style="width:12px;height:12px;margin-right:4px;"></i> Disabled</span>`;
        
      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:32px; height:32px; border-radius:6px; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">
                <i data-lucide="credit-card" style="width:16px;height:16px; color:var(--primary);"></i>
              </div>
              <strong>${p.name}</strong>
            </div>
          </td>
          <td>${p.configuration}</td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon btn-edit-payment" data-id="${p.id}" title="Edit"><i data-lucide="settings"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    if (window.lucide) lucide.createIcons();
    bindEvents('.btn-edit-payment', editPayment);
  }

  const paymentSearch = document.getElementById('payments-search');
  if (paymentSearch) paymentSearch.addEventListener('input', () => { paymentPage = 1; renderPayments(); });

  // 4.3 Playlists CRUD
  function renderPlaylists() {
    const playlists = KioskStore.getPlaylists() || [];
    const tbody = document.getElementById('playlists-tbody');
    tbody.innerHTML = '';

    const search = document.getElementById('playlists-search').value.toLowerCase();
    const current = activeFilters.playlists || { status: [] };

    const filtered = playlists.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search);
      let matchStatus = true;
      if (current.status.length > 0) {
        matchStatus = current.status.includes(p.status);
      }
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-admin-muted);">No playlists match the selected filters.</td></tr>';
      return;
    }

    filtered.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${p.name}</strong><br><small style="color: var(--text-admin-muted);">ID: ${p.id}</small></td>
          <td>${p.bannerIds?.length || 0} Banners</td>
          <td>${p.assignedTVs || '0 TVs'}</td>
          <td><span class="badge touch-badge">${p.status.toUpperCase()}</span></td>
          <td>${p.updatedDate}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 0.25rem; align-items: center; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon-only btn-view-playlist" data-id="${p.id}" title="View Details" style="padding: 0.3rem 0.4rem;"><i data-lucide="eye" style="width: 14px; height: 14px;"></i></button>
              <button class="btn btn-secondary btn-icon-only btn-edit-playlist" data-id="${p.id}" title="Edit Settings" style="padding: 0.3rem 0.4rem;"><i data-lucide="pencil" style="width: 14px; height: 14px;"></i></button>
              <button class="btn btn-danger btn-icon-only btn-delete-playlist" data-id="${p.id}" title="Delete Record" style="padding: 0.3rem 0.4rem;"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
            </div>
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

    const search = document.getElementById('tvs-search').value.toLowerCase();
    const current = activeFilters.tvs || { status: [], type: [], playlist: [], location: [] };

    const filtered = tvs.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search);
      let matchStatus = true;
      if (current.status.length > 0) {
        matchStatus = current.status.includes(t.status);
      }
      let matchType = true;
      if (current.type.length > 0) {
        matchType = current.connectionStatus.includes(t.connectionStatus);
      }
      let matchPlaylist = true;
      if (current.playlist.length > 0) {
        matchPlaylist = current.playlist.includes(t.assignedPlaylistId);
      }
      let matchLocation = true;
      if (current.location.length > 0) {
        matchLocation = current.location.includes(t.location);
      }
      return matchSearch && matchStatus && matchType && matchPlaylist && matchLocation;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-admin-muted);">No TVs match the selected filters.</td></tr>';
      return;
    }

    filtered.forEach(t => {
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
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 0.25rem; align-items: center; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon-only btn-view-tv" data-id="${t.id}" title="View Details" style="padding: 0.3rem 0.4rem;"><i data-lucide="eye" style="width: 14px; height: 14px;"></i></button>
              <button class="btn btn-secondary btn-icon-only btn-edit-tv" data-id="${t.id}" title="Edit Settings" style="padding: 0.3rem 0.4rem;"><i data-lucide="pencil" style="width: 14px; height: 14px;"></i></button>
              <button class="btn btn-danger btn-icon-only btn-delete-tv" data-id="${t.id}" title="Delete Record" style="padding: 0.3rem 0.4rem;"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
            </div>
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

  // 4.5 Categories CRUD
  let categoryPage = 1;
  let categoryPageSize = 10;

  function renderCategories() {
    const categories = KioskStore.getCategories() || [];
    const tbody = document.getElementById('categories-tbody');
    const paginationEl = document.getElementById('categories-pagination');
    if (!tbody) return;
    tbody.innerHTML = '';

    const search = (document.getElementById('categories-search')?.value || '').toLowerCase();
    const current = activeFilters.categories || { status: [] };

    const filtered = categories.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search);
      let matchStatus = true;
      if (current.status && current.status.length > 0) {
        matchStatus = false;
        if (current.status.includes('active') && c.status === 'active') matchStatus = true;
        if (current.status.includes('inactive') && c.status !== 'active') matchStatus = true;
      }
      return matchSearch && matchStatus;
    });

    if (window.tableSorts && window.tableSorts.categories) {
      const { field, dir } = window.tableSorts.categories;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / categoryPageSize));
    if (categoryPage > totalPages) categoryPage = totalPages;
    const startIdx = (categoryPage - 1) * categoryPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + categoryPageSize);

    if (totalItems === 0) {
      const hasSearch = search.length > 0;
      const hasFilters = current.status && current.status.length > 0;
      let emptyHtml = '';
      if (hasSearch) {
        emptyHtml = `<tr><td colspan="5"><div class="table-empty-state"><i data-lucide="search" class="empty-icon"></i><h4>No categories match your search</h4><p>Try a different search term.</p><button class="btn btn-secondary" onclick="document.getElementById('categories-search').value='';document.getElementById('categories-search').dispatchEvent(new Event('input'));">Clear Search</button></div></td></tr>`;
      } else if (hasFilters) {
        emptyHtml = `<tr><td colspan="5"><div class="table-empty-state"><i data-lucide="filter-x" class="empty-icon"></i><h4>No categories match the selected filters</h4><p>Adjust your filters or clear them.</p><button class="btn btn-secondary" onclick="activeFilters.categories={status:[]};updateFilterChips('categories');renderCategories();">Clear Filters</button></div></td></tr>`;
      } else {
        emptyHtml = `<tr><td colspan="5"><div class="table-empty-state"><i data-lucide="folder" class="empty-icon"></i><h4>No categories found</h4><p>Create your first menu category.</p><button class="btn btn-primary" onclick="document.getElementById('btn-add-categories').click();">Create Category</button></div></td></tr>`;
      }
      tbody.innerHTML = emptyHtml;
      if (paginationEl) paginationEl.innerHTML = '';
      if (window.lucide) lucide.createIcons();
      return;
    }

    pageItems.forEach(c => {
      const isActive = c.status === 'active';
      const statusBadge = isActive
        ? '<span class="badge touch-badge">Active</span>'
        : '<span class="badge danger-badge">Inactive</span>';

      tbody.innerHTML += `
        <tr>
          <td>
            <strong style="display:block;line-height:1.3;">${c.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-admin-muted);">ID: ${c.id}</div>
          </td>
          <td><div style="font-size: 1.5rem;"><i data-lucide="${c.icon || 'folder'}" style="width: 24px; height: 24px;"></i></div></td>
          <td><span class="badge desktop-badge">${c.count || 0} Products</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              ${statusBadge}
              <label class="status-switch" title="${isActive ? 'Deactivate' : 'Activate'}">
                <input type="checkbox" class="category-status-toggle" data-id="${c.id}" ${isActive ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 0.25rem; align-items: center; justify-content: flex-end;">
              <button class="btn-action btn-view-category" data-id="${c.id}" title="View Details">
                <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-edit-category" data-id="${c.id}" title="Edit">
                <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-action-danger btn-delete-category" data-id="${c.id}" title="Delete">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    if (paginationEl) {
      const showFrom = startIdx + 1;
      const showTo = Math.min(startIdx + categoryPageSize, totalItems);
      let pagesHtml = '';
      for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `<button class="page-btn ${i === categoryPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      paginationEl.innerHTML = `
        <div class="pagination-info">
          Showing <strong>${showFrom}ΓÇô${showTo}</strong> of <strong>${totalItems}</strong> categories
          <span style="margin-left: 0.75rem; color: var(--text-admin-muted);">Rows per page</span>
          <select class="page-size-select" id="category-page-size-select">
            <option value="10" ${categoryPageSize === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${categoryPageSize === 20 ? 'selected' : ''}>20</option>
            <option value="50" ${categoryPageSize === 50 ? 'selected' : ''}>50</option>
          </select>
        </div>
        <div class="pagination-controls">
          <button class="page-btn" data-page="prev" ${categoryPage <= 1 ? 'disabled' : ''}><i data-lucide="chevron-left" style="width:14px;height:14px;"></i></button>
          ${pagesHtml}
          <button class="page-btn" data-page="next" ${categoryPage >= totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" style="width:14px;height:14px;"></i></button>
        </div>
      `;

      paginationEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pg = btn.getAttribute('data-page');
          if (pg === 'prev') categoryPage = Math.max(1, categoryPage - 1);
          else if (pg === 'next') categoryPage = Math.min(totalPages, categoryPage + 1);
          else categoryPage = parseInt(pg);
          renderCategories();
        });
      });
      const pageSizeSel = document.getElementById('category-page-size-select');
      if (pageSizeSel) {
        pageSizeSel.addEventListener('change', (e) => {
          categoryPageSize = parseInt(e.target.value);
          categoryPage = 1;
          renderCategories();
        });
      }
    }

    if (window.lucide) lucide.createIcons();
    
    // Bind listeners
    document.querySelectorAll('.category-status-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        e.preventDefault();
        const id = toggle.getAttribute('data-id');
        const all = KioskStore.getCategories();
        const cat = all.find(x => x.id === id);
        if (!cat) return;
        const wasActive = cat.status === 'active';
        const willBeActive = !wasActive;
        // revert visual state momentarily
        toggle.checked = wasActive;
        // Open confirmation
        document.getElementById('confirm-modal-title').textContent = willBeActive ? 'Activate Category' : 'Deactivate Category';
        document.getElementById('confirm-modal-body').textContent = `Are you sure you want to ${willBeActive ? 'activate' : 'deactivate'} "${cat.name}"?`;
        
        const confirmBtn = document.getElementById('btn-confirm-execute');
        confirmBtn.className = willBeActive ? 'btn btn-primary' : 'btn btn-warning';
        confirmBtn.textContent = willBeActive ? 'Yes, Activate' : 'Yes, Deactivate';
        
        document.getElementById('confirm-modal').classList.add('visible');
        
        // Remove old listeners
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        
        newBtn.addEventListener('click', () => {
          cat.status = willBeActive ? 'active' : 'inactive';
          KioskStore.setCategories(all);
          document.getElementById('confirm-modal').classList.remove('visible');
          showToast(willBeActive ? 'Category activated successfully' : 'Category deactivated', willBeActive ? 'success' : 'warning');
          renderCategories();
        });
      });
    });
    bindEvents('.btn-view-category', showCategoryDetails);
    bindEvents('.btn-edit-category', editCategory);
    bindEvents('.btn-delete-category', deleteCategory);
  }

  // 4.6 Products CRUD
  let productPage = 1;
  let productPageSize = 10;

  function renderProducts() {
    const products = KioskStore.getProducts() || [];
    const categories = KioskStore.getCategories() || [];
    const tbody = document.getElementById('products-tbody');
    const paginationEl = document.getElementById('products-pagination');
    if (!tbody) return;
    tbody.innerHTML = '';

    const search = (document.getElementById('products-search')?.value || '').toLowerCase();
    const current = activeFilters.products || { status: [], category: [], availability: [] };

    const filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search);
      let matchStatus = true;
      if (current.status && current.status.length > 0) {
        matchStatus = false;
        if (current.status.includes('active') && p.status === 'active') matchStatus = true;
        if (current.status.includes('inactive') && p.status !== 'active') matchStatus = true;
      }
      let matchCat = true;
      if (current.category && current.category.length > 0) {
        matchCat = current.category.includes(p.categoryId);
      }
      let matchAvail = true;
      if (current.availability && current.availability.length > 0) {
        matchAvail = false;
        if (current.availability.includes('available') && p.available) matchAvail = true;
        if (current.availability.includes('unavailable') && !p.available) matchAvail = true;
      }
      return matchSearch && matchStatus && matchCat && matchAvail;
    });

    if (window.tableSorts && window.tableSorts.products) {
      const { field, dir } = window.tableSorts.products;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / productPageSize));
    if (productPage > totalPages) productPage = totalPages;
    const startIdx = (productPage - 1) * productPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + productPageSize);

    if (totalItems === 0) {
      const hasSearch = search.length > 0;
      const hasFilters = (current.status && current.status.length > 0) || (current.category && current.category.length > 0) || (current.availability && current.availability.length > 0);
      let emptyHtml = '';
      if (hasSearch) {
        emptyHtml = `<tr><td colspan="7"><div class="table-empty-state"><i data-lucide="search" class="empty-icon"></i><h4>No products match your search</h4><p>Try a different search term.</p><button class="btn btn-secondary" onclick="document.getElementById('products-search').value='';document.getElementById('products-search').dispatchEvent(new Event('input'));">Clear Search</button></div></td></tr>`;
      } else if (hasFilters) {
        emptyHtml = `<tr><td colspan="7"><div class="table-empty-state"><i data-lucide="filter-x" class="empty-icon"></i><h4>No products match the selected filters</h4><p>Adjust your filters or clear them.</p><button class="btn btn-secondary" onclick="activeFilters.products={status:[],category:[],availability:[]};updateFilterChips('products');renderProducts();">Clear Filters</button></div></td></tr>`;
      } else {
        emptyHtml = `<tr><td colspan="7"><div class="table-empty-state"><i data-lucide="package" class="empty-icon"></i><h4>No products found</h4><p>Add products to your catalog.</p><button class="btn btn-primary" onclick="document.getElementById('btn-add-products').click();">Add Product</button></div></td></tr>`;
      }
      tbody.innerHTML = emptyHtml;
      if (paginationEl) paginationEl.innerHTML = '';
      if (window.lucide) lucide.createIcons();
      return;
    }

    pageItems.forEach(p => {
      const cat = categories.find(c => c.id === p.categoryId) || { name: 'Uncategorized' };
      const isActive = p.status === 'active';
      const statusBadge = isActive
        ? '<span class="badge touch-badge">Active</span>'
        : '<span class="badge danger-badge">Inactive</span>';
      
      const isAvail = p.available;
      const availBadge = isAvail
        ? '<span class="badge desktop-badge" style="color:var(--green);">In Stock</span>'
        : '<span class="badge desktop-badge" style="color:var(--danger);">Out of Stock</span>';

      tbody.innerHTML += `
        <tr>
          <td><strong style="display:block;line-height:1.3;">${p.name}</strong></td>
          <td>
            <img src="${p.image}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-admin); display: block;"
              alt="${p.name}" onerror="this.outerHTML='<div class=\\'thumb-placeholder\\'><i data-lucide=\\'image\\' style=\\'width:18px;height:18px;\\'></i></div>'">
          </td>
          <td><span class="badge desktop-badge">${cat.name}</span></td>
          <td><strong>$${p.price.toFixed(2)}</strong></td>
          <td>${availBadge}</td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              ${statusBadge}
              <label class="status-switch" title="${isActive ? 'Deactivate' : 'Activate'}">
                <input type="checkbox" class="product-status-toggle" data-id="${p.id}" ${isActive ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 0.25rem; align-items: center; justify-content: flex-end;">
              <button class="btn-action btn-view-product" data-id="${p.id}" title="View Details">
                <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-edit-product" data-id="${p.id}" title="Edit">
                <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-action-danger btn-delete-product" data-id="${p.id}" title="Delete">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    if (paginationEl) {
      const showFrom = startIdx + 1;
      const showTo = Math.min(startIdx + productPageSize, totalItems);
      let pagesHtml = '';
      for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `<button class="page-btn ${i === productPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      paginationEl.innerHTML = `
        <div class="pagination-info">
          Showing <strong>${showFrom}ΓÇô${showTo}</strong> of <strong>${totalItems}</strong> products
          <span style="margin-left: 0.75rem; color: var(--text-admin-muted);">Rows per page</span>
          <select class="page-size-select" id="product-page-size-select">
            <option value="10" ${productPageSize === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${productPageSize === 20 ? 'selected' : ''}>20</option>
            <option value="50" ${productPageSize === 50 ? 'selected' : ''}>50</option>
          </select>
        </div>
        <div class="pagination-controls">
          <button class="page-btn" data-page="prev" ${productPage <= 1 ? 'disabled' : ''}><i data-lucide="chevron-left" style="width:14px;height:14px;"></i></button>
          ${pagesHtml}
          <button class="page-btn" data-page="next" ${productPage >= totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" style="width:14px;height:14px;"></i></button>
        </div>
      `;

      paginationEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pg = btn.getAttribute('data-page');
          if (pg === 'prev') productPage = Math.max(1, productPage - 1);
          else if (pg === 'next') productPage = Math.min(totalPages, productPage + 1);
          else productPage = parseInt(pg);
          renderProducts();
        });
      });
      const pageSizeSel = document.getElementById('product-page-size-select');
      if (pageSizeSel) {
        pageSizeSel.addEventListener('change', (e) => {
          productPageSize = parseInt(e.target.value);
          productPage = 1;
          renderProducts();
        });
      }
    }

    if (window.lucide) lucide.createIcons();
    
    // Bind listeners
    document.querySelectorAll('.product-status-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        e.preventDefault();
        const id = toggle.getAttribute('data-id');
        const all = KioskStore.getProducts();
        const p = all.find(x => x.id === id);
        if (!p) return;
        const wasActive = p.status === 'active';
        const willBeActive = !wasActive;
        // revert visual state momentarily
        toggle.checked = wasActive;
        // Open confirmation
        document.getElementById('confirm-modal-title').textContent = willBeActive ? 'Activate Product' : 'Deactivate Product';
        document.getElementById('confirm-modal-body').textContent = `Are you sure you want to ${willBeActive ? 'activate' : 'deactivate'} "${p.name}"?`;
        
        const confirmBtn = document.getElementById('btn-confirm-execute');
        confirmBtn.className = willBeActive ? 'btn btn-primary' : 'btn btn-warning';
        confirmBtn.textContent = willBeActive ? 'Yes, Activate' : 'Yes, Deactivate';
        
        document.getElementById('confirm-modal').classList.add('visible');
        
        // Remove old listeners
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        
        newBtn.addEventListener('click', () => {
          p.status = willBeActive ? 'active' : 'inactive';
          KioskStore.setProducts(all);
          document.getElementById('confirm-modal').classList.remove('visible');
          showToast(willBeActive ? 'Product activated successfully' : 'Product deactivated', willBeActive ? 'success' : 'warning');
          renderProducts();
        });
      });
    });
    bindEvents('.btn-view-product', showProductDetails);
    bindEvents('.btn-edit-product', editProduct);
    bindEvents('.btn-delete-product', deleteProduct);
  }

  window.changeProductPage = function(p) {
    productPage = p;
    renderProducts();
  }

  // 4.7 Modifiers CRUD
  let modifierPage = 1;
  let modifierPageSize = 10;

  function renderModifiers() {
    // We will extract unique modifiers from products
    const products = KioskStore.getProducts() || [];
    let modifiersMap = new Map();
    
    products.forEach(p => {
      if (p.addOns) {
        p.addOns.forEach(a => {
          if (!modifiersMap.has(a.name)) {
            modifiersMap.set(a.name, { id: 'mod-' + a.name.toLowerCase().replace(/\\s+/g, '-'), name: a.name, type: 'Add-on', price: a.price, required: false, applicable: [p.name], status: 'active' });
          } else {
            modifiersMap.get(a.name).applicable.push(p.name);
          }
        });
      }
      if (p.variants) {
        p.variants.forEach(v => {
          if (!modifiersMap.has(v.name)) {
            modifiersMap.set(v.name, { id: 'mod-' + v.name.toLowerCase().replace(/\\s+/g, '-'), name: v.name, type: 'Variant', price: 0, required: true, applicable: [p.name], status: 'active' });
          } else {
            modifiersMap.get(v.name).applicable.push(p.name);
          }
        });
      }
    });
    
    const modifiers = Array.from(modifiersMap.values());
    
    const tbody = document.getElementById('modifiers-tbody');
    const paginationEl = document.getElementById('customisation-pagination');
    if (!tbody) return;
    tbody.innerHTML = '';

    const search = (document.getElementById('customisation-search')?.value || '').toLowerCase();
    const current = activeFilters.customisation || { status: [], type: [], required: [] };

    const filtered = modifiers.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search);
      let matchStatus = true;
      if (current.status && current.status.length > 0) {
        matchStatus = false;
        if (current.status.includes('active') && m.status === 'active') matchStatus = true;
        if (current.status.includes('inactive') && m.status !== 'active') matchStatus = true;
      }
      return matchSearch && matchStatus;
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / modifierPageSize));
    if (modifierPage > totalPages) modifierPage = totalPages;
    const startIdx = (modifierPage - 1) * modifierPageSize;
    const pageItems = filtered.slice(startIdx, startIdx + modifierPageSize);

    if (totalItems === 0) {
      const hasSearch = search.length > 0;
      const hasFilters = current.status && current.status.length > 0;
      let emptyHtml = '';
      if (hasSearch) {
        emptyHtml = `<tr><td colspan="7"><div class="table-empty-state"><i data-lucide="search" class="empty-icon"></i><h4>No modifiers match your search</h4><p>Try a different search term.</p><button class="btn btn-secondary" onclick="document.getElementById('customisation-search').value='';document.getElementById('customisation-search').dispatchEvent(new Event('input'));">Clear Search</button></div></td></tr>`;
      } else if (hasFilters) {
        emptyHtml = `<tr><td colspan="7"><div class="table-empty-state"><i data-lucide="filter-x" class="empty-icon"></i><h4>No modifiers match the selected filters</h4><p>Adjust your filters or clear them.</p><button class="btn btn-secondary" onclick="activeFilters.customisation={status:[]};updateFilterChips('customisation');renderModifiers();">Clear Filters</button></div></td></tr>`;
      } else {
        emptyHtml = `<tr><td colspan="7"><div class="table-empty-state"><i data-lucide="sliders-horizontal" class="empty-icon"></i><h4>No customisations found</h4><p>Create variants or add-ons for products.</p><button class="btn btn-primary" onclick="document.getElementById('btn-add-customisation').click();">Add Modifier</button></div></td></tr>`;
      }
      tbody.innerHTML = emptyHtml;
      if (paginationEl) paginationEl.innerHTML = '';
      if (window.lucide) lucide.createIcons();
      return;
    }

    pageItems.forEach(m => {
      const isActive = m.status === 'active';
      const statusBadge = isActive
        ? '<span class="badge touch-badge">Active</span>'
        : '<span class="badge danger-badge">Inactive</span>';
      
      const reqBadge = m.required
        ? '<span class="badge warning-badge">Required</span>'
        : '<span class="badge desktop-badge">Optional</span>';

      tbody.innerHTML += `
        <tr>
          <td><strong style="display:block;line-height:1.3;">${m.name}</strong></td>
          <td>${m.type}</td>
          <td>${m.price > 0 ? '+$' + m.price.toFixed(2) : 'Varies'}</td>
          <td>${reqBadge}</td>
          <td><span class="badge desktop-badge">${m.applicable.length} Products</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              ${statusBadge}
              <label class="status-switch" title="${isActive ? 'Deactivate' : 'Activate'}">
                <input type="checkbox" class="modifier-status-toggle" data-id="${m.id}" ${isActive ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 0.25rem; align-items: center; justify-content: flex-end;">
              <button class="btn-action btn-view-modifier" data-id="${m.id}" title="View Details">
                <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-edit-modifier" data-id="${m.id}" title="Edit">
                <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action btn-action-danger btn-delete-modifier" data-id="${m.id}" title="Delete">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    if (paginationEl) {
      const showFrom = startIdx + 1;
      const showTo = Math.min(startIdx + modifierPageSize, totalItems);
      let pagesHtml = '';
      for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `<button class="page-btn ${i === modifierPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      paginationEl.innerHTML = `
        <div class="pagination-info">
          Showing <strong>${showFrom}ΓÇô${showTo}</strong> of <strong>${totalItems}</strong> modifiers
          <span style="margin-left: 0.75rem; color: var(--text-admin-muted);">Rows per page</span>
          <select class="page-size-select" id="modifier-page-size-select">
            <option value="10" ${modifierPageSize === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${modifierPageSize === 20 ? 'selected' : ''}>20</option>
            <option value="50" ${modifierPageSize === 50 ? 'selected' : ''}>50</option>
          </select>
        </div>
        <div class="pagination-controls">
          <button class="page-btn" data-page="prev" ${modifierPage <= 1 ? 'disabled' : ''}><i data-lucide="chevron-left" style="width:14px;height:14px;"></i></button>
          ${pagesHtml}
          <button class="page-btn" data-page="next" ${modifierPage >= totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" style="width:14px;height:14px;"></i></button>
        </div>
      `;

      paginationEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pg = btn.getAttribute('data-page');
          if (pg === 'prev') modifierPage = Math.max(1, modifierPage - 1);
          else if (pg === 'next') modifierPage = Math.min(totalPages, modifierPage + 1);
          else modifierPage = parseInt(pg);
          renderModifiers();
        });
      });
      const pageSizeSel = document.getElementById('modifier-page-size-select');
      if (pageSizeSel) {
        pageSizeSel.addEventListener('change', (e) => {
          modifierPageSize = parseInt(e.target.value);
          modifierPage = 1;
          renderModifiers();
        });
      }
    }

    if (window.lucide) lucide.createIcons();
    
    // Bind listeners
    document.querySelectorAll('.modifier-status-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        e.preventDefault();
        const id = toggle.getAttribute('data-id');
        const wasActive = toggle.checked; // Stub
        const willBeActive = !wasActive;
        toggle.checked = wasActive;
        
        document.getElementById('confirm-modal-title').textContent = willBeActive ? 'Activate Modifier' : 'Deactivate Modifier';
        document.getElementById('confirm-modal-body').textContent = `Are you sure you want to ${willBeActive ? 'activate' : 'deactivate'} this modifier?`;
        
        const confirmBtn = document.getElementById('btn-confirm-execute');
        confirmBtn.className = willBeActive ? 'btn btn-primary' : 'btn btn-warning';
        confirmBtn.textContent = willBeActive ? 'Yes, Activate' : 'Yes, Deactivate';
        
        document.getElementById('confirm-modal').classList.add('visible');
        
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        
        newBtn.addEventListener('click', () => {
          // Typically update store here, but it's a stub
          document.getElementById('confirm-modal').classList.remove('visible');
          showToast(willBeActive ? 'Modifier activated successfully' : 'Modifier deactivated', willBeActive ? 'success' : 'warning');
          renderModifiers();
        });
      });
    });
    bindEvents('.btn-view-modifier', showModifierDetails);
    bindEvents('.btn-edit-modifier', editModifier);
    bindEvents('.btn-delete-modifier', deleteModifier);
  }

  window.changeModifierPage = function(p) {
    modifierPage = p;
    renderModifiers();
  };

  // 4.9 Taxes CRUD
  let taxPage = 1;
  let taxPageSize = 10;
  
  function renderTaxes() {
    const taxes = KioskStore.getTaxes() || [];
    const tbody = document.getElementById('taxes-tbody');
    const searchInput = document.getElementById('taxes-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = taxes.filter(t => {
      return !searchVal || t.name.toLowerCase().includes(searchVal);
    });

    if (window.tableSorts && window.tableSorts.taxes) {
      const { field, dir } = window.tableSorts.taxes;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 3rem; color: var(--text-admin-muted);">
        <i data-lucide="inbox" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem; display: block; margin: 0 auto;"></i>
        No taxes found.
      </td></tr>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Pagination
    const totalPages = Math.ceil(filtered.length / taxPageSize);
    if (taxPage > totalPages) taxPage = Math.max(1, totalPages);
    const startIndex = (taxPage - 1) * taxPageSize;
    const paginated = filtered.slice(startIndex, startIndex + taxPageSize);

    tbody.innerHTML = '';
    paginated.forEach(t => {
      const statusBadge = t.status === 'active' 
        ? `<span class="badge touch-badge" style="background: rgba(34,197,94,0.1); color: #22c55e;"><i data-lucide="check-circle" style="width:12px;height:12px;margin-right:4px;"></i> Active</span>`
        : `<span class="badge touch-badge" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i data-lucide="x-circle" style="width:12px;height:12px;margin-right:4px;"></i> Inactive</span>`;
        
      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:32px; height:32px; border-radius:6px; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">
                <i data-lucide="percent" style="width:16px;height:16px; color:var(--primary);"></i>
              </div>
              <strong>${t.name}</strong>
            </div>
          </td>
          <td>${t.percentage}%</td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon btn-edit-tax" data-id="${t.id}" title="Edit"><i data-lucide="edit"></i></button>
              <button class="btn btn-secondary btn-icon btn-delete-tax" data-id="${t.id}" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    if (window.lucide) lucide.createIcons();
    bindEvents('.btn-edit-tax', editTax);
    bindEvents('.btn-delete-tax', deleteTax);
  }

  // Bind Search
  const taxSearch = document.getElementById('taxes-search');
  if (taxSearch) taxSearch.addEventListener('input', () => { taxPage = 1; renderTaxes(); });

  // 4.10 Discounts CRUD
  let discountPage = 1;
  let discountPageSize = 10;
  
  function renderDiscounts() {
    const discounts = KioskStore.getDiscounts() || [];
    const tbody = document.getElementById('discounts-tbody');
    const searchInput = document.getElementById('discounts-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = discounts.filter(d => {
      return !searchVal || d.name.toLowerCase().includes(searchVal);
    });

    if (window.tableSorts && window.tableSorts.discounts) {
      const { field, dir } = window.tableSorts.discounts;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 3rem; color: var(--text-admin-muted);">
        <i data-lucide="tag" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem; display: block; margin: 0 auto;"></i>
        No discounts found.
      </td></tr>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalPages = Math.ceil(filtered.length / discountPageSize);
    if (discountPage > totalPages) discountPage = Math.max(1, totalPages);
    const startIndex = (discountPage - 1) * discountPageSize;
    const paginated = filtered.slice(startIndex, startIndex + discountPageSize);

    tbody.innerHTML = '';
    paginated.forEach(d => {
      const statusBadge = d.status === 'active' 
        ? `<span class="badge touch-badge" style="background: rgba(34,197,94,0.1); color: #22c55e;"><i data-lucide="check-circle" style="width:12px;height:12px;margin-right:4px;"></i> Active</span>`
        : `<span class="badge touch-badge" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i data-lucide="x-circle" style="width:12px;height:12px;margin-right:4px;"></i> Inactive</span>`;
        
      const valStr = d.type === 'percentage' ? `${d.value}%` : `Γé╣${d.value.toFixed(2)}`;
      
      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:32px; height:32px; border-radius:6px; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">
                <i data-lucide="tag" style="width:16px;height:16px; color:var(--primary);"></i>
              </div>
              <div style="display:flex; flex-direction:column;">
                <strong>${d.name}</strong>
                <span style="font-size:0.75rem; color:var(--text-admin-muted);">${d.type.toUpperCase()}</span>
              </div>
            </div>
          </td>
          <td><strong style="color:var(--primary);">${valStr}</strong></td>
          <td>${d.applicableProducts || 'All'}</td>
          <td>
            <div style="font-size:0.8rem; color:var(--text-admin-muted);">
              ${d.startDate || '-'} <br/> ${d.endDate || '-'}
            </div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon btn-edit-discount" data-id="${d.id}" title="Edit"><i data-lucide="edit"></i></button>
              <button class="btn btn-secondary btn-icon btn-delete-discount" data-id="${d.id}" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    if (window.lucide) lucide.createIcons();
    bindEvents('.btn-edit-discount', editDiscount);
    bindEvents('.btn-delete-discount', deleteDiscount);
  }

  const discountSearch = document.getElementById('discounts-search');
  if (discountSearch) discountSearch.addEventListener('input', () => { discountPage = 1; renderDiscounts(); });

  let kioskPage = 1;
  let kioskPageSize = 10;
  
  function renderKiosks() {
    const kiosks = KioskStore.getKiosks() || [];
    const tbody = document.getElementById('kiosks-tbody');
    const searchInput = document.getElementById('kiosks-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = kiosks.filter(k => {
      return !searchVal || k.id.toLowerCase().includes(searchVal) || k.location.toLowerCase().includes(searchVal);
    });

    if (window.tableSorts && window.tableSorts.kiosks) {
      const { field, dir } = window.tableSorts.kiosks;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 3rem; color: var(--text-admin-muted);">
        <i data-lucide="monitor" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem; display: block; margin: 0 auto;"></i>
        No kiosks found.
      </td></tr>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalPages = Math.ceil(filtered.length / kioskPageSize);
    if (kioskPage > totalPages) kioskPage = Math.max(1, totalPages);
    const startIndex = (kioskPage - 1) * kioskPageSize;
    const paginated = filtered.slice(startIndex, startIndex + kioskPageSize);

    tbody.innerHTML = '';
    paginated.forEach(k => {
      const statusBadge = k.status === 'active'
        ? `<span class="badge touch-badge" style="background: rgba(34,197,94,0.1); color: #22c55e;"><i data-lucide="check-circle" style="width:12px;height:12px;margin-right:4px;"></i> Active</span>`
        : `<span class="badge touch-badge" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i data-lucide="x-circle" style="width:12px;height:12px;margin-right:4px;"></i> Inactive</span>`;
        
      const connBadge = k.connectionStatus === 'online'
        ? `<span style="color: #22c55e; display:flex; align-items:center; gap:0.25rem;"><i data-lucide="wifi" style="width:14px;height:14px;"></i> Online</span>`
        : (k.connectionStatus === 'warning' ? `<span style="color: #eab308; display:flex; align-items:center; gap:0.25rem;"><i data-lucide="wifi-off" style="width:14px;height:14px;"></i> Unstable</span>` : `<span style="color: #ef4444; display:flex; align-items:center; gap:0.25rem;"><i data-lucide="wifi-off" style="width:14px;height:14px;"></i> Offline</span>`);
      
      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:32px; height:32px; border-radius:6px; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">
                <i data-lucide="smartphone" style="width:16px;height:16px; color:var(--primary);"></i>
              </div>
              <strong>${k.id}</strong>
            </div>
          </td>
          <td>${k.location}</td>
          <td>${connBadge}</td>
          <td><span style="font-size:0.85rem; color:var(--text-admin-muted);">${k.lastActive}</span></td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon btn-edit-kiosk" data-id="${k.id}" title="Edit"><i data-lucide="edit"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    if (window.lucide) lucide.createIcons();
    bindEvents('.btn-edit-kiosk', editKiosk);
  }

  const kioskSearch = document.getElementById('kiosks-search');
  if (kioskSearch) kioskSearch.addEventListener('input', () => { kioskPage = 1; renderKiosks(); });

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
          <p style="margin-top: 0.5rem;"><strong>Config:</strong> ${p.configuration}</p>
          <p style="margin-top: 0.25rem;"><strong>Status:</strong> <span class="badge ${p.status === 'enabled' ? 'touch-badge' : 'danger-badge'}">${p.status.toUpperCase()}</span></p>
          <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
            <button class="btn ${p.status === 'enabled' ? 'btn-danger' : 'btn-primary'} btn-toggle-payment" data-id="${p.id}" style="display: inline-flex; align-items: center; gap: 0.4rem; justify-content: center; width: 100%;">
              <i data-lucide="${p.status === 'enabled' ? 'circle-off' : 'check-circle'}" style="width: 16px; height: 16px;"></i>
              ${p.status === 'enabled' ? 'Disable Method' : 'Enable Method'}
            </button>
          </div>
        </div>
      `;
    });

    bindEvents('.btn-toggle-payment', togglePaymentGateway);
    if (window.lucide) { lucide.createIcons(); }
  }

  let payHistPage = 1;
  let payHistPageSize = 10;
  
  function renderPaymentHistory() {
    const orders = KioskStore.getOrders() || [];
    const tbody = document.getElementById('pay-history-tbody');
    if (!tbody) return;
    
    const search = document.getElementById('payment-history-search').value.toLowerCase();
    const current = activeFilters['payment-history'] || { paymentStatus: [], paymentMethod: [], kiosk: [], orderStatus: [] };

    let filtered = orders.filter(o => {
      const matchSearch = o.orderId.toLowerCase().includes(search) || o.kioskId.toLowerCase().includes(search);

      let matchPayStatus = true;
      if (current.paymentStatus && current.paymentStatus.length > 0) {
        matchPayStatus = current.paymentStatus.includes(o.paymentStatus);
      }

      let matchMethod = true;
      if (current.paymentMethod && current.paymentMethod.length > 0) {
        matchMethod = current.paymentMethod.includes(o.paymentMethod);
      }

      return matchSearch && matchPayStatus && matchMethod;
    });

    if (window.tableSorts && window.tableSorts['payment-history']) {
      const { field, dir } = window.tableSorts['payment-history'];
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 3rem; color: var(--text-admin-muted);">
        <i data-lucide="receipt" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem; display: block; margin: 0 auto;"></i>
        No payment records found.
      </td></tr>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalPages = Math.ceil(filtered.length / payHistPageSize);
    if (payHistPage > totalPages) payHistPage = Math.max(1, totalPages);
    const startIndex = (payHistPage - 1) * payHistPageSize;
    const paginated = filtered.slice(startIndex, startIndex + payHistPageSize);

    tbody.innerHTML = '';
    paginated.forEach(o => {
      let payStatusBadge = `<span class="badge touch-badge" style="background: rgba(34,197,94,0.1); color: #22c55e;"><i data-lucide="check-circle" style="width:12px;height:12px;margin-right:4px;"></i> Success</span>`;
      if (o.paymentStatus === 'failed') payStatusBadge = `<span class="badge touch-badge" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i data-lucide="x-circle" style="width:12px;height:12px;margin-right:4px;"></i> Failed</span>`;
      else if (o.paymentStatus === 'refunded') payStatusBadge = `<span class="badge touch-badge" style="background: rgba(168,162,158,0.1); color: #78716c;"><i data-lucide="rotate-ccw" style="width:12px;height:12px;margin-right:4px;"></i> Refunded</span>`;
      
      const valStr = `Γé╣${o.totalAmount.toFixed(2)}`;
      
      tbody.innerHTML += `
        <tr>
          <td><strong>${o.orderId}</strong></td>
          <td>${o.kioskId}</td>
          <td><span style="font-size:0.85rem; color:var(--text-admin-muted);">${formatDatePretty(o.dateTime.split('T')[0], o.dateTime.split('T')[1]?.substring(0,5))}</span></td>
          <td>${o.paymentMethod}</td>
          <td><strong style="color:var(--primary);">${valStr}</strong></td>
          <td>${payStatusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon btn-view-payment" data-id="${o.orderId}" title="View Details"><i data-lucide="eye"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    if (window.lucide) lucide.createIcons();
    bindEvents('.btn-view-payment', (e) => {
      showToast('Payment view disabled in demo', 'info');
    });
  }

  function showPaymentDetails(id) {
    const orders = KioskStore.getOrders() || [];
    const o = orders.find(item => item.orderId === id);
    if (!o) return;

    const txId = o.orderId.replace('ORD-', 'PAY-');
    document.getElementById('pay-details-tx-id').innerHTML = `<i data-lucide="receipt" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 0.25rem;"></i> Transaction details for ${txId}`;
    
    document.getElementById('pay-view-tx-id').textContent = txId;
    document.getElementById('pay-view-order-id').textContent = o.orderId;
    document.getElementById('pay-view-kiosk-id').textContent = o.kioskId;
    document.getElementById('pay-view-datetime').textContent = new Date(o.dateTime).toLocaleString();
    document.getElementById('pay-view-amount').textContent = `Γé╣${o.totalAmount.toFixed(2)}`;
    document.getElementById('pay-view-method').textContent = o.paymentMethod;
    
    // Status text mapping
    let payStatusText = 'Successful';
    if (o.paymentStatus === 'pending') payStatusText = 'Pending Verification';
    if (o.paymentStatus === 'failed') payStatusText = 'Failed / Declined';
    if (o.paymentStatus === 'cancelled') payStatusText = 'Cancelled by Customer';
    document.getElementById('pay-view-status').innerHTML = `<span class="badge ${o.paymentStatus === 'success' ? 'touch-badge' : 'danger-badge'}">${payStatusText}</span>`;

    document.getElementById('pay-view-token').textContent = `#${o.orderToken}`;
    document.getElementById('pay-view-order-status').textContent = o.orderStatus.toUpperCase();
    
    const itemsText = o.items.map(item => `${item.name} x${item.quantity}`).join(', ');
    document.getElementById('pay-view-items').textContent = itemsText;

    // Timeline setup
    const dateStr = new Date(o.dateTime);
    document.getElementById('timeline-initiated-time').textContent = new Date(dateStr.getTime() - 25000).toLocaleTimeString();
    document.getElementById('timeline-processing-time').textContent = new Date(dateStr.getTime() - 12000).toLocaleTimeString();
    document.getElementById('timeline-final-time').textContent = dateStr.toLocaleTimeString();

    const timelineDot = document.getElementById('timeline-final-dot');
    const timelineTitle = document.getElementById('timeline-final-title');
    if (o.paymentStatus === 'success') {
      timelineDot.style.background = 'var(--green)';
      timelineTitle.textContent = 'Payment Successful & Order Confirmed';
    } else if (o.paymentStatus === 'pending') {
      timelineDot.style.background = 'var(--warning)';
      timelineTitle.textContent = 'Verification Pending';
    } else {
      timelineDot.style.background = 'var(--danger)';
      timelineTitle.textContent = 'Payment Failed / Cancelled';
    }

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-payment-history-view').classList.add('active');
    tabTitle.textContent = 'Payment Details';
    tabDescription.textContent = 'Verify gateway receipts and timelines.';
    breadcrumbCurrent.textContent = 'Payment Details';
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

    if (window.tableSorts && window.tableSorts.orders) {
      const { field, dir } = window.tableSorts.orders;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (field === 'customer') { valA = a.customerInfo.name; valB = b.customerInfo.name; }
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

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
  let devicePage = 1;
  let devicePageSize = 10;
  
  function renderDevices() {
    const tbody = document.getElementById('devices-tbody');
    if (!tbody) return;
    const kiosks = KioskStore.getKiosks() || [];
    const tvs = KioskStore.getTVs() || [];
    
    // Combine into mock devices
    const devices = [
      ...kiosks.map(k => ({ deviceId: k.id, type: 'Self-Order Kiosk', ipAddress: '192.168.1.' + Math.floor(Math.random() * 255), status: k.connectionStatus })),
      ...tvs.map(t => ({ deviceId: t.id, type: 'Digital Billboard', ipAddress: '192.168.1.' + Math.floor(Math.random() * 255), status: t.connectionStatus })),
      { deviceId: 'POS-001', type: 'Point of Sale', ipAddress: '192.168.1.101', status: 'online' },
      { deviceId: 'PRN-001', type: 'Kitchen Printer', ipAddress: '192.168.1.102', status: 'online' },
      { deviceId: 'PAY-001', type: 'Card Terminal', ipAddress: '192.168.1.103', status: 'offline' }
    ];

    const searchInput = document.getElementById('devices-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = devices.filter(d => {
      return !searchVal || d.deviceId.toLowerCase().includes(searchVal) || d.type.toLowerCase().includes(searchVal);
    });

    if (window.tableSorts && window.tableSorts.devices) {
      const { field, dir } = window.tableSorts.devices;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 3rem; color: var(--text-admin-muted);">
        <i data-lucide="hard-drive" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem; display: block; margin: 0 auto;"></i>
        No devices found.
      </td></tr>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalPages = Math.ceil(filtered.length / devicePageSize);
    if (devicePage > totalPages) devicePage = Math.max(1, totalPages);
    const startIndex = (devicePage - 1) * devicePageSize;
    const paginated = filtered.slice(startIndex, startIndex + devicePageSize);

    tbody.innerHTML = '';
    paginated.forEach(d => {
      let statusBadge = `<span class="badge touch-badge" style="background: rgba(34,197,94,0.1); color: #22c55e;"><i data-lucide="wifi" style="width:12px;height:12px;margin-right:4px;"></i> Online</span>`;
      if (d.status === 'offline') statusBadge = `<span class="badge touch-badge" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i data-lucide="wifi-off" style="width:12px;height:12px;margin-right:4px;"></i> Offline</span>`;
      else if (d.status === 'warning') statusBadge = `<span class="badge touch-badge" style="background: rgba(234,179,8,0.1); color: #eab308;"><i data-lucide="alert-triangle" style="width:12px;height:12px;margin-right:4px;"></i> Unstable</span>`;
      
      let iconName = 'monitor';
      if (d.type.includes('Printer')) iconName = 'printer';
      else if (d.type.includes('Terminal')) iconName = 'credit-card';
      
      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:32px; height:32px; border-radius:6px; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">
                <i data-lucide="${iconName}" style="width:16px;height:16px; color:var(--primary);"></i>
              </div>
              <strong>${d.deviceId}</strong>
            </div>
          </td>
          <td>${d.type}</td>
          <td><span style="font-family:monospace; font-size: 0.9em;">${d.ipAddress}</span></td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon" title="Ping"><i data-lucide="activity"></i></button>
              <button class="btn btn-secondary btn-icon" title="Restart"><i data-lucide="power"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    if (window.lucide) lucide.createIcons();
  }

  const deviceSearch = document.getElementById('devices-search');
  if (deviceSearch) deviceSearch.addEventListener('input', () => { devicePage = 1; renderDevices(); });

  let rolePage = 1;
  let rolePageSize = 10;
  
  function renderRoles() {
    const tbody = document.getElementById('roles-tbody');
    if (!tbody) return;
    
    const roles = [
      { name: 'Admin User', email: 'admin@bistro.com', role: 'Super Administrator', status: 'active' },
      { name: 'Manager 1', email: 'manager@bistro.com', role: 'Store Manager', status: 'active' },
      { name: 'Cashier 1', email: 'cashier1@bistro.com', role: 'Cashier', status: 'active' },
      { name: 'Display Bot', email: 'display@bistro.com', role: 'API Access', status: 'inactive' }
    ];

    const searchInput = document.getElementById('roles-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = roles.filter(r => {
      return !searchVal || r.name.toLowerCase().includes(searchVal) || r.email.toLowerCase().includes(searchVal);
    });

    if (window.tableSorts && window.tableSorts.roles) {
      const { field, dir } = window.tableSorts.roles;
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 3rem; color: var(--text-admin-muted);">
        <i data-lucide="users" style="width: 48px; height: 48px; opacity: 0.2; margin-bottom: 1rem; display: block; margin: 0 auto;"></i>
        No roles found.
      </td></tr>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalPages = Math.ceil(filtered.length / rolePageSize);
    if (rolePage > totalPages) rolePage = Math.max(1, totalPages);
    const startIndex = (rolePage - 1) * rolePageSize;
    const paginated = filtered.slice(startIndex, startIndex + rolePageSize);

    tbody.innerHTML = '';
    paginated.forEach(r => {
      const statusBadge = r.status === 'active' 
        ? `<span class="badge touch-badge" style="background: rgba(34,197,94,0.1); color: #22c55e;"><i data-lucide="check-circle" style="width:12px;height:12px;margin-right:4px;"></i> Active</span>`
        : `<span class="badge touch-badge" style="background: rgba(239,68,68,0.1); color: #ef4444;"><i data-lucide="x-circle" style="width:12px;height:12px;margin-right:4px;"></i> Locked</span>`;
        
      tbody.innerHTML += `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:32px; height:32px; border-radius:6px; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">
                <i data-lucide="user" style="width:16px;height:16px; color:var(--primary);"></i>
              </div>
              <strong>${r.name}</strong>
            </div>
          </td>
          <td>${r.email}</td>
          <td><span class="badge desktop-badge">${r.role}</span></td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon" title="Edit Permissions"><i data-lucide="shield"></i></button>
              <button class="btn btn-secondary btn-icon" title="Delete User"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>
      `;
    });

    if (window.lucide) lucide.createIcons();
  }

  const roleSearch = document.getElementById('roles-search');
  if (roleSearch) roleSearch.addEventListener('input', () => { rolePage = 1; renderRoles(); });


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
  function triggerConfirm(title, body, executeCallback, options = {}) {
    const titleEl = document.getElementById('confirm-modal-title');
    const bodyEl = document.getElementById('confirm-modal-body');
    const executeBtn = document.getElementById('btn-confirm-execute');
    const iconContainer = document.querySelector('#confirm-modal .card-status-icon');

    titleEl.textContent = title;
    bodyEl.textContent = body;
    confirmCallback = executeCallback;

    executeBtn.className = options.isDestructive ? 'btn btn-danger' : 'btn btn-primary';
    executeBtn.textContent = options.confirmText || 'Confirm Action';

    if (options.isDestructive) {
      iconContainer.innerHTML = '<i data-lucide="triangle-alert" style="width: 24px; height: 24px;"></i>';
      iconContainer.style.color = 'var(--danger)';
      iconContainer.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    } else {
      iconContainer.innerHTML = '<i data-lucide="info" style="width: 24px; height: 24px;"></i>';
      iconContainer.style.color = 'var(--primary)';
      iconContainer.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
    }
    if (window.lucide) { lucide.createIcons(); }

    document.getElementById('confirm-modal').classList.add('visible');
  }

  document.getElementById('btn-confirm-execute').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    document.getElementById('confirm-modal').classList.remove('visible');
  });

  // Keyboard close modal support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeConfirm = document.getElementById('confirm-modal');
      if (activeConfirm && activeConfirm.classList.contains('visible')) {
        activeConfirm.classList.remove('visible');
      }
    }
  });


  // Preset bindings for page form
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const imgInput = document.getElementById('banner-page-image');
      if (imgInput) {
        imgInput.value = btn.getAttribute('data-url');
        const uploadSpan = document.querySelector('#banner-page-upload-zone span');
        if (uploadSpan) {
          uploadSpan.textContent = `Preset selected: ${btn.textContent}`;
          uploadSpan.style.color = 'var(--primary)';
        }
        showToast(`Preset "${btn.textContent}" loaded.`);
      }
    });
  });

  // Setup Drag & Drop File Upload listeners
  const uploadZone = document.getElementById('banner-page-upload-zone');
  const fileInput = document.getElementById('banner-page-file-input');
  const hiddenImageInput = document.getElementById('banner-page-image');

  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--primary)';
      uploadZone.style.background = 'rgba(79, 70, 229, 0.05)';
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.style.borderColor = 'var(--border-admin)';
      uploadZone.style.background = 'rgba(255,255,255,0.02)';
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--border-admin)';
      uploadZone.style.background = 'rgba(255,255,255,0.02)';
      const file = e.dataTransfer.files[0];
      if (file) {
        handleUploadedFile(file);
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        handleUploadedFile(file);
      }
    });
  }

  function handleUploadedFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      document.getElementById('banner-page-image').value = src;
      
      const isVideo = file.type.startsWith('video/');
      const detectedType = isVideo ? 'video' : 'image';
      document.getElementById('banner-page-content-type').value = detectedType;
      
      document.getElementById('banner-upload-prompt').style.display = 'none';
      const previewArea = document.getElementById('banner-media-preview');
      previewArea.style.display = 'flex';
      
      const imgPreview = document.getElementById('banner-preview-img');
      const vidPreview = document.getElementById('banner-preview-vid');
      
      if (isVideo) {
        imgPreview.style.display = 'none';
        vidPreview.style.display = 'block';
        vidPreview.src = src;
      } else {
        vidPreview.style.display = 'none';
        imgPreview.style.display = 'block';
        imgPreview.src = src;
      }
      
      document.getElementById('banner-preview-filename').textContent = file.name;
      document.getElementById('banner-detected-type').textContent = detectedType.toUpperCase();
      
      showToast(`Selected "${file.name}" for upload.`);
    };
    reader.readAsDataURL(file);
  }

  function resetMediaPreview() {
    document.getElementById('banner-page-image').value = '';
    document.getElementById('banner-page-file-input').value = '';
    document.getElementById('banner-upload-prompt').style.display = 'flex';
    document.getElementById('banner-media-preview').style.display = 'none';
    document.getElementById('banner-preview-img').src = '';
    document.getElementById('banner-preview-vid').src = '';
  }

  const btnReplaceMedia = document.getElementById('btn-replace-media');
  if (btnReplaceMedia) {
    btnReplaceMedia.addEventListener('click', () => {
      document.getElementById('banner-page-file-input').click();
    });
  }
  
  const btnRemoveMedia = document.getElementById('btn-remove-media');
  if (btnRemoveMedia) {
    btnRemoveMedia.addEventListener('click', resetMediaPreview);
  }

  // Navigation cancellation helper for Banners
  document.querySelectorAll('.btn-cancel-banner').forEach(btn => {
    btn.addEventListener('click', () => {
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById('tab-banners').classList.add('active');
      tabTitle.textContent = 'Banners';
      tabDescription.textContent = 'Manage promotional banners and media.';
      breadcrumbCurrent.textContent = 'Banners';
      
      // Stop any playing video
      const viewVideo = document.getElementById('banner-view-video');
      if (viewVideo) {
        viewVideo.pause();
        viewVideo.src = '';
      }
    });
  });

  // CRUD actions for Banners (Page based)
  document.getElementById('btn-add-banner').addEventListener('click', () => {
    document.getElementById('banner-form-page').reset();
    resetMediaPreview();
    document.getElementById('banner-page-id').value = '';
    document.getElementById('btn-save-banner').textContent = 'Save Banner';
    
    document.getElementById('banner-page-start-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('banner-page-start-time').value = '08:00';
    document.getElementById('banner-page-end-date').value = new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0];
    document.getElementById('banner-page-end-time').value = '22:00';
    document.getElementById('banner-page-active').checked = true;
    document.getElementById('banner-status-label').textContent = 'Active';
    document.getElementById('banner-date-error').style.display = 'none';

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-banner-form').classList.add('active');
    tabTitle.textContent = 'Add Banner';
    tabDescription.textContent = 'Create and schedule promotional content for your TV displays.';
    breadcrumbCurrent.textContent = 'Add Banner';
  });

  const activeSwitch = document.getElementById('banner-page-active');
  if (activeSwitch) {
    activeSwitch.addEventListener('change', (e) => {
      document.getElementById('banner-status-label').textContent = e.target.checked ? 'Active' : 'Inactive';
    });
  }

  document.getElementById('banner-form-page').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const startDate = document.getElementById('banner-page-start-date').value;
    const startTime = document.getElementById('banner-page-start-time').value;
    const endDate = document.getElementById('banner-page-end-date').value;
    const endTime = document.getElementById('banner-page-end-time').value;
    
    // Validate Dates
    const startObj = new Date(`${startDate}T${startTime}`);
    const endObj = new Date(`${endDate}T${endTime}`);
    
    if (startObj >= endObj) {
      document.getElementById('banner-date-error').style.display = 'block';
      return;
    } else {
      document.getElementById('banner-date-error').style.display = 'none';
    }

    const id = document.getElementById('banner-page-id').value;
    const title = document.getElementById('banner-page-title').value.trim();
    const image = document.getElementById('banner-page-image').value.trim();
    const duration = parseInt(document.getElementById('banner-page-duration').value) || 8;
    const priority = parseInt(document.getElementById('banner-page-priority').value) || 1;
    const contentType = document.getElementById('banner-page-content-type').value;
    const active = document.getElementById('banner-page-active').checked;

    if (!image) {
      showToast('Please upload a banner media file.');
      return;
    }

    const list = KioskStore.getBanners();
    if (id) {
      const b = list.find(item => item.id === id);
      if (b) {
        Object.assign(b, { title, image, duration, priority, startDate, startTime, endDate, endTime, contentType, active });
      }
    } else {
      list.push({ id: 'banner-' + Date.now(), title, image, duration, priority, startDate, startTime, endDate, endTime, contentType, active, playlistId: 'play-main' });
    }

    KioskStore.setBanners(list);
    showToast('Banner created successfully.');
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-banners').classList.add('active');
    tabTitle.textContent = 'Banners';
    tabDescription.textContent = 'Manage promotional banners and media.';
    breadcrumbCurrent.textContent = 'Banners';
  });

  function editBanner(id) {
    const banners = KioskStore.getBanners();
    const b = banners.find(item => item.id === id);
    if (!b) return;

    document.getElementById('banner-page-id').value = b.id;
    document.getElementById('banner-page-title').value = b.title;
    document.getElementById('banner-page-image').value = b.image;
    document.getElementById('banner-page-duration').value = b.duration;
    document.getElementById('banner-page-priority').value = b.priority;
    document.getElementById('banner-page-start-date').value = b.startDate;
    document.getElementById('banner-page-start-time').value = b.startTime || '08:00';
    document.getElementById('banner-page-end-date').value = b.endDate;
    document.getElementById('banner-page-end-time').value = b.endTime || '22:00';
    document.getElementById('banner-page-content-type').value = b.contentType;
    document.getElementById('banner-page-active').checked = b.active;
    document.getElementById('banner-status-label').textContent = b.active ? 'Active' : 'Inactive';
    document.getElementById('banner-date-error').style.display = 'none';

    // Setup media preview
    document.getElementById('banner-upload-prompt').style.display = 'none';
    const previewArea = document.getElementById('banner-media-preview');
    previewArea.style.display = 'flex';
    
    const imgPreview = document.getElementById('banner-preview-img');
    const vidPreview = document.getElementById('banner-preview-vid');
    
    if (b.contentType === 'video') {
      imgPreview.style.display = 'none';
      vidPreview.style.display = 'block';
      vidPreview.src = b.image;
    } else {
      vidPreview.style.display = 'none';
      imgPreview.style.display = 'block';
      imgPreview.src = b.image;
    }
    
    document.getElementById('banner-preview-filename').textContent = 'existing_media';
    document.getElementById('banner-detected-type').textContent = b.contentType.toUpperCase();

    document.getElementById('btn-save-banner').textContent = 'Save Changes';
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-banner-form').classList.add('active');
    tabTitle.textContent = 'Edit Banner';
    tabDescription.textContent = 'Create and schedule promotional content for your TV displays.';
    breadcrumbCurrent.textContent = 'Edit Banner';
  }

  function previewBanner(id) {
    const banners = KioskStore.getBanners();
    const b = banners.find(item => item.id === id);
    if (!b) return;

    document.getElementById('banner-view-title').textContent = b.title;
    
    const viewImg = document.getElementById('banner-view-image');
    const viewVid = document.getElementById('banner-view-video');
    
    if (b.contentType === 'video') {
      viewImg.style.display = 'none';
      viewVid.style.display = 'block';
      viewVid.src = b.image;
    } else {
      viewVid.style.display = 'none';
      viewImg.style.display = 'block';
      viewImg.src = b.image;
    }

    document.getElementById('banner-view-type').textContent = b.contentType.toUpperCase();
    document.getElementById('banner-view-duration').textContent = b.duration;
    document.getElementById('banner-view-priority').textContent = b.priority;
    
    const startFormatted = formatDatePretty(b.startDate, b.startTime);
    const endFormatted = formatDatePretty(b.endDate, b.endTime);
    document.getElementById('banner-view-schedule').innerHTML = `${startFormatted}<br><span style="color:var(--text-admin-muted);">to</span><br>${endFormatted}`;
    
    const statusEl = document.getElementById('banner-view-status');
    statusEl.textContent = b.active ? 'Active' : 'Inactive';
    statusEl.className = b.active ? 'badge touch-badge' : 'badge danger-badge';

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-banner-view').classList.add('active');
    tabTitle.textContent = 'Banner Details';
    tabDescription.textContent = 'View configuration and preview media.';
    breadcrumbCurrent.textContent = 'View Banner';
  }

  function deleteBanner(id) {
    const list = KioskStore.getBanners();
    const b = list.find(item => item.id === id);
    const name = b ? b.title : 'Banner';
    triggerConfirm(`Delete ${name}?`, 'Are you sure you want to delete this item? This action cannot be undone.', () => {
      KioskStore.setBanners(list.filter(item => item.id !== id));
      showToast('Banner deleted.');
    }, { isDestructive: true, confirmText: 'Yes, Delete' });
  }

  // Navigation cancellation helper for Playlists
  document.querySelectorAll('.btn-cancel-playlist').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(window.playlistPreviewInterval);
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById('tab-playlists').classList.add('active');
      tabTitle.textContent = 'Playlists';
      tabDescription.textContent = 'Create and configure media loops.';
      breadcrumbCurrent.textContent = 'Playlists';
    });
  });

  // Playlists add/edit (Page based)
  let currentEditingPlaylistBanners = [];

  function renderPlaylistBannersSelect() {
    const banners = KioskStore.getBanners() || [];
    const searchVal = (document.getElementById('playlist-banners-search')?.value || '').toLowerCase();
    
    const availableContainer = document.getElementById('playlist-banners-available');
    const selectedContainer = document.getElementById('playlist-banners-selected');
    
    if (!availableContainer || !selectedContainer) return;
    
    availableContainer.innerHTML = '';
    selectedContainer.innerHTML = '';

    // Render selected banners in order
    if (currentEditingPlaylistBanners.length > 0) {
      currentEditingPlaylistBanners.forEach((bid, index) => {
        const b = banners.find(x => x.id === bid);
        if (!b) return;
        selectedContainer.innerHTML += `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-admin); margin-bottom: 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="background: var(--primary); color: white; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold;">${index + 1}</span>
              <img src="${b.image}" style="width: 40px; height: 24px; object-fit: cover; border-radius: 4px;" alt="Banner">
              <span style="font-size:0.85rem;">${b.title}</span>
            </div>
            <div style="display: flex; gap: 0.25rem;">
              <button type="button" class="btn-action btn-move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} style="padding: 0.2rem;"><i data-lucide="arrow-up" style="width:14px;height:14px;"></i></button>
              <button type="button" class="btn-action btn-move-down" data-index="${index}" ${index === currentEditingPlaylistBanners.length - 1 ? 'disabled' : ''} style="padding: 0.2rem;"><i data-lucide="arrow-down" style="width:14px;height:14px;"></i></button>
              <button type="button" class="btn-action btn-action-danger btn-remove-playlist-banner" data-id="${b.id}" style="padding: 0.2rem;"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
            </div>
          </div>
        `;
      });
    } else {
      selectedContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-admin-muted); border: 1px dashed var(--border-admin); border-radius: var(--radius-sm);">No banners selected.</div>';
    }

    // Render unselected available banners with search filter
    const unselected = banners.filter(b => !currentEditingPlaylistBanners.includes(b.id) && b.title.toLowerCase().includes(searchVal));
    if (unselected.length > 0) {
      unselected.forEach(b => {
        availableContainer.innerHTML += `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; opacity: 0.85;">
              <img src="${b.image}" style="width: 40px; height: 24px; object-fit: cover; border-radius: 4px;" alt="Banner">
              <span style="font-size:0.85rem;">${b.title} <small style="color: var(--text-admin-muted);">(Priority ${b.priority})</small></span>
            </div>
            <button type="button" class="btn btn-secondary btn-add-playlist-banner" data-id="${b.id}" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;"><i data-lucide="plus" style="width:12px;height:12px;"></i> Add</button>
          </div>
        `;
      });
    } else {
      availableContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-admin-muted);">No available banners found.</div>';
    }

    if (window.lucide) lucide.createIcons();

    // Bind event handlers
    document.querySelectorAll('.btn-add-playlist-banner').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        currentEditingPlaylistBanners.push(id);
        renderPlaylistBannersSelect();
      });
    });

    document.querySelectorAll('.btn-remove-playlist-banner').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        currentEditingPlaylistBanners = currentEditingPlaylistBanners.filter(x => x !== id);
        renderPlaylistBannersSelect();
      });
    });

    document.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        if (index > 0) {
          const temp = currentEditingPlaylistBanners[index];
          currentEditingPlaylistBanners[index] = currentEditingPlaylistBanners[index - 1];
          currentEditingPlaylistBanners[index - 1] = temp;
          renderPlaylistBannersSelect();
        }
      });
    });

    document.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        if (index < currentEditingPlaylistBanners.length - 1) {
          const temp = currentEditingPlaylistBanners[index];
          currentEditingPlaylistBanners[index] = currentEditingPlaylistBanners[index + 1];
          currentEditingPlaylistBanners[index + 1] = temp;
          renderPlaylistBannersSelect();
        }
      });
    });
  }

  // Bind input and select/clear controls once
  document.getElementById('playlist-banners-search')?.addEventListener('input', () => {
    renderPlaylistBannersSelect();
  });

  document.getElementById('btn-playlist-select-all')?.addEventListener('click', () => {
    const banners = KioskStore.getBanners() || [];
    currentEditingPlaylistBanners = banners.map(b => b.id);
    renderPlaylistBannersSelect();
  });

  document.getElementById('btn-playlist-clear-all')?.addEventListener('click', () => {
    currentEditingPlaylistBanners = [];
    renderPlaylistBannersSelect();
  });

  document.getElementById('btn-add-playlists').addEventListener('click', () => {
    document.getElementById('playlist-form-page').reset();
    document.getElementById('playlist-page-id').value = '';
    document.getElementById('playlist-form-title-h3').textContent = 'Add Playlist';

    currentEditingPlaylistBanners = [];
    renderPlaylistBannersSelect();

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-playlist-form').classList.add('active');
    tabTitle.textContent = 'Add Playlist';
    tabDescription.textContent = 'Create dynamic media cycles.';
    breadcrumbCurrent.textContent = 'Add Playlist';
  });

  document.getElementById('playlist-form-page').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('playlist-page-id').value;
    const name = document.getElementById('playlist-page-name').value.trim();

    const bannerIds = [...currentEditingPlaylistBanners];

    if (bannerIds.length === 0) {
      showToast('Please select at least one banner for the playlist.', 'error');
      return;
    }

    const list = KioskStore.getPlaylists() || [];
    if (id) {
      const p = list.find(item => item.id === id);
      if (p) Object.assign(p, { name, bannerCount: bannerIds.length, bannerIds, updatedDate: new Date().toLocaleDateString() });
    } else {
      list.push({ id: 'play-' + Date.now(), name, bannerCount: bannerIds.length, bannerIds, assignedTVs: 'None', status: 'active', updatedDate: new Date().toLocaleDateString() });
    }

    KioskStore.setPlaylists(list);
    showToast(`Playlist "${name}" saved.`);
    
    // Return
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-playlists').classList.add('active');
    tabTitle.textContent = 'Playlists';
    tabDescription.textContent = 'Create and configure media loops.';
    breadcrumbCurrent.textContent = 'Playlists';
    renderPlaylists();
  });

  function editPlaylist(id) {
    const playlists = KioskStore.getPlaylists();
    const p = playlists.find(item => item.id === id);
    if (!p) return;

    document.getElementById('playlist-page-id').value = p.id;
    document.getElementById('playlist-page-name').value = p.name;
    document.getElementById('playlist-form-title-h3').textContent = 'Edit Playlist';

    currentEditingPlaylistBanners = [...p.bannerIds];
    renderPlaylistBannersSelect();

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-playlist-form').classList.add('active');
    tabTitle.textContent = 'Edit Playlist';
    tabDescription.textContent = 'Modify dynamic media cycles.';
    breadcrumbCurrent.textContent = 'Edit Playlist';
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

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-playlist-view').classList.add('active');
    tabTitle.textContent = 'Playlist Playback';
    tabDescription.textContent = 'Preview looping broadcast content.';
    breadcrumbCurrent.textContent = 'View Playlist';

    const imageEl = document.getElementById('playlist-page-view-image');
    const labelEl = document.getElementById('playlist-page-view-label');

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
    const list = KioskStore.getPlaylists();
    const p = list.find(item => item.id === id);
    const name = p ? p.name : 'Playlist';
    triggerConfirm(`Delete ${name}?`, 'Are you sure you want to delete this item? This action cannot be undone.', () => {
      KioskStore.setPlaylists(list.filter(item => item.id !== id));
      showToast('Playlist deleted.');
    }, { isDestructive: true, confirmText: 'Yes, Delete' });
  }

  // Navigation cancellation helper for TVs
  document.querySelectorAll('.btn-cancel-tv').forEach(btn => {
    btn.addEventListener('click', () => {
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById('tab-tvs').classList.add('active');
      tabTitle.textContent = 'TVs';
      tabDescription.textContent = 'Assign and map signage loop schedules.';
      breadcrumbCurrent.textContent = 'TVs';
    });
  });

  // TVs CRUD (Page based)
  document.getElementById('btn-add-tvs').addEventListener('click', () => {
    document.getElementById('tv-form-page').reset();
    document.getElementById('tv-page-id').value = '';
    document.getElementById('tv-form-title-h3').textContent = 'Add TV';

    const playlists = KioskStore.getPlaylists() || [];
    const select = document.getElementById('tv-page-playlist-select');
    select.innerHTML = '';
    playlists.forEach(pl => {
      select.innerHTML += `<option value="${pl.id}">${pl.name}</option>`;
    });

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-tv-form').classList.add('active');
    tabTitle.textContent = 'Add TV';
    tabDescription.textContent = 'Configure digital screen identity.';
    breadcrumbCurrent.textContent = 'Add TV';
  });

  document.getElementById('tv-form-page').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('tv-page-id').value;
    const name = document.getElementById('tv-page-name').value.trim();
    const loc = document.getElementById('tv-page-location').value.trim();
    const grp = document.getElementById('tv-page-group').value.trim();
    const plid = document.getElementById('tv-page-playlist-select').value;
    const status = document.getElementById('tv-page-status').value;

    const list = KioskStore.getTVs() || [];
    if (id) {
      const t = list.find(item => item.id === id);
      if (t) Object.assign(t, { name, location: loc, tvGroup: grp, assignedPlaylistId: plid, status });
    } else {
      list.push({ id: 'tv-' + Date.now().toString(36), name, location: loc, tvGroup: grp, assignedPlaylistId: plid, status, connectionStatus: 'online', lastActive: 'Just now' });
    }

    KioskStore.setTVs(list);
    showToast(`TV Screen "${name}" configured.`);

    // Return
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-tvs').classList.add('active');
    tabTitle.textContent = 'TVs';
    tabDescription.textContent = 'Assign and map signage loop schedules.';
    breadcrumbCurrent.textContent = 'TVs';
  });

  function editTV(id) {
    const tvs = KioskStore.getTVs();
    const t = tvs.find(item => item.id === id);
    if (!t) return;

    document.getElementById('tv-page-id').value = t.id;
    document.getElementById('tv-page-name').value = t.name;
    document.getElementById('tv-page-location').value = t.location || '';
    document.getElementById('tv-page-group').value = t.tvGroup || '';
    document.getElementById('tv-page-status').value = t.status;

    const playlists = KioskStore.getPlaylists() || [];
    const select = document.getElementById('tv-page-playlist-select');
    select.innerHTML = '';
    playlists.forEach(pl => {
      const sel = pl.id === t.assignedPlaylistId ? 'selected' : '';
      select.innerHTML += `<option value="${pl.id}" ${sel}>${pl.name}</option>`;
    });

    document.getElementById('tv-form-title-h3').textContent = 'Edit TV Settings';

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-tv-form').classList.add('active');
    tabTitle.textContent = 'Edit TV Settings';
    tabDescription.textContent = 'Configure digital screen identity.';
    breadcrumbCurrent.textContent = 'Edit TV';
  }

  function deleteTV(id) {
    const list = KioskStore.getTVs();
    const t = list.find(item => item.id === id);
    const name = t ? t.name : 'TV Screen';
    triggerConfirm(`Delete ${name}?`, 'Are you sure you want to delete this item? This action cannot be undone.', () => {
      KioskStore.setTVs(list.filter(item => item.id !== id));
      showToast('TV display unregistered.');
    }, { isDestructive: true, confirmText: 'Yes, Delete' });
  }

  // Fallback setup form
  document.getElementById('fallback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    triggerConfirm('Replace Fallback Content', 'Are you sure you want to replace the active fallback content?', () => {
      const title = document.getElementById('fallback-title').value.trim();
      const description = document.getElementById('fallback-desc').value.trim();
      const image = document.getElementById('fallback-image').value.trim();

      const config = KioskStore.getConfig();
      config.fallbackContent = {
        title, description, image, contentType: 'image', status: 'active', lastUpdated: new Date().toLocaleDateString()
      };
      KioskStore.setConfig(config);
      showToast('Active Fallback Content replaced successfully.');
    }, { isDestructive: false, confirmText: 'Yes, Replace' });
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
    document.getElementById('preview-modal-duration').textContent = 'Γê₧';
    document.getElementById('preview-modal-priority').textContent = 'N/A';
    document.getElementById('preview-modal-schedule').textContent = 'Unconditional Fallback';
    document.getElementById('preview-modal-status').textContent = 'DEFAULT STATE';

    document.getElementById('banner-preview-modal').classList.add('visible');
  });

  // Category forms
  document.getElementById('btn-add-categories').addEventListener('click', () => {
    document.getElementById('category-name-input').value = '';
    document.getElementById('category-desc-input').value = '';
    document.getElementById('category-status-input').checked = true;
    
    let hidden = document.getElementById('category-page-id');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.id = 'category-page-id';
      hidden.type = 'hidden';
      document.getElementById('tab-category-form').appendChild(hidden);
    }
    hidden.value = '';

    document.getElementById('category-form-title').textContent = 'Add Category';
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-category-form').classList.add('active');
    tabTitle.textContent = 'Add Category';
    tabDescription.textContent = 'Create a new category for your products.';
    breadcrumbCurrent.textContent = 'Add Category';
  });

  document.getElementById('btn-save-category').addEventListener('click', (e) => {
    e.preventDefault();
    const hidden = document.getElementById('category-page-id');
    const id = hidden ? hidden.value : '';
    const name = document.getElementById('category-name-input').value.trim();
    const desc = document.getElementById('category-desc-input').value.trim();
    const status = document.getElementById('category-status-input').checked ? 'active' : 'inactive';

    if (!name) {
      showToast('Category name is required.', 'error');
      return;
    }

    const list = KioskStore.getCategories() || [];
    if (id) {
      const c = list.find(item => item.id === id);
      if (c) Object.assign(c, { name, icon: 'folder', status, description: desc });
    } else {
      list.push({ id: 'cat-' + Date.now(), name, icon: 'folder', status, description: desc, count: 0 });
    }

    KioskStore.setCategories(list);
    showToast(`Category "${name}" saved.`);
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-categories').classList.add('active');
    tabTitle.textContent = 'Categories';
    tabDescription.textContent = 'Manage category folders.';
    breadcrumbCurrent.textContent = 'Categories';
    renderCategories();
  });

  function editCategory(id) {
    const cats = KioskStore.getCategories();
    const c = cats.find(item => item.id === id);
    if (!c) return;

    let hidden = document.getElementById('category-page-id');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.id = 'category-page-id';
      hidden.type = 'hidden';
      document.getElementById('tab-category-form').appendChild(hidden);
    }
    hidden.value = c.id;

    document.getElementById('category-name-input').value = c.name;
    document.getElementById('category-desc-input').value = c.description || '';
    document.getElementById('category-status-input').checked = c.status === 'active';

    document.getElementById('category-form-title').textContent = 'Edit Category';
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-category-form').classList.add('active');
    tabTitle.textContent = 'Edit Category';
    tabDescription.textContent = 'Modify folder details.';
    breadcrumbCurrent.textContent = 'Edit Category';
  }

  

  function deleteDiscount(id) {
    const list = KioskStore.getDiscounts();
    const d = list.find(item => item.id === id);
    const name = d ? d.name : 'Discount Campaign';
    triggerConfirm(`Delete ${name}?`, 'Are you sure you want to delete this item? This action cannot be undone.', () => {
      KioskStore.setDiscounts(list.filter(item => item.id !== id));
      showToast('Discount campaign deleted.');
      renderDiscounts();
    }, { isDestructive: true, confirmText: 'Yes, Delete' });
  }

  // Kiosk Add/Edit/View
  document.getElementById('btn-add-kiosks').addEventListener('click', () => {
    document.getElementById('kiosk-form-page').reset();
    document.getElementById('kiosk-page-id').value = '';
    document.getElementById('kiosk-page-id-input').disabled = false;
    
    document.getElementById('kiosk-form-title-h3').textContent = 'Add Kiosk';
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-kiosk-form').classList.add('active');
    tabTitle.textContent = 'Add Kiosk';
    tabDescription.textContent = 'Register a new kiosk.';
    breadcrumbCurrent.textContent = 'Add Kiosk';
  });

  document.getElementById('kiosk-form-page').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('kiosk-page-id').value;
    const idInput = document.getElementById('kiosk-page-id-input').value.trim();
    const loc = document.getElementById('kiosk-page-location').value.trim();
    const config = document.getElementById('kiosk-page-config').value;
    const status = document.getElementById('kiosk-page-status').value;

    const list = KioskStore.getKiosks() || [];
    if (id) {
      const k = list.find(item => item.id === id);
      if (k) Object.assign(k, { location: loc, configuration: config, status });
    } else {
      list.push({ id: idInput, name: idInput, location: loc, configuration: config, status, connectionStatus: 'online', lastActive: 'Just now' });
    }

    KioskStore.setKiosks(list);
    showToast(`Kiosk "${id || idInput}" saved.`);
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-kiosks').classList.add('active');
    tabTitle.textContent = 'Kiosks';
    tabDescription.textContent = 'Manage self-order hardware.';
    breadcrumbCurrent.textContent = 'Kiosks';
    renderKiosks();
  });

  function editKiosk(id) {
    const list = KioskStore.getKiosks();
    const k = list.find(item => item.id === id);
    if (!k) return;

    document.getElementById('kiosk-page-id').value = k.id;
    document.getElementById('kiosk-page-id-input').value = k.id;
    document.getElementById('kiosk-page-id-input').disabled = true;
    document.getElementById('kiosk-page-location').value = k.location || '';
    document.getElementById('kiosk-page-config').value = k.configuration || 'standard';
    document.getElementById('kiosk-page-status').value = k.status;

    document.getElementById('kiosk-form-title-h3').textContent = 'Edit Kiosk';
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-kiosk-form').classList.add('active');
    tabTitle.textContent = 'Edit Kiosk';
    tabDescription.textContent = 'Modify kiosk settings.';
    breadcrumbCurrent.textContent = 'Edit Kiosk';
  }

  function showKioskDetails(id) {
    const list = KioskStore.getKiosks() || [];
    const k = list.find(item => item.id === id);
    if (!k) return;

    document.getElementById('view-kiosk-id-val').textContent = k.id;
    document.getElementById('view-kiosk-location').textContent = k.location || 'Unknown';
    document.getElementById('view-kiosk-config').textContent = k.configuration || 'Standard Layout';
    document.getElementById('view-kiosk-connection').innerHTML = k.connectionStatus === 'online' 
      ? '<span style="color:#22c55e;">Online</span>' 
      : '<span style="color:#ef4444;">Offline</span>';
    document.getElementById('view-kiosk-last-active').textContent = k.lastActive || 'Never';
    document.getElementById('view-kiosk-status').innerHTML = k.status === 'active' 
      ? '<span class="status-badge status-active">Active</span>' 
      : '<span class="status-badge status-inactive">Inactive</span>';

    const editBtn = document.getElementById('btn-edit-kiosk-view');
    if (editBtn) {
      const newBtn = editBtn.cloneNode(true);
      editBtn.parentNode.replaceChild(newBtn, editBtn);
      newBtn.addEventListener('click', () => {
        editKiosk(k.id);
      });
    }

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-kiosk-view').classList.add('active');
    tabTitle.textContent = 'Kiosk Details';
    tabDescription.textContent = 'View configuration values.';
    breadcrumbCurrent.textContent = 'View Kiosk';
  }

  // Save kiosk configs
  document.getElementById('btn-save-kiosk-config').addEventListener('click', () => {
    triggerConfirm('Save Configuration', 'Are you sure you want to change Kiosk Configuration?', () => {
      const config = KioskStore.getConfig();
      config.storeName = document.getElementById('set-kiosk-store-name').value.trim();
      config.inactivityTimeout = parseInt(document.getElementById('set-inactivity-time').value) || 30;
      KioskStore.setConfig(config);
      showToast('Kiosk configurations saved.');
    }, { isDestructive: false, confirmText: 'Yes, Save' });
  });

  // Enable/Disable gateway
  function togglePaymentGateway(id) {
    const list = KioskStore.getPayments() || [];
    const p = list.find(item => item.id === id);
    if (p) {
      const currentEnabled = p.status === 'enabled';
      const title = currentEnabled ? `Deactivate ${p.name}?` : `Activate ${p.name}?`;
      const body = currentEnabled ? `Are you sure you want to deactivate this item?` : `Are you sure you want to activate this item?`;
      const confirmText = currentEnabled ? 'Yes, Deactivate' : 'Yes, Activate';
      triggerConfirm(title, body, () => {
        p.status = currentEnabled ? 'disabled' : 'enabled';
        KioskStore.setPayments(list);
        showToast(`${p.name} configured as ${p.status}.`);
      }, { isDestructive: currentEnabled, confirmText });
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
    document.getElementById('tv-view-name').textContent = t.name;
    document.getElementById('tv-view-id').textContent = t.id;
    document.getElementById('tv-view-loc').textContent = t.location || 'Counter';
    document.getElementById('tv-view-group').textContent = t.tvGroup || 'None';
    document.getElementById('tv-view-playlist').textContent = pl;
    document.getElementById('tv-view-status').textContent = t.status.toUpperCase();
    document.getElementById('tv-view-conn').textContent = t.connectionStatus.toUpperCase();
    document.getElementById('tv-view-active').textContent = t.lastActive;

    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById('tab-tv-view').classList.add('active');
    tabTitle.textContent = 'TV Screen Details';
    tabDescription.textContent = 'View hardware screen parameters.';
    breadcrumbCurrent.textContent = 'View TV';
  }

  

  function showRoleDetails() {
    document.getElementById('role-details-drawer').classList.add('visible');
  }

  // Bind key inputs filter render loops
  document.getElementById('playlists-search').addEventListener('input', renderPlaylists);
  document.getElementById('tvs-search').addEventListener('input', renderTVs);

  document.getElementById('products-search').addEventListener('input', renderProducts);
  const productSearchClear = document.getElementById('products-search-clear');
  if (productSearchClear) {
    productSearchClear.addEventListener('click', () => {
      document.getElementById('products-search').value = '';
      productPage = 1;
      renderProducts();
    });
  }
  
  const categorySearchClear = document.getElementById('categories-search-clear');
  if (categorySearchClear) {
    categorySearchClear.addEventListener('click', () => {
      document.getElementById('categories-search').value = '';
      categoryPage = 1;
      renderCategories();
    });
  }
  document.getElementById('categories-search').addEventListener('input', () => {
    categoryPage = 1;
    renderCategories();
  });
  
  const modifierSearchClear = document.getElementById('customisation-search-clear');
  if (modifierSearchClear) {
    modifierSearchClear.addEventListener('click', () => {
      document.getElementById('customisation-search').value = '';
      modifierPage = 1;
      renderModifiers();
    });
  }
  document.getElementById('customisation-search').addEventListener('input', () => {
    modifierPage = 1;
    renderModifiers();
  });

  document.getElementById('order-search').addEventListener('input', renderOrders);
  document.getElementById('order-filter-status').addEventListener('change', renderOrders);
  document.getElementById('order-filter-kiosk').addEventListener('change', renderOrders);
  document.getElementById('order-filter-pay').addEventListener('change', renderOrders);





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
    renderPaymentHistory();
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

  // Payment history cancellations
  document.querySelectorAll('.btn-cancel-pay-history').forEach(btn => {
    btn.addEventListener('click', () => {
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById('tab-payment-history').classList.add('active');
      tabTitle.textContent = 'Payment History';
      tabDescription.textContent = 'Monitor payment transactions and order links.';
      breadcrumbCurrent.textContent = 'Payment History';
    });
  });

  const searchPayInput = document.getElementById('payment-history-search');
  if (searchPayInput) {
    searchPayInput.addEventListener('input', renderPaymentHistory);
  }

  // Banner search clear button
  const bannerSearchClear = document.getElementById('banner-search-clear');
  if (bannerSearchClear) {
    bannerSearchClear.addEventListener('click', () => {
      const input = document.getElementById('banner-search');
      input.value = '';
      bannerPage = 1;
      renderBanners();
    });
  }
  // Reset page on search
  const bannerSearchInput = document.getElementById('banner-search');
  if (bannerSearchInput) {
    bannerSearchInput.addEventListener('input', () => {
      bannerPage = 1;
      renderBanners();
    });
  }

  // Pre-load setups
  loadKioskConfigs();
  refreshAll();

})();
