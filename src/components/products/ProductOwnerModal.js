import React, { useState, useEffect } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import { Box, Card, LinearProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Stack, TextField, Autocomplete, Alert, FormControl, Select, MenuItem, InputLabel } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
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

function ProductOwnerModal({ product, setModalClose, reload, setReload }) {
  const [productOwner, setProductOwner] = useState()
  const [users, setUsers] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [loadedProductOwner, setLoadedProductOwner] = useState(null)
  const [ownerLoading, setOwnerLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (product && users) {
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getProductOwner?product_id=${product.id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response) {
            users.map(user => {
              if (user.id === parseInt(JSON.parse(response.data))) {
                setLoadedProductOwner(user)
                console.log("selectedMember", user)
                setOwnerLoading(false)
                setError(null)
              } else {
                setError(__("Keine Produktbetreuung definiert", "fcplugin"))
                setOwnerLoading(false)
              }
            })
          }
        })
        .catch(error => console.log(error))
    }
  }, [product, users])

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getUsers`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setUsers(res)
        }
      })
      .catch(error => console.log(error))
  }, [])

  const handleSubmit = () => {
    setSubmitting(true)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postSaveProductOwner`,
        {
          user_id: selectedMember.id,
          product_id: product.id
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response) {
          console.log(response.data)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        setReload(reload => reload + 1)
        setSubmitting(false)
        setModalClose(false)
      })
  }

  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Produktbetreuung für", "fcplugin")} {product.name}
            </DialogTitle>
            <DialogActions>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setModalClose(false)
                  setOwnerLoading(true)
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
            <div style={{ marginBottom: "20px" }}>{__("Lege hier fest, welches Mitglied dieses Produkt in seinem Konto verwalten darf. Mitglieder können Produktdaten verändern, den Lagerbestand anpassen und Lieferungen erstellen.", "fcplugin")}</div>

            {!ownerLoading ? (
              <>
                {loadedProductOwner ? (
                  <Alert sx={{ marginBottom: 1 }} severity="info">
                    <strong>{loadedProductOwner.name}</strong> {__("betreut dieses Produkt.", "fcplugin")}
                  </Alert>
                ) : (
                  error && (
                    <Alert sx={{ marginBottom: 1 }} severity="warning">
                      {error}
                    </Alert>
                  )
                )}

                <h2 style={{ marginTop: "20px", marginBottom: "20px" }}>{__("Produktbetreuung wählen", "fcplugin")}</h2>

                <Stack gap={2} direction={"column"}>
                  {users && (
                    <FormControl fullWidth>
                      <InputLabel id="fc-user">Mitglied wählen</InputLabel>
                      <Select labelId="fc-user" id="fc-user-select" value={selectedMember} label="Mitglied wählen" onChange={e => setSelectedMember(e.target.value)}>
                        {users.map(user => (
                          <MenuItem key={user.id} value={user}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Stack>

                {selectedMember && (
                  <Stack gap={2} direction={"row"} alignItems="center" sx={{ marginTop: "20px", padding: "10px", borderRadius: "5px", backgroundColor: "#f0f0f0" }}>
                    <span>
                      <strong>{selectedMember.name}</strong> {__("als Produktebetreuung speichern?", "fcplugin")}
                    </span>
                    <LoadingButton onClick={handleSubmit} variant="contained" color="primary" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
                      {__("Speichern", "fcplugin")}
                    </LoadingButton>
                  </Stack>
                )}
              </>
            ) : (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            )}
          </>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductOwnerModal
