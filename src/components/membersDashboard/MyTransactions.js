import React, { useState, useMemo, useEffect } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { Box, Grid, LinearProgress } from "@mui/material"
import { format } from "date-fns"

const __ = wp.i18n.__

function MyTransactions() {
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState(null)

  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getMyTransactions`, {
        headers: {
          "X-WP-Nonce": frontendLocalizer.nonce
        }
      })
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
        accessorKey: "details",
        header: __("Details", "fcplugin")
      }
    ],
    []
  )

  return loading ? (
    <Box sx={{ width: "100%", marginBottom: 4 }}>
      <LinearProgress />
    </Box>
  ) : products ? (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h2>{__("Deine Transaktionen", "fcplugin")}</h2>
        </Grid>
      </Grid>
      <Box sx={{ marginTop: "20px" }}>
        <MaterialReactTable
          columns={columns}
          data={walletData ?? []}
          state={{ isLoading: loading }}
          localization={MRT_Localization_DE}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "none"
            }
          }}
          enableFullScreenToggle={false}
          enableColumnActions={false}
          enableColumnFilters={false}
          enableSorting={false}
        />
      </Box>
    </>
  ) : (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <h2>{__("Du verwaltest keine Produkte.", "fcplugin")}</h2>
      </Grid>
    </Grid>
  )
}

export default MyTransactions
