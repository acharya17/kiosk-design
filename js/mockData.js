// Centralized Mock Data Source for TV Banner & Self-Order Kiosk Suite

const getRelativeDateString = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 16).replace('T', ' ');
};

const INITIAL_CATEGORIES = [
  { id: 'cat-burgers', name: 'Burgers', icon: '🍔', status: 'active', count: 2 },
  { id: 'cat-beverages', name: 'Beverages', icon: '🥤', status: 'active', count: 2 },
  { id: 'cat-snacks', name: 'Snacks', icon: '🍟', status: 'active', count: 1 },
  { id: 'cat-desserts', name: 'Desserts', icon: '🍰', status: 'active', count: 0 }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-classic-burger',
    categoryId: 'cat-burgers',
    name: 'Classic Burger',
    description: 'Fresh beef patty lettuce, tomatoes, house special sauce on a soft brioche bun.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    available: true,
    status: 'active',
    customizable: true,
    variants: [
      { name: 'Large Size', options: [{ name: 'Regular', price: 0 }, { name: 'Large Size', price: 1.50 }] }
    ],
    addOns: [
      { name: 'Extra Cheese', price: 1.00 },
      { name: 'Spicy Sauce', price: 0.50 }
    ]
  },
  {
    id: 'prod-cheese-burger',
    categoryId: 'cat-burgers',
    name: 'Cheese Burger',
    description: 'Flame-grilled patty double melted Cheddar cheese, pickles, mustard, and ketchup.',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=500&auto=format&fit=crop&q=80',
    available: true,
    status: 'active',
    customizable: true,
    variants: [],
    addOns: [
      { name: 'Extra Cheese', price: 1.00 },
      { name: 'Spicy Sauce', price: 0.50 }
    ]
  },
  {
    id: 'prod-french-fries',
    categoryId: 'cat-snacks',
    name: 'French Fries',
    description: 'Golden crispy salted potatoes served with a side of garlic mayo dip.',
    price: 3.49,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    available: true,
    status: 'active',
    customizable: true,
    variants: [],
    addOns: [
      { name: 'Extra Topping', price: 1.25 }
    ]
  },
  {
    id: 'prod-cold-coffee',
    categoryId: 'cat-beverages',
    name: 'Cold Coffee',
    description: 'Chilled robust espresso blend shaken with sweet milk and ice cream.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    available: true,
    status: 'active',
    customizable: false,
    variants: [],
    addOns: []
  },
  {
    id: 'prod-chocolate-shake',
    categoryId: 'cat-beverages',
    name: 'Chocolate Shake',
    description: 'Thick rich dark chocolate shake topped with fresh chocolate whipped cream.',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
    available: false,
    status: 'inactive',
    customizable: false,
    variants: [],
    addOns: []
  }
];

const INITIAL_BANNERS = [
  {
    id: 'banner-summer',
    title: 'Summer Offer',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    duration: 8,
    startDate: getRelativeDateString(-2).split(' ')[0],
    startTime: '08:00',
    endDate: getRelativeDateString(10).split(' ')[0],
    endTime: '22:00',
    priority: 1,
    contentType: 'image',
    active: true,
    playlistId: 'play-main'
  },
  {
    id: 'banner-weekend',
    title: 'Weekend Special',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1200&auto=format&fit=crop&q=80',
    duration: 6,
    startDate: getRelativeDateString(-1).split(' ')[0],
    startTime: '10:00',
    endDate: getRelativeDateString(5).split(' ')[0],
    endTime: '23:00',
    priority: 2,
    contentType: 'image',
    active: true,
    playlistId: 'play-weekend'
  },
  {
    id: 'banner-new-launch',
    title: 'New Product Launch',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80',
    duration: 10,
    startDate: getRelativeDateString(0).split(' ')[0],
    startTime: '09:00',
    endDate: getRelativeDateString(15).split(' ')[0],
    endTime: '21:00',
    priority: 3,
    contentType: 'image',
    active: true,
    playlistId: 'play-main'
  },
  {
    id: 'banner-festival',
    title: 'Festival Offer',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80',
    duration: 7,
    startDate: getRelativeDateString(-5).split(' ')[0],
    startTime: '11:00',
    endDate: getRelativeDateString(-1).split(' ')[0],
    endTime: '20:00',
    priority: 4,
    contentType: 'image',
    active: false,
    playlistId: 'play-promo'
  },
  {
    id: 'banner-announcement',
    title: 'Store Announcement',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&auto=format&fit=crop&q=80',
    duration: 5,
    startDate: getRelativeDateString(-10).split(' ')[0],
    startTime: '07:00',
    endDate: getRelativeDateString(30).split(' ')[0],
    endTime: '23:59',
    priority: 5,
    contentType: 'image',
    active: true,
    playlistId: 'play-main'
  },
  {
    id: 'banner-lunch',
    title: 'Lunch Promotion',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    duration: 12,
    startDate: getRelativeDateString(0).split(' ')[0],
    startTime: '11:00',
    endDate: getRelativeDateString(5).split(' ')[0],
    endTime: '15:00',
    priority: 2,
    contentType: 'video',
    active: true,
    playlistId: 'play-weekend'
  }
];

