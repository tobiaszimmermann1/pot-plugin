<?php

class OrderMeta
{

  public function __construct() 
  {
    // for checkout using store api
    add_action('woocommerce_store_api_checkout_order_processed', array($this,'before_checkout_create_order'), 20, 2);
    add_action('woocommerce_store_api_checkout_order_processed', array($this,'update_member_balance'), 30, 2);
    // fallback for legacy checkout
    add_action('woocommerce_checkout_create_order', array($this,'before_checkout_create_order_legacy'), 20, 2);
    add_action( 'woocommerce_checkout_order_processed', array($this,'meta_to_line_item_legacy') );

    // for classic checkout. Use the thankyou hook in case the payment fails
    add_action('woocommerce_thankyou', array($this, 'update_member_balance'), 20);

    // needed for POS checkout
    add_action('woocommerce_order_status_completed', array($this,'update_member_balance'), 20);

    // admin display
    add_action('woocommerce_admin_order_data_after_order_details', array($this,'display_meta_orders'), 10, 1 );
  }


  /**
   * Add order meta to created orders ('bestellrunde_id)
   */
  function before_checkout_create_order( $order ) {
    
    // get cart items to fetch bestellrunde_id and order_type
    $bestellrunde_ids_in_cart = array();
    $orer_types_in_cart = array();

    foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
      $bestellrunde_id = $cart_item['bestellrunde'];
      if (!in_array($bestellrunde_id, $bestellrunde_ids_in_cart)) {
        array_push($bestellrunde_ids_in_cart, $bestellrunde_id);
      }

      $order_type_of_item = $cart_item['order_type'];
      if (!in_array($order_type_of_item, $orer_types_in_cart)) {
        array_push($orer_types_in_cart, $order_type_of_item);
      }
    }
    
    if (count($bestellrunde_ids_in_cart) == 1) {
      $order->update_meta_data( 'bestellrunde_id', $bestellrunde_ids_in_cart[0] );
    }

    if (count($orer_types_in_cart) == 1) {
      $order->update_meta_data( 'order_type', $orer_types_in_cart[0] );
    }


    foreach ($order->get_items() as $item_id => $item_obj) {

      $p = $item_obj->get_product();
      $id = $p->get_id();

      $key = '_lieferant';
      $value = get_post_meta($id, $key, true );
      wc_update_order_item_meta($item_id, $key, $value);

      $key = '_einheit';
      $value = get_post_meta($id, $key, true );
      wc_update_order_item_meta($item_id, $key, $value);

      $key = '_herkunft';
      $value = get_post_meta($id, $key, true );
      wc_update_order_item_meta($item_id, $key, $value);

      $key = '_pid';
      $value = $id;
      wc_update_order_item_meta($item_id, $key, $value);

      $key = '_category';
      $value = $p->get_category_ids()[0];
      wc_update_order_item_meta($item_id, $key, $value);

      $key = '_sku';
      $value = $p->get_sku();
      wc_update_order_item_meta($item_id, $key, $value);
    }
  }  
  
  
  /**
  * LEGACY functions for old checkout (non block)
  */
 function before_checkout_create_order_legacy( $order ) {

   // get cart items to fetch bestellrunde_id and order_type
   $bestellrunde_ids_in_cart = array();
   $orer_types_in_cart = array();

   foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
     $bestellrunde_id = $cart_item['bestellrunde'];
     if (!in_array($bestellrunde_id, $bestellrunde_ids_in_cart)) {
       array_push($bestellrunde_ids_in_cart, $bestellrunde_id);
     }

     $order_type_of_item = $cart_item['order_type'];
     if (!in_array($order_type_of_item, $orer_types_in_cart)) {
       array_push($orer_types_in_cart, $order_type_of_item);
     }
   }
   
   if (count($bestellrunde_ids_in_cart) == 1) {
     $order->update_meta_data( 'bestellrunde_id', $bestellrunde_ids_in_cart[0] );
   }

   if (count($orer_types_in_cart) == 1) {
     $order->update_meta_data( 'order_type', $orer_types_in_cart[0] );
   }

 }

 function meta_to_line_item_legacy( $order_id )
 {

   $order = wc_get_order($order_id);

   foreach ($order->get_items() as $item_id => $item_obj) {

       $p = $item_obj->get_product();
       $id = $p->get_id();

       $key = '_lieferant';
       $value = get_post_meta($id, $key, true );
       wc_update_order_item_meta($item_id, $key, $value);

       $key = '_einheit';
       $value = get_post_meta($id, $key, true );
       wc_update_order_item_meta($item_id, $key, $value);

       $key = '_herkunft';
       $value = get_post_meta($id, $key, true );
       wc_update_order_item_meta($item_id, $key, $value);

       $key = '_pid';
       $value = $id;
       wc_update_order_item_meta($item_id, $key, $value);

       $key = '_category';
       $value = $p->get_category_ids()[0];
       wc_update_order_item_meta($item_id, $key, $value);

       $key = '_sku';
       $value = $p->get_sku();
       wc_update_order_item_meta($item_id, $key, $value);
   }
 }


  /**
   * Display field value on the order edit page
   */
  function display_meta_orders( $order ){
      $order_id = $order->get_id();
      $bestellrunde_id = $order->get_meta('bestellrunde_id');
      $order_type = $order->get_meta('order_type');
      if ($bestellrunde_id || $order_type) {        
        echo    '<p>&nbsp;</p>';    
        echo    '<h3 style="margin-bottom: 5px;">Foodcoop Order</h3>';    
        echo    __('Order Type').':<strong> ' . $order_type . '</strong><br />';    
        echo    __('Bestellrunde').':<strong> ' . $bestellrunde_id . '</strong>';   
      } 
  }


  function update_member_balance( $order_id ){
    global $wpdb;
    if (get_option('fc_update_balance_on_purchase') == '1' && ! get_post_meta( $order_id, '_payout_done', true )){
      $order = wc_get_order( $order_id );
      $table = $wpdb->prefix.'foodcoop_wallet';
      date_default_timezone_set('Europe/Zurich');
      $date = date("Y-m-d H:i:s");

      // Iterate through each order item and update the balance of the product owner (fc_owner)
      foreach ($order->get_items() as $item_id => $item_obj) {
        $product = $item_obj->get_product();
        $fc_owner = $product->get_meta('fc_owner');

        if ($fc_owner){
          $fc_owner = intval($fc_owner);

          $amount = $item_obj->get_total() / $product->get_price();

          // get current balance.
          // TODO: Copied from foodcoop-rest-routes.php, postSaveDeliveryByOwner. Could be unified in a function
          $current_balance = 0.00;
          $results = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $fc_owner)
          );
          foreach ( $results as $result ) {
            $current_balance = $result->balance;
          }

          // calculate balance to pay to member
          $balance = floatval($item_obj->get_total());
          $balance = number_format($balance, 2, '.', '');

          $details = 'Neuer Verkauf von Produkt '.$product->get_name().'('.$amount.'x)';
          $created_by = get_current_user_id();
          $new_balance = $current_balance + $balance;
          $new_balance = number_format($new_balance, 2, '.', '');

          $data = array('user_id' => $fc_owner, 'amount' => $balance, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
          $wpdb->insert($table, $data);
        }

        update_post_meta( $order_id, '_payout_done', true );
      }
    }
  }
}