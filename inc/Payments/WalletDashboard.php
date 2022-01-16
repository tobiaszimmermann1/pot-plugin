<?php
/**
 * @package FoodcoopPlugin
 * 
 * Add Custom Product List for Ordering, Shortcode
 * 
 */

namespace Inc\Payments;

use \Inc\Base\BaseController;

class WalletDashboard extends BaseController
{
    public function register()
    {
      add_action( 'init', array($this,'add_endpoint') );
      add_filter ( 'woocommerce_account_menu_items', array($this,'fc_wallet_link'), 40 );
      add_action( 'woocommerce_account_foodcoop-wallet_endpoint', array($this,'my_account_endpoint_content') );

    }

    /**
     * Show Foodcoop Wallet Link in My Account Page
     */
    function fc_wallet_link( $menu_links ){
      $menu_links = array_slice( $menu_links, 0, 4, true )
      + array( 'foodcoop-wallet' => 'Foodcoop Guthaben' )
      + array_slice( $menu_links, 4, NULL, true );
      return $menu_links;
    }

    
    /**
     * Add Endpoint for Wallet in My Account Page
     */
    function add_endpoint() {
      add_rewrite_endpoint( 'foodcoop-wallet', EP_ROOT | EP_PAGES );
    }


    /**
     * Content for Wallet in My Account Page
     */
    function my_account_endpoint_content() {

        global $wpdb;

        $results = $wpdb->get_results(
          $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", get_current_user_id())
        );

        $balance = '0.00';
        foreach ( $results as $result )
        {
          $balance = $result->balance;
        }

        ?>

        <p>Dein aktuelles Guthaben beträgt <strong>CHF <?php echo $balance; ?></strong></p>

        <p>Zahle Guthaben an folgende Bankverbindung ein:</p>

        <?php
            $account = esc_attr(get_option('bank_account'));
            if ($account) {
                ?>
                <p class="my-account-konto"><?php echo nl2br($account);
            }
            ?></p>

        <p><strong>Deine Transaktionen:</strong></p>

        <table class="foodcoop_wallet_transaction_form_history">
          <tr>
              <td><strong>Datum</strong></td>
              <td><strong>Betrag</strong></td>
              <td><strong>Guthaben</strong></td>
              <td><strong>Details</strong></td>
              <td><strong>Hinzugefügt von</strong></td>
          </tr>

          <?php

          $transactions = $wpdb->get_results(
              $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC", get_current_user_id())
          );


          foreach ( $transactions as $transaction )
          {
              $created_by = get_user_by( 'id', $transaction->created_by );

              echo '  <tr>    ';
              echo '      <td>'.date("j.m.Y - G:i",strtotime($transaction->date)).'</td>    ';
              echo '      <td>'.$transaction->amount.'</td>    ';
              echo '      <td>'.$transaction->balance.'</td>    ';
              echo '      <td>'.$transaction->details.'</td>    ';
              echo '      <td>'.$created_by->display_name .'</td>    ';
              echo '  </tr>   ';

          }

          ?>
        </table>


    <?php
    }

}









