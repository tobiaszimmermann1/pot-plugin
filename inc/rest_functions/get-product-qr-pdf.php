<?php
  /**
   * Creates a PDF with QR Code of Product SKU plus some product info
   * params: sku
   */
  use chillerlan\QRCode\{QRCode, QROptions};



  // product sku
  $sku = $data['sku'];
  $qrcode = (new QRCode)->render($sku);

  // get product info
  $query = new WC_Product_Query( array(
    'sku' => $sku,
  ));
  $products = $query->get_products();
  $product = reset( $products );

  // if product is found: continue
  if ($product) {

    // create pdf
    $mpdf = new \Mpdf\Mpdf([
      'mode' => 'utf-8',
      'format' => [120,50],
      'default_font_size' => '12pt',
      'default_font' => 'Arial',
      'setAutoTopMargin' => 'stretch',
      'autoMarginPadding' => 0,
      'bleedMargin' => 0,
      'crossMarkMargin' => 0,
      'cropMarkMargin' => 0,
      'nonPrintMargin' => 0,
      'margBuffer' => 0,
      'collapseBlockMargins' => false,
    ]);
    $mpdf->AddPage('','','','','',5,5,5,5,0,0);

    // pdf content
    $content = '
      <style>
        @page *{
          margin-top: 0.5cm;
          margin-bottom: 0.5cm;
          margin-left: 0.5cm;
          margin-right: 0.5cm;
      }
      </style>
      <table style="margin:0;">
        <tr>
          <td style="width:35mm;text-align:center;font-size:8pt;"><img src="'.$qrcode.'" width="35mm" height="35mm" />'.$sku.'</td>
          <td style="width:80mm;font-size:12pt;font-weight:bold;">
            <span style="font-size:16pt;">'.$product->get_name().'</span><br /><br />
            CHF '.number_format((float)$product->get_regular_price(), 2, '.', '').'
          </td>
        </tr>
      </table>
    ';

    $mpdf->WriteHTML($content);

    $pdf = $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);
  }

