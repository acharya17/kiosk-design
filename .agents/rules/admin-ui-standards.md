# GLOBAL ADMIN UI STANDARDS — BANNER MANAGEMENT = MASTER REFERENCE

The Banner Management page is the REFERENCE IMPLEMENTATION for the entire Admin Panel.
Do NOT redesign patterns separately for other pages. Reuse the same components and visual patterns.
Only CONTENT and BUSINESS-SPECIFIC fields should change.

## 1. PAGE HEADER STANDARD
Every Admin page: Breadcrumb → Page Title → Short Description. Same structure, typography, spacing, alignment.

## 2. LIST PAGE STANDARD
Every management/list page follows: Page Header → [ Search ] [ Filter ] [ + Add ] → Active Filter Chips → Table → Pagination.
Apply to: Banners, Playlists, TVs, Categories, Products, Customisation, Taxes, Discounts, Kiosks, Orders, Payment History, Devices.
Only include Add when the business requirement allows creation.

## 3. SEARCH STANDARD
Same Search component as Banner Management: Search icon inside input, Clear X appears when text exists, Clicking X clears search. Works with filters and pagination. Same dimensions on every page.

## 4. FILTER STANDARD
Same Filter button and Filter Drawer/Popover as Banner Management. Multi-select, single-select, date range, search options. Footer: Clear All / Cancel / Apply Filters. Show filter chips after applying. Only filter options change per module.

## 5. TABLE STANDARD
Same header style, row height, cell padding, border, radius, typography, alignment, status badges, action buttons, hover behaviour as Banner Management. Columns intentionally sized by content.

## 6. TABLE ACTION STANDARD
Compact icon buttons: View → Eye, Edit → Pencil, More → MoreHorizontal. No large text buttons in rows. Delete always uses standard confirmation dialog.

## 7. STATUS STANDARD
Status Badge + Switch (Active [ON] / Inactive [OFF]). Changing status → Confirmation dialog → Confirm → Update → Toast. Same switch design everywhere.

## 8. PAGINATION STANDARD
Same pagination component as Banner Management. Responds to Search, Filters, Data changes.

## 9. ADD/EDIT PAGE STANDARD
Same form structure as Banner Add page: left-aligned, max-width container, section headers with underlines, 2-column grid, same field heights/labels/inputs/validation/button placement. Only fields change. Add → "Save [Entity]", Edit → "Save Changes".

## 10. VIEW PAGE STANDARD
Same details layout: Back button at top, summary sections, NOT an editable form. 2-column read-only grid with uppercase labels.

## 11. CONFIRMATION DIALOG
ONE reusable dialog for: Logout, Delete, Activate, Deactivate, Replace, Reset. Not for: View, Edit, Search, Filter, Preview, Navigation.

## 12. TOAST SYSTEM
Consistent success/update/delete/error/warning toasts across all modules.

## 13. EMPTY STATES
Proper empty state with icon, message, and action (Add or Clear Search/Filters).

## 14. LOADING STATES
Skeleton rows for tables, skeleton cards for cards, loading button for forms. Never show technical text.

## 15. ICON SYSTEM
Lucide Icons exclusively. Add→Plus, Edit→Pencil, View→Eye, Delete→Trash2, More→MoreHorizontal, Search→Search, Filter→ListFilter, Save→Save, Close→X, Back→ArrowLeft, Upload→Upload, Logout→LogOut. No emoji.

## 16. ALIGNMENT RULES
Same content start position, max width, horizontal padding, card padding, section spacing, input heights, button heights, icon sizes, table row heights on every page. Two-column forms: equal width, equal gap.

## 17. RESPONSIVENESS
Clean at 1440px, 1280px, 1024px. No overlapping, broken tables, misaligned buttons, clipped content.

## 18. SAMPLE DATA
Centralized realistic data across all modules. Connected records. Updates sync globally via KioskStore.

## 19. FORM VALIDATION
Inline validation, clear non-technical messages, highlight affected field, prevent invalid save.

## 20. VISUAL STYLE
Light neutral background, white cards, soft borders, subtle shadows, consistent rounded corners, clean typography, restrained accent color, standard outline icons, minimal decoration.

## 21. BUSINESS RULES
Do NOT duplicate fields or ask users to manually enter info that can be auto-detected. Do NOT force Add/Edit/Delete onto modules where those actions don't make business sense. Master Data: List→Add→View→Edit→Delete/Status. Configuration: View→Configure→Save. Monitoring: List→Search/Filter→View.

## 22. LOGIN
Three accounts: kiosk1@gmail→Admin, kiosk2@gmail→Kiosk, kiosk3@gmail→Display. Common password Bistro@123. NEVER display credentials in UI. Auto-route based on email after login.

## 23. FINAL QUALITY CHECK
Before ANY Admin page is complete, verify it matches Banner Management in: page header, search, search clear, filter, multi-select, apply, clear all, filter chips, table alignment, status switch, view, edit, delete confirmation, toast, pagination, empty state, loading state, icons, buttons, form alignment, add/edit structure, view structure, sample data. Design the Admin Panel as ONE PRODUCT.
