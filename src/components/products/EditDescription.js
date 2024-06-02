import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Alert } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import SaveIcon from "@mui/icons-material/Save"
import { Editor } from "@tinymce/tinymce-react"
const __ = wp.i18n.__

function EditDescription({ id, open, setModalClose, description, title, reload, setReload }) {
  const [newDescription, setNewDescription] = useState("")

  const handleSubmit = () => {
    axios
      .post(
        `${appLocalizer.apiUrl}/foodcoop/v1/postProductDescriptionUpdate`,
        {
          id: id,
          description: newDescription,
        },
        {
          headers: {
            "X-WP-Nonce": appLocalizer.nonce,
          },
        }
      )
      .catch((error) => console.log(error))
      .finally(() => {
        setReload(reload + 1)
        setModalClose(false)
      })
  }

  const editorRef = useRef(null)

  function editorChange() {
    setNewDescription(editorRef.current.getContent())
  }

  return (
    <>
      <Dialog fullScreen open={open} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">
              {__("Beschreibung für", "fcplugin")} {title}
            </DialogTitle>
            <DialogActions>
              <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loadingPosition="start" startIcon={<SaveIcon />}>
                {__("Speichern", "fcplugin")}
              </LoadingButton>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
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
            minHeight: "500px",
          }}
        >
          <Editor
            tinymceScriptSrc={`${appLocalizer.pluginUrl}/scripts/tinymce/js/tinymce/tinymce.min.js`}
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue={description}
            init={{
              paste_data_images: false,
              width: "100%",
              height: 400,
              menubar: false,
              paste_preprocess: function (plugin, args) {
                args.content = args.content.replace(/<img[^>]*>/g, "")
              },
              plugins: ["advlist", "autolink", "lists", "link", "charmap", "preview", "anchor", "visualblocks", "wordcount"],
              toolbar: "undo redo | blocks | " + "bold italic backcolor | alignleft aligncenter " + "alignright alignjustify | bullist numlist | " + "removeformat",
              content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
            }}
            onEditorChange={editorChange}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditDescription
