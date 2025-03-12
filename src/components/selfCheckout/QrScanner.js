import { useState, useEffect } from "react"
import { QrReader } from "react-qr-reader"
import { Stack } from "@mui/material"
import axios from "axios"
import WeightDialog from "./WeightDialog"

const __ = wp.i18n.__

const containerStyle = {
  marginTop: "25px"
}

function QrScanner({ setScanning, cart, setProductError, setShowCart, setCart, setLoading }) {
  const [scanResult, setScanResult] = useState(0)
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [weightProd, setWeightProd] = useState(false)
  const [userWeightValue, setUserWeightValue] = useState(0)
  const [isEneteringWeight, setIsEnteringWeight] = useState(false)

  const wc_weight_units = {
    kg: 1000,
    g: 1,
    lbs: 453.592,
    oz: 28.3495
  }

  function scanResultFunction(decodedText) {
    //setScanning(false)

    if (scanResult === 0) {
      let execute = 1

      cart.map(cartItem => {
        if (decodedText.toString() === cartItem.sku.toString()) {
          setProductError(__("Produkt ist schon im Warenkorb. Du kannst die Menge erhöhen", "fcplugin"))
          setShowCart(true)
          setScanning(false)
          setLoading(false)
          execute = 0
        }
      })

      if (execute === 1) {
        axios
          .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProduct?sku=${decodedText}`)
          .then(function (response) {
            if (response.data) {
              const res = JSON.parse(response.data)
              if (!res) {
                setProductError("Produkt wurde nicht gefunden oder ist nicht an Lager.")
              } else {
                // if it is a weighed product, ask for the weight
                if (res.is_weighed) {
                  setWeightProd(res)
                  setWeightModalOpen(true)
                  setIsEnteringWeight(true)
                }
                // if it is not a weighed product, add it directly to the cart with quantity = 1
                else {
                  // prepare cart
                  let newCart = cart
                  res.id = newCart.length
                  res.order_type = "self_checkout"
                  newCart.push(res)
                  setCart(newCart)
                  if (newCart.length > 0) {
                    localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
                  }
                  setScanResult(0)
                  setScanning(false)
                  setShowCart(true)
                }
              }
            }
          })
          .catch(error => console.log(error))
      }
    }
    setScanResult(1)
  }

  useEffect(() => {
    // add item to cart after the user has entered the weight
    if (userWeightValue !== 0 && weightProd) {
      const prodWeightInG = weightProd.weight * wc_weight_units[weightProd.weight_unit]
      weightProd.amount = (userWeightValue * 1000) / prodWeightInG
      weightProd.userWeightValue = userWeightValue
      // prepare cart
      let newCart = cart
      weightProd.id = newCart.length
      weightProd.order_type = "self_checkout"
      newCart.push(weightProd)
      setCart(newCart)
      if (newCart.length > 0) {
        localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
      }
      setScanResult(0)
      setScanning(false)
      setShowCart(true)
    }
  }, [userWeightValue])

  return (
    <>
      <Stack spacing={3} sx={{ width: "100%" }}>
        <strong>{__("QR Code scannen", "fcplugin")}</strong>{" "}
        <QrReader
          videoContainerStyle={containerStyle}
          constraints={{ facingMode: "environment" }}
          onResult={(result, error) => {
            if (result) {
              scanResultFunction(result?.text)
            }
          }}
          style={{ width: "100%" }}
        />
      </Stack>
      {weightModalOpen && <WeightDialog setModalClose={setWeightModalOpen} prod={weightProd} setUserWeightValue={setUserWeightValue} setIsEnteringWeight={setIsEnteringWeight} />}
    </>
  )
}

export default QrScanner
