import React, {useEffect, useState} from "react"
import {Link, redirect, useLoaderData} from "react-router-dom";
import {Box, Divider, FormControlLabel, LinearProgress, Switch} from "@mui/material"
import {styled} from "@mui/material/styles"
import {getProductListOverview, getSelfCheckoutProducts, getStockManagement} from "../products/products";

const __ = wp.i18n.__

const Android12Switch = styled(Switch)(({theme}) => ({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16
    },
    "&::before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(theme.palette.getContrastText(theme.palette.primary.main))}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12
    },
    "&::after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(theme.palette.getContrastText(theme.palette.primary.main))}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12
    }
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2
  }
}))

export async function loader({params}) {
  const productOverview = await getProductListOverview(params.categoryName);
  const stockManagement = await getStockManagement();
  const selfCheckoutProducts = await getSelfCheckoutProducts();
  const selectedCategory = params.categoryName;

  if (productOverview.productsByCategory[selectedCategory] === undefined) {
    return redirect("/")
  }

  return {productOverview, stockManagement, selfCheckoutProducts, selectedCategory}
}

export default function ProductOverviewCategory() {
  const data = useLoaderData();

  const [products, setProducts] = useState(null)
  const [selfCheckoutProducts, setSelfCheckoutProducts] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stockManagement, setStockManagement] = useState(true)
  const [currency, setCurrency] = useState(null)
  const [filter, setFilter] = useState({
    inStock: false,
    selfCheckout: false
  })

  useEffect(() => {
    setProducts(data.productOverview.productsByCategory[data.selectedCategory]);
    setSelfCheckoutProducts(data.selfCheckoutProducts)
    setCategory(data.selectedCategory)
    setCurrency(data.productOverview.currency);

    setStockManagement(data.stockManagement);
  }, [])

  useEffect(() => {
    if (currency && products) {
      setLoading(false)
    }
  }, [currency, products])

  function handleChange(event) {
    setFilter({
      ...filter,
      [event.target.name]: event.target.checked
    })
  }

  return !loading ? (
    <>
      <div className="fc_filters_breadcrumb">
        <div>
          <span><Link to={`/`}>{__("Kategorien", "fcplugin")}</Link></span>
          <span style={{margin: "0 10px"}}>&#8594;</span>{" "}
          <span className="fc_filters_link">{category}</span>
        </div>
      </div>

      <div className="fc_filters_wrapper">
        <FormControlLabel
          control={<Android12Switch checked={filter.selfCheckout} onChange={handleChange} name="selfCheckout"/>}
          label={__("Nur Produkte, die im Self Checkout verfügbar sind anzeigen.")}/>
        <Divider sx={{marginTop: 1, marginBottom: 1}}/>
        {stockManagement &&
          <FormControlLabel control={<Android12Switch checked={filter.inStock} onChange={handleChange} name="inStock"/>}
                            label={__("Nur Produkte, die an Lager sind anzeigen.")}/>}
      </div>

      <div className="fc_category_wrapper">
        {products.map(product => (!filter.inStock || (product.stock > 0)) && (!filter.selfCheckout || selfCheckoutProducts.includes(product.id)) && (
          <React.Fragment key={product.id}>
            <div className="fc_product_box">
              <div className="fc_product_img" style={{
                backgroundImage: `url('${product.image}')`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "cover"
              }}/>
              <div className="fc_product_content">
                <h2>{product.name}</h2>
                <p>
                  <span dangerouslySetInnerHTML={{__html: product.details}}/>
                </p>
                <p>
                  {product.unit} | <span
                  dangerouslySetInnerHTML={{__html: currency}}/> {parseFloat(product.price).toFixed(2)} {"| "} | {product.short_description}
                </p>
                <p>
                  <Link className="fc_product_more"
                        to={`/product/${product.id}`}>{__("Mehr erfahren", "fcplugin")} &#8594;</Link>
                </p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  ) : (
    <Box sx={{width: "100%", marginBottom: 4}}>
      <LinearProgress/>
    </Box>
  )
}
