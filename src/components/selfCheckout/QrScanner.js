import { useState, useEffect, useRef, useContext } from "react"
import { Box, FormControl, InputLabel, Select, MenuItem, Stack, CircularProgress, Autocomplete, TextField, Button, Typography } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import VideocamIcon from "@mui/icons-material/Videocam"
import { Html5Qrcode } from "html5-qrcode"

const __ = wp.i18n.__

const containerStyle = {
  marginTop: "25px"
}

function QrScanner({ updateScanResult, products, productsLoading }) {
  const scannerRef = useRef(null)

  const [scanActive, setScanActive] = useState(true)
  const [manualInput, setManualInput] = useState("")
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState("")
  const [isScanning, setIsScanning] = useState(true)
  const [isStreamLoading, setIsStreamLoading] = useState(false)
  const [stateMsg, setStateMsg] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Fetch available device cameras on mount
  useEffect(() => {
    requestCameraPermission()
  }, [])

  const requestCameraPermission = () => {
    setPermissionDenied(false)
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length > 0) {
          setCameras(devices)
          // Default to the back/environment camera if available
          const backCamera = devices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"))
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id)
          setPermissionDenied(false)
        }
      })
      .catch(err => {
        console.error("Error getting cameras (permissions might not be granted yet): ", err)
        setPermissionDenied(true)
      })
  }

  // Handle the scanning lifecycle (Start / Stop / Switch Camera)
  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader")
    }

    const html5QrCode = scannerRef.current

    const updateScanner = async () => {
      if (isScanning && selectedCameraId) {
        setIsStreamLoading(true)

        // If already scanning, the user just switched cameras in the dropdown.
        // We MUST wait for the current stream to stop before starting the new one.
        if (html5QrCode.isScanning) {
          try {
            await html5QrCode.stop()
          } catch (err) {
            console.error("Error stopping previous camera: ", err)
          }
        }

        // Start the newly selected camera
        html5QrCode
          .start(
            selectedCameraId, // Using explicit ID from the dropdown
            {
              fps: 30,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText, decodedResult) => {
              console.log(`QR Code: ${decodedText}`)
              updateScanResult(decodedText)
            },
            errorMessage => {}
          )
          .then(() => {
            setIsStreamLoading(false)
            setPermissionDenied(false)
          })
          .catch(err => {
            console.error(`QR Code start error: ${err}`)
            setIsStreamLoading(false)
            // Check if it's a permission error
            if (err.toString().includes("NotAllowedError") || err.toString().includes("Permission")) {
              setPermissionDenied(true)
            }
          })
      } else if (!isScanning && html5QrCode.isScanning) {
        // Stop scanning safely
        html5QrCode
          .stop()
          .then(() => console.log("Scanner stopped"))
          .catch(err => console.error("Error stopping: ", err))
      }
    }

    updateScanner()
  }, [isScanning, selectedCameraId, setIsScanning])

  // Final CLEANUP on component unmount ONLY
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {})
      }
    }
  }, [])

  // Handle manual input of sku
  useEffect(() => {
    if (selectedProduct) {
      console.log("Selected product from manual input: ", selectedProduct.sku)
      updateScanResult(selectedProduct.sku)
    }
  }, [selectedProduct])

  function scanResultFunction(decodedText) {
    console.log("Manual input or QR scan result: ", decodedText)
    setScanActive(false)
    updateScanResult(decodedText)
  }

  return (
    <>
      <Stack spacing={3} sx={{ width: "100%" }}>
        <div id="reader" style={{ width: "100%", height: "100%", marginBottom: "16px", marginTop: "24px", borderRadius: 1 }}></div>
        {/* Camera Permission Button */}
        {permissionDenied && (
          <Box>
            <Stack direction="column" spacing={2} alignItems="center" sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
              <VideocamIcon sx={{ fontSize: 60 }} />
              <Typography variant="h6" align="center">
                {__("Camera Access Blocked", "pingvin_checkout")}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                {__("To enable camera scanning:", "pingvin_checkout")}
              </Typography>
              <Box component="ol" sx={{ textAlign: "left", pl: 2, "& li": { mb: 1 } }}>
                <li>
                  <Typography variant="body2">{__("Click the lock/camera icon in your browser's address bar", "pingvin_checkout")}</Typography>
                </li>
                <li>
                  <Typography variant="body2">{__("Allow camera permissions for this site", "pingvin_checkout")}</Typography>
                </li>
                <li>
                  <Typography variant="body2">{__("Reload the page", "pingvin_checkout")}</Typography>
                </li>
              </Box>
              <Typography variant="body2" align="center" sx={{ mt: 2, fontStyle: "italic", color: "text.secondary" }}>
                {__("Or use the search field below to add products manually.", "pingvin_checkout")}
              </Typography>
            </Stack>
          </Box>
        )}
        {isStreamLoading && (
          <div>
            <Stack direction="column" spacing={1} alignItems="center">
              <CircularProgress color="primary" />
              {__("Loading camera...", "pingvin_checkout")}
            </Stack>
          </div>
        )}
        {stateMsg && (
          <Box sx={{ mt: 2, p: 1, borderRadius: 1, width: "100%", textAlign: "center" }}>
            <span>{stateMsg}</span>
          </Box>
        )}
        {/* Camera Selector - Fixed at bottom above actions bar */}
        <Box
          sx={{
            position: "fixed",
            bottom: "80px",
            left: 0,
            right: 0,
            padding: "16px",
            borderTop: `1px solid black`,
            zIndex: 1000
          }}
        >
          {/* Manual Product Search Autocomplete */}
          <Autocomplete
            value={selectedProduct}
            onChange={(event, newValue) => {
              setSelectedProduct(newValue)
            }}
            options={products || []}
            getOptionLabel={option => `${option.name} (${option.sku})`}
            popupIcon={<SearchIcon />}
            renderInput={params => <TextField {...params} label={__("Search product by name or SKU", "pingvin_checkout")} placeholder={__("Type to search...", "pingvin_checkout")} size="small" />}
            filterOptions={(options, { inputValue }) => {
              const input = inputValue.toLowerCase()
              return options.filter(option => option.name.toLowerCase().includes(input) || option.sku.toLowerCase().includes(input))
            }}
            componentsProps={{
              popper: {
                style: { zIndex: 1000000 }
              }
            }}
            slotProps={{
              paper: {
                style: { zIndex: 1000000 }
              }
            }}
            disablePortal={false}
            sx={{ width: "100%", mb: 2 }}
          />
          {/*<TextField autoFocus placeholder={__("Manuelle Eingabe", "fcplugin")} type="text" variant="outlined" onBlur={handleManualInput} sx={{ width: "100%", mb: 2 }} />*/}

          {cameras.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel id="camera-select-label">{__("Select Camera", "pingvin_checkout")}</InputLabel>
              <Select
                labelId="camera-select-label"
                value={selectedCameraId}
                label="Select Camera"
                onChange={e => setSelectedCameraId(e.target.value)}
                MenuProps={{
                  style: { zIndex: 1000000 },
                  disablePortal: false
                }}
              >
                {cameras.map(camera => (
                  <MenuItem key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Stack>
    </>
  )
}

export default QrScanner
