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

class OrderFilter extends BaseController
{
    public function register()
    {
      add_filter( 'manage_edit-shop_order_columns', array($this,'admin_columns') );
      add_filter( "manage_edit-shop_order_sortable_columns", array($this,'admin_columns_sort') );
      add_action( 'manage_shop_order_posts_custom_column', array($this,'admin_columns_values'), 2 );
      add_action('restrict_manage_posts', array($this,'add_meta_value_to_posts') );
      add_action('parse_query',array($this,'filter_posts_per_meta_value') );
    }

    
    /**
     * Add Column in Order overview 'Bestellrunden'
     */
    function admin_columns( $columns ) {
      $new_columns = ( is_array( $columns ) ) ? $columns : array();
      $new_columns['bestellrunde_orders'] = 'Bestellrunde';
      return $new_columns;
    }

    function admin_columns_sort( $columns )
    {
      $custom = array('bestellrunde_orders' => 'Bestellrunde' );
      return wp_parse_args( $custom, $columns );
    }

    function admin_columns_values( $column ) {
      global $post;
      $bestellrunde_id = get_post_meta( $post->ID,'bestellrunde_id',true );
      $data = get_post_meta( $bestellrunde_id,'bestellrunde_verteiltag',true );

      if ( $column == 'bestellrunde_orders' ) {
        echo $data;
      }
    }







    // function to grab all possible meta values of the chosen meta key in this case '_payment_method'
    function get_meta_values() {

      $orders = wc_get_orders(
          array(
              'status' => array( 'processing', 'completed' ),
              'limit' => -1,
              'orderby' => 'date',
              'order' => 'DESC'
          )
      );
  
      $meta_values = array();
  
      // Loop through each WC_Order object
      foreach( $orders as $order ){
  
              $val = get_post_meta( $order->get_id(), 'bestellrunde_id', true );
  
              if (!in_array($val,$meta_values) && $val != '') {
                  array_push($meta_values, $val);
              }
      }
  
      return $meta_values;
  
  }


    //Hook the filter options form
    function add_meta_value_to_posts(){

      // only add filter to shop_order
      global $post_type;
      if( $post_type == 'shop_order' ) {

        // function to grab all possible meta values of the chosen meta key in this case '_payment_method'
        $meta_values = $this->get_meta_values();

        // Generate select field from meta values
        echo '<select name="Bestellrunde" id="Bestellrunde">';

          $all_selected = sanitize_text_field($_GET['Bestellrunde']) == 'all' ? ' selected' : '';
          echo '<option value="all"'.$all_selected.'>Alle Bestellrunden</option>';

          foreach ( $meta_values as $meta_value ) {

              $bestellrunde = date('d.m.Y', strtotime(get_post_meta( $meta_value, 'bestellrunde_verteiltag', true )));

              $selected = sanitize_text_field($_GET['Bestellrunde']) == $meta_value ? ' selected' : '';
              echo '<option value="'.$meta_value.'"'.$selected.'>'.$bestellrunde.'</option>';
              
          }

        echo '</select>';
                                
    }

    }



    // Hook parse_query to add new filter parameters
    function filter_posts_per_meta_value( $query ) {

      global $pagenow, $post_type;
      // Only add parmeeters if on shop_order and if all is not selected
      if( $pagenow == 'edit.php' && $post_type == 'shop_order' && !empty($_GET['Bestellrunde']) && $_GET['Bestellrunde'] != 'all') {

          $query->query_vars['meta_query'][] = array(
              'key' => 'bestellrunde_id',
              'value' => $_GET['Bestellrunde'],
              'compare' => '=',
          );

      }

    }

}