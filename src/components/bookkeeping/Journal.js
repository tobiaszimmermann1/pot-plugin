import React, { useState, useEffect, useMemo, useRef } from "react"
import { Box, Typography, Button } from "@mui/material"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import axios from "axios"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { ExportToCsv } from "export-to-csv"
import { format } from "date-fns"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
const __ = wp.i18n.__

const Journal = () => {
  const [loading, setLoading] = useState(true)
  const [allTransactions, setAllTransactions] = useState(null)
  const [allExpenses, setAllExpenses] = useState(null)
  const [data, setData] = useState(null)

  /**
   * get transactions
   */
  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getAllTransactions`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setAllTransactions(res)
        }
      })
      .catch(error => console.log(error))
  }, [])

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
          setAllExpenses(res)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Handle loading state
   * Restructure data for table
   */
  useEffect(() => {
    if (allTransactions && allExpenses) {
      let journalData = []
      allTransactions.map(transaction => {
        let theTransaction = {}
        theTransaction["type"] = __("Guthaben Transaktion", "fcplugin")
        theTransaction["id"] = transaction.id
        theTransaction["date"] = format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        theTransaction["amount"] = transaction.amount
        theTransaction["details"] = __("Mitglied", "fcplugin") + ": " + transaction.user_id + " (" + transaction.user_name + ") - " + transaction.details
        journalData.push(theTransaction)
      })

      allExpenses.map(expense => {
        let theExpense = {}
        theExpense["type"] = __("Ausgabe", "fcplugin")
        theExpense["id"] = expense.id
        theExpense["date"] = format(new Date(expense.date), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        theExpense["amount"] = expense.amount
        theExpense["details"] = expense.type + " (" + expense.note + ") " + __("erstellt von Mitglied", "fcplugin") + ": " + expense.created_by
        journalData.push(theExpense)
      })

      journalData.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      setData(journalData)
      setLoading(false)
    }
  }, [allTransactions, allExpenses])

  /**
   * Transactions Table
   */
  const columns = useMemo(
    () => [
      {
        accessorKey: "type",
        header: __("Typ", "fcplugin")
      },
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
        header: __("Betrag", "fcplugin"),
        Cell: ({ cell }) => (parseFloat(cell.getValue()) < 0 ? <span style={{ color: "red" }}>{parseFloat(cell.getValue()).toFixed(2)}</span> : <span style={{ color: "green" }}>{parseFloat(cell.getValue()).toFixed(2)}</span>)
      },
      {
        accessorKey: "details",
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
    filename: "foodcoop-journal-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleExportData = () => {
    csvExporter.generateCsv(allTransactions)
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data ?? []}
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
            </Box>
          </Box>
        )}
      />
    </>
  )
}

export default Journal
