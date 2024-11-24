import axios from "axios";

export async function getProductListOverview() {
  const response = await axios.post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductListOverview`)
  if (response.data) {
    const res = JSON.parse(response.data)

    const products = res[0]
    const categories = res[1]
    const currency = res[2]
    let productsByCategory = {}
    res[1].map(category => {
      productsByCategory[category.name] = []
    })

    return {
      products: products,
      categories: categories,
      currency: currency,
      productsByCategory: productsByCategory
    };
  }
}

export async function getProduct(id) {
  const response = await axios.post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductListOverview`)
  if (response.data) {
    const res = JSON.parse(response.data)
    let product = res[0].find(product => product.id == id)

    const currency = res[2]
    return {product, currency}
  }
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
    return JSON.parse(response.data)
  }
}

export function categorizeProducts(originalProducts, selfCheckoutProducts, filter, cats) {
  let newProducts = {}

  // FILTER: selfCheckout false && inStock false
  if (!filter.selfCheckout && !filter.inStock) {
    cats.map(cat => {
      newProducts[cat.name] = originalProducts[cat.name]
    })
  }

  // FILTER: selfCheckout false && inStock true
  else if (!filter.selfCheckout && filter.inStock) {
    cats.map(cat => {
      newProducts[cat.name] = originalProducts[cat.name].filter(el => {
        return parseInt(el.stock) > 0
      })
    })
  }

  // FILTER: selfCheckout true && inStock false
  else if (filter.selfCheckout && selfCheckoutProducts && !filter.inStock) {
    cats.map(cat => {
      newProducts[cat.name] = originalProducts[cat.name].filter(el => {
        return selfCheckoutProducts.includes(el.id)
      })
    })
  }

  // FILTER: selfCheckout true && inStock true
  else if (filter.selfCheckout && selfCheckoutProducts && filter.inStock) {
    cats.map(cat => {
      newProducts[cat.name] = originalProducts[cat.name].filter(el => {
        return selfCheckoutProducts.includes(el.id) && parseInt(el.stock) > 0
      })
    })
  }

  return newProducts
}