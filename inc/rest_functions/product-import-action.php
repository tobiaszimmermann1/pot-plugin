<?php

$response = new WP_Error('data_check_failed', 'Data check failed', ['status' => 500]);

$data = $request->get_params();
$file = $data['file'];
$delete_products = $data['delete_products'];

$transient = json_decode(get_transient( "foodcoop_import_".$file));
$products = $transient->data;

foreach ($products as $product)

$response = [
  'success' => true,
  'message' => 'File imported successfully',
  'data' => $products, 
];


