<?php

$response = new WP_Error('data_check_failed', 'Data check failed', ['status' => 500]);

$data = $request->get_params();
$file = $data['file'];
$delete_products = $data['delete_products'];

$transient = json_decode(get_transient( "foodcoop_import_".$file));
$import_products = $transient->data;

$all_imported_product_ids = array();


// for testing
$checking = array();

$i = 1;
foreach ($import_products as $import_product) {
  if ($i > 1) {
    $progress = number_format($i / count($import_products) * 100, 0);
    set_transient( "foodcoop_".$file."_importprogress", $progress, 900 );

    // if product has id specified, check if it exists in db
    $product_exists = wc_get_product(intval($import_product[7])) instanceof WC_Product;

    // get product object or create new product and then get object
    $product = null;
    $product_id = null;

    if ($product_exists) {
      $product_id = intval($import_product[7]);
      $product = wc_get_product($product_id);
      $product->set_name($import_product[0]);
      $product->set_regular_price(number_format(floatval($import_product[1]),2));
      $product->set_description($import_product[10]);
      $product->set_sku($import_product[11]);
      $product->save();
    } else {
      $product = new WC_Product_Simple();
      $product->set_name($import_product[0]);
      $product->set_regular_price(number_format(floatval($import_product[1]),2));
      $product->set_description($import_product[10]);
      $product->set_sku($import_product[11]);
      $product->save();
      $product_id = $product->get_id();
    }

    array_push($checking, [$progress, $product_exists, print_r($product, true)]);
  }

  array_push($all_imported_product_ids, $product_id);
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
  'data' => $checking, 
];


