import React, { useState, useEffect } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import axios from "axios"
import { addUserEinkaufsliste } from "./components/products/products"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Alert, Box, LinearProgress, Switch, Tooltip } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import IconButton from "@mui/material/IconButton"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import PointOfSaleIcon from "@mui/icons-material/PointOfSale"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner"
import SaveIcon from "@mui/icons-material/Save"
import SelfCheckoutCart from "./components/selfCheckout/SelfCheckoutCart"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import { cartContext } from "./components/selfCheckout/cartContext"
import AddProductBySku from "./components/selfCheckout/AddProductBySku"
import LoadingButton from "@mui/lab/LoadingButton"
import QrScanner from "./components/selfCheckout/QrScanner"
import { SmartScaleProvider, STORAGE_KEY as SMARTSCALE_STORAGE_KEY } from "./contexts/SmartScaleContext.js"

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
    POSModeColor: {
      main: "#BEADED"
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
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [adding, setAdding] = useState(false)
  const [productError, setProductError] = useState(null)
  const [productErrorSeverity, setProductErrorSeverity] = useState("warning")
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(null)
  const [isPOSAdmin, setIsPOSAdmin] = useState(false)
  const [POSMode, setPOSMode] = useState(localStorage.getItem("fc_selfcheckout_posmode") === "1")

  useEffect(() => {
    localStorage.setItem("fc_selfcheckout_posmode", POSMode ? "1" : "0")
  }, [POSMode])
  const [margin, setMargin] = useState(0)
  const [selectedMember, setSelectedMember] = useState(JSON.parse(localStorage.getItem("fc_selfcheckout_member")))

  useEffect(() => {
    selectedMember ? localStorage.setItem("fc_selfcheckout_member", JSON.stringify(selectedMember)) : localStorage.removeItem("fc_selfcheckout_member")
  }, [selectedMember])
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState(null)
  const [saveEinkaufsliste, setSaveEinkaufsliste] = useState(false)
  const [confirming, setConfirming] = useState(false)

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

    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_margin`)
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setMargin(parseFloat(res))
        }
      })
      .catch(error => console.log(error))

    if (frontendLocalizer.currentUser.roles.includes("administrator") || frontendLocalizer.currentUser.roles.includes("foodcoop_manager")) {
      setIsPOSAdmin(true)
    }
  }, [])

  useEffect(() => {
    scanning && setProductError(null)
  }, [scanning])

  useEffect(() => {
    if (cart.length === 0) {
      let localStorageCart = localStorage.getItem("fc_selfcheckout_cart")
      if (localStorageCart) {
        setCart(JSON.parse(localStorageCart))
      }
    }
  }, [])

  useEffect(() => {
    if (productError !== null) {
      setTimeout(() => {
        setProductError(null)
        setProductErrorSeverity("warning")
      }, 5000)
    }
  }, [productError])

  async function checkout() {
    setSubmitting(true)

    if (cart.length > 0) {
      await addUserEinkaufsliste(cart)

      try {
        const response = await axios.post(
          `${frontendLocalizer.apiUrl}/foodcoop/v1/addToCart`,
          {
            data: JSON.stringify(cart),
            user: JSON.stringify(frontendLocalizer.currentUser)
          },
          { headers: { "X-WP-Nonce": frontendLocalizer.nonce } }
        )

        setSubmitting(false)
        localStorage.removeItem("fc_selfcheckout_cart")
        location.href = JSON.parse(response.data)
      } catch (error) {
        setSubmitting(false)
        console.error(error)
      }
    } else {
      setProductError("Warenkorb leer.")
      setSubmitting(false)
    }
  }

  function updateScanResult(text) {
    try {
      var data = JSON.parse(text)

      if (data.smartscale) {
        localStorage.setItem(SMARTSCALE_STORAGE_KEY, data.smartscale)
        //const scale = useSmartScale()
        //scale.pair(data.smartscale);

        setProductError("Mit Waage verbunden")
        setProductErrorSeverity("success")

        setShowCart(true)
        setScanning(false)
        return
      }
    } catch (e) {}

    setScanResult(text)

    setAdding(true)
    setScanning(false)
  }

  function posCheckout() {
    setSubmitting(true)

    if (cart.length > 0) {
      axios
        .post(
          `${frontendLocalizer.apiUrl}/foodcoop/v1/postCreatePOSorder`,
          {
            pos_user: frontendLocalizer.currentUser.data.ID,
            type: selectedMember ? "memberOrder" : "guestOrder",
            cart: JSON.stringify(cart),
            user: selectedMember ? JSON.stringify(selectedMember) : JSON.stringify(frontendLocalizer.currentUser.data),
            payment_gateway: JSON.stringify(selectedPaymentGateway)
          },
          {
            headers: {
              "X-WP-Nonce": frontendLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          setCart([])
          localStorage.removeItem("fc_selfcheckout_cart")
          // next customer must not inherit the previous member
          setSelectedMember(null)
        })
        .catch(error => console.log(error.message))
        .finally(response => {
          setSubmitting(false)
          setShowCart(false)
          setScanning(false)
          setAdding(true)
        })
    } else {
      setProductError("Warenkorb leer.")
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (POSMode) {
      setScanning(false)
      setAdding(true)
      setShowCart(false)
    }
  }, [POSMode])

  useEffect(() => {
    if (!showCart || confirming) return

    const onKeyDown = e => {
      if (e.target.closest?.("input, textarea, [contenteditable]")) return

      if (e.key === "n") {
        setShowCart(false)
        setScanning(false)
        setAdding(true)
      } else if (e.key === "a" && cart.length > 0 && !submitting) {
        POSMode ? setConfirming(true) : checkout()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showCart, confirming, cart, submitting, POSMode])

  function renderPOSConfirmation() {
    const total = cart.reduce((sum, item) => sum + item.price * item.amount, 0)
    const cartMargin = selectedMember ? 0 : total * (margin / 100)

    return (
      <Dialog open={confirming} fullWidth maxWidth="md" scroll="paper">
        <DialogTitle>{__("Einkauf bestätigen", "fcplugin")}</DialogTitle>
        <DialogContent dividers>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1.25rem" }}>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e3e3e3" }}>
                  <td style={{ padding: "8px 0" }}>{item.name}</td>
                  <td style={{ textAlign: "right" }}>
                    {item.amount} x {parseFloat(item.price).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", minWidth: "100px" }}>CHF {(item.price * item.amount).toFixed(2)}</td>
                </tr>
              ))}
              {cartMargin !== 0 && (
                <tr style={{ borderBottom: "1px solid #e3e3e3" }}>
                  <td colSpan={2} style={{ padding: "8px 0" }}>
                    + {margin}% {__("Marge für Nicht-Mitglieder", "fcplugin")}
                  </td>
                  <td style={{ textAlign: "right" }}>CHF {cartMargin.toFixed(2)}</td>
                </tr>
              )}
              <tr style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                <td colSpan={2} style={{ padding: "8px 0" }}>
                  {__("Total", "fcplugin")}
                </td>
                <td style={{ textAlign: "right" }}>CHF {(total + cartMargin).toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: "8px 0" }}>
                  {__("Mitglied", "fcplugin")}
                </td>
                <td style={{ textAlign: "right" }}>{selectedMember ? selectedMember.name : __("Gast", "fcplugin")}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: "8px 0" }}>
                  {__("Zahlungsart", "fcplugin")}
                </td>
                <td style={{ textAlign: "right" }}>{selectedMember ? selectedPaymentGateway ? selectedPaymentGateway.name : <span style={{ color: "red" }}>{__("Bitte Zahlungsart wählen", "fcplugin")}</span> : "Barzahlung"}</td>
              </tr>
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" size="large" color="error" onClick={() => setConfirming(false)}>
            {__("Abbrechen", "fcplugin")}
          </Button>
          <Button
            variant="contained"
            size="large"
            color="POSModeColor"
            disabled={!!(selectedMember && !selectedPaymentGateway)}
            onClick={() => {
              setConfirming(false)
              posCheckout()
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  let buttons = {
    pos: isPOSAdmin,
    scan: !POSMode && showCart,
    add: showCart,
    cart: !showCart,
    save: !POSMode && showCart && cart.length > 0,
    checkout: showCart && cart.length > 0
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <SmartScaleProvider>
          <cartContext.Provider value={{ cart, setCart }}>
            {active ? (
              <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
                <AppBar sx={{ position: "relative" }} color={POSMode ? "POSModeColor" : "primary"}>
                  <Toolbar sx={{ justifyContent: "space-between" }}>
                    <DialogTitle textAlign="left" sx={{ fontSize: "1rem" }}>
                      {blogname} - {!POSMode ? __("Self Checkout", "fcplugin") : __("Point of Sale", "fcplugin")}
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
                  <Alert sx={{ margin: 1 }} severity={productErrorSeverity}>
                    {productError}
                  </Alert>
                )}
                <DialogContent dividers={scroll === "paper"} sx={{ padding: 2, boxSizing: "content-box" }}>
                  {loading && (
                    <Box sx={{ width: "100%", marginBottom: "10px" }}>
                      <LinearProgress />
                    </Box>
                  )}
                  {scanning && !POSMode && <QrScanner updateScanResult={updateScanResult} />}
                  {adding && <AddProductBySku setShowCart={setShowCart} setAdding={setAdding} scanResult={scanResult} POSMode={POSMode} />}
                  {POSMode && renderPOSConfirmation()}
                  {showCart && <SelfCheckoutCart POSMode={POSMode} margin={margin} saveEinkaufsliste={saveEinkaufsliste} setSaveEinkaufsliste={setSaveEinkaufsliste} selectedMember={selectedMember} setSelectedMember={setSelectedMember} selectedPaymentGateway={selectedPaymentGateway} setSelectedPaymentGateway={setSelectedPaymentGateway} />}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: "#f0f0f0" }}>
                  {buttons.pos && (
                    <Box sx={{ marginRight: 2 }}>
                      <Switch checked={POSMode} onChange={event => setPOSMode(event.target.checked)} inputProps={{ "aria-label": "pos-mode" }} color={POSMode ? "POSModeColor" : "primary"} /> {__("POS Modus", "fcplugin")}
                    </Box>
                  )}
                  {buttons.scan && (
                    <Button
                      disabled={submitting}
                      variant="contained"
                      size="large"
                      color={POSMode ? "POSModeColor" : "primary"}
                      onClick={() => {
                        setShowCart(false)
                        setScanning(true)
                        setAdding(false)
                      }}
                    >
                      <QrCodeScannerIcon />
                    </Button>
                  )}
                  {buttons.add && (
                    <Tooltip title={__("Produkt hinzufügen", "fcplugin") + " (n)"}>
                      <Button
                        disabled={submitting}
                        variant="contained"
                        size="large"
                        color={POSMode ? "POSModeColor" : "primary"}
                        onClick={() => {
                          setShowCart(false)
                          setScanning(false)
                          setAdding(true)
                        }}
                      >
                        <AddShoppingCartIcon />
                      </Button>
                    </Tooltip>
                  )}
                  {buttons.cart && (
                    <Button
                      disabled={submitting}
                      variant="contained"
                      size="large"
                      color={POSMode ? "POSModeColor" : "primary"}
                      onClick={() => {
                        setShowCart(true)
                        setScanning(false)
                        setAdding(false)
                      }}
                    >
                      <ShoppingCartIcon />
                    </Button>
                  )}
                  {buttons.save && (
                    <Button
                      disabled={submitting}
                      variant="contained"
                      size="large"
                      color={POSMode ? "POSModeColor" : "primary"}
                      onClick={() => {
                        setSaveEinkaufsliste(true)
                      }}
                    >
                      <SaveIcon />
                    </Button>
                  )}
                  {buttons.checkout && (
                    <Tooltip title={(!POSMode ? __("Kasse", "fcplugin") : __("Einkauf abschliessen", "fcplugin")) + " (a)"}>
                      <LoadingButton
                        startIcon={<PointOfSaleIcon />}
                        variant="contained"
                        size="large"
                        color={POSMode ? "POSModeColor" : "primary"}
                        loading={submitting}
                        onClick={() => {
                          POSMode ? setConfirming(true) : checkout()
                        }}
                      >
                        {!POSMode ? "Kasse" : "Einkauf abschliessen"}
                      </LoadingButton>
                    </Tooltip>
                  )}
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
        </SmartScaleProvider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default SelfCheckout
