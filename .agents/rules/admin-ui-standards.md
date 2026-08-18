# GLOBAL ADMIN UI STANDARDS

Apply the following rules as GLOBAL design and interaction standards across the entire Admin Panel. These rules must be followed on EVERY page and in EVERY module.

## 1. GLOBAL PAGE STRUCTURE
Every page must use the same structure: Breadcrumb -> Page Title -> Short Description -> Page Toolbar -> Main Content -> Pagination / Footer where applicable.
Use consistent page width, left alignment, header spacing, section spacing, card padding, border radius, typography, and button sizing.

## 2. GLOBAL SEARCH
Every list page that supports search must use the same Search component.
- Default: `[ Search icon ] Search...`
- Active: `[ Search icon ] Search text [ X ]`
Clicking X clears the search. Standard icons: Search → Search, Clear → X (no emojis).

## 3. GLOBAL FILTER SYSTEM
Use `[ Search ] [ Filter ] [ Primary Action ]` in the toolbar.
Clicking Filter opens the reusable Filter Drawer/Popover (with Multi-select, Date range, Apply, Clear All).
Filter button shows active count (e.g. Filter 2). Show active filter chips above the table.

## 4. GLOBAL TABLE SYSTEM
Use the standard table component with fixed column structure, consistent alignment, same row height, vertical-align middle, consistent status badges, and subtle row separators. Actions aligned to the far right.

## 5. GLOBAL TABLE ACTIONS
Use compact icon buttons (View → Eye, Edit → Pencil, More → MoreHorizontal). Do not use large text buttons in rows.

## 6. GLOBAL STATUS CONTROL
Use Status Badge + Compact Switch (e.g., `Active [ ON ]`). Changing status triggers standard confirmation dialog, then updates switch, badge, and shows success toast. No large activate/deactivate buttons.

## 7. GLOBAL CONFIRMATION DIALOG
Use ONE reusable confirmation dialog for Logout, Delete, Activate, Deactivate, Replace, Reset.

## 8. GLOBAL ADD / EDIT FORM
Use the SAME layout for Add and Edit. Structure: Page Header -> Basic Information -> Configuration -> Additional Information -> Footer Actions (Cancel, Save). Ensure strict grid alignment.

## 9. GLOBAL VIEW / DETAILS PAGE
View pages should NOT look like editable forms. Structure: Page Header (Edit) -> Summary -> Basic Info -> Configuration -> Related Info.

## 10. GLOBAL BUTTON SYSTEM
- Primary: Accent background, White text
- Secondary: White/light background, Border, Dark text
- Destructive: Error color
- Icon button: Small square, standard icon

## 11. GLOBAL TOAST SYSTEM
Consistent success, update, delete, error, warning toasts.

## 12. GLOBAL LOADING STATES
Use Skeleton rows/cards. Never show technical text (e.g. API loading).

## 13. GLOBAL EMPTY STATES
Show proper empty state with icon, message, and action (Add or Clear Search/Filters).

## 14. GLOBAL PAGINATION
Standard pagination component with Previous, Page numbers, Next, active page, and Rows per page selector.

## 15. GLOBAL SEARCH + FILTER + TABLE PATTERN
Page Header -> Toolbar [ Search, Filter, Action ] -> Active chips -> Table -> Pagination.
Mandatory for Banners, Playlists, TVs, Categories, Products, Kiosks, Orders, Payments, etc.

## 16. GLOBAL SAMPLE DATA
Use realistic centralized sample data. Data must be connected across modules. Updates must sync globally.

## 17. GLOBAL ICON SYSTEM
Use Lucide Icons exclusively (Plus, Pencil, Eye, Trash2, MoreHorizontal, Search, ListFilter, Save, X, ArrowLeft, RefreshCw, Upload, Download, Settings, LogOut). No emojis.

## 18. GLOBAL ALIGNMENT RULES
All pages must use the same grid structures, paddings, and widths. For two-column forms, columns must always have equal width and equal gap.

## 19. GLOBAL RESPONSIVE RULES
Primary target 1440px desktop. Ensure no overlap or clipping on 1280px and 1024px.

## 20. GLOBAL DATA INTERACTION
The application must behave connectedly. Actions in one module must instantly reflect in related modules via the central KioskStore.

## 21. GLOBAL NAVIGATION
Consistent sidebar, top header, breadcrumb. Sidebar active state reflects current module.

## 22. GLOBAL FORM VALIDATION
Use clear, non-technical inline validation error messages. Prevent invalid saves.

## 23. GLOBAL VISUAL STYLE
Light neutral background, white cards, soft borders, subtle shadows, consistent rounded corners, clean typography.

## 24. GLOBAL RULE FOR BUSINESS-SPECIFIC FIELDS
Do not ask users to manually enter information that can be auto-detected (e.g., Media Type from uploaded file).

## 25. GLOBAL ACTION PRINCIPLE
Master Data: List -> Add -> View -> Edit -> Delete / Status.
Configuration: View -> Configure -> Save.
Monitoring: List -> Search/Filter -> View.

## 26. FINAL GLOBAL RULE
Before creating ANY new Admin page, check that it follows the standard components listed above. Everything must feel like ONE Admin product.
