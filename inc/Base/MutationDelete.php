<?php
/**
 * @package FoodcoopPlugin
 * 
 * Mutation: Delete product from orders through refunding
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;

class MutationDelete extends BaseController
{

  public function register() 
  {
    add_action( 'wp_ajax_nopriv_fc_mutation_delete_function', array($this,'fc_mutation_delete_function') );
    add_action( 'wp_ajax_fc_mutation_delete_function', array($this,'fc_mutation_delete_function') );
    add_action( 'wp_ajax_nopriv_fc_mutation_final_delete_function', array($this,'fc_mutation_final_delete_function') );
    add_action( 'wp_ajax_fc_mutation_final_delete_function', array($this,'fc_mutation_final_delete_function') );
  
  }


  // MUTATION DELETE FUNCTION

  function fc_mutation_delete_function() {

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

          $order = wc_get_order( $order_id );
          $items = $order->get_items();
          $url = $order->get_edit_order_url();
          $first_name = $order->get_billing_first_name();
          $last_name = $order->get_billing_last_name();

          foreach ( $items as $item ) {

              $product_id = $item->get_product_id();
              $ordered_qty = $item->get_quantity();

              // Get refunded quantity
              $order_refunds = $order->get_refunds();

              foreach( $order_refunds as $refund ){

                  foreach( $refund->get_items() as $r_item_id => $r_item ){

                      $r_product_id = $r_item->get_product_id();

                      if ($r_product_id == $product) {

                          $refunded_quantity      = $r_item->get_quantity(); // Quantity: zero or negative integer

                      }

                  }
              }

              $qty = $ordered_qty + $refunded_quantity;
              
              if ( $product_id == $product && $qty > 0 ) {

                  $mutation_orders .= 
                      "<a href='".$url."' target='_blank'>".$order_id." von ".$first_name." ".$last_name."</a> (".$qty." Stück) <br />
                      <input type='hidden' class='mutation_delete_order_id' value='".$order_id."'>";

              }

          }

      }

      if (empty($mutation_orders)) {

          $mutation_orders = "Keine";

          $final_step = false;

      }
      else {

          $final_step = true;
          $mutation_orders .= " <input type='hidden' class='mutation_delete_final_confirm' value='".$final_step."'>";

      }


      echo "Betroffene Bestellungen: <br />".$mutation_orders."
          <input type='hidden' id='mutation_delete_product_id' value='".$product."'>";

      die();

  }







  // MUTATION FINAL DELETE FUNCTION

  function fc_mutation_final_delete_function() {

      $orders = $_POST['orders'];
      $product = $_POST['product'];


      // GET CURRENT PRODUCT NAME
      $load_product = wc_get_product( $product );
      $product_name = $load_product->get_name();


      foreach( $orders as $order_id ) {

          $order  = wc_get_order( $order_id );
    
          // IF it's something else such as a WC_Order_Refund, we don't want that.
          if( ! is_a( $order, 'WC_Order') ) {
            echo "Fehelr.";
          }
          
          // Get Items
          $order_items   = $order->get_items();
          
          // Refund Amount
          $refund_amount = 0;
        
          // Prepare line items which we are refunding
          $line_items = array();
        
          if ( $order_items = $order->get_items()) {
        
              foreach( $order_items as $item_id => $item ) {
    
                  $product_id = $item->get_product_id();
                      
                  if ($product_id == $product) {
          
                      $item_meta 	= $order->get_item_meta( $item_id );
              
                      $product_data = wc_get_product( $item_meta["_product_id"][0] );
    
                      $qty = $item->get_quantity();
                          
                      $item_ids[] = $item_id;
                      $tax_data = $item_meta['_line_tax_data'];
                      $refund_tax = 0;
              
                      if( is_array( $tax_data[0] ) ) {
              
                      $refund_tax = array_map( 'wc_format_decimal', $tax_data[0] );
              
                      }
              
                      $refund_amount = wc_format_decimal( $refund_amount ) + wc_format_decimal( $item_meta['_line_total'][0] );
    
                      
              
                      $line_items[ $item_id ] = array( 'qty' => $qty, 'refund_total' => wc_format_decimal( $item_meta['_line_total'][0] ), 'refund_tax' =>  $refund_tax );
              
                      
                  }
              }
              
              wc_create_refund( array(
                  'amount'         => $refund_amount,
                  'reason'         => 'Mutation: Produkt nicht geliefert ('.$product_name.')',
                  'order_id'       => $order_id,
                  'line_items'     => $line_items,
                  'refund_payment' => true
              ) );
    
          }

      }

      echo 'Produkte wurden zurück erstattet.';

      die();

  }


}