import React, { useState } from "react"
const __ = wp.i18n.__
import ProductLine from "./ProductLine"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"

const ProductCategory = ({ currency, products, title, setShoppingList, setTrigger, activeState, publicPrices, additionalProductInformation, stockManagement, showTaxes }) => {
  const [visibility, setVisibility] = useState(true)

  function visClick() {
    visibility ? setVisibility(false) : setVisibility(true)
  }

  const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#f5f5f9",
      color: "rgba(0, 0, 0, 0.87)",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      maxWidth: 300,
      fontSize: theme.typography.pxToRem(13),
      padding: 10
    }
  }))

  return (
    <>
      <h2 className="fc_order_list_title" onClick={visClick}>
        <span>
          {title} ({products.length})
        </span>
        <span className="fc_order_list_title_arrow">{visibility ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</span>
      </h2>

      <div className={visibility ? `fc_order_list_category_wrapper fc_category_wrapper_show` : `fc_order_list_category_wrapper fc_category_wrapper_hide`}>
        <div>
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

              <span className="fc_order_list_header col_25">
                <HtmlTooltip title={__("Produktionsmethoden, Arbeitsbedinungen und andere wichtige Informationen zum Produkt.", "fcplugin")} placement="top-start">
                  <span>
                    {__("Details", "fcplugin")} <HelpOutlineIcon style={{ marginLeft: 3, fontSize: "1.3em", color: "#888" }} />
                  </span>
                </HtmlTooltip>
              </span>
              <span className="fc_order_list_header col_3">
                <HtmlTooltip title={__("Zeigt dir woher das Produkt stammt, wer es produziert und wer es uns liefert.", "fcplugin")} placement="top-start">
                  <span>
                    {__("Produktion & Lieferung", "fcplugin")} <HelpOutlineIcon style={{ marginLeft: 3, fontSize: "1.3em", color: "#888" }} />
                  </span>
                </HtmlTooltip>
              </span>
              <span className="fc_order_list_header col_4">
                <HtmlTooltip title={__("Die Einheit, in der das Produkt dir geliefert wird.", "fcplugin")} placement="top-start">
                  <span>
                    {__("Einheit", "fcplugin")} <HelpOutlineIcon style={{ marginLeft: 3, fontSize: "1.3em", color: "#888" }} />
                  </span>
                </HtmlTooltip>
              </span>
              <span className="fc_order_list_header col_5">
                <HtmlTooltip title={__("Die Anzahl Einheiten, die vom Lieferanten bestellt werden müssen.", "fcplugin")} placement="top-start">
                  <span>
                    {__("Gebinde", "fcplugin")} <HelpOutlineIcon style={{ marginLeft: 3, fontSize: "1.3em", color: "#888" }} />
                  </span>
                </HtmlTooltip>
              </span>
              <span className="fc_order_list_header col_6">{__("Preis", "fcplugin")}</span>
            </div>

            {products.map(product => (
              <ProductLine showTaxes={showTaxes} stockManagement={stockManagement} publicPrices={publicPrices} additionalProductInformation={additionalProductInformation} currency={currency} product={product} key={product.id} setShoppingList={setShoppingList} setTrigger={setTrigger} activeState={activeState} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductCategory
