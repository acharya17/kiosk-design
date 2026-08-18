TV Banner & Self-Order Kiosk — Client
Requirements
1. TV Banner / Digital Display
Objective
The TV display will continuously show promotional banners, product information, offers,
announcements, or other configured content without requiring manual interaction.
Banner Management
Admin should be able to create, edit, activate, deactivate, and delete banners.
Each banner should contain:
Banner image/video
Title/name for internal identification
Display duration
Start date/time
End date/time
Display order/priority
Active/inactive status
Admin should be able to upload multiple banners and configure them as a playlist.
Continuous Playback
Active banners should automatically play one after another.
After the last banner, playback should automatically restart from the first banner.
No manual interaction should be required.
Banner transition should be configurable, if required.
The display should automatically recover and resume playback after:
Page refresh
TV/browser restart
Temporary network interruption
Application restart
Scheduling
Banners should support scheduled visibility.
A banner should only appear during its configured start and end period.
Expired banners should automatically stop displaying.
If no scheduled banner is currently active, the system should display a configured default
screen/banner.
Display Behaviour
Banner should automatically fit the configured TV resolution/aspect ratio.
Images should not be distorted.
The display should run in full-screen/kiosk mode.
User interaction should not be required.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
1
The screen should remain active continuously.
Content Failure Handling
If a banner fails to load, the system should automatically skip it and continue with the next
banner.
If the internet connection is temporarily unavailable, already-loaded content should continue
playing where technically possible.
The system should not get stuck on a blank screen because of one invalid banner.
Multiple TVs
If multiple TV displays are required:
Each TV should be identifiable.
Admin should be able to assign a banner playlist to a specific TV or group of TVs.
Changes made by admin should reflect on the assigned TV without requiring manual
configuration on the TV.
Default/Fallback Content
Admin should be able to configure a default banner/screen.
If there are no active banners, the default content should be displayed.
If content cannot be loaded, the system should show the fallback content instead of a blank
screen.
2. Self-Order Kiosk
Objective
The kiosk will allow customers to independently browse products, customize their order, place the order,
and complete payment without requiring staff assistance.
Kiosk Home Screen
Display branding/logo.
Display available categories/products.
Provide language selection if required.
Provide options to start an order.
Kiosk should automatically return to the home screen after a configurable period of inactivity.
Product Browsing
Customers should be able to:
Browse categories.
View products.
View product name, image, description, price, and availability.
Search products if required.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
2
Add products to cart.
Increase/decrease quantity.
Remove products from cart.
Product Customisation
If applicable, products should support:
Add-ons
Variants
Size selection
Customisation
Optional/mandatory modifiers
Quantity selection
Special instructions
The final price should update immediately based on the selected options.
Cart
Cart should display:
Product name
Selected options/customisations
Quantity
Unit price
Item total
Subtotal
Discount, if applicable
Taxes, if applicable
Final payable amount
Customer should be able to modify or remove items before checkout.
Checkout
The customer should provide the required information based on the business requirement, such as:
Name
Mobile number
Table/order number, if applicable
Dine-in/takeaway selection
Other mandatory order information
Only required fields should be shown.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
3
Payment
The kiosk should support the configured payment methods, such as:
UPI
Card
Other configured payment methods
Cash, only if the business wants staff-assisted cash payment
Payment Cases
Successful payment → order should be confirmed.
Failed payment → customer should be allowed to retry.
Cancelled payment → order should remain unpaid and should not be confirmed.
Payment timeout → payment status should be verified before allowing another attempt.
Payment succeeds but kiosk does not receive the response → system must verify the payment
status before creating/confirming a duplicate order.
Customer should never be charged twice for the same order.
Order Confirmation
After successful order placement:
Display order confirmation.
Display order number/token.
Display payment status.
Display estimated preparation time if available.
If a printer is configured, print the receipt/order token.
Order should be sent to the configured order-management/KOT system.
Order Status
The kiosk should correctly handle:
Order created
Payment pending
Payment successful
Payment failed
Order cancelled
Order completed
The customer should not be able to create duplicate orders by repeatedly clicking the submit/payment
button.
Inactivity Handling
If the customer leaves the kiosk without completing the order:
Show an inactivity warning.
After the configured timeout, clear the cart/session.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
4
Return to the home screen.
Any sensitive customer/payment information should be cleared from the kiosk session.
Network Failure
If internet/network connectivity is lost:
The kiosk should clearly indicate that the service is temporarily unavailable.
Checkout/payment should not proceed if the required backend/payment services are
unavailable.
The application should recover automatically when connectivity returns.
Partially completed orders should not accidentally be submitted twice.
Product Availability
Out-of-stock products should not be orderable.
If a product becomes unavailable while the customer is ordering, the system should validate
availability before final order confirmation.
The customer should be informed and allowed to modify the cart.
Pricing Validation
Prices displayed on the kiosk should come from the latest configured pricing data.
Final pricing must be validated by the backend before order confirmation.
The kiosk should not be able to manipulate the final payable amount.
Kiosk Security
Kiosk should operate in full-screen/kiosk mode.
Customers should not have access to browser controls, operating system settings, developer
tools, or other applications.
Customer/session data should be cleared after order completion or timeout.
Payment information should not be stored locally unless explicitly required and securely
implemented.
Hardware Considerations
The kiosk should support the required hardware configuration, including:
Touchscreen
Receipt printer, if required
QR/UPI payment display or scanner, if required
Card terminal, if required
Customer display, if required
Hardware failures should not crash the kiosk application. The system should show an appropriate error
and allow recovery.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
5
Admin Configuration
Admin should be able to configure:
Kiosk availability
Categories/products
Product availability
Prices
Add-ons/modifiers
Taxes
Discounts
Payment methods
Inactivity timeout
Store/order settings
Kiosk-specific settings
Multiple Kiosks
If multiple kiosks are deployed:
Each kiosk should have a unique identifier.
Admin should be able to identify which kiosk generated an order.
Kiosk-specific configuration should be supported where required.
One kiosk failure should not affect other kiosks.
Order Identification
Every order should contain:
Unique order ID
Order number/token
Kiosk ID
Order date/time
Customer information, if collected
Ordered items
Payment status
Order status
Error & Recovery Cases
The system must handle at minimum:
Scenario Expected Behaviour
Banner fails to load Skip banner and continue
No active TV banner Show default content
TV network disconnected Continue cached content where possible
Kiosk internet disconnected Disable checkout/payment and show service status
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
6
Scenario Expected Behaviour
Product becomes unavailable Prevent final order and request cart update
Payment fails Allow retry
Payment cancelled Keep order unpaid
Payment timeout Verify payment before retry
Payment succeeds but response is lost Verify status and prevent duplicate order
Customer leaves kiosk Clear session after timeout
User clicks Pay multiple times Only one payment/order attempt
Backend unavailable Prevent order submission
Printer unavailable Show error and continue digitally if business allows
Kiosk application crashes Automatically restart/recover
TV application crashes Automatically restart/recover
Session expires Clear cart and return to home
Price changes during checkout Revalidate price and show updated amount
Acceptance Criteria
TV Banner
Multiple banners can be configured.
Banners continuously loop without manual interaction.
Scheduling works correctly.
Expired/inactive banners are excluded.
Failed content does not stop the playlist.
Default content is displayed when no valid banner exists.
TV operates in full-screen mode.
Multiple TVs can be independently managed if required.
Self-Order Kiosk
Customer can complete an order without staff assistance.
Product, pricing, tax, discount, and availability are validated before confirmation.
Payment failures and retries are handled correctly.
Duplicate payments/orders cannot be created.
Order is correctly transferred to the backend/order-management system.
Customer session is cleared after completion or inactivity.
Network and hardware failures do not result in duplicate or corrupted orders.
Kiosk remains locked to the ordering application.
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
•
7