import React, { useState, useEffect } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, TextField, Autocomplete, Alert } from "@mui/material"
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
const __ = wp.i18n.__

function Mutations({ id, setModalClose }) {
  const [products, setProducts] = useState()
  const [orders, setOrders] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState()
  const [ordersToChange, setOrdersToChange] = useState()
  const [priceAdjust, setPriceAdjust] = useState()
  const [mutationType, setMutationType] = useState(0)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getProductsOrdersInBestellrunde?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          let reArrangeProductData = []
          if (response.data) {
            Object.keys(res[1]).forEach(function (key, index) {
              let productToDo = {}
              productToDo.label = res[1][key].name + ", " + res[1][key].einheit
              productToDo.price = res[1][key].price
              productToDo.unit = res[1][key].einheit
              productToDo.id = key
              reArrangeProductData.push(productToDo)
            })

            setOrders(res[2])
            setProducts(reArrangeProductData)
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          setProductsLoading(false)
        })
    }
  }, [id])

  const handleSubmit = () => {
    setSubmitting(true)
    let ordersToMutate = []
    if (mutationType === "notDelivered") {
      ordersToChange.map(order => {
        if (checked.includes(order[0])) {
          ordersToMutate.push(order)
        }
      })
    } else {
      ordersToMutate = ordersToChange
    }

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postSaveMutation`,
        {
          product: selectedProduct.id,
          orders: ordersToMutate,
          mutation_type: mutationType,
          price: priceAdjust
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response) {
          setSuccess(true)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        setSubmitting(false)
        setModalClose(false)
      })
  }

  const handleChange = (event, newValue) => {
    setMutationType(newValue)
  }

  useEffect(() => {
    if (selectedProduct) {
      setChecked([])
      setOrdersToChange(orders[selectedProduct.id])
      setPriceAdjust(selectedProduct.price)
    }
  }, [selectedProduct])

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(null)
      }, 2000)
    }
  }, [success])

  const [checked, setChecked] = useState([])

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setChecked(newChecked)
    console.log(newChecked)
  }
  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Neue Mutation in Bestellrunde", "fcplugin")} {id}
            </DialogTitle>
            <DialogActions>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
                {__("Mutation Speichern", "fcplugin")}
              </LoadingButton>

              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setModalClose(false)
                  setProductsLoading(true)
                  setProducts(null)
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
            <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
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

              <FormControl>
                <RadioGroup aria-labelledby="mutationType" name="mutationType" value={mutationType} onChange={e => setMutationType(e.target.value)}>
                  <FormControlLabel value="notDelivered" control={<Radio />} label={__("Produkt wurde (teilweise) nicht geliefert", "fcplugin")} disabled={!selectedProduct} />
                  <FormControlLabel value="priceAdjust" control={<Radio />} label={__("Preis anpassen", "fcplugin")} disabled={!selectedProduct} />
                </RadioGroup>
              </FormControl>

              {mutationType === "priceAdjust" && (
                <>
                  <h2>{__("Neuer Preis", "fcplugin")}</h2>
                  <TextField id="priceAdjust" value={priceAdjust} onChange={e => setPriceAdjust(e.target.value)} variant="outlined" type="number" sc={{ paddingTop: "5px", paddingBottom: "5px" }} />
                </>
              )}

              {ordersToChange &&
                (ordersToChange.length > 0 ? (
                  mutationType ? (
                    <>
                      <h2>{__("Betroffene Bestellungen", "fcplugin")}</h2>

                      {mutationType === "notDelivered" && <Alert severity="info">{__("Bestellungen, in denen das Produkt rückerstattet werden soll, auswählen, dann speichern.", "fcplugin")}</Alert>}
                      {mutationType === "priceAdjust" && <Alert severity="info">{__("Der Preis für das Produkt wird in allen Bestellungen angepasst.", "fcplugin")}</Alert>}

                      <List sx={{ width: "100%", bgcolor: "#fafafa", borderRaius: 2 }}>
                        {ordersToChange.map(order => {
                          const labelId = `checkbox-list-label-${order[0]}`

                          return (
                            <React.Fragment key={order[0]}>
                              <ListItem
                                secondaryAction={
                                  <IconButton
                                    edge="end"
                                    aria-label="order"
                                    onClick={() => {
                                      window.open(`${appLocalizer.homeUrl}/wp-admin/post.php?post=${order[0]}&action=edit`, "_blank")
                                    }}
                                  >
                                    <PageviewIcon />
                                  </IconButton>
                                }
                                disablePadding
                              >
                                <ListItemButton role={undefined} onClick={handleToggle(order[0])} dense>
                                  {mutationType === "notDelivered" && (
                                    <ListItemIcon>
                                      <Checkbox edge="start" checked={checked.indexOf(order[0]) !== -1} tabIndex={-1} disableRipple inputProps={{ "aria-labelledby": labelId }} size="small" />
                                    </ListItemIcon>
                                  )}
                                  <ListItemText id={labelId} primary={`${order[0]} - ${order[1]} ${__("hat", "fcplugin")} ${order[2]}x ${__("bestellt", "fcplugin")} ${__("für", "fcplugin")} CHF ${order[3].toFixed(2)}`} />
                                </ListItemButton>
                              </ListItem>
                              <Divider variant="fullWidth" />
                            </React.Fragment>
                          )
                        })}
                      </List>
                    </>
                  ) : (
                    ""
                  )
                ) : (
                  <>
                    <h2>{__("Betroffene Bestellungen", "fcplugin")}</h2>
                    <span>{__("keine Bestellungen betroffen.", "fcplugin")}</span>
                  </>
                ))}
              {success && <Alert severity="success">{__("Mutation wurde verarbeitet.", "fcplugin")}</Alert>}
            </Stack>
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

export default Mutations
