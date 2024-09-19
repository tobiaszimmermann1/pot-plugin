<?php

/**
 * 
 * @package FoodcoopPlugin 
 */
/*
Plugin Name: POT Plugin
Plugin URI: https://plugin.pot.ch
Description: Plugin for managing foodcoops. 
Version: 1.7.5
Author: Tobias Zimmermann / Verein POT Netzwerk
Author URI: https://plugin.pot.ch
License: GPLv2 or later
Text Domain: fcplugin
Domain Path: /languages
*/

if (!defined( 'ABSPATH' )) {
  die;
}

// add documentation link to plugin meta
add_filter( 'plugin_row_meta', 'fc_plugin_row_meta', 10, 2 );

function fc_plugin_row_meta( $links, $file ) {    
    if ( plugin_basename( __FILE__ ) == $file ) {
        $row_meta = array(
          'docs'    => '<a href="' . esc_url( 'https://plugin.pot.ch/dokumentation' ) . '" target="_blank" aria-label="' . esc_attr__( 'Dokumentation', 'fcplugin' ) . '">' . esc_html__( 'Dokumentation', 'fcplugin' ) . '</a>'
        );
        return array_merge( $links, $row_meta );
    }
    return (array) $links;
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
  add_roles_on_plugin_activation();
  flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'activate_foodcoop_plugin' );


/**
 * Declare WooCommerce HPOS compatibility
 */
add_action( 'before_woocommerce_init', function() {
	if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
	}
} );



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
 * User capabilities
 */
function add_roles_on_plugin_activation() {
  add_role( 'foodcoop_manager', 'Foodcoop Manager', get_role( 'shop_manager' )->capabilities );
}

// Hide menu items for foodcoop_manager
add_action( 'admin_init', 'fc_remove_menu_pages' );
function fc_remove_menu_pages() {

  $user = wp_get_current_user();
  if (in_array('foodcoop_manager', $user->roles)) {
   remove_menu_page('edit.php');
   remove_menu_page('upload.php');
   remove_menu_page('link-manager.php');
   remove_menu_page('edit-comments.php');
   remove_menu_page('edit.php?post_type=page');
   remove_menu_page('users.php');
   remove_menu_page('tools.php');
   remove_menu_page('themes.php');
   remove_menu_page('tools.php'); 
   remove_menu_page('edit.php?post_type=product'); 
   remove_menu_page('edit.php?post_type=fc_theme_frontpage'); 
   remove_menu_page('woocommerce'); 
   remove_menu_page('wc-admin&path=/analytics/overview');
   remove_menu_page('woocommerce-marketing');
  }
}

// Hide admin bar for foodcoop_manager
function fc_remove_from_admin_bar($wp_admin_bar) {

  $user = wp_get_current_user();
  if (in_array('foodcoop_manager', $user->roles)) {
    $wp_admin_bar->remove_node('updates');
    $wp_admin_bar->remove_node('comments');
    $wp_admin_bar->remove_node('new-content');
    $wp_admin_bar->remove_node('wp-logo');
    $wp_admin_bar->remove_node('site-name');
    $wp_admin_bar->remove_node('my-account');
    $wp_admin_bar->remove_node('search');
    $wp_admin_bar->remove_node('customize');
  }
}
add_action('admin_bar_menu', 'fc_remove_from_admin_bar', 999);





/**
 * Upgrade for verson > 1.6.0
 * upgrade table for Foodcoop wallet for transaction types
 */
function fc_plugin_upgrade_database() {
  global $wpdb;
  $results = $wpdb->get_results( "SELECT `type` FROM {$wpdb->prefix}foodcoop_wallet", OBJECT );
  $results2 = $wpdb->get_results( "SELECT `reported` FROM {$wpdb->prefix}foodcoop_wallet", OBJECT );
  if (!$results or !$results2) {
    // add type and reported columns into wallet table
    $wpdb->query("ALTER TABLE {$wpdb->prefix}foodcoop_wallet ADD `type` VARCHAR(255) NOT NULL");
    $wpdb->query("ALTER TABLE {$wpdb->prefix}foodcoop_wallet ADD `reported` DATETIME");

    // set type to manual_transaction for all existing transactions
    // set reported to current time for all existing transactions
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
          'reported' => date('Y-m-d H:i:s'),
          'created_by' => $name
        ),
        array(
          'id' => $row->id,
        )
      );
    }
    //printf('<span class="fc_plugin_update_message">'.__('Datenbank wurde für Foodcoop Manager Version > 1.6.0 aktualisiert. Vielen Dank!','fcplugin').'</span>');
  }
}
add_action( 'admin_init', 'fc_plugin_upgrade_database' );





