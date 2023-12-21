import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Skeleton from "@mui/material/Skeleton"
const __ = wp.i18n.__

function Permissions({ setModalClose, permissionsID, permissionsName }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState()
  const [role, setRole] = useState(null)
  const [initialRole, setInitialRole] = useState(null)
  const [permissions, setPermissions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getUser?id=${permissionsID}`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)
          setRole(res.role)
          setInitialRole(res.role)
          res.permissions.length > 0 ? setPermissions(JSON.parse(res.permissions)) : setPermissions([])
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  function handleSubmit() {
    setSubmitting(true)
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/setUserPermissions`,
        {
          role: role,
          permissions: permissions,
          id: permissionsID
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)
        }
      })
      .finally(() => {
        setSubmitting(false)
        setModalClose(true)
      })
      .catch(error => console.log(error))
  }

  function handleRoleChange(event, newRole) {
    setRole(newRole)
  }

  function handlePermissionsChange(event, newPermissions) {
    setPermissions(newPermissions)
  }

  useEffect(() => {
    role !== "foodcoop_manager" && setPermissions(null)
  }, [role])

  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Berechtigungen von", "fcplugin")} {permissionsName}
            </DialogTitle>
            <Stack direction={"row"} spacing={3}>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
                {__("Speichern", "fcplugin")}
              </LoadingButton>
              <IconButton edge="start" color="inherit" onClick={() => setModalClose(false)} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>
        <DialogContent
          dividers={scroll === "paper"}
          sx={{
            paddingTop: "20px",
            minHeight: "500px"
          }}
        >
          {loading ? (
            <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
              <h2 style={{ margin: "5px 0" }}>
                <strong>{__("Rolle", "fcplugin")}</strong>
              </h2>
              <p style={{ margin: "5px 0" }}>{__("Die Rolle definiert, ob ein Mitglied auf das Backend zugreifen kann oder nicht.", "fcplugin")}</p>
              <Skeleton variant="rectangular" width={200} height={40} />
              <h2 style={{ margin: "40px 0 5px 0" }}>
                <strong>{__("Berechtigungen", "fcplugin")}</strong>
              </h2>
              <p style={{ margin: "5px 0" }}>{__("Admins können eine, mehrere oder alle Berechtigungen des POT Plugins erhalten. Nur Admins mit der Mitgliederberechtigung können anderen Admins Berechtigungen erteilen.", "fcplugin")}</p>
              <Skeleton variant="rectangular" width={450} height={40} />
            </Stack>
          ) : (
            <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
              <h2 style={{ margin: "5px 0" }}>
                <strong>{__("Rolle", "fcplugin")}</strong>
              </h2>
              <p style={{ margin: "5px 0" }}>{__("Die Rolle definiert, ob ein Mitglied auf das Backend zugreifen kann oder nicht.", "fcplugin")}</p>
              <ToggleButtonGroup color="primary" value={role} exclusive onChange={handleRoleChange}>
                <ToggleButton value="foodcoop_manager"> {__("Foodcoop Manager", "fcplugin")} </ToggleButton>
                <ToggleButton value="customer"> {__("Kunde", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>

              {role === "foodcoop_manager" ? (
                <>
                  <h2 style={{ margin: "40px 0 5px 0" }}>
                    <strong>{__("Berechtigungen", "fcplugin")}</strong>
                  </h2>
                  <p style={{ margin: "5px 0" }}>{__("Admins können eine, mehrere oder alle Berechtigungen des POT Plugins erhalten. Nur Admins mit der Mitgliederberechtigung können anderen Admins Berechtigungen erteilen.", "fcplugin")}</p>
                  <ToggleButtonGroup color="primary" value={permissions} onChange={handlePermissionsChange}>
                    <ToggleButton value="bestellrunden"> {__("Bestellrunden", "fcplugin")} </ToggleButton>
                    <ToggleButton value="products"> {__("Produkte", "fcplugin")} </ToggleButton>
                    <ToggleButton value="members"> {__("Mitglieder", "fcplugin")} </ToggleButton>
                    <ToggleButton value="bookkeeping"> {__("Buchhaltung", "fcplugin")} </ToggleButton>
                    <ToggleButton value="settings"> {__("Einstellungen", "fcplugin")} </ToggleButton>
                  </ToggleButtonGroup>
                </>
              ) : (
                <>
                  <h2 style={{ margin: "40px 0 5px 0" }}>
                    <strong>{__("Berechtigungen", "fcplugin")}</strong>
                  </h2>
                  <p style={{ margin: "5px 0" }}>{__("Admins können eine, mehrere oder alle Berechtigungen des POT Plugins erhalten. Nur Admins mit der Mitgliederberechtigung können anderen Admins Berechtigungen erteilen.", "fcplugin")}</p>
                  <ToggleButtonGroup color="primary" value={permissions} onChange={handlePermissionsChange} disabled>
                    <ToggleButton value="bestellrunden"> {__("Bestellrunden", "fcplugin")} </ToggleButton>
                    <ToggleButton value="products"> {__("Produkte", "fcplugin")} </ToggleButton>
                    <ToggleButton value="members"> {__("Mitglieder", "fcplugin")} </ToggleButton>
                    <ToggleButton value="bookkeeping"> {__("Buchhaltung", "fcplugin")} </ToggleButton>
                    <ToggleButton value="settings"> {__("Einstellungen", "fcplugin")} </ToggleButton>
                  </ToggleButtonGroup>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Permissions
