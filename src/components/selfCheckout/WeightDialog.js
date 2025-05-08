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

    // Validate the input (only numbers, max three decimals, greater than zero)
    const regex = /^\d*(\.\d{0,3})?$/
    if (regex.test(value)) {
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

  function handleBlur() {
    if (weight !== "" && !isNaN(weight)) {
      setWeight(parseFloat(weight).toFixed(3))
    }
  }

  useEffect(() => {
    handleBlur()
  }, [])

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
              {__("Bitte gib das Gewicht in kg ein.", "fcplugin")}
            </Alert>
            <TextField
              autoFocus
              id="userWeight"
              name="userWeight"
              type="number"
              inputProps={{
                step: "0.001",
                min: "0"
              }}
              variant="outlined"
              value={weight}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={error}
              sx={{ width: "100%" }}
              helperText={error ? __("Ungültiges Format: Nur Zahlen mit max. drei Dezimalstellen erlaubt.", "fcplugin") : __("Gewicht in kg, z.B. 0.250", "fcplugin")}
            />
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
