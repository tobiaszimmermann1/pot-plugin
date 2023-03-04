import React, { useState, useEffect, useMemo, useRef } from "react"
import { Box, Button, Typography, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, CircularProgress, Stack, TextField, Tooltip } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import axios from "axios"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { ExportToCsv } from "export-to-csv"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import { format, isValid, parse } from "date-fns"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import AddIcon from "@mui/icons-material/Add"
import SaveIcon from "@mui/icons-material/Save"
const __ = wp.i18n.__

const Expenses = () => {
  const [loading, setLoading] = useState(true)
  const [allExpenses, setAllExpenses] = useState(null)
  const [expenseData, setExpenseData] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  /**
   * get expenses
   */
  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getExpenses`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setExpenseData(res)
          setAllExpenses(res)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Calculate the total expenses
   * Handle loading state
   */
  useEffect(() => {
    if (expenseData) {
      setLoading(false)
    }
  }, [expenseData])

  /**
   * Transactions Table
   */
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: __("Nummer", "fcplugin")
      },
      {
        accessorKey: "created_by",
        header: __("Erstellt von", "fcplugin")
      },
      {
        accessorKey: "date",
        header: __("Datum", "fcplugin"),
        Cell: ({ cell }) => format(new Date(cell.getValue()), "dd.MM.yyyy")
      },
      {
        accessorKey: "type",
        header: __("type", "fcplugin")
      },
      {
        accessorKey: "amount",
        header: __("Betrag", "fcplugin"),
        Cell: ({ cell }) => parseFloat(cell.getValue()).toFixed(2)
      },
      {
        accessorKey: "note",
        header: __("Details", "fcplugin")
      }
    ],
    []
  )

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
    filename: "foodcoop-expenses-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleExportData = () => {
    csvExporter.generateCsv(expenseData)
  }

  /**
   * Change table to only the transactions of selected type
   */
  const handleChange = event => {
    setSelectedType(event.target.value)
  }

  useEffect(() => {
    if (selectedType !== null) {
      let newExpenseData = []
      allExpenses.map(row => {
        if (parseInt(row.type) === parseInt(selectedType)) {
          newExpenseData.push(row)
        }
      })
      setExpenseData(newExpenseData)
    } else {
      setExpenseData(allExpenses)
    }
  }, [selectedType])

  /**
   * Create New Expense Logic
   */
  const handleCreateNewRow = values => {
    expenseData.unshift(values)
    setExpenseData([...expenseData])
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={expenseData ?? []}
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
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "nowrap", flexDirection: "row", justifyContent: "flex-start" }}>
              <Button
                color="primary"
                //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
                variant="outlined"
                size="small"
                disabled={loading}
              >
                {__("Ansicht exportieren", "fcplugin")}
              </Button>
              <Button size="small" onClick={() => setCreateModalOpen(true)} variant="outlined" disabled={loading} startIcon={<AddIcon />}>
                {__("Neue Ausgabe", "fcplugin")}
              </Button>
            </Box>
          </Box>
        )}
      />
      <CreateNewExpenseModal columns={columns} open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateNewRow} />
    </>
  )
}

export default Expenses

/**
 * Modal: Craete new Expense
 */
export const CreateNewExpenseModal = ({ open, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false)
  const [type, setType] = useState("Lieferantenrechnung")
  const [amount, setAmount] = useState(null)
  const [note, setNote] = useState(null)
  const [date, setDate] = useState(format(new Date(), "dd.MM.yyyy"))

  const handleSubmit = () => {
    const isValidDate = isValid(date)

    if (isValidDate) {
      setSubmitting(true)
      let values = {}

      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postCreateExpense`,
          {
            date: format(new Date(date), "yyyy-MM-dd"),
            created_by: appLocalizer.currentUser.data.ID,
            type: type,
            amount: amount,
            note: note
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response.status == 200) {
            values["id"] = response.data
            values["date"] = format(new Date(date), "yyyy-MM-dd")
            values["type"] = type
            values["amount"] = amount
            values["note"] = note
            values["created_by"] = appLocalizer.currentUser.data.ID
            onSubmit(values)
            setSubmitting(false)
            onClose()
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          setType(null)
          setAmount(null)
          setNote(null)
          setDate(null)
        })
    } else {
      alert(__("Datumformat ist ungültig", "fcplugin"))
    }
  }

  /**
   * Change table to only the transactions of selected user's wallet
   */
  const handleChangeType = event => {
    setType(event.target.value)
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{__("Ausgabe hinzufügen", "fcplugin")}</DialogTitle>
      <DialogContent>
        <form onSubmit={e => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              paddingTop: "10px"
            }}
          >
            <div className="modalRow">
              <span>
                {__("Erstellt von Mitglied", "fcplugin")}: {appLocalizer.currentUser.data.ID}
              </span>
            </div>
            <div className="modalRow">
              <span>{__("Typ", "fcplugin")}</span>
              <FormControl size="small" fullWidth>
                <Select value={type} onChange={handleChangeType}>
                  <MenuItem key={"Lieferantenrechnung"} value={"Lieferantenrechnung"}>
                    {__("Lieferantenrechnung", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Dienstleistung"} value={"Dienstleistung"}>
                    {__("Dienstleistung", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Spesen"} value={"Spesen"}>
                    {__("Spesen", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Transport"} value={"Transport"}>
                    {__("Transport", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Miete"} value={"Miete"}>
                    {__("Miete", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Verpackungsmaterial"} value={"Verpackungsmaterial"}>
                    {__("Verpackungsmaterial", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Büromaterial"} value={"Büromaterial"}>
                    {__("Büromaterial", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Spende"} value={"Spende"}>
                    {__("Spende", "fcplugin")}
                  </MenuItem>
                  <MenuItem key={"Sonstiges"} value={"Sonstiges"}>
                    {__("Sonstiges", "fcplugin")}
                  </MenuItem>
                </Select>
              </FormControl>{" "}
            </div>
            <div className="modalRow">
              <span>{__("Datum", "fcplugin")}</span>
              <DesktopDatePicker label="" className="bestellrundeDatePicker" inputFormat="dd.MM.yyyy" value={date} onChange={e => setDate(e)} renderInput={params => <TextField {...params} />} />
            </div>
            <div className="modalRow">
              <span>{__("Betrag", "fcplugin")}</span>
              <TextField label="" variant="outlined" size="small" fullWidth type="number" inputProps={{ min: 0 }} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="modalRow">
              <span>{__("Details", "fcplugin")}</span>
              <TextField label="" variant="outlined" size="small" fullWidth onChange={e => setNote(e.target.value)} />
            </div>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={onClose}>{__("Abbrechen", "fcplugin")}</Button>
        <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
          {__("Hinzufügen", "fcplugin")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
