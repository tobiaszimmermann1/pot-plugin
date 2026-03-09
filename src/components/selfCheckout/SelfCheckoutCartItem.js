import React, { useState, useEffect, useContext } from "react"
import Grid from "@mui/material/Grid"
import { Divider, FormControl, ListItemButton } from "@mui/material"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Stack, TextField } from "@mui/material"
import { ListItem, ListItemText, ListItemAvatar, Avatar } from "@mui/material"
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from "@mui/icons-material"
import Chip from "@mui/material/Chip"
import { cartContext } from "./cartContext"
import { updateProductAmount } from "../products/products"
const __ = wp.i18n.__

function SelfCheckoutCartItem({ productData, itemIndex, POSMode }) {
  const { cart, setCart } = useContext(cartContext)

  const [amount, setAmount] = useState(productData.amount)
  const [userWeightValue, setUserWeightValue] = useState(productData.userWeightValue)
  const [userTaraValue, setUserTaraValue] = useState(productData.userTaraValue)
  const [amountWeight, setAmountWeight] = useState(productData.amountWeight)
  const [totalPrice, setTotalPrice] = useState(0)
  
  const [inputUserWeight, setInputUserWeight] = useState(false)
  const [inputUserWeightValue, setInputUserWeightValue] = useState(0)
  const [inputUserTaraValue, setInputUserTaraValue] = useState(0)

  function removeItem(){
    updateCart(cart.filter( (cartItem,cartItemIndex) => itemIndex != cartItemIndex ));
  }

  function updateCart(newCart){    
    setCart(newCart)

    localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
  }

  useEffect(() => {
    if (productData) {
      let newPrice = productData.price * amount
      setTotalPrice(newPrice)
    }
  }, [productData, amount])

  useEffect(() => {
    updateCart(cart.map( (cartItem, cartItemIndex) => {
      if (itemIndex === cartItemIndex) {
        return { ...cartItem, amount, amountWeight, userWeightValue, userTaraValue }
      } else {
        return cartItem
      }
    }));
  }, [amount])

  useEffect(() => {
    updateProductAmount(productData,userWeightValue,userTaraValue);
    setAmountWeight(productData.amountWeight);
    setAmount(productData.amount);
  }, [userWeightValue,userTaraValue])

  function setNewUserWeight() {
    setUserWeightValue(inputUserWeightValue);
    setUserTaraValue(inputUserTaraValue);
    setInputUserWeight(false)
  }

  function renderWeightDialog(){
    return <Dialog open={inputUserWeight} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle id="alert-dialog-title">{__("Gewicht ändern", "fcplugin")}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
            <FormControl>
              <TextField type="number" size="normal" id="userWeightValue" name="userWeightValue" variant="outlined"
                label={__("Totalgewicht", "fcplugin")+' ( '+ productData.weight_unit +' )'}
                value={inputUserWeightValue}
                onChange={e => setInputUserWeightValue(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <TextField type="number" size="normal" id="userTaraValue" name="userTaraValue" variant="outlined"
                label={__("Verpackungsgewicht", "fcplugin") +' ( '+ productData.weight_unit +' )' }
                value={inputUserTaraValue}
                onChange={e => setInputUserTaraValue(e.target.value)}
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={setNewUserWeight} variant="contained" sx={{ marginBottom: "15px", marginRight: "10px" }} size="large">
            {__("Gewicht übernehmen", "fcplugin")}
          </Button>
        </DialogActions>
      </Dialog>
  }

  function renderWeighedItemContent(){
    return <Chip
      sx={{width:'100px'}}
      variant="outlined"
      label={`${productData.amountWeight} ${productData.weight_unit}`}
      onClick={() => {
        setInputUserWeight(true)
        setInputUserWeightValue(userWeightValue)
        setInputUserTaraValue(userTaraValue)
      }}
      onDelete={removeItem}
      deleteIcon={<DeleteIcon />}
    />
  }

  function decreaseAmount(){
    if ( productData.amount > 1 ) {
      setAmount(productData.amount - 1);
    } else {
      removeItem();
    }
  }

  function increaseAmount(){
    setAmount(productData.amount + 1);
  }

  function renderItemContent(){
    return <Chip
      sx={{width:'100px'}}
      avatar={<AddIcon onClick={increaseAmount} sx={{ cursor: "pointer" }} />}
      variant="outlined"
      label={productData.amount}
      onDelete={decreaseAmount}
      deleteIcon={productData.amount>1?<RemoveIcon/>:<DeleteIcon/>}
    />
  }

  if ( !productData ) return "";

  //productData.is_weighed = false;

  return <>
      { renderWeightDialog() }
      <ListItem
        disableGutters dense
        sx={{ fontSize: POSMode ? "1.5rem" : "1rem" }}
        secondaryAction={
          <Box sx={{ minWidth: '120px', textAlign: 'right' }}>
            <span style={{float:'left'}}>CHF</span>{parseFloat(totalPrice).toFixed(2)}
          </Box>
        }
      >
        <ListItemAvatar sx={{marginRight:'10px'}}>
          {productData.img ? <img src={productData.img} width="60px" height="60px"/> : ""}
        </ListItemAvatar>
        <ListItemText
          sx={{display: 'flex', flexDirection: 'column', gap: '5px'}}
          primary={<strong>{productData.name}</strong>}
          secondary={productData.is_weighed
            ? renderWeighedItemContent()
            : renderItemContent()
          }
        />
      </ListItem>
      <Divider />
    </>
  ;
}

export default SelfCheckoutCartItem
