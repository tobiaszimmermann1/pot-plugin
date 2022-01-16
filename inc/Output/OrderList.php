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

class OrderList extends BaseController
{
    public function register()
    {
      add_shortcode('foodcoop_products', array($this,'foodcoop_products_list_function'));    
    }

    function foodcoop_products_list_function() {

      // Check if 'Bestellrunde' is active
      $bestellrunde = new CPTBestellrunden();
      $active = $bestellrunde->check_bestellrunde();
      
      // Check if current user has ordered in current 'Bestellrunde'
      if($active) {
        $has_ordered = $bestellrunde->current_user_has_ordered($active);
      }


      /**
       * Generate Product list, ordered by categories, for ordering.
       * Shortcode: [foodcoop_products]
       */

      // Get Categories, except 'Uncategorized'
      $args = array(
        'taxonomy'   => "product_cat",
        'orderby'    => 'id',
        'order'      => 'ASC',
        'hide_empty' => true,
        'exclude'    => 15
      );
      $product_categories = get_terms($args);
    
      echo "
      <form action='".$this->plugin_url."order.php' method='post'>";
      
        if ($active) {   ?>
          <div id='bestellrunden'>
            <p>Aktuell ist das Bestellfenster offen. <?php if (!is_user_logged_in()) { ?> Werde <a href="<?php bloginfo('url'); ?>/#process">hier</a> Mitglied, um mitbestellen zu können. <?php } ?></p>
            <p>Bestellen bis: <?php echo date('d.m.Y', strtotime(get_post_meta($active, 'bestellrunde_ende', true))); ?> um 23:59 Uhr</p>
            <p>Verteiltag und Abholung am: <?php echo date('d.m.Y', strtotime(get_post_meta($active, 'bestellrunde_verteiltag', true))); ?></p>
              
              <?php
              if ($has_ordered) { ?>
      
                      <p style="border-top: 1px solid black;padding-top: 10px;"> Du hast in dieser Bestellrunde bereits eine Bestellung getätigt und kannst diese hier anpassen. Der Differenzbetrag wird deinem Konto anschliessend abgezogen, bzw. gutgeschrieben. </p>  
                      <p style="border-top: 1px solid black;padding-top: 10px;"> Deine aktuelle Bestellung kannst du jederzeit <a href="<?php echo home_url(); ?>/mein-account/orders/">hier</a> einsehen.</p>   
              <?php 
              } ?>
      
          </div>
      
        <?php
        }
        else { ?>
          <div id='bestellrunden'>
              <p>Aktuell ist das Bestellfenster geschlossen. <?php if (!is_user_logged_in()) { ?> Werde <a href="<?php bloginfo('url'); ?>/#process">hier</a> Mitglied, um mitbestellen zu können.<?php } ?></p>
          </div>
        <?php 
        }
      
        echo "<table id='foodcoop-order-table'>";
      
        $i = 1;
        foreach( $product_categories as $cat ) {
      
          $args = array(
              'category' => array( $cat->slug ),
              'limit' => -1,
              'status' => 'publish',
              'orderby' => 'title',
              'order' => 'ASC'
          );
          $products = wc_get_products( $args );
      
          echo "
          <tr>
            <th class='table-category category-title-".$i."'' id='".$cat->term_id."' colspan='8'> <span>".$cat->name." <i class='fas fa-caret-down'></i></span></th>
          </tr>
          <tr class='products-list category-".$i."' data-cat='".$cat->term_id."'>
            <th class='table-title'>Menge</th>
            <th class='table-title'>Produkt</th>
            <th class='table-title'>Lieferant</th>
            <th class='table-title'>Preis</th>
            <th class='table-title'>Einheit</th>
            <th class='table-title' style='text-align:center;'>Gebindegrösse</th>";
          if (is_user_logged_in() && $active) {  
            echo "
            <th class='table-title' style='text-align:center;'>Von allen bestellt</th>
            <th class='table-title' style='text-align:center;'>
              <div style='position:relative;'>
                  Es fehlen noch <i class='info info-fehlen'>i</i>
                  <div class='info-fehlen-div'>Zeigt an wieviele Einheiten von der ganzen Foodcoop noch bestellt werden müssen, um ein volles Gebinde zu erreichen.</div>
              </div>
            </th>";
          }
          echo "  
          </tr>";
      
              foreach( $products as $product ) {
      
                  $product_id = $product->get_id();
      
                  // TOLERANCE: GET TOTAL ORDERED QUANTITY AND CALCULATE REMAINING UNITS
      
                  if (is_user_logged_in()) {
      
                      // set total quantity variable
                      $total_qty = 0;
                      $this_order_quantity = 0;
                      $this_refunded_quantity = 0;
      
                      // GET ALL ORDERS OF CURRENT BESTELLRUNDE
                      
                      $args2 = array(
                          'bestellrunde_id' => $active,
                      );
                  
                      $qty_orders = wc_get_orders( $args2 );
      
                      foreach ($qty_orders as $qty_order) {
      
                          // Get the Order refunds (array of refunds)
                          $rorder = wc_get_order( $qty_order->get_id() );
      
                          if ($active) {
                              $order_refunds = $rorder->get_refunds();
                          }
      
                          // get product id
                          $product_id = $product->get_id();
      
                          // get all orders which have product in line_items
                          foreach ( $qty_order->get_items() as $item_id => $item ) {
      
                              $order_product_id = $item->get_product_id();
      
                              if ($product_id == $order_product_id) {
      
                                  $this_order_quantity += $item->get_quantity();
      
                                      if (!empty($order_refunds)) {
      
                                          // Loop through the order refunds array
                                          foreach( $order_refunds as $refund ){
                                              // Loop through the order refund line items
                                              foreach( $refund->get_items() as $r_item_id => $r_item ){
      
                                                  $order_refunded_product_id = $r_item->get_product_id();
      
                                                  if ($product_id == $order_refunded_product_id) {
      
                                                      $this_refunded_quantity += $r_item->get_quantity(); 
                                                  }
      
                                              }
                                          }
      
                                      }
      
                                  $total_qty = $this_order_quantity + $this_refunded_quantity;
      
                              }
      
      
      
                          }
      
                          // get gebindegrösse
                          $gebinde = get_post_meta( $product->get_id(), '_gebinde', true );
                          $multiple = floor($total_qty / $gebinde);
                          $intermediate = $total_qty - ($multiple * $gebinde);
                          $missing_qty = $gebinde - $intermediate;
      
                          if($missing_qty < 0) {
                              $missing_qty = $missing_qty * (-1);
                          }
      
                          if($gebinde == 1) {
                              $missing_qty = '';
                          }
      
                          if($gebinde == $missing_qty) {
                              $missing_qty = '';
                          }
      
      
                          // set color depending on modulo
                          if ($missing_qty > 0) {
                              $qty_color = 'red';
                          }
                          else {
                              $qty_color = 'green';
                          }
      
      
                      }
      
                  }
      
      
      
      
                  // DISPLAY PRODUCTS
      
                      // CHECK IF ITEM IS IN CURRENT ORDER
                      if ($has_ordered) {

                          $order = wc_get_order($has_ordered);
                          foreach ( $order->get_items() as $item_id => $item ) {
      
                              $order_product_id = $item->get_product_id();
                              $quantity = $item->get_quantity();
      
                              if ($product_id == $order_product_id) {
      
                                  $order_quantity = $quantity;
      
                                  $order_refunds = $order->get_refunds();
      
                                  foreach( $order_refunds as $refund ){
                      
                                      foreach( $refund->get_items() as $r_item_id => $r_item ){
                      
                                          $r_product_id = $r_item->get_product_id();
                      
                                          if ($r_product_id == $product_id) {
                      
                                              $refunded_quantity = $r_item->get_quantity();
      
                                              $order_quantity = $quantity + $refunded_quantity;
                      
                                          }
                      
                                      }
                                  }
      
      
                                  break;
                              }
                              else {
                                  
                                  $order_quantity = 0;
                              }
      
                          }
      
                      } 
                      else {
      
                          $order_quantity = 0;
      
                      }
      
      
                      // GET CART CONTENTS AND OVERRIDE QUANTITY IF IN CART
      
                      if ( WC()->cart->cart_contents_count != 0 ) {
      
                          foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
                              $cart_product_id = $cart_item['product_id'];
      
                              if ($cart_product_id == $product_id) {
      
                                  $order_quantity = $cart_item['quantity'];
      
                              }
      
                          }
      
                      }
      
      
                  echo "<tr class='products-list category-".$i."' data-cat='".$cat->term_id."'>
                      <td class='table-row product-number'>";
      
                      if ($active && is_user_logged_in()) {
                          echo "<input class='foodcoop-list-number' type='number' min='0' value='".$order_quantity."' name='products[".$product_id."]' id='".$product_id."'>";
                      }
                      else {
                          echo "<input class='foodcoop-list-number' type='number' min='0' value='' name='products[".$product_id."]' id='".$product_id."' disabled>";
                      }
                      echo"
                      </td>
                      <td class='table-row product-name'>
                          ".$product->name."<br>
                          <i style='font-weight:normal;'>".$product->get_short_description()."</i>
                      </td>
                      <td class='table-row product-lieferant'>";
      
                      echo get_post_meta( $product->get_id(), '_lieferant', true );
      
                      echo "</td>";
      
                      $price = number_format($product->regular_price, 2);
      
                      if ( is_user_logged_in() ) {
                          echo "<td class='table-row product-price' id='price-".$product_id."'>".$price."</td>";
                      } else {
                          echo '<td><i>nur für Mitglieder sichtbar</i></td>';
                      }
      
                      echo "
                      <td class='table-row product-einheit'>";
      
                      echo get_post_meta( $product->get_id(), '_einheit', true );
      
                      echo "</td>
                      <td class='table-row product-gebinde' style='text-align:center;'>";
      
                      echo get_post_meta( $product->get_id(), '_gebinde', true );
      
                      echo "</td>";
      
                  if (is_user_logged_in() && $active) {
      
                      echo "
                      <td class='table-row product-description' style='text-align:center;'>";
      
                      echo $total_qty;
      
                      echo "</td>
                      <td class='table-row product-description' style='text-align:center;'>";
      
                      echo '<span style="color:'.$qty_color.'">'.$missing_qty.'</span>';
      
                      echo "</td>";
                  
                  }
      
                  echo "    
                  </tr>";
      
              }
      
        $i++;
      
        }
        echo "</table>";
      
      
      if ( is_user_logged_in() ) {
      
          global $wpdb;
      
          $current_user_id = get_current_user_id();
      
          $user_status = get_user_meta($current_user_id, 'foodcoop_status', true );
      
          $results = $wpdb->get_results(
                      $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $current_user_id)
                   );

