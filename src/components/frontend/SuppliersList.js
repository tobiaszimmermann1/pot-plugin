import React, { useState, useEffect } from "react"
import axios from "axios"
import { Box, Typography, Button, CircularProgress, Alert, Chip } from "@mui/material"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import CardActions from "@mui/material/CardActions"
import ButtonGroup from "@mui/material/ButtonGroup"
import { createTheme, ThemeProvider } from "@mui/material/styles"
const __ = wp.i18n.__

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00796b"
    },
    secondary: {
      main: "#CFD8DC"
    },
    background: {
      default: "#fbfbfb",
      paper: "#ffffff"
    },
    success: {
      main: "#00c853"
    }
  }
})

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState(null)
  const [activeSupplier, setActiveSupplier] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getSuppliers`, {
        user: frontendLocalizer.currentUser.ID
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)
          setSuppliers(res)
        }
      })
      .finally(() => setLoading(false))
      .catch(error => console.log(error))
  }, [])

  return loading ? (
    "loading..."
  ) : (
    <ThemeProvider theme={theme}>
      {activeSupplier ? (
        <Box sx={{ marginBottom: 2 }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setActiveProducer(null)
              }}
            >
              {__("zurück", "fcplugin")}
            </Button>
          </div>
          <Card variant="outlined">
            <CardMedia sx={{ height: 250, textAlign: "right", padding: "25px", objectFit: "contain", backgroundColor: "#f8f8f8" }} component={"img"} image={activeSupplier.image ? activeSupplier.image : frontendLocalizer.pluginUrl + "/images/bestellrunde.png"} title={activeSupplier.name} />
            <CardContent>
              <Box sx={{ padding: "15px 25px 0 25px" }}>
                <Typography gutterBottom variant="h3" sx={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{activeSupplier.name}</strong>
                </Typography>
                <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                  <strong>{activeSupplier.short_description}</strong>
                </Typography>
                <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                  {__("Adresse", "fcplugin")}: {activeSupplier.address}
                </Typography>
                <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                  {__("Webseite", "fcplugin")}: {activeSupplier.website}
                </Typography>
              </Box>
              <p style={{ borderTop: "1px solid #e3e3e3", padding: "25px", marginTop: "50px" }} dangerouslySetInnerHTML={{ __html: activeSupplier.description }} />
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box sx={{ marginBottom: 2 }}>
          <Grid container spacing={2}>
            {suppliers.map(supplier => (
              <Grid item xs={12} md={4} lg={3} key={supplier.id}>
                <Card sx={{ maxWidth: 500 }} variant="outlined">
                  <CardMedia sx={{ height: 140, textAlign: "right", padding: 1, objectFit: "contain", backgroundColor: "#f8f8f8" }} component={"img"} image={supplier.image ? supplier.image : frontendLocalizer.pluginUrl + "/images/bestellrunde.png"} title={supplier.name} />
                  <CardContent>
                    <Typography gutterBottom variant="h5" sx={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{supplier.name}</strong>
                    </Typography>
                    <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                      <strong>{supplier.short_description}</strong>
                    </Typography>

                    {/*<p dangerouslySetInnerHTML={{ __html: supplier.description }} />*/}
                  </CardContent>
                  <CardActions sx={{ margin: 1 }}>
                    <ButtonGroup variant="outlined" aria-label="text button group">
                      <Button
                        onClick={() => {
                          setActiveSupplier(supplier)
                        }}
                      >
                        {__("Mehr Infos", "fcplugin")}
                      </Button>
                      <Button
                        onClick={() => {
                          supplier.website.slice(0, 4) === "http" ? window.open(supplier.website, "_blank").focus() : window.open(`https://${supplier.website}`, "_blank").focus()
                        }}
                      >
                        {__("Website", "fcplugin")}
                      </Button>
                    </ButtonGroup>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </ThemeProvider>
  )
}

export default SuppliersList
