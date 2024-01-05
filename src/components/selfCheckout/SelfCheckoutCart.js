import React, { useState, useEffect, useContext } from "react"
import { Button, Stack } from "@mui/material"
import List from "@mui/material/List"
import SelfCheckoutCartItem from "./SelfCheckoutCartItem"
import { cartContext } from "./cartContext"
import DeleteIcon from "@mui/icons-material/Delete"
import BubbleChartIcon from "@mui/icons-material/BubbleChart"
const __ = wp.i18n.__

function SelfCheckoutCart() {
  const { cart, setCart } = useContext(cartContext)
  const [total, setTotal] = useState(0)
  const [removeProduct, setRemoveProduct] = useState(null)

  useEffect(() => {
    console.log("cart:", cart)
    if (cart.length > 0) {
      let newTotal = 0
      cart.map(cartItem => {
        newTotal += cartItem.price * cartItem.amount

        if (cartItem.amount === 0) {
          setRemoveProduct(cartItem)
        }
      })
      setTotal(newTotal)
    }
  }, [cart])

  useEffect(() => {
    if (removeProduct) {
      console.log("rm", removeProduct)
      let newCart = cart.filter(el => {
        return el.product_id !== removeProduct.product_id
      })

      setCart(newCart)

      if (newCart.length > 0) {
        localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
      } else {
        localStorage.removeItem("fc_selfcheckout_cart")
      }

      setRemoveProduct(null)
    }
  }, [removeProduct])

  return cart.length > 0 ? (
    <>
      <List dense={true}>
        {cart.map((cartItem, index) => (
          <SelfCheckoutCartItem key={index} productData={cartItem} itemIndex={index} />
        ))}
      </List>
      <Stack justifyContent={"flex-end"} alignItems={"flex-end"}>
        <h5 style={{ fontWeight: "bold", textAlign: "right", marginTop: "10px", marginRight: "10px" }}>
          {__("Total: CHF", "fcplugin")} {total.toFixed(2)}
        </h5>
        <Button
          variant="text"
          startIcon={<DeleteIcon />}
          onClick={() => {
            setCart([])
            localStorage.removeItem("fc_selfcheckout_cart")
          }}
          color={"secondary"}
        >
          {__("Warenkorb leeren", "fcplugin")}
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
