import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
const __ = wp.i18n.__

function AddMember({ id, setModalClose, handleAddMember }) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [billing_address_1, setBilling_address_1] = useState("")
  const [billing_postcode, setBilling_postcode] = useState("")
  const [billing_city, setBillingCity] = useState("")

  const handleSubmit = () => {
    setSubmitting(true)

    if (firstName.trim() === "" || lastName.trim() === "" || email.trim() === "" || billing_address_1.trim() === "" || billing_postcode.trim() === "" || billing_city.trim() === "") {
      setError(__("Felder dürfen nicht leer sein.", "fcplugin"))
      setSubmitting(false)
    } else {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postAddUser`,
          {
            firstName: firstName,
            lastName: lastName,
            email: email,
            billing_address_1: billing_address_1,
            billing_postcode: billing_postcode,
            billing_city: billing_city
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
            handleAddMember({
              id: response.data[1],
              name: firstName + " " + lastName,
              email: email,
              address: billing_address_1 + ", " + billing_postcode + " " + billing_city,
              balance: 0.0,
              role: "customer"
            })
            setModalClose(false)
          }
        })
        .catch(error => setError(error.message))
        .finally(() => {
          setSubmitting(false)
        })
    }
  }

  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Neues Mitglied hinzufügen", "fcplugin")} {id}
            </DialogTitle>
            <DialogActions>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
                {__("Hinzufügen", "fcplugin")}
              </LoadingButton>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setModalClose(false)
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
          <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
            <TextField size="small" id="firstName" label={__("Vorname", "fcplugin")} name="firstName" variant="outlined" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <TextField size="small" id="lastName" label={__("Nachname", "fcplugin")} name="lastName" variant="outlined" value={lastName} onChange={e => setLastName(e.target.value)} />
            <TextField size="small" id="email" label={__("Email", "fcplugin")} name="email" type="email" variant="outlined" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField size="small" id="billing_address_1" label={__("Strasse", "fcplugin")} name="billing_address_1" variant="outlined" value={billing_address_1} onChange={e => setBilling_address_1(e.target.value)} />
            <TextField size="small" id="billing_postcode" label={__("Postleitzahl", "fcplugin")} name="billing_postcode" variant="outlined" value={billing_postcode} onChange={e => setBilling_postcode(e.target.value)} />
            <TextField size="small" id="billing_city" label={__("Ort", "fcplugin")} name="billing_city" variant="outlined" value={billing_city} onChange={e => setBillingCity(e.target.value)} />

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddMember
