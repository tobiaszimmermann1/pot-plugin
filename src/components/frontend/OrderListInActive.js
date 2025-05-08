import React, { useState, useEffect } from "react"
import axios from "axios"
import { Box, LinearProgress } from "@mui/material"
import ProductCategory from "./ProductCategory"
import { ShoppingContext, TriggerContext } from "./ShoppingContext"

const __ = wp.i18n.__

const OrderListInActive = () => {
  const [products, setProducts] = useState(null)
  const [publicPrices, setPublicPrices] = useState(null)
  const [additionalProductInformation, setAdditionalProductInformation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shoppingList, setShoppingList] = useState({})
  const [trigger, setTrigger] = useState(0)

  /**
   * Get Data for Bestellrunde
   */
  const [allProducts, setAllProducts] = useState()
  const [categories, setCategories] = useState(null)
  const [cats, setCats] = useState(null)
  const [currency, setCurrency] = useState(null)

  useEffect(() => {
    axios
      .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductListInActive`)
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)

          setAllProducts(res[3])

          let productsByCategory = {}
          res[4].map(category => {
            productsByCategory[category] = []
          })

          setCategories(productsByCategory)
          setCats(res[4])
          setCurrency(res[7])
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Prepare product data for order table
   */
  useEffect(() => {
    // go through each procduct, rearrange its information and add to productsByCategory object
    if (allProducts && categories) {
      let productsByCategory = categories

      allProducts.map(p => {
        let productToDo = {}
        productToDo.amount = 0
        productToDo.name = p.name
        productToDo.unit = p._einheit
        productToDo.lot = p._gebinde
        productToDo.details = `<strong>${p._produzent}</strong> (${p._herkunft})<br /> <i style="font-size:0.75rem;margin-top: 5px;">${__("geliefert von", "fcplugin")} ${p._lieferant}</i>`
        productToDo.category = p.category_name
        productToDo.id = p.id
        productToDo.short_description = p.short_description
        productToDo.image = p.image
        productToDo.thumbnail = p.thumbnail
        productToDo.description = p.description
        productToDo.tax = p.tax
        productToDo.loonity_id = p._loonity_id
        productToDo.produzent = p._produzent
        productToDo.lieferant = p._lieferant
        productToDo.herkunft = p._herkunft

        productToDo.price = p.price
        // public prices?
        if (frontendLocalizer.currentUser.ID || publicPrices) {
          productToDo.price = p.price
        } else {
          productToDo.price = 0
        }

        productsByCategory[p.category_name].push(productToDo)
      })

      setProducts(productsByCategory)
    }
  }, [allProducts, categories])

  /**
   * Get options for product list
   */
  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_public_prices`)
      .then(function (response) {
        if (response.data) {
          response.data === '"0"' ? setPublicPrices(false) : setPublicPrices(true)
        }
      })
      .catch(error => console.log(error))

    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_public_products`)
      .then(function (response) {
        if (response.data) {
          response.data === '"0"' ? setAdditionalProductInformation(false) : setAdditionalProductInformation(true)
        }
      })
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    if (currency && allProducts && categories && products) {
      setLoading(false)
    }
  }, [currency, allProducts, categories, products])

  return !loading ? (
    <TriggerContext.Provider value={trigger}>
      <ShoppingContext.Provider value={shoppingList}>
        <Box sx={{ marginBottom: "200px" }}>{cats.map(cat => products[cat].length > 0 && <ProductCategory publicPrices={publicPrices} additionalProductInformation={additionalProductInformation} currency={currency} setTrigger={setTrigger} setShoppingList={setShoppingList} products={products[cat]} title={cat} key={cat} activeState={false} />)}</Box>
      </ShoppingContext.Provider>
    </TriggerContext.Provider>
  ) : (
    <Box sx={{ width: "100%" }}>
      <LinearProgress />
    </Box>
  )
}

export default OrderListInActive
