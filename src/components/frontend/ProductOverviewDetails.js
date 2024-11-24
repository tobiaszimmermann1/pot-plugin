import React from "react"
import {useLoaderData} from "react-router-dom"
import {getProduct} from "../products/products";

const __ = wp.i18n.__

export async function loader({params}) {
  const {product, currency} = await getProduct(params.productId);

  return {product, currency}
}

export default function ProductOverviewDetails() {
  const {product, currency} = useLoaderData();

  return (
    <>
      <div className="fc_product_details_wrapper">
        <div className="fc_product_details_img">
          <img src={product.image}/>
        </div>
        <div className="fc_product_details_content">
          <h1>{product.name}</h1>
          <p>
            <span>
              <strong>{product._produzent}</strong> ({product._herkunft})<br/>
              <i style={{fontSize: "font-size:0.75rem", marginTop: "5px"}}>
                {__("geliefert von", "fcplugin")} {product._lieferant}
              </i>
            </span>
          </p>
          <p>
            {product._einheit} | <span
            dangerouslySetInnerHTML={{__html: currency}}/> {parseFloat(product.price).toFixed(2)}
            &nbsp;| {product.stock + " " + __("lagernd", "fcplugin")}
            &nbsp;| {__("Artikel-Nr.")}: {product.sku}
          </p>
          <div>
            {product.short_description}
          </div>
          {(product.short_description !== product.description) && (
            <div style={{marginTop: "5px"}}>
              {product.description}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
