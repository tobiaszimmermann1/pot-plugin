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

function SelfCheckoutPaymentGateway({ selectedPaymentGateway, setSelectedPaymentGateway }) {
  const { cart, setCart } = useContext(cartContext)
  const [paymentGateways, setPaymentGateways] = useState([
    { name: "Foodcoop Guthaben", id: "foodcoop_guthaben" },
    { name: "Barzahlung", id: "foodcoop_cash" }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSelectedPaymentGateway(paymentGateways[0])
  }, [])

  return (
    <>
      <ListItem sx={{ margin: "5px 0" }}>
        <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start">
          <Grid item xs={6} sx={{ fontSize: "1.5rem", padding: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ marginRight: 2 }}>{__("Zahlungsart", "fcplugin")}</Box>
            </Grid>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: "right", fontSize: "1.5rem" }}>
            {loading ? (
              <Box sx={{ width: "100%", marginBottom: 4 }}>
                <LinearProgress color="POSModeColor" />
              </Box>
            ) : (
              <FormControl fullWidth>
                <InputLabel id="fc_checkout-member" color="POSModeColor">
                  Zahlungsart wählen
                </InputLabel>
                {selectedPaymentGateway && (
                  <Select labelId="fc_checkout-member" id="fc_checkout-member-select" value={selectedPaymentGateway} label="Payment Gateway" onChange={e => setSelectedPaymentGateway(e.target.value)} color="POSModeColor" sx={{ fontSize: "1.25rem", fontWeight: "bold", backgroundColor: "white" }}>
                    {paymentGateways &&
                      paymentGateways.map(gateway => (
                        <MenuItem key={gateway.id} value={gateway}>
                          {gateway.name}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              </FormControl>
            )}
          </Grid>
        </Grid>
      </ListItem>
    </>
  )
}

export default SelfCheckoutPaymentGateway
