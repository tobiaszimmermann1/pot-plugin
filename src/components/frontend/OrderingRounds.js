import React, { useState, useEffect, useRef, useMemo, createContext } from "react"
import axios from "axios"
import { Box, Stack, Typography, Button, CircularProgress, Alert, Divider, Chip } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import CardActions from "@mui/material/CardActions"
import { format } from "date-fns"
import CelebrationIcon from "@mui/icons-material/Celebration"
import BedtimeIcon from "@mui/icons-material/Bedtime"
import ProductCategory from "./ProductCategory"
import { ShoppingContext, TriggerContext } from "./ShoppingContext"
import OrderOverview from "./OrderOverview"
import OrderList from "./OrderList"
const __ = wp.i18n.__

const OrderingRounds = () => {
  const [bestellrunden, setBestellrunden] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeOrderRound, setActiveOrderRound] = useState(null)
  const [activeOrderRoundData, setActiveOrderRoundData] = useState(null)
  const [previouslyOrdered, setPreviouslyOrdered] = useState(null)
  const [activeOrders, setActiveOrders] = useState(null)

  useEffect(() => {
    axios
      .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getActiveBestellrunden`, {
        user: frontendLocalizer.currentUser.ID
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log("orders:", res)
          setBestellrunden(res[0])
          setActiveOrders(res[1])
        }
      })
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    if (bestellrunden) {
      axios
        .get(`${frontendLocalizer.apiUrl}/wc/store/v1/cart`)
        .then(function (response) {
          if (response) {
            let items = response.data.items

            // if cart exists and contains items, figure out which bestellrunde they belong to
            let bestellrunden = []
            items.map(item => {
              item.item_data.map(meta => {
                if (meta.key === "bestellrunde") {
                  if (!bestellrunden.includes(meta.value)) {
                    bestellrunden.push(meta.value)
                  }
                }
              })
            })

            // if bestellrunden > 1: something is wrong with cart contents => empty cart
            if (bestellrunden.length > 1) {
              axios
                .get(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items`)
                .then(function (response) {
                  axios
                    .delete(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items/`, {
                      headers: {
                        "X-WC-Store-API-Nonce": response.headers["x-wc-store-api-nonce"]
                      }
                    })
                    .then(setPreviouslyOrdered(null))
                    .catch(error => console.log(error))
                })
                .catch(error => console.log(error))
            }

            // if bestellrunden === 1: deactivate all other bestellrunden, give option to clear cart
            if (bestellrunden.length === 1) {
              setPreviouslyOrdered(parseInt(bestellrunden[0]))
            }

            // if bestellrunden === null: cart is empty
            if (bestellrunden.length === 0) {
              setPreviouslyOrdered(null)
            }

            setLoading(false)
          }
        })
        .catch(error => console.log(error))
    }
  }, [bestellrunden])

  return bestellrunden && !loading ? (
    <>
      {!activeOrderRound && (
        <>
          <Box>
            <Grid item xs={12}>
              <Card sx={{ minWidth: 275, boxShadow: "none" }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "right" }}>
                    <CelebrationIcon /> {__("Hurrah! Es gibt aktive Bestellrunden!", "fcplugin")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Box>
          <Alert sx={{ marginBottom: 2 }} severity="info">
            {__("Hier siehst du alle aktiven Sammelbestellungen. Du kannst gleichzeitig in jeder Sammelbestellung mitmachen. Bitte beachte jeweils das Bestellfenster und das Datum der Abholung.", "fcplugin")}
          </Alert>
          {previouslyOrdered && (
            <Alert sx={{ marginBottom: 2 }} severity="warning">
              {__("Deine Bestellung in der Sammelbestellung", "fcplugin")} <strong>{previouslyOrdered}</strong> {__("ist noch nicht abgeschlossen. Schliesse die Bestellung ab, um in anderen Sammelbestellungen teilzunehmen.", "fcplugin")} {__("Oder", "fcplugin")}:{" "}
              <a
                href="#"
                style={{ fontWeight: "bold", color: "#1C7070" }}
                onClick={() => {
                  if (bestellrunden.length > 1) {
                    axios
                      .get(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items`)
                      .then(function (response) {
                        axios
                          .delete(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items/`, {
                            headers: {
                              "X-WC-Store-API-Nonce": response.headers["x-wc-store-api-nonce"]
                            }
                          })
                          .then(setPreviouslyOrdered(null))
                          .catch(error => console.log(error))
                      })
                      .catch(error => console.log(error))
                  }
                }}
              >
                {__("Warenkorb leeren", "fcplugin")}
              </a>
              .
            </Alert>
          )}
        </>
      )}

      {activeOrderRound ? (
        <OrderList activeBestellrunde={activeOrderRound} activeOrderRoundData={activeOrderRoundData} setActiveOrderRound={setActiveOrderRound} setActiveOrderRoundData={setActiveOrderRoundData} />
      ) : (
        <Box sx={{ marginBottom: 2 }}>
          <Grid container spacing={2}>
            {bestellrunden.map(bestellrunde => (
              <Grid item xs={12} md={4} lg={3} key={bestellrunde.id}>
                <Card sx={{ maxWidth: 500 }} variant="outlined">
                  <CardMedia sx={{ height: 140, textAlign: "right", padding: 1 }} image={bestellrunde.img ? bestellrunde.img : frontendLocalizer.pluginUrl + "/images/bestellrunde.png"} title={bestellrunde.name}>
                    {previouslyOrdered === bestellrunde.id ? <Chip label="Du hast Produkte im Warenkorb" size="small" color="primary" /> : activeOrders.includes(bestellrunde.id) ? <Chip label="Du hast mitbestellt" size="small" color="primary" /> : <Chip label="Du hast noch nicht bestellt" size="small" color="secondary" />}
                  </CardMedia>
                  <CardContent>
                    <Typography gutterBottom variant="h5" sx={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{bestellrunde.name}</strong> <Chip label={`ID: ${bestellrunde.id}`} size="small" />
                    </Typography>
                    <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                      {__("Bestellen vom", "fcplugin")} <strong>{format(new Date(bestellrunde.start), "dd.MM.yyyy")}</strong> {__("bis", "fcplugin")} <strong>{format(new Date(bestellrunde.end), "dd.MM.yyyy")}</strong>
                    </Typography>
                    <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: "normal" }}>
                      {__("Abholen am", "fcplugin")} <strong>{format(new Date(bestellrunde.dist), "dd.MM.yyyy")}</strong>
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ margin: 1 }}>
                    {previouslyOrdered !== null ? (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                          setActiveOrderRound(bestellrunde.id)
                          setActiveOrderRoundData([bestellrunde.name, bestellrunde.id, bestellrunde.img])
                        }}
                        disabled={previouslyOrdered !== bestellrunde.id}
                      >
                        {activeOrders.includes(bestellrunde.id) ? __("Bestellung anpassen", "fcplugin") : __("Bestellen", "fcplugin")}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                          setActiveOrderRound(bestellrunde.id)
                          setActiveOrderRoundData([bestellrunde.name, bestellrunde.id, bestellrunde.img])
                        }}
                      >
                        {activeOrders.includes(bestellrunde.id) ? __("Bestellung anpassen", "fcplugin") : __("Bestellen", "fcplugin")}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </>
  ) : loading ? (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
      <CircularProgress />
    </div>
  ) : (
    <Box sx={{}}>
      <Grid item xs={12}>
        <Card sx={{ minWidth: 275, boxShadow: "none" }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "right" }}>
              <BedtimeIcon /> {__("Aktuell gibt es keine aktiven Bestellrunden.", "fcplugin")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Box>
  )
}

export default OrderingRounds
