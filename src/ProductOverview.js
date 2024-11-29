import React, {useEffect, useState} from "react"
import {Link, useLoaderData} from "react-router-dom";
import {Box, LinearProgress} from "@mui/material"
import {getProductListOverview} from "./components/products/products";

const __ = wp.i18n.__

export async function loader() {
  return await getProductListOverview();
}

export default function ProductOverview() {
  const productOverview = useLoaderData();

  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState(null)

  useEffect(() => {
    setCategories(productOverview.categories);
    setLoading(false);
  }, [])

  return !loading ? (
    <>
      <div className="fc_filters_breadcrumb">
        <div>
          {__("Kategorie wählen", "fcplugin")}
        </div>
      </div>

      <div className="fc_category_wrapper">
        {categories.map(
          cat => (
            <React.Fragment key={cat.id}>
              <Link className="fc_category_box" to={`/category/${cat.name}`}>
                <div className="fc_category_img" style={{
                  backgroundImage: `url('${cat.img}')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                  backgroundSize: "cover"
                }}>
                  <div className="fc_category_content">
                    <h2>{cat.name}</h2>
                  </div>
                </div>
              </Link>
            </React.Fragment>
          )
        )}
      </div>
    </>
  ) : (
    <Box sx={{width: "100%", marginBottom: 4}}>
      <LinearProgress/>
    </Box>
  )
}
