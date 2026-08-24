import axios from "axios"

let productListOverviewCache = null

const wc_weight_units = {
    kg: 1000,
    g: 1,
    lbs: 453.592,
    oz: 28.3495
}

async function updateProductListOverview() {
  if (productListOverviewCache === null) {
    const response = await axios.get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductListOverview`)
    if (response.data) {
      productListOverviewCache = JSON.parse(response.data)
    }
  }

  return productListOverviewCache;
}

export async function getProductListOverview() {
  const res = await updateProductListOverview();
  const products = res[0]
  const categories = res[1]
  const currency = res[2]

  let productsByCategory = {}
  categories.map(category => {
    productsByCategory[category.name] = []
  })

  products.map(p => {
    let productToDo = p
    productToDo.unit = p._einheit
    productToDo.lot = p._gebinde
    productsByCategory[p.category_name.replace(/\//g, "-")].push(productToDo)
  })

  // Remove categories with no products
  const filteredCategories = categories.filter(category => productsByCategory[category.name].length > 0)

  return {
    products: products,
    categories: filteredCategories,
    currency: currency,
    productsByCategory: productsByCategory
  }
}

export async function getProductBySku(sku) {
  const res = await updateProductListOverview();
  let product = res[0].find(product => product.sku == sku)

  return product;
}

export async function getProduct(id) {
  const res = await updateProductListOverview();
  let product = res[0].find(product => product.id == id)

  const currency = res[2]
  return { product, currency }
}

export async function getStockManagement() {
  const response = await axios.get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=woocommerce_manage_stock`)
  if (response.data) {
    return response.data === '"yes"'
  } else {
    return false
  }
}

export async function getSelfCheckoutProducts() {
  const response = await axios.get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_self_checkout_products`)
  if (response.data) {
    // WTF
    if (JSON.parse(JSON.parse(response.data)) === null || JSON.parse(JSON.parse(response.data)) === undefined) {
      return []
    }
    return JSON.parse(JSON.parse(response.data)).map(Number)
  }
}

export function updateProductAmount(product,w,t){
    if ( product.is_weighed ) {
      const prodWeightInG = product.weight * wc_weight_units[product.weight_unit];

      product.userWeightValue = formatProductWeight(w);
      product.userTaraValue = formatProductWeight(t);
      product.amountWeight = w > t
        ? formatProductWeight(w - t)
        : 0
      ;

      product.amount = w > t
        ? formatProductWeight((w - t) / prodWeightInG * 1000)
        : 0
      ;
    } else {
      product.userWeightValue = null;
      product.userTaraValue = null;
    }
}

export function formatProductWeight(w){
  w = parseFloat(w);

  return Math.round(w*1000)/1000;
}

// display only: weights below 1 kg read better in grams
export function formatWeightDisplay(w, unit){
  w = parseFloat(w);

  if ( unit === "kg" && w < 1 ) {
    return formatProductWeight(w * 1000) + " g";
  }

  return formatProductWeight(w) + " " + unit;
}

export async function addUserEinkaufsliste(cart,id) {
  const produkte = cart.map(( item ) => ({
    sku:item.sku,
    amount:item.amount,
    weight:item.userWeightValue,
    tara:item.userTaraValue
  }) );

  const auto = !id;
  if ( auto ) id = self.crypto.randomUUID();
  
  const response = await axios
    .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/addUserEinkaufsliste`,{
      id:id,
      auto:auto?true:false,
      date:Date.now(),
      produkte:produkte,
    },{headers: { "X-WP-Nonce": frontendLocalizer.nonce}}
  )

  return response;
}