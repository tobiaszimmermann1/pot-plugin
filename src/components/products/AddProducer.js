import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Alert, Button, Card, CardContent, CardActions, CardMedia, Box } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { Editor } from "@tinymce/tinymce-react"
import Grid from "@mui/material/Grid"
const __ = wp.i18n.__

function AddProducer({ setModalClose, handleAddProducer, producerToEdit }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState()
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")
  const [initialDescription, setInitialDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [origin, setOrigin] = useState("")
  const [website, setWebsite] = useState("")

  useEffect(() => {
    if (producerToEdit) {
      setName(producerToEdit.name)
      setImage(producerToEdit.image)
      setDescription(producerToEdit.description)
      setInitialDescription(producerToEdit.description)
      setOrigin(producerToEdit.origin)
      setWebsite(producerToEdit.website)
      setShortDescription(producerToEdit.shortDescription)
    }
  }, [producerToEdit])

  const handleSubmit = () => {
    setSubmitting(true)

    if (name.trim() === "") {
      setError(__("Felder dürfen nicht leer sein.", "fcplugin"))
      setSubmitting(false)
    } else {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postAddProducer`,
          {
            name: name,
            short_description: shortDescription,
            image: image,
            description: description,
            origin: origin,
            website: website
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response) {
            handleAddProducer({
              id: JSON.parse(response.data),
              name: name,
              image: image,
              short_description: shortDescription,
              image: image,
              description: description,
              origin: origin,
              website: website
            })
            setModalClose(false)
          }
        })
        .catch(error => setError(error.message))
        .finally(() => {
          setSubmitting(false)
        })
    }
  }

  const handleUpdate = () => {
    setSubmitting(true)

    if (name.trim() === "") {
      setError(__("Felder dürfen nicht leer sein.", "fcplugin"))
      setSubmitting(false)
    } else {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postProducerUpdate`,
          {
            id: producerToEdit.id,
            name: name,
            short_description: shortDescription,
            image: image,
            description: description,
            origin: origin,
            website: website
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response) {
            setModalClose(false)
          }
        })
        .catch(error => setError(error.message))
        .finally(() => {
          setSubmitting(false)
        })
    }
  }

  const editorRef = useRef(null)

  function editorChange() {
    setDescription(editorRef.current.getContent())
  }

  return (
    <>
      <Dialog fullScreen open={true} maxWidth="lg" scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <AppBar sx={{ position: "relative", paddingTop: "32px" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <DialogTitle textAlign="left">{producerToEdit ? __("Lieferant editieren", "fcplugin") : __("Lieferant hinzufügen", "fcplugin")}</DialogTitle>

            <DialogActions>
              {producerToEdit ? (
                <LoadingButton onClick={handleUpdate} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<AgricultureIcon />}>
                  {__("Speichern", "fcplugin")}
                </LoadingButton>
              ) : (
                <LoadingButton onClick={handleSubmit} variant="text" color="secondary" loading={submitting} loadingPosition="start" startIcon={<AgricultureIcon />}>
                  {__("Hinzufügen", "fcplugin")}
                </LoadingButton>
              )}

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
            minHeight: "500px"
          }}
        >
          <Stack spacing={3} sx={{ width: "100%", paddingTop: "10px" }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
                <h3>{__("Lieferant", "fcplugin")}</h3>
                <TextField size="normal" id="name" label={__("Name", "fcplugin")} name="name" variant="outlined" value={name} onChange={e => setName(e.target.value)} />
                <br />
                <TextField size="normal" id="shortDescription" label={__("Kurzbeschrieb (Labels, Besonderheiten, Einzigartiges)", "fcplugin")} name="shortDescription" variant="outlined" value={shortDescription} onChange={e => setShortDescription(e.target.value)} />
                <br />
                <TextField size="normal" id="origin" label={__("Herkunft", "fcplugin")} name="origin" variant="outlined" value={origin} onChange={e => setOrigin(e.target.value)} />
                <br />
                <TextField size="normal" id="website" label={__("Webseite", "fcplugin")} name="website" variant="outlined" value={website} onChange={e => setWebsite(e.target.value)} />
                <br />
                <h3>{__("Beschreibung", "fcplugin")}</h3>
                <Editor
                  tinymceScriptSrc={`${appLocalizer.pluginUrl}/scripts/tinymce/js/tinymce/tinymce.min.js`}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue={initialDescription}
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: ["advlist", "autolink", "lists", "link", "charmap", "preview", "anchor", "visualblocks", "wordcount"],
                    toolbar: "undo redo | blocks | " + "bold italic | bullist numlist | ",
                    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }"
                  }}
                  onEditorChange={editorChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <h3>{__("Bild", "fcplugin")}</h3>

                <Card variant="outlined">
                  <CardMedia sx={{ minHeight: 500 }} image={image !== "" ? image : appLocalizer.pluginUrl + "/images/placeholder.png"} title="supplier-image" style={{ backgroundSize: "contain", backgroundColor: "#fafafa" }} />
                  <CardActions>
                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                      <TextField size="normal" id="image" label={__("Bild URL", "fcplugin")} name="image" variant="outlined" value={image} onChange={e => setImage(e.target.value)} />
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddProducer
