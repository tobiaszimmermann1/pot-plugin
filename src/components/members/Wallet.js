import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import SaveIcon from "@mui/icons-material/Save"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import { ExportToCsv } from "export-to-csv"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { format } from "date-fns"
const __ = wp.i18n.__

function Wallet({ setModalClose, walletID, walletName }) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState()
  const [amount, setAmount] = useState(0)
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState()

  const handleSubmit = () => {
    setSubmitting(true)

    if (amount === 0 || details.trim() === "") {
      setError(__("Felder dürfen nicht leer sein.", "fcplugin"))
      setSubmitting(false)
    } else {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postAddTransaction`,
          {
            amount: amount,
            user: walletID,
            details: details,
            created_by: appLocalizer.currentUser.ID,
            date: new Date()
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response.data) {
            const res = JSON.parse(response.data)

            handleAddTransaction({
              date: format(new Date(), "yyyy-MM-dd"),
              amount: res[3],
              balance: res[0],
              details: res[4],
              created_by: res[1],
              id: res[2]
            })
          }
        })
        .catch(error => setError(error.message))
        .finally(() => {
          setSubmitting(false)
        })
    }
  }

  /**
   * yearly fee transaction
   */
  const handleYearlyFeeTransaction = () => {
    setSubmitting(true)
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postAddTransaction`,
        {
          amount: "jahresbeitrag",
          user: walletID,
          details: __("Jahresbeitrag ", "fcplugin") + " " + new Date().getFullYear(),
          created_by: appLocalizer.currentUser.ID,
          date: new Date()
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)

          handleAddTransaction({
            date: format(new Date(), "yyyy-MM-dd"),
            amount: res[3],
            balance: res[0],
            details: res[4],
            created_by: res[1],
            id: res[2]
          })
        }
      })
      .catch(error => setError(error.message))
      .finally(() => {
        setSubmitting(false)
      })
  }

  /**
   * get wallet of user
   */
  useEffect(() => {
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/getTransactions`,
        {
          id: walletID
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)
          setWalletData(res)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Transactions Table
   */
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: __("Transaktionsnummer", "fcplugin")
      },
      {
        accessorKey: "date",
        header: __("Datum", "fcplugin"),
        Cell: ({ cell }) => format(new Date(cell.getValue()), "dd.MM.yyyy")
      },
      {
        accessorKey: "amount",
        header: __("Betrag", "fcplugin")
      },
      {
        accessorKey: "balance",
        header: __("Neues Guthaben", "fcplugin")
      },
      {
        accessorKey: "created_by",
        header: __("Erstellt von", "fcplugin")
      },
      {
        accessorKey: "details",
        header: __("Details", "fcplugin")
      }
    ],
    []
  )

  const handleAddTransaction = values => {
    walletData.unshift(values)
    setWalletData([...walletData])
  }

  /**
   * Export to CSV
   */
  const csvOptions = {
    fieldSeparator: ";",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: true,
    filename: "foodcoop-wallet-" + walletName + "-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleExportData = () => {
    csvExporter.generateCsv(walletData)
  }

  return (
    <>
      <Dialog open={true} maxWidth="lg" fullWidth scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle textAlign="left">
          {__("Wallet von", "fcplugin")} {walletName}
        </DialogTitle>
        <DialogContent
          sx={{
            paddingTop: "10px",
            minHeight: "500px"
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ padding: "5px 20px 5px 20px", backgroundColor: "#f9f9f9", border: "1px solid #ccc" }}>
              <Stack spacing={1} sx={{ width: "100%", paddingTop: "10px" }}>
                <Typography variant="body2" gutterBottom>
                  {__("Neue Transaktion hinzufügen:", "fcplugin")}
                </Typography>
                <TextField size="small" id="amount" label={__("Betrag", "fcplugin")} name="amount" variant="outlined" value={amount} onChange={e => setAmount(e.target.value)} type="number" />
                <TextField size="small" id="details" label={__("Details", "fcplugin")} name="details" variant="outlined" value={details} onChange={e => setDetails(e.target.value)} />

                {error && <Alert severity="error">{error}</Alert>}
                <DialogActions>
                  <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting} size="small">
                    {__("Transaktion hinzufügen", "fcplugin")}
                  </LoadingButton>
                  <LoadingButton onClick={handleYearlyFeeTransaction} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting} size="small" color="warning">
                    {__("Jahresbeitrag", "fcplugin")} {new Date().getFullYear()} {__("belasten", "fcplugin")}
                  </LoadingButton>
                </DialogActions>
              </Stack>
            </Box>
            <MaterialReactTable
              columns={columns}
              data={walletData ?? []}
              state={{ isLoading: loading }}
              localization={MRT_Localization_DE}
              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  border: "1px solid #ccc"
                }
              }}
              enableFullScreenToggle={false}
              initialState={{ density: "compact" }}
              renderTopToolbarCustomActions={({ table }) => (
                <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap" }}>
                  <Button
                    color="primary"
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                    onClick={handleExportData}
                    startIcon={<FileDownloadIcon />}
                    variant="outlined"
                    size="small"
                    disabled={loading}
                  >
                    {__("Exportieren", "fcplugin")}
                  </Button>
                </Box>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
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

export default Wallet
