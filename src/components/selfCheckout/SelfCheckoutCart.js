import React, { useState, useEffect, useContext } from "react"
import { Button, Stack, Box, ListItem, Dialog, DialogTitle, DialogContent, Divider, FormControl, TextField, DialogActions, ListItemText, IconButton, ListItemButton } from "@mui/material"
import axios from "axios"
import { format } from "date-fns"
import { addUserEinkaufsliste } from "../products/products"
import List from "@mui/material/List"
import Grid from "@mui/material/Grid"
import SelfCheckoutCartItem from "./SelfCheckoutCartItem"
import SelfCheckoutCartItemPOSUser from "./SelfCheckoutCartItemPOSUser"
import { cartContext } from "./cartContext"
import DeleteIcon from "@mui/icons-material/Delete"
import BubbleChartIcon from "@mui/icons-material/BubbleChart"
import SelfCheckoutPaymentGateway from "./SelfCheckoutPaymentGateway"
import { getProductListOverview, updateProductAmount } from "../products/products"
const __ = wp.i18n.__

function SelfCheckoutCart({ POSMode, margin, saveEinkaufsliste, setSaveEinkaufsliste, selectedMember, setSelectedMember, selectedPaymentGateway, setSelectedPaymentGateway }) {
  const { cart, setCart } = useContext(cartContext)
  const [total, setTotal] = useState(0)
  const [finalTotal, setFinalTotal] = useState(0)
  const [cartMargin, setCartMargin] = useState(0)
  const [userEinkaufslisten, setUserEinkaufslisten] = useState([])
  const [userEinkaufslisteName, setUserEinkaufslisteName] = useState("")

  useEffect(() => {
    updateUserEinkaufslisten()
  }, [])

  useEffect(() => {
    if (cart.length > 0) {
      let newTotal = 0

      cart.map(cartItem => {
        newTotal += cartItem.price * cartItem.amount
      })

      setTotal(newTotal)
      setCartMargin(newTotal * (margin / 100))
    }
  }, [cart, margin])

  useEffect(() => {
    POSMode ? setFinalTotal(total + cartMargin) : setFinalTotal(total)
  }, [total, cartMargin, POSMode])

  function saveUserEinkaufsliste() {
    addUserEinkaufsliste(cart, userEinkaufslisteName).then(response => {
      if (response.data.userEinkaufslisten) {
        setUserEinkaufslisten(response.data.userEinkaufslisten)
        setSaveEinkaufsliste(false)
      }
    })
  }

  async function loadUserEinkaufsliste(einkaufsliste) {
    const response = await getProductListOverview()

    const newCart = einkaufsliste.produkte.map(einkauf => {
      let product = response.products.find(product => product.sku == einkauf.sku)
      if (!product) return null

      product.order_type = "self_checkout"

      if (einkaufsliste.auto) {
        product.amount = einkauf.amount
        updateProductAmount(product, einkauf.weight, einkauf.tara)
      } else {
        product.amount = 0
        updateProductAmount(product, 0, einkauf.tara)
      }

      return product
    })

    setUserEinkaufslisteName(einkaufsliste.auto ? "" : einkaufsliste.id)
    setCart(newCart)
  }

  function removeUserEinkaufsliste(id) {
    axios
      .post(
        `${frontendLocalizer.apiUrl}/foodcoop/v1/removeUserEinkaufsliste`,
        {
          id: id
        },
        { headers: { "X-WP-Nonce": frontendLocalizer.nonce } }
      )
      .then(function (response) {
        if (response.data.userEinkaufslisten) {
          setUserEinkaufslisten(response.data.userEinkaufslisten)
        }
      })
      .catch(error => console.log(error))
  }

  function updateUserEinkaufslisten() {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getUserEinkaufslisten`, {
        headers: { "X-WP-Nonce": frontendLocalizer.nonce }
      })
      .then(function (response) {
        if (response.data.userEinkaufslisten) {
          setUserEinkaufslisten(response.data.userEinkaufslisten)
        }
      })
      .catch(error => console.log(error))
  }

  function renderList() {
    return (
      <List dense={true} sx={{ padding: POSMode && "0 10px", border: POSMode && "1px solid #e3e3e3" }}>
        {cart.map((cartItem, index) => (
          <SelfCheckoutCartItem key={index} productData={cartItem} itemIndex={index} POSMode={POSMode} />
        ))}
      </List>
    )
  }

  function renderPOSFinish() {
    return (
      <>
        <List dense={true} sx={{ border: "1px solid #e3e3e3", margin: "10px 0", backgroundColor: "#f0f0f0" }}>
          <SelfCheckoutCartItemPOSUser setCartMargin={setCartMargin} cartMargin={cartMargin} margin={margin} selectedMember={selectedMember} setSelectedMember={setSelectedMember} selectedPaymentGateway={selectedPaymentGateway} setSelectedPaymentGateway={setSelectedPaymentGateway} />
        </List>
        {selectedMember ? (
          <List dense={true} sx={{ border: "1px solid #e3e3e3", margin: "10px 0", backgroundColor: "#f0f0f0" }}>
            <SelfCheckoutPaymentGateway selectedPaymentGateway={selectedPaymentGateway} setSelectedPaymentGateway={setSelectedPaymentGateway} />
          </List>
        ) : (
          <List dense={true} sx={{ border: "1px solid #e3e3e3", margin: "10px 0", backgroundColor: "#f0f0f0" }}>
            <ListItem sx={{ margin: "5px 0" }}>
              <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start">
                <Grid item xs={6} sx={{ fontSize: "1.5rem", padding: 2 }}>
                  <Grid item xs={12}>
                    <Box sx={{ marginRight: 2 }}>{__("Zahlungsart", "fcplugin")}</Box>
                  </Grid>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "right", fontSize: "1.5rem" }}>
                  Barzahlung
                </Grid>
              </Grid>
            </ListItem>
          </List>
        )}
      </>
    )
  }

  function renderTotal() {
    return (
      <Stack>
        <h5
          style={{
            fontWeight: "bold",
            marginTop: "10px",
            marginRight: "10px",
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            fontSize: POSMode ? "1.75rem" : "1.25rem"
          }}
        >
          <div>{__("Total", "fcplugin")}</div>
          <div style={{ minWidth: "140px", textAlign: "right" }}>
            <div style={{ float: "left" }}>CHF</div>
            <div>{finalTotal.toFixed(2)}</div>
          </div>
        </h5>

        <Button
          variant="text"
          startIcon={<DeleteIcon />}
          sx={{ fontSize: POSMode ? "1.5rem" : "1rem" }}
          onClick={() => {
            setCart([])
            localStorage.removeItem("fc_selfcheckout_cart")
          }}
          color={"secondary"}
        >
          {__("Warenkorb leeren", "fcplugin")}
        </Button>
      </Stack>
    )
  }

  function renderEinkaufslisten() {
    if (userEinkaufslisten.length == 0) return <></>

    return (
      <List dense={true}>
        <ListItem disableGutters>
          <ListItemText>
            <strong>{__("Gespeicherte Einkaufslisten", "fcplugin")}</strong>
          </ListItemText>
        </ListItem>
        {[...userEinkaufslisten].reverse().map(einkaufsliste => (
          <ListItem
            disableGutters
            secondaryAction={
              <IconButton
                onClick={() => {
                  removeUserEinkaufsliste(einkaufsliste.id)
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => {
                loadUserEinkaufsliste(einkaufsliste)
              }}
            >
              <ListItemText
                primary={einkaufsliste.auto ? __("Automatisch gespeicherte Einkaufsliste", "fcplugin") : einkaufsliste.id}
                secondary={
                  <>
                    <span>{format(new Date(einkaufsliste.date), "dd.MM.yyyy HH:mm")} </span>/{" "}
                    <span>
                      {einkaufsliste.produkte.length} {__("Produkte", "fcplugin")}
                    </span>
                  </>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    )
  }

  function renderEinkaufslisteDialog() {
    return (
      <Dialog open={saveEinkaufsliste} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle id="alert-dialog-title">{__("Einkaufsliste speichern", "fcplugin")}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
            <FormControl>
              <TextField type="text" size="normal" id="userEinkaufslisteName" label={__("Einkaufsliste Name", "fcplugin")} name="userEinkaufslisteName" variant="outlined" value={userEinkaufslisteName} onChange={e => setUserEinkaufslisteName(e.target.value)} />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={saveUserEinkaufsliste} variant="contained" sx={{ marginBottom: "15px", marginRight: "10px" }} size="large">
            {__("Einkaufsliste speichern", "fcplugin")}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  function renderEmptyCart() {
    return (
      <>
        <Stack justifyContent={"center"} alignItems={"center"} sx={{ marginTop: 3 }}>
          <BubbleChartIcon fontSize="large" color="primary" />
          <br />
          <p>{__("Warenkorb leer. Scanne ein Produkt.", "fcplugin")}</p>
        </Stack>
        {renderEinkaufslisten()}
      </>
    )
  }

  return cart.length > 0 ? (
    <>
      {renderEinkaufslisteDialog()}
      {renderList()}
      {POSMode && renderPOSFinish()}
      {renderTotal()}
    </>
  ) : (
    renderEmptyCart()
  )
}

export default SelfCheckoutCart
