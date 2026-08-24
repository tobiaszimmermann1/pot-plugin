import React, { useState, useEffect } from "react"
import { Routes, Route, NavLink, Navigate } from "react-router-dom"
import axios from "axios"
import { Box, Typography } from "@mui/material"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Transactions from "./bookkeeping/Transactions"
import Orders from "./bookkeeping/Orders"
import Expenses from "./bookkeeping/Expenses"
import Journal from "./bookkeeping/Journal"
import BillingOverview from "./bookkeeping/BillingOverview"
import MissingPayouts from "./bookkeeping/MissingPayouts"
const __ = wp.i18n.__

const menuClass = ({ isActive }) => "menuItem" + (isActive ? " menuItemActive" : "")

const Bookkeeping = () => {
  const [options, setOptions] = useState(null)

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getAllOptions`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        setOptions(JSON.parse(response.data))
      })
      .catch(function (error) {
        console.log(error)
      })
  }, [])

  return (
    <>
      <Box>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275, borderRadius: 0 }}>
              <CardContent sx={{ paddingBottom: "16px !important" }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  <span className="pluginMenu">
                    <NavLink to="/bookkeeping" end className={props => menuClass(props) + " firstMenuItem"}>
                      {__("Guthaben & Transaktionen", "fcplugin")}
                    </NavLink>
                    <NavLink to="/bookkeeping/orders" className={menuClass}>
                      {__("Bestellungen", "fcplugin")}
                    </NavLink>
                    <NavLink to="/bookkeeping/expenses" className={menuClass}>
                      {__("Ausgaben", "fcplugin")}
                    </NavLink>
                    <NavLink to="/bookkeeping/journal" className={menuClass}>
                      {__("Milchbüechli", "fcplugin")}
                    </NavLink>
                    <NavLink to="/bookkeeping/billingOverview" className={menuClass}>
                      {__("Abrechnung", "fcplugin")}
                    </NavLink>
                    {options !== null && options.fc_update_balance_on_purchase === "1" && (
                      <NavLink to="/bookkeeping/missingPayouts" className={menuClass}>
                        {__("Fehlende Gutschriften", "fcplugin")}
                      </NavLink>
                    )}
                  </span>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <div className="pluginBody">
        <Routes>
          <Route index element={<Transactions />} />
          <Route path="orders" element={<Orders />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="journal" element={<Journal />} />
          <Route path="billingOverview" element={<BillingOverview />} />
          <Route path="missingPayouts" element={<MissingPayouts />} />
          <Route path="*" element={<Navigate to="/bookkeeping" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default Bookkeeping
