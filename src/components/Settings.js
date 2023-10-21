import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import { Box, Button, Typography } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import Switch from "@mui/material/Switch"
import CircularProgress from "@mui/material/CircularProgress"
import SaveIcon from "@mui/icons-material/Save"
const __ = wp.i18n.__

const Settings = () => {
  const [options, setOptions] = useState(null)
  const [fee, setFee] = useState()
  const [bank, setBank] = useState()
  const [transfer, setTransfer] = useState()
  const [address, setAddress] = useState()
  const [plz, setPlz] = useState()
  const [city, setCity] = useState()
  const [blogname, setBlogname] = useState()
  const [pages, setPages] = useState(null)
  const [orderPage, setOrderPage] = useState()
  const [publicPrices, setPublicPrices] = useState()
  const [publicMembers, setPublicMembers] = useState()
  const [instantTopup, setInstantTopup] = useState()
  const [publicProducts, setPublicProducts] = useState()
  const [adminEmail, setAdminEmail] = useState()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getAllOptions`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        setOptions(JSON.parse(response.data))
      })
      .catch(function (error) {
        console.log(error)
      })
  }, [])
  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getPages`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        },
        params: {
          per_page: 100
        }
      })
      .then(function (response) {
        let pages = []
        JSON.parse(response.data).map(page => {
          pages.push({ id: page.id, title: page.title })
        })
        setPages(pages)
      })
      .catch(function (error) {
        console.log(error)
      })
  }, [])

  useEffect(() => {
    if (options) {
      setFee(options.fc_fee)
      setBank(options.fc_bank)
      setTransfer(options.fc_transfer)
      setAddress(options.woocommerce_store_address)
      setPlz(options.woocommerce_store_postcode)
      setCity(options.woocommerce_store_city)
      setBlogname(options.blogname)
      setOrderPage(options.fc_order_page)
      options.fc_public_prices == "1" ? setPublicPrices(true) : setPublicPrices(false)
      options.fc_public_members == "1" ? setPublicMembers(true) : setPublicMembers(false)
      options.fc_public_products == "1" ? setPublicProducts(true) : setPublicProducts(false)
      options.fc_instant_topup == "1" ? setInstantTopup(true) : setInstantTopup(false)
      setAdminEmail(options.admin_email)
    }
  }, [options])

  const handleSave = () => {
    setSubmitting(true)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/saveAllOptions`,
        {
          fee: fee,
          bank: bank,
          transfer: transfer,
          address: address,
          plz: plz,
          city: city,
          blogname: blogname,
          orderPage: orderPage,
          publicPrices: publicPrices,
          publicMembers: publicMembers,
          instantTopup: instantTopup,
          publicProducts: publicProducts,
          adminEmail: adminEmail
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .catch(error => console.log(error.message))
      .finally(() => {
        setSubmitting(false)
      })
  }

  return options && pages ? (
    <>
      <Card sx={{ display: "flex", padding: "1rem", paddingTop: 0, flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0 }} elevation={2}>
        <CardContent>
          <Grid container spacing={2} rowGap={2} alignItems="baseline">
            <Grid item xs={12}>
              <h2>{__("Foodcoop Einstellungen", "fcplugin")}</h2>
            </Grid>
            <Grid item xs={4}>
              {__("Name der Foodcoop", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <TextField
                  variant="outlined"
                  id="blogname"
                  label="Name"
                  value={blogname ? blogname : options.blogname}
                  onChange={event => {
                    setBlogname(event.target.value)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              {__("Administrator Email", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <TextField
                  variant="outlined"
                  id="admin_email"
                  label="Email"
                  value={adminEmail ? adminEmail : options.admin_email}
                  onChange={event => {
                    setAdminEmail(event.target.value)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              {__("Jahresbeitrag", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <TextField
                  variant="outlined"
                  id="fc_fee"
                  label="CHF"
                  type="number"
                  value={fee ? fee : options.fc_fee}
                  onChange={event => {
                    setFee(event.target.value)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              {__("Bankverbindung IBAN", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <TextField
                  variant="outlined"
                  id="fc_bank"
                  label="IBAN"
                  value={bank ? bank : options.fc_bank}
                  onChange={event => {
                    setBank(event.target.value)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              {__("Instruktionen für die Banküberweisung", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <TextField
                  variant="outlined"
                  id="fc_transfer"
                  label="Instruktionen Überweisung"
                  type="text"
                  multiline
                  rows={4}
                  value={transfer ? transfer : options.fc_transfer}
                  onChange={event => {
                    setTransfer(event.target.value)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              {__("Adresse des Verteillokals", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <Grid container direction="row" alignItems="space-between" justifyContent="space-between" rowGap={4}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      variant="outlined"
                      id="woocommerce_store_address"
                      label="Strasse & Nr"
                      value={address ? address : options.woocommerce_store_address}
                      onChange={event => {
                        setAddress(event.target.value)
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <TextField
                      variant="outlined"
                      id="woocommerce_store_postcode"
                      label="Postleitzahl"
                      value={plz ? plz : options.woocommerce_store_postcode}
                      onChange={event => {
                        setPlz(event.target.value)
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={8}>
                  <FormControl fullWidth>
                    <TextField
                      variant="outlined"
                      id="woocommerce_store_city"
                      label="Ort"
                      value={city ? city : options.woocommerce_store_city}
                      onChange={event => {
                        setCity(event.target.value)
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <LoadingButton variant="contained" size="large" onClick={handleSave} loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
            {__("Speichern", "fcplugin")}
          </LoadingButton>
        </CardActions>
      </Card>
      <Card elevation={2} sx={{ display: "flex", flexDirection: "column", padding: "1rem", paddingTop: 0, flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0, marginTop: 2 }}>
        <CardContent>
          <Grid container spacing={2} rowGap={2} alignItems="baseline">
            <Grid item xs={12}>
              <h2>{__("Anzeige Einstellungen", "fcplugin")}</h2>
            </Grid>
            {pages && (
              <>
                <Grid item xs={4}>
                  {__("Bestellseite", "fcplugin")}
                </Grid>
                <Grid item xs={8}>
                  <FormControl fullWidth>
                    <InputLabel id="fc_order_page">Bestellseite</InputLabel>
                    <Select labelId="fc_order_page" id="fc_order_page-select" value={orderPage} label="Bestellseite" onChange={e => setOrderPage(e.target.value)}>
                      {pages.map(page => (
                        <MenuItem key={page.id} value={page.id}>
                          {page.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <br /> <br />
                  <i>{__("Die Bestell-Liste kann auch mit dem Shortcode [foodcoop_list] eingefügt werden.", "fcplugin")}</i>
                </Grid>
              </>
            )}
            <Grid item xs={4}>
              {__("Preise öffentlich anzeigen?", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <Switch checked={publicPrices} onChange={event => setPublicPrices(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
            <Grid item xs={4}>
              {__("Produktbilder und Produktseiten aktivieren?", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <Switch checked={publicProducts} onChange={event => setPublicProducts(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
            <Grid item xs={4}>
              {__("Mitgliederliste in Mein Konto anzeigen?", "fcplugin")}
            </Grid>
            <Grid item xs={8}>
              <Switch checked={publicMembers} onChange={event => setPublicMembers(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
            <Grid item xs={4}>
              {__("Instant Topup aktivieren?", "fcplugin")}
              <br />
              <small>{__("Mitglieder können Guthaben sofort über aktivierte Woocommerce Payment Gateways aufladen. Benötigt externe Zahlungsschnittstelle(n).", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={instantTopup} onChange={event => setInstantTopup(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <LoadingButton variant="contained" size="large" onClick={handleSave} loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
            {__("Speichern", "fcplugin")}
          </LoadingButton>
        </CardActions>
      </Card>
    </>
  ) : (
    <Card elevation={2} sx={{ display: "flex", padding: "1rem", flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0 }}>
      <Grid alignItems="center" justify="center">
        <CircularProgress />
      </Grid>
    </Card>
  )
}

export default Settings
