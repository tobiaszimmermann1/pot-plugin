import React, { useState, useEffect } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import Grid from "@mui/material/Grid"
import axios from "axios"
import { CircularProgress } from "@mui/material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import PointOfSaleIcon from "@mui/icons-material/PointOfSale"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Html5QrcodePlugin from "./components/selfCheckout/Html5QrcodeScannerPlugin"
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner"
import SelfCheckoutCart from "./components/selfCheckout/SelfCheckoutCart"
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

function AddToCart() {
  const [loading, setLoading] = useState(true)
  const [blogname, setBlogname] = useState(null)
  const [scanning, setScanning] = useState(false)

  const onNewScanResult = (decodedText, decodedResult) => {
    setScanning(false)
    document.getElementById("productToAdd").innerHTML = decodedText
    console.log(decodedText)
    console.log(decodedResult)
  }

  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=blogname`)
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setBlogname(res)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
          <AppBar sx={{ position: "relative" }} color="primary">
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <DialogTitle textAlign="left">
                {blogname} - {__("Self Checkout", "fcplugin")}
              </DialogTitle>
              <IconButton edge="start" color="inherit" aria-label="close" onClick={() => (window.location.href = frontendLocalizer.homeUrl)}>
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <DialogContent dividers={scroll === "paper"}>
            <div id="productToAdd"></div>
            {scanning ? <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={onNewScanResult} /> : <SelfCheckoutCart />}
          </DialogContent>
          <DialogActions>
            {scanning ? (
              <Button autoFocus variant="contained" startIcon={<ShoppingCartIcon />} size="large" onClick={() => setScanning(false)}>
                Warenkorb
              </Button>
            ) : (
              <Button autoFocus variant="contained" startIcon={<QrCodeScannerIcon />} size="large" onClick={() => setScanning(true)}>
                Scan
              </Button>
            )}

            <Button variant="contained" startIcon={<PointOfSaleIcon />} size="large">
              Zur Kasse
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default AddToCart

/*

            <Button variant="contained" startIcon={<ShoppingCartIcon />}>
              In den Warenkorb
            </Button>

{loading ? (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <p>
              {__("Generiere hier einen QR Einzahlungsschein, um Geld auf unser Vereinskonto zu überweisen", "fcplugin")} (IBAN: {account}, {blogname}, {storeAddress}, {storePostcode}, {storeCity}).
            </p>
          </Grid>
          <Grid item xs={12}>
            <input type="number" min="0" placeholder="Betrag in CHF" className="fc_topup_input" onChange={event => setAmount(event.target.value)} />
            <button type="submit" onClick={handleQR}>
              {__("Einzahlungsschein generieren", "fcplugin")}
            </button>
          </Grid>
          <Grid item xs={12}>
            <div id="qrSVG"></div>
          </Grid>
        </Grid>
      )}
      */
