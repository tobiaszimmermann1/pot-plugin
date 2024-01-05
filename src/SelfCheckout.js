import React, { useState, useEffect } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import axios from "axios"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Alert, Box, LinearProgress } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import IconButton from "@mui/material/IconButton"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import PointOfSaleIcon from "@mui/icons-material/PointOfSale"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner"
import SelfCheckoutCart from "./components/selfCheckout/SelfCheckoutCart"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import { cartContext } from "./components/selfCheckout/cartContext"
import AddProductBySku from "./components/selfCheckout/AddProductBySku"
import LoadingButton from "@mui/lab/LoadingButton"
import QrScanner from "./components/selfCheckout/QrScanner"

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

function SelfCheckout() {
  const [blogname, setBlogname] = useState(null)
  const [scanning, setScanning] = useState(true)
  const [adding, setAdding] = useState(false)
  const [productError, setProductError] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(null)

  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=blogname`)
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setBlogname(res)
        }
      })
      .catch(error => console.log(error))

    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_self_checkout`)
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          res === "1" ? setActive(true) : setActive(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    scanning && setProductError(null)
  }, [scanning])

  useEffect(() => {
    if (cart.length === 0) {
      let localStorageCart = localStorage.getItem("fc_selfcheckout_cart")
      if (localStorageCart) {
        console.log(JSON.parse(localStorageCart))
        setCart(JSON.parse(localStorageCart))
      }
    }
  }, [])

  useEffect(() => {
    if (productError !== null) {
      setTimeout(() => {
        setProductError(null)
      }, 5000)
    }
  }, [productError])

  function checkout() {
    setSubmitting(true)

    if (cart.length > 0) {
      axios
        .post(
          `${frontendLocalizer.apiUrl}/foodcoop/v1/addToCart`,
          {
            data: JSON.stringify(cart),
            user: JSON.stringify(frontendLocalizer.currentUser)
          },
          {
            headers: {
              "X-WP-Nonce": frontendLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          setSubmitting(false)
          localStorage.removeItem("fc_selfcheckout_cart")
          location.href = JSON.parse(response.data)
        })
        .catch(error => console.log(error.message))
        .finally(response => {
          setSubmitting(false)
        })
    } else {
      setProductError("Warenkorb leer.")
      setSubmitting(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <cartContext.Provider value={{ cart, setCart }}>
          {active ? (
            <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
              <AppBar sx={{ position: "relative" }} color="primary">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                  <DialogTitle textAlign="left" sx={{ fontSize: "1rem" }}>
                    {blogname} - {__("Self Checkout", "fcplugin")}
                  </DialogTitle>
                  <Stack justifyContent={"flex-end"} alignItems={"center"} direction={"row"}>
                    <span style={{ marginRight: "25px" }}>{frontendLocalizer.name} </span>
                    <IconButton edge="start" color="inherit" aria-label="close" onClick={() => (window.location.href = frontendLocalizer.homeUrl)}>
                      <ExitToAppIcon />
                    </IconButton>
                  </Stack>
                </Toolbar>
              </AppBar>
              {productError && (
                <Alert sx={{ margin: 1 }} severity="warning">
                  {productError}
                </Alert>
              )}
              <DialogContent dividers={scroll === "paper"} sx={{ padding: 1 }}>
                {loading && (
                  <Box sx={{ width: "100%", marginBottom: "10px" }}>
                    <LinearProgress />
                  </Box>
                )}
                {scanning && <QrScanner setScanning={setScanning} cart={cart} setShowCart={setShowCart} setProductError={setProductError} setCart={setCart} productError={productError} setLoading={setLoading} />}
                {adding && <AddProductBySku setShowCart={setShowCart} setAdding={setAdding} setProductError={setProductError} />}
                {showCart && <SelfCheckoutCart />}
              </DialogContent>
              <DialogActions sx={{ backgroundColor: "#f0f0f0" }}>
                <Button
                  disabled={submitting}
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setShowCart(false)
                    setScanning(true)
                    setAdding(false)
                  }}
                >
                  <QrCodeScannerIcon />
                </Button>
                <Button
                  disabled={submitting}
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setShowCart(false)
                    setScanning(false)
                    setAdding(true)
                  }}
                >
                  <AddShoppingCartIcon />
                </Button>
                <Button
                  disabled={submitting}
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setShowCart(true)
                    setScanning(false)
                    setAdding(false)
                  }}
                >
                  <ShoppingCartIcon />
                </Button>
                <LoadingButton startIcon={<PointOfSaleIcon />} variant="contained" size="large" loading={submitting} onClick={() => checkout()}>
                  Kasse
                </LoadingButton>
              </DialogActions>
            </Dialog>
          ) : active === null ? (
            <Box sx={{ width: "100%", marginBottom: 4 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Alert severity="error" sx={{ marginBottom: 4 }}>
              {__("Der Self Checkout ist deaktiviert.", "fcplugin")}
            </Alert>
          )}
        </cartContext.Provider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default SelfCheckout
