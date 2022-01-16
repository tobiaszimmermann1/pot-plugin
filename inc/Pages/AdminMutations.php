<?php
/**
 * @package FoodcoopPlugin
 * 
 * Mutations page
 * 
 */

namespace Inc\Pages;

use \Inc\Base\BaseController;

class AdminMutations extends BaseController {

  public function register() 
  {
    add_action('admin_menu', array($this,'register_mutationen_page') );
    add_action( 'wp_ajax_nopriv_fc_mutation_populate_products', array($this,'fc_mutation_populate_products') );
    add_action( 'wp_ajax_fc_mutation_populate_products', array($this,'fc_mutation_populate_products') );
  }


  function register_mutationen_page() {
      add_menu_page('Mutationen', 'Mutationen', 'manage_options', 'mutationen_page', array($this,'mutationen_page_callback'),'dashicons-carrot','35' );
  }
  
  function mutationen_page_callback() {
  
      global $wpdb;
  
  
      $args_bestellrunden = array(
          'posts_per_page' => -1,
          'post_type'   => 'bestellrunden',
          'post_status' => 'publish',
          'order' => 'DESC',
          'orderby' => 'title',
          'meta_key' => 'bestellrunde_verteiltag',
          'meta_query' => array(
              array(
                  'key' => 'bestellrunde_verteiltag',
                  'value' => 0,
                  'compare' => '>=',
              )
          )
      );
  
      $loop_bestellrunden = get_posts($args_bestellrunden);
  
  
  
      $args = array(
          'limit' => -1,
          'status' => 'publish',
          'orderby' => 'title',
          'order' => 'ASC'
      );
      $products = wc_get_products( $args );
  
  
      echo '
      <div class="wrap">
          <h1 class="wp-heading-inline">Mutationen</h1> <br />
  
          <div id="mutation-form" style="margin:10px 0 30px 0;border:1px solid #ccc;background-color:#fff;padding:10px 20px 20px 20px;border-radius:5px;display:inline-block;">
              <h2>Hier kannst du für die aktuelle Bestellrunde Mutationen erfassen. </h2>
  
              <p> Wähle die Bestellrunde aus, für die Mutationen vornehmen willst.</p>
              <p style="border-bottom: 1px solid #ccc;margin-bottom:20px;padding-bottom:20px;">
                  Bestellrunde:
                  <select id="export_bestellrunde">
                    <option id="x">Bestellrunde wählen</option>';
  
                      if( ! empty( $loop_bestellrunden ) ){
                          foreach ( $loop_bestellrunden as $bestellrunden ) {
  
                              $orders = wc_get_orders( array(
                                  'limit'         => -1, 
                                  'orderby'       => 'date',
                                  'order'         => 'DESC',
                                  'meta_key'      => 'bestellrunde_id', 
                                  'meta_value'    => $bestellrunden->ID,
                              ));
  
                              $num_orders = count($orders);
  
                              if ($num_orders > 0 ) {
                                  echo '<option class="export_bestellrunde_val" id="'.$bestellrunden->ID.'">';
                                  echo get_post_meta( $bestellrunden->ID, 'bestellrunde_verteiltag',true);
                                  echo '</option>';
                              }
                          }
                      }
  
      echo '
                  </select>
                  <span class="spinner"></span>
              </p>
  
              <div id="mutation-window" style="display:none;">
                  <h3>Nicht gelieferte Produkte</h3>
  
                  <p><i>Löscht ein Produkt aus allen Bestellungen der gewählten Bestellrunde und erstattet den Preis auf das Foodcoop Guthaben zurück.</i></p>
  
                  <select id="mutation_delete_select">
                      <option selected>Produkt wählen</option>';
  
                      foreach ($products as $product) {
                          echo '<option class="mutation_delete_product" data-id="'.$product->id.'">'.$product->name.'</option>';
                      }
  
                  echo '
                  </select>
  
                  <p><input type="submit" id="mutation_delete_submit" class="button" value="Bestellungen suchen">
                  </p>
                  <div id="mutation_delete_notice" style="width:96%;background-color:#cce5cc;padding:2%;margin-top:20px;display:none;"></div>
  
                  <p><input type="submit" id="mutation_delete_final_submit" class="button" value="Produkte zurückerstatten" style="display:none;">
                  </p>
  
                  <hr style="margin: 40px 0;">
  
                  <h3>Produktpreis anpassen</h3>
  
                  <p><i>Passt den Preis für ein Produkt in allen Bestellungen der gewählten Bestellrunde an und belastet die Differenz dem Foodcoop Guthaben. Der globale Preis des Produkts wird ebenfalls angepasst.</i></p>
  
                  <select id="mutation_price_select">
                      <option selected>Produkt wählen</option>';
  
                      foreach ($products as $product) {
                          echo '<option class="mutation_price_product" data-id="'.$product->id.'">'.$product->name.'</option>';
                      }
  
                  echo '
                  </select>
  
                  <br />
                  <p><input type="submit" id="mutation_price_submit" class="button" value="Bestellungen suchen">
                  </p>
                  <div id="mutation_price_notice" style="width:96%;background-color:#cce5cc;padding:2%;margin-top:20px;display:none;"></div>
                  <p><input type="number" id="mutation_price_field" data-product="" value="0" style="display:none;"></p>
  
                  <p><input type="submit" id="mutation_price_final_submit" class="button" value="Produktpreis verändern" style="display:none;">
                  </p>
              </div>
  
          </div>
  
  
      </div>
      ';
  
  }





  /**
   * REPOPULATE PRODUCT SELECT ON BESTELLRUNDEN CHANGE
   */

  function fc_mutation_populate_products() {

      $bestellrunde = $_POST['bestellrunde'];

      // orders query
      $orders = wc_get_orders( array(
        'limit'         => -1, 
        'orderby'       => 'date',
        'order'         => 'DESC',
        'meta_key'      => 'bestellrunde_id', 
        'meta_value'    => $bestellrunde, 
      ));

      $current_products = array();

      foreach( $orders as $order ) {

          $items = $order->get_items();

          foreach ( $items as $item ) {

              $product_id = $item->get_product_id();
              $product_name = $item->get_name();

              if (!array_key_exists($product_id,$current_products)) {

                  $current_products[$product_id] = $product_name;

              }
              
          }

      }

      wp_send_json($current_products);

      die();

  }

}