/**
 * Run on deactivation of plugin
 */
function deactivate_foodcoop_plugin() {
  flush_rewrite_rules();
  $timestamp = wp_next_scheduled( 'fcplugin_transaction_notification_hook' );
  wp_unschedule_event( $timestamp, 'fcplugin_transaction_notification_hook' );
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
  wp_enqueue_script( 'fc-script', plugin_dir_url( __FILE__ ) . 'build/backend.js?version=1.7.5', array( 'wp-element', 'wp-i18n' ), '1.0', false );
  wp_localize_script( 'fc-script', 'appLocalizer', array(
    'apiUrl' => home_url('/wp-json'),
    'homeUrl' => home_url(),
    'adminUrl' => parse_url(admin_url())['path'].'admin.php?page=foodcoop-plugin',
    'pluginUrl' => plugin_dir_url(__FILE__),
    'nonce' => wp_create_nonce('wp_rest'),
    'currentUser' => wp_get_current_user(),
    'version' => "1.7.5"
  ));
  wp_set_script_translations( 'fc-script','fcplugin', plugin_dir_path( __FILE__ ) . '/languages' );
  wp_enqueue_style( 'dashboard_style', plugin_dir_url( __FILE__ ).'styles/styles.css?version=1.7.5' );
}

add_action( 'wp_enqueue_scripts', 'fc_wp_load_scripts');
function fc_wp_load_scripts() {
  // javascript/react FRONTEND
  if (get_option('fc_enable_rounds_storewide')) {
    wp_enqueue_script( 'fc-script-sitewide-bestellrunden', plugin_dir_url( __FILE__ ) . 'scripts/sitewide-bestellrunden.js?version=1.7.5', array( 'jquery' ), '1.0', false );
  }
  wp_enqueue_script( 'fc-script-frontend', plugin_dir_url( __FILE__ ) . 'build/frontend.js?version=1.7.5', array( 'wp-element', 'wp-i18n' ), '1.0', false );
  wp_localize_script( 'fc-script-frontend', 'frontendLocalizer', array(
    'apiUrl' => home_url('/wp-json'),
    'homeUrl' => home_url(),
    'pluginUrl' => plugin_dir_url(__FILE__),
    'cartUrl' => wc_get_checkout_url(),
    'accountUrl' => get_permalink( get_option('woocommerce_myaccount_page_id') ),
    'nonce' => wp_create_nonce('wp_rest'),
    'woo_nonce' => wp_create_nonce( 'wc_store_api' ),
    'currentUser' => wp_get_current_user(),
    'name' => get_user_meta(wp_get_current_user()->ID, 'billing_first_name', true )
  ));
  wp_set_script_translations( 'fc-script-frontend','fcplugin', plugin_dir_path( __FILE__ ) . '/languages' );
  wp_enqueue_style( 'dashboard_style', plugin_dir_url( __FILE__ ).'styles/styles.css?version=1.7.5' );
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
    'supports'              => array('author', 'custom-fields', 'thumbnail'),
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

  // cpt: suppliers
  $labels_suppliers = array(
    'name'                  => __( 'Suppliers'),
    'singular_name'         => __( 'Supplier'),
    'menu_name'             => __( 'Lieferanten'),
    'name_admin_bar'        => __( 'Lieferanten'),
    'archives'              => __( 'Lieferantenarchiv'),
    'all_items'             => __( 'Alle Lieferanten'),
    'add_new_item'          => __( 'Neuer Lieferant hinzufügen'),
    'add_new'               => __( 'Hinzufügen'),
    'new_item'              => __( 'Lieferant hinzufügen'),
    'edit_item'             => __( 'Lieferant bearbeiten'),
    'update_item'           => __( 'Lieferant speichern'),
    'view_item'             => __( 'Lieferant ansehen'),
    'view_items'            => __( 'Lieferanten ansehen'),
  );

  $args_suppliers = array(
    'label'                 => __( 'Lieferanten'),
    'labels'                => $labels_suppliers,
    'supports'              => array('author', 'custom-fields', 'title', 'editor', 'excerpt', 'thumbnail'),
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
  register_post_type( 'suppliers', $args_suppliers );

  // cpt: producers
  $labels_producers = array(
    'name'                  => __( 'Producers'),
    'singular_name'         => __( 'Producer'),
    'menu_name'             => __( 'Produzenten'),
    'name_admin_bar'        => __( 'Produzenten'),
    'archives'              => __( 'Produzentenarchiv'),
    'all_items'             => __( 'Alle Produzenten'),
    'add_new_item'          => __( 'Neuer Produzent hinzufügen'),
    'add_new'               => __( 'Hinzufügen'),
    'new_item'              => __( 'Produzent hinzufügen'),
    'edit_item'             => __( 'Produzent bearbeiten'),
    'update_item'           => __( 'Produzent speichern'),
    'view_item'             => __( 'Produzent ansehen'),
    'view_items'            => __( 'Produzenten ansehen'),
  );

  $args_producers = array(
    'label'                 => __( 'Produzenten'),
    'labels'                => $labels_producers,
    'supports'              => array('author', 'custom-fields', 'title', 'editor', 'excerpt', 'thumbnail'),
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
  register_post_type( 'producers', $args_producers );
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
  ob_start();
  echo '<div id="fc_order_list"></div>';
  return ob_get_clean();
});



/**
 * Show a message to logged in admins to access foodcoop settings
 */

 add_action( 'woocommerce_account_content', 'wpb_admin_notice_warn' );
 function wpb_admin_notice_warn() {
  if( is_user_logged_in() ) {
    $user = wp_get_current_user();
    if (in_array('administrator', $user->roles) || in_array('foodcoop_manager', $user->roles)) {
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




/*
 * Steps indicator 2/2 at checkout
 

 add_action( 'woocommerce_before_checkout_form', 'skyverge_add_checkout_content', 12 );
 function skyverge_add_checkout_content() {
  echo '<h2 class="fc_order_list_header_steps">';
  echo __("Schritt 2 / 2: Rechnungsadresse aktualisieren und Einkauf abschliessen.", "fcplugin");
  echo '</h2>';
 }
 */


 /**
  * Transaction Notifications
  * Wordpress Cron
  * Run each hour, gather transactons per user, send email to user
  * Max. 1 email per hour
  */

  add_action( 'fcplugin_transaction_notification_hook', 'fcplugin_transaction_notification_function' );

  if ( !wp_next_scheduled( 'fcplugin_transaction_notification_hook' )) {
    wp_schedule_event( time(), 'hourly', 'fcplugin_transaction_notification_hook' );
  }

  function fcplugin_transaction_notification_function() {
    // get all transactions that have not been reported yet
    global $wpdb;
    $transactions = $wpdb->get_results(
      $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE reported IS NULL ORDER BY `id` DESC")
    );

    // get all users with transactions
    $users_with_transactions = array();
    foreach($transactions as $transaction) {
      if (!in_array($transaction->user_id, $users_with_transactions)) {
        array_push($users_with_transactions,$transaction->user_id);
      }
    }

    // loop through users with transactions, find their transactions, create email and send
    foreach($users_with_transactions as $user_with_transactions) {
      $user = get_userdata( intval($user_with_transactions) );
      $email = $user->user_email;
      $user_name = get_user_meta($user_with_transactions, 'billing_first_name', true)." ".get_user_meta($user_with_transactions, 'billing_last_name', true);

      $transactions_to_send = '<h2>Hallo '.$user_name.'</h2>';
      $transactions_to_send .= '<p>Es gibt neue Transaktionen in deinem Foodcoop Guthaben.</p>';      
      $transactions_to_send .= '<table style="border:1px solid #e3e3e3;margin-top: 10px;">';      
      $transactions_to_send .= '<tr><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px; font-weight:bold;">Transaktionsnummer</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px; font-weight:bold;">Betrag</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px; font-weight:bold;">Transaktionsart</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px; font-weight:bold;">erfasst von</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px; font-weight:bold;">Datum</td></tr>';
      
      $transaction_count = 0;
      foreach($transactions as $transaction) {
        if ($transaction->user_id == $user_with_transactions) {
          $type = '';
          switch ($transaction->type) {
            case 'yearly_fee':
              $type = __("Jahresbeitrag","fcplugin");
              break;
            case 'deposit':
              $type = __("Einzahlung","fcplugin");
              break;
            case 'manual_transaction':
              $type = __("Manuelle Transaktion","fcplugin");
              break;
            case 'mutation':
              $type = __("Mutation","fcplugin");
              break;
            case 'order':
              $type = __("Bestellung","fcplugin");
              break;
          }
  
          $transactions_to_send .= '<tr>';
          $transactions_to_send .= '<td style="border-bottom:1px solid #e3e3e3; padding:5px 10px;">Transaktion '.$transaction->id.'</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px;"> CHF '.$transaction->amount.'</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px;">'.$type.'</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px;">'.$transaction->created_by.'</td><td style="border-bottom:1px solid #e3e3e3; padding:5px 10px;"> '.$transaction->date.'</td>';
          $transactions_to_send .= '</tr>';

          // update transaction's reported state
          $wpdb->update( $wpdb->prefix."foodcoop_wallet", array('reported' => date('Y-m-d H:i:s')), array('id' => $transaction->id));               

          $transaction_count++;
        }
      }
      $transactions_to_send .= '</table>';
      $transactions_to_send .= '<p>Alle Transaktionen findest du in deinem <a href="'.get_permalink( get_option('woocommerce_myaccount_page_id') ).'">Konto</a>.</p>';   
  
      $headers[] = 'From: '. get_option('admin_email');
      $headers[] = 'Reply-To: ' . get_option('admin_email');
      $headers[] = 'Content-Type: text/html; charset=UTF-8';
      $subj_user = __('Dein Foodcoop Guthaben', 'fcplugin') . " - " . get_option('blogname');
  
      if ($transaction_count > 0) {
        wp_mail( $email, $subj_user, $transactions_to_send, $headers);
      }
    }
  }



/**
 * Self-Checkout Module: Add to Cart  shortcode [foodcoop_addtocart]
 */

add_shortcode('foodcoop_addtocart', function() {
  if (is_user_logged_in()) {
    ob_start();
    echo '<div id="fc_add_to_cart"></div>';
    return ob_get_clean();
  } else {
    if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
      $url = "https://";  
    } else {  
      $url = "http://";   
    }
    $url.= $_SERVER['HTTP_HOST'];   
    $url.= $_SERVER['REQUEST_URI'];    

    wp_login_form( array(
      'redirect' => $url,
      'echo' => true,
      'remember' => false
    ) );
  }

});



/**
* Instant Top Up Product
* Check if it exists via wpcron. If yes, do nothing. If no, create it
*/

add_filter( 'cron_schedules', 'fcplugin_instant_topup_hook_interval' );
function fcplugin_instant_topup_hook_interval( $schedules ) { 
    $schedules['minutely'] = array(
        'interval' => 60,
        'display'  => esc_html__( 'Every Minute' ), );
    return $schedules;
}

add_action( 'fcplugin_instant_topup_hook', 'fcplugin_instant_topup_function' );

if ( !wp_next_scheduled( 'fcplugin_instant_topup_hook' )) {
  wp_schedule_event( time(), 'minutely', 'fcplugin_instant_topup_hook' );
}

function fcplugin_instant_topup_function() {
  $sku = "fcplugin_instant_topup_product";
  $instant_topup_product = wc_get_product_id_by_sku( $sku );

  if (!$instant_topup_product) {
    $product = new WC_Product_Simple();
    $product->set_name( 'Foodcoop Guthaben' );
    $product->set_slug( 'foodcoop_guthaben' );
    $product->set_sku($sku);
    $product->set_regular_price( 1.00 );
    $product->save();
 }
}

function fcplugin_instant_topup_add_amount($order_id) { 

  global $wpdb;

  $order = wc_get_order($order_id);

  $customer_id = $order->get_user_id();

  $table = $wpdb->prefix.'foodcoop_wallet';
  date_default_timezone_set('Europe/Zurich');
  $date = date("Y-m-d H:i:s");
  $details = 'Instant Topup ('.$order_id.') via '.$order->get_payment_method_title();
  $created_by = $customer_id;

  $is_instant_topup_product = false;
  $amount = 0;

  foreach ( $order->get_items() as $item_id => $item ) {
    $product_id = $item->get_product_id();
    $product = $item->get_product();
    $sku = $product->get_sku();
    if ($sku == 'fcplugin_instant_topup_product') {
      $is_instant_topup_product = true;
    }
    $amount = $item->get_total();
  }

  if ($is_instant_topup_product && !$order->get_meta('instantTopUp')) {
    $order->add_meta_data('instantTopUp','ok');
    $order->save();

    $results = $wpdb->get_results(
      $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $customer_id)
    );

    foreach ( $results as $result )
    {
      $current_balance = number_format($result->balance, 2, '.', '');
    }

    $new_balance = $current_balance + $amount;
    $new_balance = number_format($new_balance, 2, '.', '');
    $data = array('user_id' => $customer_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
    $wpdb->insert($table, $data);
  }
}
add_action( 'woocommerce_pre_payment_complete', 'fcplugin_instant_topup_add_amount' );






/**
* Instant Top Up Product
* Hide all payment methods except wallet, if order is part of any bestellrunde
*/

add_filter('woocommerce_available_payment_gateways', 'fcplugin_conditional_payment_gateways', 10, 1);
function fcplugin_conditional_payment_gateways( $available_gateways ) {
  if(is_admin())  return $available_gateways;

  if ( ! WC()->cart ) 
        return $available_gateways;

  // If cart is empty - bail and return false
  if (empty (WC()->cart->get_cart())) {  
    return $available_gateways;
  } else {
    // check if cart includes products for bestellrunde
    $order_is_part_of_bestellrunde = false;
    $order_contains_instant_topup = false;

    foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
      if( isset( $cart_item['bestellrunde'] ) ) {
        $order_is_part_of_bestellrunde = true;
      }
      $product = $cart_item['data'];
      $sku = $product->get_sku();
      if ($sku == 'fcplugin_instant_topup_product') {
        $order_contains_instant_topup = true;
      }
    }
    
    if ($order_is_part_of_bestellrunde) {

      if (!get_option("fc_enable_payment_by_bill")) {
        $foodcoop_guthaben_gateway = $available_gateways['foodcoop_guthaben'];
        $available_gateways = array();
        $available_gateways['foodcoop_guthaben'] = $foodcoop_guthaben_gateway;
      }
    }
    
    if ($order_contains_instant_topup) {
      unset($available_gateways['foodcoop_guthaben']);
    }

    return $available_gateways;
  }
}





/**
* POS Product
* Check if it exists via wpcron. If yes, do nothing. If no, create it
*/

add_filter( 'cron_schedules', 'fcplugin_pos_hook_interval' );
function fcplugin_pos_hook_interval( $schedules ) { 
    $schedules['minutely'] = array(
        'interval' => 60,
        'display'  => esc_html__( 'Every Minute' ), );
    return $schedules;
}

add_action( 'fcplugin_pos_hook', 'fcplugin_pos_function' );

if ( !wp_next_scheduled( 'fcplugin_pos_hook' )) {
  wp_schedule_event( time(), 'minutely', 'fcplugin_pos_hook' );
}

function fcplugin_pos_function() {
  $sku = "fcplugin_pos_product";
  $pos_product = wc_get_product_id_by_sku( $sku );

  if (!$pos_product) {
    $product = new WC_Product_Simple();
    $product->set_name( 'Foodcoop POS Product' );
    $product->set_slug( 'pos_product' );
    $product->set_sku($sku);
    $product->set_regular_price( 0 );
    $product->save();
 }
}






/**
 * Suppliers shortcode [foodcoop_suppliers] 
 */

 add_shortcode('foodcoop_suppliers', function() {
    ob_start();
    echo '<div id="fc_suppliers_list"></div>';
    return ob_get_clean();
});



/**
 * Producers shortcode [foodcoop_producers] 
 */

 add_shortcode('foodcoop_producers', function() {
    ob_start();
    echo '<div id="fc_producers_list"></div>';
    return ob_get_clean();
});



/**
 * Producers shortcode [foodcoop_producers] 
 */

 add_shortcode('foodcoop_product_overview', function() {
    ob_start();
    echo '<div id="fc_product_overview"></div>';
    return ob_get_clean();
});



/**
 * Declare support for WooCommerce Checkout Blocks
 */
function delcalre_cart_checkout_blocks_compatibility() {
  if (class_exists('\Auttomattic\WooCommerce\Utilities\FeaturesUtil')) {
    \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
  }
}
add_action( 'before_woocommerce_init', 'delcalre_cart_checkout_blocks_compatibility');

add_action( 'woocommerce_blocks_loaded', 'fc_register_fc_payment_method_type' );
function fc_register_fc_payment_method_type() {
  if (!class_exists('Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType')) {
    return;
  }

  require_once plugin_dir_path( __FILE__ ) . 'inc/foodcoop-payment-class-block.php';
  
  add_action( 'woocommerce_blocks_payment_method_type_registration', function(Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry) {
    $payment_method_registry->register(new WC_Foodcoop_Guthaben_Blocks);
  } );
}




/**
 * Handle a custom 'bestellrunde_id' query var to get orders with the 'bestellrunde_id' meta.
 * @param array $query - Args for WP_Query.
 * @param array $query_vars - Query vars from WC_Order_Query.
 * @return array modified $query
 */
function handle_custom_query_var( $query, $query_vars ) {
	if ( ! empty( $query_vars['bestellrunde_id'] ) ) {
		$query['meta_query'][] = array(
			'key' => 'bestellrunde_id',
			'value' => esc_attr( $query_vars['bestellrunde_id'] ),
		);
	}

	return $query;
}
add_filter( 'woocommerce_order_data_store_cpt_get_orders_query', 'handle_custom_query_var', 10, 2 );





/**
 * Payment Gateway helper
 * Disable Place order button, if balance is too low
 */

add_filter('woocommerce_order_button_html', 'custom_order_button_text' );
function custom_order_button_text( $order_button_text ) {
    // Get the chosen payment gateway (dynamically)
    $chosen_payment_method = WC()->session->get('chosen_payment_method');
    $order_button_text = __('Place order', 'woocommerce');
    $button = '<button type="submit" class="button alt" name="woocommerce_checkout_place_order" id="place_order" value="'.$order_button_text.'" data-value="'.$order_button_text.'">'.$order_button_text.'</button>';

    if( $chosen_payment_method == 'foodcoop_guthaben'){
      global $wpdb;
      global $woocommerce;
      $order_total = $woocommerce->cart->total;
      $table = $wpdb->prefix.'foodcoop_wallet';
      $user_id = get_current_user_id();
      $results = $wpdb->get_results(
                  $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
               );
      foreach ( $results as $result ) {
         $current_balance = number_format($result->balance, 2, '.', '');
      }

      if ($current_balance <= $order_total) {
        $button = '<button disabled style="background-color:#ccc;" type="submit" class="button alt" name="woocommerce_checkout_place_order" id="place_order" value="'.$order_button_text.'" data-value="'.$order_button_text.'">'.$order_button_text.'</button>';
      } 

    }

    // jQuery code: Make dynamic text button "on change" event ?>
    <script type="text/javascript">
    (function($){
      $('form.checkout').on( 'change', 'input[name^="payment_method"]', function() {
        var t = { updateTimer: !1,  dirtyInput: !1,
          reset_update_checkout_timer: function() {
            clearTimeout(t.updateTimer)
          },  trigger_update_checkout: function() {
            t.reset_update_checkout_timer(), t.dirtyInput = !1,
            $(document.body).trigger("update_checkout")
          }
        };
        t.trigger_update_checkout();
      });
    })(jQuery);
    </script><?php

    return $button;
}

/**
 * Disable Place Order Button if the following conditions are met: 
 * - option fc_enable_user_block is '1'
 * - user has not paid yearly fee
 */

add_filter('woocommerce_order_button_html', 'fc_enable_user_block' );
function fc_enable_user_block( $button ) {
  $fc_enable_user_block = get_option('fc_enable_user_block');

  if ($fc_enable_user_block == '1') {
    $blocked = true;
    global $wpdb;
    $user_id = get_current_user_id();
    if ($user_id) {
      $transaction = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s AND `type` = 'yearly_fee' ORDER BY `id` DESC LIMIT 1", $user_id)
      );

      if (count($transaction) > 0) {
        $current_year = date('Y');
        $transaction_year = date('Y', strtotime(date($transaction[0]->date)));
        if ($current_year == $transaction_year) $blocked = false;
      }
    }

    if( $blocked ) {
      $style = 'style="background:Silver !important; color:white !important; cursor: not-allowed !important;"';
      $button_text = apply_filters( 'woocommerce_order_button_text', __( 'Place order', 'woocommerce' ) );
      $explanation = '<strong style="margin-top:10px;display:block;">'.__('Achtung: Du kannst aktuell nicht bestellen. Bitte bezahle zuerst deinen Mitgliederbeitrag.', 'fcplugin').'</strong>';
      $button = '<a class="button" '.$style.'>' . $button_text . '</a><br>'.$explanation;
    }
  }
  
  return $button;
}

/**
 * If fc_enable_rounds_storewide = '1': Show Bestellrunde selector on all relevant pages (shop, category, single) and then filter products according to availability and add bestellrunde and order_type to cart items
 */
// determine if there are active bestellrunden. if yes, save them to a cookie
add_action( 'init', 'fc_active_bestellrunden_cookie' );
function fc_active_bestellrunden_cookie() {
  if (get_option('fc_enable_rounds_storewide') == '1') {
    // get Bestellrunden and filter out active ones
    $bestellrunden = get_posts(array(
      'numberposts' => -1,
      'post_type'   => 'bestellrunden',
    ));

    // check if there active bestellrunden
    $active_bestellrunden = array();
    foreach($bestellrunden as $bestellrunde) {
      $start = strtotime(get_post_meta( $bestellrunde->ID, 'bestellrunde_start', true ));
      $end = strtotime(get_post_meta( $bestellrunde->ID, 'bestellrunde_ende', true ));
      $today = strtotime(date('Y-m-d'));
      if ($start <= $today && $today <= $end) {
        $this_bestellrunde = array();
        $this_bestellrunde['ID'] = $bestellrunde->ID;
        $this_bestellrunde['bestellrunde_products'] = json_decode(get_post_meta($bestellrunde->ID, 'bestellrunde_products', true));
        $this_bestellrunde['bestellrunde_start'] = get_post_meta( $bestellrunde->ID, 'bestellrunde_start', true );
        $this_bestellrunde['bestellrunde_ende'] = get_post_meta( $bestellrunde->ID, 'bestellrunde_ende', true );
        $this_bestellrunde['bestellrunde_verteiltag'] = get_post_meta( $bestellrunde->ID, 'bestellrunde_verteiltag', true );
        $this_bestellrunde['bestellrunde_name'] = get_post_meta( $bestellrunde->ID, 'bestellrunde_name', true );
        array_push($active_bestellrunden, $this_bestellrunde);
      }
    }

    // set cookie if there are active bestellrunden
    if (count($active_bestellrunden) > 0) {
      if (isset($_COOKIE['fc_active_bestellrunden'])) {
        $cookie_content = json_decode(stripslashes($_COOKIE['fc_active_bestellrunden']));
        if ($cookie_content != $active_bestellrunden) setcookie('fc_active_bestellrunden', json_encode($active_bestellrunden), time() + 3600, "/");
      } else {
        setcookie('fc_active_bestellrunden', json_encode($active_bestellrunden), time() + 3600, "/");
      }
    }

    // unset cookie if there are no active bestellrunden
    if (count($active_bestellrunden) == 0) {
      if (isset($_COOKIE['fc_active_bestellrunden'])) {
        unset($_COOKIE['fc_active_bestellrunden']);
        setcookie('fc_active_bestellrunden', '', time() - 3600, '/');
      }
    }
  } else {
    if (isset($_COOKIE['fc_active_bestellrunden'])) {    
      unset($_COOKIE['fc_active_bestellrunden']);
      setcookie('fc_active_bestellrunden', '', time() - 3600, '/');
    }
    if (isset($_COOKIE['fc_selected_bestellrunde'])) {    
      unset($_COOKIE['fc_selected_bestellrunde']);
      setcookie('fc_selected_bestellrunde', '', time() - 3600, '/');
    }
  }
}

// add div to shop pages and single product page for jQuery to hook into and display information on bestellrunden
add_action( 'woocommerce_before_single_product', 'fc_add_bestellrunde_selector', 12 );
add_action( 'woocommerce_before_shop_loop', 'fc_add_bestellrunde_selector', 12 );
function fc_add_bestellrunde_selector() { 
  if (get_option('fc_enable_rounds_storewide') == '1') {
    ?>
    <div id="fc_shopwide_bestellrunden_selector">
      <div id="fc_shopwide_bestellrunden_selector_content"></div>
    </div>
    <?php
  }
}

// check if product, that is added to cart, is in bestellrunde_products. if not, remove from cart
add_filter( 'woocommerce_add_to_cart_validation', 'fc_add_to_cart_shopwide_bestellrunde_cart_validation', 10, 2 ); 
function fc_add_to_cart_shopwide_bestellrunde_cart_validation( $passed_validation, $product_id ) { 
  if (get_option('fc_enable_rounds_storewide') == '1') {
    if (isset($_COOKIE['fc_selected_bestellrunde'])) {
      $bestellrunde = json_decode(stripslashes($_COOKIE['fc_selected_bestellrunde']));
      $bestellrunde_products = $bestellrunde->bestellrunde_products;
      if (!in_array($product_id, $bestellrunde_products)) {
        wc_add_notice( __( 'Produkt kann in der gewählten Bestellrunde nicht bestellt werden.', 'fcplugin' ), 'error' );
        $passed_validation = false;
      }
    }
  }
  return $passed_validation;
}

// add bestellrunde id and order_type to cart items on add to cart action
add_filter( 'woocommerce_add_cart_item_data', 'fc_add_to_cart_shopwide_bestellrunde', 10, 3 );
function fc_add_to_cart_shopwide_bestellrunde($cartItemData, $productId, $variationId ) { 
  if (get_option('fc_enable_rounds_storewide') == '1') {
    if (isset($_COOKIE['fc_selected_bestellrunde'])) {
      $bestellrunde = json_decode(stripslashes($_COOKIE['fc_selected_bestellrunde']));
      $cartItemData['bestellrunde'] = $bestellrunde->ID;
      $cartItemData['order_type'] = 'bestellrunde';
      return $cartItemData;
    }
  }
}


/**
 * Block Checkout if there products from multiple bestellrunden in the cart
 */

 add_action( 'woocommerce_order_button_html', 'fc_prevent_orders_in_multiple_bestellrunden' );
function fc_prevent_orders_in_multiple_bestellrunden($button_html) {
  if (get_option('fc_enable_rounds_storewide') == '1') {
    global $woocommerce;
    $items = $woocommerce->cart->get_cart();
    $bestellrunden = array();
    foreach($items as $item => $values) { 
      if (!in_array($values['bestellrunde'], $bestellrunden)) {
        array_push($bestellrunden, $values['bestellrunde']);
      }
      if (count($bestellrunden) > 1) {
        $button_html = "<div id='order-blocked'>Dieser Warenkorb kann nicht bestellt werden. Eine Bestellung darf nur Produkte aus einer einzigen Bestellrunde enthalten. Bitte entferne Produkte und bestelle nacheinander.</div>";
      }
    } 
  }
  return $button_html;
}
