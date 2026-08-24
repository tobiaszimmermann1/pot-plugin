import React from "react"
import ReactDOM from "react-dom"
import { HashRouter } from "react-router-dom"
import App from "./App"

document.addEventListener("DOMContentLoaded", function () {
  var element = document.getElementById("fc_dashboard")
  if (typeof element !== "undefined" && element !== null) {
    ReactDOM.render(
      <HashRouter>
        <App />
      </HashRouter>,
      document.getElementById("fc_dashboard")
    )
  }
})
