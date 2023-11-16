import React, { useState, useEffect } from "react"
import axios from "axios"
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import SendIcon from "@mui/icons-material/Send"
const __ = wp.i18n.__

function NotificationModal({ id, open, setModalClose }) {
  const [orders, setOrders] = useState()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")
  const [number, setNumber] = useState(0)

  useEffect(() => {
    if (id) {
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getBestellungen?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          setOrders(JSON.parse(response.data))
        })
        .catch(error => console.log(error))
    }
  }, [id])

  const handleSubmit = () => {
    setSubmitting(true)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/emailNotificationBestellrunden`,
        {
          orders: JSON.stringify(orders),
          message: message,
          subject: subject
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response) {
          setNumber(response.data)
          setSuccess(true)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <>
      <Dialog fullScreen open={open} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Nachricht senden für Bestellrunde", "fcplugin")} {id}
            </DialogTitle>
            <DialogActions>
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
          <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
            <TextField fullWidth label={__("Betreff", "fcplugin")} id="subject" value={subject} onChange={e => setSubject(e.target.value)} />
            <TextField fullWidth label={__("Nachricht", "fcplugin")} id="message" multiline rows={10} value={message} onChange={e => setMessage(e.target.value)} />
            <LoadingButton onClick={handleSubmit} variant="contained" color="primary" loading={submitting} loadingPosition="start" startIcon={<SendIcon />} size="large">
              {__("Nachricht senden", "fcplugin")}
            </LoadingButton>

            {success && (
              <Alert severity="success">
                {__("Nachricht wurde an", "fcplugin")} {number} {__("Mitglieder versendet.", "fcplugin")}
              </Alert>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NotificationModal
