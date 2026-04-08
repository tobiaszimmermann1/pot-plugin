import React, { useState, useEffect, useMemo } from "react"
import { apiGet } from "../../utils/api"
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
      apiGet("getBestellungen", { bestellrunde: id })
        .then(res => {
          if (res) {
            setOrders(res)
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
      apiGet("getReceiptsPDF", { bestellrunde: id })
        .then(res => {
          if (res) {
            const linkSource = `data:application/pdf;base64,${res}`
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
      apiGet("getDistListPDF", { bestellrunde: id })
        .then(res => {
          if (res) {
            const linkSource = `data:application/pdf;base64,${res}`
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
      apiGet("getDistListDetailPDF", { bestellrunde: id })
        .then(res => {
          if (res) {
            const linkSource = `data:application/pdf;base64,${res}`
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
      apiGet("getOrderListPDF", { bestellrunde: id })
        .then(res => {
          if (res && res.success) {
            const binaryString = atob(res.data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }

            // Create blob and download link
            const blob = new Blob([bytes], { type: res.mimetype })
            const url = URL.createObjectURL(blob)

            // Trigger download
            const downloadLink = document.createElement("a")
            downloadLink.href = url
            downloadLink.download = res.filename
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
            URL.revokeObjectURL(url)

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
      apiGet("getCategoryListPDF", { bestellrunde: id })
        .then(res => {
          if (res) {
            const linkSource = `data:application/pdf;base64,${res}`
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
    if (!orders) return

    const lieferantenSet = new Set()
    const productsSet = new Set()
    const usersSet = new Set()
    const productsData = {}
    const orderItems = []

    orders.forEach(order => {
      usersSet.add(order.customer_name)

      order.line_items.forEach(lineItem => {
        const supplier = lineItem.allmeta?.[0]?.value ?? ""
        const unit = lineItem.allmeta?.[1]?.value ?? ""
        const rawSku = lineItem.product_sku ?? lineItem.allmeta?.[5]?.value ?? null

        const productKey = rawSku ? rawSku : `${lineItem.product_name}::${lineItem.item_id}`

        orderItems.push({
          user: order.customer_name,
          productKey,
          quantity: Number(lineItem.quantity) || 0,
          supplier
        })

        if (!productsSet.has(productKey)) {
          productsSet.add(productKey)
          productsData[productKey] = {
            name: lineItem.product_name,
            sku: rawSku,
            supplier,
            unit
          }
        }

        lieferantenSet.add(supplier)
      })
    })

    const lieferanten = Array.from(lieferantenSet)
    const users = Array.from(usersSet)

    const dataMatrix = {}
    const usedSheetNames = new Set()

    lieferanten.forEach(lieferant => {
      const rows = []

      const productsBySupplier = Array.from(productsSet).filter(pk => productsData[pk]?.supplier === lieferant)

      const usersBySupplier = [...new Set(orderItems.filter(oi => oi.supplier === lieferant).map(oi => oi.user))]

      productsBySupplier.forEach(productKey => {
        const pd = productsData[productKey]

        const row = {
          product: pd.name,
          sku: pd.sku,
          supplier: pd.supplier,
          unit: pd.unit
        }

        usersBySupplier.forEach(user => {
          const qty = orderItems.filter(oi => oi.user === user && oi.supplier === lieferant && oi.productKey === productKey).reduce((sum, oi) => sum + oi.quantity, 0)

          if (qty > 0) {
            row[user] = qty.toString()
          }
        })

        rows.push(row)
      })

      // --- SAFE sheet name ---
      let sheetName = (lieferant || "").substring(0, 31)
      let counter = 1
      while (usedSheetNames.has(sheetName)) {
        const suffix = `_${counter}`
        sheetName = sheetName.substring(0, 31 - suffix.length) + suffix
        counter++
      }
      usedSheetNames.add(sheetName)

      dataMatrix[sheetName] = rows
    })

    setExportData(dataMatrix)
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
