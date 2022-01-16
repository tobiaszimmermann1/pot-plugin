<?php
/**
 * @package FoodcoopPlugin
 */

namespace Inc\Pages;

use \Inc\Base\BaseController;

class AdminBestellrunden extends BaseController
{
    public function register()
    {
      add_action('admin_menu', array($this,'register_bestellrunden_page'));
    }

    /**
     * Register Admin Page for 'Bestellrunden'
     */
    function register_bestellrunden_page() {
      add_menu_page('Bestellrunden', 'Bestellrunden', 'manage_options', 'bestellrunden_page', array($this,'admin_index'),'dashicons-calendar-alt','30' );
    }  


    /**
     * Page Content for Admin Page
     */
    public function admin_index() {
      require_once $this->plugin_path . '/templates/admin_bestellrunden.php';
    }

}