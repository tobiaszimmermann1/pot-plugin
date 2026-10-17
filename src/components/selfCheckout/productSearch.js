function normalizeSearchText(value) {
  return String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function filterProductOptions(options, { inputValue }) {
  const input = normalizeSearchText(inputValue)
  if (!input) return options

  const exactMatches = []
  const prefixMatches = []
  const otherMatches = []

  options.forEach(option => {
    const sku = normalizeSearchText(option.sku)

    if (sku === input) {
      exactMatches.push(option)
    } else if (sku.startsWith(input)) {
      prefixMatches.push(option)
    } else if (sku.includes(input) || normalizeSearchText(option.name).includes(input)) {
      otherMatches.push(option)
    }
  })

  return [...exactMatches, ...prefixMatches, ...otherMatches]
}
