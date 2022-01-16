<?php

    global $wpdb;

    $users = get_users('orderby=id');

    echo '
    <div class="wrap">
        <h1 class="wp-heading-inline">Mitglieder</h1>

                <div class="tablenav top">
                    <a href="'.admin_url().'user-new.php" class="button">Mitglied hinzufügen</a>
                </div>

                <table class="wp-list-table widefat fixed striped table-view-list posts">
                    <thead>
                        <tr>
                            <th style="padding:10px;" class="manage-column column-title column-primary">Name</th>
                            <th style="padding:10px;" class="manage-column column-title column-primary">E-Mail</th>
                            <th style="padding:10px;" class="manage-column column-title column-primary">Foodcoop Guthaben</th>
                            <th style="padding:10px;" class="manage-column column-title column-primary">Aktionen</th>
                            <th style="padding:10px;" class="manage-column column-title column-primary">Status</th>
                            <th style="padding:10px;" class="manage-column column-title column-primary"></th>
                        </tr>
                    </thead>';

                    if( ! empty( $users ) ){
                        foreach ( $users as $user ) {

                            $results = $wpdb->get_results(
                                        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user->ID)
                                     );

                            $balance = '0.00';

                            foreach ( $results as $result )
                            {
                               $balance = $result->balance;
                            }


                            $roles = $user->roles;

                            echo '<tr>';

                            echo '<td style="padding: 10px;"><a href="'. get_edit_user_link($user->ID) .'">';
    						echo esc_html( $user->display_name );
                            echo '</a></td>';

                            echo '<td style="padding: 10px;">';
    						echo esc_html( $user->user_email );
                            echo '</td>';

                            echo '<td style="padding: 10px;">';
                            echo 'CHF '.$balance;
                            echo '</td>';

                            echo '<td style="padding: 10px;">';
                            echo '<span class="button foodcoop_wallet_add_transaction" data-id="'.$user->ID.'">Wallet öffnen</span>';
                            echo '<br><span class="button foodcoop_wallet_memberfee" data-id="'.$user->ID.'" style="margin-top:5px;">Mitgliederbeitrag</span>';

                            ?>

                            <div class="foodcoop_wallet_transaction_form_wrapper" data-id="<?php echo $user->ID; ?>">
                                <div class="foodcoop_wallet_transaction_form">

                                    <div class="foodcoop_wallet_transaction_form_header">
                                        Aktuelles Guthaben von <strong><?php echo $user->display_name; ?></strong>: <strong>CHF <?php echo $balance; ?></strong>
                                    </div>

                                    <hr>

                                    <div class="foodcoop_wallet_transaction_form_header">
                                        <strong>Transaktion hinzufügen</strong>
                                    </div>

                                    <div class="foodcoop_wallet_transaction_form_row">
                                        <table class="foodcoop_wallet_transaction_form_input">
                                            <tr>
                                                <td>Betrag (CHF) </td>
                                                <td> <input type="number" value="0.00" class="foodcoop_wallet_transaction_form_amount" data-id="<?php echo $user->ID; ?>"></td>
                                            </tr>
                                            <tr>
                                                <td>Details:  </td>
                                                <td>
                                                    <input type="text" value="" class="foodcoop_wallet_transaction_form_details" data-id="<?php echo $user->ID; ?>">
                                                    <br><i>z.B. Bestellrunde, Rückerstattung etc.</i>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td>
                                                    <span class="foodcoop_wallet_transaction_form_submit" data-id="<?php echo $user->ID; ?>">Hinzufügen</span>
                                                </td>
                                            </tr>
                                        </table>

                                        <input type="hidden" value="<?php echo get_current_user_id() ?>" class="foodcoop_wallet_transaction_form_createdby" data-id="<?php echo $user->ID; ?>">

                                    </div>

                                    <hr>

                                    <div class="foodcoop_wallet_transaction_form_header">
                                        Letzte Transaktionen von <strong><?php echo $user->display_name; ?></strong>
                                    </div>

                                    <table class="foodcoop_wallet_transaction_form_history">
                                        <tr class="page-header">
                                            <th><strong>Datum</strong></th>
                                            <th><strong>Betrag</strong></th>
                                            <th><strong>Guthaben</strong></th>
                                            <th><strong>Details</strong></th>
                                            <th><strong>Hinzugefügt von</strong></ths>
                                        </tr>

                                        <?php

                                        $transactions = $wpdb->get_results(
                                            $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC", $user->ID)
                                        );

                                        $i = 1;
                                        foreach ( $transactions as $transaction )
                                        {
                                            $page = ceil($i / 10) * 10;

                                            $created_by = get_user_by( 'id', $transaction->created_by );

                                            echo '  <tr class="page-'.$page.'">    ';
                                            echo '      <td>'.date("j.m.Y - G:i",strtotime($transaction->date)).'</td>    ';
                                            echo '      <td>'.$transaction->amount.'</td>    ';
                                            echo '      <td>'.$transaction->balance.'</td>    ';
                                            echo '      <td>'.$transaction->details.'</td>    ';
                                            echo '      <td>'.$created_by->user_firstname .' '.$created_by->user_lastname.'</td>    ';
                                            echo '  </tr>   ';

                                            $i++;
                                        }

                                        ?>
                                    </table>

                                    <span class="foodcoop_wallet_transaction_form_close" data-id="<?php echo $user->ID; ?>">Schliessen</span>

                                </div>
                            </div>




                            <div class="foodcoop_wallet_memberfee_form_wrapper" data-id="<?php echo $user->ID; ?>">
                                    
                                <?php 
                                    $udata = get_userdata( $user->ID );
                                    $registered = $udata->user_registered;
                                    $year_joined = date( "Y", strtotime( $registered ));
                                    $current_year = date("Y");
                                    $num_years = $current_year - $year_joined;
                                ?>

                                <div class="foodcoop_wallet_transaction_form">

                                    <div class="foodcoop_wallet_transaction_form_header">
                                    <strong><?php echo $user->display_name; ?></strong> ist Mitglied seit: <strong> <?php echo date( "d.m.y", strtotime( $registered )); ?> </strong>
                                    </div>

                                    
                                    <table class="foodcoop_wallet_transaction_form_history">
                                        <tr>
                                            <td><strong>Jahr</strong></td>
                                            <td><strong>Status</strong></td>
                                            <td><strong>Aktion</strong></td>
                                        </tr>

                                    
                                        <?php
                                            $i = 0;
                                            while ($i <= $num_years) {
                                                $year = $year_joined + $i;


                                                $meta_key = 'fee_'.$year;
                                                $fee_data = get_user_meta($user->ID, $meta_key, true);

                                                if (empty($fee_data)) {
                                                    $edit = '<span class="button foodcoop_wallet_memberfee_action" data-id="'.$user->ID.'" data-year="'.$year.'">Mitgliederbeitrag belasten</span><br>';
                                                    $year_status = '';
                                                }
                                                else {
                                                    $edit = '';
                                                    $year_status = $fee_data;
                                                }


                                                echo "<tr>";
                                                echo "<td>".$year."</td>";
                                                echo "<td>".$year_status."</td>";
                                                echo '<td> 
                                                    '.$edit.'
                                                    <input type="hidden" value="'.get_current_user_id().'" class="foodcoop_wallet_memberfee_form_createdby" data-id="'.$user->ID.'">
                                                    </td>';
                                                echo "</tr>";

                                                $i++;
                                            }
                                        ?>

                                    </table>

                                    <span class="foodcoop_wallet_memberfee_form_close" data-id="<?php echo $user->ID; ?>">Schliessen</span>

                                </div>

                            </div>


                            <?php


                            echo '</td>';

                            $meta_key = 'fee_'.date("Y");
                            $status = get_user_meta( $user->ID, $meta_key, true);  

                            echo '<td style="padding: 10px;">';
                            echo '<span class="foodcoop_user_status" data-user="'.$user->ID.'">'.get_user_meta($user->ID, 'foodcoop_status', true ).'</span>';
                            
                            if (!empty($status)) {
                                echo '<br> <i style="color:green;">'.$status.'</i>';  
                            }     
                            else {
                                echo '<br> <i style="color:red;">noch nicht bezahlt</i>';  
                            }           

                            echo '</td>';

                            echo '<td style="padding: 10px;">';
                            echo '<span href="" class="button foodcoop_user_status_activate" data-id="'.$user->ID.'">Aktivieren</span>';
                            echo ' ';
                            echo '<span href="" class="button foodcoop_user_status_deactivate" data-id="'.$user->ID.'">Sperren</span>';
                            echo '</td>';

                            echo '</tr>';

                            $balance = '0.00';

                        }

    echo '
                </table>
    </div>
    ';


    wp_reset_postdata();

    }
