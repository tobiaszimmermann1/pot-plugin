import React, { useState, useEffect } from "react"
import axios from "axios"
import { LoadingButton } from "@mui/lab"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import Switch from "@mui/material/Switch"
import LinearProgress from "@mui/material/LinearProgress"
import SaveIcon from "@mui/icons-material/Save"
import Alert from "@mui/material/Alert"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import { Divider } from "@mui/material"
const __ = wp.i18n.__

const Settings = () => {
  const [options, setOptions] = useState(null)
  const [fee, setFee] = useState()
  const [margin, setMargin] = useState()
  const [bank, setBank] = useState()
  const [transfer, setTransfer] = useState()
  const [address, setAddress] = useState()
  const [plz, setPlz] = useState()
  const [city, setCity] = useState()
  const [blogname, setBlogname] = useState()
  const [pages, setPages] = useState(null)
  const [orderPage, setOrderPage] = useState("none")
  const [publicPrices, setPublicPrices] = useState()
  const [publicMembers, setPublicMembers] = useState()
  const [instantTopup, setInstantTopup] = useState()
  const [updateBalanceOnPurchase, setUpdateBalanceOnPurchase] = useState(false)
  const [publicProducts, setPublicProducts] = useState()
  const [adminEmail, setAdminEmail] = useState()
  const [submitting, setSubmitting] = useState(false)
  const [enableStock, setEnableStock] = useState(false)
  const [enableSelfCheckout, setEnableSelfCheckout] = useState(false)
  const [priceOnLabels, setPriceOnLabels] = useState(false)
  const [enableTaxes, setEnableTaxes] = useState(false)
  const [enablePaymentByBill, setEnablePaymentByBill] = useState(false)
  const [enableUserBlock, setEnableUserBlock] = useState(false)
  const [enableRoundsStorewide, setEnableRoundsStorewide] = useState(false)
  const [privacyMailchimp, setPrivacyMailchimp] = useState(false)
  const [privacyRecaptcha, setPrivacyRecaptcha] = useState(false)
  const [privacyFontawesome, setPrivacyFontawesome] = useState(false)
  const [privacyTwint, setPrivacyTwint] = useState(false)

  useEffect(() => {
    console.log(privacyTwint)
  }, [privacyTwint])

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
    if (options) {
      setFee(options.fc_fee)
      setMargin(options.fc_margin)
      setBank(options.fc_bank)
      setTransfer(options.fc_transfer)
      setAddress(options.woocommerce_store_address)
      setPlz(options.woocommerce_store_postcode)
      setCity(options.woocommerce_store_city)
      setBlogname(options.blogname)
      setOrderPage(options.fc_order_page)
      setPublicPrices(options.fc_public_prices === "1")
      setPublicMembers(options.fc_public_members === "1")
      setPublicProducts(options.fc_public_products === "1")
      setInstantTopup(options.fc_instant_topup === "1")
      setUpdateBalanceOnPurchase(options.fc_update_balance_on_purchase === "1")
      setAdminEmail(options.admin_email)
      setEnableStock(options.woocommerce_manage_stock === "yes")
      options.fc_self_checkout === "1" ? setEnableSelfCheckout("1") : setEnableSelfCheckout("0")
      options.price_on_labels === "1" ? setPriceOnLabels("1") : setPriceOnLabels("0")
      setEnableTaxes(options.fc_taxes === "1")
      setEnablePaymentByBill(options.fc_enable_payment_by_bill === "1")
      setEnableUserBlock(options.fc_enable_user_block === "1")
      setEnableRoundsStorewide(options.fc_enable_rounds_storewide === "1")
      if (options.fc_privacy) {
        let privacy = JSON.parse(options.fc_privacy)
        setPrivacyMailchimp(privacy.privacyMailchimp)
        setPrivacyRecaptcha(privacy.privacyRecaptcha)
        setPrivacyFontawesome(privacy.privacyFontawesome)
        setPrivacyTwint(privacy.privacyTwint)
      }
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
          updateBalanceOnPurchase: updateBalanceOnPurchase,
          publicProducts: publicProducts,
          adminEmail: adminEmail,
          enableStock: enableStock,
          enableSelfCheckout: enableSelfCheckout,
          priceOnLabels: priceOnLabels,
          margin: margin,
          taxes: enableTaxes,
          enablePaymentByBill: enablePaymentByBill,
          enableUserBlock: enableUserBlock,
          enableRoundsStorewide: enableRoundsStorewide,
          privacy: {
            privacyMailchimp: privacyMailchimp,
            privacyRecaptcha: privacyRecaptcha,
            privacyFontawesome: privacyFontawesome,
            privacyTwint: privacyTwint
          }
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

  return options ? (
    <>
      <Card sx={{ display: "flex", padding: "1rem", paddingTop: 0, flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0 }} elevation={2}>
        <CardContent>
          <Grid container spacing={2} rowGap={2} alignItems="flex-start">
            <Grid item xs={12}>
              <h2>{__("Foodcoop", "fcplugin")}</h2>
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Name der Foodcoop", "fcplugin")}</strong>
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
              <strong>{__("Administrator Email", "fcplugin")}</strong>
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
              <strong>{__("Jahresbeitrag", "fcplugin")}</strong>
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
              <strong>{__("Bestellung nur für berechtigte Mitglieder", "fcplugin")}</strong>
              <br />
              <small>{__("Blockiert Bestellungen für alle Nicht-Mitglieder und Mitglieder, die den Jahresbeitrag noch nicht bezahlt haben.", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={enableUserBlock}
                exclusive
                onChange={(event, newStatus) => {
                  setEnableUserBlock(newStatus)
                }}
              >
                <ToggleButton value={true}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={false}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Marge für Nicht-Mitglieder", "fcplugin")}</strong>
              <br />
              <small>{__("Marge für Gast-Einkäufe. Die Marge wird an der Kasse als Gebühr hinzugefügt.", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <TextField
                  variant="outlined"
                  id="fc_margin"
                  label="%"
                  type="number"
                  value={margin ? margin : options.fc_margin}
                  onChange={event => {
                    setMargin(event.target.value)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Bankverbindung IBAN", "fcplugin")}</strong>
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
              <strong>{__("Adresse des Verteillokals", "fcplugin")}</strong>
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

            <Grid item xs={4}>
              <strong>{__("Bestellrunden im gesamten Shop erzwingen", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={enableRoundsStorewide}
                exclusive
                onChange={(event, newStatus) => {
                  setEnableRoundsStorewide(newStatus)
                }}
              >
                <ToggleButton value={true}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={false}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
              <Alert severity="warning" sx={{ marginTop: "10px" }}>
                <strong>{__("Achtung!", "fcplugin")}</strong> {__("Ist diese Einstellung aktiviert, sind im gesamten Shop nur noch Bestellungen möglich, die Bestellrunden zugeordnet werden können.", "fcplugin")}{" "}
              </Alert>
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Lagerverwaltung", "fcplugin")}</strong>
              <br />
              <small>{__("Aktiviert, bzw. deaktiviert die Lagerverwaltung generell und auf Produktebene für alle Produkte.", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={enableStock}
                exclusive
                onChange={(event, newStatus) => {
                  setEnableStock(newStatus)
                }}
              >
                <ToggleButton value={true}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={false}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
              <Alert severity="warning" sx={{ marginTop: "10px" }}>
                <strong>{__("Achtung!", "fcplugin")}</strong> {__("Aktiviert oder deaktiviert die Lagerverwaltung für alle Produkte! Die Einstellung verändert jedoch nicht den Lagerbestand. Allenfalls ist eine Inventur notwendig!", "fcplugin")}{" "}
              </Alert>
            </Grid>

            <Grid item xs={4}>
              <strong>{__("Mehrwertsteuer", "fcplugin")}</strong>
              <br />
              <small>{__("Aktiviert, bzw. deaktiviert die Mehrwertsteuer.", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={enableTaxes}
                exclusive
                onChange={(event, newStatus) => {
                  setEnableTaxes(newStatus)
                }}
              >
                <ToggleButton value={true}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={false}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
              <Alert severity="warning" sx={{ marginTop: "10px" }}>
                {__("Die Steuersätze müssen separat konfiguriert werden!", "fcplugin")}{" "}
                <a href={`${appLocalizer.homeUrl}/wp-admin/admin.php?page=wc-settings&tab=tax`} target="_blank">
                  {__("Zur Konfiguration der Steuersätze", "fcplugin")}
                </a>
              </Alert>
            </Grid>

            <Grid item xs={4}>
              <strong>{__("Self Checkout", "fcplugin")}</strong>
              <br />
              <small>{__("Aktiviert, bzw. deaktiviert den Self-Checkout.", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={enableSelfCheckout}
                exclusive
                onChange={(event, newStatus) => {
                  setEnableSelfCheckout(newStatus)
                }}
              >
                <ToggleButton value={"1"}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={"0"}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs={4}>
              <strong>{__("Preise auf Produktetiketten verbergen", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={priceOnLabels}
                exclusive
                onChange={(event, newStatus) => {
                  setPriceOnLabels(newStatus)
                }}
              >
                <ToggleButton value={"1"}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={"0"}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs={4}>
              <strong>{__("Bezahlung auf Rechnung zulassen?", "fcplugin")}</strong>
              <br />
              <small>{__("Wenn aktiviert, lässt das Plugin bei Sammelbestellungen alle aktivierten Zahlungsmethoden zu.", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={enablePaymentByBill}
                exclusive
                onChange={(event, newStatus) => {
                  setEnablePaymentByBill(newStatus)
                }}
              >
                <ToggleButton value={true}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={false}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs={4}>
              <strong>{__("Instant Topup aktivieren?", "fcplugin")}</strong>
              <br />
              <small>{__("Mitglieder können Guthaben sofort über aktivierte Woocommerce Payment Gateways aufladen. Benötigt externe Zahlungsschnittstelle(n).", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={instantTopup}
                exclusive
                onChange={(event, newStatus) => {
                  setInstantTopup(newStatus)
                }}
              >
                <ToggleButton value={true}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={false}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs={4}>
              <strong>{__("Guthaben bei Verkauf aktualisieren?", "fcplugin")}</strong>
              <br />
              <small>{__("Gelieferte Produkte werden beim Verkauf gutgeschrieben, nicht bei der Lieferung.", "fcplugin")}</small>
            </Grid>
            <Grid item xs={8}>
              <ToggleButtonGroup
                color="primary"
                value={updateBalanceOnPurchase}
                exclusive
                onChange={(event, newStatus) => {
                  setUpdateBalanceOnPurchase(newStatus)
                }}
              >
                <ToggleButton value={true}> {__("Aktiviert", "fcplugin")} </ToggleButton>
                <ToggleButton value={false}> {__("Deaktiviert", "fcplugin")} </ToggleButton>
              </ToggleButtonGroup>
              <Alert severity="warning" sx={{ marginTop: "10px" }}>
                <strong>{__("Achtung!", "fcplugin")}</strong> {__("Bei Änderung des Auszahlungsmodells müssen die Guthaben manuell korrigiert werden!", "fcplugin")}{" "}
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <LoadingButton variant="contained" size="large" onClick={handleSave} loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
            {__("Einstellungen Speichern", "fcplugin")}
          </LoadingButton>
        </CardActions>
      </Card>
      <Card elevation={2} sx={{ display: "flex", flexDirection: "column", padding: "1rem", paddingTop: 0, flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0, marginTop: 2 }}>
        <CardContent>
          <Grid container spacing={2} rowGap={2} alignItems="baseline">
            <Grid item xs={12}>
              <h2>{__("Anzeige", "fcplugin")}</h2>
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Preise öffentlich anzeigen?", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={publicPrices} onChange={event => setPublicPrices(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Produktbilder und Produktseiten aktivieren?", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={publicProducts} onChange={event => setPublicProducts(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Mitgliederliste in Mein Konto anzeigen?", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={publicMembers} onChange={event => setPublicMembers(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <LoadingButton variant="contained" size="large" onClick={handleSave} loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
            {__("Einstellungen Speichern", "fcplugin")}
          </LoadingButton>
        </CardActions>
      </Card>
      <Card elevation={2} sx={{ display: "flex", flexDirection: "column", padding: "1rem", paddingTop: 0, flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0, marginTop: 2 }}>
        <CardContent>
          <Grid container spacing={2} rowGap={2} alignItems="baseline">
            <Grid item xs={12}>
              <h2>{__("Datenschutz", "fcplugin")}</h2>
            </Grid>
            <Grid item xs={12}>
              <p>{__("Wähle welche externe Dienste genutzt werden und zeige die Datenschutzerklärung an beliebiger Stelle mit dem Shortcode [foodcoop_privacy] an.", "fcplugin")}</p>
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Mailchimp", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={privacyMailchimp} onChange={event => setPrivacyMailchimp(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
            <Grid item xs={4}>
              <strong>{__("Google reCaptcha", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={privacyRecaptcha} onChange={event => setPrivacyRecaptcha(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
            <Grid item xs={4}>
              <strong>{__("FontAwesome", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={privacyFontawesome} onChange={event => setPrivacyFontawesome(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>{" "}
            <Grid item xs={4}>
              <strong>{__("Twint", "fcplugin")}</strong>
            </Grid>
            <Grid item xs={8}>
              <Switch checked={privacyTwint} onChange={event => setPrivacyTwint(event.target.checked)} inputProps={{ "aria-label": "controlled" }} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <LoadingButton variant="contained" size="large" onClick={handleSave} loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
            {__("Einstellungen Speichern", "fcplugin")}
          </LoadingButton>
        </CardActions>
      </Card>
    </>
  ) : (
    <Card elevation={2} sx={{ display: "flex", justifyContent: "center", padding: "15px 0", flexWrap: "wrap", backgroundColor: "white", fontSize: "1rem", borderRadius: 0, width: "100%" }}>
      <Box sx={{ width: "98%" }}>
        <LinearProgress />
      </Box>
    </Card>
  )
}

export default Settings
