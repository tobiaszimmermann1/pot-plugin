import React, { useState, useEffect, useRef, useMemo } from "react"
const __ = wp.i18n.__
import ProductLine from "./ProductLine"
import { CSSTransition } from "react-transition-group"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"

const ProductCategory = ({ currency, products, title, setShoppingList, setTrigger, activeState, publicPrices, additionalProductInformation }) => {
  const [visibility, setVisibility] = useState(true)

  function visClick() {
    visibility ? setVisibility(false) : setVisibility(true)
  }

  return (
    <>
      <h2 className="fc_order_list_title" onClick={visClick}>
        <span>
          {title} ({products.length})
        </span>
        <span className="fc_order_list_title_arrow">{visibility ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</span>
      </h2>

      <div className="fc_order_list_category_wrapper">
        <div className={visibility ? `fc_transition_show` : `fc_transition_hide`}>
          <div className="fc_order_list_cat_wrapper">
            <div className="fc_order_list_line">
              <span className="fc_order_list_header col_1">{__("Menge", "fcplugin")}</span>
              {additionalProductInformation ? (
                <>
                  <span className="fc_order_list_header col_15"></span>
                  <span className="fc_order_list_header col_2">{__("Produkt", "fcplugin")}</span>
                </>
              ) : (
                <span className="fc_order_list_header col_2x">{__("Produkt", "fcplugin")}</span>
              )}

              <span className="fc_order_list_header col_25">{__("Details", "fcplugin")}</span>
              <span className="fc_order_list_header col_3">{__("Produzent", "fcplugin")}</span>
              <span className="fc_order_list_header col_4">{__("Einheit", "fcplugin")}</span>
              <span className="fc_order_list_header col_5">{__("Gebinde", "fcplugin")}</span>
              <span className="fc_order_list_header col_6">{__("Preis", "fcplugin")}</span>
            </div>

            {products.map(product => (
              <ProductLine publicPrices={publicPrices} additionalProductInformation={additionalProductInformation} currency={currency} product={product} key={product.id} setShoppingList={setShoppingList} setTrigger={setTrigger} activeState={activeState} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductCategory
