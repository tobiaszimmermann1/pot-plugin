<?php
global $wpdb;

$response = new WP_Error('data_check_failed', 'Data check failed', ['status' => 500]);

$data = $request->get_params();
$file = $data['file'];
$delete_products = $data['delete_products'];

$transient = json_decode(get_transient( "foodcoop_import_".$file));
$import_products = $transient->data;

$all_imported_product_ids = array();


// for testing
$new_prods = 0;
$updated_prods = 0;

$i = 1;
foreach ($import_products as $import_product) {
  if ($i > 1) {

    // if product has id specified, check if it exists in db
    $product_exists = wc_get_product(intval($import_product[7])) instanceof WC_Product;

    // get product object or create new product and then get object
    $product = null;
    $product_id = null;

    if ($product_exists) {
      $product_id = intval($import_product[7]);
      $product = wc_get_product($product_id);
      $updated_prods++;
    } else {
      $product = new WC_Product_Simple();
      $product->save();
      $product_id = $product->get_id();
      $new_prods++;
    }

    // set product data, incl. plugin sepcific meta data
    $product->set_name($import_product[0]);
    $product->set_regular_price(number_format(floatval($import_product[1]),2));
    $product->set_short_description( $import_product[8] );
    $product->set_description($import_product[10]);
    $product->set_sku(sanitize_text_field($import_product[11]));
    $product->set_tax_class(sanitize_text_field($import_product[13]));    
    $product->update_meta_data( '_einheit', sanitize_text_field($import_product[2]) );
    $product->update_meta_data( '_gebinde', sanitize_text_field($import_product[3]) );
    $product->update_meta_data( '_lieferant', sanitize_text_field($import_product[12]) );
    $product->update_meta_data( '_herkunft', sanitize_text_field($import_product[5]) );
    $product->update_meta_data( '_produzent', sanitize_text_field($import_product[4]) );
    $product->save_meta_data();

    // handle category
    // if category exists in woo: remove all categories from product and add the ones from woo
    // if category does not exist in woo: create it first
    $category_ids = [];
    $category = get_term_by('name', $import_product[6], 'product_cat');
    if (!$category) {
      $category = wp_insert_term($import_product[6], 'product_cat');
      array_push($category_ids, $category['term_id']);
    } else {
      array_push($category_ids, $category->term_id);
    }
    $product->set_category_ids($category_ids);

    // update product featured image
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');

    // if an image link is specified, check if it is the existing media library item.
    if (!empty($import_product[9])) {

      // check if image link is already in the media library
      $img_title = basename( $import_product[9]);

      $search_attachments = $wpdb->get_results("SELECT * FROM `".$wpdb->prefix."postmeta` WHERE `meta_value` LIKE '%/$img_title'");
      $existing_attachment_id = 0;
      foreach ( $search_attachments as $att ) {
        $existing_attachment_id = intval($att->post_id);
      }

      // if there is already an existing attachment
      if ($existing_attachment_id > 0) {
        if (!is_wp_error($existing_attachment_id)) $product->set_image_id( $existing_attachment_id );

      } else {
        // sideload new attachment
        $image = media_sideload_image( $import_product[9], $product_id, $img_title, 'id' );
        if (!is_wp_error($image)) $product->set_image_id( $image );
      }
    }

    array_push($all_imported_product_ids, $product_id);
    $product->save();
  }
  
  $progress = number_format($i / count($import_products) * 100, 0);
  set_transient( "foodcoop_".$file."_importprogress", $progress, 900 );

  $i++;
}

// delete all products if requested
if ($delete_products === "true") {
  $all_products = wc_get_products(array('limit' => -1));
  foreach ($all_products as $product_to_delete) {
    $id_to_del = $product_to_delete->get_id();
    if (!in_array($id_to_del, $all_imported_product_ids)) {
      $sku = $product_to_delete->get_sku();
      if ($sku !== "fcplugin_instant_topup_product" && $sku !== "fcplugin_pos_product") wp_delete_post( $id_to_del );
    }
  }
}

$response = [
  'success' => true,
  'message' => 'File imported successfully',
  'data' => array('updatedproducts' => $updated_prods, 'newproducts' => $new_prods), 
];


