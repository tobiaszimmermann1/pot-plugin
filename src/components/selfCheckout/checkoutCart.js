import axios from "axios"
import { addUserEinkaufsliste } from "../products/products"

export async function checkoutCart(cart) {
  await addUserEinkaufsliste(cart)

  const response = await axios.post(
    `${frontendLocalizer.apiUrl}/foodcoop/v1/addToCart`,
    { data: JSON.stringify(cart), user: JSON.stringify(frontendLocalizer.currentUser) },
    { headers: { "X-WP-Nonce": frontendLocalizer.nonce } }
  )

  // The endpoint returns a JSON-encoded URL. A successful HTTP status alone
  // does not guarantee that the response actually contains a checkout URL.
  const url = JSON.parse(response.data)
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    throw new Error(wp.i18n.__("Die Kasse konnte nicht geöffnet werden. Bitte erneut versuchen.", "fcplugin"))
  }
  const checkoutUrl = new URL(url)

  // Opening WooCommerce is only a handoff. Keep the draft so Back/reload can
  // reopen it, and remember which draft to clear once the order is received.
  const submittedCart = JSON.stringify(cart)
  localStorage.setItem("fc_selfcheckout_cart", submittedCart)
  sessionStorage.setItem("fc_selfcheckout_submitted_cart", submittedCart)
  return checkoutUrl.href
}

export function completeCheckout() {
  const submittedCart = sessionStorage.getItem("fc_selfcheckout_submitted_cart")
  if (submittedCart && localStorage.getItem("fc_selfcheckout_cart") === submittedCart) {
    localStorage.removeItem("fc_selfcheckout_cart")
  }
  sessionStorage.removeItem("fc_selfcheckout_submitted_cart")
}
