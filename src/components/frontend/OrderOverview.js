import React, { useState, useEffect, useRef, useMemo, useContext } from "react"
import { Box, Stack, Typography, Button, CircularProgress } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import ListAltIcon from "@mui/icons-material/ListAlt"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import { ShoppingContext } from "./ShoppingContext"
import { TriggerContext } from "./ShoppingContext"
import axios from "axios"
const __ = wp.i18n.__

const OrderOverview = ({ balance, cartNonce }) => {
  const [visibility, setVisibility] = useState(true)
  const [currentTotal, setCurrentTotal] = useState(0)
  const [shoppingListVisibility, setShoppingListVisibility] = useState(false)
  const [newBalance, setNewBalance] = useState(balance - currentTotal)
  const [orderingState, setOrderingState] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  function visClick() {
    visibility ? setVisibility(false) : setVisibility(true)
  }

  const shoppingList = useContext(ShoppingContext)
  const trigger = useContext(TriggerContext)

  useEffect(() => {
    if (shoppingList) {
      let newTotal = 0
      Object.keys(shoppingList).map((key, index) => {
        newTotal += shoppingList[key].amount * shoppingList[key].price
      })
      setCurrentTotal(newTotal)
    }
  }, [trigger])

  useEffect(() => {
    setNewBalance(balance - currentTotal)
  }, [currentTotal, balance])

  useEffect(() => {
    newBalance > 0 ? currentTotal > 0 && setOrderingState(true) : setOrderingState(false)
  }, [newBalance, balance])

  function shoppingListClick() {
    shoppingListVisibility ? setShoppingListVisibility(false) : setShoppingListVisibility(true)
  }

  /**
   * Add to Cart function
   */
  const addToCart = async () => {
    const size = Object.keys(shoppingList).length
    let i = 1
    for (const key in shoppingList) {
      if (shoppingList[key].amount > 0) {
        try {
          const response = await axios.post(
            `${frontendLocalizer.apiUrl}/wc/store/v1/cart/items`,
            {
              id: shoppingList[key].id,
              quantity: parseInt(shoppingList[key].amount)
            },
            {
              headers: {
                "X-WC-Store-API-Nonce": cartNonce
              }
            }
          )
        } catch (error) {
          console.log(error)
        }
      }
      i++
      if (i === size) {
        setAddingToCart(false)
        window.location.href = frontendLocalizer.cartUrl
      }
    }
  }

  function handleAddToCart() {
    setAddingToCart(true)
    if (cartNonce) {
      axios
        .delete(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items/`, {
          headers: {
            "X-WC-Store-API-Nonce": cartNonce
          }
        })
        .then(res => {
          addToCart()
        })
        .catch(error => console.log(error))
    }
  }

  return (
    <>
      {shoppingListVisibility && (
        <div id="fc_shopping_list">
          {shoppingList !== null && (
            <>
              <div style={{ borderBottom: "1px solid #cacaca", marginBottom: "10px", fontWeight: "bold" }}>{__("Einkaufszettel", "fcplugin")}:</div>
              {Object.keys(shoppingList).map((key, index) => {
                if (shoppingList[key].amount > 0) {
                  return (
                    <div key={index}>
                      {shoppingList[key].amount} x{" "}
                      <span style={{ fontStyle: "italic", padding: "1px", backgroundColor: "#e3e3e3" }}>
                        {shoppingList[key].name} ({shoppingList[key].unit})
                      </span>{" "}
                      - {parseFloat(shoppingList[key].amount * shoppingList[key].price).toFixed(2)}
                      <hr />
                    </div>
                  )
                }
              })}
            </>
          )}
        </div>
      )}
      <div id="fc_order_bar">
        <div className="fc_order_bar_col">
          <div>
            <span>{__("Verfügbares Guthaben", "fcplugin")}:</span>
            <span>{balance.toFixed(2)}</span>
          </div>
          <div>
            <span>{__("Aktueller Bestellwert", "fcplugin")}:</span>
            <span>{currentTotal.toFixed(2)}</span>
          </div>
          <div style={newBalance > 0 ? { color: "green" } : { color: "red" }}>
            <span>{__("Nicht verwendetes Guthaben", "fcplugin")}:</span>
            <span>{newBalance.toFixed(2)}</span>
          </div>
        </div>
        <div className="fc_order_bar_actions">
          <Button startIcon={<ListAltIcon />} variant="text" sx={{ marginBottom: "10px" }} size="large" onClick={shoppingListClick}>
            {__("Mein Einkaufszettel", "fcplugin")}
          </Button>
          <LoadingButton loading={addingToCart} loadingPosition="center" disabled={!orderingState} startIcon={<ShoppingCartIcon />} variant="outlined" sx={{}} size="large" onClick={handleAddToCart}>
            {__("In den Warenkorb", "fcplugin")}
          </LoadingButton>
        </div>
      </div>
    </>
  )
}

export default OrderOverview
