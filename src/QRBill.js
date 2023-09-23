import React, { useState, useEffect } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import Grid from "@mui/material/Grid"
import { SVG } from "swissqrbill/svg"
import axios from "axios"
import { CircularProgress } from "@mui/material"

const __ = wp.i18n.__

function QRBill() {
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

  useEffect(() => {
    // get banking options
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getBankingOptions?id=${frontendLocalizer.currentUser.ID}`)
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {loading ? (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <p>
              {__("Generiere hier einen QR Einzahlungsschein, um Geld auf unser Vereinskonto zu überweisen", "fcplugin")} (IBAN: {account}, {blogname}, {storeAddress}, {storePostcode}, {storeCity}).
            </p>
          </Grid>
          <Grid item xs={12}>
            <input type="number" min="0" placeholder="Betrag in CHF" className="fc_topup_input" onChange={event => setAmount(event.target.value)} />
            <button type="submit" onClick={handleQR}>
              {__("Einzahlungsschein generieren", "fcplugin")}
            </button>
          </Grid>
          <Grid item xs={12}>
            <div id="qrSVG"></div>
          </Grid>
        </Grid>
      )}
    </LocalizationProvider>
  )
}

export default QRBill
