import React, { useState, useEffect, useRef, useMemo, useContext } from "react"
import { Box, Stack, Typography, Button, CircularProgress } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import ListAltIcon from "@mui/icons-material/ListAlt"
import { ShoppingContext } from "./ShoppingContext"
import { TriggerContext } from "./ShoppingContext"
import axios from "axios"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered"
import DoneIcon from "@mui/icons-material/Done"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import PointOfSaleIcon from "@mui/icons-material/PointOfSale"
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import { CSSTransition } from "react-transition-group"
const __ = wp.i18n.__

const OrderOverview = ({ currency, order, balance, cartNonce, activeState }) => {
  const [visibility, setVisibility] = useState(true)
  const [currentTotal, setCurrentTotal] = useState(0)
  const [shoppingListVisibility, setShoppingListVisibility] = useState(false)
  const [helpVisibility, setHelpVisibility] = useState(false)
  const [newBalance, setNewBalance] = useState(balance - currentTotal)
  const [orderingState, setOrderingState] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [originalBalance, setOriginalBalance] = useState(balance)
  const [loading, setLoading] = useState(true)

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
    newBalance > 0 ? currentTotal > 0 && setOrderingState(true) : setOrderingState(false)
  }, [newBalance, balance])

  /**
   * Add Order Value to available balance, if order exists
   */
  useEffect(() => {
    let orderBalance = 0.0
    order ? (orderBalance = parseFloat(order?.total)) : (orderBalance = 0.0)
    if (orderBalance > 0) {
      setOriginalBalance(balance + orderBalance)
    } else {
      setOriginalBalance(balance)
    }
  }, [currentTotal, balance])

  useEffect(() => {
    setNewBalance(originalBalance - currentTotal)
  }, [originalBalance, balance, currentTotal])

  function shoppingListClick() {
    shoppingListVisibility ? setShoppingListVisibility(false) : setShoppingListVisibility(true)
    setHelpVisibility(false)
  }

  function helpClick() {
    helpVisibility ? setHelpVisibility(false) : setHelpVisibility(true)
    setShoppingListVisibility(false)
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
    activeState && (
      <>
        <CSSTransition in={shoppingListVisibility} timeout={500} classNames="transition-y-up" unmountOnExit>
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
        </CSSTransition>
        <CSSTransition in={helpVisibility} timeout={500} classNames="transition-y-up" unmountOnExit>
          <div className="order_manual_public">
            <div style={{ borderBottom: "1px solid #cacaca", marginBottom: "10px", fontWeight: "bold", width: "100%" }}>{__("Anleitung", "fcplugin")}:</div>

            <span>
              <AccountBalanceWalletIcon /> {__("Guthaben aufladen.", "fcplugin")}
            </span>
            <hr />
            <span>
              <FormatListNumberedIcon /> {__("Mengen in der Bestell-Liste eingeben.", "fcplugin")}
            </span>
            <hr />
            <span>
              <ShoppingCartIcon /> {__("Produkte in den Warenkorb legen (Bestellung wird für später gespeichert).", "fcplugin")}
            </span>
            <hr />
            <span>
              <PointOfSaleIcon /> {__("An der Kasse die Bestellung abschliessen.", "fcplugin")}
            </span>
            <hr />
            <span>
              <PublishedWithChangesIcon /> {__("Anpassungen können bis zum Ende des Bestellfenster vorgenommen werden.", "fcplugin")}
            </span>
          </div>
        </CSSTransition>

        <div id="fc_order_bar">
          <div className="fc_order_bar_col fc_order_bar_finances">
            <div>
              <span>{__("Verfügbares Guthaben", "fcplugin")}:</span>
              <span>
                <span dangerouslySetInnerHTML={{ __html: currency }} /> {originalBalance.toFixed(2)}
              </span>
            </div>
            <div>
              <span>{__("Aktueller Bestellwert", "fcplugin")}:</span>
              <span>
                <span dangerouslySetInnerHTML={{ __html: currency }} /> {currentTotal.toFixed(2)}
              </span>
            </div>
            <div style={newBalance > 0 ? { color: "green" } : { color: "red" }}>
              <span>{__("Nicht verwendetes Guthaben", "fcplugin")}:</span>
              <span>
                <span dangerouslySetInnerHTML={{ __html: currency }} /> {newBalance.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="fc_order_bar_actions">
            <div className="multi-button">
              <Button startIcon={<HelpOutlineIcon />} variant="text" sx={{ marginBottom: "10px" }} size="small" onClick={helpClick}>
                {__("Anleitung", "fcplugin")}
              </Button>
              <Button startIcon={<ListAltIcon />} variant="text" sx={{ marginBottom: "10px" }} size="small" onClick={shoppingListClick}>
                {__("Mein Einkaufszettel", "fcplugin")}
              </Button>
            </div>
            <LoadingButton className="cartButton" loading={addingToCart} loadingPosition="center" disabled={!orderingState} startIcon={<DoneIcon />} variant="outlined" sx={{}} size="large" onClick={handleAddToCart}>
              {__("In den Warenkorb", "fcplugin")}
            </LoadingButton>
          </div>
        </div>
      </>
    )
  )
}

export default OrderOverview