            if ($results) {
                foreach ( $results as $result )
                {
                   $current_balance = $result->balance;
                }
            }
            else {
                $current_balance = "0.00";
            }
      

      
          switch ($user_status) {
              case 'aktiv':
                  $status = true;
                  break;
              case 'gesperrt':
                  $status = false;
                  break;
          }
      
          if ($active) {   ?>
      
            <div id="foodcoop-order-bar">
              <div class="wrap">
      
                  <?php
                      if ($status) { ?>
                          <div class="order-bar-item" id="foodcoop-user-balance">Dein aktuelles Guthaben: CHF <?php echo $current_balance; ?> </div>
                          <div class="order-bar-item" id="foodcoop-order-total">Total Bestellung: CHF 0.00 </div>
                          <input type='submit' id='foodcoop-order-submit' value='Bestellen'>
                      <?php }
                      else { ?>
                          <div class="order-bar-item">Dein Account ist gesperrt. Bitte bezahle deinen Mitgliederbeitrag, um bestellen zu können.</div>
                      <?php }
                  ?>
      
              </div>
            </div>
      
          <?php
      
          }
          else {  ?>
      
            <div id="foodcoop-order-bar">
      
                  <?php
                      if ($status) { ?>
                          <div class="order-bar-item" id="foodcoop-user-balance">Dein aktuelles Guthaben: CHF <?php echo $current_balance; ?> </div>
                          <div class="order-bar-item" id="foodcoop-order-total">Total Bestellung: CHF 0.00 </div>
                          <div id='foodcoop-order-submit-deactivated'>Zurzeit keine Bestellung</div>
                      <?php }
                      else { ?>
                          <div class="order-bar-item">Dein Account ist gesperrt. Bitte bezahle deinen Mitgliederbeitrag, um bestellen zu können.</div>
                      <?php }
                  ?>
      
            </div>
      
          <?php
          }
      
      } else { ?>
      
            <div id="foodcoop-order-bar">
              <div id='foodcoop-order-submit-deactivated'>Nur Mitglieder können bestellen: <a href='<?php bloginfo("url"); ?>/#process'>Registrierung</a> / <a href='<?php bloginfo("url"); ?>/mein-account'>Login</a> </div>
            </div>
      
          <?php
      
      }
      
      
      
        echo "<input type='hidden' name='fc_products' id='fc_products' />";  
        echo "</form>";
      
      
      
      }







  }