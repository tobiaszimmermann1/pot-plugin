# FOODCOOP MANAGER

## Introduction

This plugin turns Wordpress (with WooCommerce) into an application to manage your Foodcoop. Currently only offers support for ['Buying Club'-style Foodcoops](https://www.sustainweb.org/foodcoopstoolkit/buyingclubs/)

## Features

- Adds support for a **Product Table**
- Adds support for **Ordering Windows**
- Adds support for managing **Memberships**
- Adds a **Foodcoop Wallet**, a WooCommerce payment gateway for prepaid balance
- Adds custom **Product Import** feature
- Adds custom **Order Export** feature
- Adds custom **Order Mutation** feature
- Extends WooCommerce products with **Supplier, Trading unit, unit and origin**

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

## Contact, Requests & Issues

- tobias.zimmermann@neues-food-depot.ch
- www.neues-food-depot.ch

## Changelog

### 1.6.1

- added the option to run several ordering rounds at the same time
- added a visual cue in the backend to show which ordering rounds are currently active
- self checkout

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
