import React, { useState, useEffect, useRef } from "react"
import Dashboard from "./components/Dashboard"
import Members from "./components/Members"
import Bestellrunden from "./components/Bestellrunden"
import Products from "./components/Products"
import Settings from "./components/Settings"
import axios from "axios"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import PeopleIcon from "@mui/icons-material/People"
import Bookkeeping from "./components/Bookkeeping"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import LogoutIcon from "@mui/icons-material/Logout"
import SettingsIcon from "@mui/icons-material/Settings"
import QuestionMarkIcon from "@mui/icons-material/QuestionMark"
import WidgetsIcon from "@mui/icons-material/Widgets"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Skeleton from "@mui/material/Skeleton"
import { Card, Box, LinearProgress } from "@mui/material"
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
      default: "#fbfbfb",
      paper: "#ffffff"
    },
    success: {
      main: "#00c853"
    }
  }
})

function App() {
  const [activeTab, setActiveTab] = useState("orderingRounds")
  const [name, setName] = useState()
  const [permissions, setPermissions] = useState([])
  const [role, setRole] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getOption?option=blogname`)
      .then(function (response) {
        setName(JSON.parse(response.data))
      })
      .catch(function (error) {
        console.log(error)
      })
  }, [])

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getUser?id=${appLocalizer.currentUser.ID}`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          res.permissions && setPermissions(res.permissions)
          setRole(res.role)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  const pluginMenu = useRef()

  useEffect(() => {
    if (pluginMenu.current) {
      let menuItems = pluginMenu.current.children
      for (const menuItem of menuItems) {
        menuItem.classList.remove("menuItemActive")
      }
      let currentMenuItem = pluginMenu.current.querySelector("#" + activeTab)
      if (currentMenuItem) {
        currentMenuItem.classList.add("menuItemActive")
      }
    }
  }, [activeTab])

  document.getElementById("adminmenuwrap").style.display = "none"

  return (
    activeTab && (
      <>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="pluginWrapper">
              {!loading ? (
                <>
                  <div className="pluginHeader">
                    <div className="pluginMenu" ref={pluginMenu}>
                      {permissions && role && (
                        <span id="dashboard" className="menuItem firstMenuItem" onClick={() => setActiveTab("dashboard")}>
                          <DashboardIcon sx={{ marginRight: "10px" }} /> {__("Dashboard", "fcplugin")}
                        </span>
                      )}
                      {(permissions.includes("bestellrunden") || role === "administrator") && (
                        <span id="orderingRounds" className="menuItem" onClick={() => setActiveTab("orderingRounds")}>
                          <ShoppingBasketIcon sx={{ marginRight: "10px" }} /> {__("Bestellrunden", "fcplugin")}
                        </span>
                      )}
                      {(permissions.includes("products") || role === "administrator") && (
                        <span id="products" className="menuItem" onClick={() => setActiveTab("products")}>
                          <WidgetsIcon sx={{ marginRight: "10px" }} /> {__("Produkte", "fcplugin")}
                        </span>
                      )}
                      {(permissions.includes("members") || role === "administrator") && (
                        <span id="members" className="menuItem " onClick={() => setActiveTab("members")}>
                          <PeopleIcon sx={{ marginRight: "10px" }} /> {__("Mitglieder", "fcplugin")}
                        </span>
                      )}
                      {(permissions.includes("bookkeeping") || role === "administrator") && (
                        <span id="bookkeeping" className="menuItem" onClick={() => setActiveTab("bookkeeping")}>
                          <AccountBalanceIcon sx={{ marginRight: "10px" }} /> {__("Buchhaltung", "fcplugin")}
                        </span>
                      )}
                    </div>
                    <div className="pluginMenu">
                      <strong className="pluginHome">
                        <small>{name && name}</small>
                      </strong>
                      <span className="menuItem">
                        <small> v. {appLocalizer.version}</small>
                      </span>
                      {(permissions.includes("settings") || role === "administrator") && (
                        <span id="settings" className="menuItem" onClick={() => setActiveTab("settings")}>
                          <SettingsIcon />
                        </span>
                      )}
                      <span
                        id="help"
                        className="menuItem"
                        onClick={() => {
                          window.open("https://plugin.pot.ch/dokumentation", "_blank")
                        }}
                      >
                        <QuestionMarkIcon />
                      </span>
                      <span id="menuBack" className="menuItem" onClick={() => (window.location = appLocalizer.homeUrl + "/wp-admin")}>
                        <LogoutIcon />
                      </span>
                    </div>
                  </div>
                  <div className="pluginBody">
                    {activeTab === "dashboard" && <Dashboard />}
                    {activeTab === "orderingRounds" && <Bestellrunden />}
                    {activeTab === "products" && <Products />}
                    {activeTab === "members" && <Members />}
                    {activeTab === "bookkeeping" && <Bookkeeping />}
                    {activeTab === "settings" && <Settings />}
                  </div>
                </>
              ) : (
                <Card elevation={2} sx={{ display: "flex", justifyContent: "center", padding: "15px 0", flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0, width: "100%" }}>
                  <Box sx={{ width: "98%" }}>
                    <LinearProgress />
                  </Box>
                </Card>
              )}
            </div>
          </LocalizationProvider>
        </ThemeProvider>
      </>
    )
  )
}

export default App
