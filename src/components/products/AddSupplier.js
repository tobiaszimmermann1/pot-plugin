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

function AddSupplier({ setModalClose, handleAddSupplier, supplierToEdit }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState()
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")
  const [initialDescription, setInitialDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [contact, setContact] = useState("")
  const [customerNumber, setCustomerNumber] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name)
      setImage(supplierToEdit.image)
      setDescription(supplierToEdit.description)
      setInitialDescription(supplierToEdit.description)
      setAddress(supplierToEdit.address)
      setEmail(supplierToEdit.email)
      setPhone(supplierToEdit.phone)
      setWebsite(supplierToEdit.website)
      setContact(supplierToEdit.contact)
      setCustomerNumber(supplierToEdit.customerNumber)
      setNote(supplierToEdit.note)
      setShortDescription(supplierToEdit.shortDescription)
    }
  }, [supplierToEdit])

  const handleSubmit = () => {
    setSubmitting(true)

    if (name.trim() === "") {
      setError(__("Felder dürfen nicht leer sein.", "fcplugin"))
      setSubmitting(false)
    } else {
      axios
        .post(
          `${appLocalizer.apiUrl}/foodcoop/v1/postAddSupplier`,
          {
            name: name,
            short_description: shortDescription,
            image: image,
            description: description,
            address: address,
            phone: phone,
            email: email,
            website: website,
            contact: contact,
            customerNumber: customerNumber,
            note: note
          },
          {
            headers: {
              "X-WP-Nonce": appLocalizer.nonce
            }
          }
        )
        .then(function (response) {
          if (response) {
            handleAddSupplier({
              id: JSON.parse(response.data),
              name: name,
              image: image,
              short_description: shortDescription,
              image: image,
              description: description,
              address: address,
              phone: phone,
              email: email,
              website: website,
              contact: contact,
              customerNumber: customerNumber,
              note: note
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
          `${appLocalizer.apiUrl}/foodcoop/v1/postSupplierUpdate`,
          {
            id: supplierToEdit.id,
            name: name,
            short_description: shortDescription,
            image: image,
            description: description,
            address: address,
            phone: phone,
            email: email,
            website: website,
            contact: contact,
            customerNumber: customerNumber,
            note: note
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
            <DialogTitle textAlign="left">{supplierToEdit ? __("Lieferant editieren", "fcplugin") : __("Lieferant hinzufügen", "fcplugin")}</DialogTitle>

            <DialogActions>
              {supplierToEdit ? (
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
                <TextField size="normal" id="address" label={__("Adresse", "fcplugin")} name="address" variant="outlined" value={address} onChange={e => setAddress(e.target.value)} />
                <br />
                <TextField size="normal" id="phone" label={__("Telefon", "fcplugin")} name="phone" variant="outlined" value={phone} onChange={e => setPhone(e.target.value)} />
                <br />
                <TextField size="normal" id="email" label={__("Email", "fcplugin")} name="email" variant="outlined" value={email} onChange={e => setEmail(e.target.value)} />
                <br />
                <TextField size="normal" id="website" label={__("Webseite", "fcplugin")} name="website" variant="outlined" value={website} onChange={e => setWebsite(e.target.value)} />
                <br />
                <TextField size="normal" id="contact" label={__("Kontaktperson", "fcplugin")} name="contact" variant="outlined" value={contact} onChange={e => setContact(e.target.value)} />
                <br />
                <TextField size="normal" id="customerNumber" label={__("Kundennummer", "fcplugin")} name="customerNumber" variant="outlined" value={customerNumber} onChange={e => setCustomerNumber(e.target.value)} />
                <br />
                <TextField size="normal" multiline id="note" label={__("Notiz", "fcplugin")} name="note" variant="outlined" value={note} onChange={e => setNote(e.target.value)} />
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

export default AddSupplier
