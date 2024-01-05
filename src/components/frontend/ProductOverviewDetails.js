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

const ProductOverviewDetails = ({ product, currency, stockManagement }) => {
  const [supplier, setSupplier] = useState(null)
  const [producer, setProducer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      <div className="fc_product_details_wrapper">
        <div className="fc_product_details_img">
          <img src={product.image} />
        </div>
        <div className="fc_product_details_content">
          <h1>{product.name}</h1>
          <p>
            <span dangerouslySetInnerHTML={{ __html: product.details }} />
          </p>
          <p>
            {product.unit} | <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(product.price).toFixed(2)} {stockManagement && "| " + product.stock + " " + __("lagernd", "fcplugin")} | {product.short_description}
          </p>
          <p dangerouslySetInnerHTML={{ __html: product.description }} />

          {producer ? (
            <p className="fc_product_details_box">
              <i style={{ fontSize: "0.85rem" }}>{__("produziert von", "fcplugin")}</i>
              <br /> <strong style={{ fontSize: "1.15rem" }}>{producer[0]}</strong>
              <br />
              {producer[1]}
              <br />
              {producer[2]}
              <br />
              {producer[3]}
              <p dangerouslySetInnerHTML={{ __html: producer[4] }} style={{ fontSize: "0.9rem", border: "1px solid #e3e3e3", borderRadius: "3px", padding: "10px", marginTop: 5, backgroundColor: "#f8f8f8" }} />
            </p>
          ) : loading ? (
            <p className="fc_product_details_box">
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
            </p>
          ) : (
            ""
          )}

          {supplier ? (
            <p className="fc_product_details_box">
              <i style={{ fontSize: "0.85rem" }}>{__("geliefert von", "fcplugin")}</i>
              <br /> <strong style={{ fontSize: "1.15rem" }}>{supplier[0]}</strong>
              <br />
              {supplier[1]}
              <br />
              {supplier[2]}
              <br />
              {supplier[3]}
              <p dangerouslySetInnerHTML={{ __html: supplier[4] }} style={{ fontSize: "0.9rem", border: "1px solid #e3e3e3", borderRadius: "3px", padding: "10px", marginTop: 5, backgroundColor: "#f8f8f8" }} />
            </p>
          ) : loading ? (
            <p className="fc_product_details_box">
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
            </p>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  )
}

export default ProductOverviewDetails
