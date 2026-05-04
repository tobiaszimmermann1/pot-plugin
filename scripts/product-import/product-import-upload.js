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

      const allowedExtensions = ["xlsx"]
      const fileName = file[0].name
      const fileExt = fileName.split(".").pop().toLowerCase()
      if (!allowedExtensions.includes(fileExt)) {
        alert("Ungültiges Dateiformat. Bitte lade eine XLSX-Datei hoch.")
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
          if (data.success === true) {
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
      const stock = jQuery("#foodcoop_product_import_stock").is(":checked")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("delete_products", delete_products)
      formData.append("stock", stock)

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
          if (data.success === true) {
            //jQuery("#foodcoop_file_import_data").val(JSON.stringify(data))
            window.location.href = `${importLocalizer.adminUrl}&step=3&file=${file}&del=${delete_products}&stock=${stock}`
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

  let progressInterval = null

  function fetchProgress(file) {
    const formData = new FormData()
    formData.append("file", file)

    fetch(`${importLocalizer.apiUrl}/foodcoop/v1/postImportProductsProgress`, {
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
        const deletionProgress = parseInt(data.deletion_progress) || 0
        const progress = parseInt(data.progress) || 0

        // Show deletion progress if products are being deleted
        if (deletionProgress > 0 && deletionProgress < 100) {
          jQuery("#foodcoop_product_import_progress").css("display", "flex")
          jQuery("#foodcoop_product_import_progress").html(`Produkte werden gelöscht: ${deletionProgress}%`)
          jQuery("#foodcoop_product_import_progress").css("background", `linear-gradient(to right, #ffcccc ${deletionProgress}%, transparent ${deletionProgress}%`)
        }
        // Show import progress once deletion is complete
        else if (progress > 0) {
          jQuery("#foodcoop_product_import_progress").css("display", "flex")
          jQuery("#foodcoop_product_import_progress").html(`Produkte werden importiert: ${progress}%`)
          jQuery("#foodcoop_product_import_progress").css("background", `linear-gradient(to right, #ccffcc ${progress}%, transparent ${progress}%`)
        }

        if (progress >= 100) {
          clearInterval(progressInterval)
          // redirect on completion (handles case where main fetch timed out)
          if (data.success === true && data.data) {
            window.location.href = `${importLocalizer.adminUrl}&step=4&updatedproducts=${data.data.updatedproducts || 0}&newproducts=${data.data.newproducts || 0}&deletedproducts=${data.data.deletedproducts || 0}`
          }
        }
      })
  }

  document.body.addEventListener("click", function (e) {
    if (e.target && e.target.id === "foodcoop_product_import_step3-submit") {
      e.preventDefault()

      jQuery("#foodcoop_product_import_step3-submit").prop("disabled", true)
      jQuery(".waiting").removeClass("hidden")

      const file = jQuery("#foodcoop_product_import_step3 #foodcoop_product_import_file").val()
      const delete_products = jQuery("#foodcoop_product_import_step3 #foodcoop_product_import_delete").val()
      const stock = jQuery("#foodcoop_product_import_step3 #foodcoop_product_import_stock").val()

      // Fetch progress every second
      progressInterval = setInterval(() => fetchProgress(file), 1000)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("delete_products", delete_products)
      formData.append("stock", stock)

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
          if (data.success === true) {
            //jQuery("#foodcoop_file_import_data").val(JSON.stringify(data))
            window.location.href = `${importLocalizer.adminUrl}&step=4&updatedproducts=${data.data.updatedproducts}&newproducts=${data.data.newproducts}&deletedproducts=${data.data.deletedproducts || 0}`
          }
        })
        .catch(error => {
          // For large imports, fetch may timeout but progress poller will handle redirect
          console.log("Import request completed or timed out, progress poller will handle redirect", error)
        })
        .finally(() => {
          jQuery("#foodcoop_product_import_step3-submit").prop("disabled", false)
          jQuery(".waiting").addClass("hidden")
        })
    }
  })
})
