import React, { useState, useEffect, useRef, useMemo, createContext } from "react"
import axios from "axios"
import { Box, Stack, Typography, Button, CircularProgress } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import { format } from "date-fns"
import CelebrationIcon from "@mui/icons-material/Celebration"
import HourglassTopIcon from "@mui/icons-material/HourglassTop"
import ProductCategory from "./ProductCategory"
import { ShoppingContext, TriggerContext } from "./ShoppingContext"
import OrderOverview from "./OrderOverview"
const __ = wp.i18n.__

const OrderList = ({ allProducts, bestellrundenProducts, bestellrundenDates, activeBestellrunde, activeState, categories }) => {
  const [products, setProducts] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [currentTotal, setCurrentTotal] = useState(0)
  const [initialTotal, setInitialTotal] = useState(0)
  const [balance, setBalance] = useState(null)
  const [originalBalance, setOriginalBalance] = useState(0)
  const [cart, setCart] = useState(null)
  const [cartNonce, setCartNonce] = useState(null)
  const [publicPrices, setPublicPrices] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nmbr, setnmbr] = useState(0)
  const [shoppingList, setShoppingList] = useState({})
  const [trigger, setTrigger] = useState(0)

  /**
   * Get cart data of user
   */
  useEffect(() => {
    if (!originalBalance) {
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

          if (balance === null) {
            axios
              .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getBalance`, {
                id: frontendLocalizer.currentUser.ID
              })
              .then(function (response) {
                if (response.data) {
                  const res = JSON.parse(response.data)
                  let b = res
                  if (b === null) {
                    b = 0
                  }
                  setBalance(parseFloat(b))
                  setOriginalBalance(parseFloat(b))
                }
              })
              .catch(error => console.log(error))
              .finally(() => {
                setLoading(false)
              })
          }
        })
        .catch(error => console.log(error))
    }
    if (initialTotal > 0 && originalBalance !== null) {
      setOriginalBalance(originalBalance + initialTotal)
    }
  }, [initialTotal])

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
    let initialTotal = 0
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
                    initialTotal += item[1] * item[3]
                  }
                })
              } else {
                if (p.amount > 0) {
                  initialTotal += p.amount * p.price
                }
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
      setCurrentTotal(initialTotal)
      setInitialTotal(initialTotal)
    }
  }, [bestellrundenProducts, publicPrices, allProducts, cart, activeState])

  useEffect(() => {
    if (originalBalance) {
      setBalance(originalBalance - initialTotal)
    }
  }, [initialTotal, originalBalance])

  useEffect(() => {
    if (products) {
      let newCurrentTotal = 0
      products.map(row => {
        newCurrentTotal += parseFloat(row.amount) * parseFloat(row.price)
      })
      setCurrentTotal(newCurrentTotal)
      setBalance(originalBalance - newCurrentTotal)
    }
  }, [nmbr])

  /**
   * Determine if prices are shown publicly or not
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
  }, [])

  return !loading ? (
    <TriggerContext.Provider value={trigger}>
      <ShoppingContext.Provider value={shoppingList}>
        {frontendLocalizer.currentUser.ID && <OrderOverview balance={balance} cartNonce={cartNonce} />}
        {activeState && bestellrundenDates ? (
          <>
            <Box sx={{}}>
              <Grid item xs={12}>
                <Card sx={{ minWidth: 275, borderRadius: 0, backgroundColor: "#f9f9f9", boxShadow: "none", border: "1px solid #f0f0f0" }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "14pt", marginBottom: "20px" }}>
                      <CelebrationIcon /> {__("Aktuell ist das Bestellfenster geöffnet.", "fcplugin")}
                    </Typography>
                    <table>
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
                          {format(new Date(bestellrundenDates[0]), "dd.MM.yyyy")} bis {format(new Date(bestellrundenDates[1]), "dd.MM.yyyy")}{" "}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>{__("Verteiltag: ", "fcplugin")}</strong>{" "}
                        </td>
                        <td>{format(new Date(bestellrundenDates[2]), "dd.MM.yyyy")} </td>
                      </tr>
                    </table>
                  </CardContent>
                </Card>
              </Grid>
            </Box>
          </>
        ) : (
          <Box sx={{}}>
            <Grid item xs={12}>
              <Card sx={{ minWidth: 275, borderRadius: 0, backgroundColor: "#f9f9f9", boxShadow: "none", border: "1px solid #f0f0f0" }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    <HourglassTopIcon /> {__("Aktuell ist das Bestellfenster geschlossen.", "fcplugin")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Box>
        )}
        <Box sx={{ marginBottom: "100px" }}>{categories.map(cat => products[cat].length > 0 && <ProductCategory setTrigger={setTrigger} setShoppingList={setShoppingList} products={products[cat]} title={cat} key={cat} />)}</Box>
      </ShoppingContext.Provider>
    </TriggerContext.Provider>
  ) : (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <CircularProgress />
    </div>
  )
}

export default OrderList
