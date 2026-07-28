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

const getOrderTime = order => new Date(order.date_created.replace(" ", "T")).getTime()
const hasValidDate = date => date && isValid(new Date(date))
const getOrdersTotal = orders =>
  orders.reduce((total, order) => {
    const orderTotal = parseFloat(order.total)
    return total + (Number.isFinite(orderTotal) ? orderTotal : 0)
  }, 0)

const Orders = () => {
  const [loading, setLoading] = useState(true)
  const [allOrders, setAllOrders] = useState(null)
  const [users, setUsers] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(0)
  const [bestellrunden, setBestellrunden] = useState(null)
  const [selectedBestellrunde, setSelectedBestellrunde] = useState(0)
  const [dateStart, setDateStart] = useState(null)
  const [dateEnd, setDateEnd] = useState(null)

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
      },
      {
        accessorKey: "payment_method_title",
        header: __("Zahlungsart", "fcplugin"),
        size: 160
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
          setAllOrders(res)
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
   * Handle loading state
   */
  useEffect(() => {
    if (allOrders && users && bestellrunden) {
      setLoading(false)
    }
  }, [allOrders, users, bestellrunden])

  const selectedUser = useMemo(() => {
    if (!users || selectedUserId === 0) {
      return null
    }

    return users.find(user => parseInt(user.id) === parseInt(selectedUserId)) ?? null
  }, [selectedUserId, users])

  const timeStart = hasValidDate(dateStart) ? startOfDay(new Date(dateStart)).getTime() : null
  const timeEnd = hasValidDate(dateEnd) ? endOfDay(new Date(dateEnd)).getTime() : null

  /**
   * Apply the inclusive calendar range before the optional ordering-round or
   * member filter so all displayed totals share the same time period.
   */
  const ordersWithinDateRange = useMemo(() => {
    if (!allOrders || (timeStart !== null && timeEnd !== null && timeStart > timeEnd)) {
      return []
    }

    return allOrders.filter(order => {
      const orderTime = getOrderTime(order)
      const isAfterStart = timeStart === null || orderTime >= timeStart
      const isBeforeEnd = timeEnd === null || orderTime <= timeEnd

      return isAfterStart && isBeforeEnd
    })
  }, [allOrders, timeEnd, timeStart])

  const orders = useMemo(
    () =>
      ordersWithinDateRange.filter(order => {
        const isSelectedUser = selectedUserId === 0 || parseInt(order.customer_id) === parseInt(selectedUserId)
        const isSelectedBestellrunde = selectedBestellrunde === 0 || parseInt(order.bestellrunde_id) === parseInt(selectedBestellrunde)

        return isSelectedUser && isSelectedBestellrunde
      }),
    [ordersWithinDateRange, selectedBestellrunde, selectedUserId]
  )

  const totalBalance = useMemo(() => getOrdersTotal(ordersWithinDateRange), [ordersWithinDateRange])
  const selectedUserTotal = useMemo(() => getOrdersTotal(orders), [orders])
  const selectedBestellrundeTotal = selectedUserTotal

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
   * Change table to only the orders of selected bestellrunde
   */
  const handleChangeBestellrunde = event => {
    setSelectedBestellrunde(event.target.value)
    setSelectedUserId(0)
  }

  const resetDateRange = () => {
    setDateStart(null)
    setDateEnd(null)
  }

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
            <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", flexDirection: "row", justifyContent: "flex-start" }}>
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
                {__("Wert aller Bestellungen", "fcplugin")}: <strong>{totalBalance.toFixed(2)}</strong>
              </Typography>
            </Box>
          </Box>
        )}
      />
    </>
  )
}

export default Orders