const INITIAL_PLAYLISTS = [
  { id: 'play-main', name: 'Main Store Playlist', bannerCount: 3, bannerIds: ['banner-summer', 'banner-new-launch', 'banner-announcement'], assignedTVs: '2 TVs', status: 'active', updatedDate: new Date().toLocaleDateString() },
  { id: 'play-weekend', name: 'Weekend Playlist', bannerCount: 1, bannerIds: ['banner-weekend'], assignedTVs: '1 TV', status: 'active', updatedDate: new Date().toLocaleDateString() },
  { id: 'play-promo', name: 'Promotional Playlist', bannerCount: 1, bannerIds: ['banner-festival'], assignedTVs: 'None', status: 'inactive', updatedDate: new Date().toLocaleDateString() }
];

const INITIAL_TVS = [
  { id: 'TV-001', name: 'TV-001 Entrance', location: 'Main Entrance', assignedPlaylistId: 'play-main', status: 'active', connectionStatus: 'online', lastActive: 'Just now', tvGroup: 'Lobby' },
  { id: 'TV-002', name: 'TV-002 Food Court', location: 'Food Court', assignedPlaylistId: 'play-promo', status: 'active', connectionStatus: 'online', lastActive: 'Just now', tvGroup: 'Dining' },
  { id: 'TV-003', name: 'TV-003 Billing Area', location: 'Billing Area', assignedPlaylistId: 'play-weekend', status: 'active', connectionStatus: 'online', lastActive: 'Just now', tvGroup: 'Counters' },
  { id: 'TV-004', name: 'TV-004 Waiting Area', location: 'Waiting Area', assignedPlaylistId: 'play-main', status: 'active', connectionStatus: 'offline', lastActive: '12 mins ago', tvGroup: 'Lobby' }
];

const INITIAL_KIOSKS = [
  { id: 'Kiosk-001', name: 'Kiosk-001', location: 'Main Entrance', status: 'active', availability: 'available', lastActive: 'Just now', connectionStatus: 'online' },
  { id: 'Kiosk-002', name: 'Kiosk-002', location: 'Food Court', status: 'active', availability: 'available', lastActive: 'Just now', connectionStatus: 'online' },
  { id: 'Kiosk-003', name: 'Kiosk-003', location: 'Billing Area', status: 'active', availability: 'available', lastActive: 'Just now', connectionStatus: 'online' },
  { id: 'Kiosk-004', name: 'Kiosk-004', location: 'Waiting Area', status: 'warning', availability: 'available', lastActive: '5 mins ago', connectionStatus: 'warning' },
  { id: 'Kiosk-005', name: 'Kiosk-005', location: 'Second Floor', status: 'inactive', availability: 'maintenance', lastActive: '1 hour ago', connectionStatus: 'offline' }
];

const INITIAL_TAXES = [
  { id: 'tax-gst5', name: 'GST 5%', percentage: 5, status: 'active' },
  { id: 'tax-gst12', name: 'GST 12%', percentage: 12, status: 'active' }
];

