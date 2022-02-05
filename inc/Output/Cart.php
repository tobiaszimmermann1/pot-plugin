<?php
/**
 * @package FoodcoopPlugin
 * 
 * Add Custom Product List for Ordering, Shortcode
 * 
 */

namespace Inc\Output;

use \Inc\Base\BaseController;
use \Inc\Base\CPTBestellrunden;

class Cart extends BaseController
{
    public function register()
    {
      add_action( 'wp', array($this,'fc_populate_cart') );
    }

    
    /**
     * If order exists in current 'Bestellrunde', prepopulate the cart with items in order
     */
    function fc_populate_cart( $user_id ) {
    
      if ( is_user_logged_in() && is_cart() && WC()->cart->cart_contents_count == 0 ) {

        $has_ordered = false;

        // Check if 'Bestellrunde' is active
        $bestellrunde = new CPTBestellrunden();
        $active = $bestellrunde->check_bestellrunde();
        
        // Check if current user has ordered in current 'Bestellrunde'
        if($active) {
          $has_ordered = $bestellrunde->current_user_has_ordered($active);
          if ($has_ordered) {
            WC()->cart->empty_cart();
          }
        }

        // populate cart with order, if user has ordered
        if ($has_ordered) {

            $order = wc_get_order($has_ordered);
            foreach ( $order->get_items() as $item_id => $item ) {
                $product_id = $item->get_product_id();
                $quantity = $item->get_quantity(); 
                WC()->cart->add_to_cart( $product_id, $quantity );
            }

        }

      }    

    }



}









