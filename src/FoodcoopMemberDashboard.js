import React, { useState, useEffect, useRef } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import MyBalance from "./components/membersDashboard/MyBalance"
import MyTransactions from "./components/membersDashboard/MyTransactions"
import MyProducts from "./components/membersDashboard/MyProducts"
import { createTheme, ThemeProvider } from "@mui/material/styles"
const __ = wp.i18n.__

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00796b"
    },
    secondary: {
      main: "#CFD8DC"
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff"
    },
    success: {
      main: "#00c853"
    }
  }
})

function FoodcoopMemberDashboard() {
  const [activeTab, setActiveTab] = useState("balance")

  const pluginMenu = useRef()

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <>
          <div className="fc_members_dashboard_header">
            <div className="pluginMenu" ref={pluginMenu}>
              <span id="dashboard" className="menuItemDashboard firstMenuItem" onClick={() => setActiveTab("balance")}>
                <strong style={{ fontWeight: activeTab === "balance" ? "bold" : "normal" }}>{__("Mein Guthaben", "fcplugin")}</strong>
              </span>
              <span id="orderingRounds" className="menuItemDashboard" onClick={() => setActiveTab("transactions")}>
                <strong style={{ fontWeight: activeTab === "transactions" ? "bold" : "normal" }}>{__("Meine Transaktionen", "fcplugin")}</strong>
              </span>
              <span id="products" className="menuItemDashboard" onClick={() => setActiveTab("products")}>
                <strong style={{ fontWeight: activeTab === "products" ? "bold" : "normal" }}>{__("Meine Produkte", "fcplugin")}</strong>
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
    </ThemeProvider>
  )
}

export default FoodcoopMemberDashboard
