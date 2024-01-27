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
     * GET all options
     */
    register_rest_route( 'foodcoop/v1', 'getAllOptions', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getAllOptions'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST save all options
     */
    register_rest_route( 'foodcoop/v1', 'saveAllOptions', array(
      'methods' => 'POST',
      'callback' => array($this, 'saveAllOptions'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET banking options
     */
    register_rest_route( 'foodcoop/v1', 'getBankingOptions', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getBankingOptions'), 
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
     * POST product update by owner
     * params: id, values
     */
    register_rest_route( 'foodcoop/v1', 'postProductUpdateByOwner', array(
      'methods' => 'POST',
      'callback' => array($this, 'postProductUpdateByOwner'), 
      'permission_callback' => function() {
        return true;
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
     * GET orders of Bestellrunde
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
     * GET all orders
     */
    register_rest_route( 'foodcoop/v1', 'getAllOrders', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getAllOrders'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET productQRPDF
     * params: product sku
     */
    register_rest_route( 'foodcoop/v1', 'productQRPDF', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'productQRPDF'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET allProductsQRPDF
     */
    register_rest_route( 'foodcoop/v1', 'allProductsQRPDF', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'allProductsQRPDF'), 
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
     * GET getCategoryListPDF
     * params: bestellrunde
     */
    register_rest_route( 'foodcoop/v1', 'getCategoryListPDF', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getCategoryListPDF'), 
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
     * POST save products for self checkout
     * params: products
     */
    register_rest_route( 'foodcoop/v1', 'postSaveProductsSelfCheckout', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSaveProductsSelfCheckout'), 
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
     * GET user
     */
    register_rest_route( 'foodcoop/v1', 'getUser', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getUser'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST set user permissions
     * params: id, role, permissions
     */
    register_rest_route( 'foodcoop/v1', 'setUserPermissions', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'setUserPermissions'), 
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
     * POST update user
     * params: id, option, value
     */
    register_rest_route( 'foodcoop/v1', 'postUpdateUser', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postUpdateUser'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET MY Transactions
     */
    register_rest_route( 'foodcoop/v1', 'getMyTransactions', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getMyTransactions'), 
      'permission_callback' => function() {
        return true;
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
     * GET all Transactions
     */
    register_rest_route( 'foodcoop/v1', 'getAllTransactions', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getAllTransactions'), 
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
    register_rest_route( 'foodcoop/v1', 'getActiveBestellrunden', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getActiveBestellrunden'), 
      'permission_callback' => function() {
        return true;
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
     * GET Dashboard Data
     */
    register_rest_route( 'foodcoop/v1', 'getProductListInActive', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getProductListInActive'), 
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

    /**
     * GET Expenses Data
     */
    register_rest_route( 'foodcoop/v1', 'getExpenses', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getExpenses'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST create expense
     * params: user id, date, type, amount, note
     */
    register_rest_route( 'foodcoop/v1', 'postCreateExpense', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postCreateExpense'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET all pages
     */
    register_rest_route( 'foodcoop/v1', 'getPages', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getPages'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET all pages
     */
    register_rest_route( 'foodcoop/v1', 'getProduct', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getProduct'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST add to cart (self checkout)
     * params: cart object from self checkout
     */
    register_rest_route( 'foodcoop/v1', 'addToCart', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'addToCart'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST instant top up for wallet credit
     * params: amount, user_id
     */
    register_rest_route( 'foodcoop/v1', 'instantTopup', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'instantTopup'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST request payout of credit
     * params: amount, user_id
     */
    register_rest_route( 'foodcoop/v1', 'payout', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'payout'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST email notification for bestellrunden
     * params: orders
     */
    register_rest_route( 'foodcoop/v1', 'emailNotificationBestellrunden', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'emailNotificationBestellrunden'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST email notification for bestellrunden test
     * params: orders
     */
    register_rest_route( 'foodcoop/v1', 'emailNotificationBestellrundenTest', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'emailNotificationBestellrundenTest'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET getProductCategories
     */
    register_rest_route( 'foodcoop/v1', 'getProductCategories', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getProductCategories'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST Category update
     * params: id, values
     */
    register_rest_route( 'foodcoop/v1', 'postCategoryUpdate', array(
      'methods' => 'POST',
      'callback' => array($this, 'postCategoryUpdate'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST Category delete
     * params: id
     */
    register_rest_route( 'foodcoop/v1', 'postCategoryDelete', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postCategoryDelete'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST add category
     * params: name
     */
    register_rest_route( 'foodcoop/v1', 'postAddCategory', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postAddCategory'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET getSuppliers
     */
    register_rest_route( 'foodcoop/v1', 'getSuppliers', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getSuppliers'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST Supplier update
     * params: id, values
     */
    register_rest_route( 'foodcoop/v1', 'postSupplierUpdate', array(
      'methods' => 'POST',
      'callback' => array($this, 'postSupplierUpdate'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST Supplier delete
     * params: id
     */
    register_rest_route( 'foodcoop/v1', 'postSupplierDelete', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSupplierDelete'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST add supplier
     * params: name
     */
    register_rest_route( 'foodcoop/v1', 'postAddSupplier', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postAddSupplier'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET getProducers
     */
    register_rest_route( 'foodcoop/v1', 'getProducers', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getProducers'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST Producer update
     * params: id, values
     */
    register_rest_route( 'foodcoop/v1', 'postProducerUpdate', array(
      'methods' => 'POST',
      'callback' => array($this, 'postProducerUpdate'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST Producer delete
     * params: id
     */
    register_rest_route( 'foodcoop/v1', 'postProducerDelete', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postProducerDelete'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST add producer
     * params: name
     */
    register_rest_route( 'foodcoop/v1', 'postAddProducer', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postAddProducer'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET product details
     * params: product_id
     */
    register_rest_route( 'foodcoop/v1', 'getProductDetails', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getProductDetails'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST save inventory
     * params: products
     */
    register_rest_route( 'foodcoop/v1', 'postSaveInventory', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSaveInventory'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST save delivery
     * params: products
     */
    register_rest_route( 'foodcoop/v1', 'postSaveDelivery', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSaveDelivery'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST save delivery by owner
     * params: amount, user_id
     */
    register_rest_route( 'foodcoop/v1', 'postSaveDeliveryByOwner', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSaveDeliveryByOwner'), 
      'permission_callback' => function() {
        return true;
      }
    ));
    

    /**
     * GET Product List for Overview
     */
    register_rest_route( 'foodcoop/v1', 'getProductListOverview', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'getProductListOverview'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * GET available payment Gateways
     */
    register_rest_route( 'foodcoop/v1', 'getPaymentGateways', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getPaymentGateways'), 
      'permission_callback' => function() {
        return true;
      }
    ));

    /**
     * POST create POS order
     * params: cart, user, payment_gateway
     */
    register_rest_route( 'foodcoop/v1', 'postCreatePOSorder', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postCreatePOSorder'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * POST update product owner
     * params: user_id, product_id
     */
    register_rest_route( 'foodcoop/v1', 'postSaveProductOwner', array(
      'methods' => WP_REST_SERVER::CREATABLE,
      'callback' => array($this, 'postSaveProductOwner'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
      }
    ));

    /**
     * GET product owner
     * params: product_id
     */
    register_rest_route( 'foodcoop/v1', 'getProductOwner', array(
      'methods' => WP_REST_SERVER::READABLE,
      'callback' => array($this, 'getProductOwner'), 
      'permission_callback' => function() {
        return current_user_can( 'edit_others_posts' );
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

    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false
    ) );
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
        "category_id" => $product->get_category_ids()[0],
        "short_description" => $product->get_short_description(),
        "image" => wp_get_attachment_url( $product->get_image_id(), 'thumbnail'),
        "description" => $product->get_description(),
        "stock" => $product->get_stock_quantity(),
        "stock_status" => $product->get_stock_status(),
        "tax" => $product->get_tax_class(),
        "owner" => $product->get_meta('fc_owner')
      );
    
      // product meta data
      $the_meta = $product->get_meta_data();
      foreach($the_meta as $meta) {
        $data = $meta->get_data();
        $the_product[$data['key']] = $data['value'];
      }
  
      // product category (only the first one!)
      $the_product['category_name'] = $cats[$product->get_category_ids()[0]];

      // product sku (for self-checkout)
      $the_product['sku'] = $product->get_sku();

      if ($the_product['sku'] != "fcplugin_instant_topup_product" && $the_product['sku'] != 'fcplugin_pos_product') {
        array_push($products, $the_product);
      }
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
   * getBankingOptions
   */
  function getBankingOptions() {
    $fc_bank = get_option('fc_bank');
    $woocommerce_store_address = get_option('woocommerce_store_address');
    $woocommerce_store_city = get_option('woocommerce_store_city');
    $woocommerce_store_postcode = get_option('woocommerce_store_postcode');
    $blogname = get_option('blogname');
    $instantTopup = get_option('fc_instant_topup');

    $id = get_current_user_id();
    $name = get_user_meta($id, 'billing_first_name', true)." ".get_user_meta($id, 'billing_last_name', true);
    $address = get_user_meta($id, 'billing_address_1', true);
    $postcode = get_user_meta($id, 'billing_postcode', true);
    $city = get_user_meta($id, 'billing_city', true);

    // get balance of user
    global $wpdb;
    $balance = '0.00';

    if ($id) {
      $results = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $id)
      );
      foreach ( $results as $result ) {
        $balance = $result->balance;
      }
    }

    $currency = get_woocommerce_currency_symbol();

    return json_encode(array($fc_bank, $woocommerce_store_address, $woocommerce_store_city, $woocommerce_store_postcode, $blogname, $name, $address, $postcode, $city, $instantTopup, $balance, $currency));
  }

  /**
   * getAllOptions
   */
  function getAllOptions() {
    $all_options = array();

    $options = wp_load_alloptions();
    foreach ($options as $slug => $values) {
        $all_options[$slug] = $values;
    }

    return json_encode($all_options);
  }

  /**
   * saveAllOptions
   */
  function saveAllOptions($data) {

    $fee = $data['fee'];
    if($fee) update_option('fc_fee', $fee);

    $margin = $data['margin'];
    if($margin) update_option('fc_margin', $margin);

    $bank = $data['bank'];
    if($bank) update_option('fc_bank', $bank);
    
    $transfer = $data['transfer'];
    if($transfer) update_option('fc_transfer', $transfer);
    
    $address = $data['address'];
    if($address) update_option('woocommerce_store_address', $address);
    
    $plz = $data['plz'];
    if($plz) update_option('woocommerce_store_postcode', $plz);
    
    $city = $data['city'];
    if($city) update_option('woocommerce_store_city', $city);
    
    $blogname = $data['blogname'];
    if($blogname) update_option('blogname', $blogname);
    
    $orderPage = $data['orderPage'];
    if($orderPage) update_option('fc_order_page', $orderPage);
    
    $publicPrices = $data['publicPrices'];
    $publicPrices == true ? update_option('fc_public_prices', '1') : update_option('fc_public_prices', '0');
    
    $publicMembers = $data['publicMembers'];
    $publicMembers == true  ? update_option('fc_public_members', '1') : update_option('fc_public_members', '0');
    
    $instantTopup = $data['instantTopup'];
    $instantTopup == true  ? update_option('fc_instant_topup', '1') : update_option('fc_instant_topup', '0');
    
    $publicProducts = $data['publicProducts'];
    $publicProducts == true  ? update_option('fc_public_products', '1') : update_option('fc_public_products', '0');
    
    $adminEmail = $data['adminEmail'];
    if($adminEmail) update_option('admin_email', $adminEmail);
    if($adminEmail) update_option('new_admin_email', $adminEmail);

    $enableStock = $data['enableStock'];
    $products = wc_get_products( array(
      'limit' => -1,
      'return' => 'ids',
    ));

    if ($enableStock == true) {
      update_option('woocommerce_manage_stock', 'yes');
      update_option('woocommerce_notify_no_stock_amount', 0);

      $instant_topup_product = wc_get_product_id_by_sku( "fcplugin_instant_topup_product" );
      foreach($products as $product_id) {
        if ($product_id !== $instant_topup_product) {
          update_post_meta($product_id, "_manage_stock", 'yes');
          if (get_post_meta( $product_id, "_stock", true ) == null) {
            update_post_meta($product_id, "_stock", 0);
          }
        }
      }
    } else {
      update_option('woocommerce_manage_stock', 'no');
      foreach($products as $product_id) {
        update_post_meta($product_id, "_manage_stock", 'no');
        update_post_meta($product_id, "_stock_status", 'instock');
      }
    }

    $enableSelfCheckout = $data['enableSelfCheckout'];
    update_option('fc_self_checkout', $enableSelfCheckout);

    $taxes = $data['taxes'];
    if($taxes) {
      update_option('fc_taxes', '1');
      update_option('woocommerce_calc_taxes','yes');
      update_option('woocommerce_prices_include_tax','no');
      update_option('woocommerce_tax_display_shop','excl');
      update_option('woocommerce_tax_display_cart','excl');
    } else {
      update_option('fc_taxes', '0');
      update_option('woocommerce_calc_taxes','no');
      update_option('woocommerce_prices_include_tax','no');
      update_option('woocommerce_tax_display_shop','excl');
      update_option('woocommerce_tax_display_cart','excl');
    }


    return http_response_code(200);
  }

  /**
   * postProductUpdate
   */
  function postProductUpdate($data) {

    $product = wc_get_product($data['id']);
    $product->set_name($data['updatedValues']['name']);
    $product->set_regular_price($data['updatedValues']['price']);
    $product->update_meta_data('_lieferant', $data['updatedValues']['supplier']);
    $product->update_meta_data('_produzent', $data['updatedValues']['producer']);
    $product->update_meta_data('_herkunft', $data['updatedValues']['origin']);
    $product->update_meta_data('_gebinde', $data['updatedValues']['lot']);
    $product->update_meta_data('_einheit', $data['updatedValues']['unit']);
    $product->update_meta_data('_sku', $data['updatedValues']['sku']);
    $product->save();
    return json_encode($data['updatedValues']['name']);

  }

  /**
   * postProductUpdateByOwner
   */
  function postProductUpdateByOwner($data) {

    if (get_current_user_id() == $data['user_id']) {
      $product = wc_get_product($data['id']);
      $product->set_name($data['updatedValues']['name']);
      $product->set_regular_price($data['updatedValues']['price']);
      $product->update_meta_data('_lieferant', $data['updatedValues']['supplier']);
      $product->update_meta_data('_produzent', $data['updatedValues']['producer']);
      $product->update_meta_data('_herkunft', $data['updatedValues']['origin']);
      $product->update_meta_data('_gebinde', $data['updatedValues']['lot']);
      $product->update_meta_data('_einheit', $data['updatedValues']['unit']);
      $product->update_meta_data('_sku', $data['updatedValues']['sku']);
      $product->set_description($data['updatedValues']['description']);
      $product->set_short_description($data['updatedValues']['short_description']);
      $product->set_stock_quantity(floatval($data['updatedValues']['stock']));

      // update category
      $product_categories = get_terms( array(
        'taxonomy' => 'product_cat',
        'hide_empty' => false
      ));    
      $categories = array();
      foreach( $product_categories as $category ) {
        $categories[$category->name] = $category->term_id;
      }
      $newCategory = $categories[$data['updatedValues']['category_id']];
      $product->set_category_ids(array($newCategory));

      // save and return
      $product->save();

      // inform the admin about the change
      $headers[] = 'From: '. get_option('admin_email');
      $headers[] = 'Reply-To: ' . get_option('admin_email');
      $headers[] = 'Content-Type: text/html; charset=UTF-8';

      $subj = __('Neue Änderung durch Produktverwaltung an Produkt', 'fcplugin') . " " . $data['updatedValues']['name'] . "!";

      $msg = '
        <table border="0" cellpadding="0" cellspacing="0" class="list_block block-4" id="list-r1c0m3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
          <tr>
            <td class="pad" style="padding-bottom:10px;padding-left:35px;padding-right:35px;padding-top:10px;">
            <div class="levelOne" style="margin-left: 0;">
              <ul class="leftList" start="1" style="margin-top: 0; margin-bottom: 0; padding: 0; padding-left: 20px; font-weight: 400; text-align: left; color: #000; direction: ltr; font-family: Roboto,Tahoma,Verdana,Segoe,sans-serif; font-size: 16px; letter-spacing: 0; line-height: 180%; mso-line-height-alt: 28.8px; list-style-type: disc;">
                <li style="margin-bottom: 0; text-align: left;">Name: '.$data['updatedValues']['name'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Preis: '.$data['updatedValues']['price'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Lieferant: '.$data['updatedValues']['supplier'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Produzent: '.$data['updatedValues']['producer'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Herkunft: '.$data['updatedValues']['origin'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Gebinde: '.$data['updatedValues']['lot'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Einheit: '.$data['updatedValues']['unit'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Artikelnummer: '.$data['updatedValues']['sku'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Beschreibung:<br />'.$data['updatedValues']['description'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Details: '.$data['updatedValues']['short_description'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Lagerbestand: '.$data['updatedValues']['stock'].'</li>
                <li style="margin-bottom: 0; text-align: left;">Kategorie: '.$data['updatedValues']['category_id'].'</li>
              </ul>
            </div>
            </td>
          </tr>
        </table>
      ';

      $send = wp_mail( get_option('admin_email'), $subj, $msg, $headers, '' );

      return http_response_code(200);
    } else {
      return http_response_code(401);
    }
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
        "bestellrunde_bild" => get_the_post_thumbnail_url( $b->ID )
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
    add_post_meta( $id, 'bestellrunde_name', $data['bestellrunde_name'], true );

    if ($data['bestellrunde_bild']) {

      // upload image
      $image_url        = $data['bestellrunde_bild'];
      $ext              = pathinfo($data['bestellrunde_bild'], PATHINFO_EXTENSION);
      $image_name       = $id.".".$ext;
      $upload_dir       = wp_upload_dir();
      $image_data       = file_get_contents($image_url);
      $unique_file_name = wp_unique_filename( $upload_dir['path'], $image_name );
      $filename         = basename( $unique_file_name );

      if( wp_mkdir_p( $upload_dir['path'] ) ) {
        $file = $upload_dir['path'] . '/' . $filename;
      } else {
        $file = $upload_dir['basedir'] . '/' . $filename;
      }

      file_put_contents( $file, $image_data );
      $wp_filetype = wp_check_filetype( $filename, null );

      // create post attachment for thumbnail
      $attachment = array(
        'post_mime_type' => $wp_filetype['type'],
        'post_title'     => sanitize_file_name( $filename ),
        'post_content'   => '',
        'post_status'    => 'inherit'
      );
      $attach_id = wp_insert_attachment( $attachment, $file, $id );
      require_once(ABSPATH . 'wp-admin/includes/image.php');
      $attach_data = wp_generate_attachment_metadata( $attach_id, $file );
      wp_update_attachment_metadata( $attach_id, $attach_data );
      set_post_thumbnail( $id, $attach_id );

    }



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
    update_post_meta( $id, 'bestellrunde_name', $data['bestellrunde_name'] );

    if ($data['bestellrunde_bild']) {

      // upload image
      $image_url        = $data['bestellrunde_bild'];
      $ext              = pathinfo($data['bestellrunde_bild'], PATHINFO_EXTENSION);
      $image_name       = $id.".".$ext;
      $upload_dir       = wp_upload_dir();
      $image_data       = file_get_contents($image_url);
      $unique_file_name = wp_unique_filename( $upload_dir['path'], $image_name );
      $filename         = basename( $unique_file_name );

      if( wp_mkdir_p( $upload_dir['path'] ) ) {
        $file = $upload_dir['path'] . '/' . $filename;
      } else {
        $file = $upload_dir['basedir'] . '/' . $filename;
      }

      file_put_contents( $file, $image_data );
      $wp_filetype = wp_check_filetype( $filename, null );

      // create post attachment for thumbnail
      $attachment = array(
        'post_mime_type' => $wp_filetype['type'],
        'post_title'     => sanitize_file_name( $filename ),
        'post_content'   => '',
        'post_status'    => 'inherit'
      );
      $attach_id = wp_insert_attachment( $attachment, $file, $id );
      require_once(ABSPATH . 'wp-admin/includes/image.php');
      $attach_data = wp_generate_attachment_metadata( $attach_id, $file );
      wp_update_attachment_metadata( $attach_id, $attach_data );
      set_post_thumbnail( $id, $attach_id );

    }

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
      'status'        => array('completed', 'processing', 'on-hold', 'refunded'),
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
        "customer_email" => $o->get_billing_email()
      );

      $line_items = array();
      foreach ( $o->get_items() as $item_id => $item ) {
        $the_line_item = array();
        $the_line_item['item_id'] = $item_id;
        $the_line_item['product_id'] = $item->get_product_id();
        $the_line_item['variation_id'] = $item->get_variation_id();
        $the_line_item['product'] = $item->get_product(); 
        $the_line_item['product_name'] = $item->get_name();
        
        // sku:
        if ($item->get_product()) {
          $the_line_item['product_sku'] = $item->get_product()->get_sku();
        }

        $item_total_quantity = $item->get_quantity(); 
        $item_quantity_refunded = $o->get_qty_refunded_for_item( $item_id );
        $item_final_quantity = $item_total_quantity + $item_quantity_refunded; 
        $the_line_item['quantity'] = $item_final_quantity;

        $the_line_item['subtotal'] = $item->get_subtotal();
        $the_line_item['total'] = $item->get_total();
        $the_line_item['tax'] = $item->get_subtotal_tax();
        $the_line_item['tax_class'] = $item->get_tax_class();
        $the_line_item['tax_status'] = $item->get_tax_status();
        $the_line_item['allmeta'] = $item->get_meta_data();
        array_push($line_items, $the_line_item);
      }
      $the_order['line_items'] = $line_items;
      
      array_push($order_data, $the_order);
    }

    return json_encode($order_data);
  }

  /**
   * getAllOrders
   */
  function getAllOrders($data) {

    if ($data['year']) {
      $orders = wc_get_orders(array(
        'type' => 'shop_order',
        'limit' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
        'date_created' => $data['year'].'-01-01...'.$data['year'].'-12-31',
        'status' => array('wc-completed', 'wc-processing', 'wc-on-hold', 'wc-refunded'),
      ));
    } else {
      $orders = wc_get_orders(array(
        'type' => 'shop_order',
        'limit' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
        'status' => array('wc-completed', 'wc-processing', 'wc-on-hold', 'wc-refunded'),
      ));
    }

    $order_data = array();
    foreach($orders as $order) {
      array_push($order_data, $order->get_data());
    }
  

    return json_encode($order_data);
  }

  /**
   * productQRPDF
   */
  function productQRPDF($data) {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-product-qr-pdf.php');
    return base64_encode($pdf);
  }

  /**
   * allProductsQRPDF
   */
  function allProductsQRPDF() {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-all-products-qr-pdf.php');
    return base64_encode($pdf);
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
   * getCategoryListPDF
   */
  function getCategoryListPDF($data) {
    require_once(plugin_dir_path( __FILE__ ) . 'rest_functions/get-categorylist-pdf.php');
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
      'status'        => array('completed', 'processing', 'on-hold', 'refunded'),
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
   * postSaveProductsSelfCheckout
   */
  function postSaveProductsSelfCheckout($data) {
    $update = update_option( 'fc_self_checkout_products', $data['products'] );
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

    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false
    ) );    
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

      if ($product->get_sku() != 'fcplugin_instant_topup_product' && $product->get_sku() != 'fcplugin_pos_product') {
        array_push($products, $the_product);
      }
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
      'status'        => array('completed', 'processing', 'on-hold', 'refunded'),
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
            $total = $order_item['qty'] * $order_item['price'];
            if ($order_item['qty'] > 0) {
              array_push($orders_array,[$order_item['order_id'],$order_item['username'],$order_item['qty'],$total]);
            }
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
      return json_encode( array($refund_amount, $res, $order_id) );           
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
    // update product featured image
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');

    $products = json_decode($data['products']);

    // get product categories
    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false
    ) );
    $categories = array();
    foreach( $product_categories as $category ) {
      $categories[$category->name] = $category->term_id;
    } 

    // count changes
    $changed_products = 0;
    $new_products = 0;
    $deleted_products = -1;

    // product id's to delete are not included in updated_product_ids array
    $all_products_before_import = wc_get_products( array( 'return' => 'ids', 'limit' => -1 ) );
    $updated_product_ids = array();

    foreach($products as $product) {
      // get product id and check if product exists already
      $id = $product[7];
      $check_if_product_exists = is_a(wc_get_product($id), 'WC_Product');

      //
      // if the product exists, update product
      //
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
                  '_lieferant'  => sanitize_text_field($product[12]),
                  '_herkunft'   => sanitize_text_field($product[5]),
                  '_produzent'   => sanitize_text_field($product[4]),
                )
        );
        wp_update_post( $data );

        // update product price
        $p = wc_get_product($id);
        $p->set_regular_price(floatval($product[1]));

        // update product short_description
        $p->set_short_description( $product[8] );

        // update product description
        $p->set_description( $product[10] );

        // update product sku
        $p->set_sku(sanitize_text_field($product[11]));

        // update product tax class
        $p->set_tax_class(sanitize_text_field($product[13]));

        if ($product[9] != "") {
          // check if current image is the same as imported one
          $current_attachment = wp_get_attachment_url( get_post_thumbnail_id( $id ), 'thumbnail');
          if ($current_attachment) {
            if ($current_attachment != $product[9]) {
              // delete current featured image
              $attachmentid = get_post_thumbnail_id( $id );
              wp_delete_attachment( $attachmentid, true );

              $image = media_sideload_image( $product[9], $id, $title, 'id' );
              set_post_thumbnail( $id, $image );
            }
          }
        } else {
          // delete current featured image
          $attachmentid = get_post_thumbnail_id( $id );
          wp_delete_attachment( $attachmentid, true );
          set_post_thumbnail( $id, '' );
        }

        // save the product
        $p->save();

        // update product category
        wp_set_object_terms( $id, intval($categories[$product[6]]), 'product_cat' );

        $changed_products++;
      } 
      //
      // if product does not exists, create new product
      //
      else {
        // sanitize special chars
        $title = str_replace("&","+",$product[0]);
        $title = str_replace("<","",$title);
        $title = str_replace(">","",$title);

        $data = array(
          'post_type'           => 'product',
          'post_status'         => 'publish',
          'post_title'          => sanitize_text_field($title),
          'meta_input'          => array(
                                      '_einheit'    => sanitize_text_field($product[2]),
                                      '_gebinde'    => sanitize_text_field($product[3]),
                                      '_lieferant'  => sanitize_text_field($product[12]),
                                      '_herkunft'   => sanitize_text_field($product[5]),
                                      '_produzent'   => sanitize_text_field($product[4]),
                                    ),
          'post_excerpt' => $product[8],
          'post_content' => $product[10],
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
        update_post_meta($post_id, '_sku', sanitize_text_field($product[11]));

        // update product category
        wp_set_object_terms( $post_id, intval($categories[$product[6]]), 'product_cat' );
        wp_set_object_terms( $post_id, 'simple', 'product_type' );

        // update product featured image
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        if ($product[9] != "") {
          // delete current featured image
          $attachmentid = get_post_thumbnail_id( $post_id );
          wp_delete_attachment( $attachmentid, true );

          $image = media_sideload_image( $product[9], $post_id, $title, 'id' );
          set_post_thumbnail( $post_id, $image );
        } else {
          // delete current featured image
          $attachmentid = get_post_thumbnail_id( $id );
          wp_delete_attachment( $attachmentid, true );
          set_post_thumbnail( $post_id, '' );
        }

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
   * getUsers
   */

  function getUsers() {
    $users = get_users();

    $userData = array();
    foreach ($users as $user) {
      $the_user = array();

      $id = $user->ID;
      $name = get_user_meta($id, 'billing_first_name', true)." ".get_user_meta($id, 'billing_last_name', true);
      $email = $user->data->user_email;
      $role = implode($user->roles);
      $address = get_user_meta($id, 'billing_address_1', true);
      $postcode = get_user_meta($id, 'billing_postcode', true);
      $city = get_user_meta($id, 'billing_city', true);
      $permission = get_user_meta($id, 'fc_admin_permission', true);

      // get balance and membership fees
      global $wpdb;
      $results = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $id)
      );

      $balance = '0.00';
      foreach ( $results as $result )
      {
        $balance = $result->balance;
      }

      $fees = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC", $id)
      );
      $membership_fees = array();
      $last_fee = null;
      foreach ( $fees as $fee )
      {
        if ($fee->type == 'yearly_fee') {
          array_push($membership_fees, $fee); 

          if ($last_fee == null) {
            $last_fee = $fee->date;
          }         
        }
      }


      $the_user['name'] = $name;
      $the_user['id'] = $id;
      $the_user['email'] = $email;
      $the_user['address'] = $address;
      $the_user['balance'] = $balance;
      $the_user['role'] = $role;
      $the_user['postcode'] = $postcode;
      $the_user['city'] = $city;
      $the_user['active'] = $membership_fees;
      $the_user['last_fee'] = $last_fee;
      $the_user['permission'] = $permission;

      array_push($userData, $the_user);
    }

    return json_encode($userData);
  }

  


  /**
   * getUser
   */

  function getUser($data) {
    $user = get_user_by("id", $data['id']);
    $permission = get_user_meta($data['id'], 'fc_admin_permission', true);
    $role = implode($user->roles);

    return json_encode(array("role" => $role, "permissions" => $permission));
  }

  


  /**
   * setUserPermissions
   */

  function setUserPermissions($data) {
    update_user_meta($data['id'], 'fc_admin_permission', json_encode($data['permissions']));
    
    $user = new WP_User($data['id']);

    if ($data['role'] == 'customer') {
      $user->set_role( 'customer' );
    }

    if ($data['role'] == 'foodcoop_manager') {
      $user->set_role( 'foodcoop_manager' );
    }

    return json_encode($data['id']);
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

    // password generator
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$!?';
    $password = '';
    for ($i = 0; $i < 8; $i++) {
        $index = rand(0, strlen($characters) - 1);
        $password .= $characters[$index];
    }


    $userdata = array(
      'user_pass'				=> $password,
      'user_login' 			=> $email,
      'user_email' 			=> $email,
      'first_name' 			=> $firstName,
      'last_name' 			=> $lastName,
      'role' 					=> 'customer'
    );

    $user_id = wp_insert_user( $userdata ) ;

    if ( ! is_wp_error( $user_id ) ) {
      update_user_meta( $user_id, "billing_first_name", $firstName );
      update_user_meta( $user_id, "billing_last_name", $lastName );
      update_user_meta( $user_id, "billing_email", $email );
      
      // Email notification to user and admin
      $headers[] = 'From: '. get_option('admin_email');
      $headers[] = 'Reply-To: ' . get_option('admin_email');
      $headers[] = 'Content-Type: text/html; charset=UTF-8';

      $subj_user = __('Willkommen bei', 'fcplugin') . " " . get_option('blogname') . ". " . __('Dein Account wurde erstellt.', 'fcplugin');

      ob_start();
      $incl_header = include(__DIR__ . '/email/header-new-user.php');
      $msg_header = ob_get_contents();
      ob_end_clean();


      $msg_content = '
        <table border="0" cellpadding="0" cellspacing="0" class="list_block block-4" id="list-r1c0m3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
        <tr>
        <td class="pad" style="padding-bottom:10px;padding-left:35px;padding-right:35px;padding-top:10px;">
        <div class="levelOne" style="margin-left: 0;">
        <ul class="leftList" start="1" style="margin-top: 0; margin-bottom: 0; padding: 0; padding-left: 20px; font-weight: 400; text-align: left; color: #000; direction: ltr; font-family: Roboto,Tahoma,Verdana,Segoe,sans-serif; font-size: 16px; letter-spacing: 0; line-height: 180%; mso-line-height-alt: 28.8px; list-style-type: disc;">
        <li style="margin-bottom: 0; text-align: left;">Benutzername: '.$email.'</li>
        <li style="margin-bottom: 0; text-align: left;">Passwort: '.$password.'</li>
        </ul>
        </div>
        </td>
        </tr>
        </table>
      ';

      ob_start();
      $incl_header = include(__DIR__ . '/email/footer-new-user.php');
      $msg_footer = ob_get_contents();
      ob_end_clean();

      $msg = $msg_header.$msg_content.$msg_footer;

      $send_user = wp_mail( $email, $subj_user, $msg, $headers, '' );

      if ($send_user) {
        return array($firstName." ".$lastName, $user_id);
      } else {
        return 'error_email';
      }
    } else {
      return 'error';
    }
    
  }

  
  /**
   * postUpdateUser
   */
  function postUpdateUser($data) {
    $id = esc_attr($data['id']);
    $cell = esc_attr($data['cell']);
    $value = esc_attr($data['value']);

    switch ($cell) {
      case 'name':
        $firstname = explode(" ", $value, 2)[0];
        $lastname = explode(" ", $value, 2)[1];
        $result1 = update_user_meta( $id, 'first_name', $firstname );
        $result2 = update_user_meta( $id, 'billing_first_name', $firstname );
        $result3 = update_user_meta( $id, 'last_name', $lastname );
        $result4 = update_user_meta( $id, 'billing_last_name', $lastname );
        return([$result1, $result2, $result3, $result4]);
        break;
      case 'email':
        global $wpdb;
        $result1 = update_user_meta( $id, 'billing_email', $value );
        $result2 = $wpdb->update(
            $wpdb->users, 
              ['ID'            =>  $id],
              ['user_login'    =>  $value]
            
        );
        $result3 = wp_update_user(array(
          'ID'          => $id,
          'user_email'  => $value
        ));
        return([$result1, $result2, $result3]);
        break;
      case 'address':
        $result = update_user_meta( $id, 'billing_address_1', $value );
        return([$result]);
        break;
      case 'postcode':
        $result = update_user_meta( $id, 'billing_postcode', $value );
        return([$result]);
        break;
      case 'city':
        $result = update_user_meta( $id, 'billing_city', $value );
        return([$result]);
        break;
    } 
  }

  
  /**
   * getMyTransactions
   */
  function getMyTransactions() {
    global $wpdb;
    $id = get_current_user_id();
    if ($id) {
      $transactions = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC", $id)
      );
    }
    
    $transactions_fixed = array();
    foreach($transactions as $transaction) {
      $the_transaction = $transaction;
      array_push($transactions_fixed, $the_transaction);
    }
    
    return json_encode($transactions_fixed);
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
      array_push($transactions_fixed, $the_transaction);
    }
    return json_encode($transactions_fixed);
  }



  /**
   * getAllTransactions
   */
  function getAllTransactions($data) {
    global $wpdb;
    $transactions = $wpdb->get_results(
      $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` ORDER BY `id` DESC")
    );
    
    $transactions_fixed = array();
    foreach($transactions as $transaction) {
      $the_transaction = $transaction;

      $id = intval($the_transaction->created_by);
      $name = get_user_meta($id, 'billing_first_name', true)." ".get_user_meta($id, 'billing_last_name', true);
      $the_transaction->created_by = $name;

      $user_id = intval($the_transaction->user_id);
      $user_name = get_user_meta($user_id, 'billing_first_name', true)." ".get_user_meta($user_id, 'billing_last_name', true);
      $the_transaction->user_name = $user_name;

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
    $created_by = get_user_meta($data['created_by'], 'billing_first_name', true)." ".get_user_meta($data['created_by'], 'billing_last_name', true);
    $type = $data['type'];

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

    $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance, 'type' => $type);

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

    $wpdb->insert($table, $data);
    $transaction_id = $wpdb->insert_id;
    

    $name = get_user_meta($user_id, 'billing_first_name', true)." ".get_user_meta($user_id, 'billing_last_name', true);
    return json_encode(array($new_balance, $name, $transaction_id, $amount, $details, $created_by, $type));

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

    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false
    ) );

    $bestellrunden = get_posts(array(
      'numberposts' => -1,
      'post_type'   => 'bestellrunden',
      'meta_key' => 'bestellrunde_start',
      'orderby' => 'meta_value',
    ));

    $orders = wc_get_orders(array(
      'status'        => array('completed', 'processing', 'on-hold', 'refunded'),
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
  * getActiveBestellrunden
  */
  function getActiveBestellrunden($data) { 
    // check if bestellrunde is active and if yes, set the id
    $bestellrunden = get_posts(array(
      'numberposts' => -1,
      'post_type'   => 'bestellrunden',
      'meta_key' => 'bestellrunde_start',
      'orderby' => 'meta_value',
    ));

    $active_bestellrunden = array();
    $active_bestellrunden_ids = array();
    
    foreach ($bestellrunden as $b) {
      $bestellrunde = array();

      $id = $b->ID;
      $start = get_post_meta( $id, 'bestellrunde_start', true );
      $end = get_post_meta( $id, 'bestellrunde_ende', true );
      $dist = get_post_meta( $id, 'bestellrunde_verteiltag', true );
      $name = get_post_meta( $id, 'bestellrunde_name', true );
      $img = get_the_post_thumbnail_url( $id );

      // determine if bestellrunde is currently active
      $now = date('Y-m-d');
      if ($start <= $now AND $end >= $now) {
        $bestellrunde['id'] = $id;
        $bestellrunde['name'] = $name;
        $bestellrunde['img'] = $img;
        $bestellrunde['start'] = $start;
        $bestellrunde['end'] = $end;
        $bestellrunde['dist'] = $dist;
        array_push($active_bestellrunden, $bestellrunde);
        array_push($active_bestellrunden_ids, $bestellrunde['id']);
      }
    }

    // get orders of this user if they exist
    $customer = new WC_Customer(intval($post_data['user']));
    $query = new WC_Order_Query( array(
      'limit' => 10,
      'orderby' => 'date',
      'order' => 'DESC',
      'return' => 'ids',
      'customer' => intval($customer),
    ));
    $order_ids = $query->get_orders();
    $orders = array();
    foreach($order_ids as $order_id) {
      $this_order = wc_get_order($order_id)->get_data();
      $meta_data = $this_order['meta_data'];
      foreach($meta_data as $meta) {
        if ($meta->key = 'bestellrunde_id') {
          if (in_array($meta->value, $active_bestellrunden_ids)) {
            array_push($orders, intval($meta->value));
          }
        }
      }
    }

    return (wp_json_encode([$active_bestellrunden, $orders]));
  }




  /**
  * getProductList
  */
  function getProductList($post_data) { 
    $bestellrunde = $post_data['bestellrunde'];
    $bestellrunde_dates = array();
    $start = get_post_meta( $bestellrunde, 'bestellrunde_start', true );
    $end = get_post_meta( $bestellrunde, 'bestellrunde_ende', true );
    $dist = get_post_meta( $bestellrunde, 'bestellrunde_verteiltag', true );
    array_push($bestellrunde_dates, $start, $end, $dist);
    $active = true;

    // get product ids of active bestellrunde
    $bestellrunde_products = array();
    if($active) {
      $bestellrunde_products = json_decode(get_post_meta($bestellrunde, 'bestellrunde_products', true));
    }

    // get all categories
    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false
    ) );    
    $categories = array();
    $cats = array();
    foreach( $product_categories as $category ) {
      array_push($categories, $category->name);
      $cats[$category->term_id] = $category->name;
    } 

    // get order of this user and in this bestellrunde, if it exists
    $order = null;
    $customer = new WC_Customer(intval($post_data['user']));

    $query = new WC_Order_Query( array(
      'limit' => 20,
      'orderby' => 'date',
      'order' => 'DESC',
      'return' => 'ids',
    ));
    $query->set( 'customer', intval($customer->ID) );
    $order_ids = $query->get_orders();
    $order = null;
    $current_order = null;
    foreach($order_ids as $order_id) {
      $this_order = wc_get_order($order_id);
      $order_bestellrunde = intval($this_order->get_meta('bestellrunde_id'));

      if ($order_bestellrunde == intval($bestellrunde)) {
        $order = $this_order->get_data();
        $current_order = $this_order;
      }
    }

    // get all products
    $p = wc_get_products(array(
      'status'            => array( 'publish' ),
      'limit'             => -1,
      'page'              => 1,
      'return'            => 'objects',
      'paginate'          => false,
      'orderby'           => 'title',
      'order'             => 'ASC'
    ));

    $products = array();
    foreach ($p as $product) {
      // product name
      $the_product = array(
        "id" => $product->get_id(),
        "name" => $product->get_name(),
        "price" => $product->get_price(),
        "category_id" => $product->get_category_ids()[0],
        "image" => wp_get_attachment_url( $product->get_image_id(), 'thumbnail'),
        "description" => $product->get_description(),
        "stock" => $product->get_stock_quantity()
      );

      // prodcut tax rate
      $taxclass = $product->get_tax_class();
      $taxrates = WC_Tax::get_rates_for_tax_class( $taxclass );
      $the_product['tax'] = floatval(array_merge($taxrates)[0]->tax_rate);
    
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
      if ($order) {
        foreach($current_order->get_items() as $item_id => $item) {
          $item_product_id = $item->get_meta( '_pid', true );
          if ($item_product_id == $product->get_id()) {
            $amount = $item->get_quantity();
          }
        }
      }
      $the_product['amount'] = $amount;

      // add short description of product to array
      $the_product["short_description"] = $product->get_short_description();

      array_push($products, $the_product);
    }

    usort($products, fn($a, $b) => $a['category_name'] <=> $b['category_name']);

    // get store currency
    $currency = get_woocommerce_currency_symbol();

    return json_encode(array($active, $bestellrunde, $bestellrunde_products, $products, $categories, $order, $bestellrunde_dates, $currency, $next_bestellrunde_dates));
  }




  /**
  * getProductListInActive
  */
  function getProductListInActive($post_data) { 

    // get all categories
    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false
    ) );    
    $categories = array();
    $cats = array();
    foreach( $product_categories as $category ) {
      array_push($categories, $category->name);
      $cats[$category->term_id] = $category->name;
    } 

    // get all products
    $p = wc_get_products(array(
      'status'            => array( 'publish' ),
      'limit'             => -1,
      'page'              => 1,
      'return'            => 'objects',
      'paginate'          => false,
      'orderby'           => 'title',
      'order'             => 'ASC'
    ));

    $products = array();
    foreach ($p as $product) {
      if ($product->get_sku() != "fcplugin_instant_topup_product" && $product->get_sku() != 'fcplugin_pos_product') {
        // product name
        $the_product = array(
          "id" => $product->get_id(),
          "name" => $product->get_name(),
          "price" => $product->get_price(),
          "category_id" => $product->get_category_ids()[0],
          "image" => wp_get_attachment_url( $product->get_image_id(), 'thumbnail'),
          "description" => $product->get_description(),
          "tax" => $product->get_tax_class()
        );
      
        // product meta data
        $the_meta = $product->get_meta_data();
        foreach($the_meta as $meta) {
          $data = $meta->get_data();
          $the_product[$data['key']] = $data['value'];
        }
    
        // product category (only the first one!)
        $the_product['category_name'] = $cats[$product->get_category_ids()[0]];

        $the_product['amount'] = 0;

        // add short description of product to array
        $the_product["short_description"] = $product->get_short_description();

        array_push($products, $the_product);
      }
    }

    usort($products, fn($a, $b) => $a['category_name'] <=> $b['category_name']);

    // get store currency
    $currency = get_woocommerce_currency_symbol();

    return json_encode(array(true, null, null, $products, $categories, null, null, $currency, null));
  }




  /**
   * getBalance
   */
  function getBalance($data) {
    global $wpdb;

    // get user balance
    $results = $wpdb->get_results(
      $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $data['id'])
    );
 
    foreach ( $results as $result )
    {
      $current_balance = $result->balance;
    }

    return json_encode([$current_balance, get_permalink( get_option('woocommerce_myaccount_page_id') )]);
  }



  /**
   * getExpenses
   */
  
  function getExpenses() {
    $args = array(
      'numberposts' => -1,
      'post_type'   => 'expenses',
    );
    $expenses_data = get_posts( $args );

    $expenses = array();
    foreach($expenses_data as $expense) {
      $the_expense = array(
        "id" => $expense->ID,
        "author" => $expense->post_author,
        "date_created" => $expense->post_date,
      );
      
      $the_meta = get_post_meta($expense->ID);
      foreach($the_meta as $key => $value) {          
        $the_expense[$key] = $value[0];
      }

      array_push($expenses, $the_expense);
    }

    return json_encode($expenses);
  }



  /**
   * postCreateExpense
   */
  function postCreateExpense($data) {
    $id = wp_insert_post(array(
      'post_title'=> 'Ausgabe ' . $data['type'] . ' - ' . $data['date'] . ' - ' . $data['amount'], 
      'post_type'=>'expenses',
      'post_status' => 'publish'
    ));

    add_post_meta( $id, 'date', $data['date'], true );
    add_post_meta( $id, 'type', $data['type'], true );
    add_post_meta( $id, 'created_by', $data['created_by'], true );
    add_post_meta( $id, 'amount', $data['amount'], true );
    add_post_meta( $id, 'note', $data['note'], true );

    return $id;
  }



  /**
   * getPages
   */
  function getPages() {
   $args = array(
    'sort_order' => 'asc',
    'sort_column' => 'post_title',
    'hierarchical' => 1,
    'exclude' => '',
    'include' => '',
    'meta_key' => '',
    'meta_value' => '',
    'authors' => '',
    'child_of' => 0,
    'parent' => -1,
    'exclude_tree' => '',
    'number' => '',
    'offset' => 0,
    'post_type' => 'page',
    'post_status' => 'publish'
  ); 
  $pages = get_pages($args);
  $pages_return = array();

  foreach($pages as $p){
    $page = array(); 
    $page['title'] = $p->post_title;
    $page['id'] = $p->ID;

    array_push($pages_return, $page);
  }

    return json_encode($pages_return);
  }



  /**
   * getProduct
   */
  function getProduct($data) {
 
    $sku = $data['sku'];
    $product_id = wc_get_product_id_by_sku($sku);
    $self_checkout_products = json_decode(get_option( 'fc_self_checkout_products' ));

    if (in_array($product_id, $self_checkout_products)) {

      $product = wc_get_product($product_id);

      if ($product) {
        $product_data = array(
          'name' => $product->get_name(),
          'price' => $product->get_price(),
          'unit' => $product->get_meta('_einheit'),
          'img' => wp_get_attachment_image_src( get_post_thumbnail_id( $product_id ), 'thumbnail', 50, 50, true )[0],
          'amount' => 1, 
          'sku' => $sku,
          'product_id' => $product->get_id()
        );
    
        return json_encode($product_data);

      } else {
        return json_encode(false);
      }
    } else {
      return json_encode(false);
    }


  }



  /**
   * addToCart
   */
  function addToCart($data) {
    if ( defined( 'WC_ABSPATH' ) ) {
      include_once WC_ABSPATH . 'includes/wc-cart-functions.php';
      include_once WC_ABSPATH . 'includes/wc-notice-functions.php';
      include_once WC_ABSPATH . 'includes/wc-template-hooks.php';
    }

    $cart = json_decode($data['data']);
    $user = json_decode($data['user']);
    $user_id = $user->ID;

    if ( null === WC()->session ) {
      $session_class = apply_filters( 'woocommerce_session_handler', 'WC_Session_Handler' );
      WC()->session = new $session_class();
      WC()->session->init();
    }
  
    if ( null === WC()->customer ) {
      WC()->customer = new WC_Customer( $user_id, true );
    }
  
    if ( null === WC()->cart ) {
        WC()->cart = new WC_Cart();
        WC()->cart->get_cart();
    }
  
    WC()->cart->empty_cart();

    $result = "";
    foreach($cart as $item) {
      if ($item->order_type == 'self_checkout') {
        $result = WC()->cart->add_to_cart( $item->product_id, $item->amount, NULL, NULL, array('order_type' => $item->order_type) );
      } 
      if ($item->order_type == 'bestellrunde') {
        $result = WC()->cart->add_to_cart( $item->product_id, $item->amount, NULL, NULL, array('bestellrunde' => $item->bestellrunde, 'order_type' => $item->order_type) );
      }
    }

    return json_encode(WC_ABSPATH);
    /*
    if ($result) {
      return json_encode(wc_get_checkout_url());
    } else {
      return http_response_code(400);
    }
    */
    
  }



  /**
   * instantTopup
   */
  function instantTopup($data) {
    if ( defined( 'WC_ABSPATH' ) ) {
      include_once WC_ABSPATH . 'includes/wc-cart-functions.php';
      include_once WC_ABSPATH . 'includes/wc-notice-functions.php';
      include_once WC_ABSPATH . 'includes/wc-template-hooks.php';
    }

    $amount = json_decode($data['amount']);
    $user_id = json_decode($data['user_id']);

    if ( null === WC()->session ) {
      $session_class = apply_filters( 'woocommerce_session_handler', 'WC_Session_Handler' );
      WC()->session = new $session_class();
      WC()->session->init();
    }
  
    if ( null === WC()->customer ) {
      WC()->customer = new WC_Customer( $user_id, true );
    }
  
    if ( null === WC()->cart ) {
        WC()->cart = new WC_Cart();
        WC()->cart->get_cart();
    }
  
    WC()->cart->empty_cart();

    $instant_topup_product = wc_get_product_id_by_sku( "fcplugin_instant_topup_product" );

    $result = WC()->cart->add_to_cart( $instant_topup_product, $amount, NULL, NULL, array('order_type' => 'instant_topup')  );

    if ($result) {
      return json_encode(wc_get_checkout_url());
    } else {
      return http_response_code(400);
    }
  }



  /**
   * payout
   */
  function payout($data) {  
    $amount = ($data['amount']);
    $user_id = ($data['user_id']);
    $iban = ($data['iban']);
    $toname = ($data['toname']);
    $tocity = ($data['tocity']);

    //user info
    $user = get_user_by( 'id', $user_id );
    $name = get_user_meta($user_id, 'billing_first_name', true)." ".get_user_meta($user_id, 'billing_last_name', true);
    $reply_email = $user->data->user_email;
    $address = get_user_meta($user_id, 'billing_address_1', true);
    $postcode = get_user_meta($user_id, 'billing_postcode', true);
    $city = get_user_meta($user_id, 'billing_city', true);

    // email
    $email = get_option('admin_email');

    $headers[] = 'From: '. $email;
    $headers[] = 'Reply-To: ' . $reply_email;
    $headers[] = 'Content-Type: text/html; charset=UTF-8';

    $subject = get_option('blogname') . ": " . __("Neue Auszahlung angefordert");

    $msg = '
      <table border="0" cellpadding="0" cellspacing="0" class="list_block block-4" id="list-r1c0m3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
      <tr>
      <td>Hallo Admin <br /></td>
      <tr>
      <tr>
      <td>Das folgende Mitglied hat eine neue Auszahlung von Foodcoop Guthaben angefordert:</td>
      <tr>
      <td class="pad" style="padding-bottom:10px;padding-left:35px;padding-right:35px;padding-top:10px;">
      <div class="levelOne" style="margin-left: 0;">
      <ul class="leftList" start="1" style="margin-top: 0; margin-bottom: 0; padding: 0; padding-left: 20px; font-weight: 400; text-align: left; color: #000; direction: ltr; font-family: Roboto,Tahoma,Verdana,Segoe,sans-serif; font-size: 16px; letter-spacing: 0; line-height: 180%; mso-line-height-alt: 28.8px; list-style-type: disc;">
      <li style="margin-bottom: 0; text-align: left;">Mitgliedernummer: '.$user->ID.'</li>
      <li style="margin-bottom: 0; text-align: left;">Name: '.$name.'</li>
      <li style="margin-bottom: 0; text-align: left;">email: '.$reply_email.'</li>
      <li style="margin-bottom: 0; text-align: left;">Adresse: '.$address.'</li>
      <li style="margin-bottom: 0; text-align: left;">PLZ / Ort: '.$postcode.' '.$city.'</li>
      <li style="margin-bottom: 0; text-align: left;"><strong>Betrag: CHF '.$amount.'</strong></li>
      <li style="margin-bottom: 0; text-align: left;">IBAN: '.$iban.'</li>
      <li style="margin-bottom: 0; text-align: left;">lautend auf Name: '.$toname.'</li>
      <li style="margin-bottom: 0; text-align: left;">lautend auf PLZ / Ort: '.$tocity.'</li>
      </ul>
      </div>
      </td>
      </tr>
      </table>
    ';


    if ($email) {
      $result = wp_mail( $email, $subject, $msg, $headers);
      if (!is_wp_error( $result)) {
        return http_response_code(200);
      } else {
        return http_response_code(400);
      }
    }


  }



  /**
  * Email notification feature for Bestellrunden 
  */

  function emailNotificationBestellrunden($data) {
    $orders = json_decode($data['orders']);
    $message = $data['message'];
    $subject = $data['subject'];
    $number = 0;
    
    // loop through orders to get users email and name
    foreach($orders as $order) {
      $email = $order->customer_email;

      $message_to_send .= $message;      

      $headers[] = 'From: '. get_option('admin_email');
      $headers[] = 'Reply-To: ' . get_option('admin_email');
      $headers[] = 'Content-Type: text/html; charset=UTF-8';

      if ($email) {
        wp_mail( $email, $subject, $message_to_send, $headers);
        $number++;
      }
    }

    return ($number);
  }



  /**
  * Email notification feature for Bestellrunden 
  */

  function emailNotificationBestellrundenTest($data) {
    $emailaddress = $data['email'];
    $message = $data['message'];
    $subject = $data['subject'];
    $number = 0;
    
    $email = $emailaddress;
    $message_to_send .= $message;      
    $headers[] = 'From: '. get_option('admin_email');
    $headers[] = 'Reply-To: ' . get_option('admin_email');
    $headers[] = 'Content-Type: text/html; charset=UTF-8';

    if ($email) {
      wp_mail( $email, $subject, $message_to_send, $headers);
      $number++;
    }

    return ($number);
  }

  /**
   * Get Product Categories
   */
  function getProductCategories() {
    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false,
      'orderby' => 'name',
			'order' => 'ASC',
      'count' => true
    ) );   

    $categories = array();

    foreach($product_categories as $cat) {
      $the_cat = array();
      $thumb_id = get_woocommerce_term_meta( $cat->term_id, 'thumbnail_id', true );
      $term_img = wp_get_attachment_url(  $thumb_id );
      $the_cat['image'] = $term_img;
      $the_cat['term_id'] = $cat->term_id;
      $the_cat['name'] = $cat->name;
      $the_cat['count'] = $cat->count;
      array_push($categories, $the_cat);
    }
    
    return json_encode($categories);
  }  
  
  /**
  * postCategoryUpdate
  */
 function postCategoryUpdate($data) {

  $update = wp_update_term( $data['id'], 'product_cat', array(
    'name' => $data['updatedValues']['name'],
    'slug' => $data['updatedValues']['slug']
  ) );
  
  if ( ! is_wp_error( $update ) ) {
    return json_encode($data['updatedValues']['name']);
  } else {
    return http_response_code(500);
  }
 }

 /**
  * postCategoryDelete
  */
 function postCategoryDelete($data) {
   $category = wp_delete_term($data['id'], 'product_cat');

   if ( ! is_wp_error( $category ) ) {
    return json_encode($data['name']);
  } else {
    return http_response_code(500);
  }
 }

 /**
  * postAddCategory
  */
 function postAddCategory($data) {
  if( !term_exists($data['name'], 'product_cat') ) {
    $category_id = wp_insert_term($data['name'], 'product_cat');
  }
  else {
    return http_response_code(500);
  }

  if ( ! is_wp_error( $category_id ) ) {
    return json_encode($category_id['term_id']);
  } else {
    return http_response_code(500);
  }
 }

 /**
   * Get Suppliers
   */
  function getSuppliers() {

    $suppliers = get_posts( array(
      'post_type'  => 'suppliers',
      'numberposts' => -1,
    ));  

    $all_suppliers = array();
    foreach($suppliers as $sup) {
      $the_sup = array();
      $the_sup['image'] = wp_get_attachment_url( get_post_thumbnail_id( $sup->ID ), 'thumbnail');
      $the_sup['id'] = $sup->ID;
      $the_sup['name'] = $sup->post_title;
      $the_sup['short_description'] = $sup->post_excerpt;
      $the_sup['description'] = ($sup->post_content);

      // supplier meta data
      $the_meta = get_post_meta($sup->ID);
      foreach($the_meta as $key => $value) {
        $the_sup[$key] = $value[0];
      }
      array_push($all_suppliers, $the_sup);
    }
    
    return json_encode($all_suppliers);
  }  
  
  /**
  * postSupplierUpdate
  */
  function postSupplierUpdate($data) {
    // update product featured image
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');

    $update = wp_update_post( array(
      'ID'           => $data['id'],
      'post_title' => esc_attr($data['name']), 
      'post_excerpt' => esc_attr($data['short_description']), 
      'post_content' => $data['description']
    ));

    update_post_meta( $data['id'], 'address', $data['address'] );
    update_post_meta( $data['id'], 'phone', $data['phone'] );
    update_post_meta( $data['id'], 'email', $data['email'] );
    update_post_meta( $data['id'], 'website', $data['website'] );
    update_post_meta( $data['id'], 'contact', $data['contact'] );
    update_post_meta( $data['id'], 'customerNumber', $data['customerNumber'] );
    update_post_meta( $data['id'], 'note', $data['note'] );
      
    // check if current image is the same as imported one
    $current_attachment = wp_get_attachment_url( get_post_thumbnail_id( $data['id'] ), 'thumbnail');
    if ($current_attachment) {
      if ($current_attachment != $data['image']) {
        // delete current featured image
        $attachmentid = get_post_thumbnail_id( $data['id'] );
        wp_delete_attachment( $attachmentid, true );

        $image = media_sideload_image( $data['image'], $data['id'], $data['name'], 'id' );
        set_post_thumbnail( $data['id'], $image );
      }
    }

    
    if ( ! is_wp_error( $update ) ) {
      return json_encode($data['name']);
    } else {
      return http_response_code(500);
    }
  }

  /**
    * postSupplierDelete
    */
  function postSupplierDelete($data) {
    $post = wp_delete_post($data['id']);

    if ( ! is_wp_error( $post ) ) {
      return json_encode($data['name']);
    } else {
      return http_response_code(500);
    }
  }

 /**
  * postAddSupplier
  */
  function postAddSupplier($data) {   
    // update product featured image
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');

    $id = wp_insert_post(array(
      'post_type' => 'suppliers',
      'post_status' => 'publish',
      'post_title' => esc_attr($data['name']), 
      'post_excerpt' => esc_attr($data['short_description']), 
      'post_content' => $data['description']
    ));

    if($id) {
      $image = media_sideload_image( $data['image'], $id, $data['name'], 'id' );
      set_post_thumbnail( $id, $image );

      add_post_meta( $id, 'address', $data['address'], true );
      add_post_meta( $id, 'phone', $data['phone'], true );
      add_post_meta( $id, 'email', $data['email'], true );
      add_post_meta( $id, 'website', $data['website'], true );
      add_post_meta( $id, 'contact', $data['contact'], true );
      add_post_meta( $id, 'customerNumber', $data['customerNumber'], true );
      add_post_meta( $id, 'note', $data['note'], true );
    }

    if ( ! is_wp_error( $id ) ) {
      return json_encode($id);
    } else {
      return http_response_code(500);
    }
    
  }


  /**
    * Get Producers
    */
   function getProducers() {
 
     $producers = get_posts( array(
       'post_type'  => 'producers',
       'numberposts' => -1,
     ));  
 
     $all_producers = array();
     foreach($producers as $prod) {
       $the_prod = array();
       $the_prod['image'] = wp_get_attachment_url( get_post_thumbnail_id( $prod->ID ), 'thumbnail');
       $the_prod['id'] = $prod->ID;
       $the_prod['name'] = $prod->post_title;
       $the_prod['short_description'] = $prod->post_excerpt;
       $the_prod['description'] = $prod->post_content;

       // supplier meta data
       $the_meta = get_post_meta($prod->ID);
       foreach($the_meta as $key => $value) {
         $the_prod[$key] = $value[0];
       }

       array_push($all_producers, $the_prod);
     }
     
     return json_encode($all_producers);
   } 
  
   /**
   * postProducerUpdate
   */
   function postProducerUpdate($data) {
     // update product featured image
     require_once(ABSPATH . 'wp-admin/includes/media.php');
     require_once(ABSPATH . 'wp-admin/includes/file.php');
     require_once(ABSPATH . 'wp-admin/includes/image.php');
 
     $update = wp_update_post( array(
       'ID'           => $data['id'],
       'post_title' => esc_attr($data['name']), 
       'post_excerpt' => esc_attr($data['short_description']), 
       'post_content' => $data['description']
     ));

     update_post_meta( $data['id'], 'origin', $data['origin'] );
     update_post_meta( $data['id'], 'website', $data['website'] );
       
     // check if current image is the same as imported one
     $current_attachment = wp_get_attachment_url( get_post_thumbnail_id( $data['id'] ), 'thumbnail');
     if ($current_attachment) {
       if ($current_attachment != $data['image']) {
         // delete current featured image
         $attachmentid = get_post_thumbnail_id( $data['id'] );
         wp_delete_attachment( $attachmentid, true );
 
         $image = media_sideload_image( $data['image'], $data['id'], $data['name'], 'id' );
         set_post_thumbnail( $data['id'], $image );
       }
     }
 
     
     if ( ! is_wp_error( $update ) ) {
       return json_encode($data['name']);
     } else {
       return http_response_code(500);
     }
   }
 
   /**
     * postProducerDelete
     */
   function postProducerDelete($data) {
     $post = wp_delete_post($data['id']);
 
     if ( ! is_wp_error( $post ) ) {
       return json_encode($data['name']);
     } else {
       return http_response_code(500);
     }
   }
 
  /**
   * postAddProducer
   */
   function postAddProducer($data) {   
     // update product featured image
     require_once(ABSPATH . 'wp-admin/includes/media.php');
     require_once(ABSPATH . 'wp-admin/includes/file.php');
     require_once(ABSPATH . 'wp-admin/includes/image.php');
 
     $id = wp_insert_post(array(
       'post_type' => 'producers',
       'post_status' => 'publish',
       'post_title' => esc_attr($data['name']), 
       'post_excerpt' => esc_attr($data['short_description']), 
       'post_content' => $data['description']
     ));
 
     if($id) {
      $image = media_sideload_image( $data['image'], $id, $data['name'], 'id' );
      set_post_thumbnail( $id, $image );

      add_post_meta( $id, 'origin', $data['origin'] );
      add_post_meta( $id, 'website', $data['website'] );
     }
 
     if ( ! is_wp_error( $id ) ) {
       return json_encode($id);
     } else {
       return http_response_code(500);
     }
     
   }

   /**
    * getProductDetails
    */
   function getProductDetails($data) {
    global $wpdb;

    $product = wc_get_product($data['id']);
    $supplier = '';
    $supplier_data = [];
    $producer = '';
    $producer_data = [];

    if ($product) {
      $the_meta = $product->get_meta_data();
      foreach($the_meta as $meta) {
        $data = $meta->get_data();

        if ($data['key'] == '_lieferant') {
          $supplier = $data['value'];
        }

        if ($data['key'] == '_produzent') {
          $producer = $data['value'];
        }

      }
    }

    if ($supplier != '') {
      $supplier_post = $wpdb->get_var ( $wpdb->prepare ( "SELECT ID FROM $wpdb->posts WHERE post_title = %s AND post_type='suppliers'", $supplier ) );
      if ($supplier_post) {
        $post = get_post( $supplier_post );
        array_push($supplier_data, $post->post_title, $post->post_excerpt, get_post_meta($post->ID, 'address', true), get_post_meta($post->ID, 'website', true), $post->post_content);
      }
    }

    if ($producer != '') {
      $producer_post = $wpdb->get_var ( $wpdb->prepare ( "SELECT ID FROM $wpdb->posts WHERE post_title = %s AND post_type='producers'", $producer ) );
      if ($producer_post) {
        $post = get_post( $producer_post );
        array_push($producer_data, $post->post_title, $post->post_excerpt, get_post_meta($post->ID, 'origin', true), get_post_meta($post->ID, 'website', true), $post->post_content);
      }
    }

    if ( count($supplier_data) > 0 || $producer_data > 0 ) {
      return json_encode([$supplier_data, $producer_data]);
    } else {
      return http_response_code(500);
    }
    
  }




  /**
  * postSaveInventory
  */
  function postSaveInventory($data) {
    $products = json_decode($data['products']);
    
    $number = 0;
    foreach($products as $product) {
      update_post_meta( $product->id, "_stock", intval($product->stock) );
      $number++;
    }
    
    return ($number);
    
  }




  /**
  * postSaveDelivery
  */
  function postSaveDelivery($data) {
    $products = json_decode($data['products']);
    
    $number = 0;
    foreach($products as $product) {
      $current_stock = intval(get_post_meta( $product->id, "_stock", true ));
      $new_stock = $current_stock + intval($product->amount);
      update_post_meta( $product->id, "_stock", $new_stock );
      $number++;
    }
    
    return ($number);
    
  } 




  /**
  * postSaveDeliveryByOwner
  */
  function postSaveDeliveryByOwner($data) {
    global $wpdb;
    $product_id = $data['product_id'];
    $user_id = intval($data['user_id']);
    $amount = $data['amount'];

    // calculate new product stock
    $product = wc_get_product($product_id);
    $old_stock = $product->get_stock_quantity();
    $new_stock = $old_stock + floatval($amount);

    // calculate balance to pay to member
    $price = $product->get_price();
    $balance = floatval($price * $amount); 
    $balance = number_format($balance, 2, '.', '');

    if (get_current_user_id() == $user_id) {
      // update product stock
      $product->set_stock_quantity(floatval($new_stock));
      $product->save();

      // update user's wallet balance
      $table = $wpdb->prefix.'foodcoop_wallet';

      // get current balance
      $current_balance = 0.00;
      $results = $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM `".$wpdb->prefix."foodcoop_wallet` WHERE `user_id` = %s ORDER BY `id` DESC LIMIT 1", $user_id)
      );
      foreach ( $results as $result ) {
        $current_balance = $result->balance;
      }

      date_default_timezone_set('Europe/Zurich');
      $date = date("Y-m-d H:i:s");
      $details = 'Neue Lieferung von Produkt '.$product->get_name().'('.$amount.'x)';
      $created_by = get_current_user_id();
      $new_balance = $current_balance + $balance;
      $new_balance = number_format($new_balance, 2, '.', '');

      $data = array('user_id' => $user_id, 'amount' => $balance, 'date' => $date, 'details' => $details, 'created_by' => $created_by, 'balance' => $new_balance);
      $wpdb->insert($table, $data);

      // inform the admin about the change
      $headers[] = 'From: '. get_option('admin_email');
      $headers[] = 'Reply-To: ' . get_option('admin_email');
      $headers[] = 'Content-Type: text/html; charset=UTF-8';

      $subj = __('Neue Lieferung durch Produktverwaltung von Produkt', 'fcplugin') . " " . $product->get_name() . "!";

      $msg = '
        <table border="0" cellpadding="0" cellspacing="0" class="list_block block-4" id="list-r1c0m3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
          <tr>
            <td class="pad" style="padding-bottom:10px;padding-left:35px;padding-right:35px;padding-top:10px;">
            <div class="levelOne" style="margin-left: 0;">
              <ul class="leftList" start="1" style="margin-top: 0; margin-bottom: 0; padding: 0; padding-left: 20px; font-weight: 400; text-align: left; color: #000; direction: ltr; font-family: Roboto,Tahoma,Verdana,Segoe,sans-serif; font-size: 16px; letter-spacing: 0; line-height: 180%; mso-line-height-alt: 28.8px; list-style-type: disc;">
                <li style="margin-bottom: 0; text-align: left;">Alter Bestand: '.$old_stock.'</li>
                <li style="margin-bottom: 0; text-align: left;">Angelieferte Menge: '.$amount.'</li>
                <li style="margin-bottom: 0; text-align: left;">Neuer Bestand: '.$new_stock.'</li>
                <li style="margin-bottom: 0; text-align: left;">Guthaben ausbezahlt an Produktmanager (Mitglied '.$user_id.'): '.$balance.'</li>
              </ul>
            </div>
            </td>
          </tr>
        </table>
      ';

      $send = wp_mail( get_option('admin_email'), $subj, $msg, $headers, '' );

      return http_response_code(200);
    } else {
      return http_response_code(401);
    } 
  }  

  
  
  
  
  
  /**
  * getProductListOverview
  */
  function getProductListOverview() { 

    // get all categories
    $product_categories = get_terms( array(
      'taxonomy' => 'product_cat',
      'hide_empty' => false
    ) );    
    $categories = array();
    $cats = array();
    foreach( $product_categories as $category ) {
      $thumb_id = get_woocommerce_term_meta( $category->term_id, 'thumbnail_id', true );
      $thumb_id ? $term_img = wp_get_attachment_url(  $thumb_id ) : $term_img = plugin_dir_url( __FILE__ ).'../images/category.jpg';
      array_push($categories, array(
        'id' => $category->term_id, 
        'name' => $category->name, 
        'img' => $term_img
      ));
      $cats[$category->term_id] = $category->name;
    } 

    // get all products
    $p = wc_get_products(array(
      'status'            => array( 'publish' ),
      'limit'             => -1,
      'page'              => 1,
      'return'            => 'objects',
      'paginate'          => false,
      'orderby'           => 'title',
      'order'             => 'ASC'
    ));

    $products = array();
    foreach ($p as $product) {
      if ($product->get_sku() != "fcplugin_instant_topup_product" && $product->get_sku() != 'fcplugin_pos_product') {

        $pimg = wp_get_attachment_url( $product->get_image_id(), 'thumbnail');
        if (!$pimg) {
          $pimg = plugin_dir_url( __FILE__ ).'../images/placeholder.png';
        }

        // product name
        $the_product = array(
          "id" => $product->get_id(),
          "name" => $product->get_name(),
          "price" => $product->get_price(),
          "category_id" => $product->get_category_ids()[0],
          "image" => $pimg,
          "description" => $product->get_description(),
          "stock" => $product->get_stock_quantity(),
          "stock_status" => $product->get_stock_status()
        );
      
        // product meta data
        $the_meta = $product->get_meta_data();
        foreach($the_meta as $meta) {
          $data = $meta->get_data();
          $the_product[$data['key']] = $data['value'];
        }
    
        // product category (only the first one!)
        $the_product['category_name'] = $cats[$product->get_category_ids()[0]];

        $the_product['amount'] = 0;

        // add short description of product to array
        $the_product["short_description"] = $product->get_short_description();

        array_push($products, $the_product);
      }
    }

    usort($products, fn($a, $b) => $a['category_name'] <=> $b['category_name']);

    // get store currency
    $currency = get_woocommerce_currency_symbol();

    return json_encode(array($products, $categories, $currency));
  }  
  
  
  
  /**
  * getPaymentGateways
  */
  function getPaymentGateways() {  
    
    $available_payment_gateways = WC()->payment_gateways()->get_available_payment_gateways();

    $active_gateways = array();
  
    foreach($available_payment_gateways as $gateway) {
      $this_gateway = array();
      $this_gateway['name'] = $gateway->method_title;
      $this_gateway['id'] = $gateway->id;
      $this_gateway['icon'] = $gateway->icon;
      array_push($active_gateways, $this_gateway);
    }
    
    if ( $available_payment_gateways ) {
      return json_encode($active_gateways);
    } else {
      return http_response_code(500);
    }
  
  }
  
  
  
  /**
  * postCreatePOSorder
  */
  function postCreatePOSorder($data) {  
    global $woocommerce;
    global $wpdb;

    $pos_user = intval($data['pos_user']);
    $type = $data['type'];
    $cart = json_decode($data['cart']);
    $user = json_decode($data['user']);
    $payment_gateway = json_decode($data['payment_gateway']);

    // get user id
    $user_id = null;
    $type == 'memberOrder' && $user_id = $user->id;
    $type == 'guestOrder' && $user_id = $user->ID;

    // create wc order
    $order = wc_create_order();
    $order->update_meta_data( 'order_type', 'pos' );

    // add products to order 
    foreach($cart as $cart_item) {
      // check if it is the pos_product
      if ($cart_item->sku == 'fcplugin_pos_product') {
        $pid = wc_get_product_id_by_sku( "fcplugin_pos_product" );
        $order->add_product( wc_get_product( $pid ), $cart_item->amount, array(
          'name'         => $cart_item->name,
          'subtotal'     => floatval($cart_item->price) * floatval($cart_item->amount),
          'total'        => floatval($cart_item->price) * floatval($cart_item->amount)
        ));
      } else {
        $order->add_product( wc_get_product( $cart_item->product_id ), $cart_item->amount );
      }
    }

    // calculate order totals
    $order->calculate_totals();

    // if it is a guest order, add a fee as a non-member margin
    if ($type == 'guestOrder') {
      $order_total = $order->get_total();
      $fee_amount = $order_total / 100 * floatval(get_option('fc_margin'));

      $fee = new WC_Order_item_Fee();
      $fee->set_name(__('Nicht-Mitglieder Marge', 'fcplugin'));
      $fee->set_amount($fee_amount);
      $fee->set_total($fee_amount);
      $order->add_item( $fee );
      $order->calculate_totals();
    }

    // if it is a member order, add member information
    if ($type == 'memberOrder') { 
      $order->set_customer_id($user_id);

      // set address
      $address = array(
        'first_name' => get_user_meta($user_id, 'billing_first_name', true),
        'last_name'  => get_user_meta($user_id, 'billing_last_name', true),
        'email'      => get_user_meta($user_id, 'billing_email', true),
        'phone'      => get_user_meta($user_id, 'billing_phone', true),
        'address_1'  => get_user_meta($user_id, 'billing_address_1', true),
        'city'       => get_user_meta($user_id, 'billing_city', true),
        'state'      => '',
        'postcode'   => get_user_meta($user_id, 'billing_postcode', true),
        'country'    => get_user_meta($user_id, 'billing_country', true)
      );
      $order->set_address( $address, 'billing' );    
    }

    // if it is a guest order, set name to guest
    if ($type == 'guestOrder') { 
      $address = array(
        'first_name' => 'Guest',
      );
      $order->set_address( $address, 'billing' );    
    }

    // set payment gateway for order and process payment if it is foodcoop_guthaben
    $order->set_payment_method( $payment_gateway->id );
    $order->set_payment_method_title( $payment_gateway->name );

    if ($payment_gateway->id == 'foodcoop_guthaben') {
      $new_balance = floatval($user->balance) - $order->get_total();
      $order_note = 'Bezahlt mit Foodcoop Guthaben: CHF' . $order->get_total() . '; Neues Guthaben: CHF' . $new_balance;
      $order->update_status( 'processing', $order_note );

      // Add Wallet Transaction
      $table = $wpdb->prefix.'foodcoop_wallet';

      date_default_timezone_set('Europe/Zurich');
      $date = date("Y-m-d H:i:s");
      $details = 'Bestellung #'.$order->id.' (POS Bestellung)';
      $amount = -1 * $order->get_total();
      $new_balance = floatval($user->balance) - $order->get_total();
      $new_balance = number_format($new_balance, 2, '.', '');
      $order_note = 'Bezahlt mit Foodcoop Guthaben: CHF' . $order->get_total() . '; Neues Guthaben: CHF' . $new_balance;
      $order->update_status( 'processing', $order_note );

      $data = array('user_id' => $user_id, 'amount' => $amount, 'date' => $date, 'details' => $details, 'created_by' => $pos_user, 'balance' => $new_balance, 'type' => 'order');
      $wpdb->insert($table, $data);
    }


    // set order status to complete and save
    $order->update_status( 'wc-completed' );
    $order->save();
    
    if ( $order ) {
      return json_encode($order);
    } else {
      return http_response_code(500);
    }
  
  }



  /**
   * postSaveProductOwner
   */
  function postSaveProductOwner($data) {
    $user_id = $data['user_id'];
    $product_id = $data['product_id'];

    $product = wc_get_product($product_id);

    $product->update_meta_data('fc_owner', $user_id);
    $product->save();
    
    
    if ( $product ) {
      return json_encode($product);
    } else {
      return http_response_code(500);
    }
  }


  /**
   * getProductOwner
   */
  function getProductOwner($data) {
    $product_id = $data['product_id'];

    $product = wc_get_product($product_id);
    $product && $user_id = $product->get_meta('fc_owner');
    
    if ( $user_id ) {
      return json_encode($user_id);
    } else {
      return http_response_code(500);
    }
  }


  



  
}