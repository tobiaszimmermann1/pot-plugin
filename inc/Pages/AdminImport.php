<?php
/**
 * @package FoodcoopPlugin
 */

namespace Inc\Pages;

use \Inc\Base\BaseController;
use \Inc\Base\CPTBestellrunden;

class AdminImport extends BaseController
{
    public function register()
    {
      add_action('admin_menu', array($this,'register_import_export_page' ) );
      add_action( 'wp_ajax_nopriv_fc_get_lieferanten', array($this,'fc_get_lieferanten') );
      add_action( 'wp_ajax_fc_get_lieferanten', array($this,'fc_get_lieferanten') );
    }


    /**
     * Function to get 'Lieferanten' for chosen 'Bestellrunde'
     */

    function fc_get_lieferanten() {

      // orders query
      $args = array(
        'meta_key' => 'bestellrunde_id',
        'meta_value' => $_POST['bestellrunde_id'],
        'meta_compare' => '='
      );            
      $orders = wc_get_orders( $args );

      // get all lieferanten in array
      $lieferanten = array();
      foreach( $orders as $order ){
          foreach ( $order->get_items() as $item_id => $item ) {
                  $product_lieferant = get_post_meta( $item->get_product_id(), '_lieferant',true );
                  if ( !in_array($product_lieferant, $lieferanten) ) {
                      array_push($lieferanten,$product_lieferant);
                  }
              }
      }

      $response = "";
      foreach ( $lieferanten as $lieferant ) {
              $response .= '<option class="export_lieferant_val" id="'.esc_attr($lieferant).'">'.esc_attr($lieferant).'</option>';
      }

      echo $response;
      die;
    }


    /**
     * Register Admin Menu Page 'Import / Export'
     */
    function register_import_export_page() {
        add_menu_page('Foodcoop Import / Export', 'Foodcoop Import / Export', 'manage_options', 'import_export_page', array($this,'import_export_page_callback'),'dashicons-migrate','40' );
    }
    
    /**
     * Callback for Admin Menu Page 'Import / Export'
     */
    function import_export_page_callback() {

      // Check if 'Bestellrunde' is active
      $bestellrunde = new CPTBestellrunden();
      $active = $bestellrunde->check_bestellrunde();
      if ($active) {
        $import_active = false;
      }
      else {
        $import_active = true;
      }

      // get all 'Bestellrunden'
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



      // output 'import / export' forms

        echo '
        <div class="wrap">
            <h1>Produkt-Liste importieren </h1>
    
            <div id="import-products-form" style="margin:10px 0 30px 0;border:1px solid #ccc;background-color:#fff;padding:10px 20px 20px 20px;border-radius:5px;display:inline-block;width:50%;">
            ';
            if ($import_active == false) { 
                echo '<div class="block-use">Import während aktiver Bestellrunde nicht möglich.</div>';
            }
            echo '
                <h3>Lade hier die aktuelle Produkte-Liste hoch</h3>
                <p>
                    <ul>
                        <li>- Nutze die Importfunktion, um dierkt aus einer formatierten Excel Liste alle Produkte für eine Bestellrunde zu importieren.</li>
                        <li>- Lade <a href="'.$this->plugin_url.'templates/foodcoop-import-template.xlsx">hier</a> ein Template der Excel Liste herunter.</li>
                        <li>- Akzeptiertes Dateiformat: .xlsx</li>
                        <li><strong style="color:red;">- Alle vorhandenen Produkte werden gelöscht und ersetzt!</strong></li>
                    </ul>
                </p>
    
                <hr>
    
                <input type="file" id="import_file" name="import" size="25" /><br> <br>
                <input type="submit" id="import_submit" class="button" value="Importieren">
                <span class="spinner"></span>
    
                <div id="import_notice" style="width:96%;background-color:#cce5cc;padding:2%;margin-top:20px;display:none;"></div>
    
            </div>
    
            <h1>Bestellungen exportieren</h1>
    
            <div id="export-products" style="margin:10px 0 30px 0;border:1px solid #ccc;background-color:#fff;padding:10px 20px 20px 20px;border-radius:5px;display:inline-block;width:50%;">
                <h3>Exportiere Bestellungen</h3>
                <p>Exportiere alle Unterlagen für Bestellrunden als .xlsx Format</p>
    
                <p style="border-bottom: 1px solid #ccc;margin-bottom:20px;padding-bottom:20px;">
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
                                    echo '<option class="export_bestellrunde_val" id="'.esc_attr($bestellrunden->ID).'">';
                                    echo esc_attr(get_post_meta( $bestellrunden->ID, 'bestellrunde_verteiltag',true));
                                    echo '</option>';
                                }
                            }
    
        echo '
                    </select>
                    <span class="spinner spinner-export_bestellrunde"></span>

                </p>


                <div id="export-window" style="display:none;">
    
                    <p style="padding-bottom:30px;">
                        <span class="button export-button" id="distribution_lists"  style="float:left;">Verteillisten (PDF)</span><br><br>
                        <i style="font-size:1em;">Exportiert pro Lieferant eine Liste mit allen Produkten. Geeignet zur Anlieferkontrolle und Verteilung.</i>
                    </p>
        
                    <hr>
        
                    <p style="padding-bottom:30px;">
                        Lieferant:
                        <select id="export_lieferant">';
        
////////////////////////////////////////////////////////////
        
            echo '
                        </select><br><br>
                        <span class="button export-button" id="distribution_lists_detail"  style="float:left;">Verteilliste detailliert (PDF)</span><br><br>
                        <i style="font-size:1em;">Exportiert für den gewählten Lieferant pro Produkt eine Liste. Geeignet zur Anlieferkontrolle und Verteilung bei grossen Lieferanten mit 20+ Bestellungen oder 20+ Produkten. Achtung: Generiert sehr viele Seiten.</i>
                    </p>
        
                    <hr>
        
                    <p style="padding-bottom:30px;">
                        <span class="button export-button" id="complete_list" style="float:left;">Datenexport Bestellrunde (XLSX)</span><br><br>
                        <i style="font-size:1em;">Exportiert alle Daten als Excel Datei. Geeignet zur Erstellung eigener Listen.</i>
                    </p>
        
                    <hr>
        
                    <p style="padding-bottom:30px;">
                        <span class="button export-button" id="bills"  style="float:left;">Quittungen (PDF)</span><br><br>
                        <i style="font-size:1em;">Exportiert pro Bestellung eine Quittung.</i>
                    </p>

                </div>
    
            </div>
        </div>
    
        ';
    
    
        wp_reset_postdata();
    
        }
    
    }




}
