import React from "react"
import ReactDOM from "react-dom"
import {
  createHashRouter,
  RouterProvider
} from "react-router-dom";
import FrontendApp from "./FrontendApp"
import FoodcoopMemberDashboard from "./FoodcoopMemberDashboard"
import SelfCheckout from "./SelfCheckout"
import SuppliersList from "./components/frontend/SuppliersList"
import ProducersList from "./components/frontend/ProducersList"
import ProductOverview, {loader as productLoader} from "./ProductOverview"
import ProductDetails, { loader as productDetailLoader} from "./components/frontend/ProductDetails";
import ProductOverviewCategory, { loader as productCategoryLoader } from "./components/frontend/ProductOverviewCategory";

const productRouter = createHashRouter([{
    path: "/",
    children: [
      {
        path: "/",
        element: <ProductOverview />,
        loader: productLoader,
      },
      {
        path: "/product/:productId",
        element: <ProductDetails/>,
        loader: productDetailLoader,
      },
      {
        path: "/category/:categoryName",
        element: <ProductOverviewCategory/>,
        loader: productCategoryLoader,
      }
    ]
  }])

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("fc_members_dashboard");
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<FoodcoopMemberDashboard/>, document.getElementById("fc_members_dashboard"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("fc_order_list");
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<FrontendApp/>, document.getElementById("fc_order_list"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("fc_add_to_cart");
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<SelfCheckout/>, document.getElementById("fc_add_to_cart"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("fc_suppliers_list");
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<SuppliersList/>, document.getElementById("fc_suppliers_list"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("fc_producers_list")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<ProducersList/>, document.getElementById("fc_producers_list"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("fc_product_overview")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<RouterProvider router={productRouter}/>, document.getElementById("fc_product_overview"))
  }
})
