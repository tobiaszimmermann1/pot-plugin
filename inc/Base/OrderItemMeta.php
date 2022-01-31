<?php
/**
 * @package FoodcoopPlugin
 * 
 * Add product meta to line item meta
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;

class OrderItemMeta extends BaseController
{

  public function register() 
  {  
    add_action( 'woocommerce_thankyou', array($this,'meta_to_line_item') );
  }

  function meta_to_line_item( $order_id )
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

    }

  }

}







