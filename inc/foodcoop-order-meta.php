<?php

class OrderMeta
{

  public function __construct() 
  {
    add_action('woocommerce_checkout_create_order', array($this,'before_checkout_create_order'), 20, 2);
    add_action( 'woocommerce_admin_order_data_after_order_details', array($this,'display_meta_orders'), 10, 1 );
    add_action( 'woocommerce_thankyou', array($this,'meta_to_line_item') );
  }

  /**
   * Add order meta to created orders ('betellrunde_id)
   */
  function before_checkout_create_order( $order, $data ) {
    // check if bestellrunde is active and if yes, set the id
    $bestellrunden = get_posts(array(
      'numberposts' => -1,
      'post_type'   => 'bestellrunden',
      'meta_key' => 'bestellrunde_start',
      'orderby' => 'meta_value',
    ));

    $bestellrunde_dates = array();
    $now = date('Y-m-d');
    $active = false;
    foreach ($bestellrunden as $b) {
      $id = $b->ID;
      $start = get_post_meta( $id, 'bestellrunde_start', true );
      $end = get_post_meta( $id, 'bestellrunde_ende', true );
      if ($start <= $now AND $end >= $now) {
          $active = $id;
      }
    }

    $order->update_meta_data( 'bestellrunde_id', $active );
  }


  /**
   * Display field value on the order edit page
   */
  function display_meta_orders( $order ){
      $order_id = method_exists( $order, 'get_id' ) ? $order->get_id() : $order->id;
      $bestellrunde_id = get_post_meta( $order_id, 'bestellrunde_id', true );
      
      echo    '<p style="display: inline-block;margin-top:20px; font-size:20px; padding: 10px!important;background-color:#f0f0f0;color:green;">'.__('Bestellrunde').':<strong> ' . $bestellrunde_id . '</strong></p>';    
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