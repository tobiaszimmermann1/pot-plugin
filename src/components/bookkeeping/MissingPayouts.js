import React, { useState, useEffect, useMemo } from "react"
import { Box } from "@mui/material"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { format } from "date-fns"
import FormControl from "@mui/material/FormControl"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import TextField from "@mui/material/TextField"
import IconButton from "@mui/material/IconButton"
import Plumbing from "@mui/icons-material/Plumbing"
import Divider from "@mui/material/Divider"


const __ = wp.i18n.__

const MissingPayouts = () => {
  const [loading, setLoading] = useState(true)
  const [missingOrderItems, setMissingOrderItems] = useState(null)
  const [startDate, setStartDate] = useState(new Date().setDate(new Date().getDate() - 14))

  const loadMissingPayouts = (ts) => {
    let formattedStartDate;
    try {
      formattedStartDate = format(ts, "dd.MM.yyyy");
    } catch (error) {
      return;
    }
    setLoading(true)
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getOrderItemsWithMissingPayout?start_date=${formattedStartDate}`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          setMissingOrderItems(res)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }

  const handleChange = event => {
    setStartDate(event)
    loadMissingPayouts(event)
  }

  const fixMissingPayout = (row) => {
    if (!confirm(__("Korrekturbuchung für", "fcplugin") + " " + row.name + " (" + row.amount + ") " + __("ausführen?", "fcplugin"))) {
      return
    }

    setLoading(true)
    axios
      .post(`${appLocalizer.apiUrl}/foodcoop/v1/fixMissingPayout`, {
        product_id: row.id,
        product_name: row.name,
        date: row.date,
        owner: row.owner_id,
        amount: row.amount,
      }, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response) {
          setMissingOrderItems(prevItems => prevItems.filter(item => item.id !== row.id));
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }


  /**
   * Get potentially missing payouts
   */
  useEffect(() => {
    loadMissingPayouts(startDate);
  }, [])

  /**
   * Transactions Table
   */
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: __("Datum", "fcplugin"),
        Cell: ({ cell }) => format(new Date(cell.getValue().replace(" ", "T")), "dd.MM.yyyy")
      },      
      {
        accessorKey: "id",
        header: __("Produkt ID", "fcplugin")
      },
      {
        accessorKey: "name",
        header: __("Produkt", "fcplugin")
      },
      {
        accessorKey: "amount",
        header: __("Betrag", "fcplugin")
      },
      {
        accessorKey: "owner",
        header: __("Owner", "fcplugin")
      }
    ],
    []
  )


  return (
    <>
      <FormControl fullWidth>
        <DesktopDatePicker label="Check Start" inputFormat="dd.MM.yyyy" value={startDate} onChange={e => handleChange(e)} renderInput={params => <TextField {...params} />} />
      </FormControl>
      <MaterialReactTable
        columns={columns}
        data={missingOrderItems ?? []}
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
        enableRowActions
        positionActionsColumn="last"
        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "",
            size: 100,
            Cell: ({ row, table }) => (
              <Box sx={{ display: "flex", gap: 0, p: "0.5rem", flexWrap: "nowrap" }}>
                <Divider orientation="vertical" flexItem />
                <IconButton
                  onClick={() => {
                    fixMissingPayout(row.original)
                  }}
                  disabled={false}
                  color="primary"
                >
                  <Plumbing /> Fix
                </IconButton>
                
              </Box>
            )
          }
        }}
      />
    </>
  )
}

export default MissingPayouts
