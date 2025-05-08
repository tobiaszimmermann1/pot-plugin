import React, { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import SaveIcon from "@mui/icons-material/Save"
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { Alert } from "@mui/material"
const __ = wp.i18n.__

function WeighedProducts({ setModalClose, prods }) {
  const [products, setProducts] = useState(prods)
  const [rowSelection, setRowSelection] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)

  const tableInstanceRef = useRef(null)

  useEffect(() => {
    if (prods) {
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_weighed_products`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            const res = JSON.parse(response.data)

            let selectedRowsOnLoad = {}
            JSON.parse(res).map(rowId => {
              selectedRowsOnLoad[rowId] = true
            })
            setRowSelection(selectedRowsOnLoad)
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          setProductsLoading(false)
        })
    }
  }, [])

  /**
   * Product Table
   */

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: __("ID", "fcplugin"),
        enableEditing: false,
        size: 50
      },
      {
        accessorKey: "sku",
        header: __("SKU", "fcplugin"),
        size: 50
      },
      {
        accessorKey: "name",
        header: __("Produkt", "fcplugin")
      },
      {
        accessorKey: "price",
        header: __("Preis", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "unit",
        header: __("Einheit", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "weight",
        header: __("Gewicht", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "lot",
        header: __("Gebindegrösse", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "producer",
        header: __("Produzent", "fcplugin")
      },
      {
        accessorKey: "supplier",
        header: __("Lieferant", "fcplugin")
      },
      {
        accessorKey: "category",
        header: __("Kategorie", "fcplugin")
      }
    ],
    []
  )

  const handleSubmit = () => {
    setSubmitting(true)
    let productIds = Object.keys(rowSelection)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postSaveProductsWeighed`,
        {
          products: JSON.stringify(productIds)
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {})
      .catch(error => console.log(error))
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">{__("Gewichtete Produkte wählen", "fcplugin")}</DialogTitle>
            <DialogActions>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
                {__("Speichern", "fcplugin")}
              </LoadingButton>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setRowSelection({})
                  setModalClose(false)
                }}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogActions>
          </Toolbar>
        </AppBar>
        <DialogContent
          dividers={scroll === "paper"}
          sx={{
            paddingTop: "20px",
            minHeight: "500px"
          }}
        >
          <Alert sx={{ marginBottom: 1 }} severity="info">
            {__("Produkte auswählen, die im Self Checkout nach Gewicht verkauft werden, dann speichern.", "fcplugin")}
          </Alert>
          <MaterialReactTable
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                border: "0px"
              }
            }}
            tableInstanceRef={tableInstanceRef}
            enableRowSelection
            enableMultiRowSelection
            enableSelectAll
            selectAllMode="all"
            getRowId={originalRow => originalRow.id}
            muiTableBodyRowProps={({ row }) => ({
              onClick: row.getToggleSelectedHandler(),
              sx: { cursor: "pointer" }
            })}
            onRowSelectionChange={setRowSelection}
            columns={columns}
            data={products ?? []}
            state={{ isLoading: productsLoading, rowSelection }}
            localization={MRT_Localization_DE}
            enableFullScreenToggle={false}
            initialState={{ density: "compact", pagination: { pageSize: 25 } }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WeighedProducts
