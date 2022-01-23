<?php
/**
 * @package FoodcoopPlugin
 */

namespace Inc\Pages;

use \Inc\Base\BaseController;

class AdminMembers extends BaseController {

  public function register() {
    add_action('admin_menu', array($this, 'members_admin_page'));
    add_action( 'wp_ajax_nopriv_fc_user_activity_update_function', array($this, 'fc_user_activity_update_function') );
    add_action( 'wp_ajax_fc_user_activity_update_function', array($this, 'fc_user_activity_update_function') );  
    add_action( 'wp_ajax_nopriv_fc_user_status_update_function', array($this, 'fc_user_status_update_function') );
    add_action( 'wp_ajax_fc_user_status_update_function', array($this, 'fc_user_status_update_function') );
    add_action( 'wp_ajax_nopriv_fc_wallet_update_function', array($this, 'fc_wallet_update_function') );
    add_action( 'wp_ajax_fc_wallet_update_function', array($this, 'fc_wallet_update_function') );
    add_action( 'user_register',  array($this, 'myplugin_registration_save'), 10, 1 );
    add_filter('pre_option_default_role', array($this, 'set_standard_role') );
  }

  public function members_admin_page() {
      add_menu_page('Mitglieder', 'Mitglieder', 'manage_options', 'members_page', array($this, 'admin_index'), 'dashicons-admin-users','35' );
  }

  public function admin_index() {
    require_once $this->plugin_path . '/templates/admin_members.php';
  }

  /**
   * Function to control membership status (user_meta)
   */
  function fc_user_activity_update_function() {
      update_user_meta( $_POST['user_id'], 'foodcoop_status', $_POST['status'] );
      echo get_user_meta($_POST['user_id'], 'foodcoop_status', true );
      die;
  }


  /**
   * Set role of new users to customer
   */  

  function set_standard_role($default_role) {
    return 'customer'; 
    return $default_role;
  }


  /**
   * Set status of new users to active
   */  
  function myplugin_registration_save( $user_id ) {
      update_user_meta( $user_id, 'foodcoop_status', 'aktiv' );
  }


  /**
   * Function to control membership fee (user_meta)
   */

  // UPDATE USER_META FOR MEMBERSHIP FEE AND DEDUCT FEE FROM WALLET
  function fc_user_status_update_function() {

    // update user meta (fee_$year)
    $create_user = get_user_by( 'id', $_POST['created_by'] );
    $create_username = $create_user->user_firstname." ".$create_user->user_lastname;
    $paid_date = date("j.m.Y - G:i",strtotime($_POST['date']));
    $meta_key = 'fee_'.$_POST['fee_year'];
    $meta_value = "Bezahlt am ".$paid_date;
    update_user_meta( $_POST['user_id'], $meta_key, $meta_value );


    // update wallet of user (deduct the fee), fee is set in options
    global $wpdb;
    $table = $wpdb->prefix.'foodcoop_wallet';
    $options = get_option( 'fee' );
    $amount = -1 * $amount;

    $user_id = $_POST['user_id'];
    $date = $_POST['date'];
    $details = 'Jahresbeitrag '.$_POST['fee_year'];
    $created_by = $_POST['created_by'];

    $results = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
            );

    foreach ( $results as $result )
    {
      $current_balance = $result->balance;
    }

    $new_balance = $current_balance + $amount;
    $new_balance = number_format($new_balance, 2, '.', '');

    $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);

    $wpdb->insert($table, $data);



    // send email update
    $update_user = get_user_by( 'id', $user_id ); 
    $update_username = $update_user->user_firstname." ".$update_user->user_lastname;
    $user_info = get_userdata($user_id);
    $user_email = $user_info->user_email;

    $message =  'Hallo '.$update_username.' <br>
                Neue Foodcoop Guthaben Transaktion.<br><br>
                Benutzer: '.$update_username.' <br>
                Datum: '.$paid_date.' <br>
                Betrag: CHF '.$amount.'.00 <br>
                Details: '.$details.' <br>
                <br><br>
                Hat diese Transaktion einen Fehler? Bitte antworte auf diese E-Mail mit deinem Anliegen.
                ';

      //php mailer variables
      $subject = "Neue Foodcoop Transaktion";

      $options = get_option( 'foodcoop_plugin_options' );
      $admin_email = $options['email'];



      // $admin = wp_mail($admin_email, $subject, $message, $headers);
      $user = wp_mail($user_email, $subject, $message, $headers);


    echo $meta_value;
    die;

  }



  /**
   * Function for manual wallet transactions on membership page
   */
  // WALLET TRANSACTION FUNCTION

function fc_wallet_update_function() {

    global $wpdb;
    $table = $wpdb->prefix.'foodcoop_wallet';

    $user_id = $_POST['user_id'];
    $amount = number_format($_POST['amount'], 2, '.', '');
    $date = $_POST['date'];
    $details = $_POST['details'];
    $created_by = $_POST['created_by'];


    $results = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
             );

    foreach ( $results as $result )
    {
       $current_balance = $result->balance;
    }

    $new_balance = $current_balance + $amount;

    $new_balance = number_format($new_balance, 2, '.', '');

    $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
    $format = array('%s','%d');



    // send email update
    $update_user = get_user_by( 'id', $user_id );
    $update_username = $update_user->user_firstname." ".$update_user->user_lastname;
    $user_info = get_userdata($user_id);
    $user_email = $user_info->user_email;
    $paid_date = date("j.m.Y - G:i",strtotime($date));


    $message =  'Hallo '.$update_username.'<br>
                Neue Foodcoop Guthaben Transaktion.<br><br>
                Benutzer: '.$update_username.' <br>
                Datum: '.$paid_date.' <br>
                Betrag: CHF '.$amount.'<br>
                Details: '.$details.' <br>
                <br><br>
                Hat diese Transaktion einen Fehler? Bitte antworte auf diese E-Mail mit deinem Anliegen.
                ';

    //php mailer variables
    $to = get_option('admin_email');
    $subject = "Neue Foodcoop Transaktion";
    $options = get_option( 'foodcoop_plugin_options' );
    $admin_email = $options['email'];
    $headers = array('From: '.bloginfo('name').' <'.$admin_email.'>');

    $admin = wp_mail($to, $subject, $message, $headers);
    $user = wp_mail($user_email, $subject, $message, $headers);




    $wpdb->insert($table, $data, $format);
    die;

}


}