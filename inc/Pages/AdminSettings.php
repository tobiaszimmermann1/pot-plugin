<?php
/**
 * @package FoodcoopPlugin
 * 
 * Add Settings Menu Option for the plugin
 * 
 */

namespace Inc\Pages;

use \Inc\Base\BaseController;

class AdminSettings extends BaseController
{
  public function register()
  {
    add_action( 'admin_menu', array($this, 'foodcoop_add_settings_page') );
    add_action( 'admin_init', array($this, 'foodcoop_register_settings') );  
  }



  /**
   * Register options page
   */
  function foodcoop_add_settings_page() {
    add_options_page( 'Foodcoop Plugin', 'Foodcoop Plugin', 'manage_options', 'foodcoop-plugin-settings', array($this, 'foodcoop_render_plugin_settings_page') );
  }

  /**
   * callback function
   */
  function foodcoop_render_plugin_settings_page() {
    ?>
      <div class="wrap">
        <h2>Foodcoop Plugin Einstellungen</h2>
        <form action="options.php" method="post">
            <?php
            settings_fields( 'foodcoop_plugin_settings' ); 
            do_settings_sections( 'foodcoop-plugin-settings' );
            submit_button();
            ?>
        </form>
      </div>
     <?php
  }


  /**
   * Add settings fields
   */
  function foodcoop_register_settings() {
    register_setting( 'foodcoop_plugin_settings', 'margin', array($this, 'foodcoop_plugin_settings_validate') );
    register_setting( 'foodcoop_plugin_settings', 'fee', array($this, 'foodcoop_plugin_settings_validate') );
    register_setting( 'foodcoop_plugin_settings', 'bank_account', array($this, 'foodcoop_plugin_settings_validate') );

    add_settings_section( 'foodcoop-settings-section', '', '', 'foodcoop-plugin-settings' );

    add_settings_field( 'margin', 'Marge [%]', array($this, 'foodcoop_plugin_settings_margin'), 'foodcoop-plugin-settings', 'foodcoop-settings-section', array('label_for' => 'margin', 'class' => 'fc-class') );
    add_settings_field( 'fee', 'Jahresbeitrag [CHF]', array($this, 'foodcoop_plugin_settings_fee'), 'foodcoop-plugin-settings', 'foodcoop-settings-section', array('label_for' => 'fee', 'class' => 'fc-class') );
    add_settings_field( 'bank_account', 'Bankverbindung (wird auf der Guthaben Seite in Mein Konto angezeigt)', array($this, 'foodcoop_plugin_settings_bank_account'), 'foodcoop-plugin-settings', 'foodcoop-settings-section', array('label_for' => 'bank_account', 'class' => 'fc-class') );
  }


  /**
   * Input Fields
   */
  // 'Marge'
  function foodcoop_plugin_settings_margin() {
    
    $margin = get_option( 'margin' );
      printf( 
        "<input id='margin' name='margin' type='number' value='%s' min='0' max='100'/><hr>",
      esc_attr( $margin )
	  );

  }

  // 'Jahresbeitrag'
  function foodcoop_plugin_settings_fee() {

    $fee = get_option( 'fee' );
      printf( 
        "<input id='fee' name='fee' type='number' value='%s' min='0' max='1000'/><hr>",
      esc_attr( $fee )
	  );

  }

  // 'Bank Account'
  function foodcoop_plugin_settings_bank_account() {

    $fee = get_option( 'bank_account' );
      echo
        "<textarea id='bank_account' name='bank_account' type='textarea' rows='8' cols='50'/>".esc_attr( $fee )."</textarea><hr>"
	  ;

  }


  /**
   * Sanitize input
   */
  function foodcoop_plugin_settings_validate( $input ) {
    $newinput = trim($input);
    return $newinput;
  }





  

}