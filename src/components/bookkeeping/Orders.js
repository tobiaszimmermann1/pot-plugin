import React, { useState, useEffect, useMemo } from "react"
import { Box, Typography, Button } from "@mui/material"
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

const Orders = () => {
  const [orders, setOrders] = useState()
  const [loading, setLoading] = useState(true)
  const [allOrders, setAllOrders] = useState(null)
  const [users, setUsers] = useState(null)
  const [totalBalance, setTotalBalance] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserTotal, setSelectedUserTotal] = useState(0)
  const [bestellrunden, setBestellrunden] = useState(null)
  const [selectedBestellrunde, setSelectedBestellrunde] = useState(0)
  const [selectedBestellrundeTotal, setSelectedBestellrundeTotal] = useState(null)

  /**
   * Orders Table
   */

  const columns = useMemo(
    () => [
      {
        accessorFn: row => (
          <a href={`${row.url}`} target="blank">
            {row.id}
          </a>
        ),
        id: "id",
        header: __("Bestellung", "fcplugin"),
        size: 50
      },
      {
        accessorKey: "date_created",
        header: __("Datum", "fcplugin"),
        size: 80,
        Cell: ({ cell }) => format(new Date(cell.getValue().replace(" ", "T")), "dd.MM.yyyy")
      },
      {
        accessorKey: "customer_name",
        header: __("Mitglied", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "bestellrunde_id",
        header: __("Bestellrunde", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "total",
        header: __("Total", "fcplugin"),
        size: 80,
        Cell: ({ cell }) => parseFloat(cell.getValue()).toFixed(2)
      }
    ],
    []
  )

  /**
   * Get all orders
   */

  useEffect(() => {
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/getAllOrders`,
        {
          year: null
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

          let ordersReArranged = []
          res.map(order => {
            let theOrder = {}
            theOrder["id"] = order.id
            theOrder["date_created"] = order.date_created.date
            theOrder["customer_name"] = order.billing.first_name + " " + order.billing.last_name
            // bestellrunde id
            order.meta_data.map(meta => {
              if (meta.key === "bestellrunde_id") {
                theOrder["bestellrunde_id"] = meta.value
              }
            })
            theOrder["total"] = parseFloat(order.total).toFixed(2)
            ordersReArranged.push(theOrder)
          })

          setOrders(ordersReArranged)
          setAllOrders(ordersReArranged)
        }
      })
      .catch(error => {
        console.log(error)
      })
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
   * get list of bestellrunden
   */
  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getBestellrunden`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setBestellrunden(res)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * get total order value
   * Handle loading state
   */
  useEffect(() => {
    if (allOrders && users && bestellrunden) {
      setLoading(false)

      let totalBalance = 0
      allOrders.map(order => {
        totalBalance += parseFloat(order.total)
      })

      setTotalBalance(totalBalance)
    }
  }, [allOrders, users, bestellrunden])

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
    filename: "foodcoop-orders-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleExportData = () => {
    csvExporter.generateCsv(orders)
  }

  /**
   * Change table to only the orders of selected user
   */
  const handleChange = event => {
    setSelectedUserId(event.target.value)
    users.map(user => {
      if (event.target.value === user.id) {
        setSelectedUser(user)
      }
    })
  }

  useEffect(() => {
    if (selectedUserId !== 0) {
      let newOrderData = []
      let userTotal = 0
      allOrders.map(row => {
        if (parseInt(row.customer_id) === parseInt(selectedUserId)) {
          newOrderData.push(row)
          userTotal += parseFloat(row.total)
        }
      })
      setSelectedUserTotal(userTotal)
      setOrders(newOrderData)
      setSelectedBestellrunde(0)
    } else {
      setSelectedUserTotal(0)
      setOrders(allOrders)
      setSelectedBestellrunde(0)
    }
  }, [selectedUserId])

  /**
   * Change table to only the orders of selected bestellrunde
   */
  const handleChangeBestellrunde = event => {
    setSelectedBestellrunde(event.target.value)
  }

  useEffect(() => {
    if (selectedBestellrunde !== 0) {
      let newOrderData = []
      let bestellrundeTotal = 0
      allOrders.map(row => {
        if (parseInt(row.bestellrunde_id) === parseInt(selectedBestellrunde)) {
          newOrderData.push(row)
          bestellrundeTotal += parseFloat(row.total)
        }
      })
      setSelectedBestellrundeTotal(bestellrundeTotal)
      setOrders(newOrderData)
      setSelectedUserId(0)
      setSelectedUser(null)
    } else {
      setSelectedBestellrundeTotal(0)
      setOrders(allOrders)
      setSelectedUserId(0)
      setSelectedUser(null)
    }
  }, [selectedBestellrunde])

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={orders ?? []}
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
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "nowrap", flexDirection: "row", justifyContent: "flex-start" }}>
              {bestellrunden && (
                <FormControl size="small">
                  <InputLabel>{__("Bestellrunde", "fcplugin")}</InputLabel>
                  <Select value={selectedBestellrunde} label={__("Bestellrunde", "fcplugin")} onChange={handleChangeBestellrunde}>
                    <MenuItem key={0} value={0}>
                      {__("Alle Bestellrunden", "fcplugin")}
                    </MenuItem>
                    {bestellrunden.map(bestellrunde => (
                      <MenuItem key={bestellrunde.id} value={bestellrunde.id}>
                        {bestellrunde.id} ({bestellrunde.bestellrunde_verteiltag})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {/*
              users && (
                <FormControl size="small">
                  <InputLabel>{__("Mitglied", "fcplugin")}</InputLabel>
                  <Select value={selectedUserId} label={__("Mitglied", "fcplugin")} onChange={handleChange}>
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
              )
              */}
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
                  {__("Wert der Bestellungen von", "fcplugin")} {selectedUser.name}: <strong>{parseFloat(selectedUserTotal).toFixed(2)}</strong>
                </Typography>
              )}
              {selectedBestellrunde !== 0 && (
                <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", borderRadius: "4px" }}>
                  {__("Wert der Bestellungen von Bestellrunde", "fcplugin")} {selectedBestellrunde}: <strong>{parseFloat(selectedBestellrundeTotal).toFixed(2)}</strong>
                </Typography>
              )}
              <Typography variant="body2" sx={{ padding: "8px 15px", backgroundColor: "#e3e3e3", borderRadius: "4px" }}>
                {__("Wert aller Bestellungen", "fcplugin")}: <strong>{totalBalance ? parseFloat(totalBalance).toFixed(2) : "0.00"}</strong>
              </Typography>
            </Box>
          </Box>
        )}
      />
    </>
  )
}

export default Orders
