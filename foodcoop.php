<?php

/**
 * 
 * @package FoodcoopPlugin 
 */
/*
Plugin Name: Foodcoop Manager
Plugin URI: https://neues-food-depot.ch
Description: Plugin for Foodcoops
Version: 1.6.0
Author: Tobias Zimmermann
Author URI: https://neues-food-depot.ch
License: GPLv2 or later
Text Domain: fcplugin
Domain Path: /languages
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
 * Plugin Dependencies:
 * Check if WooCommerce is activated upon plugin activation
 */
// while activating the plugin
function activate_foodcoop_plugin() {
  if ( ! function_exists( 'is_plugin_active_for_network' ) ) {
    include_once( ABSPATH . '/wp-admin/includes/plugin.php' );
  }

  if ( current_user_can( 'activate_plugins' ) && ! class_exists( 'WooCommerce' ) ) {
    // Deactivate the plugin.
    deactivate_plugins( plugin_basename( __FILE__ ) );
    // Throw an error in the WordPress admin console.
    $error_message = '<p style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Oxygen-Sans,Ubuntu,Cantarell,\'Helvetica Neue\',sans-serif;font-size: 13px;line-height: 1.5;color:#444;">' . esc_html__( 'Foodcoop plugin requires ', '' ) . '<a href="' . esc_url( 'https://woocommerce.com/' ) . '">WooCommerce</a>' . esc_html__( ' plugin to be active.', '' ) . '</p>';
    die( $error_message ); // WPCS: XSS ok.
  }

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
        date timestamp NOT NULL,
    PRIMARY KEY  (id)
  ) $charset_collate;";

  require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
  dbDelta( $sql );
}





/**
 * Upgrade for verson > 1.6.0
 * upgrade table for Foodcoop wallet for transaction types
 */
function fc_plugin_upgrade_database() {
  global $wpdb;
  $results = $wpdb->get_results( "SELECT `type` FROM {$wpdb->prefix}foodcoop_wallet", OBJECT );
  if (!$results) {
    // add type into wallet table
    $wpdb->query("ALTER TABLE {$wpdb->prefix}foodcoop_wallet ADD `type` VARCHAR(255) NOT NULL");

    // set type to manual_transaction for all existing transactions
    // + set created_by to name of user, if it's still set to user id's
    $all_rows = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}foodcoop_wallet", OBJECT );
    foreach($all_rows as $row) {
      $name = get_user_meta($row->created_by, 'billing_first_name', true)." ".get_user_meta($row->created_by, 'billing_last_name', true);
      if ($name == " ") {
        $name = "Benutzer gelöscht (".$row->created_by.")";
      }
      
      $wpdb->update(
        $wpdb->prefix.'foodcoop_wallet',
        array( 
          'type' => 'manual_transaction',
          'created_by' => $name
        ),
        array(
          'id' => $row->id,
        )
      );
    }
    printf('<span class="fc_plugin_update_message">'.__('Datenbank wurde für Foodcoop Manager Version > 1.6.0 aktualisiert. Vielen Dank!','fcplugin').'</span>');
  }
}
add_action( 'admin_init', 'fc_plugin_upgrade_database' );





/**
 * Run on deactivation of plugin
 */
function deactivate_foodcoop_plugin() {
  flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'deactivate_foodcoop_plugin' );





/**
 * Dependency Check
 * ** WooCommerce
 */
add_action( 'plugins_loaded', 'fc_plugin_init' );

function fc_plugin_init() {
  if ( !function_exists( 'is_plugin_inactive' ) ) {
      require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
  }

  // check if WooCommerce is running. If not, deactivate the Foodcoop Plugin and show notice.
  if( !class_exists( 'WooCommerce' ) ) {
      add_action( 'admin_init', 'fc_plugin_deactivate' );
      add_action( 'admin_notices', 'fc_plugin_dependency_notice' );
      function fc_plugin_deactivate() {
          deactivate_plugins( plugin_basename( __FILE__ ) );
      }
      function fc_plugin_dependency_notice() {
        $error_message = '<p style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Oxygen-Sans,Ubuntu,Cantarell,\'Helvetica Neue\',sans-serif;font-size: 13px;line-height: 1.5;color:#444;">' . esc_html__( 'Foodcoop plugin requires ', '' ) . '<a href="' . esc_url( 'https://woocommerce.com/' ) . '">WooCommerce</a>' . esc_html__( ' plugin to be active.', '' ) . '</p>';
        echo $error_message;
        if( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );
      }
  }
}


