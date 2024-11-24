import React, {useEffect, useState} from "react"
import {
  Link,
  useLoaderData
} from "react-router-dom";
import {Box, Divider, FormControlLabel, LinearProgress, Switch} from "@mui/material"
import {styled} from "@mui/material/styles"
import {
  categorizeProducts,
  getProductListOverview,
  getSelfCheckoutProducts,
  getStockManagement
} from "./components/products/products";

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

export async function loader(){
  const productOverview = await getProductListOverview();
  const stockManagement = await getStockManagement();
  const selfCheckoutProducts = await getSelfCheckoutProducts();

  return {productOverview, stockManagement, selfCheckoutProducts}
}

export default function ProductOverview() {
  const {productOverview, sm, scp} = useLoaderData();

  const [products, setProducts] = useState(null)
  const [originalProducts, setOriginalProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState(null)
  const [stockManagement, setStockManagement] = useState(true)
  const [selfCheckoutProducts, setSelfCheckoutProducts] = useState([])

  const [allProducts, setAllProducts] = useState()
  const [categories, setCategories] = useState(null)
  const [cats, setCats] = useState(null)
  const [currency, setCurrency] = useState(null)
  const [filter, setFilter] = useState({
    inStock: false,
    selfCheckout: false
  })

  useEffect(() => {
    setAllProducts(productOverview.products);
    setCategories(productOverview.productsByCategory);
    setCategories(productOverview.productsByCategory);
    setCats(productOverview.categories);
    setCurrency(productOverview.currency);

    setStockManagement(sm);
    setSelfCheckoutProducts(scp);
  }, [])

  /**
   * Prepare product data for order table
   */
  useEffect(() => {
    // go through each product, rearrange its information and add to productsByCategory object
    if (allProducts && categories) {
      let productsByCategory = categories

      allProducts.map(p => {
        let productToDo = p;
        productToDo.amount = 0
        productToDo.unit = p._einheit
        productToDo.lot = p._gebinde
        productToDo.details = `<strong>${p._produzent}</strong> (${p._herkunft})<br /> <i style="font-size:0.75rem;margin-top: 5px;">${__("geliefert von", "fcplugin")} ${p._lieferant}</i>`
        productToDo.category = p.category_name
        productToDo.stockStatus = p.stock_status
        productsByCategory[p.category_name].push(productToDo)
      })

      setProducts(productsByCategory)
      setOriginalProducts(productsByCategory)
    }
  }, [allProducts, categories])

  useEffect(() => {
    if (currency && allProducts && categories && products) {
      setLoading(false)
    }
  }, [currency, allProducts, categories, products])

  function handleChange(event) {
    setSelectedCat(null)

    setFilter({
      ...filter,
      [event.target.name]: event.target.checked
    })
  }

  useEffect(() => {
    if (originalProducts) {
      setProducts(categorizeProducts(originalProducts, selfCheckoutProducts, filter, cats))
    }
  }, [filter])

  return !loading ? (
    <>
      <div className="fc_filters_breadcrumb">
        <div>
          {selectedCat ? (
            <>
              <span
                className="fc_filters_link"
                onClick={() => {
                  setSelectedCat(null)
                }}
              >
                {__("Kategorien", "fcplugin")}
              </span>
              <span style={{ margin: "0 10px" }}>&#8594;</span>{" "}
              <span
                className="fc_filters_link"
                onClick={() => {
                  setSelectedProduct(null)
                }}
              >
                {selectedCat?.name}
              </span>
            </>
          ) : (
            __("Kategorie wählen", "fcplugin")
          )}
        </div>
      </div>

      {!selectedCat && (
        <div className="fc_filters_wrapper">
          <FormControlLabel control={<Android12Switch checked={filter.selfCheckout} onChange={handleChange} name="selfCheckout" />} label={__("Nur Produkte, die im Self Checkout verfügbar sind anzeigen.")} />
          <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
          {stockManagement && <FormControlLabel control={<Android12Switch checked={filter.inStock} onChange={handleChange} name="inStock" />} label={__("Nur Produkte, die an Lager sind anzeigen.")} />}
        </div>
      )}

      <div className="fc_category_wrapper">
        {selectedCat ? (
            <>
            {products[selectedCat.name].map(product => (
              <React.Fragment key={product.id}>
                <div className="fc_product_box">
                  <div className="fc_product_img" style={{ backgroundImage: `url('${product.image}')`, backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover" }} />
                  <div className="fc_product_content">
                    <h2>{product.name}</h2>
                    <p>
                      <span dangerouslySetInnerHTML={{ __html: product.details }} />
                    </p>
                    <p>
                      {product.unit} | <span dangerouslySetInnerHTML={{ __html: currency }} /> {parseFloat(product.price).toFixed(2)} {"| "} | {product.short_description}
                    </p>
                    <p>
                      <Link className="fc_product_more" to={`product/${product.id}`}>{__("Mehr erfahren", "fcplugin")} &#8594;</Link>
                    </p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            {cats.map(
              cat =>
                products[cat.name].length > 0 && (
                  <React.Fragment key={cat.id}>
                    <div
                      className="fc_category_box"
                      onClick={() => {
                        setSelectedCat(cat)
                      }}
                    >
                      <div className="fc_category_img" style={{ backgroundImage: `url('${cat.img}')`, backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover" }}>
                        <div className="fc_category_content">
                          <h2>{cat.name}</h2>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                )
            )}
          </>
        )}
      </div>
    </>
  ) : (
    <Box sx={{ width: "100%", marginBottom: 4 }}>
      <LinearProgress />
    </Box>
  )
}
