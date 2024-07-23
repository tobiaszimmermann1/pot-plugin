import React, { useState, useEffect, useRef } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import Grid from "@mui/material/Grid"
import { SVG } from "swissqrbill/svg"
import axios from "axios"
import { Box, LinearProgress, Divider } from "@mui/material"
import Alert from "@mui/material/Alert"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import WidgetsIcon from "@mui/icons-material/Widgets"
const __ = wp.i18n.__

function MyBalance() {
  const [amount, setAmount] = useState(0)
  const [account, setAccount] = useState(null)
  const [storeAddress, setStoreAddress] = useState(null)
  const [storeCity, setStoreCity] = useState(null)
  const [storePostcode, setStorePostcode] = useState(null)
  const [blogname, setBlogname] = useState(null)
  const [name, setName] = useState(null)
  const [address, setAddress] = useState(null)
  const [postcode, setPostcode] = useState(null)
  const [city, setCity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [instantTopUpAmount, setInstantTopUpAmount] = useState(null)
  const [instantTopUp, setInstantTopUp] = useState(null)
  const [payoutAmount, setPayoutAmount] = useState(null)
  const [toIban, setToIban] = useState("")
  const [toName, setToName] = useState("")
  const [toCity, setToCity] = useState("")
  const [balance, setBalance] = useState("0.00")
  const [currency, setCurrency] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // get banking options
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getBankingOptions`, {
        headers: {
          "X-WP-Nonce": frontendLocalizer.nonce
        }
      })
      .then(function (response) {
        const res = JSON.parse(response.data)
        setAccount(res[0].replace(" ", ""))
        setStoreAddress(res[1])
        setStoreCity(res[2])
        setStorePostcode(res[3])
        setBlogname(res[4])
        setName(res[5])
        setAddress(res[6])
        setPostcode(res[7])
        setCity(res[8])
        setInstantTopUp(res[9])
        setBalance(res[10])
        setCurrency(res[11])
        setLoading(false)
      })
      .catch(function (error) {
        console.log(error)
      })
  }, [])

  function handleQR() {
    if (amount > 0 && !loading) {
      document.getElementById("qrSVG").innerHTML = ""
      const data = {
        currency: "CHF",
        amount: parseFloat(amount),
        creditor: {
          name: blogname,
          address: storeAddress,
          zip: storePostcode,
          city: storeCity,
          account: account,
          country: "CH"
        },
        debtor: {
          name: name,
          address: address,
          zip: postcode,
          city: city,
          country: "CH"
        }
      }

      const qr = new SVG(data)
      document.getElementById("qrSVG").appendChild(qr.element)
    }
  }

  function handleInstandTopUp() {
    if (instantTopUpAmount > 0) {
      axios
        .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/instantTopup`, {
          user_id: frontendLocalizer.currentUser.ID,
          amount: instantTopUpAmount
        })
        .then(function (response) {
          location.href = JSON.parse(response.data)
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }

  function handlePayout() {
    if (payoutAmount > 0 && toIban !== "" && toName !== "" && toCity !== "") {
      axios
        .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/payout`, {
          user_id: frontendLocalizer.currentUser.ID,
          amount: payoutAmount,
          iban: toIban,
          toname: toName,
          tocity: toCity
        })
        .then(function (response) {
          console.log(response.data)
          if (response.data === 200) {
            setSuccess(true)
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }

  return (
    <>
      {loading ? (
        <Box sx={{ width: "100%", marginBottom: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <h2>
                {__("Dein aktuelles Guthaben beträgt", "fcplugin")}{" "}
                <span style={{ color: parseFloat(balance) >= 0 ? "green" : "red" }}>
                  <span dangerouslySetInnerHTML={{ __html: currency }} /> {balance}
                </span>
              </h2>
            </Grid>
          </Grid>
          <Box sx={{ backgroundColor: "white", marginTop: "20px", padding: "20px" }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <h2>{__("Guthaben per Banküberweisung aufladen", "fcplugin")}</h2>
              </Grid>
              <Grid item xs={12}>
                <p>
                  {__("Generiere hier einen QR Einzahlungsschein, um Geld auf unser Vereinskonto zu überweisen", "fcplugin")} (IBAN: {account}, {blogname}, {storeAddress}, {storePostcode}, {storeCity}).
                </p>
              </Grid>
              <Grid item xs={12}>
                <input type="number" min="1" placeholder="Betrag in CHF" className="fc_topup_input" onChange={event => setAmount(event.target.value)} /> <br />
                <button type="submit" onClick={handleQR} style={{ marginTop: 10 }}>
                  {__("Einzahlungsschein generieren", "fcplugin")}
                </button>
              </Grid>
              <Grid item xs={12}>
                <div id="qrSVG"></div>
              </Grid>
            </Grid>
            {instantTopUp === "1" && (
              <>
                <Divider sx={{ marginTop: 2, marginBottom: 2, borderColor: "#000000" }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <h2>{__("Guthaben sofort aufladen", "fcplugin")}</h2>
                  </Grid>
                  <Grid item xs={12}>
                    <p>{__("Lade dein Guthaben über eine Zahlungsschnittstelle auf, um es sofort verfügbar zu haben (evtl. fallen Gebühren an).", "fcplugin")}</p>
                    <Alert severity="warning">{__("Achtung: Der bestehende Warenkorb wird geleert!", "fcplugin")}</Alert>
                  </Grid>
                  <Grid item xs={12}>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Betrag in CHF"
                      className="fc_instant_topup_input"
                      onChange={event => setInstantTopUpAmount(event.target.value)}
                      value={instantTopUpAmount}
                      onKeyPress={event => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault()
                        }
                      }}
                    />{" "}
                    <br />
                    <button type="submit" onClick={handleInstandTopUp} style={{ marginTop: 10 }}>
                      {__("Zur Kasse", "fcplugin")}
                    </button>
                  </Grid>
                </Grid>
              </>
            )}
            <>
              <Divider sx={{ marginTop: 2, marginBottom: 2, borderColor: "#000000" }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <h2>{__("Guthaben auszahlen", "fcplugin")}</h2>
                </Grid>
                <Grid item xs={12}>
                  <p>{__("Veranlasse hier eine Auszahlung von Guthaben auf dein Konto.", "fcplugin")}</p>
                </Grid>
                <Grid item xs={12}>
                  <input type="number" min="0.05" step="any" placeholder="Betrag in CHF" className="fc_payout_amount" onChange={event => setPayoutAmount(event.target.value)} value={payoutAmount} />
                  <br />
                  <input type="text" placeholder={__("IBAN", "fcplugin")} className="fc_payout_iban" onChange={event => setToIban(event.target.value.toString())} value={toIban} style={{ marginTop: 10 }} /> <br />
                  <input type="text" placeholder={__("lautend auf", "fcplugin")} className="fc_payout_name" onChange={event => setToName(event.target.value)} value={toName} style={{ marginTop: 10 }} /> <br />
                  <input type="text" placeholder={__("PLZ / Ort", "fcplugin")} className="fc_payout_city" onChange={event => setToCity(event.target.value)} value={toCity} style={{ marginTop: 10 }} /> <br />
                  <button type="submit" onClick={handlePayout} style={{ marginTop: 10 }}>
                    {__("Auszahlung veranlassen", "fcplugin")}
                  </button>
                  {success && (
                    <Alert severity="success" sx={{ marginTop: "10px" }}>
                      {__("Anfrage wurde versendet.", "fcplugin")}
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </>
          </Box>
        </>
      )}
    </>
  )
}

export default MyBalance
