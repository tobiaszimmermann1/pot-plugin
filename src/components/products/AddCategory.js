import React, { useState } from "react"
import axios from "axios"
import CategoryIcon from "@mui/icons-material/Category"
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
const __ = wp.i18n.__

function AddCategory({ setModalClose, handleAddCategory }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState()
  const [name, setName] = useState("")

  const handleSubmit = () => {
    setSubmitting(true)

    if (name.trim() === "") {
      setError(__("Felder dürfen nicht leer sein.", "fcplugin"))
      setSubmitting(false)
    } else {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postAddCategory`,
          {
            name: name
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response) {
            handleAddCategory({
              term_id: JSON.parse(response.data),
              name: name,
              count: 0,
              image: null
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
            <DialogTitle textAlign="left">{__("Kategorie hinzufügen", "fcplugin")}</DialogTitle>
            <DialogActions>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<CategoryIcon />}>
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
            <TextField size="normal" id="name" label={__("Vorname", "fcplugin")} name="name" variant="outlined" value={name} onChange={e => setName(e.target.value)} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddCategory
