<?php
/**
 * @package FoodcoopPlugin
 * 
 * Add extra meta fields to WC Products
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;
use \Inc\Base\CPTBestellrunden;

class OrderMeta extends BaseController
{

  public function register() 
  {
    add_action('woocommerce_checkout_create_order', array($this,'before_checkout_create_order'), 20, 2);
    add_action( 'woocommerce_admin_order_data_after_order_details', array($this,'display_meta_orders'), 10, 1 );
  }

  /**
   * Add order meta to created orders ('betellrunde_id)
   */
  function before_checkout_create_order( $order, $data ) {
    $bestellrunde = new CPTBestellrunden();
    $active = $bestellrunde->check_bestellrunde();
    $order->update_meta_data( 'bestellrunde_id', $active );
  }


  /**
   * Display field value on the order edit page
   */
  function display_meta_orders( $order ){
      $order_id = method_exists( $order, 'get_id' ) ? $order->get_id() : $order->id;
      $bestellrunde_id = get_post_meta( $order_id, 'bestellrunde_id', true );
      $verteiltag = get_post_meta( $bestellrunde_id, 'bestellrunde_verteiltag', true );
      
      echo    '<p style="display: inline-block;margin-top:20px; font-size:20px; padding: 10px!important;background-color:#f0f0f0;color:green;">'.__('Bestellrunde').':<strong> ' . $verteiltag . '</strong></p>';    
  }

}







