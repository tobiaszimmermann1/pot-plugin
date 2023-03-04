import React, { useState, useEffect, useRef } from "react"
import Dashboard from "./components/Dashboard"
import Members from "./components/Members"
import Bestellrunden from "./components/Bestellrunden"
import Products from "./components/Products"
import axios from "axios"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import PeopleIcon from "@mui/icons-material/People"
import Bookkeeping from "./components/Bookkeeping"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
const __ = wp.i18n.__

function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [name, setName] = useState()

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getOption?option=blogname`)
      .then(function (response) {
        // handle success
        setName(JSON.parse(response.data))
      })
      .catch(function (error) {
        // handle error
        console.log(error)
      })
      .finally(function () {
        // always executed
      })
  }, [])

  const pluginMenu = useRef()

  useEffect(() => {
    let menuItems = pluginMenu.current.children
    for (const menuItem of menuItems) {
      menuItem.classList.remove("menuItemActive")
    }
    pluginMenu.current.querySelector("#" + activeTab).classList.add("menuItemActive")
  }, [activeTab])

  return (
    <>
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
              <span id="bookkeeping" className="menuItem " onClick={() => setActiveTab("bookkeeping")}>
                <AccountBalanceIcon /> {__("Buchhaltung", "fcplugin")}
              </span>
            </div>
            <strong className="pluginHome" onClick={() => setActiveTab("dashboard")}>
              {appLocalizer.pluginUrl && (
                <>
                  <img src={`${appLocalizer.pluginUrl}/images/foodcoop-icon.svg`} className="pluginLogo" /> Foodcoop {name && name}
                </>
              )}
            </strong>
          </div>
          <div className="pluginBody">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "orderingRounds" && <Bestellrunden />}
            {activeTab === "products" && <Products />}
            {activeTab === "members" && <Members />}
            {activeTab === "bookkeeping" && <Bookkeeping />}
          </div>
        </div>
      </LocalizationProvider>
    </>
  )
}

export default App
