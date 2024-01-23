<?php

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

final class WC_Foodcoop_Guthaben_Blocks extends AbstractPaymentMethodType {

  private $gateway;
  protected $name = 'foodcoop_guthaben';

  public function initialize() {
    $this->settings = get_option('woocommerce_my_custom_gateway_settings', []);
    $this->gateway = new WC_Foodcoop_Guthaben();
  }

  public function is_active() {
    return $this->gateway->is_available();
  }

  public function get_payment_method_script_handles() {
    wp_register_script( 'foodcoop_guthaben-blocks-integration', plugin_dir_url(__FILE__) . '../scripts/block-checkout.js', [
      'wc-blocks-registry',
      'wc-settings',
      'wp-element',
      'wp-html-entities',
      'wp-i18n'
    ], null, true );

    if (function_exists('wp_set_script_translations')) {
      wp_set_script_translations( 'foodcoop_guthaben-blocks-integration', 'fcplugin', plugin_dir_path( __FILE__ ) . '/languages' );
    }

    return ['foodcoop_guthaben-blocks-integration'];
  }

  public function get_payment_method_data() {
    return [
      'title' => $this->gateway->title,
      'description' => $this->get_description()
    ];
  }

	public function get_supported_features() {
		$payment_gateways = WC()->payment_gateways->payment_gateways();
		return $payment_gateways['foodcoop_guthaben']->supports;
	}

  public function get_description() {
    if (is_admin()) return;

    global $woocommerce;
    global $wpdb;

    $user_id = get_current_user_id();
    $has_ordered = false;

    $results = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
             );
    
    if ($results) {
      foreach ( $results as $result )
      {
          $current_balance = $result->balance;
      }
    }
    else {
        $current_balance = 0;
    }

    $order_total = $woocommerce->cart->total;

    

    // get cart items to fetch bestellrunde_id
    $active = false;
    $bestellrunde_ids_in_cart = array();
    foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
    $bestellrunde_id = $cart_item['bestellrunde'];
    if (!in_array($bestellrunde_id, $bestellrunde_ids_in_cart)) {
        array_push($bestellrunde_ids_in_cart, $bestellrunde_id);
    }
    }
    
    if (count($bestellrunde_ids_in_cart) == 1) {
        $active = $bestellrunde_ids_in_cart[0];
    }

    

    // Get previous order value
    if ($user_id) {

        $args = array(
            'customer' => $user_id,
            'meta_key'      => 'bestellrunde_id', 
            'meta_value'    => $active,
            'meta_compare'  => '=', 
            'status' => array('wc-processing', 'wc-on-hold', 'wc-refunded'),
          );
                    
        $orders = wc_get_orders( $args );
        $has_ordered = false;
    
        if ($orders) {
            foreach ($orders as $order) {
                $order_id = $order->ID;
                $previous_order_total_before_refunds = $order->get_total();
                $refunded_total = $order->get_total_refunded();

                $previous_order_total = $previous_order_total_before_refunds - $refunded_total;
                $previous_order_total = number_format($previous_order_total, 2, '.', '');
            }

            if ($order_id) {
                $has_ordered = true;
            }
            else {
                $has_ordered = false;
            }
        }
    }


    // If user has ordered
    if ($has_ordered) {

        $new_balance = $current_balance - $order_total + $previous_order_total;
        $new_balance = number_format($new_balance, 2, '.', '');

        $difference = $order_total - $previous_order_total;
        if ($difference < 0) {
            $difference_text = -1 * $difference;
            $difference_text = "- CHF ".number_format($difference_text, 2, '.', '');
        }
        else {
            $difference_text = "CHF ".number_format($difference, 2, '.', '');
        }

        if ($new_balance >= 0) {

          return(
            'Aktuelles Guthaben: CHF '.$current_balance.' | Bereits bezahlt: CHF '.$previous_order_total.' | Differenzbetrag: '.$difference_text.' | Neues Guthaben: CHF '.$new_balance
          );

        }
        else {

          $missing_balance = -1 * $new_balance;
          $missing_balance = number_format($missing_balance, 2, '.', '');

          return(
            'Aktuelles Guthaben klein: Bitte überweise weitere CHF '.$missing_balance.' oder entferne Produkte dem Warenkorb'
          );

        }

    }

    else {

        $new_balance = $current_balance - $order_total;
        $new_balance = number_format($new_balance, 2, '.', '');

        if ($new_balance >= 0) {

          return (
            'Aktuelles Guthaben: CHF '.$current_balance.' | Neues Guthaben: CHF '.$new_balance
          );

        }
        else {

            $missing_balance = -1 * $new_balance;
            $missing_balance = number_format($missing_balance, 2, '.', '');

            return(
              'Aktuelles Guthaben klein: Bitte überweise weitere CHF '.$missing_balance.' oder entferne Produkte dem Warenkorb.'
            );

        }

    }
  }

}