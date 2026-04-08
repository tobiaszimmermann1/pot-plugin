import React, { useState, useMemo, useEffect, useCallback } from "react"
import { apiGet, apiPost } from "../../utils/api"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { Box, Button, Divider } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import ImageIcon from "@mui/icons-material/Image"
import AddIcon from "@mui/icons-material/Add"
import AddCategory from "./AddCategory"
const __ = wp.i18n.__

function Categories() {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [categories, setCategories] = useState()

  useEffect(() => {
    apiGet("getProductCategories")
      .then(res => {
        if (res) {
          console.log(res)
          setCategories(res)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  const columns = useMemo(
    () => [
      {
        accessorKey: "term_id",
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
        size: 300
      },
      {
        accessorKey: "count",
        header: __("Anzahl Produkte", "fcplugin"),
        enableEditing: false,
        size: 50
      }
    ],
    []
  )

  async function handleSaveRow({ exitEditingMode, row, values }) {
    categories[row.index] = values
    apiPost("postCategoryUpdate", {
          updatedValues: values,
          id: values.term_id
        })
      .then(res => {
        console.log(res)
      })
      .catch(error => console.log(error))

    // update table values
    setCategories([...categories])
    exitEditingMode() //required to exit editing mode
  }

  const handleDeleteRow = useCallback(
    row => {
      if (!confirm(row.getValue("name") + " " + __("löschen?", "fcplugin"))) {
        return
      }

      console.log(row.getValue("term_id"))

      apiPost("postCategoryDelete", {
            name: row.getValue("name"),
            id: row.getValue("term_id")
          })
        .then(res => {
        })
        .catch(error => console.log(error))

      categories.splice(row.index, 1)
      setCategories([...categories])
    },
    [categories]
  )

  const handleAddCategory = values => {
    categories.unshift(values)
    setCategories([...categories])
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={categories ?? []}
        state={{ isLoading: loading }}
        localization={MRT_Localization_DE}
        enableColumnResizing
        enableRowActions
        positionActionsColumn="first"
        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "",
            size: 50,
            Cell: ({ row, table }) => (
              <Box sx={{ display: "flex", gap: "5px", p: "0.5rem", flexWrap: "nowrap" }}>
                <IconButton onClick={() => table.setEditingRow(row)}>
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
        onEditingRowSave={handleSaveRow}
        enableFullScreenToggle={false}
        initialState={{ density: "compact", pagination: { pageSize: 25 } }}
        positionToolbarAlertBanner="bottom"
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap" }}>
            <Button size="small" onClick={() => setCreateModalOpen(true)} variant="outlined" startIcon={<AddIcon />}>
              {__("Neue Kategorie", "fcplugin")}
            </Button>
          </Box>
        )}
      />
      {createModalOpen && <AddCategory setModalClose={setCreateModalOpen} handleAddCategory={handleAddCategory} />}
    </>
  )
}

export default Categories
