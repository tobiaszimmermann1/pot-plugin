import React, { useState, useEffect } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import { Box, Card, LinearProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Stack, TextField, Autocomplete, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Checkbox from "@mui/material/Checkbox"
import Divider from "@mui/material/Divider"
import PageviewIcon from "@mui/icons-material/Pageview"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
const __ = wp.i18n.__

function NewDelivery({ prod, setModalClose, reload, setReload }) {
  const [orders, setOrders] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState()
  const [success, setSuccess] = useState(false)
  const [products, setProducts] = useState(null)
  const [deliveredProducts, setDeliveredProducts] = useState([])
  const [deliveredAmount, setDeliveredAmount] = useState(1)

  useEffect(() => {
    let reArrangeProductData = []
    if (prod) {
      console.log("prod", prod)
      Object.keys(prod).forEach(function (key, index) {
        let productToDo = {}
        productToDo.label = prod[key].name + " (" + prod[key].sku + "), " + prod[key].unit
        productToDo.unit = prod[key].unit
        productToDo.id = prod[key].id
        reArrangeProductData.push(productToDo)
      })

      setProducts(reArrangeProductData)
      setProductsLoading(false)
    }
  }, [prod])

  function addProduct() {
    if (selectedProduct !== null && deliveredAmount > 0) {
      // check if product is already in deliveredProducts
      let add = true
      if (deliveredProducts.length > 0) {
        deliveredProducts.map((p, index) => {
          if (selectedProduct.id === p.id) {
            add = false
            alert(__("Produkt wurde schon hinzugefügt.", "fcplugin"))
          }
        })
      }

      // add product to delivery, if not already in list
      if (add) {
        let newDeliveredProducts = deliveredProducts
        selectedProduct["amount"] = parseInt(deliveredAmount)
        newDeliveredProducts.push(selectedProduct)

        setDeliveredProducts(newDeliveredProducts)
        setSelectedProduct(null)
        setDeliveredAmount(1)
      }
    }
  }

  function removeProduct(removeId) {
    let newDeliveredProducts = deliveredProducts.filter(function (el) {
      return el.id !== removeId
    })

    setDeliveredProducts(newDeliveredProducts)
    setSelectedProduct(null)
    setDeliveredAmount(1)
  }

  const handleSubmit = () => {
    setSubmitting(true)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postSaveDelivery`,
        {
          products: JSON.stringify(deliveredProducts)
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response) {
          console.log(response.data)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        setReload(reload => reload + 1)
        setSubmitting(false)
        setModalClose(false)
      })
  }

  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">{__("Neue Lieferung entgegen nehmen", "fcplugin")}</DialogTitle>
            <DialogActions>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
                {__("Lieferung Speichern", "fcplugin")}
              </LoadingButton>

              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setModalClose(false)
                  setProductsLoading(true)
                }}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogActions>
          </Toolbar>
        </AppBar>
        <DialogContent
          dividers={scroll === "paper"}
          sx={{
            paddingTop: "20px",
            minHeight: "500px"
          }}
        >
          {!productsLoading ? (
            <>
              <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
                {products && (
                  <Autocomplete
                    sx={{ width: "100%" }}
                    onChange={(event, newValue) => {
                      setSelectedProduct(newValue)
                    }}
                    id="product"
                    options={products}
                    disablePortal
                    renderInput={params => <TextField {...params} label={__("Produkt", "fcplugin")} className="autocompleteField" />}
                  />
                )}

                <FormControl>
                  <TextField id="amount" value={deliveredAmount} onChange={e => setDeliveredAmount(e.target.value)} variant="outlined" type="number" label={__("Anzahl", "fcplugin")} />
                </FormControl>
              </Stack>
              <Button
                color="primary"
                onClick={() => {
                  addProduct()
                }}
                startIcon={<AddIcon />}
                variant="outlined"
                size="large"
                disabled={false}
                sx={{ marginTop: "15px" }}
              >
                {__("Produkt zur Lieferung hinzufügen", "fcplugin")}
              </Button>
              {deliveredProducts.length > 0 && (
                <List sx={{ width: "100%", bgcolor: "#fafafa", borderRaius: 2, marginTop: "20px" }}>
                  {deliveredProducts.map(deliveredProduct => {
                    const labelId = `checkbox-list-label-${deliveredProduct.id}`

                    return (
                      <React.Fragment key={deliveredProduct.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="order"
                              onClick={() => {
                                removeProduct(deliveredProduct.id)
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText id={labelId} primary={`${deliveredProduct.label} ${__("wurde", "fcplugin")} ${deliveredProduct.amount}x ${__("geliefert", "fcplugin")}`} />
                        </ListItem>
                        <Divider variant="fullWidth" />
                      </React.Fragment>
                    )
                  })}
                </List>
              )}
            </>
          ) : (
            <Box sx={{ width: "98%" }}>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewDelivery
