<?php

class FoocoopPluginSettings {
  function __construct() {
    add_action('admin_init', array($this, 'settings'));
    add_filter('the_content', array($this, 'replace_order_page'));
  }

  /**
   * Foodcoop Ordering List
   * ----------------------
   * replaces the classical online shop view with an efficient product list
   * displayed on page designated in 'fc_order_page' setting or through using [foodcoop_list] shortcode
   */

  function replace_order_page($content) {
    global $post;
    if (is_singular() && in_the_loop() && is_main_query() AND is_page() AND (get_option('fc_order_page') == $post->ID)) {
      return '<div id="fc_order_list"></div>';
    } else {
      return $content;
    }
  }


  function settings() {
    // Settings Sections
    add_settings_section( 'fc_general', __('Foodcoop', 'fcplugin'), null, 'foodcoop-settings-page' );
    add_settings_section( 'fc_display', __('Anzeige', 'fcplugin'), null, 'foodcoop-settings-page' );

    // General Settings
    add_settings_field( 'fc_fee', __('Jahresbeitrag (CHF)', 'fcplugin'), array($this, 'fc_fee_html'), 'foodcoop-settings-page', 'fc_general' );
    register_setting( 'foodcoop_plugin', 'fc_fee', array('sanitize_callback' => array($this, 'sanitize_fee'), 'default' => '0') );
    
    add_settings_field( 'fc_bank', __('Bankverbindung', 'fcplugin'), array($this, 'fc_bank_html'), 'foodcoop-settings-page', 'fc_general' );
    register_setting( 'foodcoop_plugin', 'fc_bank', array('sanitize_callback' => 'sanitize_text_field', 'default' => '') );
    
    add_settings_field( 'fc_transfer', __('Instruktionen Banküberweisung', 'fcplugin'), array($this, 'fc_transfer_html'), 'foodcoop-settings-page', 'fc_general' );
    register_setting( 'foodcoop_plugin', 'fc_transfer', array('sanitize_callback' => 'sanitize_text_field', 'default' => '') );
    
    add_settings_field( 'fc_margin', __('Marge (%)', 'fcplugin'), array($this, 'fc_margin_html'), 'foodcoop-settings-page', 'fc_general' );
    register_setting( 'foodcoop_plugin', 'fc_margin', array('sanitize_callback' => array($this, 'sanitize_margin'), 'default' => '0') );
    
    // Display Settings
    add_settings_field( 'fc_public_prices', __('Produktpreise öffentlich anzeigen?', 'fcplugin'), array($this, 'fc_public_prices_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_public_prices', array('sanitize_callback' => 'sanitize_text_field', 'default' => '0') );

    add_settings_field( 'fc_order_page', __('Bestellseite', 'fcplugin'), array($this, 'fc_order_page_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_order_page', array('sanitize_callback' => array($this, 'sanitize_page'), 'default' => '0') );

    add_settings_field( 'fc_public_products', __('Produktbilder und Produktseiten aktivieren?', 'fcplugin'), array($this, 'fc_public_products_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_public_products', array('sanitize_callback' => 'sanitize_text_field', 'default' => '0') );
   
    add_settings_field( 'fc_public_members', __('Zeige eine Mitgliederliste in "Mein Account"?', 'fcplugin'), array($this, 'fc_public_members_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_public_members', array('sanitize_callback' => 'sanitize_text_field', 'default' => '0') );
   
    add_settings_field( 'fc_instant_topup', __('Instant Topup aktivieren?', 'fcplugin'), array($this, 'fc_instant_topup_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_instant_topup', array('sanitize_callback' => 'sanitize_text_field', 'default' => '0') );
  }

  function sanitize_margin($input) {
    if ($input != 0) {
      if (!is_numeric($input)) {
        add_settings_error('fc_margin', 'fc_margin_error', esc_html__('Marge muss eine Zahl sein.', 'fcplugin') );
        return get_option('fc_margin');
      }
    }
    return $input;
  }

  function sanitize_fee($input) {
    if (!is_numeric($input)) {
      add_settings_error('sanitize_fee', 'fc_fee_error', esc_html__('Jahresbeitrag muss eine Zahl sein.', 'fcplugin') );
      return get_option('fc_fee');
    }
    return $input;
  }

  function sanitize_page($input) {
    if ($input == 0) return $input;
    
    $pages = get_pages();
    $is_page = false;
    foreach ($pages as $page) {
      if ($input == $page->ID) $is_page = true;
    }

    if (!$is_page) {
      add_settings_error('sanitize_page', 'fc_page_error', esc_html__('Ungültige Bestellseite.', 'fcplugin') );
      return get_option('fc_order_page');
    }
    return $input;
  }

  function fc_fee_html() { ?>
    <input name="fc_fee" type="number" step="0.01" id="fc_fee" value="<?php echo esc_attr(get_option('fc_fee')); ?>" />
    <p class="description"><?php echo esc_html__('Der Jahresbeitrag kann direkt dem Mitgliederguthaben belastet werden.', 'fcplugin'); ?></p>
  <?php }

  function fc_bank_html() { ?>
    <textarea name="fc_bank" rows="1" cols="40" id="fc_bank"> <?php echo esc_attr(get_option('fc_bank')); ?> </textarea>
    <p class="description"><?php echo esc_html__('Die Bankverbindung für Guthabeneinzahlungen.', 'fcplugin'); ?></p>
  <?php }

  function fc_transfer_html() { ?>
    <textarea name="fc_transfer" rows="5" cols="40" id="fc_transfer"> <?php echo esc_attr(get_option('fc_transfer')); ?> </textarea>
    <p class="description"><?php echo esc_html__('Die Instruktionen für die Guthabeneinzahlungen.', 'fcplugin'); ?></p>
  <?php }

  function fc_margin_html() { ?>
    <input name="fc_margin" type="number" step="0.01" id="fc_margin" disabled value="<?php echo esc_attr(get_option('fc_margin')); ?>" />
    <p class="description"><?php echo esc_html__('Eine globale Marge, die beim Produkteimport auf alle Produktpreise aufgeschlagen wird.', 'fcplugin'); ?></p>
  <?php }

  function fc_public_prices_html() { ?>
    <input name="fc_public_prices" type="checkbox" id="fc_public_prices" value="1" <?php checked(get_option('fc_public_prices'), '1') ?> />
  <?php }

  function fc_public_members_html() { ?>
    <input name="fc_public_members" type="checkbox" id="fc_public_members" value="1" <?php checked(get_option('fc_public_members'), '1') ?> />
    <p class="description"><?php echo esc_html__('Zeigt eingeloggten Mitgliedern eine Liste aller Foodcoop Mitglieder mit Name und Email.', 'fcplugin'); ?></p>
  <?php }

  function fc_instant_topup_html() { ?>
    <input name="fc_instant_topup" type="checkbox" id="fc_instant_topup" value="1" <?php checked(get_option('fc_instant_topup'), '1') ?> />
    <p class="description"><?php echo esc_html__('Mitglieder können Guthaben sofort über aktivierte Woocommerce Payment Gateways aufladen. Benötigt externe Zahlungsschnittstelle(n).', 'fcplugin'); ?></p>
  <?php }

  function fc_order_page_html() { 
    $pages = get_pages();
    ?>
    <select name="fc_order_page">
      <option value="0" <?php selected(get_option("fc_order_page"), "0") ?>>keine</option>
      <?php
      if (!empty($pages)){
        foreach ($pages as $page) {
          echo '<option value="'.$page->ID.'" '.selected(get_option("fc_order_page"), $page->ID).'>'.$page->post_title.'</option>';
        }
      }
      ?>
    </select>
    <p class="description"><?php echo esc_html__('Auf dieser Seite wird die Bestell-Liste eingefügt. Die Bestell-Liste kann auch manuell an einer beliebigen Stelle eingefügt werden. Benutze dazu den Shortcode', 'fcplugin'); ?> <code>[foodcoop_list]</code></p>
  <?php }

  function fc_public_products_html() { ?>
    <input name="fc_public_products" type="checkbox" id="fc_public_products" value="1" <?php checked(get_option('fc_public_products'), '1') ?> />
    <p class="description"><?php echo esc_html__('Produktbilder erscheinen in der Bestell-Liste. Overlays für einzelne Produkte (mit Beschreibung und Details) werden aktiviert.', 'fcplugin'); ?></p>
  <?php }

  
}