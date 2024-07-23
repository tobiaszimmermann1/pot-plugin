import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import SaveIcon from "@mui/icons-material/Save"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import { ExportToCsv } from "export-to-csv"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { format, parse } from "date-fns"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import CheckIcon from "@mui/icons-material/Check"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputAdornment from "@mui/material/InputAdornment"
import { isSameYear } from "date-fns"
const __ = wp.i18n.__

function Wallet({ setModalClose, walletID, walletName }) {
  const [hasPaidFee, setHasPaidFee] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState()
  const [amount, setAmount] = useState("")
  const [details, setDetails] = useState("")
  const [transactionType, setTransactionType] = useState("")
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState()
  const [newTransaction, setNewTransaction] = useState(false)

  const handleSubmit = () => {
    setSubmitting(true)

    if (amount.trim() === "" || details.trim() === "" || transactionType.trim() === "") {
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
            date: new Date(),
            type: transactionType
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
              created_by: res[5],
              id: res[2],
              type: res[6]
            })

            setAmount("")
            setDetails("")
            setTransactionType("")
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
          date: new Date(),
          type: "yearly_fee"
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
            created_by: res[5],
            id: res[2],
            type: "yearly_fee"
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
        Cell: ({ cell }) => format(new Date(cell.getValue().replace(" ", "T")), "dd.MM.yyyy - HH:mm")
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
        accessorKey: "type",
        header: __("Transaktionsart", "fcplugin"),
        filterVariant: "select",
        filterFn: "equals",
        filterSelectOptions: [
          { value: "manual_transaction", text: "Manuelle Transaktion" },
          { value: "mutation", text: "Mutation" },
          { value: "deposit", text: "Einzahlung" },
          { value: "yearly_fee", text: "Jahresbeitrag" },
          { value: "order", text: "Bestellung" }
        ],
        Cell: ({ cell }) => {
          if (cell.getValue() === "manual_transaction") return __("Manuelle Transaktion", "fcplugin")
          if (cell.getValue() === "mutation") return __("Mutation", "fcplugin")
          if (cell.getValue() === "deposit") return __("Einzahlung", "fcplugin")
          if (cell.getValue() === "yearly_fee") return __("Jahresbeitrag", "fcplugin")
          if (cell.getValue() === "order") return __("Bestellung", "fcplugin")
        }
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

  useEffect(() => {
    if (walletData) {
      walletData.map(res => {
        if (res.type === "yearly_fee") {
          if (isSameYear(new Date(res.date), new Date())) {
            setHasPaidFee(true)
          }
        }
      })
    }
  }, [walletData])

  function handleTransactionTypeChange(e) {
    console.log(e.target.value)
    setTransactionType(e.target.value)
  }

  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Wallet von", "fcplugin")} {walletName}
            </DialogTitle>
            <IconButton edge="start" color="inherit" onClick={() => setModalClose(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent
          dividers={scroll === "paper"}
          sx={{
            paddingTop: "20px",
            minHeight: "500px"
          }}
        >
          <Stack spacing={3}>
            {newTransaction && (
              <Box sx={{ padding: "5px 20px 5px 20px", backgroundColor: "#f9f9f9", border: "1px solid #ccc" }}>
                <Stack spacing={2} sx={{ width: "100%", paddingTop: "10px" }}>
                  <Typography variant="body2" gutterBottom>
                    {__("Neue Transaktion:", "fcplugin")}
                  </Typography>
                  <FormControl size="normal" fullWidth>
                    <InputLabel id="transaction-type">{__("Transaktionsart", "fcplugin")}</InputLabel>
                    <Select labelId="transaction-type" id="transaction-type-selector" value={transactionType} label="Transaktionsart" onChange={handleTransactionTypeChange}>
                      <MenuItem key={"deposit"} value={"deposit"}>
                        {__("Einzahlung", "fcplugin")}
                      </MenuItem>
                      <MenuItem key={"manual_transaction"} value={"manual_transaction"}>
                        {__("Manuelle Transaktion", "fcplugin")}
                      </MenuItem>
                      <MenuItem key={"yearly_fee"} value={"yearly_fee"}>
                        {__("Jahresbeitrag", "fcplugin")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="normal"
                    id="amount"
                    label={__("Betrag", "fcplugin")}
                    name="amount"
                    variant="outlined"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">CHF</InputAdornment>
                    }}
                    placeholder="0"
                    helperText={__("Vorzeichen beachten! Positive Beträge werden addiert - Negative werden subtrahiert.", "fcplugin")}
                  />
                  <TextField size="normal" id="details" label={__("Details", "fcplugin")} name="details" variant="outlined" value={details} onChange={e => setDetails(e.target.value)} />
                  {error && <Alert severity="error">{error}</Alert>}
                  <DialogActions>
                    <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} disabled={submitting} size="large">
                      {__("Transaktion speichern", "fcplugin")}
                    </LoadingButton>
                    <Button onClick={() => setNewTransaction(false)} variant="text" disabled={submitting} size="large">
                      {__("Abbrechen", "fcplugin")}
                    </Button>
                  </DialogActions>
                </Stack>
              </Box>
            )}
            <MaterialReactTable
              columns={columns}
              data={walletData || []}
              state={{ isLoading: loading }}
              localization={MRT_Localization_DE}
              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  border: "1px solid #ccc"
                }
              }}
              enableFullScreenToggle={false}
              initialState={{ density: "compact", pagination: { pageSize: 25 } }}
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
                  <Button
                    color="primary"
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                    onClick={() => setNewTransaction(true)}
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    disabled={loading}
                  >
                    {__("Neue Transaktion für", "fcplugin")} {walletName}
                  </Button>
                  {hasPaidFee ? (
                    <Button variant="text" color="success" startIcon={<CheckIcon />}>
                      {__("Jahresbeitrag", "fcplugin")} {format(new Date(), "yyyy")} {__("bezahlt", "fcplugin")}
                    </Button>
                  ) : (
                    <LoadingButton onClick={handleYearlyFeeTransaction} variant="outlined" loading={submitting} loadingPosition="start" startIcon={<CalendarTodayIcon />} disabled={submitting} size="small">
                      {__("Jahresbeitrag", "fcplugin")} {new Date().getFullYear()} {__("für", "fcplugin")} {walletName} {__("belasten", "fcplugin")}
                    </LoadingButton>
                  )}
                </Box>
              )}
            />
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Wallet
