import React from "react"
import ReactDOM from "react-dom"
import { act } from "react-dom/test-utils"
import axios from "axios"
import { getProductListOverview, getSelfCheckoutProducts } from "../src/components/products/products"
import { completeCheckout } from "../src/components/selfCheckout/checkoutCart"

jest.mock("axios", () => ({ get: jest.fn() }))
jest.mock("../src/components/products/products", () => ({
  getProductListOverview: jest.fn(),
  getSelfCheckoutProducts: jest.fn()
}))
jest.mock("../src/components/selfCheckout/SelfCheckoutCart", () => () => {
  const React = require("react")
  const { cartContext } = require("../src/components/selfCheckout/cartContext")
  const { cart } = React.useContext(cartContext)
  return <div data-testid="cart">{cart.length ? cart.map(item => item.name).join(", ") : "Empty cart"}</div>
})
jest.mock("../src/components/selfCheckout/QrScanner", () => () => null)
jest.mock("../src/components/selfCheckout/AddProductBySku", () => () => null)

const cart = [{ id: 1, sku: "juice", name: "Apfelsaft", price: 3, amount: 1 }]
let container

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  global.wp = { i18n: { __: text => text } }
  global.frontendLocalizer = {
    apiUrl: "https://example.org/wp-json",
    currentUser: { roles: [] }
  }
  axios.get.mockResolvedValue({ data: JSON.stringify("1") })
  getSelfCheckoutProducts.mockResolvedValue([])
  getProductListOverview.mockResolvedValue({ products: [] })
  localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(cart))
  container = document.createElement("div")
  document.body.appendChild(container)
})

afterEach(() => {
  act(() => { ReactDOM.unmountComponentAtNode(container) })
  container.remove()
  localStorage.clear()
  sessionStorage.clear()
})

async function mountCart() {
  const SelfCheckout = require("../src/SelfCheckout").default
  await act(async () => {
    ReactDOM.render(<SelfCheckout />, container)
  })
}

function restoreCachedPage() {
  const event = new Event("pageshow")
  Object.defineProperty(event, "persisted", { value: true })
  act(() => { window.dispatchEvent(event) })
}

test("restores the draft when Back reloads the Self Checkout page", async () => {
  await mountCart()

  expect(document.querySelector('[data-testid="cart"]').textContent).toBe("Apfelsaft")
  expect([...document.querySelectorAll("button")].find(button => button.textContent === "Kasse").disabled).toBe(false)
})

test("keeps the draft when Back restores a cached page before the order is placed", async () => {
  await mountCart()
  restoreCachedPage()

  expect(document.querySelector('[data-testid="cart"]').textContent).toBe("Apfelsaft")
})

test("removes the old cart from a cached page after the order is received", async () => {
  await mountCart()
  sessionStorage.setItem("fc_selfcheckout_submitted_cart", JSON.stringify(cart))
  completeCheckout()
  restoreCachedPage()

  expect(document.querySelector('[data-testid="cart"]').textContent).toBe("Empty cart")
  expect([...document.querySelectorAll("button")].find(button => button.textContent === "Kasse")).toBeUndefined()
})
