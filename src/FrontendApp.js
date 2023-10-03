import React, { useState, useEffect } from "react"
import axios from "axios"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import OrderList from "./components/frontend/OrderList"
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

function FrontendApp() {
  const [products, setProducts] = useState()
  const [bestellrundenProducts, setBestellrundenProducts] = useState()
  const [cats, setCats] = useState()
  const [bestellrundenDates, setBestellrundenDates] = useState()
  const [activeBestellrunde, setActiveBestellrunde] = useState()
  const [nextBestellrunde, setNextBestellrunde] = useState()
  const [active, setActive] = useState(null)
  const [order, setOrder] = useState(null)
  const [currency, setCurrency] = useState(null)

  useEffect(() => {
    axios
      .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductList`, {
        user: frontendLocalizer.currentUser.ID
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setProducts(res[3])
          setBestellrundenProducts(res[2])
          setCats(res[4])
          setActiveBestellrunde(res[1])
          setActive(res[0])
          setBestellrundenDates(res[6])
          setNextBestellrunde(res[8])
          if (res[5] !== null) {
            setOrder(res[5])
          }
          setCurrency(res[7])
        }
      })
      .catch(error => console.log(error))
  }, [])

  return (
    <>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="fc_order_list_wrapper">
            <div id="fc_order_list_body">
              <OrderList currency={currency} order={order} categories={cats} allProducts={products} bestellrundenProducts={bestellrundenProducts} bestellrundenDates={bestellrundenDates} activeBestellrunde={activeBestellrunde} nextBestellrunde={nextBestellrunde} activeState={active} />
            </div>
          </div>
        </LocalizationProvider>
      </ThemeProvider>
    </>
  )
}

export default FrontendApp