/**
 * Plugin initialization:
 * ** Loading scripts
 * ** Loading styles
 * ** Loading Text Domain
 * ** Create Custom Post Type: bestellrunden
 */
add_action( 'admin_enqueue_scripts', 'fc_admin_load_scripts');
function fc_admin_load_scripts() {
  // javascript/react BACKEND
  wp_enqueue_script( 'fc-script', plugin_dir_url( __FILE__ ) . 'build/backend.js?version=1.5.5', array( 'wp-element', 'wp-i18n' ), '1.0', false );
  wp_localize_script( 'fc-script', 'appLocalizer', array(
    'apiUrl' => home_url('/wp-json'),
    'homeUrl' => home_url(),
    'adminUrl' => parse_url(admin_url())['path'].'admin.php?page=foodcoop-plugin',
    'pluginUrl' => plugin_dir_url(__FILE__),
    'nonce' => wp_create_nonce('wp_rest'),
    'currentUser' => wp_get_current_user()
  ));
  wp_set_script_translations( 'fc-script','fcplugin', plugin_dir_path( __FILE__ ) . '/languages' );
  wp_enqueue_style( 'dashboard_style', plugin_dir_url( __FILE__ ).'styles/styles.css?version=1.5.5' );
}

add_action( 'wp_enqueue_scripts', 'fc_wp_load_scripts');
function fc_wp_load_scripts() {
  // javascript/react FRONTEND
  wp_enqueue_script( 'fc-script-frontend', plugin_dir_url( __FILE__ ) . 'build/frontend.js?version=1.5.5', array( 'wp-element', 'wp-i18n' ), '1.0', false );
  wp_localize_script( 'fc-script-frontend', 'frontendLocalizer', array(
    'apiUrl' => home_url('/wp-json'),
    'homeUrl' => home_url(),
    'pluginUrl' => plugin_dir_url(__FILE__),
    'cartUrl' => wc_get_checkout_url(),
    'nonce' => wp_create_nonce('wp_rest'),
    'currentUser' => wp_get_current_user()
  ));
  wp_set_script_translations( 'fc-script-frontend','fcplugin', plugin_dir_path( __FILE__ ) . '/languages' );
  wp_enqueue_style( 'dashboard_style', plugin_dir_url( __FILE__ ).'styles/styles.css?version=1.5.5' );
}

add_action( 'init', 'fc_init');
function fc_init() {
  // text domain
  load_plugin_textdomain( 'fcplugin', false, dirname(plugin_basename(__FILE__)) . '/languages' );

  // cpt: bestellrunden
  $labels = array(
    'name'                  => __( 'Bestellrunden'),
    'singular_name'         => __( 'Bestellrunde'),
    'menu_name'             => __( 'Bestellrunden'),
    'name_admin_bar'        => __( 'Bestellrunden'),
    'archives'              => __( 'Bestellrundenarchiv'),
    'all_items'             => __( 'Alle Bestellrunden'),
    'add_new_item'          => __( 'Neue Bestellrunde hinzufügen'),
    'add_new'               => __( 'Hinzufügen'),
    'new_item'              => __( 'Bestellrunde hinzufügen'),
    'edit_item'             => __( 'Bestellrunde bearbeiten'),
    'update_item'           => __( 'Bestellrunde speichern'),
    'view_item'             => __( 'Bestellrunde ansehen'),
    'view_items'            => __( 'Bestellrunden ansehen'),
  );

  $args = array(
    'label'                 => __( 'Bestellrunden'),
    'labels'                => $labels,
    'supports'              => array('author', 'custom-fields'),
    'taxonomies'            => array(),
    'hierarchical'          => false,
    'public'                => true,
    'show_ui'               => true,
    'show_in_menu'          => false,
    'show_in_admin_bar'     => false,
    'show_in_nav_menus'     => false,
    'can_export'            => true,
    'has_archive'           => true,
    'exclude_from_search'   => true,
    'publicly_queryable'    => true,
    'capability_type'       => 'post',
  );
  register_post_type( 'bestellrunden', $args );

  // cpt: expenses
  $labels_expenses = array(
    'name'                  => __( 'Expenses'),
    'singular_name'         => __( 'Expense'),
    'menu_name'             => __( 'Ausgaben'),
    'name_admin_bar'        => __( 'Ausgaben'),
    'archives'              => __( 'Ausgabenarchiv'),
    'all_items'             => __( 'Alle Ausgaben'),
    'add_new_item'          => __( 'Neue Ausgabe hinzufügen'),
    'add_new'               => __( 'Hinzufügen'),
    'new_item'              => __( 'Ausgabe hinzufügen'),
    'edit_item'             => __( 'Ausgabe bearbeiten'),
    'update_item'           => __( 'Ausgabe speichern'),
    'view_item'             => __( 'Ausgabe ansehen'),
    'view_items'            => __( 'Ausgaben ansehen'),
  );

  $args_expenses = array(
    'label'                 => __( 'Ausgaben'),
    'labels'                => $labels_expenses,
    'supports'              => array('author', 'custom-fields'),
    'taxonomies'            => array(),
    'hierarchical'          => false,
    'public'                => true,
    'show_ui'               => true,
    'show_in_menu'          => false,
    'show_in_admin_bar'     => false,
    'show_in_nav_menus'     => false,
    'can_export'            => true,
    'has_archive'           => true,
    'exclude_from_search'   => true,
    'publicly_queryable'    => true,
    'capability_type'       => 'post',
  );
  register_post_type( 'expenses', $args_expenses );
}







