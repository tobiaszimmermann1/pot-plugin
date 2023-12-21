import React, { useState, useEffect, useContext } from "react"
import { CircularProgress, IconButton } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import LoadingButton from "@mui/lab/LoadingButton"
import ListAltIcon from "@mui/icons-material/ListAlt"
import { ShoppingContext } from "./ShoppingContext"
import { TriggerContext } from "./ShoppingContext"
import axios from "axios"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import PointOfSaleIcon from "@mui/icons-material/PointOfSale"
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import { CSSTransition } from "react-transition-group"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
const __ = wp.i18n.__

const OrderOverview = ({ currency, order, cartNonce, activeState, cart, activeBestellrunde }) => {
  const [currentTotal, setCurrentTotal] = useState(0)
  const [shoppingListVisibility, setShoppingListVisibility] = useState(false)
  const [helpVisibility, setHelpVisibility] = useState(false)
  const [newBalance, setNewBalance] = useState(null)
  const [orderingState, setOrderingState] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [originalBalance, setOriginalBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(null)
  const [myAccountLink, setMyAccountLink] = useState(null)
  const [orderBarVisibility, setOrderBarVisibility] = useState(true)

  /**
   * Shopping List
   */
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

  function shoppingListClick() {
    shoppingListVisibility ? setShoppingListVisibility(false) : setShoppingListVisibility(true)
    setHelpVisibility(false)
  }

  function helpClick() {
    helpVisibility ? setHelpVisibility(false) : setHelpVisibility(true)
    setShoppingListVisibility(false)
  }

  /**
   * balance calculations
   */
  // get current wallet balance of user and list of payment gateways
  useEffect(() => {
    axios
      .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getBalance`, {
        id: frontendLocalizer.currentUser.ID
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          let b = res[0]
          if (b === null) {
            b = 0
          }
          setWalletBalance(parseFloat(b))
          setMyAccountLink(res[1])
        }
      })
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    if (walletBalance || walletBalance === 0) {
      if (order) {
        setOriginalBalance(walletBalance + parseFloat(order.total))
      } else {
        setOriginalBalance(walletBalance)
      }
    }
  }, [walletBalance, order])

  useEffect(() => {
    setNewBalance(originalBalance - currentTotal)
  }, [originalBalance])

  useEffect(() => {
    if (newBalance || newBalance === 0) {
      newBalance >= 0 ? setOrderingState(true) : setOrderingState(false)
      setBalanceLoading(false)
    }
  }, [newBalance])

  useEffect(() => {
    if (originalBalance || originalBalance === 0) {
      setBalanceLoading(true)
      let newCalculatedBalance = originalBalance - currentTotal
      setNewBalance(newCalculatedBalance)
    }
  }, [trigger, currentTotal])

  /**
   * Add to Cart function
   */

  function addToCart() {
    let cart = []

    const size = Object.keys(shoppingList).length
    let i = 1
    for (const key in shoppingList) {
      if (shoppingList[key].amount > 0) {
        cart.push({ name: shoppingList[key].name, product_id: shoppingList[key].product_id, amount: shoppingList[key].amount, name: shoppingList[key].name, bestellrunde: activeBestellrunde })
      }
      i++
    }

    if (cart.length > 0) {
      axios
        .post(
          `${frontendLocalizer.apiUrl}/foodcoop/v1/addToCart`,
          {
            data: JSON.stringify(cart),
            user: JSON.stringify(frontendLocalizer.currentUser)
          },
          {
            headers: {
              "X-WP-Nonce": frontendLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          setAddingToCart(false)
          location.href = JSON.parse(response.data)
        })
        .catch(error => console.log(error.message))
        .finally(response => {
          setAddingToCart(false)
        })
    } else {
      setAddingToCart(false)
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

  function handleHideOrderBar() {
    const currentState = orderBarVisibility
    setOrderBarVisibility(!currentState)
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
            <div style={{ borderBottom: "1px solid #cacaca", marginBottom: "10px", fontWeight: "bold", width: "100%" }}>{__("So bestellst du mit", "fcplugin")}:</div>
            <span
              onClick={() => {
                window.open(myAccountLink + "foodcoop-wallet/", "_blank")
              }}
            >
              <AccountBalanceWalletIcon /> {__("Guthaben aufladen ", "fcplugin")}
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

        <div id="fc_order_bar" className={orderBarVisibility ? "" : "fc_order_bar_hidden"}>
          <div className="fc_order_bar_handle" onClick={handleHideOrderBar}>
            {orderBarVisibility ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </div>
          <div className="fc_order_bar_col fc_order_bar_finances">
            {balanceLoading ? (
              <div style={{ width: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <CircularProgress />
              </div>
            ) : (
              <>
                <div>
                  <span>{__("Verfügbares Guthaben", "fcplugin")}:</span>
                  <span>
                    <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(originalBalance).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span>{__("Aktueller Bestellwert", "fcplugin")}:</span>
                  <span>
                    <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(currentTotal).toFixed(2)}
                  </span>
                </div>
                <div style={newBalance > 0 ? { color: "green" } : { color: "red" }}>
                  <span>{__("Restguthaben", "fcplugin")}:</span>
                  <span>
                    <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(newBalance).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="fc_order_bar_actions">
            <LoadingButton className="cartButton" color="info" loading={addingToCart} loadingPosition="center" startIcon={<ShoppingCartIcon />} variant="outlined" sx={{}} size="large" onClick={handleAddToCart}>
              {__("In den Warenkorb", "fcplugin")}
            </LoadingButton>
            <div className="multi-button">
              <Tooltip title={__("Hilfe", "fcplugin")} placement="top">
                <IconButton sx={{ marginTop: "5px", marginRight: "5px" }} size="small" color="primary" onClick={helpClick}>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={__("Einkaufszettel", "fcplugin")} placement="top">
                <IconButton sx={{ marginTop: "5px", marginRight: "5px", marginLeft: "5px" }} size="small" color="primary" onClick={shoppingListClick}>
                  <ListAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={__("Guthaben aufladen", "fcplugin")} placement="top">
                <IconButton
                  sx={{ marginTop: "5px", marginLeft: "5px" }}
                  size="small"
                  color="primary"
                  onClick={() => {
                    window.open(myAccountLink + "foodcoop-wallet/", "_blank")
                  }}
                >
                  <AccountBalanceWalletIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </>
    )
  )
}

export default OrderOverview
