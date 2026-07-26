import React, { useEffect } from "react"
import Grid from "@mui/material/Grid"
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material"
import ListItem from "@mui/material/ListItem"
const __ = wp.i18n.__

const paymentGateways = [
  { name: "Foodcoop Guthaben", id: "foodcoop_guthaben" },
  { name: "Barzahlung", id: "foodcoop_cash" }
]

function SelfCheckoutPaymentGateway({ selectedPaymentGateway, setSelectedPaymentGateway }) {
  // no default on purpose: the operator must actively choose, so member credit
  // is never charged by accident
  useEffect(() => {
    setSelectedPaymentGateway(null)
  }, [])

  return (
    <ListItem sx={{ margin: "5px 0" }}>
      <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
        <Grid item xs={6} sx={{ fontSize: "1.5rem", padding: 2 }}>
          <Box sx={{ marginRight: 2 }}>{__("Zahlungsart", "fcplugin")}</Box>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <ToggleButtonGroup exclusive value={selectedPaymentGateway ? selectedPaymentGateway.id : null} onChange={(e, id) => setSelectedPaymentGateway(paymentGateways.find(gateway => gateway.id === id) || null)} sx={{ backgroundColor: "white" }}>
            {paymentGateways.map(gateway => (
              <ToggleButton key={gateway.id} value={gateway.id} sx={{ fontSize: "1.1rem", fontWeight: "bold", "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: "POSModeColor.main", color: "black" } }}>
                {gateway.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </ListItem>
  )
}

export default SelfCheckoutPaymentGateway
