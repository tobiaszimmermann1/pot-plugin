import { filterProductOptions } from "../src/components/selfCheckout/productSearch"

test.each(["1", "2", "3", "4", "5", "6", "7", "8", "9"])("ranks exact product number %s before prefixes and other matches", inputValue => {
  const options = [
    { sku: `0${inputValue}`, name: "Other number" },
    { sku: `${inputValue}0`, name: "First prefix" },
    { sku: "name-match", name: `Product ${inputValue}` },
    { sku: `${inputValue}1`, name: "Second prefix" },
    { sku: inputValue, name: "Exact number" }
  ]

  expect(filterProductOptions(options, { inputValue }).map(option => option.sku)).toEqual([
    inputValue, `${inputValue}0`, `${inputValue}1`, `0${inputValue}`, "name-match"
  ])
})

test("ignores matches found only in the displayed price or weight", () => {
  const options = [
    { sku: "20", name: "Apfelsaft", price: 7.5, label: "Apfelsaft (20) — CHF 7.50" },
    { sku: "30", name: "Reis", weight: 0.7, label: "Reis (30) — CHF 2.00 / 700 g" },
    { sku: "7", name: "Mehl", label: "Mehl (7) — CHF 3.00" }
  ]

  expect(filterProductOptions(options, { inputValue: "7" })).toEqual([options[2]])
})

test.each(["  CREME  ", "crème", "CRÈME"])("searches names without case or accent sensitivity: %s", inputValue => {
  const options = [{ sku: "10", name: "Crème fraîche" }, { sku: "20", name: "Mehl" }]

  expect(filterProductOptions(options, { inputValue })).toEqual([options[0]])
})

test("ranks alphanumeric product numbers without case sensitivity", () => {
  const options = [
    { sku: "JUICE-10", name: "Apfelsaft" },
    { sku: "juice-1", name: "Birnensaft" }
  ]

  expect(filterProductOptions(options, { inputValue: " JUICE-1 " })).toEqual([options[1], options[0]])
})

test("preserves leading zeros in product numbers", () => {
  const options = [{ sku: "7", name: "Mehl" }, { sku: "0070", name: "Reis" }, { sku: "007", name: "Salz" }]

  expect(filterProductOptions(options, { inputValue: "007" })).toEqual([options[2], options[1]])
})

test.each(["", "   "])("keeps the original product order for an empty search: %j", inputValue => {
  const options = [{ sku: "70", name: "Mehl" }, { sku: "7", name: "Reis" }]

  expect(filterProductOptions(options, { inputValue })).toEqual(options)
})

test("returns no options for an unmatched query", () => {
  expect(filterProductOptions([{ sku: "7", name: "Mehl" }], { inputValue: "unknown" })).toEqual([])
})
