<?php

$response = new WP_Error('upload_failed', 'File upload failed', ['status' => 500]);

$file = $request->get_file_params()['file'];
if (empty($file)) {
  $response = new WP_Error('no_file', 'No file uploaded', ['status' => 400]);
  exit;
}

$upload_dir = wp_upload_dir();
$foodcoop_dir = $upload_dir['basedir'] . '/foodcoop_import';
if (!file_exists($foodcoop_dir)) {
  wp_mkdir_p($foodcoop_dir);
}

$file_name = wp_unique_filename($foodcoop_dir, $file['name']);
$target_path = trailingslashit($foodcoop_dir) . $file_name;

if (move_uploaded_file($file['tmp_name'], $target_path)) {
  $response = [
    'success' => true,
    'message' => 'File uploaded successfully',
    'file_path' => $target_path, 
  ];
}

