import React, { useState, useEffect, useMemo } from "react"
import { Box, Typography, Button, TextField } from "@mui/material"
import axios from "axios"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { ExportToCsv } from "export-to-csv"
import { endOfDay, format, isValid, startOfDay } from "date-fns"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
const __ = wp.i18n.__

const getTransactionTime = transaction => new Date(transaction.date.replace(" ", "T")).getTime()
const hasValidDate = date => date && isValid(new Date(date))
const getBalanceAtTime = (currentBalance, transactions, balanceEndTime, userIds) => {
  if (balanceEndTime === null || !transactions) {
    return currentBalance
  }

  const laterTransactions = transactions.reduce((total, transaction) => {
    const isIncludedUser = !userIds || userIds.has(parseInt(transaction.user_id))

    if (isIncludedUser && getTransactionTime(transaction) > balanceEndTime) {
      const amount = parseFloat(transaction.amount)
      return total + (Number.isFinite(amount) ? amount : 0)
    }

    return total
  }, 0)

  return currentBalance - laterTransactions
}

const Transactions = () => {
  const [loading, setLoading] = useState(true)
  const [allTransactions, setAllTransactions] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [users, setUsers] = useState(null)
  const [selectedWallet, setSelectedWallet] = useState(0)
  const [dateStart, setDateStart] = useState(null)
  const [dateEnd, setDateEnd] = useState(null)

  /**
   * get wallet of user
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
   * get list of users
   */
  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getUsers`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          let reArrangedUserData = []
          res.map(u => {
            let userToDo = {}
            userToDo.name = u.name
            userToDo.email = u.email
            userToDo.address = u.address
            userToDo.balance = u.balance
            userToDo.role = u.role
            userToDo.id = u.id

            reArrangedUserData.push(userToDo)
          })
          setUsers(reArrangedUserData)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Handle loading state
   */
  useEffect(() => {
    if (walletData && users) {
      setLoading(false)
    }
  }, [walletData, users])

  const selectedUser = useMemo(() => {
    if (!users || selectedWallet === 0) {
      return null
    }

    return users.find(user => parseInt(user.id) === parseInt(selectedWallet)) ?? null
  }, [selectedWallet, users])

  const balanceEndTime = hasValidDate(dateEnd) ? endOfDay(new Date(dateEnd)).getTime() : null

  const totalBalance = useMemo(() => {
    if (!users) {
      return 0
    }

    const userIds = new Set(users.map(user => parseInt(user.id)))
    const currentBalance = users.reduce((total, user) => {
      const balance = parseFloat(user.balance)
      return total + (Number.isFinite(balance) ? balance : 0)
    }, 0)

    return getBalanceAtTime(currentBalance, allTransactions, balanceEndTime, userIds)
  }, [allTransactions, balanceEndTime, users])

  const selectedUserBalance = useMemo(() => {
    if (!selectedUser) {
      return 0
    }

    const currentBalance = parseFloat(selectedUser.balance)
    const userIds = new Set([parseInt(selectedUser.id)])
    return getBalanceAtTime(Number.isFinite(currentBalance) ? currentBalance : 0, allTransactions, balanceEndTime, userIds)
  }, [allTransactions, balanceEndTime, selectedUser])

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
        accessorKey: "user_name",
        header: __("Mitglied", "fcplugin")
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
    filename: "foodcoop-transactions-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleExportData = () => {
    csvExporter.generateCsv(walletData)
  }

  /**
   * Filter transactions by member and the inclusive calendar date range.
   */
  useEffect(() => {
    if (!allTransactions) {
      return
    }

    const timeStart = hasValidDate(dateStart) ? startOfDay(new Date(dateStart)).getTime() : null
    const timeEnd = hasValidDate(dateEnd) ? endOfDay(new Date(dateEnd)).getTime() : null

    if (timeStart !== null && timeEnd !== null && timeStart > timeEnd) {
      setWalletData([])
      return
    }

    const filteredTransactions = allTransactions.filter(transaction => {
      const isSelectedUser = selectedWallet === 0 || parseInt(transaction.user_id) === parseInt(selectedWallet)
      const transactionTime = getTransactionTime(transaction)
      const isAfterStart = timeStart === null || transactionTime >= timeStart
      const isBeforeEnd = timeEnd === null || transactionTime <= timeEnd

      return isSelectedUser && isAfterStart && isBeforeEnd
    })

    setWalletData(filteredTransactions)
  }, [allTransactions, dateEnd, dateStart, selectedWallet])

  const resetDateRange = () => {
    setDateStart(null)
    setDateEnd(null)
  }

  const balanceDateLabel = balanceEndTime !== null ? ` (${format(new Date(balanceEndTime), "dd.MM.yyyy")})` : ""

  return (
    <>
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
        initialState={{ density: "compact", pagination: { pageSize: 25 } }}
        renderTopToolbarCustomActions={() => (
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", flexDirection: "row", justifyContent: "flex-start" }}>
              <DesktopDatePicker
                label={__("Eingrenzen von", "fcplugin")}
                className="fc_datepicker"
                inputFormat="dd.MM.yyyy"
                value={dateStart}
                maxDate={hasValidDate(dateEnd) ? dateEnd : undefined}
                onChange={setDateStart}
                renderInput={params => <TextField {...params} size="small" />}
              />
              <DesktopDatePicker
                label={__("Eingrenzen bis", "fcplugin")}
                className="fc_datepicker"
                inputFormat="dd.MM.yyyy"
                value={dateEnd}
                minDate={hasValidDate(dateStart) ? dateStart : undefined}
                onChange={setDateEnd}
                renderInput={params => <TextField {...params} size="small" />}
              />
              <Button color="primary" onClick={resetDateRange} startIcon={<RestartAltIcon />} variant="outlined" size="small" disabled={loading || (!dateStart && !dateEnd)}>
                {__("Zurücksetzen", "fcplugin")}
              </Button>
              {users && (
                <FormControl size="small">
                  <InputLabel>{__("Mitglied", "fcplugin")}</InputLabel>
                  <Select value={selectedWallet} label={__("Mitglied", "fcplugin")} onChange={event => setSelectedWallet(event.target.value)}>
                    <MenuItem key={0} value={0}>
                      {__("Alle Mitglieder", "fcplugin")}
                    </MenuItem>
                    {users.map(
                      user =>
                        user.name !== " " && (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        )
                    )}
                  </Select>
                </FormControl>
              )}
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
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", flexDirection: "row", justifyContent: "flex-start" }}>
              {selectedUser && (
                <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", borderRadius: "4px" }}>
                  <strong>
                    {__("Guthaben von", "fcplugin")} {selectedUser.name}
                    {balanceDateLabel}: {selectedUserBalance.toFixed(2)}
                  </strong>
                </Typography>
              )}
              <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", borderRadius: "4px" }}>
                <strong>
                  {__("Guthaben aller Mitglieder", "fcplugin")}
                  {balanceDateLabel}: {totalBalance.toFixed(2)}
                </strong>
              </Typography>
            </Box>
          </Box>
        )}
      />
    </>
  )
}

export default Transactions
