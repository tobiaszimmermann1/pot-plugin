import { getCartAvailability } from "../src/components/selfCheckout/cartAvailability"

const product = { id: 1, stock: 2, stock_status: "instock", is_in_stock: true, is_purchasable: true, managing_stock: true, backorders_allowed: false }
const cart = [{ id: 1, amount: 1 }]

test("does not assume availability before the fresh check completes", () => {
  expect(getCartAvailability(cart, null)).toEqual([null])
})

test.each([
  [],
  [{ ...product, is_purchasable: false }],
  [{ ...product, is_in_stock: false }],
  [{ ...product, stock_status: "outofstock" }]
].map(products => [products]))("warns for a missing or unavailable product: %p", products => {
  expect(getCartAvailability(cart, products)).toEqual(["unavailable"])
})

test("uses current product data instead of stale cart stock", () => {
  expect(getCartAvailability([{ ...product, amount: 1, is_in_stock: false }], [product])).toEqual([null])
})

test("sums duplicate rows and updates warnings when quantities are reduced", () => {
  expect(getCartAvailability([{ id: 1, amount: 1.5 }, { id: "1", amount: "1" }], [product])).toEqual(["insufficient_stock", "insufficient_stock"])
  expect(getCartAvailability([{ id: 1, amount: 0.5 }, { id: "1", amount: 1 }], [product])).toEqual([null, null])
})

test.each([{ backorders_allowed: true }, { managing_stock: false }, { stock: null }])("respects stock settings: %p", settings => {
  expect(getCartAvailability([{ id: 1, amount: 3 }], [{ ...product, ...settings }])).toEqual([null])
})
