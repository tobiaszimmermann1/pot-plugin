import React, { useState, useMemo, useEffect } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining"
import EditIcon from "@mui/icons-material/Edit"
import { Box, Divider, IconButton, Grid, LinearProgress, Tooltip } from "@mui/material"
import MyProductsDeliveryModal from "./MyProductsDeliveryModal"
const __ = wp.i18n.__

function MyProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState(null)
  const [cats, setCats] = useState([])
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [deliveryProduct, setDeliveryProduct] = useState(null)

  /**
   * Product Table
   */
  const columns = [
    {
      accessorKey: "id",
      header: __("ID", "fcplugin"),
      enableEditing: false,
      size: 50
    },
    {
      accessorKey: "sku",
      header: __("Artikelnummer", "fcplugin"),
      enableEditing: true,
      size: 80
    },
    {
      accessorKey: "name",
      header: __("Produkt", "fcplugin")
    },
    {
      accessorKey: "short_description",
      id: "short_description",
      header: __("Details", "fcplugin"),
      size: 80
    },
    {
      accessorKey: "price",
      header: __("Preis", "fcplugin"),
      size: 80,
      Cell: ({ cell }) => parseFloat(cell.getValue()).toFixed(2)
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
      accessorKey: "stock",
      header: __("Lagerbestand", "fcplugin"),
      size: 120
    },
    {
      accessorKey: "category",
      id: "category_id",
      header: __("Kategorie", "fcplugin"),
      editVariant: "select",
      editSelectOptions: cats
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
      accessorKey: "origin",
      header: __("Herkunft", "fcplugin")
    },
    {
      accessorKey: "description",
      header: __("Beschreibung", "fcplugin")
    }
  ]

  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProducts`, {
        headers: {
          "X-WP-Nonce": frontendLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)[0]
          const cats = JSON.parse(response.data)[1]
          let ownedProducts = []

          if (res.length > 0) {
            res.map(p => {
              if (parseInt(p.fc_owner) === frontendLocalizer.currentUser.ID) {
                let productToDo = {}
                productToDo.name = p.name
                productToDo.price = p.price
                productToDo.unit = p._einheit
                productToDo.lot = p._gebinde
                productToDo.producer = p._produzent
                productToDo.supplier = p._lieferant
                productToDo.origin = p._herkunft
                productToDo.category = p.category_name
                productToDo.id = p.id
                productToDo.short_description = p.short_description
                p.image ? (productToDo.image = p.image) : (productToDo.image = "")
                productToDo.description = p.description
                productToDo.sku = p.sku
                p.stock === null ? (productToDo.stock = 0) : (productToDo.stock = p.stock)
                productToDo.tax = p.tax
                productToDo.description = p.description
                productToDo.owner = parseInt(p.fc_owner)

                ownedProducts.push(productToDo)
              }
            })
          }

          ownedProducts.length > 0 && setProducts(ownedProducts)
          ownedProducts.length > 0 && setCats(cats)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  async function handleSaveRow({ exitEditingMode, row, values }) {
    products[row.index] = values
    console.log(values)
    axios
      .post(
        `${frontendLocalizer.apiUrl}/foodcoop/v1/postProductUpdateByOwner`,
        {
          user_id: frontendLocalizer.currentUser.ID,
          updatedValues: values,
          id: values.id
        },
        {
          headers: {
            "X-WP-Nonce": frontendLocalizer.nonce
          }
        }
      )
      .then(function (response) {})
      .catch(error => console.log(error))

    // update table values
    setProducts([...products])
    exitEditingMode() //required to exit editing mode
  }

  return loading ? (
    <Box sx={{ width: "100%", marginBottom: 4 }}>
      <LinearProgress />
    </Box>
  ) : products && cats ? (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h2>{__("Deine Produkte: Editiere Produktdaten, erfasse eine Lieferung oder ändere den Bestand.", "fcplugin")}</h2>
        </Grid>
      </Grid>
      <Box sx={{ marginTop: "20px" }}>
        <MaterialReactTable
          columns={columns}
          data={products ?? []}
          state={{ isLoading: loading }}
          localization={MRT_Localization_DE}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "none"
            }
          }}
          displayColumnDefOptions={{
            "mrt-row-actions": {
              header: "",
              size: 100,
              Cell: ({ row, table }) => (
                <Box sx={{ display: "flex", gap: 0, p: "0.5rem", flexWrap: "nowrap" }}>
                  <Tooltip title={__("Produktdaten edititieren", "fcplugin")} placement="top" arrow>
                    <IconButton onClick={() => table.setEditingRow(row)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Divider orientation="vertical" flexItem />
                  <Tooltip title={__("Lieferung erfassen", "fcplugin")} placement="top" arrow>
                    <IconButton
                      onClick={() => {
                        setDeliveryModalOpen(true)
                        setDeliveryProduct(row.original)
                      }}
                      disabled={loading}
                    >
                      <DeliveryDiningIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            }
          }}
          enableFullScreenToggle={false}
          enableColumnActions={false}
          enableColumnFilters={false}
          enableSorting={false}
          enableColumnResizing
          enableRowActions
          positionActionsColumn="first"
          editingMode={"modal"}
          enableEditing
          onEditingRowSave={handleSaveRow}
          initialState={{ density: "compact", pagination: { pageSize: 10 } }}
          positionToolbarAlertBanner="bottom"
        />
      </Box>
      {deliveryModalOpen && <MyProductsDeliveryModal setModalClose={setDeliveryModalOpen} product={deliveryProduct} />}
    </>
  ) : (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <h2>{__("Du verwaltest keine Produkte.", "fcplugin")}</h2>
      </Grid>
    </Grid>
  )
}

export default MyProducts
