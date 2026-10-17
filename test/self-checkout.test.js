import axios from "axios"
import { addUserEinkaufsliste } from "../src/components/products/products"
import { checkoutCart, completeCheckout } from "../src/components/selfCheckout/checkoutCart"

jest.mock("axios", () => ({ post: jest.fn() }))
jest.mock("../src/components/products/products", () => ({ addUserEinkaufsliste: jest.fn() }))

const cart = [{ id: 12, amount: 1, order_type: "self_checkout" }]

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  global.frontendLocalizer = { apiUrl: "https://example.org/wp-json", currentUser: {}, nonce: "nonce" }
  global.wp = { i18n: { __: text => text } }
  localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(cart))
  addUserEinkaufsliste.mockResolvedValue({})
})

test.each([200, 400, null, "{}", '"javascript:alert(1)"', '"https://"', "invalid JSON"])("keeps the cart when the endpoint returns %p", async data => {
  axios.post.mockResolvedValue({ data })

  await expect(checkoutCart(cart)).rejects.toThrow()
  expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))).toEqual(cart)
})

test("keeps the cart and propagates a rejected product error", async () => {
  const error = { response: { data: { message: "Product unavailable" }, status: 400 } }
  axios.post.mockRejectedValue(error)

  await expect(checkoutCart(cart)).rejects.toBe(error)
  expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))).toEqual(cart)
})

test("keeps the cart and does not transfer it when the backup fails", async () => {
  addUserEinkaufsliste.mockRejectedValue(new Error("Backup failed"))

  await expect(checkoutCart(cart)).rejects.toThrow("Backup failed")
  expect(axios.post).not.toHaveBeenCalled()
  expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))).toEqual(cart)
})

test("preserves the draft when handing it to WooCommerce so Back can reopen it", async () => {
  axios.post.mockResolvedValue({ data: JSON.stringify("https://example.org/checkout/") })

  await expect(checkoutCart(cart)).resolves.toBe("https://example.org/checkout/")
  expect(addUserEinkaufsliste).toHaveBeenCalledWith(cart)
  expect(axios.post).toHaveBeenCalledWith(
    "https://example.org/wp-json/foodcoop/v1/addToCart",
    { data: JSON.stringify(cart), user: "{}" },
    { headers: { "X-WP-Nonce": "nonce" } }
  )
  expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))).toEqual(cart)
  expect(JSON.parse(sessionStorage.getItem("fc_selfcheckout_submitted_cart"))).toEqual(cart)
})

test("clears the submitted draft when the order is received", async () => {
  axios.post.mockResolvedValue({ data: JSON.stringify("https://example.org/checkout/") })
  await checkoutCart(cart)

  completeCheckout()

  expect(localStorage.getItem("fc_selfcheckout_cart")).toBeNull()
  expect(sessionStorage.getItem("fc_selfcheckout_submitted_cart")).toBeNull()
})

test("does not clear a newer cart when the previous order is received", async () => {
  axios.post.mockResolvedValue({ data: JSON.stringify("https://example.org/checkout/") })
  await checkoutCart(cart)
  const nextCart = [{ id: 20, amount: 2, order_type: "self_checkout" }]
  localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(nextCart))

  completeCheckout()

  expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))).toEqual(nextCart)
  expect(sessionStorage.getItem("fc_selfcheckout_submitted_cart")).toBeNull()
})

test("leaves an unsubmitted draft alone on an order confirmation page", () => {
  completeCheckout()

  expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))).toEqual(cart)
})
