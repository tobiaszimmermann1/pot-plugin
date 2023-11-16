import React, { useState, useEffect } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import Typography from "@mui/material/Typography"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Stack, TextField, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { format } from "date-fns"
import { usePapaParse } from "react-papaparse"
import { ExportToCsv } from "export-to-csv"
const __ = wp.i18n.__

const baseUrl = "https://neues-food-depot.ch/import/"

function ProducerImportProducts({ setModalClose }) {
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [validationSuccess, setValidationSuccess] = useState(null)
  const [validatedData, setValidatedData] = useState(null)
  const [bestellrunden, setBestellrunden] = useState()
  const [lieferanten, setLieferanten] = useState()
  const [loading, setLoading] = useState(true)

  /**
   * Get Bestellrunden and check if currently active
   */
  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getBestellrunden`)
      .then(function (response) {
        let reArrangedBestellrunden = []
        if (response.data) {
          const res = JSON.parse(response.data)
          res.map(b => {
            let bestellrundeToDo = {}
            bestellrundeToDo.author = b.name
            bestellrundeToDo.bestellrunde_start = format(new Date(b.bestellrunde_start), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_ende = format(new Date(b.bestellrunde_ende), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_verteiltag = format(new Date(b.bestellrunde_verteiltag), "yyyy-MM-dd")
            bestellrundeToDo.date_created = format(new Date(b.date_created), "yyyy-MM-dd")
            bestellrundeToDo.id = b.id
            reArrangedBestellrunden.push(bestellrundeToDo)
          })
          reArrangedBestellrunden.sort((a, b) => b.id - a.id)
          setBestellrunden(reArrangedBestellrunden)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Get lieferanten from https://neues-food-depot.ch custom Wordpress API endpoint
   */
  useEffect(() => {
    axios
      .get(`https://neues-food-depot.ch/wp-json/foodcoop/v1/importProducts`)
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setLieferanten(res)
        }
      })
      .catch(error => console.log(error))
  }, [])

  const { readString } = usePapaParse()

  const handleReadRemoteFile = lieferantID => {
    let csvString = lieferanten[lieferantID]

    readString(csvString, {
      worker: true,
      complete: results => {
        /**
         * Validate uploaded products csv file
         */
        let validated = true

        /**
         * 1. Validate Number of Columns
         */
        if (results.data[0].length !== 11) {
          setValidationError(__("Die Datei hat nicht exakt 11 Spalten.", "fcplugin"))
          validated = false
        }

        /**
         * 2. Validate Header names
         */
        if (results.data[0][0].trim() !== "name") {
          setValidationError(__("Spalte 1 muss 'name' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][1].trim() !== "price") {
          setValidationError(__("Spalte 2 muss 'price' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][2].trim() !== "unit") {
          setValidationError(__("Spalte 3 muss 'unit' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][3].trim() !== "lot") {
          setValidationError(__("Spalte 4 muss 'lot' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][4].trim() !== "producer") {
          setValidationError(__("Spalte 5 muss 'producer' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][5].trim() !== "origin") {
          setValidationError(__("Spalte 6 muss 'origin' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][6].trim() !== "category") {
          setValidationError(__("Spalte 7 muss 'category' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][8] !== "short_description") {
          setValidationError(__("Spalte 9 muss 'short_description' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][9] !== "image") {
          setValidationError(__("Spalte 10 muss 'image' heissen.", "fcplugin"))
          validated = false
        }
        if (results.data[0][10] !== "description") {
          setValidationError(__("Spalte 11 muss 'description' heissen.", "fcplugin"))
          validated = false
        }

        /**
         * 3. Validate that there are no empty cells
         */
        let r = 1
        let errors = ""
        results.data.map(row => {
          if (r !== results.data.length) {
            let c = 1
            row.map(cell => {
              if (cell === "") {
                if (c !== 8 && c !== 9 && c !== 10 && c !== 11) {
                  errors += ` [${__("Zeile", "fcplugin")}: ${r}, ${__("Zelle", "fcplugin")}: ${c}] `
                  validated = false
                }
              }
              c++
            })
            r++
          }
        })
        if (errors !== "") {
          setValidationError(__("Zellen dürfen nicht leer sein (ausser 'id' bei neuen Produkten,'short_description', 'image' und 'description').", "fcplugin") + errors)
          validated = false
        }

        /**
         * 4. Validate that price, lot and id are numbers
         */
        r = 1
        errors = ""
        results.data.map(row => {
          if (r !== results.data.length && r !== 1) {
            if (isNaN(row[1])) {
              errors += ` [${__("Zeile", "fcplugin")}: ${r}, ${__("Zelle", "fcplugin")}: 2] `
              validated = false
            }
            if (isNaN(row[3])) {
              errors += ` [${__("Zeile", "fcplugin")}: ${r}, ${__("Zelle", "fcplugin")}: 4] `
              validated = false
            }
          }

          r++
        })
        if (errors !== "") {
          setValidationError(__("Spalten 'price', 'lot' und 'id' müssen Zahlen sein.", "fcplugin") + errors)
          validated = false
        }

        if (validated === true) {
          setValidationSuccess(__("Daten wurden geprüft. Die Import-Liste ist bereit zum Download.", "fcplugin"))
          let checkedData = []
          checkedData.push(["name", "price", "unit", "lot", "producer", "origin", "category", "id", "short_description", "image", "description"])
          r = 1
          results.data.map(row => {
            if (r !== results.data.length && r !== 1) {
              checkedData.push(row)
            }
            r++
          })
          setValidatedData(checkedData)
        }
      }
    })
  }

  useEffect(() => {
    if (bestellrunden) {
      let active = false
      bestellrunden.map(bestellrunde => {
        if (new Date(bestellrunde.bestellrunde_start).getTime() <= new Date().getTime() && new Date(bestellrunde.bestellrunde_verteiltag).getTime() >= new Date().getTime()) {
          active = true
        }
      })
      active !== true ? setLoading(false) : setValidationError(__("Während aktiven Bestellrunden können keine Produkte importiert werden.", "fcplugin"))
    }
  }, [bestellrunden])

  /**
   * Export to CSV
   */
  const csvOptions = {
    fieldSeparator: ";",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    filename: "foodcoop-import-products-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleSubmit = () => {
    csvExporter.generateCsv(validatedData)
  }

  return (
    <>
      <Dialog open={true} fullWidth scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle textAlign="left">{__("Produkte von Lieferanten", "fcplugin")}</DialogTitle>
        <DialogContent
          sx={{
            paddingTop: "10px",
            minHeight: "300px"
          }}
        >
          <Stack spacing={2} sx={{ width: "100%", paddingTop: "0" }}>
            <Box sx={{ padding: "10px", backgroundColor: "#f0f0f0" }}>
              <Typography variant="body2" gutterBottom>
                {__("Importiere Produkte ausgewählter Lieferanten direkt.", "fcplugin")}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {__("Du kannst eine fixfertige Import-Liste downloaden.", "fcplugin")}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {__("Übernimm aus der Liste was du willst in deine Produkteliste.", "fcplugin")}
              </Typography>
            </Box>

            {lieferanten ? (
              <>
                <TextField
                  id="producers"
                  select
                  label={__("Lieferant", "fcplugin")}
                  SelectProps={{
                    native: true
                  }}
                >
                  {Object.keys(lieferanten).map(key => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </TextField>

                <Stack direction="row" spacing={2}>
                  <Button variant="contained" type="button" disabled={!lieferanten} onClick={() => handleReadRemoteFile("Neues Food Depot")}>
                    {__("Produkte suchen", "fcplugin")}
                  </Button>
                </Stack>
              </>
            ) : (
              <CircularProgress />
            )}
          </Stack>
          <div style={{ marginTop: "10px", width: "100%", height: "35px" }}>{validatedData && validatedData.length + " " + __("Produkte gefunden.", "fcplugin")}</div>
          {validationSuccess && <Alert severity="success">{validationSuccess}</Alert>}
          {validationError && <Alert severity="error">{validationError}</Alert>}
        </DialogContent>
        <DialogActions>
          {validationSuccess && (
            <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
              {__("Liste downloaden", "fcplugin")}
            </LoadingButton>
          )}

          <Button
            onClick={() => {
              setValidationError(null)
              setValidationSuccess(null)
              setValidatedData(null)
              setModalClose(false)
            }}
          >
            {__("Schliessen", "fcplugin")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProducerImportProducts
