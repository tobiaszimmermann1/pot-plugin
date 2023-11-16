import React from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import OrderingRounds from "./components/frontend/OrderingRounds"
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
  return (
    <>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="fc_order_list_wrapper">
            <div id="fc_order_list_body">
              <OrderingRounds />
            </div>
          </div>
        </LocalizationProvider>
      </ThemeProvider>
    </>
  )
}

export default FrontendApp
