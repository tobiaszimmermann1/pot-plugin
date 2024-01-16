import React, { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { Box, IconButton, Button } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import { ExportToCsv } from "export-to-csv"
import AddMember from "./members/AddMember"
import Wallet from "./members/Wallet"
import Permissions from "./members/Permissions"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from "@mui/icons-material/Edit"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import { getYear, format, isSameYear } from "date-fns"
const __ = wp.i18n.__

const Members = () => {
  const [users, setUsers] = useState()
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState({
    message: null,
    type: null,
    active: false
  })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [walletID, setWalletID] = useState()
  const [walletName, setWalletName] = useState()
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [permissionsID, setPermissionsID] = useState()
  const [permissionsName, setPermissionsName] = useState()

  useEffect(() => {
    axios
      .get(`${appLocalizer.apiUrl}/foodcoop/v1/getUsers`, {
        headers: {
          "X-WP-Nonce": appLocalizer.nonce
        }
      })
      .then(function (response) {
        if (response.data) {
          const res = JSON.parse(response.data)
          let reArrangedUserData = []
          res.map(u => {
            let userToDo = {}
            userToDo.name = u.name
            userToDo.email = u.email
            userToDo.address = u.address
            userToDo.postcode = u.postcode
            userToDo.city = u.city
            userToDo.balance = u.balance
            userToDo.role = u.role
            userToDo.id = u.id
            userToDo.active = u.active
            userToDo.lastFee = u.last_fee
            userToDo.permission = u.permission

            reArrangedUserData.push(userToDo)
          })
          reArrangedUserData.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0))
          setUsers(reArrangedUserData)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Users Table
   */
  const [validationErrors, setValidationErrors] = useState({})

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: __("ID", "fcplugin"),
        size: 50,
        Cell: ({ cell }) => (
          <a href={`${appLocalizer.homeUrl}/wp-admin/user-edit.php?user_id=${cell.getValue()}`} target="blank">
            {cell.getValue()}
          </a>
        ),
        enableEditing: false
      },
      {
        accessorKey: "name",
        header: __("Name", "fcplugin")
      },
      {
        accessorKey: "email",
        header: __("E-Mail", "fcplugin")
      },
      {
        accessorKey: "address",
        header: __("Adresse", "fcplugin")
      },
      {
        accessorKey: "postcode",
        header: __("PLZ", "fcplugin"),
        size: 50
      },
      {
        accessorKey: "city",
        header: __("Ort", "fcplugin")
      },
      {
        accessorKey: "balance",
        header: __("Guthaben", "fcplugin"),
        enableEditing: false,
        Cell: ({ row, cell }) => (
          <Button
            onClick={() => {
              setWalletID(row.original.id)
              setWalletName(row.original.name)
              setWalletModalOpen(true)
            }}
            variant="text"
            startIcon={<AccountBalanceWalletIcon />}
          >
            {cell.getValue()}
          </Button>
        ),
        size: 30,
        enableColumnResizing: false
      },
      {
        accessorKey: "lastFee",
        header: __("Jahresbeitrag", "fcplugin") + " " + getYear(Date.now()),
        size: 50,
        enableEditing: false,
        Cell: ({ row, cell }) => {
          if (cell.getValue() && isSameYear(new Date(cell.getValue().replace(" ", "T")), Date.now())) {
            return (
              <Button variant="text" color="success" startIcon={<CheckIcon />}>
                {format(new Date(cell.getValue().replace(" ", "T")), "dd.MM.yyyy")}
              </Button>
            )
          } else {
            return (
              <Button variant="text" color="error" startIcon={<CloseIcon />}>
                {__("Nein", "fcplugin")}
              </Button>
            )
          }
        }
      },
      {
        accessorKey: "role",
        header: __("Rolle", "fcplugin"),
        enableEditing: false,
        size: 75
      },
      {
        accessorKey: "permission",
        header: __("Berechtigungen", "fcplugin"),
        enableEditing: false,
        Cell: ({ row, cell }) => {
          if (row.original.role === "customer") {
            return (
              <Button
                onClick={() => {
                  setPermissionsID(row.original.id)
                  setPermissionsName(row.original.name)
                  setPermissionsModalOpen(true)
                }}
                variant="text"
                color="primary"
                startIcon={<EditIcon />}
              >
                keine
              </Button>
            )
          }

          if (cell.getValue() !== "" && (row.original.role === "foodcoop_manager" || row.original.role === "administrator")) {
            return row.original.role === "administrator" ? (
              <Button variant="text" color="primary" startIcon={<CheckIcon />}>
                alle
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setPermissionsID(row.original.id)
                  setPermissionsName(row.original.name)
                  setPermissionsModalOpen(true)
                }}
                variant="text"
                color="primary"
                startIcon={<EditIcon />}
              >
                {JSON.parse(cell.getValue()).join(", ")}
              </Button>
            )
          }
        }
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
          `${appLocalizer.apiUrl}/foodcoop/v1/postUserDelete`,
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
          if (response.data) {
          }
          response.status == 200 &&
            setStatusMessage({
              message: JSON.parse(response.data) + " " + __("wurde gelöscht.", "fcplugin"),
              type: "successStatus",
              active: true
            })
        })
        .catch(error => console.log(error))

      users.splice(row.index, 1)
      setUsers([...users])
    },
    [users]
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
    filename: "foodcoop-users-" + new Date().toLocaleDateString() + new Date().toLocaleTimeString()
  }

  const csvExporter = new ExportToCsv(csvOptions)

  const handleExportData = () => {
    csvExporter.generateCsv(users)
  }

  const handleAddMember = values => {
    users.unshift(values)
    setUsers([...users])
  }

  // saving edits
  const handleSaveCell = (cell, value) => {
    users[cell.row.index][cell.column.id] = value

    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postUpdateUser`,
        {
          id: cell.row.original.id,
          value: value,
          cell: cell.column.id
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce
          }
        }
      )
      .catch(error => console.log(error))

    setUsers([...users])
  }

  return (
    <>
      {statusMessage.active && <div className={`statusMessage ${statusMessage.type}`}>{statusMessage.message}</div>}
      <MaterialReactTable
        columns={columns}
        data={users ?? []}
        state={{ isLoading: loading }}
        localization={MRT_Localization_DE}
        enableRowActions
        positionActionsColumn="first"
        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "",
            Cell: ({ row, table }) => (
              <Box>
                <IconButton onClick={() => handleDeleteRow(row)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )
          }
        }}
        editingMode="cell"
        enableEditing
        muiTableBodyCellEditTextFieldProps={({ cell }) => ({
          onBlur: event => {
            handleSaveCell(cell, event.target.value)
          }
        })}
        enableFullScreenToggle={false}
        initialState={{ density: "compact", pagination: { pageSize: 25 } }}
        positionToolbarAlertBanner="bottom"
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap" }}>
            <Button
              color="primary"
              //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
              onClick={handleExportData}
              startIcon={<FileDownloadIcon />}
              variant="outlined"
              size="small"
              disabled={loading}
            >
              {__("Exportieren", "fcplugin")}
            </Button>
            <Button size="small" onClick={() => setCreateModalOpen(true)} variant="outlined" disabled={false} startIcon={<PersonAddIcon />}>
              {__("Neues Mitglied", "fcplugin")}
            </Button>
          </Box>
        )}
      />
      {createModalOpen && <AddMember setModalClose={setCreateModalOpen} handleAddMember={handleAddMember} />}
      {walletModalOpen && <Wallet setModalClose={setWalletModalOpen} walletID={walletID} walletName={walletName} />}
      {permissionsModalOpen && <Permissions setModalClose={setPermissionsModalOpen} permissionsID={permissionsID} permissionsName={permissionsName} />}
    </>
  )
}

export default Members
