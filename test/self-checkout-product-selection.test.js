import React from "react"
import ReactDOM from "react-dom"
import { act } from "react-dom/test-utils"
import axios from "axios"
import { getProductListOverview, getProductBySku, getSelfCheckoutProducts } from "../src/components/products/products"

jest.mock("axios", () => ({ get: jest.fn() }))
jest.mock("../src/components/products/products", () => ({
  getProductListOverview: jest.fn(),
  getProductBySku: jest.fn(),
  getSelfCheckoutProducts: jest.fn(),
  updateProductAmount: jest.fn()
}))
jest.mock("../src/components/selfCheckout/SelfCheckoutCart", () => () => null)
jest.mock("../src/components/selfCheckout/SmartScaleChip", () => ({ SmartScaleChip: () => null }))
jest.mock("../src/components/selfCheckout/QrScanner", () => ({ updateScanResult }) => (
  <button onClick={() => updateScanResult("juice-1")}>Scan product</button>
))

const product = { id: 1, sku: "juice-1", name: "Apfelsaft", price: 3, unit: "Flasche" }
let container

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  global.wp = { i18n: { __: text => text } }
  global.frontendLocalizer = {
    apiUrl: "https://example.org/wp-json",
    nonce: "nonce",
    currentUser: { roles: [], data: { ID: 1 } }
  }
  axios.get.mockImplementation(url => Promise.resolve({
    data: url.includes("/getOption?")
      ? JSON.stringify(url.endsWith("option=fc_self_checkout") ? "1" : "0")
      : { userVerpackungen: [], userProduktFavoriten: [] }
  }))
  getSelfCheckoutProducts.mockResolvedValue([product.id])
  getProductListOverview.mockResolvedValue({ products: [product] })
  getProductBySku.mockResolvedValue(product)
  container = document.createElement("div")
  document.body.appendChild(container)
})

afterEach(() => {
  act(() => { ReactDOM.unmountComponentAtNode(container) })
  container.remove()
  localStorage.clear()
})

function buttonWithText(text) {
  return [...document.querySelectorAll("button")].find(button => button.textContent === text)
}

function iconButton(icon) {
  return document.querySelector(`[data-testid="${icon}"]`).closest("button")
}

async function click(button) {
  expect(button).toBeDefined()
  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

test.each([
  ["adding", "button"],
  ["adding", "shortcut"],
  ["cancelling", "button"]
])("opens an empty product picker with the %s/%s flow after a QR scan", async (action, method) => {
  const SelfCheckout = require("../src/SelfCheckout").default
  await act(async () => {
    ReactDOM.render(<SelfCheckout />, container)
  })

  await click(iconButton("QrCodeScannerIcon"))
  await click(buttonWithText("Scan product"))
  expect(console).toHaveLoggedWith("scanresulttext ", product.sku)
  expect(document.querySelector("input#product").value).toBe("Apfelsaft (juice-1) — CHF 3.00")

  if (action === "adding") {
    await click(buttonWithText("Zum Warenkorb hinzufügen"))
    expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))[0].sku).toBe(product.sku)
  } else {
    await click(iconButton("ShoppingCartIcon"))
  }

  if (method === "button") {
    await click(iconButton("AddShoppingCartIcon"))
  } else {
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", bubbles: true }))
    })
  }

  expect(document.querySelector("input#product").value).toBe("")
  expect(buttonWithText("Zum Warenkorb hinzufügen")).toBeUndefined()
})
