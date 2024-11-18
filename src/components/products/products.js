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

