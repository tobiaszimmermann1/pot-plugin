<?php
// Standalone endpoint regression tests: php test/add-to-cart.php
// WooCommerce persistence and product rejection are simulated; no database writes.
require __DIR__ . '/../inc/foodcoop-rest-routes.php';

function __($text, $domain) { return $text; }
function get_current_user_id() { return 7; }
function wc_get_checkout_url() { return 'https://example.org/checkout/'; }
function wp_strip_all_tags($text) { return strip_tags($text); }
function wc_get_notices($type = '') { return $type ? ($GLOBALS['notices'][$type] ?? []) : $GLOBALS['notices']; }
function wc_clear_notices() { $GLOBALS['notices'] = []; }
function wc_set_notices($notices) { $GLOBALS['notices'] = $notices; }
function WC() { return $GLOBALS['wc']; }

class WP_Error {
  public function __construct(public $code, public $message, public $data) {}
}

class WC_Cart_Session {
  public function __construct(private $cart) {}
  public function set_session() { $GLOBALS['saved_cart'] = $this->cart->contents; }
  public function persistent_cart_update() { $GLOBALS['persistent_cart'] = $this->cart->contents; }
}

class TestCart {
  public $contents = ['existing' => ['product_id' => 99, 'quantity' => 2]];
  public $coupons = ['discount'];
  public $removed = ['old' => ['product_id' => 98]];
  public $attempts = [];
  public $emptied = false;
  public function get_cart() { return $this->contents; }
  public function get_applied_coupons() { return $this->coupons; }
  public function get_removed_cart_contents() { return $this->removed; }
  public function set_cart_contents($value) { $this->contents = $value; }
  public function set_applied_coupons($value) { $this->coupons = $value; }
  public function set_removed_cart_contents($value) { $this->removed = $value; }
  public function calculate_totals() {}
  public function empty_cart() {
    $this->emptied = true;
    $this->contents = $this->coupons = $this->removed = [];
  }
  public function add_to_cart($id, $amount, $variation, $attributes, $metadata) {
    $this->attempts[] = $id;
    if ($id === 2) {
      $GLOBALS['notices']['error'][] = ['notice' => '<strong>Product unavailable</strong>'];
      return false;
    }
    $this->contents[$id] = ['product_id' => $id, 'quantity' => $amount, 'metadata' => $metadata];
    return 'item-' . $id;
  }
}

function check($condition, $message) {
  if (!$condition) throw new Exception($message);
}

function run_checkout($payload) {
  $GLOBALS['wc'] = (object)['cart' => new TestCart(), 'session' => new stdClass(), 'customer' => new stdClass()];
  $GLOBALS['notices'] = ['notice' => [['notice' => 'Existing notice']]];
  $routes = (new ReflectionClass(FoodcoopRestRoutes::class))->newInstanceWithoutConstructor();
  return $routes->addToCart(['data' => $payload]);
}

foreach ([null, [], 'broken JSON', '{}', '[]', '[null]', '[{"id":1,"amount":0}]', '[{"id":1,"amount":-1}]', '[{"id":1,"amount":"bad"}]', '[{"amount":1}]'] as $payload) {
  $result = run_checkout($payload);
  check($result instanceof WP_Error && $result->data['status'] === 400, 'Invalid payload must return a REST error');
  check(!WC()->cart->emptied, 'Invalid payload must preserve the existing cart');
}

foreach ([[2, 1], [1, 2], [1, 2, 3]] as $ids) {
  $result = run_checkout(json_encode(array_map(fn($id) => ['id' => $id, 'amount' => 1], $ids)));
  check($result instanceof WP_Error && $result->data['status'] === 400, 'Any failed item must fail checkout');
  check($result->message === 'Product unavailable', 'Product error must reach the client without HTML');
  check(WC()->cart->contents === ['existing' => ['product_id' => 99, 'quantity' => 2]], 'Previous cart must be restored');
  check(WC()->cart->coupons === ['discount'] && isset(WC()->cart->removed['old']), 'Previous coupons and removed items must be restored');
  check($GLOBALS['saved_cart'] === WC()->cart->contents && $GLOBALS['persistent_cart'] === WC()->cart->contents, 'Restored cart must be persisted');
  check(!in_array(3, WC()->cart->attempts), 'Stop at the first rejected product');
}

$result = run_checkout('[{"id":1,"amount":0.25,"order_type":"self_checkout"},{"product_id":3,"amount":2,"order_type":"bestellrunde","bestellrunde":42}]');
check(json_decode($result) === wc_get_checkout_url(), 'Success must retain the existing response format');
check(count(WC()->cart->contents) === 2 && !isset(WC()->cart->contents['existing']), 'Success must transfer all products');
check(WC()->cart->contents[1]['quantity'] === 0.25, 'Fractional quantities must work');
check(WC()->cart->contents[3]['metadata']['bestellrunde'] === 42, 'Order-round metadata must be retained');
check($GLOBALS['notices'] === ['notice' => [['notice' => 'Existing notice']]], 'Existing notices must be preserved');
echo "addToCart regression tests passed\n";
