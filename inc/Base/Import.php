<?php
/**
 * @package FoodcoopPlugin
 * 
 * Product import function for Foodcoop Plugin
 * 
 * uses an exact naming scheme for .xlsx file
 *  sheet name: master
 *  column names: Status | Bestell-nummer | Name | Notiz | Produzent | Herkunft | Einheit | Nettopreis | MwSt | Pfand | Gebinde | (geschützt) | (geschützt) | Kategorie
 *  category names must be exactly matched to WC Products categories slug
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;

class Import extends BaseController
{
    public function register()
    {
      add_action( 'wp_ajax_nopriv_fc_import_function', array($this,'fc_import_function') );
      add_action( 'wp_ajax_fc_import_function', array($this,'fc_import_function') );
    }

    /**
     * Import custom formatted product list
     * File Format: .xlsx
     * uses Spout Library (https://github.com/box/spout)
     */
    function fc_import_function() {

      // UPLOAD FILE
      if (isset($_FILES['file']['name'])) {

        // if upload fails
        if (0 < $_FILES['file']['error']) {
            echo 'Error during file upload ' . $_FILES['file']['error'];
        }
        else {

          // set upload path to upload_dir
          $path = $this->upload_dir['path']."/";

          // delete file if it already exists at upload_dir
          if (file_exists($path . $_FILES['file']['name'])) {
            unlink($path . $_FILES['file']['name']);
          }

          // move uploaded file to upload_dir
          move_uploaded_file($_FILES['file']['tmp_name'], $path . $_FILES['file']['name']);
          $uploaded_file = $path . $_FILES['file']['name'];

            // open file in Spout reader
            $reader = ReaderEntityFactory::createReaderFromFile($uploaded_file);
            $reader->open($uploaded_file);

              // loop through sheets
              foreach ($reader->getSheetIterator() as $sheet) {

                // look for sheet named 'master'
                if ($sheet->getName() === 'master') {

                  // create categories array from product categories
                  $foodcoop_categories = array();

                  $args = array(
                      'taxonomy'   => "product_cat",
                      'orderby'    => 'title',
                      'order'      => 'DESC',
                      'hide_empty' => false,
                      'exclude'    => 15
                      );

                  $product_categories = get_terms($args);

                  foreach( $product_categories as $cat ) {
                      array_push($foodcoop_categories, $cat->slug);
                  }

                    // Validation of header row names and category naming. Must be exact to function!
                    foreach ($sheet->getRowIterator() as $rowIndex => $row) {

                      // Validate header row naming. Must be exact!
                      if ($rowIndex == 1) {
                        $cells = $row->getCells();
                        $productName = $cells[2]->getValue();
                        $productNote = $cells[3]->getValue();
                        $lieferant = $cells[4]->getValue();
                        $herkunft = $cells[5]->getValue();
                        $einheit = $cells[6]->getValue();
                        $preis = $cells[7]->getValue();
                        $gebinde = $cells[10]->getValue();
                        $kategorie = $cells[13]->getValue();

                        if ($productName !== 'Name') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 3 heisst nicht 'Name'. Bitte konsultiere die Anleitung.";
                            die;
                        }
                        if ($productNote !== 'Notiz') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 4 heisst nicht 'Notiz'. Bitte konsultiere die Anleitung.";
                            die;
                        }
                        if ($lieferant !== 'Produzent') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 5 heisst nicht 'Produzent'. Bitte konsultiere die Anleitung.";
                            die;
                        }
                        if ($herkunft !== 'Herkunft') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 6 heisst nicht 'Herkunft'. Bitte konsultiere die Anleitung.";
                            die;
                        }
                        if ($einheit !== 'Einheit') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 7 heisst nicht 'Einheit'. Bitte konsultiere die Anleitung.";
                            die;
                        }
                        if ($preis !== 'Nettopreis') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 8 heisst nicht 'Nettpreis'. Bitte konsultiere die Anleitung.";
                            die;
                        }
                        if ($gebinde !== 'Gebinde') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 11 heisst nicht 'Gebinde'. Bitte konsultiere die Anleitung.";
                            die;
                        }
                        if ($kategorie !== 'Kategorie') {
                            echo "Kopfzeile inkorrekt formatiert. Spalte 14 heisst nicht 'Kategorie'. Bitte konsultie die Anleitung.";
                            die;
                        }
                      }

                      // Validate category naming. Must be exact!
                      else {

                        // read rows
                        $cells = $row->getCells();
                        $kategorie = $cells[13]->getValue();
                        $productName = $cells[2]->getValue();

                        if ($productName !== '') {
                          if (!in_array($kategorie, $foodcoop_categories)) {
                            echo "Fehler in der Kategorienbezeichnung. Bitte verwende für die Kategorienzuordnung nur die Titelform (slug) der Kategorien, die in den Shop Einstellungen definiert sind. Die falsche Kategorie ist in <i>Zeile ".$rowIndex."</i> und heisst <i>".$kategorie."</i>";
                            die;
                          }
                        }

                      }

                    }

                    // If validation successful, then process the product import

                      // Delete all existing products
                      $args = array(
                          'post_type' => 'product',
                          'posts_per_page' => -1
                      );
                      $loop = new \WP_Query( $args );

                      if ( $loop->have_posts() ) {
                        while ( $loop->have_posts() ): $loop->the_post();
                            global $product;
                            $id = $product->get_id();
                            wp_trash_post($id);
                        endwhile;
                      }
                      wp_reset_postdata();

                      // Create new products from imported file iterating rows
                      $count = 0;
                      foreach ($sheet->getRowIterator() as $rowIndex => $row) {

                        if ($rowIndex !== 1) {

                          // read rows
                          $cells = $row->getCells();
                          $productName = esc_attr( $cells[2]->getValue() );
                          $productNote = esc_attr( $cells[3]->getValue() );
                          $lieferant = esc_attr( $cells[4]->getValue() );
                          $herkunft = esc_attr( $cells[5]->getValue() );
                          $einheit = esc_attr( $cells[6]->getValue() );
                          $preis = esc_attr( $cells[7]->getValue() );
                          $gebinde = esc_attr( $cells[10]->getValue() );
                          $kategorie = esc_attr( $cells[13]->getValue() );

                          // skip rows with empty product names
                          if ($productName !== '') {

                            // insert products
                            $post = array(
                                'post_author' => 'foodcoop',
                                'post_content' => '',
                                'post_status' => "publish",
                                'post_title' => $productName,
                                'post_parent' => '',
                                'post_type' => "product",
                            );

                            // Create post with type product
                            $post_id = wp_insert_post( $post, $wp_error );

                            // set all post meta
                            wp_set_object_terms( $post_id, $kategorie, 'product_cat' );
                            wp_set_object_terms( $post_id, 'simple', 'product_type');

                            update_post_meta( $post_id, '_visibility', 'visible' );
                            update_post_meta( $post_id, '_stock_status', 'instock');
                            update_post_meta( $post_id, 'total_sales', '0');
                            update_post_meta( $post_id, '_downloadable', 'no');
                            update_post_meta( $post_id, '_virtual', 'no');
                            update_post_meta( $post_id, '_price', $preis );
                            update_post_meta( $post_id, '_regular_price', $preis );
                            update_post_meta( $post_id, '_purchase_note', "" );
                            update_post_meta( $post_id, '_featured', "no" );
                            update_post_meta( $post_id, '_weight', "" );
                            update_post_meta( $post_id, '_length', "" );
                            update_post_meta( $post_id, '_width', "" );
                            update_post_meta( $post_id, '_height', "" );
                            update_post_meta( $post_id, '_sku', "");
                            update_post_meta( $post_id, '_product_attributes', array());
                            update_post_meta( $post_id, '_sale_price_dates_from', "" );
                            update_post_meta( $post_id, '_sale_price_dates_to', "" );
                            update_post_meta( $post_id, '_sold_individually', "" );
                            update_post_meta( $post_id, '_manage_stock', "no" );
                            update_post_meta( $post_id, '_backorders', "no" );
                            update_post_meta( $post_id, '_stock', "" );
                            update_post_meta( $post_id, '_lieferant', $lieferant );
                            update_post_meta( $post_id, '_herkunft', $herkunft );
                            update_post_meta( $post_id, '_gebinde', $gebinde );
                            update_post_meta( $post_id, '_einheit', $einheit );

                            wp_update_post( array('ID' => $post_id, 'post_excerpt' => $productNote ) );
                            $count++;
                          }
                        }
                      }
                      break;


                }
                else {
                  echo "Kein Blatt mit Name 'master'. Die Liste ist nicht korrekt formatiert. Bitte konsultiere die Anleitung.";
                  die;
                }
              }
              $reader->close();
        }

      } else {
        echo 'Bitte wähle eine Datei aus.';
        die;
      }
      echo "Import von ".$count." Produkten erfolgreich abgeschlossen.";
      die;
    }

}