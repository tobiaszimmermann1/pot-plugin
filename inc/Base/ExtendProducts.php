<?php
/**
 * @package FoodcoopPlugin
 * 
 * Add extra meta fields to WC Products
 * 
 */

namespace Inc\Base;

use \Inc\Base\BaseController;

class ExtendProducts extends BaseController
{

  public function register() {

    add_action('woocommerce_product_options_general_product_data', array($this, 'woocommerce_product_custom_fields') );
    add_action('woocommerce_process_product_meta', array($this, 'woocommerce_product_custom_fields_save') );

  }



  /**
   * Create meta fields for WC Products
   */
  function woocommerce_product_custom_fields()
  {

    echo '<div class="product_custom_field">';

    // Custom Product Number Field / Gebindegrösse
    woocommerce_wp_text_input(
        array(
            'id' => '_gebinde',
            'placeholder' => 'Gebindegrösse',
            'label' => __('Gebindegrösse', 'woocommerce'),
            'type' => 'number',
            'custom_attributes' => array(
                'step' => '1',
                'min' => '1'
            )
        )
    );

    // Custom Product Text Field / Einheit
    woocommerce_wp_text_input(
        array(
            'id' => '_einheit',
            'placeholder' => 'Einheit',
            'label' => __('Einheit', 'woocommerce'),
            'desc_tip' => 'true'
        )
    );

    // Custom Product Text Field / Lieferant
    woocommerce_wp_text_input(
        array(
            'id' => '_lieferant',
            'placeholder' => 'Lieferant',
            'label' => __('Lieferant', 'woocommerce'),
            'desc_tip' => 'true'
        )
    );

    // Custom Product Text Field / Herkunft
    woocommerce_wp_text_input(
        array(
            'id' => '_herkunft',
            'placeholder' => 'Herkunft',
            'label' => __('Herkunft', 'woocommerce'),
            'desc_tip' => 'true'
        )
    );

    echo '</div>';
  }


  /**
   * Save meta fields
   */
  function woocommerce_product_custom_fields_save($post_id)
  {
      $woocommerce_einheit = $_POST['_einheit'];
      if (!empty($woocommerce_einheit))
          update_post_meta($post_id, '_einheit', esc_attr($woocommerce_einheit));

      $woocommerce_lieferant = $_POST['_lieferant'];
      if (!empty($woocommerce_lieferant))
          update_post_meta($post_id, '_lieferant', esc_attr($woocommerce_lieferant));

      $woocommerce_herkunft = $_POST['_herkunft'];
      if (!empty($woocommerce_herkunft))
          update_post_meta($post_id, '_herkunft', esc_attr($woocommerce_herkunft));

      $woocommerce_gebinde = $_POST['_gebinde'];
      if (!empty($woocommerce_gebinde))
          update_post_meta($post_id, '_gebinde', esc_attr($woocommerce_gebinde));
  }




}