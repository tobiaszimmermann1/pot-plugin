import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import AllInboxIcon from "@mui/icons-material/AllInbox"
import SaveIcon from "@mui/icons-material/Save"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import { format, isValid, parse, isFuture, isPast } from "date-fns"
const __ = wp.i18n.__
import OrdersOfBestellrundeModal from "./bestellrunden/Orders"
import ProductsOfBestellrundeModal from "./bestellrunden/Products"
import Mutations from "./bestellrunden/Mutations"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import FormControl from "@mui/material/FormControl"
import Grid from "@mui/material/Grid"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import UpdateIcon from "@mui/icons-material/Update"
import EmailIcon from "@mui/icons-material/Email"
import Divider from "@mui/material/Divider"
import NotificationModal from "./bestellrunden/Notification"

const Bestellrunden = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [notificationModalOpen, setNotificationModalOpen] = useState(false)
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [mutationsModalOpen, setMutationsModalOpen] = useState(false)
  const [bestellrunden, setBestellrunden] = useState()
  const [selectedBestellrunde, setSelectedBestellrunde] = useState()
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState({
    message: null,
    type: null,
    active: false
  })

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getBestellrunden`)
      .then(function (response) {
        let reArrangedBestellrunden = []
        if (response.data) {
          const res = JSON.parse(response.data)

          res.map(b => {
            let bestellrundeToDo = {}
            bestellrundeToDo.author = b.name
            bestellrundeToDo.bestellrunde_start = format(new Date(b.bestellrunde_start), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_ende = format(new Date(b.bestellrunde_ende), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_verteiltag = format(new Date(b.bestellrunde_verteiltag), "yyyy-MM-dd")
            bestellrundeToDo.id = b.id
            bestellrundeToDo.bestellrunde_name = b.bestellrunde_name
            bestellrundeToDo.bestellrunde_bild = b.bestellrunde_bild

            if (!bestellrundeToDo.bestellrunde_name) {
              bestellrundeToDo.bestellrunde_name = __("Bestellrunde", "fcplugin") + " " + bestellrundeToDo.id
            }

            reArrangedBestellrunden.push(bestellrundeToDo)
          })

          reArrangedBestellrunden.sort((objA, objB) => Number(objA.bestellrunde_start) - Number(objB.bestellrunde_start))

          setBestellrunden(reArrangedBestellrunden)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Table
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
        header: __("Status", "fcplugin"),
        enableEditing: false,
        size: 50,
        Cell: ({ row }) => {
          //           if (isBefore(parse(new Date(row.original.bestellrunde_start)), parse(new Date())) && isBefore(parse(new Date()), isBefore(parse(new Date(row.original.bestellrunde_start))))) {

          if (isFuture(new Date(row.original.bestellrunde_verteiltag)) && isPast(new Date(row.original.bestellrunde_start))) {
            return <PendingIcon color="warning" />
          } else {
            if (isPast(new Date(row.original.bestellrunde_ende))) {
              return <CheckCircleIcon color="success" />
            } else {
              return (
                <>
                  <UpdateIcon color="info" />
                </>
              )
            }
          }
        }
      },
      {
        accessorKey: "bestellrunde_bild",
        header: __("Bild", "fcplugin"),
        Cell: ({ cell }) => (cell.getValue() ? <img src={cell.getValue()} height="35px" /> : ""),
        enableSorting: false,
        size: 50
      },
      {
        accessorKey: "bestellrunde_name",
        header: __("Bezeichnung", "fcplugin")
      },
      {
        accessorKey: "bestellrunde_start",
        header: __("Bestellfenster Start", "fcplugin"),
        size: 80,
        muiTableBodyCellEditTextFieldProps: {
          type: "date"
        },
        Cell: ({ cell }) => format(new Date(cell.getValue()), "dd.MM.yyyy"),
        sortingFn: "datetime",
        enableSorting: false
      },
      {
        accessorKey: "bestellrunde_ende",
        header: __("Bestellfenster Ende", "fcplugin"),
        size: 80,
        muiTableBodyCellEditTextFieldProps: {
          type: "date"
        },
        Cell: ({ cell }) => format(new Date(cell.getValue()), "dd.MM.yyyy"),
        sortingFn: "datetime",
        enableSorting: false
      },
      {
        accessorKey: "bestellrunde_verteiltag",
        header: __("Verteilung", "fcplugin"),
        size: 80,
        muiTableBodyCellEditTextFieldProps: {
          type: "date"
        },
        Cell: ({ cell }) => format(new Date(cell.getValue()), "dd.MM.yyyy"),
        sortingFn: "datetime",
        enableSorting: false
      }
    ],
    []
  )

  async function handleSaveRow({ exitEditingMode, row, values }) {
    bestellrunden[row.index] = values

    const isValidDateStart = isValid(parse(values.bestellrunde_start, "yyyy-MM-dd", new Date()))
    const isValidDateEnd = isValid(parse(values.bestellrunde_ende, "yyyy-MM-dd", new Date()))
    const isValidDateVerteil = isValid(parse(values.bestellrunde_verteiltag, "yyyy-MM-dd", new Date()))

    if (isValidDateStart && isValidDateEnd && isValidDateVerteil) {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postUpdateBestellrunde`,
          {
            bestellrunde_start: format(new Date(values.bestellrunde_start), "yyyy-MM-dd"),
            bestellrunde_ende: format(new Date(values.bestellrunde_ende), "yyyy-MM-dd"),
            bestellrunde_verteiltag: format(new Date(values.bestellrunde_verteiltag), "yyyy-MM-dd"),
            id: values.id,
            bestellrunde_name: values.bestellrunde_name,
            bestellrunde_bild: values.bestellrunde_bild
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
              message: __("Bestellrunde wurde gespeichert.", "fcplugin"),
              type: "successStatus",
              active: true
            })
        })
        .catch(error => console.log(error))

      // update table values
      setBestellrunden([...bestellrunden])
      exitEditingMode() //required to exit editing mode
    } else {
      alert(__("Datumformat ist ungültig", "fcplugin"))
    }
  }

  function handleDeleteRow(row) {
    if (!confirm(row.getValue("id") + " " + __("löschen?", "fcplugin"))) {
      return
    }

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postBestellrundeDelete`,
        {
          id: row.getValue("id")
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .then(function (response) {
        if (response.data) {
          if (response.data === "false") {
            alert(__("Bestellrunde", "fcplugin") + " " + response.data + " " + __("kann nicht gelöscht werden, da schon Bestellungen existieren.", "fcplugin"))
          } else {
            bestellrunden.splice(row.index, 1)
            setBestellrunden([...bestellrunden])

            setStatusMessage({
              message: response.data + " " + __("wurde gelöscht.", "fcplugin"),
              type: "successStatus",
              active: true
            })
          }
        }
      })
      .catch(error => console.log(error))
  }

  useEffect(() => {
    setTimeout(() => {
      setStatusMessage({
        message: null,
        type: null,
        active: false
      })
    }, 15000)
  }, [statusMessage])

  const handleCreateNewRow = values => {
    bestellrunden.unshift(values)
    setBestellrunden([...bestellrunden])
  }

  return (
    <>
      {statusMessage.active && <div className={`statusMessage ${statusMessage.type}`}>{statusMessage.message}</div>}
      <MaterialReactTable
        columns={columns}
        data={bestellrunden ?? []}
        state={{ isLoading: loading }}
        localization={MRT_Localization_DE}
        enableRowActions
        positionActionsColumn="first"
        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "",
            Cell: ({ row, table }) => (
              <Box sx={{ display: "flex", gap: "5px", p: "0.5rem", flexWrap: "nowrap" }}>
                <IconButton color="#cccccc" size="small" onClick={() => table.setEditingRow(row)}>
                  <EditIcon />
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <IconButton color="#cccccc" size="small" onClick={() => handleDeleteRow(row)}>
                  <DeleteIcon />
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <Button
                  sx={{ color: "rgba(0, 0, 0, 0.54)" }}
                  size="small"
                  startIcon={<ShoppingBasketIcon />}
                  onClick={() => {
                    setSelectedBestellrunde(row.original.id)
                    setProductsModalOpen(true)
                  }}
                >
                  {__("Produkte", "fcplugin")}
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  sx={{ color: "rgba(0, 0, 0, 0.54)" }}
                  size="small"
                  startIcon={<AutoFixHighIcon />}
                  onClick={() => {
                    setSelectedBestellrunde(row.original.id)
                    setMutationsModalOpen(true)
                  }}
                >
                  {__("Mutation", "fcplugin")}
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  sx={{ color: "rgba(0, 0, 0, 0.54)" }}
                  size="small"
                  startIcon={<AllInboxIcon />}
                  onClick={() => {
                    setSelectedBestellrunde(row.original.id)
                    setOrderModalOpen(true)
                  }}
                >
                  {__("Bestellungen", "fcplugin")}
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  sx={{ color: "rgba(0, 0, 0, 0.54)" }}
                  size="small"
                  startIcon={<EmailIcon />}
                  onClick={() => {
                    setSelectedBestellrunde(row.original.id)
                    setNotificationModalOpen(true)
                  }}
                >
                  {__("Benachrichtigung", "fcplugin")}
                </Button>
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
            <Button size="small" onClick={() => setCreateModalOpen(true)} variant="outlined" disabled={loading} startIcon={<AddIcon />}>
              {__("Neue Bestellrunde", "fcplugin")}
            </Button>
          </Box>
        )}
      />
      <CreateNewBestellrundeModal columns={columns} open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateNewRow} />
      <OrdersOfBestellrundeModal open={orderModalOpen} id={selectedBestellrunde} setModalClose={setOrderModalOpen} />
      <NotificationModal open={notificationModalOpen} id={selectedBestellrunde} setModalClose={setNotificationModalOpen} />
      {productsModalOpen && <ProductsOfBestellrundeModal id={selectedBestellrunde} setModalClose={setProductsModalOpen} />}
      {mutationsModalOpen && <Mutations id={selectedBestellrunde} setModalClose={setMutationsModalOpen} />}
    </>
  )
}

export default Bestellrunden

/**
 * Modal: Craete new Bestellrunde
 */
export const CreateNewBestellrundeModal = ({ open, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = () => {
    const isValidDateStart = isValid(valueStart)
    const isValidDateEnd = isValid(valueEnd)
    const isValidDateVerteil = isValid(valueDist)

    if (isValidDateStart && isValidDateEnd && isValidDateVerteil) {
      setSubmitting(true)
      let values = {}

      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postCreateBestellrunde`,
          {
            bestellrunde_start: format(new Date(valueStart), "yyyy-MM-dd"),
            bestellrunde_ende: format(new Date(valueEnd), "yyyy-MM-dd"),
            bestellrunde_verteiltag: format(new Date(valueDist), "yyyy-MM-dd"),
            bestellrunde_name: valueName,
            bestellrunde_bild: valueImg
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response.status == 200) {
            values["id"] = response.data
            values["bestellrunde_start"] = format(new Date(valueStart), "yyyy-MM-dd")
            values["bestellrunde_ende"] = format(new Date(valueEnd), "yyyy-MM-dd")
            values["bestellrunde_verteiltag"] = format(new Date(valueDist), "yyyy-MM-dd")
            values["bestellrunde_name"] = valueName
            onSubmit(values)
            setSubmitting(false)
            onClose()
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          setValueStart(null)
          setValueEnd(null)
          setValueDist(null)
        })
    } else {
      alert(__("Datumformat ist ungültig", "fcplugin"))
    }
  }

  const [valueStart, setValueStart] = useState(format(new Date(), "dd.MM.yyyy"))
  const [valueEnd, setValueEnd] = useState(format(new Date(), "dd.MM.yyyy"))
  const [valueDist, setValueDist] = useState(format(new Date(), "dd.MM.yyyy"))
  const [valueName, setValueName] = useState("")
  const [valueImg, setValueImg] = useState("")

  return (
    <Dialog fullScreen open={open} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
      <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <DialogTitle textAlign="center">{__("Bestellrunde erstellen", "fcplugin")}</DialogTitle>

          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent
        dividers={scroll === "paper"}
        sx={{
          paddingTop: "20px",
          minHeight: "500px"
        }}
      >
        <form onSubmit={e => e.preventDefault()}>
          <Box sx={{ padding: 2 }}>
            <Grid container spacing={2} rowGap={2} alignItems="baseline">
              <Grid item xs={4}>
                {__("Bestellrunde Bezeichnung", "fcplugin")}
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <TextField size="normal" id="bestellrunde_name" label={__("Bestellrunde Bezeichnung", "fcplugin")} name="bestellrunde_name" variant="outlined" value={valueName} onChange={e => setValueName(e.target.value)} />
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                {__("Bestellrunde Bild", "fcplugin")}
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <TextField size="normal" id="bestellrunde_bild" label={__("URL Bild", "fcplugin")} name="bestellrunde_bild" variant="outlined" value={valueImg} onChange={e => setValueImg(e.target.value)} />
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                {__("Bestellrunde Start", "fcplugin")}
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <DesktopDatePicker disablePast label="Bestellrunde Start" className="bestellrundeDatePicker" inputFormat="dd.MM.yyyy" value={valueStart} onChange={e => setValueStart(e)} renderInput={params => <TextField {...params} />} />
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                {__("Bestellrunde Ende", "fcplugin")}
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <DesktopDatePicker disablePast label="Bestellrunde Ende" className="bestellrundeDatePicker" inputFormat="dd.MM.yyyy" value={valueEnd} onChange={e => setValueEnd(e)} renderInput={params => <TextField {...params} />} />
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                {__("Verteiltag", "fcplugin")}
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <DesktopDatePicker disablePast label="Verteiltag" className="bestellrundeDatePicker" inputFormat="dd.MM.yyyy" value={valueDist} onChange={e => setValueDist(e)} renderInput={params => <TextField {...params} />} />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />} size="large">
                  {__("Erstellen", "fcplugin")}
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}
