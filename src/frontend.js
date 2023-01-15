import React from "react"
import ReactDOM from "react-dom"
import FrontendApp from "./FrontendApp"

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_order_list")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(<FrontendApp />, document.getElementById("fc_order_list"))
  }
})
