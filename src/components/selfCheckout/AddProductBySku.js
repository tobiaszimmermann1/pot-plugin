import React, { useState, useContext, useEffect } from "react"
import axios from "axios"
import { Button, Stack, TextField, Switch, Box, LinearProgress, Autocomplete } from "@mui/material"
import { cartContext } from "./cartContext"
import { getProductListOverview, getSelfCheckoutProducts } from "../products/products"
import FormControl from "@mui/material/FormControl"
import WeightDialog from "./WeightDialog"
const __ = wp.i18n.__

function AddProductBySku({ setShowCart, setAdding, setProductError, POSMode }) {
  const { cart, setCart } = useContext(cartContext)
  const [products, setProducts] = useState(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const [amount, setAmount] = useState(1)
  const [sku, setSku] = useState("")
  const [freePosition, setFreePosition] = useState("")
  const [freePositionPrice, setFreePositionPrice] = useState(0)
  const [freeEntry, setFreeEntry] = useState(false)
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [weightProd, setWeightProd] = useState(false)
  const [userWeightValue, setUserWeightValue] = useState(0)
  const [isEneteringWeight, setIsEnteringWeight] = useState(false)

  const wc_weight_units = {
    kg: 1000,
    g: 1,
    lbs: 453.592,
    oz: 28.3495
  }

  useEffect(() => {
    let reArrangeProductData = []
    getSelfCheckoutProducts()
      .then(function (scProds) {
        getProductListOverview()
          .then(function (response) {
            if (response.products) {
              const prod = response.products
              Object.keys(prod).forEach(function (key, index) {
                if (scProds.includes(prod[key].id)) {
                  let productToDo = {}
                  productToDo.label = prod[key].name + " (" + prod[key].sku + "), " + prod[key].unit
                  productToDo.id = prod[key].id
                  productToDo.sku = prod[key].sku
                  reArrangeProductData.push(productToDo)
                }
              })
              setProducts(reArrangeProductData)
              setProductsLoading(false)
            }
          })
          .catch(error => console.log(error))
      })
      .catch(error => console.log(error))
  }, [])

  function addProduct() {
    const productExists = cart.some(cartItem => {
      return sku.toString() === cartItem.sku.toString()
    })
    if (productExists) {
      setProductError(__("Produkt ist schon im Warenkorb. Du kannst die Menge erhöhen", "fcplugin"))
      setShowCart(true)
      setAdding(false)
    } else {
      axios
        .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProduct?sku=${sku}`)
        .then(function (response) {
          if (response.data) {
            const res = JSON.parse(response.data)
            if (!res) {
              setProductError("Produkt nicht gefunden oder nicht an Lager.")
            } else {
              // if it is a weighed product and no custom amount was already entered, ask for the weight
              if (res.is_weighed) {
                setWeightProd(res)

                // Only show modal if weight is not already entered
                if (amount === 1) {
                  setWeightModalOpen(true)
                } else {
                  setUserWeightValue(amount)
                }

                setIsEnteringWeight(true)
              }
              // if it is not a weighed product, add it directly to the cart with quantity = 1
              else {
                // prepare cart
                let newCart = cart
                res.id = newCart.length
                res.order_type = "self_checkout"
                res.amount = amount
                newCart.push(res)
                setCart(newCart)
                if (newCart.length > 0) {
                  localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
                }
                setAdding(false)
                setShowCart(true)
              }
            }
          }
        })
        .catch(error => console.log(error))
    }
  }

  useEffect(() => {
    // add item to cart after the user has entered the weight
    if (userWeightValue !== 0 && weightProd) {
      const prodWeightInG = weightProd.weight * wc_weight_units[weightProd.weight_unit]
      if (prodWeightInG === 0) {
        setProductError("Produkt nicht kann nicht hinzugefügt werden. Konfigurationsfehler: Gewicht fehlt")
        setWeightProd(null)
        setWeightModalOpen(false)
        setIsEnteringWeight(false)
      } else {
        weightProd.amount = (userWeightValue * 1000) / prodWeightInG
        weightProd.userWeightValue = userWeightValue
        // prepare cart
        let newCart = cart
        weightProd.id = newCart.length
        weightProd.order_type = "self_checkout"
        newCart.push(weightProd)
        setCart(newCart)
        if (newCart.length > 0) {
          localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
        }
        setAdding(false)
        setShowCart(true)
      }
    }
  }, [userWeightValue])

  function addFreeProduct() {
    let newCart = cart
    newCart.push({
      id: newCart.length,
      order_type: "self_checkout",
      amount: 1,
      name: freePosition,
      price: parseFloat(freePositionPrice),
      product_id: 0,
      sku: "fcplugin_pos_product",
      unit: ""
    })
    setCart(newCart)
    setShowCart(true)
    setAdding(false)
    setFreeEntry(false)
    setFreePosition("")
    setFreePositionPrice(0)
  }

  useEffect(() => {
    !POSMode && setFreeEntry(false)
  }, [POSMode])

  return (
    <>
      {!productsLoading ? (
        !isEneteringWeight && (
          <>
            <Stack spacing={3} sx={{ width: "100%" }}>
              <strong>{__("Produkt hinzufügen", "fcplugin")}</strong>

              {POSMode && (
                <Box sx={{ marginRight: 2 }}>
                  {__("Position frei erfassen?", "fcplugin")} <Switch checked={freeEntry} onChange={event => setFreeEntry(event.target.checked)} inputProps={{ "aria-label": "freeEntry" }} color={"POSModeColor"} />
                </Box>
              )}

              {freeEntry ? (
                <>
                  <TextField size="normal" id="Freie Eingabe" label={__("Freie Eingabe", "fcplugin")} name="Freie Eingabe" variant="outlined" value={freePosition} onChange={e => setFreePosition(e.target.value)} autoFocus color={POSMode ? "POSModeColor" : "primary"} />
                  <TextField size="normal" id="Preis" label={__("Preis", "fcplugin")} name="Preis" variant="outlined" value={freePositionPrice} onChange={e => setFreePositionPrice(e.target.value)} autoFocus color={POSMode ? "POSModeColor" : "primary"} />
                  <Button onClick={addFreeProduct} variant="contained" size="large" color={POSMode ? "POSModeColor" : "primary"}>
                    {__("Zum Warenkorb hinzufügen", "fcplugin")}
                  </Button>
                </>
              ) : (
                <>
                  <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
                    {products && (
                      <Autocomplete
                        sx={{ width: "100%" }}
                        onChange={(event, newValue) => {
                          setSku(newValue.sku)
                        }}
                        id="product"
                        options={products}
                        disablePortal
                        renderInput={params => <TextField {...params} label={__("Produkt", "fcplugin")} className="autocompleteField" />}
                      />
                    )}

                    <FormControl>
                      <TextField id="amount" value={amount} onChange={e => setAmount(e.target.value)} variant="outlined" type="number" label={__("Menge oder Gewicht", "fcplugin")} />
                    </FormControl>
                  </Stack>

                  <Button onClick={addProduct} variant="contained" size="large" color={POSMode ? "POSModeColor" : "primary"}>
                    {__("Zum Warenkorb hinzufügen", "fcplugin")}
                  </Button>
                </>
              )}
            </Stack>
          </>
        )
      ) : (
        <Box sx={{ width: "98%" }}>
          <LinearProgress />
        </Box>
      )}
      {weightModalOpen && <WeightDialog setModalClose={setWeightModalOpen} prod={weightProd} setUserWeightValue={setUserWeightValue} setIsEnteringWeight={setIsEnteringWeight} amount={amount} />}
    </>
  )
}

export default AddProductBySku
