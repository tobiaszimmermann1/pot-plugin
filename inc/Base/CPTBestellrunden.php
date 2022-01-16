<?php
/**
 * @package FoodcoopPlugin
 */

namespace Inc\Base;

use \Inc\Base\BaseController;

class CPTBestellrunden extends BaseController
{

  public function register() {
    add_action( 'init', array($this, 'custom_post_type_bestellrunden'));
    add_action( 'add_meta_boxes', array($this, 'bestellrunden_add_metabox') );
    add_action( 'save_post', array($this, 'bestellrunden_save_meta'), 10, 2 );
    add_filter( 'wp_insert_post_data' , array($this, 'modify_post_title') , '99', 1 );
  }

  /**
   * Add custom post type: 'Bestellrunden' & disable input fields
   */
  public function custom_post_type_bestellrunden() {

    $labels = array(
      'name'                  => __( 'Bestellrunden'),
      'singular_name'         => __( 'Bestellrunde'),
      'menu_name'             => __( 'Bestellrunden'),
      'name_admin_bar'        => __( 'Bestellrunden'),
      'archives'              => __( 'Bestellrundenarchiv'),
      'all_items'             => __( 'Alle Bestellrunden'),
      'add_new_item'          => __( 'Neue Bestellrunde hinzufügen'),
      'add_new'               => __( 'Hinzufügen'),
      'new_item'              => __( 'Bestellrunde hinzufügen'),
      'edit_item'             => __( 'Bestellrunde bearbeiten'),
      'update_item'           => __( 'Bestellrunde speichern'),
      'view_item'             => __( 'Bestellrunde ansehen'),
      'view_items'            => __( 'Bestellrunden ansehen'),
    );

    $args = array(
      'label'                 => __( 'Bestellrunden'),
      'labels'                => $labels,
      'supports'              => false,
      'taxonomies'            => array(),
      'hierarchical'          => false,
      'public'                => true,
      'show_ui'               => true,
      'show_in_menu'          => false,
      'show_in_admin_bar'     => true,
      'show_in_nav_menus'     => true,
      'can_export'            => true,
      'has_archive'           => true,
      'exclude_from_search'   => false,
      'publicly_queryable'    => true,
      'capability_type'       => 'post',
    );
    register_post_type( 'bestellrunden', $args );

  }

  
  /**
   * Add Metaboxes for post type 'Bestellrunden'
   */
  function bestellrunden_add_metabox() {

    add_meta_box(
      'bestellrunde-metabox', // metabox ID
      'Bestellrunde Daten', // title
      array($this, 'bestellrunden_metabox_callback'), // callback function
      'bestellrunden', // post type or post types in array
      'normal', // position (normal, side, advanced)
      'core' // priority (default, low, high, core)
    );
  }

  
  /**
   * Callback Function for Metaboxes 'Bestellrunden'
   */
  function bestellrunden_metabox_callback( $post ) {  

    $start = get_post_meta( $post->ID, 'bestellrunde_start', true );
    $ende = get_post_meta( $post->ID, 'bestellrunde_ende', true );
    $verteiltag = get_post_meta( $post->ID, 'bestellrunde_verteiltag', true );

    echo '
          <table class="form-table">
          <tbody>
            <tr>
              <th><label for="bestellrunde_start" name="bestellrunde_start">Start der Betellrunde</label></th>
              <td><input id="bestellrunde_start" class="custom_date" name="bestellrunde_start" value="' . esc_attr( $start ) . '"> um 00:00 Uhr</td>
            </tr>
            <tr>
              <th><label for="bestellrunde_ende" name="bestellrunde_ende">Ende der Betellrunde</label></th>
              <td><input id="bestellrunde_ende" class="custom_date" name="bestellrunde_ende" value="' . esc_attr( $ende ) . '"> um 23:59 Uhr</td>
            </tr>
            <tr>
              <th><label for="bestellrunde_verteiltag" name="bestellrunde_verteiltag">Verteiltag</label></th>
              <td><input id="bestellrunde_verteiltag" class="custom_date" name="bestellrunde_verteiltag" value="' . esc_attr( $verteiltag ) . '"></td>
            </tr>
          </tbody>
        </table>
      ';

  }


