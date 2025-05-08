import React, { useState, useEffect, useContext } from "react"
import { ShoppingContext } from "./ShoppingContext"
import { TriggerContext } from "./ShoppingContext"
import IconButton from "@mui/material/IconButton"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import Dialog from "@mui/material/Dialog"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import CloseIcon from "@mui/icons-material/Close"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import ProductDialog from "./ProductDialog"
const __ = wp.i18n.__

const ProductLine = ({ currency, product, setShoppingList, setTrigger, activeState, publicPrices, additionalProductInformation, stockManagement, showTaxes }) => {
  const [amount, setAmount] = useState(0)
  const [taxValue, setTaxValue] = useState(null)

  /**
   * Sales Tax Logic
   */
  useEffect(() => {
    if (showTaxes) {
      setTaxValue(product.tax)
    }
  }, [])

  /**
   * Product information modal
   */
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const shoppingList = useContext(ShoppingContext)
  const trigger = useContext(TriggerContext)

  useEffect(() => {
    if (amount >= 0) {
      let currentShoppingList = shoppingList
      if (currentShoppingList === null) {
        currentShoppingList = {}
      }
      currentShoppingList[product.id] = { name: product.name, amount: amount, unit: product.unit, price: product.price, product_id: product.id }
      setShoppingList(currentShoppingList)
      setTrigger(trigger + 1)
    }
    if (amount === null) {
      setAmount(0)
    }
  }, [amount])

  function addOne() {
    let newAmount = parseInt(amount) + 1
    if (newAmount == null) {
      newAmount = 0
    }

    if (stockManagement === true && newAmount >= product.stock && product.stock_status !== "unlimited") {
      newAmount = product.stock
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

  useEffect(() => {
    if (stockManagement !== null) {
      if (stockManagement === true && product.stock_status !== "unlimited") {
        product.stock > product.amount ? setAmount(product.amount) : setAmount(product.stock)
      } else {
        setAmount(product.amount)
      }
    }
  }, [stockManagement])

  useEffect(() => {
    if (stockManagement === true && product.stock_status !== "unlimited") {
      product.stock < amount && setAmount(product.stock)
    }
  }, [amount])

  return (
    <>
      <div className="fc_order_list_line_wrapper" id={product.id} style={amount > 0 ? { backgroundColor: "#f2fbe8" } : { backgroundColor: "#f9f9f9" }}>
        {additionalProductInformation && (
          <div className="fc_order_list_mobile_img" onClick={handleOpen}>
            <span className="product_image_thumbnail" style={{ backgroundImage: `url(${product.thumbnail})` }} />
          </div>
        )}
        <div className="fc_order_list_line">
          {activeState && frontendLocalizer.currentUser.ID ? (
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
          ) : (
            <span className="fc_order_list_col col_1 col_nmbr">
              <input type="number" disabled />
            </span>
          )}
          {additionalProductInformation ? (
            <>
              <span className="fc_order_list_col col_15" onClick={handleOpen}>
                <span className="product_image_thumbnail" style={{ backgroundImage: `url(${product.thumbnail})` }} />
              </span>
              <span className="fc_order_list_col col_2" onClick={handleOpen}>
                {product.name}
                {stockManagement === true && (
                  <>
                    <br /> <span style={{ fontStyle: "italic", fontWeight: "normal", marginTop: "5px", fontSize: "0.95em" }}>{product.stock > 0 ? product.stock + " " + __("lagernd", "fcplugin") : product.stock_status === "unlimited" ? __("auf Lager", "fcplugin") : __("ausverkauft", "fcplugin")}</span>
                  </>
                )}
              </span>
            </>
          ) : (
            <span className="fc_order_list_col col_2x">
              {product.name}
              {stockManagement === true && (
                <>
                  <br /> <span style={{ fontStyle: "italic", fontWeight: "normal", marginTop: "5px", fontSize: "0.95em" }}>{product.stock > 0 ? product.stock + " " + __("lagernd", "fcplugin") : product.stock_status === "unlimited" ? __("auf Lager", "fcplugin") : __("ausverkauft", "fcplugin")}</span>
                </>
              )}
            </span>
          )}

          <span className="fc_order_list_col col_25">{product.short_description}</span>
          <span className="fc_order_list_col col_3" dangerouslySetInnerHTML={{ __html: product.details }} />
          <span className="fc_order_list_col col_4">{product.unit}</span>
          <span className="fc_order_list_col col_5">{product.lot}</span>
          <span className="fc_order_list_col col_6">
            {publicPrices ? (
              <>
                <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(product.price).toFixed(2)} <br /> <small>{showTaxes && `(+ MWST: ${product.tax.toFixed(2)}%)`}</small>
              </>
            ) : (
              <span style={{ fontSize: "0.75em", fontStyle: "italic" }}>{__("für Mitglieder", "fcplugin")}</span>
            )}
          </span>
        </div>
      </div>
      <Dialog open={open} onClose={handleClose} sx={{ zIndex: 15016 }} scroll="body" fullWidth maxWidth="xl">
        <ProductDialog product={product} handleClose={handleClose} currency={currency} stockManagement={stockManagement} />
      </Dialog>
    </>
  )
}

export default ProductLine
