jQuery(document).ready(function ($) {
  // AJAX CALL IMPORT FUNCTION
  jQuery("#import_submit").click(function () {
    jQuery(this).prop("disabled", true)
    var bestellrunde = jQuery("#import_bestellrunde").val()
    var file_data = jQuery("#import_file").prop("files")[0]
    var form_data = new FormData()
    form_data.append("file", file_data)
    form_data.append("action", "fc_import_function")

    jQuery(".spinner").addClass("is-active")

    jQuery.ajax({
      type: "POST",
      url: fc.ajaxurl,
      data: form_data,
      contentType: false,
      processData: false,
      completed: function () {
        jQuery("import_submit").prop("disabled", false)
      },
      success: function (data, textStatus, XMLHttpRequest) {
        jQuery("#import_notice").html(data)
        jQuery("#import_notice").show()
        jQuery(".spinner").removeClass("is-active")
      },
      error: function (XMLHttpRequest, textStatus, errorThrown, data) {
        jQuery("#import_notice").html(data)
        jQuery("#import_notice").show()

        jQuery(".spinner").removeClass("is-active")
      }
    })
  })

  // EXPORT DISPLAY
  jQuery("#export_bestellrunde").change(function () {
    var bestellrunde_id = jQuery("#export_bestellrunde option:selected").attr("id")
    jQuery("#export-window").hide()

    if (bestellrunde_id != "x") {
      jQuery.ajax({
        type: "POST",
        url: fc.ajaxurl,
        data: {
          action: "fc_get_lieferanten",
          bestellrunde_id: bestellrunde_id
        },
        success: function (data, textStatus, XMLHttpRequest) {
          jQuery("#export_lieferant").empty()
          jQuery("#export_lieferant").append(data)
          jQuery("#export-window").show()
        },
        error: function (XMLHttpRequest, textStatus, errorThrown, data) {
          console.log(errorThrown)
        }
      })
    }
  })

  // EXPORT FUNCTIONS
  jQuery(".export-button").click(function () {
    var exportType = "fc_export_" + jQuery(this).attr("id") + "_function"
    var bestellrunde = jQuery("#export_bestellrunde").children(":selected").attr("id")
    var lieferant = jQuery("#export_lieferant").children(":selected").attr("id")

    jQuery.ajax({
      type: "POST",
      url: fc.ajaxurl,
      data: {
        action: exportType,
        bestellrunde: bestellrunde,
        lieferant: lieferant
      },
      beforeSend: function () {
        jQuery(".spinner").addClass("is-active")
      },
      completed: function (output) {
        console.log(JSON.parse(output))
      },
      success: function (output) {
        console.log(JSON.parse(output))
        jQuery(".spinner").removeClass("is-active")

        window.location.href = JSON.parse(output)
      },
      error: function (XMLHttpRequest, textStatus, errorThrown, data) {
        console.log(errorThrown)
      }
    })
  })
})