  /**
   * Save 'Bestellrunde' 
   */
  function bestellrunden_save_meta( $post_id, $post ) {
  
  
    // check current use permissions
    $post_type = get_post_type_object( $post->post_type );
  
    if ( ! current_user_can( $post_type->cap->edit_post, $post_id ) ) {
      return $post_id;
    }
  
    // define post type
    if( $post->post_type != 'bestellrunden' ) {
      return $post_id;
    }
  
    if( isset( $_POST[ 'bestellrunde_start' ] ) ) {
      update_post_meta( $post_id, 'bestellrunde_start', sanitize_text_field( $_POST[ 'bestellrunde_start' ] ) );
    } else {
      delete_post_meta( $post_id, 'bestellrunde_start' );
    }
    if( isset( $_POST[ 'bestellrunde_ende' ] ) ) {
      update_post_meta( $post_id, 'bestellrunde_ende', sanitize_text_field( $_POST[ 'bestellrunde_ende' ] ) );
    } else {
      delete_post_meta( $post_id, 'bestellrunde_ende' );
    }
    if( isset( $_POST[ 'bestellrunde_verteiltag' ] ) ) {
      update_post_meta( $post_id, 'bestellrunde_verteiltag', sanitize_text_field( $_POST[ 'bestellrunde_verteiltag' ] ) );
    } else {
      delete_post_meta( $post_id, 'bestellrunde_verteiltag' );
    }
  
    return $post_id;
  }
  
  
  /**
   * Modify post title to be date of 'Verteiltag' of 'Bestellrunde' on saving
   */
  function modify_post_title( $data )
  {
    if($data['post_type'] == 'bestellrunden' && isset($_POST['bestellrunde_verteiltag'])) { // If the actual field name of the rating date is different, you'll have to update this.
      $title = $_POST['bestellrunde_verteiltag'];
      $data['post_title'] =  $title ; //Updates the post title to your new title.
    }
    return $data; // Returns the modified data.
  }



  /**
   * Function to check if 'Bestellrunde' is currently active
   * returns id when active or false when inactive
   */

  public function check_bestellrunde() {

    $current_date = date("Y-m-d");

    $args = array(
      'post_type' => 'bestellrunden',
      'post_status' => 'publish',
      'orderby' => 'id',
      'order' => 'DESC',
      'limit' => -1
    );
  
    $loop = new \WP_Query( $args );
    while ( $loop->have_posts() ) : $loop->the_post();

      $current_date = date_create()->format('Y-m-d');
      $bestellrunde_start = date("Y-m-d",strtotime(get_post_meta(get_the_ID(), 'bestellrunde_start',true)));
      $bestellrunde_ende = date("Y-m-d",strtotime(get_post_meta(get_the_ID(), 'bestellrunde_ende',true)));
      $verteiltag = date("Y-m-d",strtotime(get_post_meta(get_the_ID(), 'bestellrunde_verteiltag',true)));

      if ($bestellrunde_start <= $current_date AND $bestellrunde_ende >= $current_date) {
        return get_the_ID();
      }

    endwhile;
    wp_reset_postdata();
  }



  /**
   * Function to check if the current user has placed an order during 
   * the currently active 'Bestellrunde'
   * input: id of 'Bestellrunde'
   * returns true or false
   */
  public function current_user_has_ordered($id) {

    if (get_current_user_id()) {

        $args = array(
          'customer' => get_current_user_id(),
          'meta_key' => 'bestellrunde_id',
          'meta_value' => $id,
          'meta_compare' => '='
        );

        $orders = wc_get_orders( $args );  
        if ($orders) {
          foreach ($orders as $order) {
              $order_id = $order->ID;
          }
          return $order_id;
        }
        else {
          return false;
        }
  
    }
    
  }








}













