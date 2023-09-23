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
const __ = wp.i18n.__

function AddToCart() {
  const [loading, setLoading] = useState(true)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">{__("Self Checkout", "fcplugin")}</DialogTitle>
            <IconButton edge="start" color="inherit" aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent dividers={scroll === "paper"}>testdfg</DialogContent>
        <DialogActions>
          <Button autoFocus variant="contained" startIcon={<ShoppingCartIcon />}>
            In den Warenkorb
          </Button>
          <Button autoFocus variant="contained" startIcon={<PointOfSaleIcon />}>
            Zur Kasse
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default AddToCart

/*
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
