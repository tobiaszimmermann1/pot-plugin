import React, { useState, useEffect, useContext } from "react"
import Grid from "@mui/material/Grid"
import { Divider } from "@mui/material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Stack, TextField, Typography, Alert } from "@mui/material"
import ListItem from "@mui/material/ListItem"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import Chip from "@mui/material/Chip"
import { cartContext } from "./cartContext"
import PhotoIcon from "@mui/icons-material/Photo"
const __ = wp.i18n.__

function SelfCheckoutCartItem({ productData, itemIndex }) {
  const { cart, setCart } = useContext(cartContext)

  const [amount, setAmount] = useState(productData.amount)
  const [totalPrice, setTotalPrice] = useState(0)
  const [inputAmount, setInputAmount] = useState(false)
  const [inputAmountValue, setInputAmountValue] = useState(0)

  useEffect(() => {
    if (productData) {
      let newPrice = productData.price * amount
      setTotalPrice(newPrice)
    }
  }, [productData, amount])

  useEffect(() => {
    if (amount <= 0) {
      const newCart = cart.filter(cartItem => {
        return cartItem.id !== productData.id
      })
      setCart(newCart)

      if (newCart.length > 0) {
        localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
      } else {
        localStorage.removeItem("fc_selfcheckout_cart")
      }
    } else {
      const newCart = cart.map(cartItem => {
        if (cartItem.id === productData.id) {
          return { ...cartItem, amount: amount }
        }
        return cartItem
      })
      setCart(newCart)

      localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
    }
  }, [amount])

  function setNewAmount() {
    setAmount(inputAmountValue)
    setInputAmount(false)
  }

  return productData ? (
    <>
      <Dialog fullScreen open={inputAmount} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description" sx={{}}>
        <DialogTitle id="alert-dialog-title">{__("Menge eingeben", "fcplugin")}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
            <DialogContentText>
              {__("Einheit", "fcplugin")}: {productData.unit} <br /> <br />
              {__("Menge x Einheit = Gesamtmenge", "fcplugin")}
            </DialogContentText>
            <Divider />
            <TextField type="number" size="normal" id="amount" label={__("Menge", "fcplugin")} name="amount" variant="outlined" value={inputAmountValue} onChange={e => setInputAmountValue(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={setNewAmount} variant="contained">
            {__("Menge Übernehmen", "fcplugin")}
          </Button>
        </DialogActions>
      </Dialog>
      <ListItem sx={{ margin: "5px 0" }}>
        <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
          <Grid item xs={3}>
            <Stack direction="column" spacing={1} alignItems="center" justifyContent="center">
              <AddIcon onClick={() => setAmount(amount + 1)} />
              <Chip
                label={amount}
                sx={{ fontWeight: "bold" }}
                onClick={() => {
                  setInputAmount(true)
                  setInputAmountValue(amount)
                }}
              />
              <RemoveIcon onClick={() => setAmount(amount - 1)} />
            </Stack>
          </Grid>
          <Grid item xs={7} sx={{ fontWeight: "bold", fontSize: "1rem" }}>
            <Grid container spacing={1} alignItems="flex-start" justifyContent="flex-start">
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start">
                  <Grid item xs={3}>
                    {productData.img ? <img src={productData.img} width={"50px"} height={"50px"} /> : <PhotoIcon />}
                  </Grid>
                  <Grid item xs={9}>
                    {productData.name}
                    <Grid container spacing={1} alignItems="flex-start" justifyContent="flex-start" sx={{ marginTop: "0px" }}>
                      <Grid item xs={12} sx={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                        {productData.unit}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2} sx={{ fontWeight: "bold", textAlign: "right" }}>
            {parseFloat(totalPrice).toFixed(2)}
          </Grid>
        </Grid>
      </ListItem>
      <Divider />
    </>
  ) : (
    ""
  )
}

export default SelfCheckoutCartItem