/**
 * REST API Routes
 */
require_once( plugin_dir_path( __FILE__ ) . 'inc/foodcoop-rest-routes.php');
$rest_routes = new FoodcoopRestRoutes();




/**
 * Plugin Settings
 */
require_once( plugin_dir_path( __FILE__ ) . 'inc/foodcoop-settings-class.php');
$foodcoop_plugin_settings = new FoocoopPluginSettings();




/**
 * Plugin Admin Page
 */
require_once( plugin_dir_path( __FILE__ ) . 'inc/foodcoop-plugin-class.php');
$foodcoop_plugin = new FoodcoopPlugin();




/**
 * Plugin Order Meta
 */
require_once( plugin_dir_path( __FILE__ ) . 'inc/foodcoop-order-meta.php');
$foodcoop_order_meta = new OrderMeta();




/**
 * Require Members Dashboard classes
 */
require_once( plugin_dir_path( __FILE__ ) . 'inc/foodcoop-members-dashboard.php');
$members_list = new MembersListDashboard();




/**
 * Require Wallet class
 */
require_once( plugin_dir_path( __FILE__ ) . 'inc/foodcoop-payment-gateway.php');
$wallet_dashboard = new WalletDashboard();




/*
 * This action hook registers a WooCommerce payment gateway
 */
add_filter( 'woocommerce_payment_gateways', 'fc_add_gateway_class' );
function fc_add_gateway_class( $gateways ) {
    $gateways[] = 'WC_Foodcoop_Guthaben'; 
    return $gateways;
}





/**
 * Foodcoop Ordering List
 * ----------------------
 * replaces the classical online shop view with an efficient product list
 * displayed on page designated in 'fc_order_page' setting or through using [foodcoop_list] shortcode
 */


// register 
add_shortcode('foodcoop_list', function() {
  ?>
    <div id="fc_order_list"></div>
  <?php
});



/**
 * Show a message to logged in admins to access foodcoop settings
 */

 add_action( 'woocommerce_account_content', 'wpb_admin_notice_warn' );
 function wpb_admin_notice_warn() {
  if( is_user_logged_in() ) {
    $user = wp_get_current_user();
    if (in_array('administrator', $user->roles)) {
      ?>
        <div class="admin-alert">
          <a href="<?php echo get_site_url(); ?>/wp-admin/admin.php?page=foodcoop-plugin">
            <?php echo __("Hallo Admin! Zum Foodcoop Manager", "fcplugin"); ?> >>
          </a>
        </div>
      <?php
    }
  }
}



/**
 * New User registration
 */

// Disable the new user notification sent to the site admin
function fcplugin_disable_new_user_notifications() {
  //Remove original use created emails
  remove_action( 'register_new_user', 'wp_send_new_user_notifications' );
  remove_action( 'edit_user_created_user', 'wp_send_new_user_notifications', 10, 2 );
}
add_action( 'init', 'fcplugin_disable_new_user_notifications' );