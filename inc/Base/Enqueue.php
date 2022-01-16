<?php
/**
 * @package FoodcoopPlugin
 */

namespace Inc\Base;

use \Inc\Base\BaseController;

class Enqueue extends BaseController
{
    public function register()
    {
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_wp'));
    }

    public function enqueue_wp()
    {
        wp_enqueue_style('foodcoop_styles', $this->plugin_url . 'styles/foodcoop.css');
        wp_enqueue_script('ordering_script', $this->plugin_url . 'scripts/ordering.js', array('jquery'));
        wp_enqueue_script('cart_script', $this->plugin_url . 'scripts/addtocart.js', array('jquery'));
    }

    public function enqueue_admin()
    {
        wp_enqueue_style('foodcoop_styles', $this->plugin_url . 'styles/foodcoop.css');
        wp_enqueue_script('import_script', $this->plugin_url . 'scripts/import.js', array('jquery'));
        wp_localize_script( 'import_script', 'fc', array('ajaxurl' => admin_url( 'admin-ajax.php' )));
        wp_enqueue_script('admin-script', $this->plugin_url . 'scripts/admin.js', array('jquery'));
        wp_enqueue_script('mutation_script', $this->plugin_url . 'scripts/mutation.js', array('jquery'));
        wp_localize_script( 'mutation_script', 'fc', array('ajaxurl' => admin_url( 'admin-ajax.php' )));
        wp_enqueue_script('user_status_script', $this->plugin_url . 'scripts/user_status.js', array('jquery'));
        wp_localize_script( 'user_status_script', 'fc', array('ajaxurl' => admin_url( 'admin-ajax.php' )));
        wp_enqueue_script('wallet_update_script', $this->plugin_url . 'scripts/wallet.js', array('jquery'));
        wp_localize_script( 'wallet_update_script', 'fc', array('ajaxurl' => admin_url( 'admin-ajax.php' )));
        wp_enqueue_script('jquery-ui-datepicker');
        wp_enqueue_style('jquery-ui-css', $this->plugin_url . 'styles/jquery-ui.css');


    }
}
