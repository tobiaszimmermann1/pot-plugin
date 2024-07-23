<?php


/*
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action( 'plugins_loaded', 'fc_init_gateway_class', 0 );
function fc_init_gateway_class() {

    if ( !class_exists( 'WC_Payment_Gateway' ) ) return;

    class WC_Foodcoop_Guthaben extends WC_Payment_Gateway {

 		/**
 		 * Class constructor
 		 */
 		public function __construct() {
         	$this->id = 'foodcoop_guthaben'; // payment gateway plugin ID
        	$this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name
        	$this->has_fields = true; 
        	$this->method_title = __('Foodcoop Guthaben','fcplugin');
        	$this->method_description = __('Pre-Pay Guthaben für die Foodcoop','fcplugin'); // will be displayed on the options page
        	$this->supports = array(
        		'products',
                'refunds'
        	);

        	// Method with all the options fields
        	$this->init_form_fields();

        	// Load the settings.
        	$this->init_settings();
        	$this->title = $this->get_option( 'title' );
        	$this->description = $this->get_option( 'description' );
        	$this->enabled = $this->get_option( 'enabled' );
        	$this->testmode = 'yes' === $this->get_option( 'testmode' );
        	$this->private_key = $this->testmode ? $this->get_option( 'test_private_key' ) : $this->get_option( 'private_key' );
        	$this->publishable_key = $this->testmode ? $this->get_option( 'test_publishable_key' ) : $this->get_option( 'publishable_key' );

        	// This action hook saves the settings
        	add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
 		}




        /**
 		 * Plugin options
 		 */
 		public function init_form_fields(){

        	$this->form_fields = array(
        		'enabled' => array(
        			'title'       => __('Aktivieren','fcplugin'),
        			'label'       => __('Foodcoop Guthaben aktivieren','fcplugin'),
        			'type'        => 'checkbox',
        			'description' => '',
        			'default'     => 'yes'
        		),
        		'title' => array(
        			'title'       => 'Title',
        			'type'        => 'text',
        			'description' => __('Titel, den Mitglieder beim Checkout sehen.','fcplugin'),
        			'default'     => __('Foodcoop Guthaben','fcplugin'),
        			'desc_tip'    => true,
        		),
        		'description' => array(
        			'title'       => 'Description',
        			'type'        => 'textarea',
        			'description' => __('Beschreibung, die Mitglieder beim Checkout sehen.','fcplugin'),
        			'default'     => __('Bezahle mit deinem Foodcoop Guthaben.','fcplugin'),
        		)
        	);

     	}
        
        public function payment_fields() {

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
                if (!in_array($bestellrunde_id, $bestellrunde_ids_in_cart) && $bestellrunde_id != '') {
                    array_push($bestellrunde_ids_in_cart, $bestellrunde_id);
                }
            }
            
            if (count($bestellrunde_ids_in_cart) == 1) {
                $active = $bestellrunde_ids_in_cart[0];
            }

            

            // Get previous order value
            if ($user_id && $active) {
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

                    echo '<div class="foodcoop_wallet_gateway_description">';

                    echo '<p>Dein aktuelles Guthaben: <strong>CHF '.$current_balance.'</strong>';

                    echo '<p>Bereits bezahltes Guthaben: <strong>CHF '.$previous_order_total.'</strong> (Bestellung #'.$order_id.' in Bestellrunde '.$active.')';

                    echo '<p>Differenzbetrag: <strong>'.$difference_text.'</strong>';

                    echo '<p style="border-top: 1px solid black;padding-top: 10px;"><strong>Neues Guthaben nach Bestellung: CHF '.$new_balance.'</strong>';

                    echo '</div>';

                }
                else {

                    $missing_balance = -1 * $new_balance;
                    $missing_balance = number_format($missing_balance, 2, '.', '');

                    echo '<div class="foodcoop_wallet_gateway_description">';

                    echo '<input type="hidden" id="foodcoop_wallet_balance_missing" value="true" />';

                    echo '<p>Dein aktuelles Guthaben ist zu klein. Bitte überweise weitere <strong>CHF '.$missing_balance.'</strong> auf unser Konto oder entferne Produkte aus deinem Warenkorb.';

                    echo '</div>';

                }

            }

            else {

                $new_balance = $current_balance - $order_total;
                $new_balance = number_format($new_balance, 2, '.', '');

                if ($new_balance >= 0) {

                    echo '<div class="foodcoop_wallet_gateway_description">';

                    echo '<p>Dein aktuelles Guthaben: <strong>CHF '.$current_balance.'</strong>';

                    echo '<p style="border-top: 1px solid black;padding-top: 10px;"><strong>Neues Guthaben nach Bestellung: CHF '.$new_balance.'</strong>';

                    echo '</div>';

                }
                else {

                    $missing_balance = -1 * $new_balance;
                    $missing_balance = number_format($missing_balance, 2, '.', '');

                    echo '<div class="foodcoop_wallet_gateway_description">';

                    echo '<input type="hidden" id="foodcoop_wallet_balance_missing" value="true" />';

                    echo '<p>Dein aktuelles Guthaben ist zu klein. Bitte überweise weitere <strong>CHF '.$missing_balance.'</strong> auf unser Konto oder entferne Produkte aus deinem Warenkorb.';

                    echo '</div>';

                }

            }








        }


        /*
        * Process the payment in wallet database
        */
        public function process_payment( $order_id ) {

            global $woocommerce;
            global $wpdb;

            $user_id = get_current_user_id();
            $had_ordered = false;

            // get current users balance
            $results = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
                     );
            foreach ( $results as $result ) {
               $current_balance = $result->balance;
            }

            $order_total = $woocommerce->cart->total;

            // get cart items to fetch bestellrunde_id
            $active = false;
            $bestellrunde_ids_in_cart = array();
            foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
                $bestellrunde_id = $cart_item['bestellrunde'];
                if (!in_array($bestellrunde_id, $bestellrunde_ids_in_cart) && $bestellrunde_id != '') {
                    array_push($bestellrunde_ids_in_cart, $bestellrunde_id);
                }
            }
            
            if (count($bestellrunde_ids_in_cart) == 1) {
                $active = $bestellrunde_ids_in_cart[0];
            }


            // Get previous order value
            if ($user_id && $active) {
                $args = array(
                    'customer' => $user_id,
                    'meta_key' => 'bestellrunde_id',
                    'meta_value' => $active,
                    'meta_compare' => '=',
                    'status'=> array( 'wc-processing', 'wc-on-hold', 'wc-refunded'  ),
                );   
                $prev_orders = wc_get_orders( $args );
                if ($prev_orders) {
                    foreach ($prev_orders as $prev_order) {
                        $prev_order_id = $prev_order->ID;
                        $previous_order_total_before_refunds = $prev_order->get_total();
                        $refunded_total = $prev_order->get_total_refunded();

                        $previous_order_total = $previous_order_total_before_refunds - $refunded_total;
                        $previous_order_total = number_format($previous_order_total, 2, '.', '');
                    }
                    $had_ordered = true;
                }
            }

            // If user has a previous order in bestellrunde
            if ($had_ordered) {

                $new_balance = $current_balance - $order_total + $previous_order_total;
                $new_balance = number_format($new_balance, 2, '.', '');

                $difference = $order_total - $previous_order_total;

                if ($new_balance >= 0) {

                    // DELETE PREVIOUS ORDER
                    $thisorder = wc_get_order($prev_order_id);
                    $thisorder->set_status( 'cancelled' );
                    $thisorder->save();
                    $thisorder->delete();

                    // create new order
                    $order_note = 'Bestellung ('.$prev_order_id.') angepasst. Bezahlt mit Foodcoop Guthaben: CHF' . $order_total . '; Neues Guthaben: CHF' . $new_balance .'; Differenz: CHF '.$difference;
                    $order = new WC_Order( $order_id );
                    //$order->payment_complete();
                    $order->update_status( 'processing', $order_note );
    
                    // Remove cart
                    $woocommerce->cart->empty_cart();
    
    
                    // Add Wallet Transaction
                    global $wpdb;
                    $table = $wpdb->prefix.'foodcoop_wallet';
    
                    $user_id = get_current_user_id();
                    $amount = -1 * $difference;
                    date_default_timezone_set('Europe/Zurich');
                    $date = date("Y-m-d H:i:s");
                    $details = 'Bestellung #'.$order_id.' (Anpassung)';
                    $created_by = get_current_user_id();
    
                    $new_balance = $current_balance + $amount;
    
                    $new_balance = number_format($new_balance, 2, '.', '');
    
                    $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
    
                    $wpdb->insert($table, $data);
    
    
                    // Return thankyou redirect
                    return array(
                        'result' => 'success',
                        'redirect' => $this->get_return_url( $order )
                    );

                }
                else { 

                    $missing_balance = -1 * $new_balance;
                    $missing_balance = number_format($missing_balance, 2, '.', '');
                    $error_message = 'Dein aktuelles Guthaben ist zu klein. Bitte überweise weitere <strong>CHF '.$missing_balance.'</strong> auf unser Konto oder entferne Produkte aus deinem Warenkorb.';
                    $order_note = 'Guthaben zu klein: ' . $missing_balance . 'zu wenig.';

                    $order = new WC_Order( $order_id );
                    $order->update_status( 'failed', $order_note );

                    throw new Exception( __( $error_message, 'fcplugin' ) );
                }

            }

            else {

                $new_balance = $current_balance - $order_total;
                $new_balance = number_format($new_balance, 2, '.', '');

                if ($new_balance >= 0) {

                    $order_note = 'Bezahlt mit Foodcoop Guthaben: CHF' . $order_total . '; Neues Guthaben: CHF' . $new_balance;
                    $order = new WC_Order( $order_id );
                    //$order->payment_complete();
                    $order->update_status( 'processing', $order_note );
    
                    // Remove cart
                    $woocommerce->cart->empty_cart();
    
    
                    // Add Wallet Transaction
                    global $wpdb;
                    $table = $wpdb->prefix.'foodcoop_wallet';
    
                    $user_id = get_current_user_id();
                    $amount = -1 * $order_total;
                    date_default_timezone_set('Europe/Zurich');
                    $date = date("Y-m-d H:i:s");
                    $details = 'Bestellung #'.$order_id.' (Neubestellung)';
                    $created_by = get_current_user_id();
    
                    $new_balance = $current_balance + $amount;
    
                    $new_balance = number_format($new_balance, 2, '.', '');
    
                    $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
    
                    $wpdb->insert($table, $data);
    
    
                    // Return thankyou redirect
                    return array(
                        'result' => 'success',
                        'redirect' => $this->get_return_url( $order )
                    );

                }
                else {

                    $missing_balance = -1 * $new_balance;
                    $missing_balance = number_format($missing_balance, 2, '.', '');
                    $error_message = 'Dein aktuelles Guthaben ist zu klein. Bitte überweise weitere <strong>CHF '.$missing_balance.'</strong> auf unser Konto oder entferne Produkte aus deinem Warenkorb.';
                    $order_note = 'Guthaben zu klein: ' . $missing_balance . 'zu wenig.';

                    $order = new WC_Order( $order_id );
                    $order->update_status( 'failed', $order_note );

                    throw new Exception( __( $error_message, 'fcplugin' ) );
                }

            }

     	}


        public function process_refund( $order_id, $amount = null, $reason = '' ) {

            // Add Wallet Transaction
            global $wpdb;
            $table = $wpdb->prefix.'foodcoop_wallet';


            $order = wc_get_order($order_id);
            $user_id = $order->get_user_id();

            $amount = number_format($amount, 2, '.', '');
            date_default_timezone_set('Europe/Zurich');
            $date = date("Y-m-d H:i:s");
            $details = $reason;
            $created_by = get_current_user_id();

            $results = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
                     );

            foreach ( $results as $result )
            {
               $current_balance = number_format($result->balance, 2, '.', '');
            }

            $new_balance = $current_balance + $amount;

            $new_balance = number_format($new_balance, 2, '.', '');

            $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);

            $wpdb->insert($table, $data);



            return true;

        }
 	}
}