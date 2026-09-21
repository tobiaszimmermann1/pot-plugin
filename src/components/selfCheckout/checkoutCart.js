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

  localStorage.removeItem("fc_selfcheckout_cart")
  return checkoutUrl.href
}
