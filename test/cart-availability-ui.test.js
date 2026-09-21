import React from "react"
import ReactDOM from "react-dom"
import { act } from "react-dom/test-utils"
import { cartContext } from "../src/components/selfCheckout/cartContext"

jest.mock("../src/components/selfCheckout/SmartScaleChip", () => ({ SmartScaleChip: () => null }))
jest.mock("axios", () => ({}))

test("shows an accessible warning beside the affected product and removes it when resolved", () => {
  global.wp = { i18n: { __: text => text } }
  const SelfCheckoutCartItem = require("../src/components/selfCheckout/SelfCheckoutCartItem").default
  const container = document.createElement("div")
  document.body.appendChild(container)
  const product = { id: 1, name: "Apfelsaft", price: 3, amount: 1, is_weighed: false }
  const render = availabilityWarning => {
    act(() => {
      ReactDOM.render(
        <cartContext.Provider value={{ cart: [product], setCart: jest.fn() }}>
          <ul><SelfCheckoutCartItem productData={product} itemIndex={0} availabilityWarning={availabilityWarning} /></ul>
        </cartContext.Provider>, container
      )
    })
  }
  try {
    render("unavailable")
    expect(container.querySelector('[role="alert"]').textContent).toContain("Apfelsaft: Dieses Produkt ist nicht mehr verfügbar")
    render("insufficient_stock")
    expect(container.querySelector('[role="alert"]').textContent).toContain("verfügbaren Lagerbestand")
    render(null)
    expect(container.querySelector('[role="alert"]')).toBeNull()
  } finally {
    act(() => { ReactDOM.unmountComponentAtNode(container) })
    container.remove()
  }
})
