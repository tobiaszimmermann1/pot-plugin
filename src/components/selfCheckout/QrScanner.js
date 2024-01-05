import { useState } from "react"
import { QrReader } from "react-qr-reader"
import axios from "axios"
const __ = wp.i18n.__

const containerStyle = {
  marginTop: "25px"
}

function QrScanner({ setScanning, cart, setProductError, setShowCart, setCart, setLoading }) {
  const [scanResult, setScanResult] = useState(0)

  function scanResultFunction(decodedText) {
    setScanning(false)
    setLoading(true)

    if (scanResult === 0) {
      let execute = 1

      cart.map(cartItem => {
        console.log(decodedText, cartItem.sku)
        if (decodedText.toString() === cartItem.sku.toString()) {
          setProductError(__("Produkt ist schon im Warenkorb. Du kannst die Menge erhöhen", "fcplugin"))
          setShowCart(true)
          setScanning(false)
          setLoading(false)
          execute = 0
        }
      })
      console.log(execute)

      if (execute === 1) {
        axios
          .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProduct?sku=${decodedText}`)
          .then(function (response) {
            if (response.data) {
              const res = JSON.parse(response.data)
              if (!res) {
                setProductError("Produkt wurde nicht gefunden")
              } else {
                let newCart = cart
                res.id = newCart.length
                newCart.push(res)
                setCart(newCart)
                if (newCart.length > 0) {
                  localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
                }
              }
            }
          })
          .catch(error => console.log(error))
          .finally(() => {
            setScanResult(0)
            setShowCart(true)
            setLoading(false)
          })
      }
    }
    setScanResult(1)
  }

  return (
    <>
      <QrReader
        videoContainerStyle={containerStyle}
        constraints={{ facingMode: "environment" }}
        onResult={(result, error) => {
          if (!!result) {
            scanResultFunction(result?.text)
          }
        }}
        style={{ width: "100%" }}
      />
    </>
  )
}

export default QrScanner
