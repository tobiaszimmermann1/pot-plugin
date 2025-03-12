import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { Box, IconButton, Button, CircularProgress, Card, CardContent, Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import { ExportToCsv } from "export-to-csv"
import ImportProducts from "./products/ImportProducts"
import ImageIcon from "@mui/icons-material/Image"
import QrCodeIcon from "@mui/icons-material/QrCode"
import Divider from "@mui/material/Divider"
import Categories from "./products/Categories"
import Suppliers from "./products/Suppliers"
import Producers from "./products/Producers"
import Grid from "@mui/material/Grid"
import CategoryIcon from "@mui/icons-material/Category"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox"
import ListAltIcon from "@mui/icons-material/ListAlt"
import Inventory from "./products/Inventory"
import WidgetsIcon from "@mui/icons-material/Widgets"
import NewDelivery from "./products/NewDelivery"
import SmartphoneIcon from "@mui/icons-material/Smartphone"
import SelfCheckoutProducts from "./products/SelfCheckoutProducts"
import WeighedProducts from "./products/weighedProducts"
import PersonIcon from "@mui/icons-material/Person"
import ProductOwnerModal from "./products/ProductOwnerModal"
import TextSnippetIcon from "@mui/icons-material/TextSnippet"
import EditDescription from "./products/EditDescription"
import ScaleIcon from "@mui/icons-material/Scale"
const __ = wp.i18n.__

const Products = () => {
  const [products, setProducts] = useState()
  const [reload, setReload] = useState(0)
  const [categories, setCategories] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState({
    message: null,
    type: null,
    active: false
  })
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [visibilityOptions, setVisibilityOptions] = useState({ stock: false, tax: false })
  const [selfCheckoutOption, setSelfCheckoutOption] = useState(false)
  const [inventoryMode, setInventoryMode] = useState(false)
  const [selectSelfCheckoutProducts, setSelectSelfCheckoutProducts] = useState(false)
  const [ownerModalOpen, setOwnerModalOpen] = useState(false)
  const [ownerModalProduct, setOwnerModalProduct] = useState(null)
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false)
  const [selectedProductDescription, setSelectedProductDescription] = useState(null)
  const [selectedProductDescriptionId, setSelectedProductDescriptionId] = useState(null)
  const [selectedProductEditTitle, setSelectedProductEditTitle] = useState(null)
  const [weighedProducts, setWeighedProducts] = useState(false)

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
            productToDo.price = p.price
            productToDo.unit = p._einheit
            productToDo.lot = p._gebinde
            productToDo.producer = p._produzent
            productToDo.supplier = p._lieferant
            productToDo.origin = p._herkunft
            productToDo.category = p.category_name
            productToDo.id = p.id
            productToDo.pot_id = p.pot_id
            productToDo.short_description = p.short_description
            p.image ? (productToDo.image = p.image) : (productToDo.image = "")
            p.thumbnail ? (productToDo.thumbnail = p.thumbnail) : (productToDo.thumbnail = "")
            productToDo.description = p.description
            productToDo.sku = p.sku
            p.stock === null ? (productToDo.stock = 0) : (productToDo.stock = p.stock)
            productToDo.tax = p.tax
            productToDo.owner = parseInt(p.fc_owner)

            reArrangeProductData.push(productToDo)
          })
          setProducts(reArrangeProductData)
          setCategories(res[1])
          setProductsLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [reload])

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getAllOptions`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(res => {
        let options = JSON.parse(res.data)

        let visOptions = {}
        options.woocommerce_manage_stock === "yes" ? (visOptions["stock"] = true) : (visOptions["stock"] = false)
        options.fc_taxes === "1" ? (visOptions["tax"] = true) : (visOptions["tax"] = false)

        setVisibilityOptions(visOptions)

        options.fc_self_checkout === "1" ? setSelfCheckoutOption(true) : setSelfCheckoutOption(false)
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
        enableEditing: true,
        size: 50
      },
      {
        accessorKey: "pot_id",
        header: __("POT ID", "fcplugin"),
        enableEditing: true,
        size: 50
      },
      {
        accessorKey: "thumbnail",
        header: __("", "fcplugin"),
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <a href={`${appLocalizer.homeUrl}/wp-admin/post.php?post=${cell.row.original.id}&action=edit`} target="blank">
              <img src={cell.getValue()} height={30} />
            </a>
          ) : (
            <a href={`${appLocalizer.homeUrl}/wp-admin/post.php?post=${cell.row.original.id}&action=edit`} target="blank">
              <ImageIcon style={{ color: "#cccccc" }} />
            </a>
          ),
        size: 30,
        enableColumnResizing: false
      },
      {
        accessorKey: "name",
        header: __("Produkt", "fcplugin")
      },
      {
        accessorKey: "description",
        header: __("Beschreibung", "fcplugin"),
        Cell: ({ cell }) => (
          <IconButton
            onClick={() => {
              setSelectedProductDescription(cell.getValue())
              setSelectedProductDescriptionId(cell.row.original.id)
              setSelectedProductEditTitle(cell.row.original.name)
              setDescriptionModalOpen(true)
            }}
            color={"primary"}
          >
            <TextSnippetIcon />
          </IconButton>
        ),
        size: 50,
        enableColumnResizing: false
      },
      {
        accessorKey: "short_description",
        id: "short_description",
        header: __("Details", "fcplugin"),
        enableEditing: false,
        size: 80
      },
      {
        accessorKey: "price",
        header: __("Preis", "fcplugin"),
        size: 80,
        Cell: ({ cell }) => parseFloat(cell.getValue()).toFixed(2)
      },
      {
        accessorKey: "tax",
        header: __("MWST", "fcplugin"),
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
        accessorKey: "stock",
        header: __("Lagerbestand", "fcplugin"),
        size: 120,
        enableEditing: false
      },
      {
        accessorKey: "category",
        id: "category_id",
        header: __("Kategorie", "fcplugin"),
        enableEditing: false
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
      }
    ],
    []
  )

  async function handleSaveRow({ exitEditingMode, row, values }) {
    products[row.index] = values
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postProductUpdate`,
        {
          updatedValues: values,
          id: values.id
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        response.status == 200 &&
          setStatusMessage({
            message: JSON.parse(response.data) + " " + __("wurde gespeichert.", "fcplugin"),
            type: "successStatus",
            active: true
          })
      })
      .catch(error => console.log(error))

    // update table values
    setProducts([...products])
    exitEditingMode() //required to exit editing mode
  }

  const handleDeleteRow = useCallback(
    row => {
      if (!confirm(row.getValue("name") + " " + __("löschen?", "fcplugin"))) {
        return
      }

      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postProductDelete`,
          {
            name: row.getValue("name"),
            id: row.getValue("id")
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          response.status == 200 &&
            setStatusMessage({
              message: JSON.parse(response.data) + " " + __("wurde gelöscht.", "fcplugin"),
              type: "successStatus",
              active: true
            })
        })
        .catch(error => console.log(error))

      products.splice(row.index, 1)
      setProducts([...products])
    },
    [products]
  )

  useEffect(() => {
    setTimeout(() => {
      setStatusMessage({
        message: null,
        type: null,
        active: false
      })
    }, 15000)
  }, [statusMessage])

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
    filename: "foodcoop-products-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleExportData = () => {
    // rearrange product information to match import list
    const exportProducts = []
    products.map(product => {
      let the_product = {}
      the_product["name"] = product.name
      the_product["price"] = product.price
      the_product["unit"] = product.unit
      the_product["lot"] = product.lot
      the_product["producer"] = product.producer
      the_product["origin"] = product.origin
      the_product["category"] = product.category
      the_product["id"] = product.id
      the_product["short_description"] = product.short_description
      the_product["image"] = product.image
      the_product["description"] = product.description
      the_product["sku"] = product.sku
      the_product["supplier"] = product.supplier
      the_product["tax"] = product.tax
      the_product["pot_id"] = product.pot_id
      exportProducts.push(the_product)
    })

    csvExporter.generateCsv(exportProducts)
  }

  function handleQRCode(row) {
    setButtonLoading(true)
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/productQRPDF?sku=${row.original.sku}`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const linkSource = `data:application/pdf;base64,${response.data}`
          const downloadLink = document.createElement("a")
          const fileName = `QR-${row.original.sku}.pdf`
          downloadLink.href = linkSource
          downloadLink.download = fileName
          downloadLink.click()
          setButtonLoading(false)
        }
      })
      .catch(error => {
        console.log(error)
        setButtonLoading(false)
      })
  }

  function handleQRCodeAll() {
    setButtonLoading(true)
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/allProductsQRPDF`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const linkSource = `data:application/pdf;base64,${response.data}`
          const downloadLink = document.createElement("a")
          const fileName = `QR-labels.pdf`
          downloadLink.href = linkSource
          downloadLink.download = fileName
          downloadLink.click()
          setButtonLoading(false)
        }
      })
      .catch(error => {
        console.log(error)
        setButtonLoading(false)
      })
  }

  const [activeTab, setActiveTab] = useState("products")
  const pluginMenu = useRef()

  useEffect(() => {
    let menuItems = pluginMenu.current.children
    for (const menuItem of menuItems) {
      menuItem.classList.remove("menuItemActive")
    }
    pluginMenu.current.querySelector("#" + activeTab).classList.add("menuItemActive")
  }, [activeTab])

  return (
    <>
      <Box>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275, borderRadius: 0 }}>
              <CardContent sx={{ paddingBottom: "16px !important" }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  <span className="pluginMenu" ref={pluginMenu}>
                    <span id="products" className="menuItem firstMenuItem" onClick={() => setActiveTab("products")}>
                      <WidgetsIcon sx={{ marginRight: "10px" }} /> {__("Produkte", "fcplugin")}
                    </span>
                    <span id="categories" className="menuItem" onClick={() => setActiveTab("categories")}>
                      <CategoryIcon sx={{ marginRight: "10px" }} />
                      {__("Kategorien", "fcplugin")}
                    </span>
                    <span id="producers" className="menuItem" onClick={() => setActiveTab("producers")}>
                      <AgricultureIcon sx={{ marginRight: "10px" }} />
                      {__("Produzenten", "fcplugin")}
                    </span>
                    <span id="suppliers" className="menuItem" onClick={() => setActiveTab("suppliers")}>
                      <LocalShippingIcon sx={{ marginRight: "10px" }} />
                      {__("Lieferanten", "fcplugin")}
                    </span>
                  </span>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <div className="pluginBody">
        {activeTab === "categories" && <Categories />}
        {activeTab === "suppliers" && <Suppliers />}
        {activeTab === "producers" && <Producers />}
        {activeTab === "products" && (
          <>
            {statusMessage.active && <div className={`statusMessage ${statusMessage.type}`}>{statusMessage.message}</div>}
            {!inventoryMode ? (
              <MaterialReactTable
                columns={columns}
                data={products ?? []}
                state={{ isLoading: productsLoading, columnVisibility: visibilityOptions }}
                onColumnVisibilityChange={setVisibilityOptions}
                localization={MRT_Localization_DE}
                enableColumnResizing
                enableRowActions
                positionActionsColumn="first"
                displayColumnDefOptions={{
                  "mrt-row-actions": {
                    header: "",
                    size: 180,
                    Cell: ({ row, table }) => (
                      <Box sx={{ display: "flex", gap: 0, p: "0.5rem", flexWrap: "nowrap" }}>
                        <IconButton onClick={() => table.setEditingRow(row)}>
                          <EditIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <IconButton onClick={() => handleQRCode(row)} disabled={buttonLoading}>
                          <QrCodeIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <IconButton
                          onClick={() => {
                            setOwnerModalOpen(true)
                            setOwnerModalProduct(row.original)
                          }}
                          disabled={buttonLoading}
                          color={products[row.id].owner ? "primary" : "secondary"}
                        >
                          <PersonIcon />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <IconButton onClick={() => handleDeleteRow(row)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )
                  }
                }}
                editingMode={"modal"}
                enableEditing
                onEditingRowSave={handleSaveRow}
                enableFullScreenToggle={false}
                initialState={{ density: "compact", pagination: { pageSize: 25 } }}
                positionToolbarAlertBanner="bottom"
                renderTopToolbarCustomActions={({ table }) => (
                  <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap" }}>
                    <Button
                      color="primary"
                      onClick={() => {
                        window.location.replace(`${appLocalizer.homeUrl}/wp-admin/admin.php?page=foodcoop-product-import`)
                      }}
                      startIcon={<FileUploadIcon />}
                      variant="outlined"
                      size="small"
                      disabled={productsLoading}
                    >
                      {__("Importieren", "fcplugin")}
                    </Button>
                    <Button color="primary" onClick={handleExportData} startIcon={<FileDownloadIcon />} variant="outlined" size="small" disabled={productsLoading}>
                      {__("Exportieren", "fcplugin")}
                    </Button>

                    {visibilityOptions.stock && (
                      <Box sx={{ marginLeft: "20px", gap: "1rem", display: "flex" }}>
                        <Button color="primary" onClick={() => setDeliveryModalOpen(true)} startIcon={buttonLoading ? <CircularProgress size={14} /> : <MoveToInboxIcon />} variant="outlined" size="small" disabled={buttonLoading}>
                          {__("Lieferung entgegen nehmen", "fcplugin")}
                        </Button>
                        <Button color="primary" onClick={() => setInventoryMode(true)} startIcon={buttonLoading ? <CircularProgress size={14} /> : <ListAltIcon />} variant="outlined" size="small" disabled={buttonLoading}>
                          {__("Inventur durchführen", "fcplugin")}
                        </Button>
                      </Box>
                    )}
                    {selfCheckoutOption && (
                      <Box sx={{ marginLeft: "20px", gap: "1rem", display: "flex" }}>
                        <Button color="primary" onClick={() => handleQRCodeAll()} startIcon={buttonLoading ? <CircularProgress size={14} /> : <QrCodeIcon />} variant="outlined" size="small" disabled={buttonLoading}>
                          {__("QR Etiketten generieren", "fcplugin")}
                        </Button>
                        <Button color="primary" onClick={() => setSelectSelfCheckoutProducts(true)} startIcon={buttonLoading ? <CircularProgress size={14} /> : <SmartphoneIcon />} variant="outlined" size="small" disabled={buttonLoading}>
                          {__("Self Checkout Produkte", "fcplugin")}
                        </Button>
                        <Button color="primary" onClick={() => setWeighedProducts(true)} startIcon={buttonLoading ? <CircularProgress size={14} /> : <ScaleIcon />} variant="outlined" size="small" disabled={buttonLoading}>
                          {__("Gewichtete Produkte", "fcplugin")}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              />
            ) : (
              <Inventory setInventoryMode={setInventoryMode} setReload={setReload} reload={reload} />
            )}
            {importModalOpen && <ImportProducts setModalClose={setImportModalOpen} categories={categories} setReload={setReload} reload={reload} />}
            {deliveryModalOpen && <NewDelivery setModalClose={setDeliveryModalOpen} prod={products} reload={reload} setReload={setReload} />}
            {selectSelfCheckoutProducts && <SelfCheckoutProducts setModalClose={setSelectSelfCheckoutProducts} prods={products} />}
            {weighedProducts && <WeighedProducts setModalClose={setWeighedProducts} prods={products} />}
            {ownerModalOpen && <ProductOwnerModal setModalClose={setOwnerModalOpen} product={ownerModalProduct} reload={reload} setReload={setReload} />}
            <EditDescription open={descriptionModalOpen} id={selectedProductDescriptionId} description={selectedProductDescription} title={selectedProductEditTitle} setModalClose={setDescriptionModalOpen} setReload={setReload} reload={reload} />
          </>
        )}
      </div>
    </>
  )
}

export default Products
