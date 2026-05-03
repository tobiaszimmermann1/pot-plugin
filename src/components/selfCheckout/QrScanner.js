import { useState, useEffect, useContext } from "react"
import { QrReader } from "react-qr-reader"
import { Stack,TextField } from "@mui/material"

const __ = wp.i18n.__

const containerStyle = {
  marginTop: "25px"
}

function QrScanner({ updateScanResult }) {
  const [scanActive, setScanActive] = useState(true)
  const [manualInput, setManualInput] = useState('')

  function handleManualInput(e) {
    const value = e.target.value;
    if ( !value ) return;

    scanResultFunction(value);
  }

  function scanResultFunction(decodedText) {
    setScanActive(false)
    updateScanResult(decodedText);
  }

  return (
    <>
      <Stack spacing={3} sx={{ width: "100%" }}>
        <strong>{__("QR Code scannen", "fcplugin")}</strong>{" "}
        {scanActive && (
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
        )}
        <TextField
          autoFocus
          placeholder={__("Manuelle Eingabe", "fcplugin")}
          type="text"
          variant="outlined"
          onBlur={handleManualInput}
          sx={{ width: "100%" }}
        />
      </Stack>
    </>
  )
}

export default QrScanner
