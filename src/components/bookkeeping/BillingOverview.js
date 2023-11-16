import React, { useState, useEffect } from "react"
import axios from "axios"
import { Stack, Select, MenuItem, FormControl, InputLabel, Card, LinearProgress, Box, Button } from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import { useExcelDownloder } from "react-xls"
const __ = wp.i18n.__

function BillingOverview() {
  const currentYear = parseInt(new Date().getFullYear())
  const earliest = 2020
  const range = currentYear - earliest
  let calcYears = []
  for (var i = currentYear; i >= earliest; i--) {
    calcYears.push(i)
  }

  const [loading, setLoading] = useState(true)
  const [years, setYears] = useState(calcYears)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [yearlyData, setYearlyData] = useState(null)

  useEffect(() => {
    setLoading(true)
    setExportData(null)
    if (selectedYear !== "") {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/getAllOrders`,
          {
            year: selectedYear
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

            let bestellrundenInYear = []
            let usersInYear = []
            let revenueInYear = 0.0
            res.map(order => {
              // bestellrunden
              order.meta_data.map(meta => {
                if (meta.key === "bestellrunde_id") {
                  if (bestellrundenInYear.filter(e => e.id === parseInt(meta.value)).length === 0) {
                    bestellrundenInYear.push({ id: parseInt(meta.value) })
                  }
                }
              })
              // users
              if (usersInYear.filter(e => e.user_id === order.customer_id).length === 0) {
                usersInYear.push({ user_id: order.customer_id, billing_first_name: order.billing.first_name, billing_last_name: order.billing.last_name })
              }
              // revenue
              revenueInYear = revenueInYear + parseFloat(order.total)
            })

            setYearlyData({
              orders: res,
              bestellrunden: bestellrundenInYear,
              users: usersInYear,
              revenue: revenueInYear
            })
            setLoading(false)
          }
        })
        .catch(error => console.log(error))
    }
  }, [selectedYear])

  /**
   * Excel Export
   */
  const { ExcelDownloder, Type } = useExcelDownloder()
  const [exportData, setExportData] = useState(null)

  useEffect(() => {
    if (yearlyData) {
      // create xlsx data matrix
      let dataMatrix = {}
      dataMatrix["orders"] = yearlyData.orders
      dataMatrix["bestellrunden"] = yearlyData.bestellrunden
      dataMatrix["users"] = yearlyData.users
      dataMatrix["revenue"] = [{ total: yearlyData.revenue, average: yearlyData.revenue / yearlyData.orders.length }]
      setExportData(dataMatrix)
    }
  }, [yearlyData, selectedYear])

  return (
    <Card sx={{ minWidth: 275, borderRadius: 0, padding: 2 }}>
      <Stack spacing={3} alignItems={"flex-start"} justifyContent={"flex-start"} direction={"column"}>
        <FormControl fullWidth>
          <InputLabel id="year-label">{__("Jahr", "fcplugin")}</InputLabel>
          <Select
            onChange={event => {
              setSelectedYear(event.target.value)
            }}
            id="year"
            label={__("Jahr", "fcplugin")}
            value={selectedYear}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!loading && yearlyData ? (
          <>
            <Table aria-label="table" size="medium" sx={{ border: "1px solid #f0f0f0", backgroundColor: "#fcfcfc" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                  <TableCell component="th">
                    {__("Zusammenfassung für ", "fcplugin")} {selectedYear}
                  </TableCell>
                  <TableCell component="th" sx={{ textAlign: "right" }}>
                    <Button variant="outlined" color="primary" size="small" disabled={!exportData} startIcon={<DownloadIcon />}>
                      <ExcelDownloder data={exportData} filename={`billingInfo-${selectedYear}`} type={Type.Link}>
                        {__("Zusammenfassung herunterladen", "fcplugin")}
                      </ExcelDownloder>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    {__("Anzahl Bestellrunden", "fcplugin")}
                  </TableCell>
                  <TableCell component="td">{yearlyData.bestellrunden.length}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    {__("Anzahl Bestellungen", "fcplugin")}
                  </TableCell>
                  <TableCell component="td">{yearlyData.orders.length}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    {__("Mitglieder mit Bestellungen", "fcplugin")}
                  </TableCell>
                  <TableCell component="td">{yearlyData.users.length}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    {__("Umsatz", "fcplugin")}
                  </TableCell>
                  <TableCell component="td">CHF {yearlyData.revenue.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    {__("Durchschnittlicher Bestellwert", "fcplugin")}
                  </TableCell>
                  <TableCell component="td">{yearlyData.orders.length > 0 ? "CHF " + (yearlyData.revenue / yearlyData.orders.length).toFixed(2) : "CHF 0.00"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    {__("Durchschnittlicher Konsum pro Mitglied", "fcplugin")}
                  </TableCell>
                  <TableCell component="td">{yearlyData.users.length > 0 ? "CHF " + (yearlyData.revenue / yearlyData.users.length).toFixed(2) : "CHF 0.00"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table aria-label="table" size="medium" sx={{ border: "1px solid #f0f0f0", backgroundColor: "#fcfcfc" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                  <TableCell component="th" sx={{ width: "100%" }} colSpan={3}>
                    {__("Jahresabrechnung für ", "fcplugin")} {selectedYear} <br />
                    <i>{__("Richtpreis bei Nutzung von Hosting und Support durch POT Netzwerk", "fcplugin")}</i>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#fcfcfc" }}>
                  <TableCell component="th" sx={{ width: "33.3%", borderRight: "1px solid #f0f0f0", backgroundColor: "#f8eedb" }}>
                    {__("POT Modell 1: Sammelbestellungen", "fcplugin")}
                    <br />
                    <i>{__("CHF 0.00 pro Mitglied pro Monat", "fcplugin")}</i>
                  </TableCell>
                  <TableCell component="th" sx={{ width: "33.3%", borderRight: "1px solid #f0f0f0", backgroundColor: "#f2ded8" }}>
                    {__("POT Modell 2: Depot", "fcplugin")}
                    <br />
                    <i>{__("CHF 0.00 pro Mitglied pro Monat", "fcplugin")}</i>
                  </TableCell>
                  <TableCell component="th" sx={{ width: "33.3%", borderRight: "1px solid #f0f0f0", backgroundColor: "#f3eaf1" }}>
                    {__("POT Modell 3: Mitgliederladen", "fcplugin")}
                    <br />
                    <i>{__("CHF 0.00 pro Mitglied pro Monat", "fcplugin")}</i>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    CHF {parseFloat(yearlyData.users.length * 0 * 12).toFixed(2)}
                  </TableCell>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    CHF {parseFloat(yearlyData.users.length * 0 * 12).toFixed(2)}
                  </TableCell>
                  <TableCell component="td" sx={{ borderRight: "1px solid #f0f0f0" }}>
                    CHF {parseFloat(yearlyData.users.length * 0 * 12).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        ) : (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        )}
      </Stack>
    </Card>
  )
}

export default BillingOverview
