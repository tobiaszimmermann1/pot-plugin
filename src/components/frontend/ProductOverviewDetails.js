import React from "react"
import {useLoaderData} from "react-router-dom"
import {getProduct, getStockManagement} from "../products/products";

const __ = wp.i18n.__

export async function loader({params}) {
  const {product, currency} = await getProduct(params.productId);
  const sm = await getStockManagement();

  return {product, currency, sm}
}

export default function ProductOverviewDetails() {
  const {product, stockManagement, currency} = useLoaderData();
  console.log(product)

  product.details = `<strong>${product._produzent}</strong> (${product._herkunft})<br /> <i style="font-size:0.75rem;margin-top: 5px;">${__("geliefert von", "fcplugin")} ${product._lieferant}</i>`

  return (
    <>
      <div className="fc_product_details_wrapper">
        <div className="fc_product_details_img">
          <img src={product.image}/>
        </div>
        <div className="fc_product_details_content">
          <h1>{product.name}</h1>
          <p>
            <span dangerouslySetInnerHTML={{__html: product.details}}/>
          </p>
          <p>
            {product._einheit} | <span
            dangerouslySetInnerHTML={{__html: currency}}/> {parseFloat(product.price).toFixed(2)} {stockManagement && "| " + product.stock + " " + __("lagernd", "fcplugin")} | {product.short_description}
          </p>
          <p dangerouslySetInnerHTML={{__html: product.description}}/>
        </div>
      </div>
    </>
  )
}
