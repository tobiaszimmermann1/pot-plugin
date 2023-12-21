import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import SendIcon from "@mui/icons-material/Send"
import { Editor } from "@tinymce/tinymce-react"
const __ = wp.i18n.__

function NotificationModal({ id, open, setModalClose }) {
  const [orders, setOrders] = useState()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")
  const [testEmail, setTestEmail] = useState("")
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

  const handleTestSubmit = () => {
    setSubmitting(true)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/emailNotificationBestellrundenTest`,
        {
          email: testEmail,
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

  const editorRef = useRef(null)

  function editorChange() {
    setMessage(editorRef.current.getContent())
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
            <Alert severity="warning">{__("Der Nachricht wird keine Anrede, Kopfzeile oder Fusszeile hinzugefügt!", "fcplugin")}</Alert>

            <Editor
              tinymceScriptSrc={`${appLocalizer.pluginUrl}/scripts/tinymce/js/tinymce/tinymce.min.js`}
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={"Nachricht"}
              init={{
                width: "100%",
                height: 400,
                menubar: false,
                plugins: ["advlist", "autolink", "lists", "link", "charmap", "preview", "anchor", "visualblocks", "wordcount"],
                toolbar: "undo redo | blocks | " + "bold italic | bullist numlist | ",
                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }"
              }}
              onEditorChange={editorChange}
            />

            <Stack spacing={3} direction={"column"}>
              <LoadingButton onClick={handleSubmit} variant="contained" color="primary" loading={submitting} loadingPosition="start" startIcon={<SendIcon />} size="large">
                {__("Nachricht senden", "fcplugin")}
              </LoadingButton>
              <Stack spacing={3} direction={"row"}>
                <TextField type="email" size="small" label={__("Email für Test", "fcplugin")} id="subject" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
                <LoadingButton onClick={handleTestSubmit} variant="contained" color="secondary" loading={submitting} loadingPosition="start" startIcon={<SendIcon />} size="large">
                  {__("Test senden", "fcplugin")}
                </LoadingButton>
              </Stack>
            </Stack>

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
