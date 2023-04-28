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

## Contact, Requests & Issues

- tobias.zimmermann@neues-food-depot.ch
- www.neues-food-depot.ch

## Changelog

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
