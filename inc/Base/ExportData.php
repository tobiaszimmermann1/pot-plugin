<?php
/**
 * @package FoodcoopPlugin
 * 
 * Order export function for Foodcoop Plugin
 * 
 * Supports the following export types:
 *  3. 'Data': 1 xlsx with all the data
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Common\Entity\Row;

class ExportData extends BaseController
{
    public function register()
    {    
      add_action( 'wp_ajax_nopriv_fc_export_complete_list_function', array($this,'fc_export_complete_list_function') );
      add_action( 'wp_ajax_fc_export_complete_list_function', array($this,'fc_export_complete_list_function') );
    }


    function fc_export_complete_list_function() {  

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

        
        // get all lieferanten of bestellrunde in array
        $lieferanten = array();
        foreach( $orders as $order ){
            foreach ( $order->get_items() as $item_id => $item ) {

                $product_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));

                if (isset($product_lieferant)) {
                    if ( !in_array($product_lieferant, $lieferanten) ) {
                        array_push($lieferanten,$product_lieferant);
                    }
                }
                // fallback
                else {
                    $product_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                    if ( !in_array($product_lieferant, $lieferanten) ) {
                        array_push($lieferanten,$product_lieferant);
                    }
                }

            }
        }

        
        // get all produkte of bestellrunde in array
        $produkte = array();
        foreach( $orders as $order ){
            foreach ( $order->get_items() as $item_id => $item ) {

                $item_array = array();

                // product id
                $product_id = wc_get_order_item_meta( $item_id, '_pid', true);
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
          

        // open file
        $writer = WriterEntityFactory::createXLSXWriter();
        $filename = $bestellrunde_name.'_lists';
        $filePath = $path.$export_name.'/'.$filename.'.xlsx';
        $writer->openToFile($filePath); 


        // WRITE XLSX // 1 Blatt pro LIEFERANT
        
        $i = 0;
        foreach ($lieferanten as $lieferant) {

            $lieferant = preg_replace("/[^a-zA-Z0-9]+/", "", $lieferant);

            if ($i != 0) {
                $writer->addNewSheetAndMakeItCurrent();
            }

            $sheet = $writer->getCurrentSheet();
            $sheet->setName($lieferant);
            
            $values = ['Lieferant',$lieferant];
            $rowFromValues = WriterEntityFactory::createRowFromArray($values);
            $writer->addRow($rowFromValues);

            $values = ['Bestellrunde',$bestellrunde_name];
            $rowFromValues = WriterEntityFactory::createRowFromArray($values);
            $writer->addRow($rowFromValues);
            
            $lieferant_users = array();
            $name_cells = array();
            array_push($name_cells, 'Produkt');
            array_push($name_cells, 'Einheit');


            
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
                        $product_lieferant = preg_replace("/[^a-zA-Z0-9]+/", "", $product_lieferant);

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
                        $check_lieferant = preg_replace("/[^a-zA-Z0-9]+/", "", $check_lieferant);                        

                        if ( $check_lieferant == $lieferant) {
                            
                            if ( !in_array($user_id, $lieferant_users) ) {

                                array_push($lieferant_users, $user_id);
                                array_push($name_cells, $username);

                            }

                        }
                    }
                    

            }
            
            if (count($name_cells) != 0) {
                $rowFromValues = WriterEntityFactory::createRowFromArray($name_cells);
                $writer->addRow($rowFromValues);
            }

            $num_users = count($lieferant_users);
            




            
            if (count($lieferant_users) != 0) {


                foreach( $produkte as $produkt_id => $produkt ){

                    $product_name = preg_replace("/[^a-zA-Z0-9]+/", "", $produkt[2]);
                    $product_id = $produkt_id;
                    $product_lieferant = $produkt[0];
                    $product_lieferant = preg_replace("/[^a-zA-Z0-9]+/", "", $product_lieferant);                        
                    $product_einheit = $produkt[1];

                    if ($product_lieferant == $lieferant) {

                        $prod_row = array();
                        array_push($prod_row, $product_name);
                        array_push($prod_row, $product_einheit);    

                        $f = 0;
                        while ($f < $num_users) {

                            array_push($prod_row, '');

                            $current_user_id = $lieferant_users[$f];

                            // get order of current user query
                            $current_orders = wc_get_orders( array(
                                'limit'         => -1, 
                                'orderby'       => 'date',
                                'order'         => 'DESC',    
                                'customer_id'   => $current_user_id,
                                'meta_key'      => 'bestellrunde_id', 
                                'meta_value'    => $bestellrunde, 
                            ));                   
                                
                            foreach( $current_orders as $current_order ){

                                $user = $current_order->get_user();
                                $user_id = $current_order->get_user_id();
                                $user_info = get_userdata($user_id);

                                foreach ( $current_order->get_items() as $item_id => $item ) {

                                    // lieferant                        
                                    $product_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
                                    // fallback
                                    if (!$product_lieferant) {
                                        $product_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                                    }
                                    $product_lieferant = preg_replace("/[^a-zA-Z0-9]+/", "", $product_lieferant);   

                                    $item_data = $item->get_data();

                                    $username = esc_attr($user_info->display_name);

                                    // id                        
                                    $tproduct_id = wc_get_order_item_meta( $item_id, '_pid', true);
                                    // fallback
                                    if(!$tproduct_id) {
                                        $tproduct_id = $item->get_product_id();
                                    }

                                    $quantity = $item->get_quantity();   

                                    $item_qty_refunded = $current_order->get_qty_refunded_for_item( $item_id );

                                    $quantity = $quantity + $item_qty_refunded;     

                                    // check_lieferant                        
                                    $check_lieferant = esc_attr(wc_get_order_item_meta( $item_id, '_lieferant', true));
                                    // fallback
                                    if (!$check_lieferant) {
                                        $check_lieferant = esc_attr(get_post_meta( $item->get_product_id(), '_lieferant',true ));
                                    } 
                                    $check_lieferant = preg_replace("/[^a-zA-Z0-9]+/", "", $check_lieferant);     

            
                                    if ( $check_lieferant == $lieferant AND $produkt_id == $tproduct_id ) {

                                        array_pop($prod_row);   
                                        array_push($prod_row, $quantity);
                                        
                                    }
            
                                }

                            } 

                            $f++;

                        }

                        if (count($prod_row) != 0) {

                                $rowFromValues = WriterEntityFactory::createRowFromArray($prod_row);
                                $writer->addRow($rowFromValues);
                            
                        }
                    }
                }
            }
            
                

            $i++;

        }
        
        


        $writer->close();


        
        echo json_encode($this->upload_dir['url'].'/'.$export_name.'/'.$filename.'.xlsx');
        die();

    }
    









}