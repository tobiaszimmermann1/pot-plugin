import React, { useState, useEffect } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import Grid from "@mui/material/Grid"
import axios from "axios"
import { CircularProgress, Divider } from "@mui/material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import List from "@mui/material/List"
import SelfCheckoutCartItem from "./SelfCheckoutCartItem"
const __ = wp.i18n.__

const SelfCheckoutCart = props => {
  useEffect(() => {}, [])

  return (
    <>
      <List dense={true}>
        <SelfCheckoutCartItem />
        <SelfCheckoutCartItem />
        <SelfCheckoutCartItem />
        <SelfCheckoutCartItem />
        <SelfCheckoutCartItem />
        <SelfCheckoutCartItem />
        <SelfCheckoutCartItem />
      </List>
    </>
  )
}

export default SelfCheckoutCart
