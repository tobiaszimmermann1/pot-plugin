<?php
  /**
   * Creates a PDF with receipts for all orders of a bestellrunde
   * params: bestellrunde_id
   */


  //bestellrunde
  $bestellrunde = $data['bestellrunde'];
  $bestellrunde_info = __("ID","fcplugin") . ': '.$bestellrunde . '
  <br>'. __("Bestellfenster","fcplugin") . ': '. date_format(date_create(get_post_meta( $bestellrunde, 'bestellrunde_start', true )),'d.m.Y') . ' - ' . date_format(date_create(get_post_meta( $bestellrunde, 'bestellrunde_end', true )),'d.m.Y') . '
  <br>'. __("Verteiltag","fcplugin") . ': '. date_format(date_create(get_post_meta( $bestellrunde, 'bestellrunde_verteiltag', true )),'d.m.Y');

  // orders query
  $orders = wc_get_orders( array(
      'limit'         => -1, 
      'orderby'       => 'date',
      'order'         => 'DESC',
      'meta_key'      => 'bestellrunde_id', 
      'meta_value'    => $bestellrunde, 
  ));

  // create pdf
  $mpdf = new \Mpdf\Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'orientation' => 'P',
    'default_font_size' => 7,
    'default_font' => 'Arial'
  ]);

  // count total pages required
  $pages = count($orders);
  $current_page = 1;

  // loop through orders
  foreach( $orders as $order ) {

    // header
    $header = '
    <div style="margin-top:0cm;font-size:7pt;font-family:Arial; width: 100%;">
      <table style="width: 100%;font-size:7pt;border:1px solid black;" cellspacing="0">
        <tr>
          <td style="padding:3px 8px;border-bottom:1px solid black;font-weight:bold;vertical-align:top;" colspan="2">'.__("Bestellung","fcplugin").' '.$order->get_id().'</td>
        </tr>
        <tr>
          <td style="padding:3px 8px;border-bottom:1px solid black;font-weight:bold;vertical-align:top;">'.__("Mitglied","fcplugin").'</td>
          <td style="padding:3px 8px;border-bottom:1px solid black;font-weight:bold;font-size:16pt;">'.$order->get_billing_first_name()." ".$order->get_billing_last_name().' ('.$order->get_customer_id().')<br />
          <span style="font-weight:normal;font-size:7pt;">'.__("Tel","fcplugin").': '.$order->get_billing_phone().'</span></td>
        </tr>
        <tr>
          <td style="padding:3px 8px;border-bottom:1px solid black;font-weight:bold;vertical-align:top;">'.__("Bestellrunde","fcplugin").'</td>
          <td style="padding:3px 8px;border-bottom:1px solid black;vertical-align:top;">'. $bestellrunde_info.'</td>
        </tr>
        <tr>
          <td style="padding:3px 8px;font-weight:bold;">'.__("Total","fcplugin").'</td>
          <td style="padding:3px 8px;">CHF '.number_format((float)$order->get_total() - (float)$order->get_total_refunded(), 2, '.', '').'</td>
        </tr>
      </table>
    </div>
    ';

    $body = '
    <div style="margin-top:1cm;font-size:7pt;width: 100%;">
      <table style="width: 100%; border-top:1px solid black;border-left:1px solid black;border-right:1px solid black;" cellspacing="0">
      <tr>
        <td style="padding:3px 8px;border-bottom:1px solid black; border-right:1px solid black;font-size:7pt;font-weight:bold;">Produkt</td>
        <td style="padding:3px 8px;border-bottom:1px solid black; border-right:1px solid black;font-size:7pt;font-weight:bold;">Kategorie</td>
        <td style="padding:3px 8px;border-bottom:1px solid black; border-right:1px solid black;font-size:7pt;font-weight:bold;">Lieferant</td>
        <td style="padding:3px 8px;border-bottom:1px solid black; border-right:1px solid black;font-size:7pt;font-weight:bold;">Herkunft</td>
        <td style="padding:3px 8px;border-bottom:1px solid black; border-right:1px solid black;font-size:7pt;font-weight:bold;text-align:center;">Einheit</td>
        <td style="padding:3px 8px;border-bottom:1px solid black; border-right:1px solid black;font-size:7pt;font-weight:bold;text-align:center;">Menge</td>
        <td style="padding:3px 8px;border-bottom:1px solid black; border-right:1px solid black;font-size:7pt;font-weight:bold;text-align:center;">Preis (CHF)</td>
        <td style="padding:3px 8px;border-bottom:1px solid black; font-size:7pt;font-weight:bold;width:5cm;">Notiz</td>
      </tr>
    ';

    // loop through items of order
    foreach ( $order->get_items() as $item_id => $item ) {
      // lieferant                        
      $product_lieferant = esc_html(wc_get_order_item_meta( $item_id, '_lieferant', true));
      // fallback
      if (!$product_lieferant) {
          $product_lieferant = esc_html(get_post_meta( $item->get_product_id(), '_lieferant',true ));
      }

      // herkunft                        
      $product_herkunft = esc_html(wc_get_order_item_meta( $item_id, '_herkunft', true));
      // fallback
      if (!$product_herkunft) {
          $product_herkunft = esc_html(get_post_meta( $item->get_product_id(), '_herkunft',true ));
      }

      // einheit
      $product_einheit = esc_html(wc_get_order_item_meta( $item_id, '_einheit', true));
      // fallback
      if (!$product_einheit) {
          $product_einheit = esc_html(get_post_meta( $item->get_product_id(), '_einheit',true ));
      }

      // category
      $product_category_id = esc_html(wc_get_order_item_meta( $item_id, '_category', true));
      $product_category = "-";
      if ($product_category_id) {
        $product_category = get_the_category_by_ID($product_category_id);
      }

      // name
      $product_name = $item->get_name();

      // quantity (- refunds)
      $quantity = $item->get_quantity(); 
      $item_qty_refunded = $order->get_qty_refunded_for_item( $item_id );
      $quantity = $quantity + $item_qty_refunded;   

      if ($quantity > 0) {

        // item total
        $total = $item->get_total();
        $total = number_format((float)$total, 2, '.', '');

        $body .= '
        <tr>
        <td style="padding:3px 8px;border-bottom:1px solid black;border-right:1px solid black;font-size:7pt;">'.$product_name.'</td>
        <td style="padding:3px 8px;border-bottom:1px solid black;border-right:1px solid black;font-size:7pt;">'.$product_category.'</td>
            <td style="padding:3px 8px;border-bottom:1px solid black;border-right:1px solid black;font-size:7pt;">'.$product_lieferant.'</td>
            <td style="padding:3px 8px;border-bottom:1px solid black;border-right:1px solid black;font-size:7pt;">'.$product_herkunft.'</td>
            <td style="padding:3px 8px;border-bottom:1px solid black;border-right:1px solid black;font-size:7pt;text-align:left;">'.$product_einheit.'</td>
            <td style="padding:3px 8px;border-bottom:1px solid black;border-right:1px solid black;font-size:7pt;text-align:left;">'.$quantity.'</td>
            <td style="padding:3px 8px;border-bottom:1px solid black;border-right:1px solid black;font-size:7pt;text-align:left;">'.$total.'</td>
            <td style="padding:3px 8px;border-bottom:1px solid black;font-size:7pt;text-align:left;"></td>
        </tr>
        ';

      }
    }

    $body .= '
    </table>
    ';

    // footer
    $store_address     = get_option( 'woocommerce_store_address' );
    $store_address_2   = get_option( 'woocommerce_store_address_2' );
    $store_city        = get_option( 'woocommerce_store_city' );
    $store_postcode    = get_option( 'woocommerce_store_postcode' );

    $footer = '
      <div style="width:100%;border-top:1px solid #ccc;padding:10px 0 20px 0;position:absolute;bottom:0;left:0;text-align:center;font-size:7pt;">
          '.get_bloginfo( 'name' ).' - '.$store_address.' '.$store_address.' '.$store_address_2.' '.$store_postcode.' '.$store_city.'   ///   '.date("d.m.Y - H:i").' - ' . __("Quittung", "fcplugin") . ' ' . $current_page . '/' . $pages . '
      </div>
    ';

    // write order info to pdf and add page break
    $mpdf->WriteHTML($header);
    $mpdf->WriteHTML($body);
    $mpdf->WriteHTML($footer);
    $current_page < $pages && $mpdf->AddPage();
    $current_page++;
  }

  $pdf = $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);