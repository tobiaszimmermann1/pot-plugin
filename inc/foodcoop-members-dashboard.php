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
      + array( 'foodcoop-wallet' => __('Foodcoop', "fcplugin") )
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
      ?>
      <div id="fc_members_dashboard"></div>
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
                if (in_array('administrator', $user->roles) || in_array('foodcoop_manager', $user->roles)) {
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