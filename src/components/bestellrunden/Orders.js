import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import EditIcon from "@mui/icons-material/Edit"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import GridOnIcon from "@mui/icons-material/GridOn"
import { Box, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { format, parse } from "date-fns"
import { useExcelDownloder } from "react-xls"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
const __ = wp.i18n.__

function OrdersOfBestellrundeModal({ id, open, setModalClose }) {
  const [orders, setOrders] = useState()
  const [loading, setLoading] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(true)

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
        Cell: ({ cell }) => format(parse(cell.getValue(), "yyyy-mm-dd", new Date()), "dd.mm.yyyy")
      },
      {
        accessorKey: "customer_name",
        header: __("Name", "fcplugin"),
        size: 80
      },
      {
        accessorKey: "total",
        header: __("Total", "fcplugin"),
        size: 80
      }
    ],
    []
  )

  useEffect(() => {
    if (id) {
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getBestellungen?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            setOrders(JSON.parse(response.data))
            setLoading(false)
            setButtonLoading(false)
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
  }, [id])

  /**
   * Get Receipts API call
   */
  function handleGetReceipts() {
    if (id) {
      setButtonLoading(true)
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getReceiptsPDF?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            const linkSource = `data:application/pdf;base64,${response.data}`
            const downloadLink = document.createElement("a")
            const fileName = `bestellrunde-${id}-receipts.pdf`
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
  }

  /**
   * Get Distribution List API call
   */
  function handleGetDistList() {
    if (id) {
      setButtonLoading(true)
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getDistListPDF?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            const linkSource = `data:application/pdf;base64,${response.data}`
            const downloadLink = document.createElement("a")
            const fileName = `bestellrunde-${id}-distlist.pdf`
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
        .finally(() => {
          setButtonLoading(false)
        })
    }
  }

  /**
   * Get Distribution List Detail API call
   */
  function handleGetDistListDetail() {
    if (id) {
      setButtonLoading(true)
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getDistListDetailPDF?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            const linkSource = `data:application/pdf;base64,${response.data}`
            const downloadLink = document.createElement("a")
            const fileName = `bestellrunde-${id}-distlist-detail.pdf`
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
        .finally(() => {
          setButtonLoading(false)
        })
    }
  }

  /**
   * Get Order List
   */
  function handleGetOrderList() {
    if (id) {
      setButtonLoading(true)
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getOrderListPDF?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            const linkSource = `data:application/pdf;base64,${response.data}`
            const downloadLink = document.createElement("a")
            const fileName = `bestellrunde-${id}-orderlist.pdf`
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
        .finally(() => {
          setButtonLoading(false)
        })
    }
  }

  /**
   * Get Category List
   */

  function handleGetCategoryList() {
    if (id) {
      setButtonLoading(true)
      axios
        .get(`${appLocalizer.apiUrl}/foodcoop/v1/getCategoryListPDF?bestellrunde=${id}`, {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        })
        .then(function (response) {
          if (response.data) {
            const linkSource = `data:application/pdf;base64,${response.data}`
            const downloadLink = document.createElement("a")
            const fileName = `bestellrunde-${id}-categorylist.pdf`
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
        .finally(() => {
          setButtonLoading(false)
        })
    }
  }

  /**
   * Get Data Export API call
   */
  const { ExcelDownloder, Type } = useExcelDownloder()
  const [exportData, setExportData] = useState()

  useEffect(() => {
    if (orders) {
      let lieferanten = []
      let products = []
      let productsData = {}
      let users = []
      let orderItems = []

      orders.map(order => {
        // add user to array, if it is not already
        !users.includes(order.customer_name) && users.push(order.customer_name)
        // map line_items of order
        order.line_items.map(lineItem => {
          // add line_item to array
          orderItems.push({
            user: order.customer_name,
            itemId: lineItem.item_id,
            name: lineItem.product_name,
            quantity: lineItem.quantity,
            lieferant: lineItem.allmeta[0]?.value,
            einheit: lineItem.allmeta[1]?.value
          })

          if (typeof lineItem.product_sku !== "undefined") {
            // add product to array, if it is not already and add product data to products object
            !products.includes(lineItem.product_name) && products.push([lineItem.product_name, lineItem.allmeta[0]?.value, lineItem.allmeta[1]?.value])
            productsData[lineItem.product_name] = [lineItem.product_name, lineItem.product_sku, lineItem.allmeta[0]?.value, lineItem.allmeta[1]?.value]
            // add lieferant to array, if it is not already
            !lieferanten.includes(lineItem.allmeta[0]?.value) && lieferanten.push(lineItem.allmeta[0]?.value)
          } else if (typeof lineItem.allmeta[5] !== "undefined") {
            // add product to array, if it is not already and add product data to products object
            !products.includes(lineItem.product_name) && products.push([lineItem.product_name, lineItem.allmeta[0]?.value, lineItem.allmeta[1]?.value])
            productsData[lineItem.product_name] = [lineItem.product_name, lineItem.allmeta[5].value, lineItem.allmeta[0]?.value, lineItem.allmeta[1]?.value]
            // add lieferant to array, if it is not already
            !lieferanten.includes(lineItem.allmeta[0]?.value) && lieferanten.push(lineItem.allmeta[0]?.value)
          } else {
            // add product to array, if it is not already and add product data to products object
            !products.includes(lineItem.product_name) && products.push([lineItem.product_name, lineItem.allmeta[0]?.value, lineItem.allmeta[1]?.value])
            productsData[lineItem.product_name] = [lineItem.product_name, "-", lineItem.allmeta[0]?.value, lineItem.allmeta[1]?.value]
            // add lieferant to array, if it is not already
            !lieferanten.includes(lineItem.allmeta[0]?.value) && lieferanten.push(lineItem.allmeta[0]?.value)
          }
        })
      })

      // structure the products data
      let productsByLieferant = []
      lieferanten.forEach(lieferant => {
        let productsForThisLieferant = []
        products.map(product => {
          if (product[1] === lieferant) {
            !productsForThisLieferant.includes(product[0]) && productsForThisLieferant.push(product[0])
          }
        })
        productsByLieferant[lieferant] = productsForThisLieferant
      })

      // structure the products data
      let usersByLieferant = []
      lieferanten.forEach(lieferant => {
        let usersForThisLieferant = []
        orderItems.map(orderItem => {
          if (orderItem.lieferant === lieferant) {
            !usersForThisLieferant.includes(orderItem.user) && usersForThisLieferant.push(orderItem.user)
          }
        })
        usersByLieferant[lieferant] = usersForThisLieferant
      })

      // create xlsx data matrix
      let dataMatrix = {}
      lieferanten.map(lieferant => {
        let rows = []

        productsByLieferant[lieferant].map(product => {
          let row = { product: product, sku: productsData[product][1], supplier: productsData[product][2], unit: productsData[product][3] }

          usersByLieferant[lieferant].map(user => {
            orderItems.map(orderItem => {
              if (orderItem.user === user && orderItem.lieferant === lieferant && orderItem.name === product) {
                row[user] = orderItem.quantity
              }
            })
          })
          rows.push(row)
        })
        //shorten lieferant string to max 30 chars
        let lieferantString = lieferant
        if (typeof lieferant !== "undefined") {
          if (lieferant.length > 30) {
            lieferantString = lieferant.substring(0, 29)
          }
          dataMatrix[lieferantString] = rows
        }
      })
      setExportData(dataMatrix)
    }
  }, [orders, id])

  return (
    <>
      <Dialog fullScreen open={open} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Bestellungen in Bestellrunde", "fcplugin")} {id}
            </DialogTitle>
            <DialogActions>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setOrders(null)
                  setLoading(true)
                  setExportData(null)
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
            columns={columns}
            data={orders ?? []}
            state={{ isLoading: loading }}
            localization={MRT_Localization_DE}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                border: "0px"
              }
            }}
            displayColumnDefOptions={{
              "mrt-row-actions": {
                header: "",
                Cell: ({ row, table }) => (
                  <Box>
                    <IconButton>
                      <EditIcon onClick={() => table.setEditingRow(row)} />
                    </IconButton>
                  </Box>
                )
              }
            }}
            enableFullScreenToggle={false}
            initialState={{ density: "compact", pagination: { pageSize: 25 } }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                <ButtonGroup variant="text" aria-label="outlined button group">
                  <LoadingButton onClick={handleGetReceipts} variant="text" loading={buttonLoading} loadingPosition="start" startIcon={<PictureAsPdfIcon />}>
                    {__("Quittungen", "fcplugin")}
                  </LoadingButton>
                  <LoadingButton onClick={handleGetDistList} variant="text" loading={buttonLoading} loadingPosition="start" startIcon={<PictureAsPdfIcon />}>
                    {__("Verteillisten", "fcplugin")}
                  </LoadingButton>
                  <LoadingButton onClick={handleGetDistListDetail} variant="text" loading={buttonLoading} loadingPosition="start" startIcon={<PictureAsPdfIcon />}>
                    {__("Verteillisten Detail", "fcplugin")}
                  </LoadingButton>
                  <LoadingButton onClick={handleGetOrderList} variant="text" loading={buttonLoading} loadingPosition="start" startIcon={<PictureAsPdfIcon />}>
                    {__("Bestellformulare", "fcplugin")}
                  </LoadingButton>
                  <LoadingButton onClick={handleGetCategoryList} variant="text" loading={buttonLoading} loadingPosition="start" startIcon={<PictureAsPdfIcon />}>
                    {__("Kategorielisten", "fcplugin")}
                  </LoadingButton>
                  {/*
                  {exportData ? (
                    <LoadingButton variant="text" loading={buttonLoading} loadingPosition="start" startIcon={<GridOnIcon />}>
                      <ExcelDownloder data={exportData} filename={`bestellrunde-${id}-data`} type={Type.Link}>
                        {__("Datenexport", "fcplugin")}
                      </ExcelDownloder>{" "}
                    </LoadingButton>
                  ) : (
                    <LoadingButton variant="text" loading={buttonLoading} loadingPosition="start" startIcon={<GridOnIcon />}>
                      {__("Datenexport", "fcplugin")}
                    </LoadingButton>
                  )}
                  */}
                </ButtonGroup>
              </Box>
            )}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default OrdersOfBestellrundeModal
