import React, { useState, useEffect, useMemo } from "react"
import { Box, Typography, Button, TextField } from "@mui/material"
import axios from "axios"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { ExportToCsv } from "export-to-csv"
import { format, isValid, parse } from "date-fns"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
const __ = wp.i18n.__

const Journal = () => {
  const [loading, setLoading] = useState(true)
  const [allTransactions, setAllTransactions] = useState(null)
  const [allExpenses, setAllExpenses] = useState(null)
  const [allData, setAllData] = useState(null)
  const [data, setData] = useState(null)
  const [dateStart, setDateStart] = useState(null)
  const [dateEnd, setDateEnd] = useState(null)
  const [totalPlus, setTotalPlus] = useState(0)
  const [totalMinus, setTotalMinus] = useState(0)

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
        theTransaction["details"] = __("Mitglied", "fcplugin") + ": " + transaction.user_id + " (" + transaction.user_name + ") - " + transaction.details
        transaction.amount >= 0 ? (theTransaction["plus"] = transaction.amount) : (theTransaction["minus"] = -1 * transaction.amount)
        journalData.push(theTransaction)
      })

      allExpenses.map(expense => {
        let theExpense = {}
        theExpense["type"] = __("Ausgabe", "fcplugin")
        theExpense["id"] = expense.id
        theExpense["date"] = format(new Date(expense.date), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        theExpense["details"] = expense.type + " (" + expense.note + ") " + __("erstellt von Mitglied", "fcplugin") + ": " + expense.created_by
        expense.amount <= 0 ? (theExpense["plus"] = -1 * expense.amount) : (theExpense["minus"] = expense.amount)

        journalData.push(theExpense)
      })

      journalData.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      setData(journalData)
      setAllData(journalData)
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
        accessorKey: "plus",
        header: __("Einnahmen", "fcplugin"),
        size: 40,
        Cell: ({ cell }) => (cell.getValue() ? <div style={{ width: "80%", textAlign: "right", color: "green" }}>{parseFloat(cell.getValue()).toFixed(2)}</div> : "")
      },
      {
        accessorKey: "minus",
        header: __("Ausgaben", "fcplugin"),
        size: 40,
        Cell: ({ cell }) => (cell.getValue() ? <div style={{ width: "80%", textAlign: "right", color: "red" }}>{parseFloat(cell.getValue()).toFixed(2)}</div> : "")
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
    csvExporter.generateCsv(data)
  }

  /**
   * Date Range Logic
   */
  useEffect(() => {
    if (dateStart && dateEnd && allData && data) {
      const isValidDateStart = isValid(parse(format(new Date(dateStart), "yyyy-MM-dd"), "yyyy-MM-dd", new Date()))
      const isValidDateEnd = isValid(parse(format(new Date(dateEnd), "yyyy-MM-dd"), "yyyy-MM-dd", new Date()))
      if (isValidDateEnd && isValidDateStart) {
        let dataWithinDateRange = []
        const timeStart = new Date(format(new Date(dateStart), "yyyy-MM-dd'T'HH:mm:ss'Z'")).getTime()
        const timeEnd = new Date(format(new Date(dateEnd), "yyyy-MM-dd'T'HH:mm:ss'Z'")).getTime()
        allData.map(row => {
          const timeRow = new Date(format(new Date(row.date), "yyyy-MM-dd'T'HH:mm:ss'Z'")).getTime()
          if (timeStart <= timeRow && timeRow <= timeEnd) {
            dataWithinDateRange.push(row)
          }
        })
        setData(dataWithinDateRange)
      }
    }
  }, [dateStart, dateEnd])

  useEffect(() => {
    if (data) {
      let newPlus = 0
      let newMinus = 0
      data.map(row => {
        if (parseFloat(row.plus)) {
          newPlus += parseFloat(row.plus)
        }
        if (parseFloat(row.minus)) {
          newMinus += parseFloat(row.minus)
        }
      })
      setTotalPlus(newPlus)
      setTotalMinus(newMinus)
    }
  }, [data])

  function resetData() {
    setData(allData)
    setDateStart(null)
    setDateEnd(null)
  }

  return (
    <>
      <Typography sx={{ fontStyle: "italic", p: "0 1rem", color: "red" }} variant="body2">
        Das Milchbüechli ist noch im experimentellen Stadium!!
      </Typography>
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
              <DesktopDatePicker label={__("Eingrenzen von", "fcplugin")} className="fc_datepicker" inputFormat="dd.MM.yyyy" value={dateStart} onChange={e => setDateStart(e)} renderInput={params => <TextField {...params} />} />
              <DesktopDatePicker label={__("Eingrenzen bis", "fcplugin")} className="fc_datepicker" inputFormat="dd.MM.yyyy" value={dateEnd} onChange={e => setDateEnd(e)} renderInput={params => <TextField {...params} />} />
              <Button color="primary" onClick={resetData} startIcon={<RestartAltIcon />} variant="outlined" size="small" disabled={loading}>
                {__("Zurücksetzen", "fcplugin")}
              </Button>
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
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "nowrap", flexDirection: "row", justifyContent: "flex-start" }}>
              {totalPlus ? (
                <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", color: "green", borderRadius: "4px" }}>
                  {__("Einnahmen", "fcplugin")}: <strong>{parseFloat(totalPlus).toFixed(2)}</strong>
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", color: "green", borderRadius: "4px" }}>
                  {__("Einnahmen", "fcplugin")}: <strong>0.00</strong>
                </Typography>
              )}
              {totalMinus ? (
                <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", color: "red", borderRadius: "4px" }}>
                  {__("Ausgaben", "fcplugin")}: <strong>{parseFloat(totalMinus).toFixed(2)}</strong>
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", color: "red", borderRadius: "4px" }}>
                  {__("Ausgaben", "fcplugin")}: <strong>0.00</strong>
                </Typography>
              )}
            </Box>
          </Box>
        )}
      />
    </>
  )
}

export default Journal
