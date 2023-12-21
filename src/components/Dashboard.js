import React, { useState, useEffect } from "react"
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
          setProducts(res[0].length - 1 || 0)
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
        <Grid item xs={12} sx={{ marginTop: "5px" }}>
          <Card sx={{ minWidth: 275, borderRadius: 0 }}>
            <CardContent sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {__("Hallo", "fcplugin")} {appLocalizer.currentUser.data.display_name}
                </Typography>
                <Typography variant="body1" sx={{ paddingTop: "10px" }}>
                  {__("Willkommen in deinem Foodcoop Dashboard. Hier kannst du Bestellrunden, Produkte und Mitglieder verwalten.", "fcplugin")}
                </Typography>

                <Grid container spacing={3} sx={{ marginTop: 2 }}>
                  <Grid item xs={12}>
                    <Typography variant="h5" component="div">
                      {bestellrunden ? <AnimatedNumber value={bestellrunden} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Bestellrunden", "fcplugin")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" component="div">
                      {products ? <AnimatedNumber value={products} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Produkte", "fcplugin")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" component="div">
                      {orders ? <AnimatedNumber value={orders} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Bestellungen", "fcplugin")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" component="div">
                      {transactions ? <AnimatedNumber value={transactions} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Transaktionen", "fcplugin")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" component="div">
                      {members ? <AnimatedNumber value={members} duration={3000} formatValue={value => value.toFixed(0)} /> : 0} {__("Mitglieder", "fcplugin")}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ width: "25%" }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sx={{ marginBottom: 0, display: "flex", flexDirection: "column", flexWrap: "nowrap", justifyContent: "flex-end" }}>
                    <img src={appLocalizer.pluginUrl + "/images/pot-plugin_home_klein.png"} title="POT Plugin" width="100%" />
                    <Box sx={{ marginBottom: 0, display: "flex", justifyContent: "center" }}>
                      <img src={appLocalizer.pluginUrl + "/images/Logo_POT_Plugin.svg"} title="POT Plugin Logo" height="25px" />
                    </Box>
                    <Box sx={{ marginBottom: 1, display: "flex", justifyContent: "center" }}>
                      <Typography variant="body1" component="div" sx={{ marginTop: "10px", textAlign: "center" }}>
                        Verein POT Netzwerk <br />
                        info@pot.ch <br />
                        www.pot.ch <br />
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
