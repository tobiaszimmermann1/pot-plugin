<?php

/**
 * Triggered on plugin uninstall
 * 
 * @package FoodcoopPlugin
 */

if(!defined('WP_UNINSTALL_PLUGIN')) {
  die;
}

// Clear database stored data
$bestellrunden = get_posts(array('post_type' => 'bestellrunden', 'numberposts' => -1));

global $wpdb;
$wpdb->query("DELETE FROM wp_posts WHERE post_type = 'bestellrunden' ");
$wpdb->query("DELETE FROM wp_postmeta WHERE post_id NOT IN (SELECT id FROM wp_posts)");
// delete wallet table

