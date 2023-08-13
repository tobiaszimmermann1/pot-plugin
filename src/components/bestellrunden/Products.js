import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import SaveIcon from "@mui/icons-material/Save"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
const __ = wp.i18n.__

function ProductsOfBestellrundeModal({ id, setModalClose }) {
  const [products, setProducts] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState({
    message: null,
    type: null,
    active: false
  })
  const tableInstanceRef = useRef(null)

  useEffect(() => {
    if (id) {
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getBestellrundeProducts?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          let reArrangeProductData = []
          if (response.data) {
            const res = JSON.parse(response.data)
            res[0].map(p => {
              let productToDo = {}
              productToDo.name = p.name
              productToDo.price = p.price
              productToDo.unit = p._einheit
              productToDo.lot = p._gebinde
              productToDo.producer = p._lieferant
              productToDo.origin = p._herkunft
              productToDo.category = p.category_name
              productToDo.id = p.id

              reArrangeProductData.push(productToDo)
            })
            setProducts(reArrangeProductData)

            let selectedRowsOnLoad = {}
            JSON.parse(res[1]).map(rowId => {
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
  }, [id])

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
        accessorKey: "lot",
        header: __("Gebindegrösse", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "producer",
        header: __("Produzent", "fcplugin")
      },
      {
        accessorKey: "origin",
        header: __("Herkunft", "fcplugin")
      },
      {
        accessorKey: "category",
        id: "category_id",
        header: __("Kategorie", "fcplugin"),
        enableEditing: false
      }
    ],
    []
  )

  const handleSubmit = () => {
    setSubmitting(true)
    let productIds = Object.keys(rowSelection)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postSaveProductsBestellrunde`,
        {
          products: JSON.stringify(productIds),
          bestellrunde: id
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
            <DialogTitle textAlign="left">
              {__("Produkte in Bestellrunde", "fcplugin")} {id}
            </DialogTitle>
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
            initialState={{ density: "compact" }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductsOfBestellrundeModal
