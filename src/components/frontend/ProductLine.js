import React, { useState, useEffect, useRef, useMemo, useContext } from "react"
import { ShoppingContext } from "./ShoppingContext"
import { TriggerContext } from "./ShoppingContext"
import IconButton from "@mui/material/IconButton"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
const __ = wp.i18n.__

const ProductLine = ({ currency, product, setShoppingList, setTrigger, activeState }) => {
  const [amount, setAmount] = useState(product.amount)

  const shoppingList = useContext(ShoppingContext)
  const trigger = useContext(TriggerContext)

  useEffect(() => {
    if (amount >= 0) {
      let currentShoppingList = shoppingList
      if (currentShoppingList === null) {
        currentShoppingList = {}
      }
      currentShoppingList[product.id] = { name: product.name, amount: amount, unit: product.unit, price: product.price, id: product.id }
      setShoppingList(currentShoppingList)
      setTrigger(trigger + 1)
    }
    if (amount == null) {
      setAmount(0)
    }
  }, [amount])

  function addOne() {
    let newAmount = parseInt(amount) + 1
    if (newAmount == null) {
      newAmount = 0
    }
    setAmount(newAmount)
  }

  function removeOne() {
    let newAmount = parseInt(amount) - 1
    if (newAmount < 0) {
      newAmount = 0
    }
    if (newAmount == null) {
      newAmount = 0
    }
    setAmount(newAmount)
  }

  return (
    <div id={product.id} className="fc_order_list_line" style={amount > 0 ? { backgroundColor: "#f2fbe8" } : { backgroundColor: "#f9f9f9" }}>
      {activeState && (
        <span className="fc_order_list_col col_1 col_nmbr">
          <a onClick={removeOne}>
            <IconButton aria-label="-" sx={{ border: "1px solid #cacaca", borderRadius: "2px", width: "100%" }}>
              <RemoveIcon />
            </IconButton>
          </a>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={amount > 0 ? { width: "100%", backgroundColor: "#f2fbe8" } : { width: "100%" }} />
          <a onClick={addOne}>
            <IconButton aria-label="+" sx={{ border: "1px solid #cacaca", borderRadius: "2px", width: "100%" }}>
              <AddIcon />
            </IconButton>
          </a>
        </span>
      )}
      <span className="fc_order_list_col col_2">{product.name}</span>
      <span className="fc_order_list_col col_25">{product.short_description}</span>
      <span className="fc_order_list_col col_3">{product.details}</span>
      <span className="fc_order_list_col col_4">{product.unit}</span>
      <span className="fc_order_list_col col_5">{product.lot}</span>
      <span className="fc_order_list_col col_6">
        <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(product.price).toFixed(2)}
      </span>
      {!activeState && <span className="fc_order_list_header col_1"></span>}
    </div>
  )
}

export default ProductLine
