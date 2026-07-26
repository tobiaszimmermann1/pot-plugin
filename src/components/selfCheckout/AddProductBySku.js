import React, { useState, useContext, useEffect, useRef } from "react"
import axios from "axios"
import { Button, Stack, TextField, Switch, Box, LinearProgress, Autocomplete, IconButton, InputAdornment, Chip } from "@mui/material"
import { List, ListItem, ListItemText, ListItemButton, ListItemAvatar, Avatar } from "@mui/material"
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider } from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon, Scale as ScaleIcon, Calculate as CalculateIcon } from "@mui/icons-material"
import { cartContext } from "./cartContext"
import { SmartScaleChip } from "./SmartScaleChip"
import { getProductListOverview, getProductBySku, getSelfCheckoutProducts, updateProductAmount, formatWeightDisplay } from "../products/products"
import FormControl from "@mui/material/FormControl"
import FavoriteIcon from "@mui/icons-material/Favorite"
const __ = wp.i18n.__

function AddProductBySku({ setShowCart, setAdding, scanResult, POSMode }) {
  const { cart, setCart } = useContext(cartContext)
  const [products, setProducts] = useState(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const [amount, setAmount] = useState(1)
  const [sku, setSku] = useState("")
  const [product, setProduct] = useState(null)
  const [freePosition, setFreePosition] = useState("")
  const [freePositionPrice, setFreePositionPrice] = useState(0)
  const [freeEntry, setFreeEntry] = useState(false)
  const [userWeightValue, setUserWeightValue] = useState(0)
  const [userFavorit, setUserFavorit] = useState(false)
  const [userTaraValue, setUserTaraValue] = useState(0)
  const [userTaraError, setUserTaraError] = useState("")
  const [userVerpackungen, setUserVerpackungen] = useState([])
  const [userVerpackungName, setUserVerpackungName] = useState("")
  const [userVerpackungFormVisible, showUserVerpackungForm] = useState(false)
  const [userProduktFavoriten, setUserProduktFavoriten] = useState([])
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcWeight, setCalcWeight] = useState("")
  const [calcPrice, setCalcPrice] = useState("")

  const calcWeightValid = calcWeight !== "" && isFinite(calcWeight) && parseFloat(calcWeight) > 0
  const calcPriceValid = calcPrice !== "" && isFinite(calcPrice) && parseFloat(calcPrice) > 0
  const calcValid = calcWeightValid && calcPriceValid
  const calcResult = Math.round(parseFloat(calcWeight) * parseFloat(calcPrice) * 100) / 100

  function applyCalc() {
    if (!calcValid) return
    setAmount(calcResult)
    setCalcOpen(false)
  }

  // Enter must be preventDefault'ed: the browser's pending default action would
  // click the calculator icon button once MUI restores focus to it, reopening the popup
  function calcKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      applyCalc()
    }
  }

  useEffect(() => {
    updateProducts()
    updateUserVerpackungen()
    updateUserProduktFavoriten()
  }, [])

  useEffect(() => {
    setUserFavorit(product ? isUserFavorit(product.sku) : false)
  }, [product])

  function addUserVerpackung() {
    axios
      .post(
        `${frontendLocalizer.apiUrl}/foodcoop/v1/addUserVerpackung`,
        {
          name: userVerpackungName,
          gewicht: userTaraValue
        },
        { headers: { "X-WP-Nonce": frontendLocalizer.nonce } }
      )
      .then(function (response) {
        showUserVerpackungForm(false)
        setUserVerpackungName(null)

        if (response.data.userVerpackungen) {
          setUserVerpackungen(response.data.userVerpackungen)
        }
      })
      .catch(error => console.log(error))
  }

  function removeUserVerpackung(name) {
    axios
      .post(
        `${frontendLocalizer.apiUrl}/foodcoop/v1/removeUserVerpackung`,
        {
          name: name
        },
        { headers: { "X-WP-Nonce": frontendLocalizer.nonce } }
      )
      .then(function (response) {
        if (response.data.userVerpackungen) {
          setUserVerpackungen(response.data.userVerpackungen)
        }
      })
      .catch(error => console.log(error))
  }

  function updateProducts() {
    let reArrangeProductData = []
    getSelfCheckoutProducts()
      .then(function (scProds) {
        getProductListOverview()
          .then(function (response) {
            if (response.products) {
              const prod = response.products
              Object.keys(prod).forEach(function (key) {
                let product = prod[key]

                if (scProds.includes(product.id)) {
                  product.label = product.name + " (" + product.sku + ") — CHF " + parseFloat(product.price).toFixed(2) + (product.weight ? " / " + formatWeightDisplay(product.weight, product.weight_unit) : "")

                  reArrangeProductData.push(product)

                  if (product.sku == scanResult) {
                    setProduct(product)
                    setSku(product.sku)
                  }
                }
              })
              setProducts(reArrangeProductData)
              setProductsLoading(false)
            }
          })
          .catch(error => console.log(error))
      })
      .catch(error => console.log(error))
  }

  function updateUserVerpackungen() {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getUserVerpackungen`, {
        headers: { "X-WP-Nonce": frontendLocalizer.nonce }
      })
      .then(function (response) {
        if (response.data.userVerpackungen) {
          setUserVerpackungen(response.data.userVerpackungen)
        }
      })
      .catch(error => console.log(error))
  }

  function updateUserProduktFavoriten() {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getUserProduktFavoriten`, {
        headers: { "X-WP-Nonce": frontendLocalizer.nonce }
      })
      .then(function (response) {
        if (response.data.userProduktFavoriten) {
          setUserProduktFavoriten(response.data.userProduktFavoriten)
        }
      })
      .catch(error => console.log(error))
  }

  function addProduct() {
    getProductBySku(sku).then(product => {
      const cartItem = JSON.parse(JSON.stringify(product))

      cartItem.order_type = "self_checkout"
      cartItem.amount = amount

      updateProductAmount(cartItem, userWeightValue, userTaraValue)

      cart.push(cartItem)

      localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(cart))

      setAdding(false)
      setShowCart(true)
    })
  }

  function isUserFavorit(id) {
    return userProduktFavoriten ? userProduktFavoriten.indexOf(id) >= 0 : false
  }

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

  function resetProduct() {
    setProduct(null)
  }

  function toggleUserFavorit() {
    axios
      .post(
        `${frontendLocalizer.apiUrl}/foodcoop/v1/toggleUserProduktFavorit`,
        {
          sku: product.sku
        },
        {
          headers: { "X-WP-Nonce": frontendLocalizer.nonce }
        }
      )
      .then(function (response) {
        setUserFavorit(response.data.userFavorit)
        setUserProduktFavoriten(response.data.userProduktFavoriten)
      })
      .catch(error => console.log(error))
  }

  useEffect(() => {
    !POSMode && setFreeEntry(false)
  }, [POSMode])

  return (
    <>
      {!productsLoading ? (
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
                {userVerpackungFormVisible ? (
                  <>
                    <FormControl>
                      <TextField id="userTaraValue" value={userTaraValue} onChange={e => setUserTaraValue(e.target.value)} variant="outlined" type="number" label={__("Verpackungsgewicht", "fcplugin") + " ( kg )"} InputProps={{ endAdornment: <SmartScaleChip onApply={setUserTaraValue} /> }} />
                      {userTaraError ? <span> {__(userTaraError, "fcplugin")}</span> : <span />}
                    </FormControl>
                    <FormControl>
                      <TextField id="userVerpackungName" value={userVerpackungName} onChange={e => setUserVerpackungName(e.target.value)} variant="outlined" type="text" label={__("Name der Verpackung", "fcplugin")} />
                    </FormControl>
                    <Button onClick={addUserVerpackung} variant="contained" size="large" color={POSMode ? "POSModeColor" : "primary"}>
                      {__("Verpackung speichern", "fcplugin")}
                    </Button>
                  </>
                ) : (
                  <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
                    {products && (
                      <Autocomplete
                        sx={{ width: "100%" }}
                        value={product}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(event, newValue) => {
                          setProduct(newValue)
                          setSku(newValue ? newValue.sku : null)
                        }}
                        id="product"
                        options={products}
                        disablePortal
                        renderInput={params => (
                          <TextField
                            {...params}
                            autoFocus
                            label={__("Produkt", "fcplugin")}
                            className="autocompleteField"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: product ? (
                                <>
                                  <InputAdornment position="end">
                                    <IconButton onClick={toggleUserFavorit}>
                                      <FavoriteIcon sx={{ color: userFavorit ? "red" : "black" }} />
                                    </IconButton>
                                  </InputAdornment>
                                  {params.InputProps.endAdornment}
                                </>
                              ) : null
                            }}
                          />
                        )}
                      />
                    )}

                    {product ? (
                      <>
                        {product.is_weighed ? (
                          <>
                            <FormControl>
                              <TextField id="userWeightValue" value={userWeightValue} onChange={e => setUserWeightValue(e.target.value)} variant="outlined" type="number" label={__("Totalgewicht", "fcplugin") + " ( " + product.weight_unit + " )"} InputProps={{ endAdornment: <SmartScaleChip onApply={setUserWeightValue} /> }} />
                            </FormControl>
                            <FormControl>
                              <TextField id="userTaraValue" value={userTaraValue} onChange={e => setUserTaraValue(e.target.value)} variant="outlined" type="number" label={__("Verpackungsgewicht", "fcplugin") + " ( kg )"} InputProps={{ endAdornment: <SmartScaleChip onApply={setUserTaraValue} /> }} />
                              {userTaraError ? <span> {__(userTaraError, "fcplugin")}</span> : <span />}
                            </FormControl>
                            <Button onClick={addProduct} variant="contained" size="large" color={POSMode ? "POSModeColor" : "primary"}>
                              {__("Zum Warenkorb hinzufügen", "fcplugin")}
                            </Button>
                            <List dense={true}>
                              <ListItem
                                disableGutters
                                secondaryAction={
                                  <IconButton
                                    onClick={() => {
                                      showUserVerpackungForm(true)
                                    }}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                }
                              >
                                <ListItemText>
                                  <strong>{__(userVerpackungen.length > 0 ? "Gespeicherte Verpackungen" : "Verpackung speichern", "fcplugin")}</strong>
                                </ListItemText>
                              </ListItem>
                              {userVerpackungen.map(verpackung => (
                                <ListItem
                                  disableGutters
                                  secondaryAction={
                                    <IconButton
                                      onClick={() => {
                                        removeUserVerpackung(verpackung.name)
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  }
                                >
                                  <ListItemButton
                                    onClick={() => {
                                      setUserTaraValue(verpackung.gewicht)
                                    }}
                                  >
                                    <ListItemText primary={verpackung.name + " ( " + verpackung.gewicht + " kg)"} />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </>
                        ) : (
                          <>
                            <FormControl>
                              <TextField
                                id="amount"
                                autoFocus
                                value={amount}
                                onChange={e => setAmount(e.target.value.replace(",", "."))}
                                onKeyDown={e => e.key === "Enter" && addProduct()}
                                variant="outlined"
                                type="text"
                                inputProps={{ inputMode: "decimal" }}
                                label={__("Menge", "fcplugin")}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => {
                                          setCalcWeight("")
                                          setCalcPrice("")
                                          setCalcOpen(true)
                                        }}
                                      >
                                        <CalculateIcon />
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </FormControl>
                            <Dialog open={calcOpen} maxWidth="lg" scroll="paper">
                              <DialogTitle>{__("Menge berechnen", "fcplugin")}</DialogTitle>
                              <Divider />
                              <DialogContent>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ paddingTop: "10px" }}>
                                  <TextField autoFocus type="text" inputProps={{ inputMode: "decimal" }} variant="outlined" label={__("Gewicht", "fcplugin")} value={calcWeight} onChange={e => setCalcWeight(e.target.value.replace(",", "."))} onKeyDown={calcKeyDown} error={calcWeight !== "" && !calcWeightValid} helperText={calcWeight !== "" && !calcWeightValid ? __("Ungültige Zahl", "fcplugin") : " "} />
                                  <span>&times;</span>
                                  <TextField type="text" inputProps={{ inputMode: "decimal" }} variant="outlined" label={__("Preis", "fcplugin")} value={calcPrice} onChange={e => setCalcPrice(e.target.value.replace(",", "."))} onKeyDown={calcKeyDown} error={calcPrice !== "" && !calcPriceValid} helperText={calcPrice !== "" && !calcPriceValid ? __("Ungültige Zahl", "fcplugin") : " "} />
                                  <span>= {calcValid ? calcResult.toFixed(2) : "–"}</span>
                                </Stack>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={() => setCalcOpen(false)} variant="outlined" color="error" sx={{ marginBottom: "15px" }} size="large">
                                  {__("Abbrechen", "fcplugin")}
                                </Button>
                                <Button onClick={applyCalc} disabled={!calcValid} variant="contained" sx={{ marginBottom: "15px", marginRight: "10px" }} size="large">
                                  OK
                                </Button>
                              </DialogActions>
                            </Dialog>
                            <Button onClick={addProduct} variant="contained" size="large" color={POSMode ? "POSModeColor" : "primary"}>
                              {__("Zum Warenkorb hinzufügen", "fcplugin")}
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <List>
                          <ListItem disableGutters>
                            <ListItemAvatar>
                              <Avatar>
                                <FavoriteIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText>
                              <strong>{__("Deine Favoriten", "fcplugin")}</strong>
                            </ListItemText>
                          </ListItem>
                          {products
                            .filter(function (product) {
                              const productExists = cart.some(cartItem => {
                                return product.sku === cartItem.sku
                              })

                              return !productExists && isUserFavorit(product.sku)
                            })
                            .map(product => (
                              <ListItem disableGutters key={product.sku}>
                                <ListItemButton
                                  onClick={() => {
                                    setProduct(product)
                                    setSku(product ? product.sku : null)
                                  }}
                                >
                                  <ListItemAvatar>
                                    <Avatar>{product.img ? <img src={product.img} width={"50px"} height={"50px"} /> : <span />}</Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary={product.label} />
                                </ListItemButton>
                              </ListItem>
                            ))}
                        </List>
                      </>
                    )}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </>
      ) : (
        <Box sx={{ width: "98%" }}>
          <LinearProgress />
        </Box>
      )}
    </>
  )
}

export default AddProductBySku
