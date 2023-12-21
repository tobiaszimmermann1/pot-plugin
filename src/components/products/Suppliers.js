import React, { useState, useMemo, useEffect, useCallback } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { Box, Button, Divider } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import ImageIcon from "@mui/icons-material/Image"
import AddIcon from "@mui/icons-material/Add"
import AddSupplier from "./AddSupplier"
const __ = wp.i18n.__

function Suppliers() {
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [suppliers, setSuppliers] = useState()
  const [supplierToEdit, setSupplierToEdit] = useState(null)

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getSuppliers`)
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          console.log(res)
          setSuppliers(res)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: __("ID", "fcplugin"),
        enableEditing: false,
        size: 30
      },
      {
        accessorKey: "image",
        header: __("", "fcplugin"),
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <a href={`${appLocalizer.homeUrl}/wp-admin/term.php?taxonomy=product_cat&tag_ID=${cell.row.original.term_id}`} target="blank">
              <img src={cell.getValue()} height={30} />
            </a>
          ) : (
            <a href={`${appLocalizer.homeUrl}/wp-admin/term.php?taxonomy=product_cat&tag_ID=${cell.row.original.term_id}`} target="blank">
              <ImageIcon style={{ color: "#cccccc" }} />
            </a>
          ),
        size: 30,
        enableEditing: false
      },
      {
        accessorKey: "name",
        header: __("Name", "fcplugin"),
        enableEditing: true,
        size: 250
      },
      {
        accessorKey: "short_description",
        header: __("Kurzbeschrieb", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "address",
        header: __("Adresse", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "phone",
        header: __("Telefon", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "email",
        header: __("Email", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "website",
        header: __("Webseite", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "contact",
        header: __("Kontakt", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "customerNumber",
        header: __("Kundennummer", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "note",
        header: __("Notiz", "fcplugin"),
        enableEditing: false,
        size: 150
      },
      {
        accessorKey: "description",
        header: __("Beschreibung", "fcplugin"),
        enableEditing: false,
        size: 30,
        Cell: ({ cell }) => "...",
        size: 30,
        enableEditing: false
      }
    ],
    []
  )

  const handleDeleteRow = useCallback(
    row => {
      if (!confirm(row.getValue("name") + " " + __("löschen?", "fcplugin"))) {
        return
      }

      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postSupplierDelete`,
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
          const res = JSON.parse(response.data)
        })
        .catch(error => console.log(error))

      suppliers.splice(row.index, 1)
      setSuppliers([...suppliers])
    },
    [suppliers]
  )

  const handleAddSupplier = values => {
    suppliers.unshift(values)
    setSuppliers([...suppliers])
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={suppliers ?? []}
        state={{ isLoading: loading }}
        localization={MRT_Localization_DE}
        enableColumnResizing
        enableRowActions
        positionActionsColumn="first"
        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "",
            size: 100,
            Cell: ({ row, table }) => (
              <Box sx={{ display: "flex", gap: "5px", p: "0.5rem", flexWrap: "nowrap" }}>
                <IconButton
                  onClick={() => {
                    setSupplierToEdit({
                      id: row.getValue("id"),
                      name: row.getValue("name"),
                      image: row.getValue("image"),
                      shortDescription: row.getValue("short_description"),
                      description: row.getValue("description"),
                      address: row.getValue("address"),
                      phone: row.getValue("phone"),
                      email: row.getValue("email"),
                      website: row.getValue("website"),
                      customerNumber: row.getValue("customerNumber"),
                      contact: row.getValue("contact"),
                      note: row.getValue("note")
                    })
                    setCreateModalOpen(true)
                  }}
                >
                  <EditIcon />
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
        enableFullScreenToggle={false}
        initialState={{ density: "compact", pagination: { pageSize: 25 } }}
        positionToolbarAlertBanner="bottom"
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap" }}>
            <Button
              size="small"
              onClick={() => {
                setSupplierToEdit(null)
                setCreateModalOpen(true)
              }}
              variant="outlined"
              startIcon={<AddIcon />}
            >
              {__("Neuer Lieferant", "fcplugin")}
            </Button>
          </Box>
        )}
      />
      {createModalOpen && <AddSupplier setModalClose={setCreateModalOpen} handleAddSupplier={handleAddSupplier} supplierToEdit={supplierToEdit} />}
    </>
  )
}

export default Suppliers
