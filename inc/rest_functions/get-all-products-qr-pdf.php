<?php
  /**
   * Creates a PDF with QR Code of Product SKU plus some product info
   * params: sku
   */
  use chillerlan\QRCode\{QRCode, QROptions};


  // get all products
  $args = array(

    'limit' => -1,
    'orderby'   => 'title',
    'order'     => 'ASC',

  );

  $query = new WC_Product_Query($args);
  $products = $query->get_products();
  $self_checkout_products = json_decode(get_option( 'fc_self_checkout_products' ));


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


  foreach($products as $product) {
    // product sku
    $sku = $product->get_sku();

    if ($sku) {

      if (in_array($product->get_id(),$self_checkout_products) ) {

        $mpdf->AddPage('','','','','',5,5,5,5,0,0);

        $qrcode = (new QRCode)->render($sku);

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
              <td style="width:35mm;text-align:center;font-size:8pt;"><img src="'.$qrcode.'" width="35mm" /></td>
              <td style="width:85mm;font-size:12pt;font-weight:bold;">
                <span style="font-size:16pt;">'.$product->get_name().'</span><br /><br />
                CHF '.number_format((float)$product->get_regular_price(), 2, '.', '').'<br /><br />
                <table>
                  <tr>
                    <td style="padding:5px;background-color:black;">
                      <span style="font-size:16pt;color:white;font-weight:bold;">'.$sku.'</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        ';

        $mpdf->WriteHTML($content);
        
      }
    }
  }

  $pdf = $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);


