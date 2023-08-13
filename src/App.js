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
import RestaurantIcon from "@mui/icons-material/Restaurant"
import PeopleIcon from "@mui/icons-material/People"
import Bookkeeping from "./components/Bookkeeping"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import CloseIcon from "@mui/icons-material/Close"
import SettingsIcon from "@mui/icons-material/Settings"
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

  const pluginMenu = useRef()

  useEffect(() => {
    let menuItems = pluginMenu.current.children
    for (const menuItem of menuItems) {
      menuItem.classList.remove("menuItemActive")
    }
    let currentMenuItem = pluginMenu.current.querySelector("#" + activeTab)
    if (currentMenuItem) {
      currentMenuItem.classList.add("menuItemActive")
    }
  }, [activeTab])

  document.getElementById("adminmenuwrap").style.display = "none"

  return (
    activeTab && (
      <>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="pluginWrapper">
              <div className="pluginHeader">
                <div className="pluginMenu" ref={pluginMenu}>
                  <span id="dashboard" className="menuItem firstMenuItem" onClick={() => setActiveTab("dashboard")}>
                    <DashboardIcon /> {__("Dashboard", "fcplugin")}
                  </span>
                  <span id="orderingRounds" className="menuItem" onClick={() => setActiveTab("orderingRounds")}>
                    <ShoppingBasketIcon /> {__("Bestellrunden", "fcplugin")}
                  </span>
                  <span id="products" className="menuItem" onClick={() => setActiveTab("products")}>
                    <RestaurantIcon /> {__("Produkte", "fcplugin")}
                  </span>
                  <span id="members" className="menuItem " onClick={() => setActiveTab("members")}>
                    <PeopleIcon /> {__("Mitglieder", "fcplugin")}
                  </span>
                  <span id="bookkeeping" className="menuItem" onClick={() => setActiveTab("bookkeeping")}>
                    <AccountBalanceIcon /> {__("Buchhaltung", "fcplugin")}
                  </span>
                </div>
                <div className="pluginMenu">
                  <strong className="pluginHome">
                    {appLocalizer.pluginUrl && (
                      <>
                        <img src={`${appLocalizer.pluginUrl}/images/foodcoop-icon.svg`} className="pluginLogo" /> {name && name}
                      </>
                    )}
                  </strong>
                  <span id="settings" className="menuItem" onClick={() => setActiveTab("settings")}>
                    <SettingsIcon />
                  </span>
                  <span id="menuBack" className="menuItem firstMenuItem" onClick={() => (window.location = appLocalizer.homeUrl + "/wp-admin")}>
                    <CloseIcon />
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
            </div>
          </LocalizationProvider>
        </ThemeProvider>
      </>
    )
  )
}

export default App
