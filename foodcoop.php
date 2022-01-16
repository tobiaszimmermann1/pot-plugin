<?php

/**
 * 
 * @package FoodcoopPlugin 
 */
/*
Plugin Name: Foodcoop Plugin
Plugin URI: https://neues-food-depot.ch
Description: Plugin for Foodcoops YEAH
Author: Tobias Zimmermann
Author URI: https://neues-food-depot.ch
License: GPLv2 or later
Text Domain: foodcoop
*/

if (!defined( 'ABSPATH' )) {
  die;
}

/**
 * Require once Composer autoload
 */
if(file_exists(dirname(__FILE__) . '/vendor/autoload.php') ) {
  require_once dirname(__FILE__) . '/vendor/autoload.php';
}


/**
 * Run on activation of plugin
 */
function activate_foodcoop_plugin() {
  foodcoop_wallet_install();
  flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'activate_foodcoop_plugin' );


/**
 * Create Database table for Foodcoop Wallet
 */
function foodcoop_wallet_install() {
  global $wpdb;

  $table_name = $wpdb->prefix . 'foodcoop_wallet';

  $charset_collate = $wpdb->get_charset_collate();

  $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        amount decimal(10,2) NOT NULL,
        balance decimal(10,2) NOT NULL,
        details longtext,
        created_by bigint(20) NOT NULL,
        date timestamp DEFAULT '0000-00-00 00:00:00' NOT NULL,
    PRIMARY KEY  (id)
  ) $charset_collate;";

  require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
  dbDelta( $sql );
}


/**
 * Run on deactivation of plugin
 */
function deactivate_foodcoop_plugin() {
  flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'deactivate_foodcoop_plugin' );


/**
 * Initialize all the core classes of the plugin
 */
if ( class_exists('Inc\\Init') ) {
  Inc\Init::register_services();
}


/**
 * Require Wallet class
 */
if(file_exists(dirname(__FILE__) . '/inc/Payments/wallet.php') ) {
  require_once dirname(__FILE__) . '/inc/Payments/wallet.php';
}

