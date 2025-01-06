import React, { useState, useEffect } from "react"
import axios from "axios"
import SaveIcon from "@mui/icons-material/Save"
import Typography from "@mui/material/Typography"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { format } from "date-fns"
import { useCSVReader } from "react-papaparse"
const __ = wp.i18n.__

const styles = {
  csvReader: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10
  },
  acceptedFile: {
    height: 35,
    width: "100%"
  },
  progressBarBackgroundColor: {
    marginTop: "10px",
    marginBottom: "10px",
    backgroundColor: "gray"
  }
}

function ImportProducts({ setModalClose, categories, reload, setReload }) {
  const [submitting, setSubmitting] = useState(false)
  const { CSVReader } = useCSVReader()
  const [validationError, setValidationError] = useState(null)
  const [validationSuccess, setValidationSuccess] = useState(null)
  const [validatedData, setValidatedData] = useState(null)
  const [bestellrunden, setBestellrunden] = useState()
  const [loading, setLoading] = useState(true)

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
            bestellrundeToDo.bestellrunde_start = format(new Date(b.bestellrunde_start.replace(" ", "T")), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_ende = format(new Date(b.bestellrunde_ende.replace(" ", "T")), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_verteiltag = format(new Date(b.bestellrunde_verteiltag.replace(" ", "T")), "yyyy-MM-dd")
            bestellrundeToDo.date_created = format(new Date(b.date_created.replace(" ", "T")), "yyyy-MM-dd")
            bestellrundeToDo.id = b.id
            reArrangedBestellrunden.push(bestellrundeToDo)
          })
          reArrangedBestellrunden.sort((a, b) => b.id - a.id)
          setBestellrunden(reArrangedBestellrunden)
        }
      })
      .catch(error => console.log(error))
  }, [])

  useEffect(() => {
    if (bestellrunden) {
      let active = false
      bestellrunden.map(bestellrunde => {
        if (new Date(bestellrunde.bestellrunde_start).getTime() <= new Date().getTime() && new Date(bestellrunde.bestellrunde_ende).getTime() >= new Date().getTime()) {
          active = true
        }
      })
      active !== true ? setLoading(false) : setValidationError(__("Während aktiven Bestellrunden können keine Produkte importiert werden.", "fcplugin"))
    }
  }, [bestellrunden])

  function handleSubmit() {
    setSubmitting(true)
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postImportProducts`,
        {
          products: JSON.stringify(validatedData)
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response) {
          let msg = `${__("Import fertiggestellt:", "fcplugin")} ${__("Neu:", "fcplugin")} ${response.data[1]}, ${__("Aktualisiert:", "fcplugin")} ${response.data[0]}, ${__("Gelöscht:", "fcplugin")} ${response.data[2]}`
          setValidationSuccess(msg)
        }
      })
      .catch(error => console.log(error))
      .finally(() => {
        setReload(reload + 1)
        setSubmitting(false)
      })
  }

  return (
    <>
      <Dialog open={true} fullWidth scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle textAlign="left">{__("Produkte importieren", "fcplugin")}</DialogTitle>
        <DialogContent
          sx={{
            paddingTop: "10px",
            minHeight: "300px"
          }}
        >
          <CSVReader
            config={{ delimiter: ";" }}
            onError={error => {
              setValidationError(error.message)
            }}
            onRemoveFile={() => {}}
            onUploadAccepted={results => {
              console.log(results.data)
              /**
               * Validate uploaded products csv file
               */
              let validated = true

              /**
               * 1. Validate Number of Columns
               */
              if (results.data[0].length !== 14) {
                setValidationError(__("Die Datei hat nicht exakt 13 Spalten.", "fcplugin"))
                validated = false
              }

              /**
               * 2. Validate Header names
               */
              if (results.data[0][0] !== "name") {
                setValidationError(__("Spalte 1 muss 'name' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][1] !== "price") {
                setValidationError(__("Spalte 2 muss 'price' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][2] !== "unit") {
                setValidationError(__("Spalte 3 muss 'unit' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][3] !== "lot") {
                setValidationError(__("Spalte 4 muss 'lot' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][4] !== "producer") {
                setValidationError(__("Spalte 5 muss 'producer' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][5] !== "origin") {
                setValidationError(__("Spalte 6 muss 'origin' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][6] !== "category") {
                setValidationError(__("Spalte 7 muss 'category' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][7] !== "id") {
                setValidationError(__("Spalte 8 muss 'id' heissen.", "fcplugin"))
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
              if (results.data[0][11] !== "sku") {
                setValidationError(__("Spalte 12 muss 'sku' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][12] !== "supplier") {
                setValidationError(__("Spalte 13 muss 'supplier' heissen.", "fcplugin"))
                validated = false
              }
              if (results.data[0][13] !== "tax") {
                setValidationError(__("Spalte 14 muss 'tax' heissen.", "fcplugin"))
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
                      if (c !== 8 && c !== 9 && c !== 10 && c !== 11 && c !== 12 && c !== 14) {
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
                setValidationError(__("Zellen dürfen nicht leer sein (ausser 'id' bei neuen Produkten,'short_description', 'image', 'description', 'sku' und 'tax').", "fcplugin") + errors)
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
                  if (isNaN(row[7]) && row[7] !== "") {
                    errors += ` [${__("Zeile", "fcplugin")}: ${r}, ${__("Zelle", "fcplugin")}: 8] `
                    validated = false
                  }
                }

                r++
              })
              if (errors !== "") {
                setValidationError(__("Spalten 'price', 'lot' und 'id' müssen Zahlen sein.", "fcplugin") + errors)
                validated = false
              }

              /**
               * 5. Validate categories
               */
              r = 1
              errors = ""
              results.data.map(row => {
                if (r !== results.data.length && r !== 1) {
                  if (!categories.includes(row[6])) {
                    errors += ` [${__("Zeile", "fcplugin")}: ${r}, ${__("Zelle", "fcplugin")}: 7] `
                    validated = false
                  }
                }

                r++
              })
              if (errors !== "") {
                setValidationError(__("Kategorie stimmt nicht mit den erfassten Kategorien überein.", "fcplugin") + errors)
                validated = false
              }

              /**
               * 6. Validate skus: no identical skus allowed
               */
              r = 1
              errors = ""
              let skus = []
              results.data.map(row => {
                if (r !== results.data.length && r !== 1) {
                  if (row[11] !== "") skus.push(row[11])
                }
                r++
              })
              errors += [...new Set(skus.filter((item, index) => skus.indexOf(item) !== index))]
              console.log(errors)

              if (errors.length !== 0) {
                setValidationError(__("Doppelte Artikelnummern (sku) gefunden. Alle Artikelnummern müssen einzigartig sein:", "fcplugin") + ` ${errors} `)
                validated = false
              }

              /**
               * Validation completed
               */

              if (validated === true) {
                setValidationSuccess(__("Datei wurde geprüft und ist bereit zum Import", "fcplugin"))
                let checkedData = []
                r = 1
                results.data.map(row => {
                  if (r !== results.data.length && r !== 1) {
                    checkedData.push(row)
                  }
                  r++
                })
                setValidatedData(checkedData)
              }
            }}
          >
            {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }) => (
              <>
                <Stack spacing={2} sx={{ width: "100%", paddingTop: "0" }}>
                  <Box sx={{ padding: "10px", backgroundColor: "#f0f0f0" }}>
                    <Typography variant="body2" gutterBottom>
                      {__("Importiere Produkte aus einer CSV Datei.", "fcplugin")}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {__("Für eine Vorlage, exportiere deine aktuelle Produktliste.", "fcplugin")}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {__("Produkte mit identischer ID werden überschrieben.", "fcplugin")}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {__("Produkte, die nicht aktualisiert werden, werden gelöscht.", "fcplugin")}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {__("Produktkategorien können unter Produkte > Kategorien erstellt und editiert werden.", "fcplugin")}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" type="button" {...getRootProps()} disabled={loading}>
                      {__("CSV Datei wählen", "fcplugin")}
                    </Button>
                    <Button
                      variant="contained"
                      {...getRemoveFileProps()}
                      onClick={event => {
                        getRemoveFileProps().onClick(event)
                        setValidationError(null)
                        setValidationSuccess(null)
                        setValidatedData(null)
                      }}
                    >
                      {__("Datei entfernen", "fcplugin")}
                    </Button>
                  </Stack>
                  <div style={styles.acceptedFile}>{acceptedFile && acceptedFile.name}</div>
                </Stack>
                <ProgressBar style={styles.progressBarBackgroundColor} />
              </>
            )}
          </CSVReader>
          {validationSuccess && <Alert severity="success">{validationSuccess}</Alert>}
          {validationError && <Alert severity="error">{validationError}</Alert>}
        </DialogContent>
        <DialogActions>
          {validationSuccess && (
            <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting}>
              {__("Importieren", "fcplugin")}
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

export default ImportProducts
