import React, { useState, useContext, useEffect } from "react"
import axios from "axios"
import { Button, Stack, TextField, Switch, Box, LinearProgress, Autocomplete } from "@mui/material"
import { cartContext } from "./cartContext"
import { getProductListOverview, getSelfCheckoutProducts } from "../products/products"
import FormControl from "@mui/material/FormControl"
import ImageList from "@mui/material/ImageList"
import ImageListItem from "@mui/material/ImageListItem"
import ImageListItemBar from "@mui/material/ImageListItemBar"
import FavoriteIcon from "@mui/icons-material/Favorite"
const __ = wp.i18n.__

function AddProductBySku({ setShowCart, setAdding, setProductError, POSMode, userProduktFavoriten }) {
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
  const [userTaraValue, setUserTaraValue] = useState(0)
  const [userTaraError, setUserTaraError] = useState('')

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
                  productToDo.label = prod[key].name + " ( #" + prod[key].sku + " )"
                  productToDo.id = prod[key].id
                  productToDo.sku = prod[key].sku
                  productToDo.unit = prod[key].unit
                  productToDo.is_weighed = prod[key].is_weighed
                  productToDo.image = prod[key].image
                  
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
              let w = formatWeight(userWeightValue);
              let t = formatWeight(userTaraValue);

              if ( w < t ) {
                setUserTaraError("Verpackungsgewicht ist grösser als das Totalgewicht");
                return;
              }

              // prepare cart
              let newCart = cart
              res.id = newCart.length
              res.order_type = "self_checkout"
              res.userFavorit = isUserFavorit(res.product_id)
              
              const prodWeightInG = res.weight * wc_weight_units[res.weight_unit]

              if ( res.is_weighed ) {
                res.userWeightValue = w;
                res.userTaraValue = t;

                res.amount = formatWeight((w - t) / prodWeightInG * 1000);
              } else {
                res.amount = amount
              }

              newCart.push(res)
              setCart(newCart)
              if (newCart.length > 0) {
                localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
              }
              setAdding(false)
              setShowCart(true)
            }
          }
        })
        .catch(error => console.log(error))
    }
  }

  function isUserFavorit(id){
    return userProduktFavoriten?userProduktFavoriten.indexOf(id) >= 0:false
  }

  function formatWeight(w){
    w = parseFloat(w);

    return Math.round(w*1000)/1000;
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
                <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
                  {products && (
                    <Autocomplete
                      sx={{ width: "100%" }}
                      value={product}
                      isOptionEqualToValue={(option, value) => option.id === value.id} 
                      onChange={(event, newValue) => {
                        setProduct(newValue)
                        setSku(newValue?newValue.sku:null)
                      }}
                      id="product"
                      options={products}
                      disablePortal
                      renderInput={params => <TextField {...params} label={__("Produkt", "fcplugin")} className="autocompleteField" />}
                    />
                  )}

                  { product ? (
                    <>
                      { product.is_weighed ? (
                        <>
                          <FormControl>
                            <TextField id="userWeightValue" value={userWeightValue} onChange={e => setUserWeightValue(e.target.value)} variant="outlined" type="number" label={__("Totalgewicht", "fcplugin") +' ( '+ product.unit +' )' } />
                          </FormControl>
                          <FormControl>
                            <TextField id="userTaraValue" value={userTaraValue} onChange={e => setUserTaraValue(e.target.value)} variant="outlined" type="number" label={__("Verpackungsgewicht", "fcplugin") +' ( '+ product.unit +' )'} />
                            {userTaraError? (<span> {__(userTaraError, "fcplugin")}</span>):(<span/>)}
                          </FormControl>
                        </>
                      ) : (
                        <FormControl>
                          <TextField id="amount" value={amount} onChange={e => setAmount(e.target.value)} variant="outlined" type="number" label={__("Menge", "fcplugin")} />
                        </FormControl>
                      )}

                      <Button onClick={addProduct} variant="contained" size="large" color={POSMode ? "POSModeColor" : "primary"}>
                        {__("Zum Warenkorb hinzufügen", "fcplugin")}
                      </Button>
                    </>
                  ) : (
                    <>
                    <h4><FavoriteIcon/>{__("Deine Favoriten", "fcplugin")}</h4>
                    <ImageList variant="masonry" cols={3} gap={2}>
                      {products.filter( function(product) {
                        const productExists = cart.some(cartItem => {
                          return product.id === cartItem.product_id
                        })
                        
                        return !productExists && isUserFavorit(product.id);
                      } ).map((product) => (
                        <ImageListItem sx={{ cursor: "pointer"}} onClick={() => {
                            setProduct(product)
                            setSku(product?product.sku:null)
                          }}>
                          {product.image ? <img src={product.image} width={"75px"} height={"75px"} /> : <span/>}
                          <ImageListItemBar title={product.label} />
                        </ImageListItem>
                      ))}
                    </ImageList>
                    </>
                  )}
                </Stack>
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
