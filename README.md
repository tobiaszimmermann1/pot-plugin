# POT Plugin

## Introduction

This plugin expands Wordpress (with WooCommerce) to be used as an application to manage your Foodcoop.

## Prerequisites

- [WooCommerce](https://woocommerce.com/)

## Installation

1. Install & activate [WooCommerce](https://woocommerce.com/)
2. Download the latest release of Foodcoop plugin
3. Unzip the contents to `wp-content/plugins/`
4. Run `composer install` in the plugin directory
5. Run `npm install` in the plugin directory
6. Activate Foodcoop Plugin
7. Recommended: Use an SMTP Plugin to improve email deliverability

## Documentation

- https://plugin.pot.ch

## Contact, Requests & Issues

- tobias.zimmermann@neues-food-depot.ch

## Changelog

### 1.7.5

- Fixed a bug where foodcoop balance displayed a wrong value during ordering.
- For payment gateway foodcoop balance: if balance is too low, the place order button is disabled (prevents the creation of failed orders)
- Added an option to manually mark a Bestellrunde as completed (changes the status of all orders to completed as well)
  //- Added an option to block users who have not yet payed the yearly fee from ordering, with the option to pay the fee directly with the push of a button using their balance

### 1.7.4

- Introduction of new feature: **POS Mode for Self Checkout**: create orders for users or guests
- Introduction of new feature: **Product ownership** Users can be owners of products and will be able
- Added a setting to activate / deactivate **sales tax**: Sales taxes will be shown in backend and frontend and added to cart and order totalsto edit a the product's information and stock level in their dashboard
- Improved ordering list ui
- Redesigned Foodcoop Dashboard in My Account with tabs for balance, transactions and products
- Added a validation for product imports that checks for identical sku's and shows a warning
- Added support for Woocommerce Checkout Block (mordern checkout ui)
- Made all functions compatible with WooCommerce HPOS and declared HPOS compatibility
- Added a setting to enable all payment methods for orders that are part of a bestellrunde
- Fixed product image uploads when importing products: correct handling of wordpress media library. If an image is already in the library, it will be linked to the product instead of reuploaded (search by image name)
- Added an option to edit product descriptions directly from the product list using a simplified wysiwyg editor
- Added an option to duplicate an ordering round
- fixed admin bar for foodcoop_manager role (removed all items from it)
- fixed a bug where previous order was not correctly filtered when placing regular woocommerce orders and there is a pending collective order
- fixed a bug that prevented entering of decimal numbers in self checkout amount field
- fixed a bug that blocked importing of products after end of an ordering round
- fixed a bug where user id was no saved for added transactions
- fixed a bug in Self Checkout where cart margin was applied wrongly
- various other small fixes

### 1.7.3

- Bugfix: Payment Gateway fixed for WooCommerce HPOS compatibility
- Bugfix: Safari interpreted ISO date format with space wrong in certain circumstances (older versions of the browser)

### 1.7.2

- Bugfix: Stock status of products with 0 stock did not change to instock when inventory was disabled
- Self Checkout can now be added through shortcode [foodcoop_addtocart]: Allows scanning of QR Codes (SKU) to add products to a virtual cart and check out.
- New setting for activating / deactivating Self Checkout
- Products which are available in Self Checkout may now be selected in the products tab, if self checkout is activated
- New form to request credit payout in my account page
- Added shortcode [foodcoop_product_overview] to show a comprehensive overview of all available products with filtering options

### 1.7.1

- Various bugfixes
- Added sku to data export

### 1.7.0

- Renamed to POT Plugin
- Added option to add and edit product categories from the backend
- Added suppliers and producers post types: New differentiation of producers and suppliers. Neither producers, nor suppliers must exist. If they do exist, they will be linked in the frontend.
- Suppliers are used to generate distribution lists. Users can add suppliers via UI and fill in information about them. Meant for intermediary distributors.
- Producers are used for purely informational purposes. Users can add producers via UI and fill in information about them. Producers are not used for creating lists etc.
- Added shortcode [foodcoop_suppliers] to show an overview of available suppliers in frontend
- Added shortcode [foodcoop_producers] to show an overview of available producers in frontend
- Added support for stock management: option in settings to activate stock management for all products
- Function for taking inventory
- Function for accepting deliveries
- Stock Management in Frontend: If activated, products can only be ordered if in stock and only up to the current stock number
- Added support for more granular access control: new role 'foodcoop_manager' with permissions for the plugin
- Order bar may now be hidden for better visibility
- Notifications for Bestellrunden: Added TinyMCE as texteditor for formatting options
- Fixed a bug where cancelled orderes were added to Bestellrunden totals
- Fixed a bug where an error was mistakenly shown when registering a new member
- Dashboard redesign in preparation for overhaul
- Various small bugfixes

### 1.6.4

- Added english and french translations
- Added a billing overview in Bookkeeping tab

### 1.6.3

- fixed bug for instant topup feature

### 1.6.2

- various bug fixes

### 1.6.1

- added the option to run several ordering rounds at the same time
- ordering rounds now have a name and an image associated to it
- added an icon in the backend to show the status of an ordering round
- full mobile support for ordering list
- added an instant top up option to allow users to top up their wallet balance from their account page using enabled woocommerce payment gateways (such as credit cards, twint etc.)
- added a notification function: admins may send email notifications to all members of a specific ordering round.
- various ui improvements

### 1.6.0

- added transaction types: deposit, refund, manual transaction, yearly fee, order
- added a new overview for membership fee payments in members table
- new user registration: only require name and email
- new user registration: disabled standard email and added custom welcome email
- enabled inline editing for members table
- Mutations: added an option to refund a product to only a selected part of the orders instead of all or nothing
- Mutations: improved the layout of the mutations window
- Frontend: fixed a bug in CSS Transitions that messed up the selected products
- Frontend: Added a progress indicator in the ordering list and checkout
- Frontend: Added more concise warnings to indicate products in cart and not enough credit
- Frontend: Allow to save products if credit is too low
- Frontend: Added option to generate a QR bill with the desired amount
- Added notifications for wallet transactions. Maximum one email per user and per hour will be sent with all transactions that happened in the preivous hour.
- Added SKU to product import / export and to the product table
- Added functions to generate QR Code labels (per product or all at once) in product table for use in self checkout web app
- Bugfix: settings for public prices and images and description in frontend did not work correctly
- Bugfix: product import no longer messes up existing product pictures

### 1.5.5

- support for product pictures
- added a product description popup in frontend
- rudimentary mobile screen size support for frontend (to be improved)
- new full screen backend view
- new backend color scheme
- improved popup design and scaling in backend
- new settings page in backend

### 1.5.4

- frontend UI improvements
- added an option to display a public members list to logged in users
- added a "next order window" message to ordering list, when bestellrunde is inactive
- added a notice in my account dashboard to guide admins to the foodcoop manager
- skip the cart when continuing the order from to product list and go directly to checkout

### 1.5.3

- fixed sorting of users in export lists to be in alphabetical order

### 1.5.2

- direct producer import: changed to simple list download
- bugfixes
- UI fixes

### 1.5.1

- fixed product list and product export to include missing description column
- added a new category list export: for products, sorted by category
- slight readability improvements of export forms
- Ordering List UI: bug fixes, added warnings for previous orders and products in cart
- Improved the display of member addresses
- Added membership status to users (purely informational at this point)
- Changes to UI of Milchbüechli (experimental)
- added compatibility with product pictures
- added compatibility with long descriptions
- added an optional quick view for the frontend with extended description and product image
- product images may be imported remotely through product import csv
