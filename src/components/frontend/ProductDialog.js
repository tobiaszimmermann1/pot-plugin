import React, { useState, useEffect, useContext } from "react"
import axios from "axios"
import IconButton from "@mui/material/IconButton"
import { Card, CardActions, CardContent, Typography, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"

import CloseIcon from "@mui/icons-material/Close"

import Box from "@mui/material/Box"
const __ = wp.i18n.__

const ProductDialog = ({ product, handleClose, currency, stockManagement }) => {
  const [supplier, setSupplier] = useState(null)
  const [producer, setProducer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log(product)
    if (product) {
      axios
        .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProductDetails?id=${product.id}`)
        .then(function (response) {
          if (response.data) {
            const res = JSON.parse(response.data)
            res[0].length > 0 && setSupplier(res[0])
            res[1].length > 0 && setProducer(res[1])
          }
        })
        .finally(() => setLoading(false))
        .catch(error => console.log(error))
    }
  }, [])

  return (
    <>
      <Card variant="outlined" sx={{ border: "none" }}>
        <div className="productModalClose">
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <CardContent>
          <div className="productModalHeader">
            {product.image ? <img src={product.image} className="productModalImage" /> : <img src={`${frontendLocalizer.pluginUrl}/images/placeholder.png`} className="productModalImage" />}
            <div className="productModalInfo">
              <div className="productModalTitle">
                <small>{product.produzent}</small>
                <br />
                {product.name}
                <br />
                <strong>CHF {product.price}</strong>
              </div>

              <p dangerouslySetInnerHTML={{ __html: product.description }} style={{ padding: "10px 0px", marginTop: 0, marginBottom: 0 }} />

              {product.loonity_id && (
                <a href={`https://db.pot.ch/?id=${product.loonity_id}`} target="_blank" className="productModalPotDb">
                  <img src={`${frontendLocalizer.pluginUrl}/images/pot_logo.png`} style={{ height: "10px" }} />
                  <span>Finde alles zum Produkt, Herstellung und Herkunft in der POT Sortimentsdatenbank</span>
                </a>
              )}

              <Table dense>
                <TableRow>
                  <TableCell>{__("Produzent", "fcplugin")}</TableCell>
                  <TableCell>{product.produzent}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{__("Lieferant", "fcplugin")}</TableCell>
                  <TableCell>{product.lieferant}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{__("Preis", "fcplugin")}</TableCell>
                  <TableCell>CHF {product.price}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{__("Herkunft", "fcplugin")}</TableCell>
                  <TableCell>{product.herkunft}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{__("Einheit", "fcplugin")}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{__("Gebinde", "fcplugin")}</TableCell>
                  <TableCell>{product.lot}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{__("Kategorie", "fcplugin")}</TableCell>
                  <TableCell>{product.category}</TableCell>
                </TableRow>
              </Table>

              {producer ? (
                <Box sx={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  <i style={{ fontSize: "0.85rem" }}>{__("produziert von", "fcplugin")}</i>
                  <br /> <strong style={{ fontSize: "1.15rem" }}>{producer[0]}</strong>
                  <br />
                  {producer[1]}
                  <br />
                  {producer[2]}
                  <br />
                  {producer[3]}
                  <p dangerouslySetInnerHTML={{ __html: producer[4] }} style={{ fontSize: "0.9rem", border: "1px solid #e3e3e3", borderRadius: "3px", padding: "10px", marginTop: 5, backgroundColor: "#f8f8f8" }} />
                </Box>
              ) : loading ? (
                <Box sx={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                </Box>
              ) : (
                ""
              )}

              {supplier ? (
                <Box sx={{ padding: "10px" }}>
                  <i style={{ fontSize: "0.85rem" }}>{__("geliefert von", "fcplugin")}</i>
                  <br /> <strong style={{ fontSize: "1.15rem" }}>{supplier[0]}</strong>
                  <br />
                  {supplier[1]}
                  <br />
                  {supplier[2]}
                  <br />
                  {supplier[3]}
                  <p dangerouslySetInnerHTML={{ __html: supplier[4] }} style={{ fontSize: "0.9rem", border: "1px solid #e3e3e3", borderRadius: "3px", padding: "10px", marginTop: 5, backgroundColor: "#f8f8f8" }} />
                </Box>
              ) : loading ? (
                <Box sx={{ padding: "10px" }}>
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                </Box>
              ) : (
                ""
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default ProductDialog
