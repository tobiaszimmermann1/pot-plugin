<?php

class FoodcoopRestRoutes {

  function __construct() {
    add_action( 'rest_api_init', array($this, 'rest_routes'));
  }

  function rest_routes() {
    /**
     * GET all products
     */
    register_rest_route( 'foodcoop/v1', 'getProducts', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getProducts'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * GET an option
     * params: option_name
     */
    register_rest_route( 'foodcoop/v1', 'getOption', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getOption'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST product update
     * params: id, values
     */
    register_rest_route( 'foodcoop/v1', 'postProductUpdate', array(
      'methods' => 'POST',
      'callback' => array($this, 'postProductUpdate'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST product delete
     * params: id
     */
    register_rest_route( 'foodcoop/v1', 'postProductDelete', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postProductDelete'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET bestellrunden
     */
    register_rest_route( 'foodcoop/v1', 'getBestellrunden', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getBestellrunden'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST create bestellrunde
     * params: start, ende, verteiltag
     */
    register_rest_route( 'foodcoop/v1', 'postCreateBestellrunde', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postCreateBestellrunde'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST update bestellrunde
     * params: start, ende, verteiltag
     */
    register_rest_route( 'foodcoop/v1', 'postUpdateBestellrunde', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postUpdateBestellrunde'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET bestellungen
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getBestellungen', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getBestellungen'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET receiptsPDF
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getReceiptsPDF', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getReceiptsPDF'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET distlistPDF
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getDistListPDF', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getDistListPDF'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET getOrderListPDF
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getOrderListPDF', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getOrderListPDF'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET distlistDetailPDF
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getDistlistDetailPDF', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getDistlistDetailPDF'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET dataExport
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getDataExport', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getDataExport'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST bestellrunde delete
     * params: id
     */
    register_rest_route( 'foodcoop/v1', 'postBestellrundeDelete', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postBestellrundeDelete'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST save products for bestellrunde
     * params: products, bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'postSaveProductsBestellrunde', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSaveProductsBestellrunde'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET bestellrunde products
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getBestellrundeProducts', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getBestellrundeProducts'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * GET products ordered in bestellrunde
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getProductsOrdersInBestellrunde', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getProductsOrdersInBestellrunde'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST Save Mutation
     * params: product, bestellrunde, order_items, orders
     */
    register_rest_route( 'foodcoop/v1', 'postSaveMutation', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSaveMutation'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST Import products
     * params: products
     */
    register_rest_route( 'foodcoop/v1', 'postImportProducts', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postImportProducts'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST Import products lieferant
     * params: products
     */
    register_rest_route( 'foodcoop/v1', 'postImportProductsLieferant', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postImportProductsLieferant'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET users
     */
    register_rest_route( 'foodcoop/v1', 'getUsers', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getUsers'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST user delete
     * params: id
     */
    register_rest_route( 'foodcoop/v1', 'postUserDelete', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postUserDelete'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST add user
     * params: firstName, lastName, email, billing_address_1, billing_postcode, billing_city, role
     */
    register_rest_route( 'foodcoop/v1', 'postAddUser', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postAddUser'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET Transactions
     */
    register_rest_route( 'foodcoop/v1', 'getTransactions', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getTransactions'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * Post Add Transaction
     */
    register_rest_route( 'foodcoop/v1', 'postAddTransaction', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postAddTransaction'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET Dashboard Data
     */
    register_rest_route( 'foodcoop/v1', 'getDashboardData', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getDashboardData'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET Dashboard Data
     */
    register_rest_route( 'foodcoop/v1', 'getProductList', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getProductList'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * GET Balance
     */
    register_rest_route( 'foodcoop/v1', 'getBalance', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getBalance'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    
    
  }
  
  
    

  
  
  


  /**
   * API Routes Functions
   */

   /**
    * getProducts
    */
  function getProducts($data) {

    $p = wc_get_products(array(
      'status'            => array( 'publish' ),
      'type'              => array_merge( array_keys( wc_get_product_types() ) ),
      'parent'            => null,
      'sku'               => '',
      'category'          => array(),
      'tag'               => array(),
      'limit'             => -1,
      'offset'            => null,
      'page'              => 1,
      'include'           => array(),
      'exclude'           => array(),
      'orderby'           => 'date',
      'order'             => 'DESC',
      'return'            => 'objects',
      'paginate'          => false,
      'shipping_class'    => array(),
    ));

    $product_categories = get_terms( 'product_cat' );
    $categories = array();
    $cats = array();
    foreach( $product_categories as $category ) {
      array_push($categories, $category->name);
      $cats[$category->term_id] = $category->name;
    } 
    
    $products = array();
    foreach ($p as $product) {
      // product name
      $the_product = array(
        "id" => $product->get_id(),
        "name" => $product->get_name(),
        "price" => $product->get_price(),
        "image" => $product->get_image(),
        "category_id" => $product->get_category_ids()[0]
      );
    
      // product meta data
      $the_meta = $product->get_meta_data();
      foreach($the_meta as $meta) {
        $data = $meta->get_data();
        $the_product[$data['key']] = $data['value'];
      }
  
      // product category (only the first one!)
      $the_product['category_name'] = $cats[$product->get_category_ids()[0]];

      array_push($products, $the_product);
    }
         
    return json_encode(array($products, $categories));

  }

  /**
   * getOption
   */
  function getOption($data) {
    return json_encode(get_option($data['option']));
  }

  /**
   * postProductUpdate
   */
  function postProductUpdate($data) {

    $product = wc_get_product($data['id']);
    $product->set_name($data['updatedValues']['name']);
    $product->set_regular_price($data['updatedValues']['price']);
    $product->update_meta_data('_lieferant', $data['updatedValues']['producer']);
    $product->update_meta_data('_herkunft', $data['updatedValues']['origin']);
    $product->update_meta_data('_gebinde', $data['updatedValues']['lot']);
    $product->update_meta_data('_einheit', $data['updatedValues']['unit']);
    $product->save();
    return json_encode($data['updatedValues']['name']);

  }

  /**
   * postProductDelete
   */
  function postProductDelete($data) {
    $product = wp_delete_post($data['id']);
    return json_encode($data['name']);
  }

  /**
   * getBestellrunden
   */
  function getBestellrunden() {
    $args = array(
      'numberposts' => -1,
      'post_type'   => 'bestellrunden',
      'meta_key' => 'bestellrunde_start',
      'orderby' => 'meta_value',
    );
    $bestellrunden_data = get_posts( $args );

    $bestellrunden = array();
    foreach($bestellrunden_data as $b) {
      $the_bestellrunde = array(
        "id" => $b->ID,
        "author" => $b->post_author,
        "date_created" => $b->post_date,
      );
      
      $the_meta = get_post_meta($b->ID);
      foreach($the_meta as $key => $value) {          
        $the_bestellrunde[$key] = $value[0];
      }

      array_push($bestellrunden, $the_bestellrunde);
    }

    return json_encode($bestellrunden);
  }

  /**
   * postCreateBestellrunde
   */
  function postCreateBestellrunde($data) {
    $id = wp_insert_post(array(
      'post_title'=> $data['bestellrunde_verteiltag'], 
      'post_type'=>'bestellrunden',
      'post_status' => 'publish'
    ));

    add_post_meta( $id, 'bestellrunde_start', $data['bestellrunde_start'], true );
    add_post_meta( $id, 'bestellrunde_ende', $data['bestellrunde_ende'], true );
    add_post_meta( $id, 'bestellrunde_verteiltag', $data['bestellrunde_verteiltag'], true );

    return json_encode($id);
  }

  /**
   * postUpdateBestellrunde
   */
  function postUpdateBestellrunde($data) {
    $id = intval($data['id']);
    update_post_meta( $id, 'bestellrunde_start', $data['bestellrunde_start'] );
    update_post_meta( $id, 'bestellrunde_ende', $data['bestellrunde_ende'] );
    update_post_meta( $id, 'bestellrunde_verteiltag', $data['bestellrunde_verteiltag'] );

    return json_encode($id);
  }

  /**
   * getBestellungen
   */
  function getBestellungen($data) {
    add_filter( 'woocommerce_order_data_store_cpt_get_orders_query', 'custom_order_query', 10, 2 );
    function custom_order_query($query, $query_vars){
        if ( ! empty( $query_vars['bestellrunde_id'] ) ) {
            $query['meta_query'][] = array(
                'key' => 'bestellrunde_id',
                'value' => esc_attr( $query_vars['bestellrunde_id'] ),
                'compare' => '='
            );
        }
        return $query;
    }

    $args = array(
      'status'        => array('completed', 'processing', 'on-hold', 'refunded', 'pending'),
      'meta_key'     => 'bestellrunde_id',
      'meta_value'  =>  $data['bestellrunde'],
      'meta_compare' => '=', 
      'return'        => 'ids',
      'limit'   => -1
    );
    $orders = wc_get_orders( $args );

    $order_data = array();
    foreach($orders as $order_id) {
      $o = wc_get_order($order_id);
      $the_order = array(
        "id" => $order_id,
        "customer_name" => $o->get_billing_first_name()." ".$o->get_billing_last_name(),
        "customer_id" => $o->get_customer_id(),
        "total" => $o->get_total(),
        "date_created" => $o->get_date_created()->date("Y-m-d"),
        "url" => $o->get_edit_order_url(),
      );

      $line_items = array();
      foreach ( $o->get_items() as $item_id => $item ) {
        $the_line_item = array();
        $the_line_item['item_id'] = $item_id;
        $the_line_item['product_id'] = $item->get_product_id();
        $the_line_item['variation_id'] = $item->get_variation_id();
        $the_line_item['product'] = $item->get_product(); // see link above to get $product info
        $the_line_item['product_name'] = $item->get_name();
        $the_line_item['quantity'] = $item->get_quantity();
        $the_line_item['subtotal'] = $item->get_subtotal();
        $the_line_item['total'] = $item->get_total();
        $the_line_item['tax'] = $item->get_subtotal_tax();
        $the_line_item['tax_class'] = $item->get_tax_class();
        $the_line_item['tax_status'] = $item->get_tax_status();
        $the_line_item['allmeta'] = $item->get_meta_data();
        $the_line_item['somemeta'] = $item->get_meta( '_whatever', true );
        array_push($line_items, $the_line_item);
      }
      $the_order['line_items'] = $line_items;
      
      array_push($order_data, $the_order);
    }

    return json_encode($order_data);
  }

  /**
   * getReceiptsPDF
   */
  function getReceiptsPDF($data) {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-receipts-pdf.php');
    return base64_encode($pdf);
  }

  /**
   * getDistListPDF
   */
  function getDistListPDF($data) {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-distlist-pdf.php');
    return base64_encode($pdf);
  }

  /**
   * getOrderListPDF
   */
  function getOrderListPDF($data) {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-orderlist-pdf.php');
    return base64_encode($pdf);
  }

  /**
   * distlistDetailPDF
   */
  function getDistlistDetailPDF($data) {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-distlist-detail-pdf.php');
    return base64_encode($pdf);
  }

  /**
   * getDataExport
   */
  function getDataExport($data) {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-data-export.php');
    return;
  }

  /**
   * postBestellrundeDelete
   */
  function postBestellrundeDelete($data) {
    add_filter( 'woocommerce_order_data_store_cpt_get_orders_query', 'custom_order_query', 10, 2 );
    function custom_order_query($query, $query_vars){
        if ( ! empty( $query_vars['bestellrunde_id'] ) ) {
            $query['meta_query'][] = array(
                'key' => 'bestellrunde_id',
                'value' => esc_attr( $query_vars['bestellrunde_id'] ),
                'compare' => '='
            );
        }
        return $query;
    }

    $args = array(
      'status'        => array('completed', 'processing', 'on-hold', 'refunded', 'pending'),
      'meta_key'     => 'bestellrunde_id',
      'meta_value'  =>  $data['id'],
      'meta_compare' => '=',
      'return'        => 'ids',
      'limit'   => -1
    );
    $orders = wc_get_orders( $args );

    if (count($orders) == 0) {
      $bestellrunde = wp_delete_post($data['id']);
      return $data['id'];
    } else {
      return 'false';
    }

  }

  /**
   * postSaveProductsBestellrunde
   */
  function postSaveProductsBestellrunde($data) {
    $update = update_post_meta( $data['bestellrunde'], 'bestellrunde_products', $data['products'] );
    return($update);
  }

  /**
   * getBestellrundeProducts
   */
  function getBestellrundeProducts($data) {
    $bestellrunde = $data['bestellrunde'];

    $p = wc_get_products(array(
      'status'            => array( 'publish' ),
      'type'              => array_merge( array_keys( wc_get_product_types() ) ),
      'parent'            => null,
      'sku'               => '',
      'category'          => array(),
      'tag'               => array(),
      'limit'             => -1,
      'offset'            => null,
      'page'              => 1,
      'include'           => array(),
      'exclude'           => array(),
      'orderby'           => 'date',
      'order'             => 'DESC',
      'return'            => 'objects',
      'paginate'          => false,
      'shipping_class'    => array(),
    ));

    $product_categories = get_terms( 'product_cat' );
    $categories = array();
    foreach( $product_categories as $category ) {
      $categories[$category->term_id] = $category->name;
    } 
    
    $products = array();
    foreach ($p as $product) {
      // product name
      $the_product = array(
        "id" => $product->get_id(),
        "name" => $product->get_name(),
        "price" => $product->get_price(),
        "image" => $product->get_image(),
        "category_id" => $product->get_category_ids()[0]
      );
    
      // product meta data
      $the_meta = $product->get_meta_data();
      foreach($the_meta as $meta) {
        $data = $meta->get_data();
        $the_product[$data['key']] = $data['value'];
      }
  
      // product category (only the first one!)
      $the_product['category_name'] = $categories[$product->get_category_ids()[0]];

      array_push($products, $the_product);
    }
         

    $selectedProducts = get_post_meta( $bestellrunde, 'bestellrunde_products', true );
    return json_encode( array($products, $selectedProducts) );
  }

  /**
   * getProductsOrdersInBestellrunde
   */
  function getProductsOrdersInBestellrunde($data) {
    $bestellrunde = $data['bestellrunde'];

    // orders query
    $orders = wc_get_orders( array(
      'limit'         => -1, 
      'orderby'       => 'date',
      'order'         => 'DESC',
      'meta_key'      => 'bestellrunde_id', 
      'meta_value'    => $bestellrunde, 
    ));

    $order_items = array();  
    $produkte = array();

    foreach($orders as $order) {
      foreach ( $order->get_items() as $item_id => $item ) {
        // products and order_items
        $item_array = array();
        $product_array = array();

        // order id
        $item_array['order_id'] = $order->get_id();

        // user that has ordered the item
        $username = $order->get_billing_first_name(). " " . $order->get_billing_last_name();
        $item_array['username'] = $username;

        // product id
        $product_id = intval(wc_get_order_item_meta( $item_id, '_pid', true));
        // fallback
        if(!$product_id) {
          $product_id = $item->get_product_id();
        }
        $item_array['product_id'] = $product_id;

        // einheit
        $product_einheit = esc_attr(wc_get_order_item_meta( $item_id, '_einheit', true));
        // fallback
        if (!$product_einheit) {
          $product_einheit = esc_attr(get_post_meta( $item->get_product_id(), '_einheit',true ));
        }
        $item_array['einheit'] = $product_einheit;
        $product_array['einheit'] = $product_einheit;

        // name
        $product_name = $item->get_name();
        $item_array['name'] = $product_name;
        $product_array['name'] = $product_name;
        
        // ordered quantity
        $item_total_quantity = $item->get_quantity(); 
        $item_quantity_refunded = $order->get_qty_refunded_for_item( $item_id );
        $item_final_quantity = $item_total_quantity + $item_quantity_refunded; 
        $item_array['qty'] = $item_final_quantity;

        // price
        if($item_final_quantity > 0) {        
          $item_array['price'] = $item->get_total() / $item_final_quantity;
          $product_array['price'] = $item->get_total() / $item_final_quantity;
        } else {
          $item_array['price'] = 0;
          $product_array['price'] = 0;
        }

        // push info to product array if it is not already
        if ( !array_key_exists($product_id, $produkte) ) {
          $produkte[$product_id] = $product_array;
        }

        // add order items to order items array
        $order_items[$item_id] = $item_array;
      }
    }

    // order id's sorted by product id
    $orders_by_products = array();
    foreach ($produkte as $product_id => $product) {
      $orders_array = array();
      foreach ($order_items as $order_item) {
        if ( $product_id == $order_item['product_id'] ) {
          if (!in_array( $order_item['order_id'], $orders_array)) {
            array_push($orders_array,[$order_item['order_id'],$order_item['username']]);
          }
        } 
      }
      $orders_by_products[$product_id] = $orders_array;
    }


    return json_encode( array($order_items, $produkte, $orders_by_products) );
  }

  /**
   * postSaveMutation
   */
  function postSaveMutation($data) {
    $bestellrunde = $data['bestellrunde'];
    $orders = $data['orders'];
    $new_product_price = number_format($data['price'], 2, '.', '');
    $product = $data['product'];
    $mutation_type = $data['mutation_type'];

    if ($mutation_type == "notDelivered") {
      foreach($orders as $o) {

        $order_id = $o[0];
        $order  = wc_get_order( $order_id );

        // Get Items
        $order_items = $order->get_items();

        // Refund Amount
        $refund_amount = 0;

        // Prepare line items which we are refunding
        $line_items = array();

        foreach( $order_items as $item_id => $item ) {
          $product_id = wc_get_order_item_meta( $item_id, '_pid', true);
          if(!$product_id) {
              $product_id = $item->get_product_id();
          }
              
          if ($product_id == $product) {
            $product_name = $item->get_name();
            $item_meta 	= $order->get_item_meta( $item_id );
            $product_data = wc_get_product( $item_meta["_product_id"][0] );
            $ordered_qty = $item->get_quantity();
            $refunded_quantity = 0;
            $item_qty_refunded = $order->get_qty_refunded_for_item( $item_id ); // Get the refunded amount for a line item.

            $qty = $ordered_qty + $item_qty_refunded;

            if ($qty > 0) {
              $item_ids[] = $item_id;
              $tax_data = $item_meta['_line_tax_data'];
              $refund_tax = 0;
      
              if( is_array( $tax_data[0] ) ) {
                $refund_tax = array_map( 'wc_format_decimal', $tax_data[0] );
              }
      
              $refund_amount = wc_format_decimal( $refund_amount ) + wc_format_decimal( $item_meta['_line_total'][0] );                   
              $line_items[ $item_id ] = array( 'qty' => $qty, 'refund_total' => wc_format_decimal( $item_meta['_line_total'][0] ), 'refund_tax' =>  $refund_tax );

              $res = wc_create_refund( array(
                'amount'         => $refund_amount,
                'reason'         => 'Mutation: Produkt nicht geliefert ('.$product_name.')',
                'order_id'       => $order_id,
                'line_items'     => $line_items,
                'refund_payment' => true
              ));
            }
          }
        }
      }
      return json_encode( 'success' );           
    } 


    if ($mutation_type == "priceAdjust") {
      foreach($orders as $o) {

        $order_id = $o[0];
        $order  = wc_get_order( $order_id );

        // Get Items
        $order_items = $order->get_items();

        foreach( $order_items as $item_id => $item ) {
          $product_id = wc_get_order_item_meta( $item_id, '_pid', true);
          if(!$product_id) {
              $product_id = $item->get_product_id();
          }
              
          if ($product_id == $product) {
            $product_name = $item->get_name();

            // book difference into wallet
            $item_total_quantity = $item->get_quantity(); 
            $item_quantity_refunded = $order->get_qty_refunded_for_item( $item_id );
            $product_quantity = $item_total_quantity + $item_quantity_refunded; 

            if ($product_quantity > 0) {
              // price
              $old_product_price = (float) 0;
              if($product_quantity > 0) {        
                $old_product_price = (float) $item->get_total() / $product_quantity;
              } else {
                $old_product_price = 0;
              }
              $price_diff = $product_quantity * ($old_product_price - $new_product_price);

              if ($price_diff != 0) {
                $new_line_item_price = $new_product_price * $product_quantity;
                $item->set_subtotal( $new_line_item_price ); 
                $item->set_total( $new_line_item_price );
                $item->calculate_taxes();
                $item->save();
  
                // UPDATE PRODUCT PRICE
                update_post_meta( $product_id, '_regular_price', $new_product_price );
  
                // CREATE WALLET TRANSACTION
  
                  // GET CURRENT BALANCE OF USER
                  global $woocommerce;
                  global $wpdb;
  
                  $user_id = $order->get_user_id();
  
                  $results =  $wpdb->get_results(
                                $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
                              );
  
                  foreach ( $results as $result )
                  {
                    $current_balance = $result->balance;
                  }
  
                  // CALCULATE NEW BALANCE
                  $new_balance = $current_balance + $price_diff;
                  $new_balance = number_format($new_balance, 2, '.', '');
  
                  // ADD WALLET TRANSACTION
                  $table = $wpdb->prefix.'foodcoop_wallet';
  
                  $amount = $price_diff;
                  date_default_timezone_set('Europe/Zurich');
                  $date = date("Y-m-d H:i:s");
                  $details = 'Mutation: Produktpreisanpassung ('.$product_name.')';
                  $created_by = get_current_user_id();
  
                  $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
  
                  $wpdb->insert($table, $data);
              }
            }
          }
        }
        $order->calculate_totals();
      }
      return json_encode( 'success' );  
    }
    
  }
  
  /**
   * postImportProducts
   */
  function postImportProducts($data) {
    $products = json_decode($data['products']);

    // get product categories
    $product_categories = get_terms( 'product_cat' );
    $categories = array();
    foreach( $product_categories as $category ) {
      $categories[$category->name] = $category->term_id;
    } 

    // count changes
    $changed_products = 0;
    $new_products = 0;
    $deleted_products = 0;

    // product id's to delete are not included in updated_product_ids array
    $all_products_before_import = wc_get_products( array( 'return' => 'ids', 'limit' => -1 ) );
    $updated_product_ids = array();

    foreach($products as $product) {
      // get product id and check if product exists already
      $id = $product[7];
      $check_if_product_exists = is_a(wc_get_product($id), 'WC_Product');
      
      // if the product exists, update product
      if ($check_if_product_exists) {
        // add to updated product ids array
        array_push($updated_product_ids, $id);

        // sanitize special chars
        $title = str_replace("&","+",$product[0]);
        $title = str_replace("<","",$title);
        $title = str_replace(">","",$title);

        $data = array(
          'ID'            => $id,
          'post_title'    => sanitize_text_field($title),
          'meta_input'    => array(
                  '_einheit'    => sanitize_text_field($product[2]),
                  '_gebinde'    => sanitize_text_field($product[3]),
                  '_lieferant'  => sanitize_text_field($product[4]),
                  '_herkunft'   => sanitize_text_field($product[5]),
                )
        );
        wp_update_post( $data );

        // update product price
        $p = wc_get_product($id);
        $p->set_price((float) $product[1]);
        $p->save();

        // update product category
        wp_set_object_terms( $id, intval($categories[$product[6]]), 'product_cat' );

        $changed_products++;
      } 
      // if product does not exists, create new product
      else {
        // sanitize special chars
        $title = str_replace("&","+",$product[0]);
        $title = str_replace("<","",$title);
        $title = str_replace(">","",$title);

        $data = array(
          'post_type'            => 'product',
          'post_status'         => 'publish',
          'post_title'          => sanitize_text_field($title),
          'meta_input'          => array(
                  '_einheit'    => sanitize_text_field($product[2]),
                  '_gebinde'    => sanitize_text_field($product[3]),
                  '_lieferant'  => sanitize_text_field($product[4]),
                  '_herkunft'   => sanitize_text_field($product[5]),
                )
        );
        $post_id = wp_insert_post( $data );

        // update product price
        update_post_meta($post_id, '_price', (float) $product[1]);
        update_post_meta($post_id, '_regular_price', (float) $product[1]);
        update_post_meta($post_id, '_featured', 'no');
        update_post_meta($post_id, '_virtual', 'no');
        update_post_meta($post_id, '_visibility', 'visible');
        update_post_meta($post_id, '_stock_status', 'instock');
        update_post_meta($post_id, '_downloadable', 'no');
        update_post_meta($post_id, '_downloadable', 'no');

        // update product category
        wp_set_object_terms( $post_id, intval($categories[$product[6]]), 'product_cat' );
        wp_set_object_terms( $post_id, 'simple', 'product_type' );

        $new_products++;
      }
    }
    
    // delete all products that are not among updated products
    foreach($all_products_before_import as $product_before_import) {
      if(!in_array($product_before_import, $updated_product_ids)) {
        wp_trash_post( $product_before_import );
        $deleted_products++;
      }
    }

    return array($changed_products,$new_products,$deleted_products); 
  }

  
  /**
   * postImportProductsLieferant
   */
  function postImportProductsLieferant($data) {
    $products = json_decode($data['products']);

    // count changes
    $changed_products = 0;
    $new_products = 0;

    foreach($products as $product) {
      // get product name and lieferant and check if product exists already
      $product_name = $product[0];
      $check_if_product_exists = get_page_by_title($product_name, OBJECT, 'product');

      // if the product exists, update product
      if ($check_if_product_exists && $check_if_product_exists->post_status == 'publish') {
        $id = $check_if_product_exists->ID;

        // sanitize special chars
        $title = str_replace("&","+",$product[0]);
        $title = str_replace("<","",$title);
        $title = str_replace(">","",$title);

        $data = array(
          'ID'            => $id,
          'post_title'    => sanitize_text_field($title),
          'meta_input'    => array(
                  '_einheit'    => sanitize_text_field($product[2]),
                  '_gebinde'    => sanitize_text_field($product[3]),
                  '_lieferant'  => sanitize_text_field($product[4]),
                  '_herkunft'   => sanitize_text_field($product[5]),
                )
        );
        wp_update_post( $data );

        // update product price
        $p = wc_get_product($id);
        $p->set_price((float) $product[1]);
        $p->save();

        // update product category
        wp_set_object_terms( $id, sanitize_text_field($product[6]), 'product_cat' );

        $changed_products++;
      } 
      // if product does not exists, create new product
      else {
        // sanitize special chars
        $title = str_replace("&","+",$product[0]);
        $title = str_replace("<","",$title);
        $title = str_replace(">","",$title);

        $data = array(
          'post_type'            => 'product',
          'post_status'         => 'publish',
          'post_title'          => sanitize_text_field($title),
          'meta_input'          => array(
                  '_einheit'    => sanitize_text_field($product[2]),
                  '_gebinde'    => sanitize_text_field($product[3]),
                  '_lieferant'  => sanitize_text_field($product[4]),
                  '_herkunft'   => sanitize_text_field($product[5]),
                )
        );
        $post_id = wp_insert_post( $data );

        // update product price
        update_post_meta($post_id, '_price', (float) $product[1]);
        update_post_meta($post_id, '_regular_price', (float) $product[1]);
        update_post_meta($post_id, '_featured', 'no');
        update_post_meta($post_id, '_virtual', 'no');
        update_post_meta($post_id, '_visibility', 'visible');
        update_post_meta($post_id, '_stock_status', 'instock');
        update_post_meta($post_id, '_downloadable', 'no');
        update_post_meta($post_id, '_downloadable', 'no');

        // update product category
        wp_set_object_terms( $post_id, sanitize_text_field($product[6]), 'product_cat' );
        wp_set_object_terms( $post_id, 'simple', 'product_type' );

        $new_products++;
      }
    }

    return array($changed_products,$new_products); 
  }



  function getUsers() {
    $users = get_users();

    $userData = array();
    foreach ($users as $user) {
      $the_user = array();

      $id = $user->ID;
      $name = get_user_meta($id, 'billing_first_name', true)." ".get_user_meta($id, 'billing_last_name', true);
      $email = $user->data->user_email;
      $role = implode($user->roles);
      $address = get_user_meta($id, 'billing_address_1', true).", ".get_user_meta($id, 'billing_postcode', true)." ".get_user_meta($id, 'billing_city', true);

      // get balance
      global $wpdb;
      $results = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $id)
      );

      $balance = '0.00';
      foreach ( $results as $result )
      {
        $balance = $result->balance;
      }

      $the_user['name'] = $name;
      $the_user['id'] = $id;
      $the_user['email'] = $email;
      $the_user['address'] = $address;
      $the_user['balance'] = $balance;
      $the_user['role'] = $role;

      array_push($userData, $the_user);
    }

    return json_encode($userData);
  }


  

  /**
   * postUserDelete
   */

  function postUserDelete($data) {
    require_once(ABSPATH.'wp-admin/includes/user.php' );
    wp_delete_user(intval($data['id']));
    return json_encode($data['name']);
  }


  /**
   * postAddUser
   */
  function postAddUser($data) {
    $firstName = esc_attr($data['firstName']);
    $lastName = esc_attr($data['lastName']);
    $email = esc_attr($data['email']);
    $billing_address_1 = esc_attr($data['billing_address_1']);
    $billing_postcode = esc_attr($data['billing_postcode']);
    $billing_city = esc_attr($data['billing_city']);

    // password generator
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$!?';
    $password = '';
    for ($i = 0; $i < 8; $i++) {
        $index = rand(0, strlen($characters) - 1);
        $password .= $characters[$index];
    }

    // insert user
    $data = array(
      'first_name' => $firstName,
      'last_name' => $lastName,
      'display_name' => $firstName." ".$lastName,
      'user_email' => $email,
      'user_login' => $firstName." ".$lastName,
      'user_pass' => $password
    );
    $user = wp_insert_user($data);

    return array($firstName." ".$lastName, $user);
  }



  /**
   * getTransactions
   */
  function getTransactions($data) {
    global $wpdb;
    $transactions = $wpdb->get_results(
      $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC", intval($data['id']))
    );
    
    $transactions_fixed = array();
    foreach($transactions as $transaction) {
      $the_transaction = $transaction;

      $id = intval($the_transaction->created_by);
      $name = get_user_meta($id, 'billing_first_name', true)." ".get_user_meta($id, 'billing_last_name', true);
      $the_transaction->created_by = $name;

      array_push($transactions_fixed, $the_transaction);
    }

    return json_encode($transactions_fixed);
  }


  /**
   * postAddTransaction
   */
  function postAddTransaction($data) {
    global $wpdb;
    $table = $wpdb->prefix.'foodcoop_wallet';

    $user_id = $data['user'];
    $date = $data['date'];
    $details = $data['details'];
    $created_by = $data['created_by'];

    // amount
    $amount = $data['amount'];
    if ($amount == 'jahresbeitrag') {
      $amount = -1 * number_format(get_option('fc_fee'), 2, '.', '');
    } else {
      $amount = number_format($data['amount'], 2, '.', '');
    }

    $results = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
             );

    foreach ( $results as $result )
    {
       $current_balance = $result->balance;
    }

    $new_balance = $current_balance + $amount;
    $new_balance = number_format($new_balance, 2, '.', '');

    $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
    $format = array('%s','%d');

    // send email update
    $update_user = get_user_by( 'id', $user_id );
    $update_username = $update_user->user_firstname." ".$update_user->user_lastname;
    $user_info = get_userdata($user_id);
    $user_email = $user_info->user_email;
    $paid_date = date("j.m.Y - G:i",strtotime($date));

    /*
    $message = 'Hallo '.$update_username.'
                Neue Foodcoop Guthaben Transaktion.
                Benutzer: '.$update_username.' 
                Datum: '.$paid_date.' 
                Betrag: CHF '.$amount.'
                Details: '.$details.' 
                
                Melde dich bei uns sofern diese Buchung nicht korrekt ist.
                ';

    //php mailer variables
    $to = get_option('admin_email');
    $subject = "Neue Foodcoop Transaktion";
    $options = get_option( 'foodcoop_plugin_options' );
    $admin_email = $options['email'];
    $headers = array('From: '.bloginfo('name').' <'.$admin_email.'>');

    //$admin = wp_mail($to, $subject, $message, $headers);
    $user = wp_mail($user_email, $subject, $message, $headers);
    */

    $wpdb->insert($table, $data, $format);
    $transaction_id = $wpdb->insert_id;
    

    $name = get_user_meta($user_id, 'billing_first_name', true)." ".get_user_meta($user_id, 'billing_last_name', true);
    return json_encode(array($new_balance, $name, $transaction_id, $amount, $details));

  }




  /**
  * getDashboardData
  */
  function getDashboardData($data) {
    global $woocommerce;
    global $wpdb;

    $products = wc_get_products(array(
      'status'            => array( 'publish' ),
      'limit'             => -1,
      'page'              => 1,
      'return'            => 'ids',
      'paginate'          => false,
    ));

    $product_categories = get_terms( 'product_cat' );
  
    $bestellrunden = get_posts(array(
      'numberposts' => -1,
      'post_type'   => 'bestellrunden',
      'meta_key' => 'bestellrunde_start',
      'orderby' => 'meta_value',
    ));

    $orders = wc_get_orders(array(
      'status'        => array('completed', 'processing', 'on-hold', 'refunded', 'pending'),
      'return'        => 'ids',
      'limit'   => -1
    ));

    $users = get_users();


    $transactions =  $wpdb->get_results(
                  $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` ORDER BY `id` DESC")
                );
    
    return json_encode(array($products, $product_categories, $bestellrunden, $orders, $users, $transactions));
  }




  /**
  * getProductList
  */
  function getProductList($post_data) { 
    // check if bestellrunde is active and if yes, set the id
    $bestellrunden = get_posts(array(
      'numberposts' => -1,
      'post_type'   => 'bestellrunden',
      'meta_key' => 'bestellrunde_start',
      'orderby' => 'meta_value',
    ));

    $bestellrunde = null;
    $bestellrunde_dates = array();
    $now = date('Y-m-d');
    $active = false;
    foreach ($bestellrunden as $b) {
      $id = $b->ID;
      $start = get_post_meta( $id, 'bestellrunde_start', true );
      $end = get_post_meta( $id, 'bestellrunde_ende', true );
      $dist = get_post_meta( $id, 'bestellrunde_verteiltag', true );
      if ($start <= $now AND $end >= $now) {
        $bestellrunde = $id;
        array_push($bestellrunde_dates, $start, $end, $dist);
        $active = true;
      }
    }

    // get product ids of active bestellrunde
    $bestellrunde_products = array();
    if($active) {
      $bestellrunde_products = json_decode(get_post_meta($bestellrunde, 'bestellrunde_products', true));
    }

    // get all categories
    $product_categories = get_terms( 'product_cat' );
    $categories = array();
    $cats = array();
    foreach( $product_categories as $category ) {
      array_push($categories, $category->name);
      $cats[$category->term_id] = $category->name;
    } 

    // get order of this user and in this bestellrunde, if it exists
    $order = null;
    $customer = new WC_Customer(intval($post_data['user']));
    $last_order = $customer->get_last_order();
    if ($last_order) {
      $order_data = $last_order->get_data();
      $bestellrunde_of_this_order = get_post_meta( $last_order->get_id(), 'bestellrunde_id', true );
      
      if ($bestellrunde_of_this_order == $bestellrunde) {
        $order = $order_data;
      }
    }

    // get all products
    $p = wc_get_products(array(
      'status'            => array( 'publish' ),
      'limit'             => -1,
      'page'              => 1,
      'return'            => 'objects',
      'paginate'          => false,
    ));

    $products = array();
    foreach ($p as $product) {
      // product name
      $the_product = array(
        "id" => $product->get_id(),
        "name" => $product->get_name(),
        "price" => $product->get_price(),
        "image" => $product->get_image(),
        "category_id" => $product->get_category_ids()[0]
      );
    
      // product meta data
      $the_meta = $product->get_meta_data();
      foreach($the_meta as $meta) {
        $data = $meta->get_data();
        $the_product[$data['key']] = $data['value'];
      }
  
      // product category (only the first one!)
      $the_product['category_name'] = $cats[$product->get_category_ids()[0]];

      // check if user has already ordered in this bestellrunde and if yes, set amount
      $amount = 0;
      if ($last_order) {
        foreach($last_order->get_items() as $item_id => $item) {
          $item_product_id = $item->get_meta( '_pid', true );
          if ($item_product_id == $product->get_id()) {
            $amount = $item->get_quantity();
          }
        }
      }
      $the_product['amount'] = $amount;

      array_push($products, $the_product);
    }

    usort($products, fn($a, $b) => $a['category_name'] <=> $b['category_name']);




    return json_encode(array($active, $bestellrunde, $bestellrunde_products, $products, $categories, $order, $bestellrunde_dates));
  }




  /**
   * getBalance
   */
  function getBalance($data) {
    global $wpdb;

    $results = $wpdb->get_results(
      $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $data['id'])
    );
 
    foreach ( $results as $result )
    {
      $current_balance = $result->balance;
    }


    return json_encode($current_balance);
  }



}