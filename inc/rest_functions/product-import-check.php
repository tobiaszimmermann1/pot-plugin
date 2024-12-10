<?php

use PhpOffice\PhpSpreadsheet\IOFactory;

$response = new WP_Error('data_check_failed', 'Data check failed', ['status' => 500]);

$data = $request->get_params();

$file = $data['file'];
$delete_products = $data['delete_products'];

$product_array = array();
$formatting_errors = array();
$rows_with_errors = array();
$all_skus = array();
$all_ids = array();

function isIntFloatOrNumeric($value) {
  return is_int($value) || is_float($value) || (is_string($value) && is_numeric($value));
}

try {
  $spreadsheet = IOFactory::load($file);
  $sheet = $spreadsheet->getActiveSheet();

  $i = 1;
  foreach ($sheet->getRowIterator() as $row) {
    $rowData = array();
    foreach ($row->getCellIterator() as $cell) {
      $rowData[] = $cell->getValue();
    }

    // check if header row has correct names
    if ($i === 1) {
      $header_formatting_error = true;
      if (["name", "price", "unit", "lot", "producer", "origin", "category", "id", "short_description", "image", "description", "sku", "supplier", "tax"] === $rowData) $header_formatting_error = false;
      if ($header_formatting_error) array_push($formatting_errors, array($i, "Kopfzeile beinhaltet falsche Bezeichnungen"));
      array_push($product_array, $rowData);
    } 

    // check each data row for errors
    if ($i > 1) {
      $row_has_error = false;

      // validate for empty cells
      if (empty($rowData[0])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 1 darf nicht leer sein."));
        $row_has_error = true;
      }
      if (empty($rowData[1])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 2 darf nicht leer sein."));
        $row_has_error = true;
      }
      if (empty($rowData[2])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 3 darf nicht leer sein."));
        $row_has_error = true;
      }
      if (empty($rowData[3])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 4 darf nicht leer sein."));
        $row_has_error = true;
      }
      if (empty($rowData[4])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 5 darf nicht leer sein."));
        $row_has_error = true;
      }
      if (empty($rowData[5])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 6 darf nicht leer sein."));
        $row_has_error = true;
      }
      if (empty($rowData[6])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 7 darf nicht leer sein."));
        $row_has_error = true;
      }
      if (empty($rowData[12])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 13 darf nicht leer sein."));
        $row_has_error = true;
      }

      // validate for numbers for price, lot, id
      if (!isIntFloatOrNumeric($rowData[1])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 2 muss eine Zahl sein."));
        $row_has_error = true;
      }
      if (!isIntFloatOrNumeric($rowData[3])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 4 muss eine Zahl sein."));
        $row_has_error = true;
      }
      if (!isIntFloatOrNumeric($rowData[7]) && !empty($rowData[7])) { 
        array_push($formatting_errors, array($i, "Zelle in Spalte 8 muss eine Zahl sein."));
        $row_has_error = true;
      }

      // check for duplicate sku's
      $sku = $rowData[11];
      if (in_array($sku, $all_skus) && !empty($sku)) {     
        array_push($formatting_errors, array($i, "Doppelte Artikelnummer"));
        $row_has_error = true;
      }
      array_push($all_skus, $sku);

      // check for duplicate id's
      $id = $rowData[7];
      if (in_array($id, $all_ids) && !empty($id)) {
        array_push($formatting_errors, array($i, "Doppelte ID"));
        $row_has_error = true;
      }
      array_push($all_ids, $id);

      if ($row_has_error === true) array_push($rows_with_errors, $i);

      array_push($product_array, $rowData);
    }
    $i++;
  }
} catch (\PhpOffice\PhpSpreadsheet\Reader\Exception $e) {
  $response = new WP_Error('data_check_failed', 'Error loading file: ', $e->getMessage(), ['status' => 500]);
}

if ($data) {

  set_transient( "foodcoop_import_".$file, json_encode(array('data' => $product_array, 'errors' => $formatting_errors, 'rows_with_errors' => $rows_with_errors)), 3600 );

  $response = [
    'success' => true,
    'message' => 'File checked successfully',
    'data' => $product_array, 
    'errors' => $formatting_errors, 
    'rows_with_errors' => $rows_with_errors, 
    'file' => $file, 
    'transient' => "foodcoop_import_$file", 
    'sku' => $all_skus, 
  ];
}

