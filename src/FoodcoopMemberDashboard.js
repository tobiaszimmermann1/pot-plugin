import React from "react"
import { Routes, Route, NavLink, Navigate } from "react-router-dom"
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
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <>
          <div className="fc_members_dashboard_header">
            <div className="pluginMenu">
              <NavLink to="/" end className="menuItemDashboard firstMenuItem">
                {({ isActive }) => <strong style={{ fontWeight: isActive ? "bold" : "normal" }}>{__("Mein Guthaben", "fcplugin")}</strong>}
              </NavLink>
              <NavLink to="/transactions" className="menuItemDashboard">
                {({ isActive }) => <strong style={{ fontWeight: isActive ? "bold" : "normal" }}>{__("Meine Transaktionen", "fcplugin")}</strong>}
              </NavLink>
              <NavLink to="/products" className="menuItemDashboard">
                {({ isActive }) => <strong style={{ fontWeight: isActive ? "bold" : "normal" }}>{__("Meine Produkte", "fcplugin")}</strong>}
              </NavLink>
            </div>
          </div>
          <div className="fc_members_dashboard_body">
            <Routes>
              <Route path="/" element={<MyBalance />} />
              <Route path="/transactions" element={<MyTransactions />} />
              <Route path="/products" element={<MyProducts />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default FoodcoopMemberDashboard
