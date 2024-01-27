import React, { useState, useEffect } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import { Box, Card, LinearProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Stack, TextField, Autocomplete, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Checkbox from "@mui/material/Checkbox"
import Divider from "@mui/material/Divider"
import PageviewIcon from "@mui/icons-material/Pageview"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
const __ = wp.i18n.__

function MyProductsDeliveryModal({ product, setModalClose, reload, setReload }) {
  const [submitting, setSubmitting] = useState(false)
  const [deliveredAmount, setDeliveredAmount] = useState(1)

  const handleSubmit = () => {
    //setSubmitting(true)

    axios
      .post(
        `${frontendLocalizer.apiUrl}/foodcoop/v1/postSaveDeliveryByOwner`,
        {
          product_id: product.id,
          user_id: frontendLocalizer.currentUser.ID,
          amount: deliveredAmount
        },
        {
          headers: {
            "X-WP-Nonce": frontendLocalizer.nonce
          }
        }
      )
      .then(function (response) {})
      .catch(error => console.log(error))
      .finally(() => {
        setReload(reload + 1)
        setSubmitting(false)
        setModalClose(false)
      })
  }

  return (
    <>
      <Dialog open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", padding: 0, margin: 0 }}>
          <Toolbar sx={{ justifyContent: "space-between" }} disableGutters>
            <DialogTitle textAlign="left">
              {__("Neue Lieferung", "fcplugin")}: {product.name}
            </DialogTitle>
            <DialogActions>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setModalClose(false)
                  setProductsLoading(true)
                }}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogActions>
          </Toolbar>
        </AppBar>
        <DialogContent
          dividers={scroll === "paper"}
          sx={{
            paddingTop: "20px",
            minHeight: "500px"
          }}
        >
          <>
            <Stack spacing={1} sx={{ width: "100%", paddingTop: "10px" }}>
              <Box sx={{ padding: "10px", borderRadius: "5px", backgroundColor: "#f0f0f0" }}>
                <div style={{ display: "block" }}>
                  {__("Produkt", "fcplugin")}: {product.name}
                </div>
                <div style={{ display: "block" }}>
                  {__("Einheit", "fcplugin")}: {product.unit}
                </div>
                <div style={{ display: "block" }}>
                  {__("Preis", "fcplugin")}: {parseFloat(product.price).toFixed(2)}
                </div>
                <div style={{ display: "block" }}>
                  {__("Aktueller Lagerbestand", "fcplugin")}: {product.stock}
                </div>
              </Box>
              <div style={{ display: "block", marginTop: "25px" }}>
                <strong>{__("Bitte gib die Anzahl Einheiten an, die du anlieferst", "fcplugin")}</strong>
              </div>
              <div style={{ display: "block", marginTop: "25px" }}>
                <FormControl fullWidth>
                  <TextField
                    id="amount"
                    value={deliveredAmount}
                    onChange={e => setDeliveredAmount(e.target.value)}
                    variant="outlined"
                    type="number"
                    inputProps={{
                      min: "0",
                      step: "1"
                    }}
                    label={__("Anzahl Einheiten", "fcplugin")}
                  />
                </FormControl>
              </div>
            </Stack>
            <Alert style={{ marginTop: "25px" }} severity="info">
              <strong>
                {__("Guthaben für dich", "fcplugin")}: {parseFloat(product.price * deliveredAmount).toFixed(2)}
              </strong>
            </Alert>
            <LoadingButton color="primary" startIcon={<AddIcon />} variant="contained" size="large" sx={{ marginTop: "15px" }} fullWidth loading={submitting} onClick={handleSubmit}>
              {__("Lieferung erstellen", "fcplugin")}
            </LoadingButton>
            <Button
              color="secondary"
              startIcon={<CloseIcon />}
              variant="contained"
              size="large"
              sx={{ marginTop: "15px" }}
              fullWidth
              onClick={() => {
                setModalClose(false)
                setProductsLoading(true)
              }}
              disabled={submitting}
            >
              {__("Abbrechen", "fcplugin")}
            </Button>
          </>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MyProductsDeliveryModal
