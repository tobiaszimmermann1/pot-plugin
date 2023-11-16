import React, { useState } from "react"
import axios from "axios"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
const __ = wp.i18n.__

function AddMember({ id, setModalClose, handleAddMember }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    setSubmitting(true)

    if (firstName.trim() === "" || lastName.trim() === "" || email.trim() === "") {
      setError(__("Felder dürfen nicht leer sein.", "fcplugin"))
      setSubmitting(false)
    } else {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postAddUser`,
          {
            firstName: firstName,
            lastName: lastName,
            email: email
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response) {
            if (Array.isArray(response.data)) {
              handleAddMember({
                id: response.data[1],
                name: firstName + " " + lastName,
                email: email,
                balance: 0.0,
                role: "customer"
              })
              setModalClose(false)
            } else {
              if (response.data === "error_email") {
                setError(__("Benutzer erstellt. Fehler beim Versenden der Email Bestätigung.", "fcplugin"))
              } else {
                setError(__("Fehler beim Erstellen des Benutzers. Bitte verwende eine andere Email Adresse.", "fcplugin"))
              }
            }
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
              {__("Neues Mitglied einladen", "fcplugin")} {id}
            </DialogTitle>
            <DialogActions>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<PersonAddIcon />}>
                {__("Einladen", "fcplugin")}
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
            <TextField size="normal" id="firstName" label={__("Vorname", "fcplugin")} name="firstName" variant="outlined" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <TextField size="normal" id="lastName" label={__("Nachname", "fcplugin")} name="lastName" variant="outlined" value={lastName} onChange={e => setLastName(e.target.value)} />
            <TextField size="normal" id="email" label={__("Email", "fcplugin")} name="email" type="email" variant="outlined" value={email} onChange={e => setEmail(e.target.value)} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddMember
