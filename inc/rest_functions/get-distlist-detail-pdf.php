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
      array_push($item_array,$product_lieferant);

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
    sort($users_for_this_lieferant); // sort users alphabetically
    $users_by_lieferant[$lieferant] = $users_for_this_lieferant;
  }

  // create pdf
  $mpdf = new \Mpdf\Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'orientation' => 'L',
    'default_font_size' => 9,
    'default_font' => 'Verdana'
  ]);

  // count total pages required
  $pages = count($lieferanten) + count($produkte);
  $current_page = 1;

  foreach( $lieferanten as $lieferant ){

    $title_page = '
      <div style="margin-top:0cm;font-size:20pt;font-family:Arial; width: 100%;">
        <table style="width: 100%;font-size:20pt;border:1px solid black;" cellspacing="0">
          <tr>
            <td style="padding:5px 10px 5px 10px;font-weight:bold;vertical-align:top;">'.__("Verteilliste Detail","fcplugin").'</td>
          </tr>
          <tr>
            <td style="padding:5px 10px 5px 10px;font-weight:bold;vertical-align:top;"><br> '.__("Produzent","fcplugin").': '.$lieferant.'</td>
          </tr>
          <tr>
            <td style="padding:5px 10px 5px 10px;font-weight:bold;vertical-align:top;"><br>'. __("Bestellrunde","fcplugin").' <br>'.$bestellrunde_info.'</td>
          </tr>
        </table>
      </div>
    ';

    $mpdf->WriteHTML($title_page);
    $current_page++;
    $mpdf->AddPage();

    foreach($products_by_lieferant[$lieferant] as $product) {

        // header
        $header = '
          <div style="margin-top:0cm;font-size:7pt;font-family:Arial; width: 100%;">
            <table style="width: 100%;font-size:7pt;border:1px solid black;" cellspacing="0">
              <tr>
                <td style="padding:5px 10px 5px 10px;border-bottom:1px solid black;font-weight:bold;vertical-align:top;" colspan="2">'.__("Verteilliste Detail","fcplugin").'</td>
              </tr>
              <tr>
                <td style="padding:5px 10px 5px 10px;border-bottom:1px solid black;font-weight:bold;vertical-align:top;">'.__("Produkt","fcplugin").'</td>
                <td style="padding:5px 10px 5px 10px;border-bottom:1px solid black;font-weight:bold;font-size:16pt;">'.$product[3].'</td>
              </tr>
              <tr>
                <td style="padding:5px 10px 5px 10px;border-bottom:1px solid black;font-weight:bold;vertical-align:top;">'.__("Einheit","fcplugin").'</td>
                <td style="padding:5px 10px 5px 10px;border-bottom:1px solid black;font-weight:bold;">'.$product[2].'</td>
              </tr>
              <tr>
                <td style="padding:5px 10px 5px 10px;font-weight:bold;vertical-align:top;">'.__("Lieferant","fcplugin").'</td>
                <td style="padding:5px 10px 5px 10px;font-weight:bold;">'.$lieferant.'</td>
              </tr>
            </table>
          </div>
        ';

        $body = '
          <div style="margin-top:1cm;width: 100%;">
            <table style="width: 100%;border-top:1px solid #8e8e8e;border-left:1px solid #8e8e8e;border-right:1px solid #8e8e8e;" cellspacing="0">
            <tr>
              <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; border-right: 1px solid #8e8e8e; font-size:7pt;font-weight:bold;">Mitglied</td>
              <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; border-right: 1px solid #8e8e8e; font-size:7pt;font-weight:bold;">Menge</td>
              <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; border-right: 1px solid #8e8e8e; font-size:7pt;width:0.5cm;font-weight:bold;">AK</td>
              <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; font-size:7pt;width:5cm;font-weight:bold;">Notiz</td>
            </tr>
        ';

        foreach($order_items as $order_item) {

          if ($order_item[1] == $lieferant AND $order_item[3] == $product[3] AND $order_item[2] == $product[2]) {

            if ($order_item[4] > 0) {

              $body .= '
                <tr>
                  <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; border-right: 1px solid #8e8e8e; font-size:7pt;">'.$order_item[0].'</td>
                  <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; border-right: 1px solid #8e8e8e; font-size:7pt;">'.$order_item[4].'</td>
                  <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; border-right: 1px solid #8e8e8e; font-size:7pt;width:0.5cm;"></td>
                  <td style="padding:3px 10px 3px 10px; border-bottom:1px solid #8e8e8e; font-size:7pt;width:5cm;"></td>
                </tr>
              ';

            }
          } 

        }

        $body .= '
            </table>
          </div>
        ';

        //footer
        $store_address     = esc_attr(get_option( 'woocommerce_store_address' ) );
        $store_address_2   = esc_attr(get_option( 'woocommerce_store_address_2' ) );
        $store_city        = esc_attr(get_option( 'woocommerce_store_city' ) );
        $store_postcode    = esc_attr(get_option( 'woocommerce_store_postcode' ) );

        $footer = '
          <div style="width:100%;border-top:1px solid #ccc;padding:10px 0 20px 0;position:absolute;bottom:0;left:0;text-align:center;font-size:7pt;">
            '.get_bloginfo( 'name' ).' - '.$store_address.' '.$store_address.' '.$store_address_2.' '.$store_postcode.' '.$store_city.'   ///   '.date("d.m.Y - H:i").' - ' . __("Seite", "fcplugin") . ' ' . $current_page . '/' . $pages . '
          </div>
        ';

        $mpdf->WriteHTML($header);
        $mpdf->WriteHTML($body);
        $mpdf->WriteHTML($footer);
        $current_page < $pages && $mpdf->AddPage();
        $current_page++;
    }
  }

  $pdf = $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);