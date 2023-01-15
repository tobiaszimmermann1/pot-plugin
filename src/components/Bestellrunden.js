import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import AllInboxIcon from "@mui/icons-material/AllInbox"
import SaveIcon from "@mui/icons-material/Save"
import AddIcon from "@mui/icons-material/Add"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import { Box, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, CircularProgress, Stack, TextField, Tooltip } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import { format, isValid, parse } from "date-fns"
const __ = wp.i18n.__
import OrdersOfBestellrundeModal from "./bestellrunden/Orders"
import ProductsOfBestellrundeModal from "./bestellrunden/Products"
import Mutations from "./bestellrunden/Mutations"

const Bestellrunden = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
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
          console.log(res)

          res.map(b => {
            let bestellrundeToDo = {}
            bestellrundeToDo.author = b.name
            bestellrundeToDo.bestellrunde_start = format(new Date(b.bestellrunde_start), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_ende = format(new Date(b.bestellrunde_ende), "yyyy-MM-dd")
            bestellrundeToDo.bestellrunde_verteiltag = format(new Date(b.bestellrunde_verteiltag), "yyyy-MM-dd")
            bestellrundeToDo.date_created = format(new Date(b.date_created), "yyyy-MM-dd")
            bestellrundeToDo.id = b.id

            reArrangedBestellrunden.push(bestellrundeToDo)
          })

          reArrangedBestellrunden.sort((a, b) => b.id - a.id)

          setBestellrunden(reArrangedBestellrunden)
          setLoading(false)
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
            id: values.id
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response.data) {
            console.log(response)
          }
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
    console.log(values)
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
              <Box>
                {new Date(row.original.bestellrunde_start) > new Date() ? (
                  <ButtonGroup
                    variant="text"
                    aria-label="text button group"
                    sx={{
                      padding: "5px 10px 5px 10px"
                    }}
                  >
                    <Button size="small" onClick={() => table.setEditingRow(row)}>
                      <EditIcon />
                    </Button>
                    <Button size="small" onClick={() => handleDeleteRow(row)}>
                      <DeleteIcon />
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ShoppingBasketIcon />}
                      onClick={() => {
                        setSelectedBestellrunde(row.original.id)
                        setProductsModalOpen(true)
                      }}
                    >
                      {__("Produkte", "fcplugin")}
                    </Button>
                    <Button
                      size="small"
                      disabled={true}
                      startIcon={<AutoFixHighIcon />}
                      onClick={() => {
                        setSelectedBestellrunde(row.original.id)
                        setMutationsModalOpen(true)
                      }}
                    >
                      {__("Mutation", "fcplugin")}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<AllInboxIcon />}
                      onClick={() => {
                        setSelectedBestellrunde(row.original.id)
                        setOrderModalOpen(true)
                      }}
                    >
                      {__("Bestellungen", "fcplugin")}
                    </Button>
                  </ButtonGroup>
                ) : (
                  <ButtonGroup
                    variant="text"
                    aria-label="text button group"
                    sx={{
                      padding: "5px 10px 5px 10px"
                    }}
                  >
                    <Button size="small" disabled={true} onClick={() => table.setEditingRow(row)}>
                      <EditIcon />
                    </Button>
                    <Button size="small" onClick={() => handleDeleteRow(row)}>
                      <DeleteIcon />
                    </Button>
                    <Button
                      size="small"
                      disabled={false}
                      sx={{
                        color: "#ff9800"
                      }}
                      startIcon={<ShoppingBasketIcon />}
                      onClick={() => {
                        setSelectedBestellrunde(row.original.id)
                        setProductsModalOpen(true)
                      }}
                    >
                      {__("Produkte", "fcplugin")}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<AutoFixHighIcon />}
                      onClick={() => {
                        setSelectedBestellrunde(row.original.id)
                        setMutationsModalOpen(true)
                      }}
                    >
                      {__("Mutation", "fcplugin")}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<AllInboxIcon />}
                      onClick={() => {
                        setSelectedBestellrunde(row.original.id)
                        setOrderModalOpen(true)
                      }}
                    >
                      {__("Bestellungen", "fcplugin")}
                    </Button>
                  </ButtonGroup>
                )}
              </Box>
            )
          }
        }}
        editingMode={"modal"}
        enableEditing
        onEditingRowSave={handleSaveRow}
        enableFullScreenToggle={false}
        initialState={{ density: "compact" }}
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
            bestellrunde_verteiltag: format(new Date(valueDist), "yyyy-MM-dd")
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response.data) {
            console.log(response)
          }
          if (response.status == 200) {
            values["id"] = response.data
            values["bestellrunde_start"] = format(new Date(valueStart), "yyyy-MM-dd")
            values["bestellrunde_ende"] = format(new Date(valueEnd), "yyyy-MM-dd")
            values["bestellrunde_verteiltag"] = format(new Date(valueDist), "yyyy-MM-dd")
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

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{__("Bestellrunde erstellen", "fcplugin")}</DialogTitle>
      <DialogContent>
        <form onSubmit={e => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              paddingTop: "10px"
            }}
          >
            <div className="modalRow">
              <span>{__("Bestellrunde Start", "fcplugin")}</span>
              <DesktopDatePicker label="" className="bestellrundeDatePicker" inputFormat="dd.MM.yyyy" value={valueStart} onChange={e => setValueStart(e)} renderInput={params => <TextField {...params} />} />
            </div>
            <div className="modalRow">
              <span>{__("Bestellrunde Ende", "fcplugin")}</span>
              <DesktopDatePicker label="" className="bestellrundeDatePicker" inputFormat="dd.MM.yyyy" value={valueEnd} onChange={e => setValueEnd(e)} renderInput={params => <TextField {...params} />} />
            </div>
            <div className="modalRow">
              <span>{__("Bestellrunde Verteiltag", "fcplugin")}</span>
              <DesktopDatePicker label="" className="bestellrundeDatePicker" inputFormat="dd.MM.yyyy" value={valueDist} onChange={e => setValueDist(e)} renderInput={params => <TextField {...params} />} />
            </div>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={onClose}>{__("Abbrechen", "fcplugin")}</Button>
        <LoadingButton onClick={handleSubmit} variant="contained" loading={submitting} loadingPosition="start" startIcon={<SaveIcon />}>
          {__("Erstellen", "fcplugin")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
