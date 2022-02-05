<?php
/**
 * @package FoodcoopPlugin
 * 
 * Order export function for Foodcoop Plugin
 * 
 * Supports the following export types:
 *  2. 'Verteillisten Detail': 1 PDF for a specific 'Lieferant' with table for which user ordered how much
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;
use \Mpdf\Mpdf;
use ZipArchive;

class ExportDistributionDetail extends BaseController
{
    public function register()
    {
        add_action( 'wp_ajax_nopriv_fc_export_distribution_lists_detail_function', array($this,'fc_export_distribution_lists_detail_function' ) );
        add_action( 'wp_ajax_fc_export_distribution_lists_detail_function', array($this,'fc_export_distribution_lists_detail_function' ) );
    }


 
    
    function fc_export_distribution_lists_detail_function() {
        
        // create export directory in upload folder
        $path = $this->upload_dir['path']."/";
        $export_name = uniqid();
        mkdir($path.$export_name, 0777, true);
        
        //bestellrunde
        $bestellrunde = $_POST['bestellrunde'];
        $export_lieferant = $_POST['lieferant'];
        $bestellrunde_name = esc_attr(get_post_meta( $bestellrunde, 'bestellrunde_verteiltag', true ) );

        // orders query
        $orders = wc_get_orders( array(
            'limit'         => -1, 
            'orderby'       => 'date',
            'order'         => 'DESC',
            'meta_key'      => 'bestellrunde_id', 
            'meta_value'    => $bestellrunde, 
        ));

        
        // get all lieferanten of bestellrunde in array
        $lieferanten = array();
        foreach( $orders as $order ){
            foreach ( $order->get_items() as $item_id => $item ) {

                    $product_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));

                    // fallback
                    if (!$product_lieferant) {
                        $product_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                    }

                    if ( !in_array($product_lieferant, $lieferanten) ) {
                        array_push($lieferanten,$product_lieferant);
                    }
                }
        }


        // get all produkte of bestellrunde in array
        $produkte = array();
        foreach( $orders as $order ){
            foreach ( $order->get_items() as $item_id => $item ) {

                $item_array = array();

                // product id
                $product_id = intval(wc_get_order_item_meta( $item_id, '_pid', true));
                // fallback
                if(!$product_id) {
                    $product_id = $item->get_product_id();
                }

                // lieferant                        
                $product_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
                // fallback
                if (!$product_lieferant) {
                    $product_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
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
                

                // push info to array
                if ( !array_key_exists($product_id, $produkte) ) {
                    $produkte[$product_id] = $item_array;
                }

            }
        }




        foreach( $produkte as $produkt_id => $produkt ){

            $product_name = $produkt[2];
            $product_id = $produkt_id;
            $product_lieferant = $produkt[0];
            $product_einheit = $produkt[1];



            if ($product_lieferant == $export_lieferant) {

              // header
              $header = '

              <div style="margin-top:2cm;font-size:18pt;width: 100%;">
                  <table style="width: 100%;font-size:8pt;" cellspacing="0">
                  <tr>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">Bestellrunde</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">'. esc_attr($bestellrunde_name).'</td>
                  </tr>
                  <tr>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">Lieferant</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">'.esc_attr($product_lieferant).'</td>
                  </tr>
                  <tr>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">Produkt</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">'.esc_attr($product_name).'</td>
                  </tr>
                  <tr>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">Einheit</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">'.esc_attr($product_einheit).'</td>
                  </tr>
                  <tr>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;">Bearbeitet von (Visum)</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;"></td>
                  </tr>
                  </table>
              </div>
          
              ';

              $body = '
              <div style="margin-top:1cm;font-size:18pt;width: 100%;">
                  <table style="width: 100%;" cellspacing="0">
                  <tr>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;">Gruppe</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;">Menge</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;width:0.5cm">AK</td>
                      <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;width:5cm;">Notiz</td>
                  </tr>
              ';




              // orders query
              $orders = wc_get_orders( array(
                'limit'         => -1, 
                'orderby'       => 'date',
                'order'         => 'DESC',
                'meta_key'      => 'bestellrunde_id', 
                'meta_value'    => $bestellrunde, 
              ));

              // get users
              $lieferant_users = array();
              foreach( $orders as $order ){
  
                  $user = $order->get_user();
                  $user_id = $order->get_user_id();
                  $user_info = get_userdata($user_id);
  
                    foreach ( $order->get_items() as $item_id => $item ) {
  
                        // lieferant                        
                        $product_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
                        // fallback
                        if (!$product_lieferant) {
                            $product_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                        }

                        // einheit
                        $product_einheit = esc_attr(wc_get_order_item_meta( $item_id, '_einheit', true));
                        // fallback
                        if (!$product_einheit) {
                            $product_einheit = esc_attr(get_post_meta( $item->get_product_id(), '_einheit',true ));
                        }

                        $username = esc_attr($user_info->display_name);
                
                        // check lieferant
                        $check_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
                        // fallback
                        if (!$check_lieferant) {
                            $check_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                        }
                        
                        if ( $check_lieferant == $export_lieferant) {
                            
                            if ( !array_search($user_id, $lieferant_users) ) {
                                $lieferant_users[$username] = $user_id;
                            }

                        }

                    }
  
              }

              // sort users alphabetically and create table cell
              ksort($lieferant_users);
              
              $i = 0;
              foreach ($lieferant_users as $user => $user_id) {

                $current_user_id = array_values($lieferant_users)[$i];

                // orders query
                $current_orders = wc_get_orders( array(
                  'limit'         => -1, 
                  'orderby'       => 'date',
                  'order'         => 'DESC',
                  'meta_key'      => 'bestellrunde_id', 
                  'meta_value'    => $bestellrunde, 
                ));
              
                foreach( $current_orders as $current_order ){

                    $user = $current_order->get_user();
                    $user_id = $current_order->get_user_id();
                    $user_info = get_userdata($user_id);

                    if ($current_user_id == $user_id) {

                        foreach ($current_order->get_items() as $item_id => $item) {

                            // lieferant                        
                            $product_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
                            // fallback
                            if (!$product_lieferant) {
                                $product_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                            }

                            $item_data = $item->get_data();

                            $username = $user_info->display_name;

                            // id                        
                            $tproduct_id = intval(wc_get_order_item_meta( $item_id, '_pid', true));
                            // fallback
                            if(!$tproduct_id) {
                                $tproduct_id = $item->get_product_id();
                            }

                            $quantity = $item->get_quantity();
                            $item_qty_refunded = $current_order->get_qty_refunded_for_item($item_id);
                            $quantity = $quantity + $item_qty_refunded;

                            // check_lieferant                        
                            $check_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
                            // fallback
                            if (!$check_lieferant) {
                                $check_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                            }

                            if ($check_lieferant == $export_lieferant and $produkt_id == $tproduct_id) {
                                $body .= '
                                        <tr>
                                            <td style="padding:5px 20px 5px 10px;border:1px solid black;font-weight:bold;font-size:8pt;text-align:center;">'.esc_attr($username).'</td>
                                            <td style="padding:5px 20px 5px 10px;border:1px solid black;font-weight:bold;font-size:8pt;text-align:center;">'.esc_attr($quantity).'</td>
                                            <td style="padding:5px 20px 5px 10px;border:1px solid black;font-weight:bold;font-size:8pt;text-align:center;"></td>
                                            <td style="padding:5px 20px 5px 10px;border:1px solid black;font-weight:bold;font-size:8pt;text-align:center;"></td>
                                        </tr>
                                        ';
                            }
                        }

                    }

                }
              
                $i++;
              }




              $body .= '
              </table>
              ';

              //footer
              $store_address     = esc_attr(get_option( 'woocommerce_store_address' ) );
              $store_address_2   = esc_attr(get_option( 'woocommerce_store_address_2' ) );
              $store_city        = esc_attr(get_option( 'woocommerce_store_city' ) );
              $store_postcode    = esc_attr(get_option( 'woocommerce_store_postcode' ) );

              $footer = '
                  <div style="width:100%;border-top:1px solid #ccc;padding:10px 0 20px 0;position:absolute;bottom:0;left:0;text-align:center;font-size:7pt;">
                      '.get_bloginfo( 'name' ).' - '.$store_address.' '.$store_address.' '.$store_address_2.' '.$store_postcode.' '.$store_city.'   ///   '.date("d.m.Y - H:i").'
                  </div>
              ';
      
              
              // create pdf
              $mpdf = new \Mpdf\Mpdf([
                  'mode' => 'utf-8',
                  'format' => 'A4',
                  'orientation' => 'P',
                  'default_font_size' => 9,
                  'default_font' => 'Verdana'
              ]);
              $mpdf->WriteHTML($header);
              $mpdf->WriteHTML($body);
              $mpdf->WriteHTML($footer);
              $product_name= preg_replace('/[^A-Za-z0-9\-]/', '', $product_name);

              $mpdf->Output($path.$export_name.'/'.esc_attr($bestellrunde_name).'-'.esc_attr($product_name).'.pdf', \Mpdf\Output\Destination::FILE);

            }
        
        
        }


        // Zip the PDF's
        $export_lieferant = str_replace(' ', '', $export_lieferant);
        $zip = new ZipArchive();
        $zip->open($path.$export_name.'/'.$export_lieferant.'-verteil-listen.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $myfiles = array_diff(scandir($path.$export_name), array('.', '..'));
        foreach($myfiles as $file) {
          $zip->addFile($path.$export_name.'/'.$file, $file);
        }
        $zip->close(); 


        echo json_encode($this->upload_dir['url'].'/'.$export_name.'/'.$export_lieferant.'-verteil-listen.zip');
        die();



        

    }











}