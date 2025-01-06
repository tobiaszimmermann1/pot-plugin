import axios from "axios"

let productListOverviewCache = null

export async function getProductListOverview() {
  if (productListOverviewCache === null) {
    const response = await axios.post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductListOverview`)
    if (response.data) {
      productListOverviewCache = JSON.parse(response.data)
    }
  }

  const res = productListOverviewCache
  const products = res[0]
  const categories = res[1]
  const currency = res[2]
  let productsByCategory = {}
  res[1].map(category => {
    productsByCategory[category.name] = []
  })

  products.map(p => {
    let productToDo = p
    productToDo.unit = p._einheit
    productToDo.lot = p._gebinde
    productsByCategory[p.category_name].push(productToDo)
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

export async function getProduct(id) {
  if (productListOverviewCache === null) {
    const response = await axios.post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductListOverview`)
    if (response.data) {
      productListOverviewCache = JSON.parse(response.data)
    }
  }
  const res = productListOverviewCache
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
