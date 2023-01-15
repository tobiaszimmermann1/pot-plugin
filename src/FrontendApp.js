import React, { useState, useEffect, useRef } from "react"
import Dashboard from "./components/Dashboard"
import Members from "./components/Members"
import Bestellrunden from "./components/Bestellrunden"
import Products from "./components/Products"
import axios from "axios"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import OrderList from "./components/OrderList"
import CircularProgress from "@mui/material/CircularProgress"
import Box from "@mui/material/Box"
const __ = wp.i18n.__

function FrontendApp() {
  const [products, setProducts] = useState()
  const [bestellrundenProducts, setBestellrundenProducts] = useState()
  const [cats, setCats] = useState()
  const [bestellrundenDates, setBestellrundenDates] = useState()
  const [activeBestellrunde, setActiveBestellrunde] = useState()
  const [active, setActive] = useState(null)

  useEffect(() => {
    axios
      .post(`${appLocalizer.apiUrl}/foodcoop/v1/getProductList`, {
        user: frontendLocalizer.currentUser.ID
      })
      .then(function (response) {
        if (response.data) {
          console.log(JSON.parse(response.data))
          const res = JSON.parse(response.data)
          setProducts(res[3])
          setBestellrundenProducts(res[2])
          setCats(res[4])
          setActiveBestellrunde(res[1])
          setActive(res[0])
          setBestellrundenDates(res[6])
        }
      })
      .catch(error => console.log(error))
  }, [])

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="fc_order_list_wrapper">
          <div id="fc_order_list_body">
            <OrderList allProducts={products} bestellrundenProducts={bestellrundenProducts} bestellrundenDates={bestellrundenDates} activeBestellrunde={activeBestellrunde} activeState={active} />
          </div>
        </div>
      </LocalizationProvider>
    </>
  )
}

export default FrontendApp
