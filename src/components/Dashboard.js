import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import { Box, Button, Typography } from "@mui/material"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import AnimatedNumber from "animated-number-react"
const __ = wp.i18n.__

const Dashboard = () => {
  const [bestellrunden, setBestellrunden] = useState()
  const [products, setProducts] = useState()
  const [cats, setCats] = useState()
  const [orders, setOrders] = useState()
  const [members, setMembers] = useState()
  const [transactions, setTransactions] = useState()

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getDashboardData`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setBestellrunden(res[2].length || 0)
          setProducts(res[0].length || 0)
          setCats(res[1].length || 0)
          setOrders(res[3].length || 0)
          setMembers(res[4].length || 0)
          setTransactions(res[5].length || 0)
        }
      })
      .catch(error => console.log(error))
  }, [])

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ marginTop: "20px" }}>
          <Card sx={{ minWidth: 275, borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {__("Hallo", "fcplugin")} {appLocalizer.currentUser.data.display_name}
              </Typography>
              <Typography variant="body1" sx={{ paddingTop: "10px" }}>
                {__("Willkommen in deinem Foodcoop Dashboard. Hier kannst du Bestellrunden, Produkte und Mitglieder verwalten.", "fcplugin")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275, borderRadius: 0 }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {bestellrunden ? <AnimatedNumber value={bestellrunden} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Bestellrunden", "fcplugin")}
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "10px" }}>
                  {__("wurden schon durchgeführt!", "fcplugin")}
                </Typography>
              </CardContent>
              <CardActions></CardActions>
            </Card>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275, borderRadius: 0 }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {products ? <AnimatedNumber value={products} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Produkte", "fcplugin")}
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "10px" }}>
                  {__("sind in deiner Produkteliste erfasst!", "fcplugin")}
                </Typography>
              </CardContent>
              <CardActions></CardActions>
            </Card>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ minWidth: 275, borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {orders ? <AnimatedNumber value={orders} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Bestellungen", "fcplugin")}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: "10px" }}>
                {__("wurden bereits ausgelöst und verarbeitet.", "fcplugin")}
              </Typography>
            </CardContent>
            <CardActions></CardActions>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ minWidth: 275, borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {transactions ? <AnimatedNumber value={transactions} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Transaktionen", "fcplugin")}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: "10px" }}>
                {__("wurden bereits erfasst!", "fcplugin")}
              </Typography>
            </CardContent>
            <CardActions></CardActions>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ minWidth: 275, borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {members ? <AnimatedNumber value={members} duration={3000} formatValue={value => value.toFixed(0)} /> : 0}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: "10px" }}>
                {__("Mitglieder hat deine Foodcoop!", "fcplugin")}
              </Typography>
            </CardContent>
            <CardActions></CardActions>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ minWidth: 275, borderRadius: 0 }}>
            <CardContent>
              <Typography variant="body2">Dieses Plugin wird bereitgestellt von</Typography>
              <Typography variant="body1" component="div" sx={{ marginTop: "10px" }}>
                Neues Food Depot GmbH <br />
                Industriestrasse 30 <br />
                8604 Volketswil <br />
                <br />
                info@neues-food-depot.ch <br />
                www.neues-food-depot.ch <br />
              </Typography>
            </CardContent>
            <CardActions>
              <a href="https://neues-food-depot.ch" target="blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Button size="small" sx={{ textDecoration: "none" }}>
                  Besuche uns
                </Button>
              </a>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
