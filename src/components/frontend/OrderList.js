import React, { useState, useEffect, useRef, useMemo, createContext } from "react"
import axios from "axios"
import { Box, Stack, Typography, Button, CircularProgress } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { format } from "date-fns"
import CelebrationIcon from "@mui/icons-material/Celebration"
import BedtimeIcon from "@mui/icons-material/Bedtime"
import ProductCategory from "./ProductCategory"
import { ShoppingContext, TriggerContext } from "./ShoppingContext"
import OrderOverview from "./OrderOverview"
const __ = wp.i18n.__

const OrderList = ({ currency, order, allProducts, bestellrundenProducts, bestellrundenDates, activeBestellrunde, nextBestellrunde, activeState, categories }) => {
  const [products, setProducts] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [cart, setCart] = useState(null)
  const [cartNonce, setCartNonce] = useState(null)
  const [publicPrices, setPublicPrices] = useState(null)
  const [additionalProductInformation, setAdditionalProductInformation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shoppingList, setShoppingList] = useState({})
  const [trigger, setTrigger] = useState(0)

  /**
   * Get cart data of user
   */
  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items`)
      .then(function (response) {
        setCartNonce(response.headers["x-wc-store-api-nonce"])
        if (response?.data?.length > 0) {
          const res = response.data
          let cartData = []
          res.map(item => {
            cartData.push([item.id, item.quantity, item.name, item.prices.price / 100])
          })
          setCart(cartData)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Prepare product data for order table
   */
  useEffect(() => {
    // create object from categories, to which we can then add all the products, sorted by category
    let productsByCategory = {}
    if (categories) {
      categories.map(category => {
        productsByCategory[category] = []
      })
    }

    // go through each procduct, rearrange its information and add to productsByCategory object
    if (allProducts && activeState !== null) {
      allProducts.map(p => {
        let productToDo = {}
        productToDo.amount = p.amount
        productToDo.name = p.name
        productToDo.unit = p._einheit
        productToDo.lot = p._gebinde
        productToDo.details = p._lieferant + ", " + p._herkunft
        productToDo.category = p.category_name
        productToDo.id = p.id
        productToDo.short_description = p.short_description
        productToDo.image = p.image
        productToDo.description = p.description

        productToDo.price = p.price
        // public prices?
        if (frontendLocalizer.currentUser.ID || publicPrices) {
          productToDo.price = p.price
        } else {
          productToDo.price = 0
        }

        if (activeState) {
          if (bestellrundenProducts) {
            if (bestellrundenProducts.includes(p.id.toString())) {
              if (cart) {
                cart.map(item => {
                  if (item[0] === p.id) {
                    productToDo.amount = item[1]
                  }
                })
              }
              productsByCategory[p.category_name].push(productToDo)
            }
          }
        } else {
          productsByCategory[p.category_name].push(productToDo)
        }
      })

      setProducts(productsByCategory)
      setProductsLoading(false)
    }
  }, [bestellrundenProducts, publicPrices, allProducts, cart, activeState])

  /**
   * Get options for product list
   */
  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_public_prices`)
      .then(function (response) {
        if (response.data) {
          response.data.length === 3 ? setPublicPrices(true) : setPublicPrices(false)
        }
      })
      .catch(error => console.log(error))

    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_public_products`)
      .then(function (response) {
        if (response.data) {
          response.data.length === 3 ? setAdditionalProductInformation(true) : setAdditionalProductInformation(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    if (currency && allProducts && categories) {
      setLoading(false)
    }
  }, [activeState, bestellrundenDates, currency, order, allProducts, bestellrundenProducts, bestellrundenDates, activeBestellrunde, activeState, categories])

  return !loading ? (
    <TriggerContext.Provider value={trigger}>
      <ShoppingContext.Provider value={shoppingList}>
        {frontendLocalizer.currentUser.ID ? <OrderOverview currency={currency} order={order} cartNonce={cartNonce} activeState={activeState} cart={cart} /> : ""}
        {activeState && bestellrundenDates ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "14pt", marginBottom: "20px", textAlign: "right" }}>
              <CelebrationIcon /> {__("Aktuell ist das Bestellfenster geöffnet.", "fcplugin")}
            </Typography>
            <table>
              <tbody>
                <tr>
                  <td>
                    <strong>{__("Bestellrunde: ", "fcplugin")}</strong>{" "}
                  </td>
                  <td>{activeBestellrunde} </td>
                </tr>
                <tr>
                  <td>
                    <strong>{__("Bestellfenster: ", "fcplugin")}</strong>{" "}
                  </td>
                  <td>
                    {format(new Date(bestellrundenDates[0]), "dd.MM.yyyy")} {__("bis", "fcplugin")} {format(new Date(bestellrundenDates[1]), "dd.MM.yyyy")}{" "}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>{__("Verteiltag: ", "fcplugin")}</strong>{" "}
                  </td>
                  <td>{format(new Date(bestellrundenDates[2]), "dd.MM.yyyy")} </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <Box sx={{}}>
            <Grid item xs={12}>
              <Card sx={{ minWidth: 275, borderRadius: 0, backgroundColor: "#f9f9f9", boxShadow: "none", border: "1px solid #f0f0f0" }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "right" }}>
                    <BedtimeIcon /> {__("Aktuell ist das Bestellfenster geschlossen.", "fcplugin")}
                  </Typography>
                  {nextBestellrunde.length !== 0 && (
                    <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "right", fontStyle: "italic" }}>
                      {__("Das nächste Bestellfenster", "fcplugin")}: {format(new Date(nextBestellrunde[0]), "dd.MM.yyyy")} {__("bis", "fcplugin")} {format(new Date(nextBestellrunde[1]), "dd.MM.yyyy")}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Box>
        )}
        <Box sx={{ marginBottom: "100px" }}>{categories.map(cat => products[cat].length > 0 && <ProductCategory publicPrices={publicPrices} additionalProductInformation={additionalProductInformation} currency={currency} setTrigger={setTrigger} setShoppingList={setShoppingList} products={products[cat]} title={cat} key={cat} activeState={activeState} />)}</Box>
      </ShoppingContext.Provider>
    </TriggerContext.Provider>
  ) : (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
      {__("Produkte werden geladen...", "fcplugin")} <CircularProgress />
    </div>
  )
}

export default OrderList
