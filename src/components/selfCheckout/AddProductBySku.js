import React, { useState, useEffect, useContext } from "react"
import axios from "axios"
import { CircularProgress, Divider } from "@mui/material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import { cartContext } from "./cartContext"
const __ = wp.i18n.__

function AddProductBySku({ setShowCart, setAdding, setProductError }) {
  const { cart, setCart } = useContext(cartContext)
  const [sku, setSku] = useState("")

  function addProduct() {
    let execute = 1

    cart.map(cartItem => {
      console.log(sku, cartItem.sku)
      if (sku.toString() === cartItem.sku.toString()) {
        setProductError(__("Produkt ist schon im Warenkorb. Du kannst die Menge erhöhen", "fcplugin"))
        setShowCart(true)
        setAdding(false)
        execute = 0
      }
    })
    console.log(execute)

    if (execute === 1) {
      axios
        .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProduct?sku=${sku}`)
        .then(function (response) {
          if (response.data) {
            const res = JSON.parse(response.data)
            if (!res) {
              setProductError("Produkt nicht gefunden.")
            } else {
              let newCart = cart
              res.id = newCart.length
              newCart.push(res)
              setCart(newCart)
              if (newCart.length > 0) {
                localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
              }
            }
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          setAdding(false)
          setShowCart(true)
        })
    }
  }

  return (
    <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
      <TextField size="normal" id="Artikelnummer" label={__("Artikelnummer", "fcplugin")} name="Artikelnummer" variant="outlined" value={sku} onChange={e => setSku(e.target.value)} autoFocus />
      <Button onClick={addProduct} variant="contained" size="large">
        {__("Zum Warenkorb hinzufügen", "fcplugin")}
      </Button>
    </Stack>
  )
}

export default AddProductBySku
