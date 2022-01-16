<?php
global $woocommerce;

header('Access-Control-Allow-Origin: *');

require_once("../../../wp-load.php");


$products = $_POST['products'];


WC()->cart->empty_cart();

foreach ($products as $key => $value) {

    if ($value >= 1) {

        WC()->cart->add_to_cart($key, $value);

    }

}

$url = wc_get_cart_url();
header("Location: ".$url);

die();

?>
