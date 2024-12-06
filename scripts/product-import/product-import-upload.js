jQuery("document").ready(function () {
  /**
   * STEP 1
   */

  document.body.addEventListener("click", function (e) {
    if (e.target && e.target.id === "foodcoop_product_import_step1-submit") {
      e.preventDefault()

      jQuery("#foodcoop_product_import_step1-submit").prop("disabled", true)
      jQuery(".waiting").removeClass("hidden")

      const file = jQuery("#foodcoop_file_import_file").prop("files")

      if (file.length === 0) {
        alert("Please select a file to upload.")
        jQuery("#foodcoop_product_import_step1-submit").prop("disabled", false)
        jQuery(".waiting").addClass("hidden")
        return
      }

      const formData = new FormData()
      formData.append("file", file[0])

      fetch(`${importLocalizer.apiUrl}/foodcoop/v1/productImport`, {
        method: "POST",
        body: formData,
        headers: {
          "X-WP-Nonce": importLocalizer.nonce
        },
        credentials: "same-origin"
      })
        .then(response => {
          return response.json()
        })
        .then(data => {
          console.log("Parsed data:", data)
          if (data.success === true) {
            //console.log(data.file)
            window.location.href = `${importLocalizer.adminUrl}&step=2&file=${data.file_path}`
          }
        })
        .catch(error => {
          console.error("Error:", error)
        })
        .finally(() => {
          jQuery("#foodcoop_product_import_step1-submit").prop("disabled", false)
          jQuery(".waiting").addClass("hidden")
        })
    }
  })

  /**
   * STEP 2
   */

  document.body.addEventListener("click", function (e) {
    if (e.target && e.target.id === "foodcoop_product_import_step2-submit") {
      e.preventDefault()

      jQuery("#foodcoop_product_import_step2-submit").prop("disabled", true)
      jQuery(".waiting").removeClass("hidden")

      const file = jQuery("#foodcoop_file_import_file").val()
      const delete_products = jQuery("#foodcoop_product_import_delete").is(":checked")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("delete_products", delete_products)

      fetch(`${importLocalizer.apiUrl}/foodcoop/v1/productImportCheckFile`, {
        method: "POST",
        body: formData,
        headers: {
          "X-WP-Nonce": importLocalizer.nonce
        },
        credentials: "same-origin"
      })
        .then(response => {
          return response.json()
        })
        .then(data => {
          console.log("Parsed data:", data)
          if (data.success === true) {
            //jQuery("#foodcoop_file_import_data").val(JSON.stringify(data))
            window.location.href = `${importLocalizer.adminUrl}&step=3&file=${file}&del=${delete_products}`
          }
        })
        .catch(error => {
          console.error("Error:", error)
        })
        .finally(() => {
          jQuery("#foodcoop_product_import_step2-submit").prop("disabled", false)
          jQuery(".waiting").addClass("hidden")
        })
    }
  })

  /**
   * STEP 3
   */

  document.body.addEventListener("click", function (e) {
    if (e.target && e.target.id === "foodcoop_product_import_step3-submit") {
      e.preventDefault()

      jQuery("#foodcoop_product_import_step3-submit").prop("disabled", true)
      jQuery(".waiting").removeClass("hidden")

      const file = jQuery("#foodcoop_product_import_step3 #foodcoop_product_import_file").val()
      const delete_products = jQuery("#foodcoop_product_import_step3 #foodcoop_product_import_delete").val()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("delete_products", delete_products)

      fetch(`${importLocalizer.apiUrl}/foodcoop/v1/productImportAction`, {
        method: "POST",
        body: formData,
        headers: {
          "X-WP-Nonce": importLocalizer.nonce
        },
        credentials: "same-origin"
      })
        .then(response => {
          return response.json()
        })
        .then(data => {
          console.log("Parsed data:", data)
          if (data.success === true) {
            //jQuery("#foodcoop_file_import_data").val(JSON.stringify(data))
            //window.location.href = `${importLocalizer.adminUrl}&step=3&file=${file}`
          }
        })
        .catch(error => {
          console.error("Error:", error)
        })
        .finally(() => {
          jQuery("#foodcoop_product_import_step3-submit").prop("disabled", false)
          jQuery(".waiting").addClass("hidden")
        })
    }
  })
})
