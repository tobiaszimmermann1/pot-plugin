import React from "react"
import ReactDOM from "react-dom"
import FrontendApp from "./FrontendApp"
import QRBill from "./QRBill"
import SelfCheckout from "./SelfCheckout"
import SuppliersList from "./components/frontend/SuppliersList"
import ProducersList from "./components/frontend/ProducersList"
import ProductOverview from "./ProductOverview"

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_topup")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<QRBill />, document.getElementById("fc_topup"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_order_list")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<FrontendApp />, document.getElementById("fc_order_list"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_add_to_cart")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<SelfCheckout />, document.getElementById("fc_add_to_cart"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_suppliers_list")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<SuppliersList />, document.getElementById("fc_suppliers_list"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_producers_list")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<ProducersList />, document.getElementById("fc_producers_list"))
  }
})

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_product_overview")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<ProductOverview />, document.getElementById("fc_product_overview"))
  }
})
