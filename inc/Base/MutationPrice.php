<?php
/**
 * @package FoodcoopPlugin
 * 
 * Mutation: Change price of a product and refund/charge the difference
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;

class MutationPrice extends BaseController
{

  public function register() 
  {
    add_action( 'wp_ajax_nopriv_fc_mutation_price_function', array($this,'fc_mutation_price_function') );
    add_action( 'wp_ajax_fc_mutation_price_function', array($this,'fc_mutation_price_function') );
    add_action( 'wp_ajax_nopriv_fc_mutation_final_price_function', array($this,'fc_mutation_final_price_function') );
    add_action( 'wp_ajax_fc_mutation_final_price_function', array($this,'fc_mutation_final_price_function') );
  }

  // MUTATION PRICE FUNCTION

  function fc_mutation_price_function() {

      $product = $_POST['product'];
      $bestellrunde = $_POST['bestellrunde'];

      // orders query
      $orders = wc_get_orders( array(
        'limit'         => -1, 
        'orderby'       => 'date',
        'order'         => 'DESC',
        'meta_key'      => 'bestellrunde_id', 
        'meta_value'    => $bestellrunde, 
      ));

        foreach( $orders as $order ) {

          $order_id = $order->ID;

          $items = $order->get_items();
          $url = $order->get_edit_order_url();
          $first_name = $order->get_billing_first_name();
          $last_name = $order->get_billing_last_name();

            foreach ( $items as $item_id => $item ) {

                $product_id = wc_get_order_item_meta( $item_id, '_pid', true);
                $fallback_id = $item->get_product_id();
                $ordered_qty = $item->get_quantity();

                if (!$product_id) {
                    if ($fallback_id) {
                        $product_id = $fallback_id;
                    }
                    else {
                        echo "Fehler: keine Bestellungen gefunden.";
                        die();
                    }
                }

                if ($ordered_qty > 0 ) {

                    // Get refunded quantity
                    $order_refunds = $order->get_refunds();

                    foreach( $order_refunds as $refund ){

                        foreach( $refund->get_items() as $r_item_id => $r_item ){

                            $r_product_id = $r_item->get_product_id();

                            if ($r_product_id == $product_id) {

                                $refunded_quantity = $r_item->get_quantity(); // Quantity: zero or negative integer

                            }

                        }
                    }

                    $qty = $ordered_qty + $refunded_quantity;
            
                    if ($product_id == $product && $qty > 0) {

                        // GET CURRENT PRODUCT PRICE
                        $price = number_format($item->get_total(), 2, '.', ''); 
                        $current_product_price = $price / $qty;
        
                        $mutation_orders .= 
                            "<a href='".$url."' target='_blank'>".$order_id." von ".$first_name." ".$last_name."</a> (".$qty." Stück) <br />
                            <input type='hidden' class='mutation_price_order_id' value='".$order_id."'>";
        
                    }

                }

            }

        }

      if (empty($mutation_orders)) {

          $mutation_orders = "Keine";

          $final_step = false;

      }
      else {

          $final_step = true;
          $mutation_orders .= " <input type='hidden' class='mutation_price_final_confirm' value='".$final_step."'>";

      }


      echo "Betroffene Bestellungen: <br />".$mutation_orders."
          <input type='hidden' id='mutation_price_product_id' value='".$product."'>
          <input type='hidden' id='current_product_price' value='".$current_product_price."'>
          ";

      die();

  }

















  // MUTATION FINAL PRICE FUNCTION

  function fc_mutation_final_price_function() {

      $order_ids = $_POST['orders'];
      $product_id = $_POST['product'];
      $old_product_price = $_POST['old_price'];
      $new_price = number_format($_POST['price'], 2, '.', '');

      // UPDATE PRODUCT PRICE
      update_post_meta( $product_id, '_regular_price', $new_price );


      foreach( $order_ids as $order_id ) {

          $order = wc_get_order( $order_id ); // The WC_Order object instance

          foreach ($order->get_items() as $item_id => $item) {

              $item_product_id = wc_get_order_item_meta( $item_id, '_pid', true);

              if(!$item_product_id) {
                  $item_product_id = $item->get_product_id();
              }

              if ($product_id == $item_product_id) {

                  $product_name = $item->get_name();

                  $new_product_price = $new_price;
                  $product_quantity = (int) $item->get_quantity(); // order item Quantity
                  
                  // The new line item price
                  $new_line_item_price = $new_product_price * $product_quantity;
                  
                  // Set the new price
                  $item->set_subtotal( $new_line_item_price ); 
                  $item->set_total( $new_line_item_price );
              
                  // Make new taxes calculations
                  $item->calculate_taxes();
              
                  $item->save(); // Save line item data


                  // CALCULATE DIFF AMOUNT: 
                  $price_diff = $product_quantity * ($old_product_price - $new_product_price);


                  // CREATE WALLET TRANSACTION

                      // GET CURRENT BALANCE OF USER
                      global $woocommerce;
                      global $wpdb;

                      $user_id = $order->get_user_id();

                      $results = $wpdb->get_results(
                                  $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
                              );

                      foreach ( $results as $result )
                      {
                          $current_balance = $result->balance;
                      }

                      // CALCULATE NEW BALANCE
                      $new_balance = $current_balance + $price_diff;
                      $new_balance = number_format($new_balance, 2, '.', '');

                      // ADD WALLET TRANSACTION
                      $table = $wpdb->prefix.'foodcoop_wallet';

                      $amount = $price_diff;
                      date_default_timezone_set('Europe/Zurich');
                      $date = date("Y-m-d H:i:s");
                      $details = 'Mutation: Produktpreisanpassung ('.$product_name.')';
                      $created_by = get_current_user_id();
      
                      $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
      
                      $wpdb->insert($table, $data);

              }

          }

          $order->calculate_totals();

      }

      echo 'Produktpreis wurde auf CHF '.$new_price.' verändert.';

      die();

  }



}