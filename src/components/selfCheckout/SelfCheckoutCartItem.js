import React, { useState, useEffect, useContext } from "react"
import Grid from "@mui/material/Grid"
import { Divider, FormControl } from "@mui/material"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Stack, TextField } from "@mui/material"
import ListItem from "@mui/material/ListItem"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import Chip from "@mui/material/Chip"
import { cartContext } from "./cartContext"
import PhotoIcon from "@mui/icons-material/Photo"
import DeleteIcon from "@mui/icons-material/Delete"
const __ = wp.i18n.__

function SelfCheckoutCartItem({ productData, itemIndex, POSMode }) {
  const { cart, setCart } = useContext(cartContext)

  const [amount, setAmount] = useState(productData.amount)
  const [totalPrice, setTotalPrice] = useState(0)
  const [inputAmount, setInputAmount] = useState(false)
  const [inputAmountValue, setInputAmountValue] = useState(0)
  const [disableMinus, setDisableMinus] = useState(false)

  useEffect(() => {
    if (productData) {
      let newPrice = productData.price * amount
      setTotalPrice(newPrice)
    }
  }, [productData, amount])

  useEffect(() => {
    let newAmount = amount
    const newCart = cart.map(cartItem => {
      if (cartItem.product_id === productData.product_id) {
        return { ...cartItem, amount: newAmount }
      } else {
        return cartItem
      }
    })
    setCart(newCart)

    localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
  }, [amount])

  function setNewAmount() {
    setAmount(parseFloat(inputAmountValue))
    setInputAmount(false)
  }

  return productData ? (
    <>
      <Dialog open={inputAmount} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle id="alert-dialog-title">{__("Menge eingeben", "fcplugin")}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
            <Box sx={{ padding: "10px", borderRadius: "5px", backgroundColor: "#f0f0f0" }}>
              {__("Einheit", "fcplugin")}: {productData.unit} <br />
              {__("Menge x Einheit = Gesamtmenge", "fcplugin")}
            </Box>
            <FormControl>
              <TextField type="number" size="normal" id="amount" label={__("Menge", "fcplugin")} name="amount" variant="outlined" value={inputAmountValue} onChange={e => setInputAmountValue(e.target.value)} />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={setNewAmount} variant="contained" sx={{ marginBottom: "15px", marginRight: "10px" }} size="large">
            {__("Menge Übernehmen", "fcplugin")}
          </Button>
        </DialogActions>
      </Dialog>
      <ListItem sx={{ margin: "5px 0", padding: 1 }}>
        <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start">
          <Grid item xs={3}>
            {!productData.is_weighed ? (
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start" sx={{ fontSize: POSMode ? "1.5rem" : "1rem" }}>
                <AddIcon onClick={() => setAmount(productData.amount + 1)} sx={{ fontSize: POSMode ? "1.5rem" : "1rem", cursor: "pointer" }} />
                <Chip
                  label={productData.amount}
                  sx={{ fontSize: POSMode ? "1.5rem" : "1rem", fontWeight: "bold" }}
                  onClick={() => {
                    setInputAmount(true)
                    setInputAmountValue(amount)
                  }}
                />
                <RemoveIcon
                  sx={{ fontSize: POSMode ? "1.5rem" : "1rem", cursor: "pointer" }}
                  onClick={() => {
                    productData.amount > 0 && setAmount(productData.amount - 1)
                  }}
                />
              </Stack>
            ) : (
              <Stack direction="column" gap={2} sx={{ alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <Chip label={`${productData.userWeightValue} KG`} sx={{ fontSize: POSMode ? "1.5rem" : "1rem", fontWeight: "bold" }} />
                  <DeleteIcon
                    sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                    onClick={() => {
                      setAmount(0)
                    }}
                  />
                </div>
              </Stack>
            )}
          </Grid>
          <Grid item xs={7} sx={{ fontWeight: "bold", fontSize: POSMode ? "1.5rem" : "1rem" }}>
            <Grid container spacing={1} alignItems="flex-start" justifyContent="flex-start">
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start">
                  <Grid item xs={4}>
                    {productData.img ? <img src={productData.img} width={"50px"} height={"50px"} /> : <PhotoIcon />}
                  </Grid>
                  <Grid item xs={8}>
                    {productData.name} <span style={{ fontWeight: "normal" }}>({productData.sku})</span>
                    <Grid container spacing={1} alignItems="flex-start" justifyContent="flex-start" sx={{ marginTop: "0px" }}>
                      {POSMode ? (
                        <Grid item xs={12}>
                          <Chip label={productData.unit} sx={{ marginRight: 1, fontSize: POSMode ? "1.25rem" : "0.8rem", fontWeight: "normal" }} />
                          <Chip label={`CHF ${parseFloat(productData.price).toFixed(2)}`} sx={{ marginRight: 1, fontSize: POSMode ? "1.25rem" : "0.8rem", fontWeight: "normal" }} />
                          <Chip label={`Artikel-Nr.: ${productData.sku}`} sx={{ fontSize: POSMode ? "1.25rem" : "0.8rem", fontWeight: "normal" }} />
                        </Grid>
                      ) : (
                        <Grid item xs={12} sx={{ fontSize: POSMode ? "1.25rem" : "0.8rem", fontWeight: "normal" }}>
                          {!productData.is_weighed && productData.unit}
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2} sx={{ fontWeight: "bold", textAlign: "right", fontSize: POSMode ? "1.5rem" : "1rem" }}>
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
