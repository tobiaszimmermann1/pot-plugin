import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Box, Typography, Button, Alert, LinearProgress } from "@mui/material"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { format } from "date-fns"
import BedtimeIcon from "@mui/icons-material/Bedtime"
import ProductCategory from "./ProductCategory"
import { ShoppingContext, TriggerContext } from "./ShoppingContext"
import OrderOverview from "./OrderOverview"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

const __ = wp.i18n.__

const OrderList = ({ activeBestellrunde, activeOrderRoundData, setActiveOrderRoundData, setActiveOrderRound }) => {
  const [products, setProducts] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [cart, setCart] = useState(null)
  const [cartNonce, setCartNonce] = useState(null)
  const [publicPrices, setPublicPrices] = useState(null)
  const [additionalProductInformation, setAdditionalProductInformation] = useState(null)
  const [stockManagement, setStockManagement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shoppingList, setShoppingList] = useState({})
  const [trigger, setTrigger] = useState(0)

  const stockAlert = useRef()
  const cartAlert = useRef()
  const orderAlert = useRef()

  /**
   * Get Data for Bestellrunde
   */
  const [allProducts, setAllProducts] = useState()
  const [bestellrundenProducts, setBestellrundenProducts] = useState()
  const [categories, setCategories] = useState()
  const [bestellrundenDates, setBestellrundenDates] = useState()
  const [nextBestellrunde, setNextBestellrunde] = useState()
  const [activeState, setActiveState] = useState(null)
  const [order, setOrder] = useState(null)
  const [currency, setCurrency] = useState(null)
  const [showTaxes, setShowTaxes] = useState(false)

  useEffect(() => {
    axios
      .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductList`, {
        user: frontendLocalizer.currentUser.ID,
        bestellrunde: activeBestellrunde
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)
          setAllProducts(res[3])
          setBestellrundenProducts(res[2])
          setCategories(res[4])
          setActiveState(res[0])
          setBestellrundenDates(res[6])
          setNextBestellrunde(res[8])
          if (res[5] !== null) {
            setOrder(res[5])
          }
          setCurrency(res[7])
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Get cart data of user
   */
  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items`)
      .then(function (response) {
        setCartNonce(response.headers["nonce"])
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
        productToDo.details = `<strong>${p._produzent}</strong> (${p._herkunft})<br /> <i style="font-size:0.75rem;margin-top:5px;">${__("Geliefert von", "fcplugin")} ${p._lieferant}</i>`
        productToDo.category = p.category_name
        productToDo.id = p.id
        productToDo.short_description = p.short_description
        productToDo.image = p.image
        productToDo.description = p.description
        productToDo.stock = p.stock
        productToDo.tax = p.tax

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

    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=woocommerce_manage_stock`)
      .then(function (response) {
        if (response.data) {
          response.data === '"yes"' ? setStockManagement(true) : setStockManagement(false)
        }
      })
      .catch(error => console.log(error))

    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_taxes`)
      .then(function (response) {
        if (response.data) {
          response.data === '"1"' ? setShowTaxes(true) : setShowTaxes(false)
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
        {frontendLocalizer.currentUser.ID ? <OrderOverview currency={currency} order={order} cartNonce={cartNonce} activeState={activeState} cart={cart} activeBestellrunde={activeBestellrunde} /> : ""}
        {activeState && bestellrundenDates ? (
          <>
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
              <Button
                startIcon={<ArrowBackIcon />}
                variant="text"
                onClick={() => {
                  setActiveOrderRound(null)
                  setActiveOrderRoundData(null)
                }}
              >
                {__("zurück", "fcplugin")}
              </Button>
            </div>

            <h2 className="fc_order_list_header_info">
              <div className="fc_order_list_header_infos">
                <div style={{ backgroundImage: activeOrderRoundData[2] ? `url(${activeOrderRoundData[2]})` : `url(${frontendLocalizer.pluginUrl}/images/bestellrunde.png`, backgroundSize: "cover", backgroundPosition: "center center" }} className="fc_order_list_header_image" />
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <h2>
                          <strong>{__("Bestellrunde: ", "fcplugin")}</strong>{" "}
                        </h2>
                      </td>
                      <td>
                        <h2>
                          <strong>{activeOrderRoundData[0]}</strong> ({activeOrderRoundData[1]})
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{__("Bestellfenster: ", "fcplugin")}</strong>{" "}
                      </td>
                      <td>
                        <strong>{format(new Date(bestellrundenDates[0]), "dd.MM.yyyy")}</strong> {__("bis", "fcplugin")} <strong>{format(new Date(bestellrundenDates[1]), "dd.MM.yyyy")}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{__("Abholen: ", "fcplugin")}</strong>{" "}
                      </td>
                      <td>
                        <strong>{format(new Date(bestellrundenDates[2]), "dd.MM.yyyy")}</strong>{" "}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="fc_order_list_header_alerts">
                <span className="fc_order_list_header_steps">{__("Schritt 1 / 2: Produkte auswählen und in den Warenkorb legen. Der Warenkorb bleibt gespeichert.", "fcplugin")}</span>

                {stockManagement && (
                  <Alert
                    sx={{ marginBottom: 1 }}
                    severity="info"
                    onClose={() => {
                      stockAlert.current.classList.add("fc_hide")
                    }}
                    ref={stockAlert}
                  >
                    {__("Die Lagerverwaltung ist aktiviert. Du kannst nur so viel bestellen wie derzeit an Lager ist. Gespeicherte Bestellungen wurden allenfalls den verfügbaren Mengen angepasst.", "fcplugin")}
                  </Alert>
                )}
                {order && (
                  <Alert
                    sx={{ marginBottom: 1 }}
                    severity="info"
                    onClose={() => {
                      cartAlert.current.classList.add("fc_hide")
                    }}
                    ref={cartAlert}
                  >
                    {__("Du hast in dieser Bestellrunde schon bestellt. Deine aktuelle Bestellung wurde geladen.", "fcplugin")}
                  </Alert>
                )}
                {cart && (
                  <Alert
                    sx={{ marginBottom: 1 }}
                    severity="info"
                    onClose={() => {
                      orderAlert.current.classList.add("fc_hide")
                    }}
                    ref={orderAlert}
                  >
                    {__("Du hast gespeicherte Produkte im Warenkorb. Prüfe deine Bestellung.", "fcplugin")}
                  </Alert>
                )}
              </div>
            </h2>
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
        <Box sx={{ marginBottom: "200px" }}>{categories.map(cat => products[cat].length > 0 && <ProductCategory showTaxes={showTaxes} stockManagement={stockManagement} publicPrices={publicPrices} additionalProductInformation={additionalProductInformation} currency={currency} setTrigger={setTrigger} setShoppingList={setShoppingList} products={products[cat]} title={cat} key={cat} activeState={activeState} />)}</Box>
      </ShoppingContext.Provider>
    </TriggerContext.Provider>
  ) : (
    <Box sx={{ width: "100%" }}>
      <LinearProgress />
    </Box>
  )
}

export default OrderList
