const INITIAL_CATEGORIES = [
  { id: 'cat-burgers', name: 'Gourmet Burgers', icon: '🍔', status: 'active', count: 2 },
  { id: 'cat-pizzas', name: 'Artisan Pizzas', icon: '🍕', status: 'active', count: 2 },
  { id: 'cat-sides', name: 'Crispy Sides', icon: '🍟', status: 'active', count: 2 },
  { id: 'cat-drinks', name: 'Refreshments', icon: '🥤', status: 'active', count: 2 },
  { id: 'cat-desserts', name: 'Sweet Delights', icon: '🍰', status: 'active', count: 2 }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-burger-classic',
    categoryId: 'cat-burgers',
    name: 'Truffle Angus Burger',
    description: '100% Angus beef patty, white truffle aioli, wild mushrooms, Swiss cheese, brioche bun.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    available: true,
    status: 'active',
    customizable: true,
    variants: [
      { name: 'Patty Size', options: [{ name: 'Single (150g)', price: 0 }, { name: 'Double (300g)', price: 3.50 }] }
    ],
    addOns: [
      { name: 'Extra Swiss Cheese', price: 1.00 },
      { name: 'Crispy Bacon Strip', price: 1.50 }
    ]
  },
  {
    id: 'prod-burger-spicy',
    categoryId: 'cat-burgers',
    name: 'Nashville Hot Chicken',
    description: 'Crispy buttermilk chicken breast, cayenne glaze, pickles, creamy slaw, honey-butter bun.',
    price: 12.49,
    image: 'https://images.unsplash.com/photo-1627662236973-4f8259fa2441?w=500&auto=format&fit=crop&q=80',
    available: true,
    status: 'active',
    customizable: true,
    variants: [
      { name: 'Spiciness Level', options: [{ name: 'Mild Kick', price: 0 }, { name: 'Hot Glow', price: 0 }, { name: 'Nashville Inferno', price: 0.50 }] }
    ],
    addOns: [
      { name: 'Extra Pickles', price: 0.50 }
    ]
  },
  {
    id: 'prod-pizza-pepperoni',
    categoryId: 'cat-pizzas',
    name: 'Pepperoni Honey Pizza',
    description: 'Sourdough crust, spicy salami, fresh mozzarella, organic hot honey drizzle.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
    available: true,
    status: 'active',
    customizable: true,
    variants: [
      { name: 'Size', options: [{ name: 'Personal 10"', price: 0 }, { name: 'Sharing 14"', price: 5.00 }] }
    ],
    addOns: [
      { name: 'Extra Pepperoni', price: 2.00 }
    ]
  }
];

const getRelativeDateString = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 16);
};

const INITIAL_BANNERS = [
  {
    id: 'banner-truffle-promo',
    title: 'Gourmet Truffle Burger Launch',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&auto=format&fit=crop&q=80',
    duration: 8,
    startDate: getRelativeDateString(-2).split('T')[0],
    startTime: '08:00',
    endDate: getRelativeDateString(5).split('T')[0],
    endTime: '22:00',
    priority: 1,
    contentType: 'image',
    active: true,
    playlistId: 'play-default'
  },
  {
    id: 'banner-pizza-discount',
    title: 'Flamin Honey Pizza Special',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
    duration: 6,
    startDate: getRelativeDateString(-1).split('T')[0],
    startTime: '10:00',
    endDate: getRelativeDateString(3).split('T')[0],
    endTime: '23:00',
    priority: 2,
    contentType: 'image',
    active: true,
    playlistId: 'play-default'
  }
];

const INITIAL_PLAYLISTS = [
  { id: 'play-default', name: 'Standard Lobby Signage', bannerCount: 2, bannerIds: ['banner-truffle-promo', 'banner-pizza-discount'], assignedTVs: '2 TVs', status: 'active', updatedDate: new Date().toLocaleDateString() }
];

