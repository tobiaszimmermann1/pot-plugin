import React, { useState, useEffect } from "react"
import { Routes, Route, NavLink, Navigate } from "react-router-dom"
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

const menuClass = ({ isActive }) => "menuItem" + (isActive ? " menuItemActive" : "")

function App() {
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

  const allowed = permission => permissions.includes(permission) || role === "administrator"

  document.getElementById("adminmenuwrap").style.display = "none"

  return (
      <>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="pluginWrapper">
              {!loading ? (
                <>
                  <div className="pluginHeader">
                    <div className="pluginMenu">
                      {permissions && role && (
                        <NavLink to="/" end className={props => menuClass(props) + " firstMenuItem"}>
                          <DashboardIcon sx={{ marginRight: "10px" }} /> {__("Dashboard", "fcplugin")}
                        </NavLink>
                      )}
                      {allowed("bestellrunden") && (
                        <NavLink to="/orderingRounds" className={menuClass}>
                          <ShoppingBasketIcon sx={{ marginRight: "10px" }} /> {__("Bestellrunden", "fcplugin")}
                        </NavLink>
                      )}
                      {allowed("products") && (
                        <NavLink to="/products" className={menuClass}>
                          <WidgetsIcon sx={{ marginRight: "10px" }} /> {__("Produkte", "fcplugin")}
                        </NavLink>
                      )}
                      {allowed("members") && (
                        <NavLink to="/members" className={menuClass}>
                          <PeopleIcon sx={{ marginRight: "10px" }} /> {__("Mitglieder", "fcplugin")}
                        </NavLink>
                      )}
                      {allowed("bookkeeping") && (
                        <NavLink to="/bookkeeping" className={menuClass}>
                          <AccountBalanceIcon sx={{ marginRight: "10px" }} /> {__("Buchhaltung", "fcplugin")}
                        </NavLink>
                      )}
                    </div>
                    <div className="pluginMenu">
                      <strong className="pluginHome">
                        <small>{name && name}</small>
                      </strong>
                      <span className="menuItem">
                        <small> v. {appLocalizer.version}</small>
                      </span>
                      {allowed("settings") && (
                        <NavLink to="/settings" className={menuClass}>
                          <SettingsIcon />
                        </NavLink>
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
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/orderingRounds" element={allowed("bestellrunden") ? <Bestellrunden /> : <Navigate to="/" replace />} />
                      <Route path="/products/*" element={allowed("products") ? <Products /> : <Navigate to="/" replace />} />
                      <Route path="/members" element={allowed("members") ? <Members /> : <Navigate to="/" replace />} />
                      <Route path="/bookkeeping/*" element={allowed("bookkeeping") ? <Bookkeeping /> : <Navigate to="/" replace />} />
                      <Route path="/settings" element={allowed("settings") ? <Settings /> : <Navigate to="/" replace />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
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
}

export default App
