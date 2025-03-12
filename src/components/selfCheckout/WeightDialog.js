import React, { useState, useEffect, useMemo, useRef } from "react"
import { Stack, Button, TextField, Dialog, DialogContent, DialogTitle } from "@mui/material"
import Toolbar from "@mui/material/Toolbar"
import { Alert } from "@mui/material"
const __ = wp.i18n.__

function WeightDialog({ setModalClose, prod, setUserWeightValue, setIsEnteringWeight, amount }) {
  const [weight, setWeight] = useState(amount || "")
  const [error, setError] = useState(false)

  function handleInputChange(e) {
    const value = e.target.value

    // Allow empty input (to let users clear the field)
    if (value === "") {
      setWeight("")
      setError(false)
      return
    }

    // Validate the input (only numbers, max two decimals, greater than zero)
    const regex = /^(?!0\d)\d*(\.\d{0,2})?$/
    if (regex.test(value) && parseFloat(value) > 0) {
      setWeight(value)
      setError(false)
    } else {
      setError(true)
    }
  }

  function handleSubmit() {
    if (weight !== "" && parseFloat(weight) > 0) {
      setUserWeightValue(parseFloat(weight))
      setModalClose(false)
      setIsEnteringWeight(false)
    }
  }

  return (
    <>
      <Dialog open={true} scroll="paper" disableEnforceFocus sx={{ zIndex: 1301 }} fullWidth maxWidth="md">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <DialogTitle textAlign="left" sx={{ paddingLeft: 0, paddingRight: 0 }}>
            {__("Wägen", "fcplugin")}: {prod.name}
          </DialogTitle>
        </Toolbar>
        <DialogContent dividers={scroll === "paper"} sx={{ paddingTop: 0 }}>
          <Stack spacing={3} sx={{ width: "100%" }}>
            <Alert sx={{ marginBottom: 1 }} severity="info">
              {__("Bitte gib das Gewicht in KG ein.", "fcplugin")}
            </Alert>
            <TextField autoFocus id="userWeight" name="userWeight" variant="outlined" value={weight} onChange={handleInputChange} error={error} sx={{ width: "100%" }} helperText={error ? __("Ungültiges Format: Nur Zahlen mit max. zwei Dezimalstellen erlaubt.", "fcplugin") : ""} />
            <Button onClick={handleSubmit} variant="contained" size="large" color="primary">
              {__("Zum Warenkorb hinzufügen", "fcplugin")}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WeightDialog
