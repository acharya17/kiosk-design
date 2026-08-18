# TV Banner & Self-Order Kiosk - Interactive UX Prototype

This repository contains a high-fidelity, polished interactive UX prototype for a TV Digital Signage and Self-Ordering Kiosk terminal system, controlled via a unified Desktop Admin Panel.

The prototype is built entirely with vanilla **HTML5**, **CSS3 (Vanilla)**, and **JavaScript**, running entirely client-side. It utilizes `localStorage` to synchronize catalog updates, banner loops, and simulated system failure states across multiple windows in real-time.

---

## 🛠️ Project Structure

```
Kiosk/
├── index.html            # Main Portal & Launcher (Control Center)
├── admin.html            # Desktop Admin Panel (Dark Mode)
├── kiosk.html            # Customer Self-Order touchscreen kiosk (Portrait View)
├── tv.html               # 16:9 Landscape TV Digital Signage Billboard
├── css/
│   ├── variables.css     # Global style guide, colors, fonts, and transitions
│   ├── portal.css        # Layout styling for launcher portal page
│   ├── admin.css         # Dark theme for Desktop Admin Dashboard
│   ├── kiosk.css         # Soft, high-contrast portrait tablet view for kiosk
│   └── tv.css            # Landscape billboard TV canvas, margins, & ticker bars
└── js/
    ├── mockData.js       # Bootstrap catalogs, initial banners, & store configuration
    ├── store.js          # Shared state manager, subscriptions, & events
    ├── admin.js          # Admin dashboard grids, live order pipeline, and switch handles
    ├── kiosk.js          # Touch screen routing, customizations, payment flows, & timeouts
    └── tv.js             # Continuous loop manager, date filtering, and error skips
```

---

## 🚀 How to Run and Test

1. Double-click or open [index.html](index.html) in any modern browser.
2. Click the launchers to open the **Admin Dashboard**, **Customer Kiosk**, and **TV Banner** in separate tabs/windows. For the best experience, arrange them side-by-side on your monitor.
3. **Verify Catalog Sync**: Go to the Admin Dashboard (Products & Menu) and mark a product (e.g. Basque Cheesecake) as "In Stock" or edit the price of the Truffle Burger. Observe the Kiosk updating instantly.
4. **Verify TV Loop**: Modify a banner's details, priority, or duration in the Admin (TV Banners). Watch the TV display adjust its loop dynamically.
5. **Verify Failure Recovery**: Expand the red "Failure Simulations" panel in the bottom-right of the Admin window. Toggle "Network Connection Down". Attempt checking out on the Kiosk; it displays a service interruption shield immediately.
