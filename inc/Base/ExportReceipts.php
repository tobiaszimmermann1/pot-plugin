<?php
/**
 * @package FoodcoopPlugin
 * 
 * Order export function for Foodcoop Plugin
 * 
 * Supports the following export types:
 *  1. 'Verteillisten': 1 PDF per 'Lieferant' with table for which user ordered how much
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;
use \Mpdf\Mpdf;
use ZipArchive;

class ExportReceipts extends BaseController
{
    public function register()
    {
      add_action( 'wp_ajax_nopriv_fc_export_bills_function', array($this,'fc_export_bills_function') );
      add_action( 'wp_ajax_fc_export_bills_function', array($this,'fc_export_bills_function') );
    }

    function fc_export_bills_function() {
        
      // create export directory in upload folder
      $path = $this->upload_dir['path']."/";
      $export_name = uniqid();
      mkdir($path.$export_name, 0777, true);
        

        //bestellrunde
        $bestellrunde = $_POST['bestellrunde'];
        $bestellrunde_name = get_post_meta( $bestellrunde, 'bestellrunde_verteiltag', true );


        // orders query
        $orders = wc_get_orders( array(
            'limit'         => -1, 
            'orderby'       => 'date',
            'order'         => 'DESC',
            'meta_key'      => 'bestellrunde_id', 
            'meta_value'    => $bestellrunde, 
        ));





        foreach( $orders as $order ) {

            $user = $order->get_user();
            $user_id = $order->get_user_id();
            $user_info = get_userdata($user_id);
            $username = $user_info->display_name;

            // header
            $header = '

            <div style="margin-top:2cm;font-size:18pt;width: 100%;">
                <table style="width: 100%;font-size:8pt;" cellspacing="0">
                    <tr>
                        <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">Bestellrunde</td>
                        <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">'. $bestellrunde_name.'</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">Bestellgruppe</td>
                        <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">'.$username.'</td>
                    </tr>
                    <tr>
                        <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">Gesamtbetrag CHF</td>
                        <td style="padding:10px 20px 10px 10px;border:1px solid black;font-weight:bold;">'.$order->get_total().'</td>
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
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;">Produkt</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;">Lieferant</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;text-align:center;">Einheit</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;text-align:center;">Menge</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;text-align:center;">Preis (CHF)</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;width:5cm;">Notiz</td>
                </tr>
            ';


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

                $product_name = $item->get_name();

                $quantity = $item->get_quantity(); 

                $item_qty_refunded = $order->get_qty_refunded_for_item( $item_id );

                $quantity = $quantity + $item_qty_refunded;   

                $total = $item->get_total();

                $total = number_format((float)$total, 2, '.', '');


                $body .= '
                <tr>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;">'.$product_name.'</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;">'.$product_lieferant.'</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;text-align:center;">'.$product_einheit.'</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;text-align:center;">'.$quantity.'</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;text-align:center;">'.$total.'</td>
                    <td style="padding:10px 20px 10px 10px;border:1px solid black;font-size:8pt;text-align:center;"></td>
                </tr>
                ';
                
            }

            $body .= '
            </table>
            ';

            //footer
            $store_address     = get_option( 'woocommerce_store_address' );
            $store_address_2   = get_option( 'woocommerce_store_address_2' );
            $store_city        = get_option( 'woocommerce_store_city' );
            $store_postcode    = get_option( 'woocommerce_store_postcode' );

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
            $mpdf->Output($path.$export_name.'/'.$bestellrunde_name.'-'.$username.'.pdf', \Mpdf\Output\Destination::FILE);

        }



        // Zip the PDF's
        $zip = new ZipArchive();
        $zip->open($path.$export_name.'/'.$bestellrunde_name.'-quittungen.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $myfiles = array_diff(scandir($path.$export_name), array('.', '..'));
        foreach($myfiles as $file) {
            $zip->addFile($path.$export_name.'/'.$file, $file);
        }
        $zip->close(); 



        echo json_encode($this->upload_dir['url'].'/'.$export_name.'/'.$bestellrunde_name.'-quittungen.zip');
        die();

    }

}