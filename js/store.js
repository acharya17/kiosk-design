(function() {
  const KEYS = {
    CATEGORIES: 'kiosk_categories',
    PRODUCTS: 'kiosk_products',
    BANNERS: 'kiosk_banners',
    PLAYLISTS: 'kiosk_playlists',
    TVS: 'kiosk_tvs',
    KIOSKS: 'kiosk_kiosks',
    TAXES: 'kiosk_taxes',
    DISCOUNTS: 'kiosk_discounts',
    PAYMENTS: 'kiosk_payments',
    ORDERS: 'kiosk_orders',
    CONFIG: 'kiosk_config',
    HARDWARE: 'kiosk_hardware',
    SIMULATED_FAILURES: 'kiosk_simulated_failures'
  };

  const DEFAULT_FAILURES = {
    networkOffline: false,
    backendCrash: false,
    printerOffline: false,
    cardTerminalOffline: false,
    bannerLoadFail: false
  };

  function initStore() {
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(window.INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(window.INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.BANNERS)) {
      localStorage.setItem(KEYS.BANNERS, JSON.stringify(window.INITIAL_BANNERS));
    }
    if (!localStorage.getItem(KEYS.PLAYLISTS)) {
      localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(window.INITIAL_PLAYLISTS));
    }
    if (!localStorage.getItem(KEYS.TVS)) {
      localStorage.setItem(KEYS.TVS, JSON.stringify(window.INITIAL_TVS));
    }
    if (!localStorage.getItem(KEYS.KIOSKS)) {
      localStorage.setItem(KEYS.KIOSKS, JSON.stringify(window.INITIAL_KIOSKS));
    }
    if (!localStorage.getItem(KEYS.TAXES)) {
      localStorage.setItem(KEYS.TAXES, JSON.stringify(window.INITIAL_TAXES));
    }
    if (!localStorage.getItem(KEYS.DISCOUNTS)) {
      localStorage.setItem(KEYS.DISCOUNTS, JSON.stringify(window.INITIAL_DISCOUNTS));
    }
    if (!localStorage.getItem(KEYS.PAYMENTS)) {
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(window.INITIAL_PAYMENTS));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(window.INITIAL_ORDERS));
    }
    if (!localStorage.getItem(KEYS.CONFIG)) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(window.INITIAL_CONFIG));
    }
    if (!localStorage.getItem(KEYS.HARDWARE)) {
      localStorage.setItem(KEYS.HARDWARE, JSON.stringify(window.INITIAL_HARDWARE));
    }
    if (!localStorage.getItem(KEYS.SIMULATED_FAILURES)) {
      localStorage.setItem(KEYS.SIMULATED_FAILURES, JSON.stringify(DEFAULT_FAILURES));
    }
  }

  initStore();

  const KioskStore = {
    get(keyName) {
      try {
        return JSON.parse(localStorage.getItem(keyName));
      } catch (e) {
        console.error('Error reading key:', keyName, e);
        return null;
      }
    },

    set(keyName, data) {
      try {
        localStorage.setItem(keyName, JSON.stringify(data));
        const event = new CustomEvent('storeUpdated', { detail: { key: keyName, data } });
        window.dispatchEvent(event);
      } catch (e) {
        console.error('Error writing key:', keyName, e);
      }
    },

    resetAll() {
      localStorage.removeItem(KEYS.CATEGORIES);
      localStorage.removeItem(KEYS.PRODUCTS);
      localStorage.removeItem(KEYS.BANNERS);
      localStorage.removeItem(KEYS.PLAYLISTS);
      localStorage.removeItem(KEYS.TVS);
      localStorage.removeItem(KEYS.KIOSKS);
      localStorage.removeItem(KEYS.TAXES);
      localStorage.removeItem(KEYS.DISCOUNTS);
      localStorage.removeItem(KEYS.PAYMENTS);
      localStorage.removeItem(KEYS.ORDERS);
      localStorage.removeItem(KEYS.CONFIG);
      localStorage.removeItem(KEYS.HARDWARE);
      localStorage.removeItem(KEYS.SIMULATED_FAILURES);
      initStore();
      window.dispatchEvent(new CustomEvent('storeReset'));
    },

    getCategories() { return this.get(KEYS.CATEGORIES); },
    setCategories(data) { this.set(KEYS.CATEGORIES, data); },

    getProducts() { return this.get(KEYS.PRODUCTS); },
    setProducts(data) { this.set(KEYS.PRODUCTS, data); },

    getBanners() { return this.get(KEYS.BANNERS); },
    setBanners(data) { this.set(KEYS.BANNERS, data); },

    getPlaylists() { return this.get(KEYS.PLAYLISTS); },
    setPlaylists(data) { this.set(KEYS.PLAYLISTS, data); },

    getTVs() { return this.get(KEYS.TVS); },
    setTVs(data) { this.set(KEYS.TVS, data); },

    getKiosks() { return this.get(KEYS.KIOSKS); },
    setKiosks(data) { this.set(KEYS.KIOSKS, data); },

    getTaxes() { return this.get(KEYS.TAXES); },
    setTaxes(data) { this.set(KEYS.TAXES, data); },

    getDiscounts() { return this.get(KEYS.DISCOUNTS); },
    setDiscounts(data) { this.set(KEYS.DISCOUNTS, data); },

    getPayments() { return this.get(KEYS.PAYMENTS); },
    setPayments(data) { this.set(KEYS.PAYMENTS, data); },

    getOrders() { return this.get(KEYS.ORDERS); },
    setOrders(data) { this.set(KEYS.ORDERS, data); },
    addOrder(order) {
      const orders = this.getOrders();
      orders.unshift(order);
      this.setOrders(orders);
    },

    getConfig() { return this.get(KEYS.CONFIG); },
    setConfig(data) { this.set(KEYS.CONFIG, data); },

    getHardware() { return this.get(KEYS.HARDWARE); },
    setHardware(data) { this.set(KEYS.HARDWARE, data); },

    getFailures() { return this.get(KEYS.SIMULATED_FAILURES); },
    setFailures(data) { this.set(KEYS.SIMULATED_FAILURES, data); },
    updateFailure(key, val) {
      const current = this.getFailures();
      current[key] = val;
      this.setFailures(current);
    },

    subscribe(callback) {
      const handleStorageChange = (e) => {
        if (Object.values(KEYS).includes(e.key)) {
          callback(e.key, JSON.parse(e.newValue));
        }
      };

      const handleLocalChange = (e) => {
        callback(e.detail.key, e.detail.data);
      };

      const handleReset = () => {
        callback('reset', null);
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('storeUpdated', handleLocalChange);
      window.addEventListener('storeReset', handleReset);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('storeUpdated', handleLocalChange);
        window.removeEventListener('storeReset', handleReset);
      };
    },

    KEYS
  };

  window.KioskStore = KioskStore;
})();
