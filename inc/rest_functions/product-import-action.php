<?php
global $wpdb;

// Allow long-running imports and continue if client disconnects
@set_time_limit(0);
@ini_set('max_execution_time', 0);
@ignore_user_abort(true);

$response = new WP_Error('data_check_failed', 'Data check failed', ['status' => 500]);

// 0. Prepare data
// ******************************************************
// current products data
$all_products = wc_get_products(array('limit' => -1));
$all_products_by_sku = array();
foreach ($all_products as $product) {
  $all_products_by_sku[$product->get_sku()] = $product;
}

// import settings
$data = $request->get_params();
$file = $data['file'];
$delete_products = $data['delete_products'];
$stock_import = $data['stock'];

// imported products data
$transient = json_decode(get_transient( "foodcoop_import_".$file));
$import_products = $transient->data;

$all_imported_product_ids = array();
foreach ($import_products as $import_product) {
    $product_id = null;
    
    // if product has id specified, check if it exists in db
    $product_exists = wc_get_product(intval($import_product[7])) instanceof WC_Product;    
    if ($product_exists) {
      $product_id = intval($import_product[7]);
      array_push($all_imported_product_ids, $product_id);
    }
}

// current products by pot_id
$all_pot_ids = array();
$woo_products = wc_get_products(array('limit' => -1));
foreach ($woo_products as $woo_product) {
  $pot_id = $woo_product->get_meta('_loonity_id');
  if (!empty($pot_id)) $all_pot_ids[$pot_id] = $woo_product->get_id();
}

// 1. delete products, if requested
// ******************************************************
$deleted_prods = 0;
if ($delete_products === "true") {
  $total_to_delete = 0;
  // Count how many products will be deleted
  foreach ($all_products as $product_to_delete) {
    if (!in_array($product_to_delete->get_id(), $all_imported_product_ids)) {
      $sku = $product_to_delete->get_sku();
      if ($sku !== "fcplugin_instant_topup_product" && $sku !== "fcplugin_pos_product") {
        $total_to_delete++;
      }
    }
  }
  
  $deletion_count = 0;
  foreach ($all_products as $product_to_delete) {
    // check if product is in the import file and delete if not
    if (!in_array($product_to_delete->get_id(), $all_imported_product_ids)) {
      $id_to_del = $product_to_delete->get_id();
      $sku = $product_to_delete->get_sku();
      if ($sku !== "fcplugin_instant_topup_product" && $sku !== "fcplugin_pos_product") {
        $product = wc_get_product( $id_to_del );
        $product->delete( true );
        $deleted_prods++;
        $deletion_count++;
        
        // Update deletion progress
        $deletion_progress = $total_to_delete > 0 ? number_format($deletion_count / $total_to_delete * 100, 0) : 100;
        set_transient( "foodcoop_".$file."_deletionprogress", $deletion_progress, 900 );
      }
    }
  }
}

// for testing
$new_prods = 0;
$updated_prods = 0;

// 2. add new products / update existing products
// ******************************************************

$i = 1;
foreach ($import_products as $import_product) {
  if ($i > 1) {
    try {
      $product = null;
      $product_id = null;

      // if product has id specified, check if it exists in db
      $product_exists = wc_get_product(intval($import_product[7])) instanceof WC_Product;    
      if ($product_exists) $product_id = intval($import_product[7]);

      // if product id was not found, but the product has a sku specified, check if it exists in db
      if (!$product_exists && !empty($import_product[11])) {
        $sku = sanitize_text_field($import_product[11]);
        $sku_product_id = wc_get_product_id_by_sku($sku);
        if ($sku_product_id) {
          $product_exists = wc_get_product($sku_product_id) instanceof WC_Product;
          $product_id = $sku_product_id;
        }
      }

      // if product has no id, but a pot_id specified
      if ( ! $product_exists && ! empty( $import_product[14] ) ) {
        $pot_key = intval( $import_product[14] );
        if ( array_key_exists( $pot_key, $all_pot_ids ) ) {
          $product_exists = wc_get_product( $all_pot_ids[ $pot_key ] ) instanceof WC_Product;
          $product_id = intval( $all_pot_ids[ $pot_key ] );
        }
      }

      // get product object or create new product and then get object
      if ($product_exists) {
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
      // set SKU whenever the cell has a value
      if ( !empty($import_product[11]) ) {
        $product->set_sku(sanitize_text_field($import_product[11]));
      }
      $product->set_tax_class(sanitize_text_field($import_product[13]));    
      $product->update_meta_data( '_einheit', sanitize_text_field($import_product[2]) );
      $product->update_meta_data( '_gebinde', sanitize_text_field($import_product[3]) );
      $product->update_meta_data( '_lieferant', sanitize_text_field($import_product[12]) );
      $product->update_meta_data( '_herkunft', sanitize_text_field($import_product[5]) );
      $product->update_meta_data( '_produzent', sanitize_text_field($import_product[4]) );
      $product->update_meta_data( '_loonity_id', sanitize_text_field($import_product[14]) );
      // _weight is internal WooCommerce meta — use the proper setter to avoid is_internal_meta_key warning
      if ( isset( $import_product[15] ) && $import_product[15] !== '' ) {
        $product->set_weight( sanitize_text_field( $import_product[15] ) );
      }

      if ($stock_import === "true") {
        // handle stock — only act if the cell has a value
        $stock_value = $import_product[16];
        if ($stock_value !== null && $stock_value !== "") {
          if (floatval($stock_value) === -1.0) {
            // -1 means "in stock, no specific quantity managed"
            update_post_meta( $product_id, "_stock_status", "instock" );
            update_post_meta( $product_id, "_manage_stock", "no" );
          } elseif (floatval($stock_value) === 0.0) {
            update_post_meta( $product_id, "_stock_status", "outofstock" );
            update_post_meta( $product_id, "_manage_stock", "yes" );
            update_post_meta( $product_id, "_stock", 0 );
          } else {
            update_post_meta( $product_id, "_stock_status", "instock" );
            update_post_meta( $product_id, "_manage_stock", "yes" );
            update_post_meta( $product_id, "_stock", floatval($stock_value) );
          }
        }
        // empty cell: leave existing stock values untouched
      }
      // stock import not selected: leave existing stock values completely untouched

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

      $product->save();

    } catch ( \WC_Data_Exception $e ) {
      // Log the error and skip this product — do not crash the entire import
      error_log( 'Foodcoop product import skipped row ' . $i . ': ' . $e->getMessage() );
      // If a new (empty) product was created before the exception, clean it up
      if ( isset( $product_id ) && $product_id && !$product_exists ) {
        wp_delete_post( $product_id, true );
      }
      $new_prods = max(0, $new_prods - ((!$product_exists) ? 1 : 0));
      $updated_prods = max(0, $updated_prods - (($product_exists) ? 1 : 0));
    }
  }
  
  $progress = number_format($i / count($import_products) * 100, 0);
  set_transient( "foodcoop_".$file."_importprogress", $progress, 900 );

  $i++;
}

// store result in transient for progress endpoint
$result = array(
  'updatedproducts' => $updated_prods,
  'newproducts' => $new_prods,
  'deletedproducts' => $deleted_prods,
);
set_transient( "foodcoop_".$file."_importresult", $result, 900 );

// respond with JSON success so the fetch() resolves even for long imports
wp_send_json_success(
  array(
    'message' => 'File imported successfully',
    'updatedproducts' => $updated_prods,
    'newproducts' => $new_prods,
    'deletedproducts' => $deleted_prods,
  )
);