const INITIAL_TVS = [
  { id: 'tv-counter-1', name: 'Order Counter 1 TV', location: 'Counter A', assignedPlaylistId: 'play-default', status: 'active', connectionStatus: 'online', lastActive: 'Just now', tvGroup: 'Counters' },
  { id: 'tv-entrance', name: 'Entrance Display TV', location: 'Main Foyer', assignedPlaylistId: 'play-default', status: 'active', connectionStatus: 'online', lastActive: 'Just now', tvGroup: 'Lobby' }
];

const INITIAL_KIOSKS = [
  { id: 'kiosk-01', name: 'Main Lobby Kiosk 1', location: 'Lobby A', status: 'active', availability: 'available', lastActive: 'Just now', connectionStatus: 'online' },
  { id: 'kiosk-02', name: 'Drive-Thru Lane Kiosk', location: 'Lane 1', status: 'active', availability: 'available', lastActive: 'Just now', connectionStatus: 'online' }
];

const INITIAL_TAXES = [
  { id: 'tax-vat', name: 'Standard VAT', percentage: 8, status: 'active' },
  { id: 'tax-service', name: 'Service Cess', percentage: 2.5, status: 'active' }
];

const INITIAL_DISCOUNTS = [
  { id: 'disc-welcome', name: 'WELCOME10', type: 'percentage', value: 10, applicableProducts: 'All products', startDate: getRelativeDateString(-10).split('T')[0], endDate: getRelativeDateString(30).split('T')[0], status: 'active' }
];

const INITIAL_PAYMENTS = [
  { id: 'pay-upi', name: 'UPI QR Payments', status: 'enabled', configuration: 'Gateway: Razorpay API' },
  { id: 'pay-card', name: 'Card Terminals', status: 'enabled', configuration: 'Hardware: Verifone SDK' },
  { id: 'pay-cash', name: 'Pay Cash at Counter', status: 'enabled', configuration: 'Counter: Staff-assisted' }
];

const INITIAL_ORDERS = [
  {
    orderId: 'ord-k9a2j3',
    orderToken: '101',
    kioskId: 'kiosk-01',
    dateTime: new Date().toISOString(),
    customerInfo: { name: 'Aravind K', mobile: '9876543210', dineIn: true, tableNumber: '14' },
    items: [{ name: 'Truffle Angus Burger', quantity: 1, unitPrice: 14.99, customizations: ['Double Patty (+$3.50)'] }],
    subtotalAmount: 18.49,
    taxAmount: 1.48,
    discountAmount: 1.85,
    totalAmount: 18.12,
    paymentMethod: 'upi',
    paymentStatus: 'success',
    orderStatus: 'created'
  }
];

const INITIAL_CONFIG = {
  storeName: 'Antigravity Gourmet Bistro',
  inactivityTimeout: 30,
  fallbackContent: {
    title: 'Welcome to Antigravity Bistro',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&auto=format&fit=crop&q=80',
    description: 'Self-ordering terminal active. Order freshly prepared gourmet meals at any kiosk.',
    contentType: 'image',
    status: 'active',
    lastUpdated: new Date().toLocaleDateString()
  }
};

const INITIAL_HARDWARE = {
  touchscreen: 'online',
  printer: 'online',
  qrDisplay: 'online',
  cardTerminal: 'online',
  customerDisplay: 'online'
};

// Export to window
window.INITIAL_CATEGORIES = INITIAL_CATEGORIES;
window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
window.INITIAL_BANNERS = INITIAL_BANNERS;
window.INITIAL_PLAYLISTS = INITIAL_PLAYLISTS;
window.INITIAL_TVS = INITIAL_TVS;
window.INITIAL_KIOSKS = INITIAL_KIOSKS;
window.INITIAL_TAXES = INITIAL_TAXES;
window.INITIAL_DISCOUNTS = INITIAL_DISCOUNTS;
window.INITIAL_PAYMENTS = INITIAL_PAYMENTS;
window.INITIAL_ORDERS = INITIAL_ORDERS;
window.INITIAL_CONFIG = INITIAL_CONFIG;
window.INITIAL_HARDWARE = INITIAL_HARDWARE;
