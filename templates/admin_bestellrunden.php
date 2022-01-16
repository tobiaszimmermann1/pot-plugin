<?php

  $args_bestellrunden = array(
      'posts_per_page' => -1,
      'post_type'   => 'bestellrunden',
      'post_status' => 'publish',
      'order' => 'DESC',
      'orderby' => 'title',
      'meta_key' => 'bestellrunde_verteiltag',
      'meta_query' => array(
          array(
              'key' => 'bestellrunde_verteiltag',
              'value' => 0,
              'compare' => '>=',
          )
      )
  );

  $loop_bestellrunden = get_posts($args_bestellrunden);


  echo '
  <div class="wrap">
    <h1 class="wp-heading-inline">Bestellrunden</h1>

    <div class="tablenav top">
      <a href="'.admin_url().'post-new.php?post_type=bestellrunden" class="button">Bestellrunde hinzufügen</a>
    </div>

    <table class="wp-list-table widefat fixed striped table-view-list posts">
      <thead>
          <tr>
              <th style="padding:10px;font-weight:bold;" class="manage-column column-title column-primary">Bestellrunde Titel<br><i style="font-size:0.8em;">(= Verteiltag)</i></th>
              <th style="padding:10px;" class="manage-column column-title column-primary">Bestellrunde Start</th>
              <th style="padding:10px;" class="manage-column column-title column-primary">Bestellrunde Ende</th>
              <th style="padding:10px;" class="manage-column column-title column-primary">Bestellrunde Verteiltag</th>
              <th style="padding:10px;" class="manage-column column-title column-primary"></th>
              <th style="padding:10px;font-style:italic;width:50px;text-align:right;" class="manage-column column-title column-primary">ID</th>
          </tr>
      </thead>';

if (! empty($loop_bestellrunden)) {

        foreach ($loop_bestellrunden as $bestellrunden) {
          $orders = wc_get_orders(array(
              'limit'         => -1,
              'orderby'       => 'date',
              'order'         => 'DESC',
              'meta_key'      => 'bestellrunde_id',
              'meta_value'    => $bestellrunden->ID,
          ));

          $num_orders = count($orders);

          if ($num_orders > 0) {
              $delete_link = '<br><i style="font-size:1em;">Löschen nicht möglich, da in dieser Bestellrunde Bestellungen bestehen.</i>';
          } else {
              $delete_link = '<a class="button delete" href="'.get_delete_post_link($bestellrunden->ID).'">Löschen</a>';
          }

          echo '<tr>';
          echo '<td style="padding: 10px;font-weight:bold;">';
          echo get_post_meta($bestellrunden->ID, 'bestellrunde_verteiltag', true);
          echo '</td>';
          echo '<td style="padding: 10px;">';
          echo date("d.m.Y", strtotime(get_post_meta($bestellrunden->ID, 'bestellrunde_start', true)))." - 00:00 Uhr";
          echo '</td>';
          echo '<td style="padding: 10px;">';
          echo date("d.m.Y", strtotime(get_post_meta($bestellrunden->ID, 'bestellrunde_ende', true)))." - 23:59 Uhr";
          echo '</td>';
          echo '<td style="padding: 10px;">';
          echo date("d.m.Y", strtotime(get_post_meta($bestellrunden->ID, 'bestellrunde_verteiltag', true)));
          echo '</td>';
          echo '<td style="padding: 10px;">
                  <a class="button" href="'.admin_url().'post.php?post='.$bestellrunden->ID.'&action=edit">Bearbeiten</a>
                  '.$delete_link.'
                </td>';
          echo '<td style="padding: 10px;font-style:italic;text-align:right;">'.$bestellrunden->ID.'</td>';
          echo '</tr>';

        }

    echo '
    </table>

    <div class="tablenav bottom">
        <a href="'.admin_url().'post-new.php?post_type=bestellrunden" class="button">Bestellrunde hinzufügen</a>
    </div>
  </div>
  ';

  wp_reset_postdata();
  
}