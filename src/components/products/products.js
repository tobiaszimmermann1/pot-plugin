import { apiGet, apiPost } from "../../utils/api"

let productListOverviewCache = null

export async function getProductListOverview() {
  if (productListOverviewCache === null) {
    const data = await apiPost("getProductListOverview")
    if (data) {
      productListOverviewCache = data
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

export async function getProduct(id) {
  if (productListOverviewCache === null) {
    const data = await apiPost("getProductListOverview")
    if (data) {
      productListOverviewCache = data
    }
  }
  const res = productListOverviewCache
  let product = res[0].find(product => product.id == id)

  const currency = res[2]
  return { product, currency }
}

export async function getStockManagement() {
  const res = await apiGet("getOption", { option: "woocommerce_manage_stock" })
  if (res) {
    return res === "yes"
  } else {
    return false
  }
}

export async function getSelfCheckoutProducts() {
  const res = await apiGet("getOption", { option: "fc_self_checkout_products" })
  if (res) {
    // WTF
    if (JSON.parse(res) === null || JSON.parse(res) === undefined) {
      return []
    }
    return JSON.parse(res).map(Number)
  }
}
