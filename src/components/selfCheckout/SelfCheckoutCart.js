import React, { useState, useEffect, useContext } from "react"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import List from "@mui/material/List"
import SelfCheckoutCartItem from "./SelfCheckoutCartItem"
import { cartContext } from "./cartContext"
import DeleteIcon from "@mui/icons-material/Delete"
import BubbleChartIcon from "@mui/icons-material/BubbleChart"
const __ = wp.i18n.__

function SelfCheckoutCart() {
  const { cart, setCart } = useContext(cartContext)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    console.log("cart:", cart)
    if (cart.length > 0) {
      let newTotal = 0
      cart.map(cartItem => {
        newTotal += cartItem.price * cartItem.amount
      })
      setTotal(newTotal)
    }
  }, [cart])

  return cart.length > 0 ? (
    <>
      <List dense={true}>
        {cart.map((cartItem, index) => (
          <SelfCheckoutCartItem key={index} productData={cartItem} itemIndex={index} />
        ))}
      </List>
      <Stack justifyContent={"flex-end"} alignItems={"flex-end"}>
        <h5 style={{ fontWeight: "bold", textAlign: "right", marginTop: "10px", marginRight: "10px" }}>Total: CHF {total.toFixed(2)}</h5>
        <Button
          variant="text"
          startIcon={<DeleteIcon />}
          onClick={() => {
            setCart([])
            localStorage.removeItem("fc_selfcheckout_cart")
          }}
          color={"secondary"}
        >
          Warenkorb leeren
        </Button>
      </Stack>
    </>
  ) : (
    <Stack justifyContent={"center"} alignItems={"center"} sx={{ marginTop: 3 }}>
      <BubbleChartIcon fontSize="large" color="primary" />
      <br />
      <p>{__("Warenkorb leer. Scanne ein Produkt.", "fcplugin")}</p>
    </Stack>
  )
}

export default SelfCheckoutCart
