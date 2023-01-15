<?php

class FoocoopPluginSettings {
  function __construct() {
    add_action('admin_menu', array($this, 'fc_settings'));
    add_action('admin_init', array($this, 'settings'));
    add_filter('the_content', array($this, 'replace_order_page'));
  }

  function replace_order_page($content) {
    global $post;
    if (is_main_query() AND is_page() AND (get_option('fc_order_page') == $post->ID)) {
      return $this->fc_order_list();
    }
    return $content;
  }

  /**
   * Foodcoop Ordering List
   * ----------------------
   * replaces the classical online shop view with an efficient product list
   * displayed on page designated in 'fc_order_page' setting or through using [foodcoop_list] shortcode
   */
  function fc_order_list() {
    echo '<div id="fc_order_list"></div>';
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
    
    add_settings_field( 'fc_margin', __('Marge (%)', 'fcplugin'), array($this, 'fc_margin_html'), 'foodcoop-settings-page', 'fc_general' );
    register_setting( 'foodcoop_plugin', 'fc_margin', array('sanitize_callback' => array($this, 'sanitize_margin'), 'default' => '0') );
    
    // Display Settings
    add_settings_field( 'fc_public_prices', __('Produktpreise öffentlich anzeigen?', 'fcplugin'), array($this, 'fc_public_prices_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_public_prices', array('sanitize_callback' => 'sanitize_text_field', 'default' => '0') );

    add_settings_field( 'fc_order_page', __('Bestellseite', 'fcplugin'), array($this, 'fc_order_page_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_order_page', array('sanitize_callback' => array($this, 'sanitize_page'), 'default' => '0') );

    add_settings_field( 'fc_public_products', __('Produktbilder und Produktseiten aktivieren?', 'fcplugin'), array($this, 'fc_public_products_html'), 'foodcoop-settings-page', 'fc_display' );
    register_setting( 'foodcoop_plugin', 'fc_public_products', array('sanitize_callback' => 'sanitize_text_field', 'default' => '0') );
  }

  function sanitize_margin($input) {
    if (!is_numeric($input)) {
      add_settings_error('fc_margin', 'fc_margin_error', esc_html__('Marge muss eine Zahl sein.', 'fcplugin') );
      return get_option('fc_margin');
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
    <textarea name="fc_bank" rows="5" cols="40" id="fc_bank"> <?php echo esc_attr(get_option('fc_bank')); ?> </textarea>
    <p class="description"><?php echo esc_html__('Die Bankverbindung für Guthabeneinzahlungen, am besten mit einer Anleitung.', 'fcplugin'); ?></p>
  <?php }

  function fc_margin_html() { ?>
    <input name="fc_margin" type="number" step="0.01" id="fc_margin" disabled value="<?php echo esc_attr(get_option('fc_margin')); ?>" />
    <p class="description"><?php echo esc_html__('Eine globale Marge, die beim Produkteimport auf alle Produktpreise aufgeschlagen wird.', 'fcplugin'); ?></p>
  <?php }

  function fc_public_prices_html() { ?>
    <input name="fc_public_prices" type="checkbox" id="fc_public_prices" value="1" <?php checked(get_option('fc_public_prices'), '1') ?> />
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
    <input name="fc_public_products" type="checkbox" disabled id="fc_public_products" value="1" <?php checked(get_option('fc_public_products'), '1') ?> />
    <p class="description"><?php echo esc_html__('Produktbilder erscheinen in der Bestell-Liste. Seiten für einzelne Produkte (mit Beschreibung und Details) werden aktiviert.', 'fcplugin'); ?></p>
  <?php }

  function fc_settings() {
    add_options_page('Foodcoop', __('Foodcoop', 'fcplugin'), 'manage_options', 'foodcoop-settings-page', array($this, 'settings_function'));
  }
  
  function settings_function() {
    ?>
      <div class="wrap">
        <h1><?php echo esc_html__('Foodcoop Einstellungen', 'fcplugin'); ?></h1>

        <form action="options.php" method="post">
        <?php
          settings_fields('foodcoop_plugin');
          do_settings_sections( 'foodcoop-settings-page' );
          submit_button();
        ?>
        </form>

      </div>
    <?php
  }
}