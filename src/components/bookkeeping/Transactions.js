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

const Transactions = () => {
  const [loading, setLoading] = useState(true)
  const [allTransactions, setAllTransactions] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [users, setUsers] = useState(null)
  const [totalBalance, setTotalBalance] = useState(null)
  const [selectedWallet, setSelectedWallet] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)

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
          setWalletData(res)
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
   * Calculate the total balance of all users
   * Handle loading state
   */
  useEffect(() => {
    if (walletData && users) {
      setLoading(false)

      let totalBalance = 0
      users.map(user => {
        totalBalance += parseFloat(user.balance)
      })

      setTotalBalance(totalBalance)
    }
  }, [walletData, users])

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
   * Change table to only the transactions of selected user's wallet
   */
  const handleChange = event => {
    setSelectedWallet(event.target.value)
    users.map(user => {
      if (event.target.value === user.id) {
        setSelectedUser(user)
      }
    })
  }

  useEffect(() => {
    if (selectedWallet !== 0) {
      let newWalletData = []
      allTransactions.map(row => {
        if (parseInt(row.user_id) === parseInt(selectedWallet)) {
          newWalletData.push(row)
        }
      })
      setWalletData(newWalletData)
    } else {
      setWalletData(allTransactions)
    }
  }, [selectedWallet])

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
        initialState={{ density: "compact" }}
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "nowrap", flexDirection: "row", justifyContent: "flex-start" }}>
              {users && (
                <FormControl size="small">
                  <InputLabel>{__("Mitglied", "fcplugin")}</InputLabel>
                  <Select value={selectedWallet} label={__("Mitglied", "fcplugin")} onChange={handleChange}>
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
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "nowrap", flexDirection: "row", justifyContent: "flex-start" }}>
              {selectedUser && (
                <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", borderRadius: "4px" }}>
                  <strong>
                    {__("Guthaben von", "fcplugin")} {selectedUser.name}: {parseFloat(selectedUser.balance).toFixed(2)}
                  </strong>
                </Typography>
              )}
              <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", borderRadius: "4px" }}>
                <strong>
                  {__("Guthaben aller Mitglieder", "fcplugin")}: {totalBalance ? parseFloat(totalBalance).toFixed(2) : "0.00"}
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
