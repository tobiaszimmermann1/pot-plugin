export function getCartAvailability(cart, products) {
  if (!products) return cart.map(() => null)

  const quantities = new Map()
  const productKey = item => String(item.product_id ?? item.id ?? item.sku)
  cart.forEach(item => {
    const key = productKey(item)
    quantities.set(key, (quantities.get(key) || 0) + (Number(item.amount) || 0))
  })

  return cart.map(item => {
    const product = products.find(product => item.product_id != null || item.id != null
      ? productKey(product) === productKey(item)
      : String(product.sku) === String(item.sku))
    if (!product || product.is_purchasable === false || product.is_in_stock === false || product.stock_status === "outofstock") {
      return "unavailable"
    }
    if (product.managing_stock && !product.backorders_allowed && product.stock !== null &&
        quantities.get(productKey(item)) > Number(product.stock)) {
      return "insufficient_stock"
    }
    return null
  })
}
