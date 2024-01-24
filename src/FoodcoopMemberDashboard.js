import React, { useState, useEffect, useRef } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import Grid from "@mui/material/Grid"
import { SVG } from "swissqrbill/svg"
import axios from "axios"
import { Box, LinearProgress, Divider } from "@mui/material"
import Alert from "@mui/material/Alert"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import WidgetsIcon from "@mui/icons-material/Widgets"
import MyBalance from "./components/membersDashboard/MyBalance"
import MyTransactions from "./components/membersDashboard/MyTransactions"
import MyProducts from "./components/membersDashboard/MyProducts"
const __ = wp.i18n.__

function FoodcoopMemberDashboard() {
  const [activeTab, setActiveTab] = useState("balance")

  const pluginMenu = useRef()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <>
        <div className="fc_members_dashboard_header">
          <div className="pluginMenu" ref={pluginMenu}>
            <span id="dashboard" className="menuItemDashboard firstMenuItem" onClick={() => setActiveTab("balance")}>
              <h2>{__("Mein Guthaben", "fcplugin")}</h2>
            </span>
            <span id="orderingRounds" className="menuItemDashboard" onClick={() => setActiveTab("transactions")}>
              <h2>{__("Meine Transaktionen", "fcplugin")}</h2>
            </span>
            <span id="products" className="menuItemDashboard" onClick={() => setActiveTab("products")}>
              <h2>{__("Meine Produkte", "fcplugin")}</h2>
            </span>
          </div>
        </div>
        <div className="fc_members_dashboard_body">
          {activeTab === "balance" && <MyBalance />}
          {activeTab === "transactions" && <MyTransactions />}
          {activeTab === "products" && <MyProducts />}
        </div>
      </>
    </LocalizationProvider>
  )
}

export default FoodcoopMemberDashboard
