import React, { useState, useEffect } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import Grid from "@mui/material/Grid"
import axios from "axios"
import { CircularProgress, Divider } from "@mui/material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import ListItem from "@mui/material/ListItem"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import Chip from "@mui/material/Chip"
const __ = wp.i18n.__

const SelfCheckoutCartItem = props => {
  useEffect(() => {}, [])

  return (
    <>
      <ListItem>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={2}>
            <Stack>
              <IconButton size="small">
                <AddIcon />
              </IconButton>
              <Chip label="3" sx={{ fontWeight: "bold" }} />
              <IconButton size="small">
                <RemoveIcon />
              </IconButton>
            </Stack>
          </Grid>
          <Grid item xs={8} sx={{ fontWeight: "bold", fontSize: "1em" }}>
            Produktname mit vielen Zeichen
          </Grid>
          <Grid item xs={2} sx={{ fontWeight: "bold" }}>
            3.80
          </Grid>
        </Grid>
      </ListItem>
      <Divider />
    </>
  )
}

export default SelfCheckoutCartItem