const INITIAL_DISCOUNTS = [
  { id: 'disc-weekend', name: 'Weekend Offer', type: 'percentage', value: 10, applicableProducts: 'All products', startDate: getRelativeDateString(-1).split(' ')[0], endDate: getRelativeDateString(2).split(' ')[0], status: 'active' },
  { id: 'disc-festival', name: 'Festival Offer', type: 'fixed', value: 100, applicableProducts: 'Gourmet Burgers Only', startDate: getRelativeDateString(-5).split(' ')[0], endDate: getRelativeDateString(5).split(' ')[0], status: 'active' }
];

const INITIAL_PAYMENTS = [
  { id: 'pay-upi', name: 'UPI QR Payments', status: 'enabled', configuration: 'Gateway: Razorpay API' },
  { id: 'pay-card', name: 'Card Terminals', status: 'enabled', configuration: 'Hardware: Verifone SDK' },
  { id: 'pay-cash', name: 'Pay Cash at Counter', status: 'enabled', configuration: 'Counter: Staff-assisted' }
];

const INITIAL_ORDERS = [
  {
    orderId: 'ORD-1026',
    orderToken: '126',
    kioskId: 'Kiosk-002',
    dateTime: new Date().toISOString(),
    customerInfo: { name: 'Aravind', mobile: '9876543210', dineIn: true, tableNumber: '5' },
    items: [{ name: 'Classic Burger', quantity: 2, unitPrice: 420.00, customizations: [] }],
    subtotalAmount: 840.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    totalAmount: 840.00,
    paymentMethod: 'UPI QR Code',
    paymentStatus: 'success',
    orderStatus: 'completed'
  },
  {
    orderId: 'ORD-1025',
    orderToken: '125',
    kioskId: 'Kiosk-001',
    dateTime: new Date().toISOString(),
    customerInfo: { name: 'Divya S', mobile: '9123456789', dineIn: false, tableNumber: '' },
    items: [{ name: 'Cheese Burger', quantity: 1, unitPrice: 520.00, customizations: [] }],
    subtotalAmount: 520.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    totalAmount: 520.00,
    paymentMethod: 'UPI QR Code',
    paymentStatus: 'success',
    orderStatus: 'completed'
  },
  {
    orderId: 'ORD-1024',
    orderToken: '124',
    kioskId: 'Kiosk-004',
    dateTime: new Date().toISOString(),
    customerInfo: { name: 'Vikram', mobile: '9988776655', dineIn: true, tableNumber: '8' },
    items: [{ name: 'French Fries', quantity: 1, unitPrice: 1260.00, customizations: [] }],
    subtotalAmount: 1260.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    totalAmount: 1260.00,
    paymentMethod: 'Card Swipe',
    paymentStatus: 'pending',
    orderStatus: 'created'
  },
  {
    orderId: 'ORD-1023',
    orderToken: '123',
    kioskId: 'Kiosk-003',
    dateTime: new Date().toISOString(),
    customerInfo: { name: 'Sneha', mobile: '9888877777', dineIn: true, tableNumber: '12' },
    items: [{ name: 'Cold Coffee', quantity: 1, unitPrice: 390.00, customizations: [] }],
    subtotalAmount: 390.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    totalAmount: 390.00,
    paymentMethod: 'Cash',
    paymentStatus: 'success',
    orderStatus: 'completed'
  },
  {
    orderId: 'ORD-1022',
    orderToken: '122',
    kioskId: 'Kiosk-001',
    dateTime: new Date().toISOString(),
    customerInfo: { name: 'Rohan', mobile: '9123123123', dineIn: false, tableNumber: '' },
    items: [{ name: 'Cold Coffee', quantity: 1, unitPrice: 680.00, customizations: [] }],
    subtotalAmount: 680.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    totalAmount: 680.00,
    paymentMethod: 'Card Swipe',
    paymentStatus: 'failed',
    orderStatus: 'cancelled'
  }
];

const INITIAL_CONFIG = {
  storeName: 'Bistro Self-Order Kiosk',
  inactivityTimeout: 30,
  fallbackContent: {
    title: 'Welcome to Bistro Self-Order Suite',
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

// Export to window variables
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
