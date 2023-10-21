import React, { useState, useEffect, useRef, useMemo, useContext } from "react"
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
const __ = wp.i18n.__

const ProductLine = ({ currency, product, setShoppingList, setTrigger, activeState, publicPrices, additionalProductInformation }) => {
  const [amount, setAmount] = useState(product.amount)

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
    <>
      <div className="fc_order_list_line_wrapper" id={product.id} style={amount > 0 ? { backgroundColor: "#f2fbe8" } : { backgroundColor: "#f9f9f9" }}>
        {additionalProductInformation && (
          <div className="fc_order_list_mobile_img" onClick={handleOpen}>
            <span className="product_image_thumbnail" style={{ backgroundImage: `url(${product.image})` }} />
          </div>
        )}
        <div className="fc_order_list_line">
          {activeState ? (
            frontendLocalizer.currentUser.ID ? (
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
            )
          ) : (
            <span className="fc_order_list_col col_1 col_nmbr">
              <input type="number" disabled />
            </span>
          )}
          {additionalProductInformation ? (
            <>
              <span className="fc_order_list_col col_15" onClick={handleOpen}>
                <span className="product_image_thumbnail" style={{ backgroundImage: `url(${product.image})` }} />
              </span>
              <span className="fc_order_list_col col_2" onClick={handleOpen}>
                {product.name}
              </span>
            </>
          ) : (
            <span className="fc_order_list_col col_2x">{product.name}</span>
          )}

          <span className="fc_order_list_col col_25">{product.short_description}</span>
          <span className="fc_order_list_col col_3">{product.details}</span>
          <span className="fc_order_list_col col_4">{product.unit}</span>
          <span className="fc_order_list_col col_5">{product.lot}</span>
          <span className="fc_order_list_col col_6">
            {publicPrices ? (
              <>
                <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(product.price).toFixed(2)}
              </>
            ) : (
              <span style={{ fontSize: "0.75em", fontStyle: "italic" }}>{__("für Mitglieder", "fcplugin")}</span>
            )}
          </span>
        </div>
      </div>
      <Dialog scroll="body" fullScreen={useMediaQuery("(max-width:800px)")} open={open} onClose={handleClose} sx={{ zIndex: 1501 }}>
        <Card variant="outlined" sx={{ border: "none" }}>
          <CardActions sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </CardActions>
          {product.image && <CardMedia component="img" image={product.image} className="productModalImage" />}
          <CardContent style={{ padding: 20 }}>
            <Typography gutterBottom variant="h5" component="div">
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.primary" style={{ backgroundColor: "#f0f0f0", padding: "10px 10px 10px 10px", borderBottom: "1px solid #ccc" }}>
              <strong>{product.details}</strong> | {product.unit} | <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(product.price).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.primary" style={{ marginBottom: 20, backgroundColor: "#f0f0f0", padding: "10px 10px" }}>
              {product.short_description}
            </Typography>
            <Typography variant="body2" color="text.primary" style={{ marginBottom: 10 }}>
              {product.description}
            </Typography>
          </CardContent>
        </Card>
      </Dialog>
    </>
  )
}

export default ProductLine
