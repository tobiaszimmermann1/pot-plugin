import React, { useState, useEffect, useContext } from "react"
import Grid from "@mui/material/Grid"
import axios from "axios"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Stack, TextField, Switch, Box, Divider, FormControl, InputLabel, Select, MenuItem, LinearProgress } from "@mui/material"
import ListItem from "@mui/material/ListItem"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import Chip from "@mui/material/Chip"
import { cartContext } from "./cartContext"
import PhotoIcon from "@mui/icons-material/Photo"
import DeleteIcon from "@mui/icons-material/Delete"
const __ = wp.i18n.__

function SelfCheckoutCartItemPOSUser({ cartMargin, setCartMargin, margin, selectedMember, setSelectedMember, selectedPaymentGateway, setSelectedPaymentGateway }) {
  const { cart, setCart } = useContext(cartContext)
  const [memberCheckout, setMemberCheckout] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState(null)

  useEffect(() => {
    if (memberCheckout) {
      setCartMargin(0)
    } else {
      if (cart.length > 0) {
        let newTotal = 0
        cart.map(cartItem => {
          newTotal += cartItem.price * cartItem.amount

          if (cartItem.amount === 0) {
            setRemoveProduct(cartItem)
          }
        })
        setCartMargin(newTotal * (margin / 100))
      }
    }
  }, [memberCheckout])

  useEffect(() => {
    if (memberCheckout) {
      setLoading(true)
      axios
        .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getUsers`, {
          headers: {
            "X-WP-Nonce": frontendLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            const res = JSON.parse(response.data).sort((a, b) => a.name.localeCompare(b.name))
            console.log(res)
            setUsers(res)
            setSelectedMember(res[0])
            setLoading(false)
          }
        })
        .catch(error => console.log(error))
    } else {
      setUsers(null)
      setSelectedMember(null)
      setSelectedPaymentGateway({ name: "Barzahlung", id: "foodcoop_cash" })
    }
  }, [memberCheckout])

  return (
    <>
      <ListItem sx={{ margin: "5px 0" }}>
        <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start">
          <Grid item xs={6} sx={{ fontSize: "1.5rem", padding: 2 }}>
            <Grid container spacing={1} alignItems="flex-start" justifyContent="flex-start">
              <Grid item xs={12}>
                <Box sx={{ marginRight: 2 }}>
                  {__("Einkauf für Mitglied?", "fcplugin")} <Switch checked={memberCheckout} onChange={event => setMemberCheckout(event.target.checked)} inputProps={{ "aria-label": "pos-mode" }} color={"POSModeColor"} />
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: "right", fontSize: "1.5rem" }}>
            {cartMargin !== 0 ? (
              <>
                + {margin}% {__("Marge für Nicht-Mitglieder", "fcplugin")}: <strong style={{ marginLeft: "5px" }}>CHF {cartMargin.toFixed(2)}</strong>
              </>
            ) : loading ? (
              <Box sx={{ width: "100%", marginBottom: 4 }}>
                <LinearProgress color="POSModeColor" />
              </Box>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel id="fc_checkout-member" color="POSModeColor">
                    Mitglied wählen
                  </InputLabel>
                  <Select labelId="fc_checkout-member" id="fc_checkout-member-select" value={selectedMember} label="Mitglied" onChange={e => setSelectedMember(e.target.value)} color="POSModeColor" sx={{ fontSize: "1.25rem", fontWeight: "bold", backgroundColor: "white" }}>
                    {users &&
                      users.map(user => (
                        <MenuItem key={user.id} value={user}>
                          {user.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {selectedMember && (
                  <span style={{ marginTop: "10px", paddingRight: "10px", fontSize: "1.25rem" }}>
                    {__("Guthaben von", "fcplugin")} {selectedMember.name}: <strong style={{ marginLeft: "5px" }}>CHF {parseFloat(selectedMember.balance).toFixed(2)}</strong>
                  </span>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </ListItem>
    </>
  )
}

export default SelfCheckoutCartItemPOSUser
