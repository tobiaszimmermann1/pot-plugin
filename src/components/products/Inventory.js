import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import BlockIcon from "@mui/icons-material/Block"
import SaveIcon from "@mui/icons-material/Save"
import { Box, Button, Alert } from "@mui/material"
const __ = wp.i18n.__

const Inventory = ({ setInventoryMode, setReload, reload }) => {
  const [products, setProducts] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getProducts`)
      .then(function (response) {
        let reArrangeProductData = []
        if (response.data) {
          const res = JSON.parse(response.data)
          res[0].map(p => {
            let productToDo = {}
            productToDo.name = p.name
            productToDo.unit = p._einheit
            productToDo.lot = p._gebinde
            productToDo.id = p.id
            productToDo.sku = p.sku
            p.stock === null ? (productToDo.stock = 0) : (productToDo.stock = p.stock)
            reArrangeProductData.push(productToDo)
          })
          setProducts(reArrangeProductData)
          setProductsLoading(false)
        }
      })
      .catch(error => console.log(error))
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
        header: __("Artikelnummer", "fcplugin"),
        enableEditing: false,
        size: 50
      },
      {
        accessorKey: "name",
        header: __("Produkt", "fcplugin"),
        enableEditing: false
      },
      {
        accessorKey: "unit",
        header: __("Einheit", "fcplugin"),
        enableEditing: false,
        size: 80
      },
      {
        accessorKey: "lot",
        header: __("Gebindegrösse", "fcplugin"),
        enableEditing: false,
        size: 80
      },
      {
        accessorKey: "stock",
        header: __("Lagerbestand", "fcplugin"),
        size: 120,
        enableEditing: true
      }
    ],
    []
  )

  function handleSave() {
    console.log(products)

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postSaveInventory`,
        {
          products: JSON.stringify(products)
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(response => {
        setInventoryMode(false)
        setReload(reload + 1)
      })
      .catch(error => console.log(error))
  }

  // saving edits
  const handleSaveCell = (cell, value) => {
    products[cell.row.index][cell.column.id] = value
    setProducts([...products])
  }

  return (
    <div className="pluginBody">
      <MaterialReactTable
        columns={columns}
        data={products ?? []}
        state={{ isLoading: productsLoading }}
        localization={MRT_Localization_DE}
        positionActionsColumn="first"
        editingMode={"table"}
        enableEditing
        muiTableBodyCellEditTextFieldProps={({ cell }) => ({
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        enableFullScreenToggle={false}
        initialState={{ density: "compact", pagination: { pageSize: 100 }, showAlertBanner: true }}
        positionToolbarAlertBanner="top"
        muiToolbarAlertBannerProps={{
          color: "info",
          children: __("Verändere die Lagerbestände aller Produkte auf einmal. Es wird kein Log geführt.", "fcplugin")
        }}
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap", width: "100%" }}>
            <Button color="primary" onClick={() => setInventoryMode(false)} startIcon={<BlockIcon />} variant="outlined" size="small">
              {__("Abbrechen", "fcplugin")}
            </Button>
            <Button
              color="primary"
              onClick={() => {
                handleSave()
              }}
              startIcon={<SaveIcon />}
              variant="outlined"
              size="small"
              disabled={submitting}
            >
              {__("Inventur speichern", "fcplugin")}
            </Button>
          </Box>
        )}
      />
    </div>
  )
}

export default Inventory
