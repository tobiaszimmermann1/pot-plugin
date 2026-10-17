import React from "react"
import ReactDOM from "react-dom"
import { act, Simulate } from "react-dom/test-utils"
import axios from "axios"
import { getProductListOverview, getProductBySku, getSelfCheckoutProducts } from "../src/components/products/products"

jest.mock("axios", () => ({ get: jest.fn() }))
jest.mock("../src/components/products/products", () => ({
  getProductListOverview: jest.fn(),
  getProductBySku: jest.fn(),
  getSelfCheckoutProducts: jest.fn(),
  updateProductAmount: jest.fn(),
  formatWeightDisplay: jest.requireActual("../src/components/products/products").formatWeightDisplay
}))
jest.mock("../src/components/selfCheckout/SelfCheckoutCart", () => () => null)
jest.mock("../src/components/selfCheckout/SmartScaleChip", () => ({ SmartScaleChip: () => null }))
jest.mock("html5-qrcode", () => ({
  Html5Qrcode: Object.assign(jest.fn(), { getCameras: jest.fn() })
}))
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

test("finds an exact single-digit product number first and adds the selected product", async () => {
  const products = [
    { id: 2, sku: "20", name: "Apfelsaft", price: 7.5 },
    { id: 3, sku: "30", name: "Reis", price: 2, weight: 0.7, weight_unit: "kg" },
    { id: 4, sku: "107", name: "Salz", price: 2 },
    { id: 5, sku: "70", name: "Zucker", price: 2 },
    { id: 6, sku: "7", name: "Mehl", price: 3 }
  ]
  getSelfCheckoutProducts.mockResolvedValue(products.map(product => product.id))
  getProductListOverview.mockResolvedValue({ products })
  getProductBySku.mockResolvedValue(products[4])
  const SelfCheckout = require("../src/SelfCheckout").default
  await act(async () => {
    ReactDOM.render(<SelfCheckout />, container)
  })

  await click(iconButton("AddShoppingCartIcon"))
  const input = document.querySelector("input#product")
  await act(async () => {
    Simulate.change(input, { target: { value: "7" } })
  })

  const options = [...document.querySelectorAll('[role="option"]')]
  expect(options.map(option => option.textContent)).toEqual([
    "Mehl (7) — CHF 3.00",
    "Zucker (70) — CHF 2.00",
    "Salz (107) — CHF 2.00"
  ])
  await click(options[0])
  await click(buttonWithText("Zum Warenkorb hinzufügen"))

  expect(getProductBySku).toHaveBeenCalledWith("7")
  expect(JSON.parse(localStorage.getItem("fc_selfcheckout_cart"))[0].sku).toBe("7")
})

test("ranks the scanner's manual search by product number and returns the selected SKU", async () => {
  const QrScanner = jest.requireActual("../src/components/selfCheckout/QrScanner").default
  require("html5-qrcode").Html5Qrcode.getCameras.mockResolvedValue([])
  const updateScanResult = jest.fn()
  const products = [
    { id: 1, sku: "107", name: "Salz" },
    { id: 2, sku: "70", name: "Zucker" },
    { id: 3, sku: "7", name: "Mehl" }
  ]
  await act(async () => {
    ReactDOM.render(<QrScanner products={products} updateScanResult={updateScanResult} />, container)
  })
  const input = document.querySelector('[role="combobox"]')
  await act(async () => {
    input.focus()
    Simulate.change(input, { target: { value: "7" } })
  })

  const options = [...document.querySelectorAll('[role="option"]')]
  expect(options.map(option => option.textContent)).toEqual(["Mehl (7)", "Zucker (70)", "Salz (107)"])
  await click(options[0])

  expect(console).toHaveLoggedWith("Selected product from manual input: ", "7")
  expect(updateScanResult).toHaveBeenCalledWith("7")
})
