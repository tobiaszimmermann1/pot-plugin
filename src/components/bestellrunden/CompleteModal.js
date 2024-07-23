import React, { useState, useEffect } from "react"
import axios from "axios"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, TextField, Autocomplete, Alert } from "@mui/material"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import SaveIcon from "@mui/icons-material/Save"
import LoadingButton from "@mui/lab/LoadingButton"

const __ = wp.i18n.__

function CompleteModal({ id, setModalClose, setReload, reload }) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postCompleteBestellrunde`,
        {
          id: id
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        setReload(reload + 1)
      })
      .catch(error => console.log(error))
      .finally(() => {
        setSubmitting(false)
        setModalClose(false)
      })
  }

  return (
    <>
      <Dialog open={true} maxWidth="sm" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogContent
          dividers={scroll === "paper"}
          sx={{
            padding: "25px"
          }}
        >
          <h2>{__("Bestellrunde abschliessen?", "fcplugin")}</h2>
          <p> {__("Wenn du die Bestellrunde als abgeschlossen markierst, werden alle Bestellungen in dieser Bestellrunde mit dem Status Abgeschlossen versehen. Willst du fortfahren?", "fcplugin")}</p>
          <List dense={false}>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Alle Waren verteilt?" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Alle Mutationen erledigt?" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Alle Rechnungen bezahlt?" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button size="large" color="secondary" onClick={() => setModalClose(false)}>
            {__("Abbrechen", "fcplugin")}
          </Button>
          <LoadingButton onClick={handleSubmit} variant="text" color="primary" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
            {__("Bestellrunde Abschliessen", "fcplugin")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CompleteModal
