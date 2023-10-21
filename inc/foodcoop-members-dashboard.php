<?php
/**
 * Wallet Frontend in User Dashboard 
 */
class WalletDashboard
{
    public function __construct() {
      add_action( 'init', array($this,'add_endpoint') );
      add_filter ( 'woocommerce_account_menu_items', array($this,'fc_wallet_link'), 99, 1 );
      add_action( 'woocommerce_account_foodcoop-wallet_endpoint', array($this,'my_account_endpoint_content') );
    }

    /**
     * Show Foodcoop Wallet Link in My Account Page
     */
    function fc_wallet_link( $menu_links ){
      $menu_links = array_slice( $menu_links, 0, 4, true )
      + array( 'foodcoop-wallet' => __('Foodcoop Guthaben', "fcplugin") )
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

        $balance_color = "red";
        if ($balance >= 0) {
            $balance_color = "green";
        }    
        ?>

        <div class="fc_account_wallet">
            <p class="fc_account_wallet_balance">Dein aktuelles Guthaben beträgt <strong style="color:<?php echo $balance_color; ?>;" >CHF <?php echo $balance; ?></strong></p>
            <div id="fc_topup"></div>
        </div>


        <div class="fc_account_wallet_table">
            <h2><strong>Deine Transaktionen:</strong></h2>
            <table class="foodcoop_wallet_transaction_form_history">
            <tr>
                <th><strong>Datum</strong></th>
                <th><strong>Betrag</strong></th>
                <th><strong>Guthaben</strong></th>
                <th><strong>Details</strong></th>
                <th><strong>Erfasst</strong></th>
            </tr>

            <?php
            $transactions = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC", get_current_user_id())
            );

            foreach ( $transactions as $transaction )
            {
                    $created_by = get_user_by( 'id', $transaction->created_by );

                    $name = $transaction->created_by;

                    if ($created_by) {
                        $name = $created_by->display_name;
                    }

                    $transaction->amount >= 0 ? $transaction_color = "green" : $transaction_color = "red";
                    $transaction->balance >= 0 ? $new_balance_color = "green" : $new_balance_color = "red";
                    
                    echo '  <tr>    ';
                    echo '      <td>'.date("j.m.Y - G:i",strtotime($transaction->date)).'</td>    ';
                    echo '      <td style="color:'.$transaction_color.'">'.$transaction->amount.'</td>    ';
                    echo '      <td style="color:'.$new_balance_color.'">'.$transaction->balance.'</td>    ';
                    echo '      <td>'.$transaction->details.'</td>    ';
                    echo '      <td>'.$name.'</td>    ';
                    echo '  </tr>   ';

            }

            ?>
            </table>
        </div>

    <?php
    }
}



/**
 * Members List in User Dashboard 
 */
class MembersListDashboard
{
    public function __construct() {
      add_action( 'init', array($this,'add_endpoint_memberslist') );
      add_filter ( 'woocommerce_account_menu_items', array($this,'fc_members_list_link'), 99, 1 );
      add_action( 'woocommerce_account_foodcoop-members_endpoint', array($this,'my_account_members_list_content') );
    }

    /**
     * Show Foodcoop Wallet Link in My Account Page
     */
    function fc_members_list_link( $menu_links ){
      if (get_option( 'fc_public_members' ) == "1") {
        $menu_links = array_slice( $menu_links, 0, 5, true )
        + array( 'foodcoop-members' => __('Foodcoop Mitglieder', "fcplugin") )
        + array_slice( $menu_links, 5, NULL, true );
        return $menu_links;
      } else {
        return $menu_links;
      }
    }

    
    /**
     * Add Endpoint for Wallet in My Account Page
     */
    function add_endpoint_memberslist() {
      add_rewrite_endpoint( 'foodcoop-members', EP_ROOT | EP_PAGES );
    }


    /**
     * Content for Wallet in My Account Page
     */
    function my_account_members_list_content() {
      ?>

      <div class="fc_account_wallet_table">
          <table class="foodcoop_wallet_transaction_form_history">
          <tr>
            <th><strong>Mitgliedernummer</strong></th>
            <th><strong>Name</strong></th>
            <th><strong>E-Mail</strong></th>
            <th><strong>Administrator</strong></th>
          </tr>

          <?php
            $users = get_users();

            foreach ( $users as $user ) { 
              $first_name = get_user_meta( $user->ID, 'billing_first_name', true );
              $last_name = get_user_meta( $user->ID, 'billing_last_name', true );
              $email = get_user_meta( $user->ID, 'billing_email', true );
              $role = "";

              $userdata = get_userdata( $user->ID );
              if(!empty( $userdata ) && $userdata){
                if (in_array('administrator', $user->roles)) {
                  $role = "x";
                }
              }

              if ($first_name && $last_name && $email) {
                echo '  <tr>    ';
                echo '      <td style="text-align: left;">'.$user->ID.'</td>';
                echo '      <td style="text-align: left;">'.$first_name.' '.$last_name.'</td>';
                echo '      <td style="text-align: left;">'.$email.'</td>';
                echo '      <td style="text-align: center;">'.$role.'</td>';
                echo '  </tr>   ';
              }
            }

          ?>
          </table>
      </div>

      <?php
    }
}