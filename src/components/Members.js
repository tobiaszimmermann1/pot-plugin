import React, { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { Box, IconButton, Button } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import AddIcon from "@mui/icons-material/Add"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import { ExportToCsv } from "export-to-csv"
import AddMember from "./members/AddMember"
import Wallet from "./members/Wallet"
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
          console.log(res)
          let reArrangedUserData = []
          res.map(u => {
            let userToDo = {}
            userToDo.name = u.name
            userToDo.email = u.email
            userToDo.address = u.address
            userToDo.balance = u.balance
            userToDo.role = u.role
            userToDo.id = u.id

            reArrangedUserData.push(userToDo)
          })
          setUsers(reArrangedUserData)
          setLoading(false)
        }
      })
      .catch(error => console.log(error))
  }, [])

  /**
   * Users Table
   */

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
        )
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
        accessorKey: "balance",
        header: __("Guthaben", "fcplugin")
      },
      {
        accessorKey: "role",
        header: __("Rolle", "fcplugin")
      }
    ],
    []
  )

  const handleDeleteRow = useCallback(
    row => {
      console.log(row.getValue("id"))
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
            console.log(response)
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
    console.log("test", values)
    users.unshift(values)
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
                <IconButton>
                  <AccountBalanceWalletIcon
                    onClick={() => {
                      setWalletID(row.original.id)
                      setWalletName(row.original.name)
                      setWalletModalOpen(true)
                    }}
                  />
                </IconButton>
                <IconButton>
                  <DeleteIcon onClick={() => handleDeleteRow(row)} />
                </IconButton>
              </Box>
            )
          }
        }}
        editingMode={"modal"}
        enableEditing={false}
        enableFullScreenToggle={false}
        initialState={{ density: "compact" }}
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
            <Button size="small" onClick={() => setCreateModalOpen(true)} variant="outlined" disabled={false} startIcon={<AddIcon />}>
              {__("Neues Mitglied", "fcplugin")}
            </Button>
          </Box>
        )}
      />
      {createModalOpen && <AddMember setModalClose={setCreateModalOpen} handleAddMember={handleAddMember} />}
      {walletModalOpen && <Wallet setModalClose={setWalletModalOpen} walletID={walletID} walletName={walletName} />}
    </>
  )
}

export default Members
