import React, { useState, useEffect, useRef } from "react"
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

const Bookkeeping = () => {
  const [activeTab, setActiveTab] = useState("transactions")
  const pluginMenu = useRef()
  const [options, setOptions] = useState(null)

  useEffect(() => {
    let menuItems = pluginMenu.current.children
    for (const menuItem of menuItems) {
      menuItem.classList.remove("menuItemActive")
    }
    pluginMenu.current.querySelector("#" + activeTab).classList.add("menuItemActive")
  }, [activeTab])

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
                  <span className="pluginMenu" ref={pluginMenu}>
                    <span id="transactions" className="menuItem firstMenuItem" onClick={() => setActiveTab("transactions")}>
                      {__("Guthaben & Transaktionen", "fcplugin")}
                    </span>
                    <span id="orders" className="menuItem" onClick={() => setActiveTab("orders")}>
                      {__("Bestellungen", "fcplugin")}
                    </span>
                    <span id="expenses" className="menuItem" onClick={() => setActiveTab("expenses")}>
                      {__("Ausgaben", "fcplugin")}
                    </span>
                    <span id="journal" className="menuItem " onClick={() => setActiveTab("journal")}>
                      {__("Milchbüechli", "fcplugin")}
                    </span>
                    <span id="billingOverview" className="menuItem " onClick={() => setActiveTab("billingOverview")}>
                      {__("Abrechnung", "fcplugin")}
                    </span>
                    {options !== null && options.fc_update_balance_on_purchase === "1" && (
                      <span id="missingPayouts" className="menuItem " onClick={() => setActiveTab("missingPayouts")}>
                      {__("Fehlende Gutschriften", "fcplugin")}
                      </span>
                    )}             
                  </span>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <div className="pluginBody">
        {activeTab === "transactions" && <Transactions />}
        {activeTab === "orders" && <Orders />}
        {activeTab === "expenses" && <Expenses />}
        {activeTab === "journal" && <Journal />}
        {activeTab === "billingOverview" && <BillingOverview />}
        {activeTab === "missingPayouts" && <MissingPayouts />}
      </div>
    </>
  )
}

export default Bookkeeping
