import React, { useState, useEffect, useContext } from "react"
import { Button, Stack, Box, ListItem } from "@mui/material"
import List from "@mui/material/List"
import Grid from "@mui/material/Grid"
import SelfCheckoutCartItem from "./SelfCheckoutCartItem"
import SelfCheckoutCartItemPOSUser from "./SelfCheckoutCartItemPOSUser"
import { cartContext } from "./cartContext"
import DeleteIcon from "@mui/icons-material/Delete"
import BubbleChartIcon from "@mui/icons-material/BubbleChart"
import SelfCheckoutPaymentGateway from "./SelfCheckoutPaymentGateway"
const __ = wp.i18n.__

function SelfCheckoutCart({ POSMode, margin, selectedMember, setSelectedMember, selectedPaymentGateway, setSelectedPaymentGateway }) {
  const { cart, setCart } = useContext(cartContext)
  const [total, setTotal] = useState(0)
  const [finalTotal, setFinalTotal] = useState(0)
  const [cartMargin, setCartMargin] = useState(0)
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
      setCartMargin(newTotal * (margin / 100))
    }
  }, [cart, margin])

  useEffect(() => {
    setFinalTotal(total + cartMargin)
  }, [cartMargin])

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
      <Stack spacing={3} sx={{ width: "100%", padding: "20px 20px 10px 20px" }}>
        <h2>{__("Warenkorb", "fcplugin")}</h2>{" "}
      </Stack>

      <List dense={true} sx={{ padding: POSMode && "0 10px", border: POSMode && "1px solid #e3e3e3" }}>
        {cart.map((cartItem, index) => (
          <SelfCheckoutCartItem key={index} productData={cartItem} itemIndex={index} POSMode={POSMode} />
        ))}
      </List>
      {POSMode && (
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
                    Bahrzahlung
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          )}
        </>
      )}
      <Stack justifyContent={"flex-end"} alignItems={"flex-end"}>
        <h5 style={{ fontWeight: "bold", textAlign: "right", marginTop: "10px", marginRight: "10px", fontSize: POSMode ? "1.75rem" : "1.25rem" }}>
          {__("Total: CHF", "fcplugin")} {finalTotal.toFixed(2)}
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
