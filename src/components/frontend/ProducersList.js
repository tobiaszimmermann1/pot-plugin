import React, { useState, useEffect } from "react"
import axios from "axios"
import { Box, Typography, Button, CircularProgress, Alert, Chip } from "@mui/material"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import CardActions from "@mui/material/CardActions"
import ButtonGroup from "@mui/material/ButtonGroup"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
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

const ProducersList = () => {
  const [producers, setProducers] = useState(null)
  const [activeProducer, setActiveProducer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProducers`, {
        user: frontendLocalizer.currentUser.ID
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)
          setProducers(res)
        }
      })
      .finally(() => setLoading(false))
      .catch(error => console.log(error))
  }, [])

  return loading ? (
    "loading..."
  ) : (
    <ThemeProvider theme={theme}>
      {activeProducer ? (
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
            <CardMedia sx={{ height: 250, textAlign: "right", padding: "25px", objectFit: "contain", backgroundColor: "#f8f8f8" }} component={"img"} image={activeProducer.image ? activeProducer.image : frontendLocalizer.pluginUrl + "/images/bestellrunde.png"} title={activeProducer.name} />
            <CardContent>
              <Box sx={{ padding: "15px 25px 0 25px" }}>
                <Typography gutterBottom variant="h3" sx={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{activeProducer.name}</strong>
                </Typography>
                <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                  <strong>{activeProducer.short_description}</strong>
                </Typography>
                <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                  {__("Herkunft", "fcplugin")}: {activeProducer.origin}
                </Typography>
                <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                  {__("Webseite", "fcplugin")}: {activeProducer.website}
                </Typography>
              </Box>
              <p style={{ borderTop: "1px solid #e3e3e3", padding: "25px", marginTop: "50px" }} dangerouslySetInnerHTML={{ __html: activeProducer.description }} />
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box sx={{ marginBottom: 2 }}>
          <Grid container spacing={2}>
            {producers.map(producer => (
              <Grid item xs={12} md={4} lg={3} key={producer.id}>
                <Card sx={{ maxWidth: 500 }} variant="outlined">
                  <CardMedia sx={{ height: 140, textAlign: "right", padding: 1, objectFit: "contain", backgroundColor: "#f8f8f8" }} component={"img"} image={producer.image ? producer.image : frontendLocalizer.pluginUrl + "/images/bestellrunde.png"} title={producer.name} />
                  <CardContent>
                    <Typography gutterBottom variant="h5" sx={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{producer.name}</strong>
                    </Typography>
                    <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                      <strong>{producer.short_description}</strong>
                    </Typography>

                    {/*<p dangerouslySetInnerHTML={{ __html: producer.description }} />*/}
                  </CardContent>
                  <CardActions sx={{ margin: 1 }}>
                    <ButtonGroup variant="outlined" aria-label="text button group">
                      <Button
                        onClick={() => {
                          setActiveProducer(producer)
                        }}
                      >
                        {__("Mehr Infos", "fcplugin")}
                      </Button>
                      <Button
                        onClick={() => {
                          producer.website.slice(0, 4) === "http" ? window.open(producer.website, "_blank").focus() : window.open(`https://${producer.website}`, "_blank").focus()
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

export default ProducersList
