<?php
  //bestellrunde
  $bestellrunde = $data['bestellrunde'];
  $bestellrunde_info = __("ID","fcplugin") . ': '.$bestellrunde . '
  <br>'. __("Bestellfenster","fcplugin") . ': '. date_format(date_create(get_post_meta( $bestellrunde, 'bestellrunde_start', true )),'d.m.Y') . ' - ' . date_format(date_create(get_post_meta( $bestellrunde, 'bestellrunde_end', true )),'d.m.Y') . '
  <br>'. __("Verteiltag","fcplugin") . ': '. date_format(date_create(get_post_meta( $bestellrunde, 'bestellrunde_verteiltag', true )),'d.m.Y');

  // orders query
  $orders = wc_get_orders( array(
    'limit'         => -1, 
    'status'        => array('completed', 'processing', 'on-hold', 'refunded'),
    'orderby'       => 'date',
    'order'         => 'DESC',
    'meta_key'      => 'bestellrunde_id', 
    'meta_value'    => $bestellrunde, 
  ));

  // get all producers, products, order_items and users of bestellrunde in arrays
  $lieferanten = array();
  $produkte = array();
  $users = array();
  $order_items = array();

  foreach( $orders as $order ){
    // users
    $user = $order->get_user();
    $user_id = $order->get_user_id();
    $username = $order->get_billing_first_name(). " " . $order->get_billing_last_name();
    $users[$username] = $user_id;

    foreach ( $order->get_items() as $item_id => $item ) {

      // check if there is already an order item with the same product name and from the same user in the order_items array. if yes, then merge instead of creating a new order item
      $is_duplicate = false;
      for ($i = 0; $i < count($order_items); $i++) {
        if ($order_items[$i][0] == $username AND $order_items[$i][3] == $item->get_name()) {
          // qty to add quantity
          $item_total_quantity = $item->get_quantity(); 
          $item_quantity_refunded = $order->get_qty_refunded_for_item( $item_id );
          $item_final_quantity = $item_total_quantity + $item_quantity_refunded; 
          $new_qty = $order_items[$i][4] + $item_final_quantity;
          $order_items[$i][4] = $new_qty;

          $is_duplicate = true;
        } 
      }

      if ($is_duplicate == false) {

        // producers                       
        $product_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
        // fallback
        if (!$product_lieferant) {
            $product_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
        }

        if ( !in_array($product_lieferant, $lieferanten) ) {
          array_push($lieferanten,$product_lieferant);
        }

        // products and order_items
        $item_array = array();

        // user that has ordered the item
        array_push($item_array, $username);

        // product id
        $product_id = intval(wc_get_order_item_meta( $item_id, '_pid', true));
        // fallback
        if(!$product_id) {
          $product_id = $item->get_product_id();
        }
        array_push($item_array,$product_id);

        // product sku
        $product_sku = wc_get_order_item_meta( $item_id, '_sku', true);
        // fallback
        if(!$product_sku) {
          $product_sku = $item->get_product()->get_sku();
        }
        array_push($item_array,$product_sku);

        // einheit
        $product_einheit = esc_attr(wc_get_order_item_meta( $item_id, '_einheit', true));
        // fallback
        if (!$product_einheit) {
          $product_einheit = esc_attr(get_post_meta( $item->get_product_id(), '_einheit',true ));
        }
        array_push($item_array,$product_einheit);

        // name
        $product_name = $item->get_name();
        array_push($item_array,$product_name);
        
        // ordered quantity
        $item_total_quantity = $item->get_quantity(); 
        $item_quantity_refunded = $order->get_qty_refunded_for_item( $item_id );
        $item_final_quantity = $item_total_quantity + $item_quantity_refunded; 
        array_push($item_array,$item_final_quantity);

        // push info to product array if it is not already
        if ( !array_key_exists($product_id, $produkte) ) {
          $produkte[$product_id] = $item_array;
        }

        // push to order_item array
        array_push($order_items, $item_array);
      }
    }
  }

  // structure the products data
  $products_by_lieferant = array();
  foreach($lieferanten as $lieferant) {
    $products_for_this_lieferant = array();
    foreach($produkte as $product_id => $product) {
      if ($product[1] == $lieferant) {
        array_push($products_for_this_lieferant, $product); 
      }
    }
    $products_by_lieferant[$lieferant] = $products_for_this_lieferant;
  }

  // structure the users data
  $users_by_lieferant = array();
  foreach($lieferanten as $lieferant) {
    $users_for_this_lieferant = array();
    foreach($order_items as $order_item) {
      if ($order_item[1] == $lieferant) {
        if ( !in_array($order_item[0], $users_for_this_lieferant) ) {
          array_push($users_for_this_lieferant, $order_item[0]);
        }
      }
    }
    $users_by_lieferant[$lieferant] = $users_for_this_lieferant;
  }


  // Classic interface  
  $xlsx = new SimpleXLSXGen();



  foreach( $lieferanten as $lieferant ){

    $sheet_array = [
      [$lieferant,date_format(date_create(get_post_meta( $bestellrunde, 'bestellrunde_verteiltag', true )),'d.m.Y')]
    ];
    
    $xlsx->addSheet( $sheet_array, $lieferant );

  }

  $xlsx->downloadAs('bestellrunde-'.$bestellrunde.'-data-export.xlsx');