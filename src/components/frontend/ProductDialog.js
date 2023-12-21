import React, { useState, useEffect, useContext } from "react"
import axios from "axios"
import IconButton from "@mui/material/IconButton"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import CloseIcon from "@mui/icons-material/Close"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
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
        <CardActions sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </CardActions>
        {product.image && <CardMedia component="img" image={product.image} className="productModalImage" />}
        <CardContent style={{ padding: 20 }}>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.primary" style={{ backgroundColor: "#f0f0f0", padding: "10px 10px 10px 10px", borderBottom: "1px solid #ccc" }}>
            <strong>
              <span dangerouslySetInnerHTML={{ __html: product.details }} />{" "}
            </strong>
          </Typography>
          <Typography variant="body2" color="text.primary" style={{ backgroundColor: "#f0f0f0", padding: "10px 10px 10px 10px", borderBottom: "1px solid #ccc" }}>
            {product.unit} | <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(product.price).toFixed(2)} {stockManagement && "| " + product.stock + " " + __("lagernd", "fcplugin")} | {product.short_description}
          </Typography>
          <p dangerouslySetInnerHTML={{ __html: product.description }} style={{ padding: "10px", marginTop: 5, marginBottom: 0, borderBottom: "1px solid #ccc" }} />

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
        </CardContent>
      </Card>
    </>
  )
}

export default ProductDialog
