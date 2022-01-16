jQuery(document).ready(function ($) {
  // AJAX CALL REPOPULATE PRODUCTS ON BESTELLRUNDEN CHANGE
  jQuery("#export_bestellrunde").change(function () {
    var bestellrunde = jQuery("#export_bestellrunde").children(":selected").attr("id")
    jQuery("#mutation-window").hide()
    jQuery(".spinner").addClass("is-active")

    if (bestellrunde != "x") {
      jQuery.ajax({
        type: "POST",
        url: fc.ajaxurl,
        data: {
          action: "fc_mutation_populate_products",
          bestellrunde: bestellrunde
        },
        success: function (data, textStatus, XMLHttpRequest) {
          jQuery("#mutation_delete_select").empty()
          jQuery("#mutation_price_select").empty()
          jQuery("#mutation_price_notice").hide()
          jQuery("#mutation_price_field").hide()
          jQuery("#mutation_price_final_submit").hide()
          jQuery("#mutation_delete_notice").hide()
          jQuery("#mutation_delete_final_submit").hide()

          jQuery.each(data, function (key, value) {
            jQuery("#mutation_delete_select").append(`<option class="mutation_delete_product" data-id="${key}">${value}</option>`)
            jQuery("#mutation_price_select").append(`<option class="mutation_price_product" data-id="${key}">${value}</option>`)
          })

          jQuery(".spinner").removeClass("is-active")
          jQuery("#mutation-window").show()
        },
        error: function (XMLHttpRequest, textStatus, errorThrown, data) {
          alert("Error")
        }
      })
    }
  })

  // AJAX CALL MUTATION DELETE FUNCTION - LOAD ORDERS
  jQuery("#mutation_delete_submit").click(function () {
    jQuery(this).prop("disabled", true)
    var bestellrunde = jQuery("#mutation_bestellrunde").val()

    var product = jQuery(".mutation_delete_product:selected").data("id")

    var bestellrunde = jQuery("#export_bestellrunde").children(":selected").attr("id")

    if (product != undefined) {
      jQuery(".spinner").addClass("is-active")

      jQuery.ajax({
        type: "POST",
        url: fc.ajaxurl,
        data: {
          action: "fc_mutation_delete_function",
          product: product,
          bestellrunde: bestellrunde
        },
        success: function (data, textStatus, XMLHttpRequest) {
          jQuery("#mutation_delete_submit").prop("disabled", false)
          jQuery("#mutation_delete_notice").html(data)
          jQuery("#mutation_delete_notice").show()

          if (jQuery(".mutation_delete_final_confirm").val() == true) {
            jQuery("#mutation_delete_final_submit").show()
          } else {
            jQuery("#mutation_delete_final_submit").hide()
          }

          jQuery(".spinner").removeClass("is-active")
        },
        error: function (XMLHttpRequest, textStatus, errorThrown, data) {
          jQuery("#mutation_delete_notice").html(data)
          jQuery("#mutation_delete_notice").show()

          jQuery(".spinner").removeClass("is-active")

          if (jQuery(".mutation_delete_final_confirm").val() == true) {
            jQuery("#mutation_delete_final_submit").show()
          } else {
            jQuery("#mutation_delete_final_submit").hide()
          }
        }
      })
    } else {
      jQuery("#mutation_delete_notice").html("Bitte wähle ein Produkt aus.")
      jQuery("#mutation_delete_notice").show()
    }
  })

  // AJAX CALL MUTATION DELETE FUNCTION - REFUND PRODUCTS FROM ORDERS
  jQuery("#mutation_delete_final_submit").click(function () {
    jQuery(this).prop("disabled", true)
    var product = jQuery("#mutation_delete_product_id").val()

    var deleteOrders = []

    jQuery(".mutation_delete_order_id").each(function () {
      var orderId = jQuery(this).val()

      deleteOrders.push(orderId)
    })

    jQuery(".spinner").addClass("is-active")

    jQuery.ajax({
      type: "POST",
      url: fc.ajaxurl,
      data: {
        action: "fc_mutation_final_delete_function",
        orders: deleteOrders,
        product: product
      },
      success: function (data, textStatus, XMLHttpRequest) {
        jQuery("#mutation_delete_final_submit").prop("disabled", false)
        jQuery("#mutation_delete_notice").html(data)
        jQuery("#mutation_delete_notice").show()

        jQuery("#mutation_delete_final_submit").hide()

        jQuery(".spinner").removeClass("is-active")
      },
      error: function (XMLHttpRequest, textStatus, errorThrown, data) {
        jQuery("#mutation_delete_notice").html(data)
        jQuery("#mutation_delete_notice").show()

        jQuery(".spinner").removeClass("is-active")

        jQuery("#mutation_delete_final_submit").hide()
      }
    })
  })

  // AJAX CALL MUTATION PRICE FUNCTION - LOAD ORDERS
  jQuery("#mutation_price_submit").click(function () {
    jQuery(this).prop("disabled", true)
    var bestellrunde = jQuery("#mutation_bestellrunde").val()

    var product = jQuery(".mutation_price_product:selected").data("id")

    var bestellrunde = jQuery("#export_bestellrunde").children(":selected").attr("id")

    if (product != undefined) {
      jQuery(".spinner").addClass("is-active")

      jQuery.ajax({
        type: "POST",
        url: fc.ajaxurl,
        data: {
          action: "fc_mutation_price_function",
          product: product,
          bestellrunde: bestellrunde
        },
        success: function (data, textStatus, XMLHttpRequest) {
          jQuery("#mutation_price_submit").prop("disabled", false)
          jQuery("#mutation_price_notice").html(data)
          jQuery("#mutation_price_notice").show()

          if (jQuery(".mutation_price_final_confirm").val() == true) {
            jQuery("#mutation_price_final_submit").show()
            jQuery("#mutation_price_field").show()

            var currentPrice = jQuery("#current_product_price").val()
            jQuery("#mutation_price_field").val(currentPrice)
          } else {
            jQuery("#mutation_price_final_submit").hide()
            jQuery("#mutation_price_field").hide()
          }

          jQuery(".spinner").removeClass("is-active")
        },
        error: function (XMLHttpRequest, textStatus, errorThrown, data) {
          jQuery("#mutation_price_notice").html(data)
          jQuery("#mutation_price_notice").show()

          jQuery(".spinner").removeClass("is-active")

          if (jQuery(".mutation_price_final_confirm").val() == true) {
            jQuery("#mutation_price_final_submit").show()
            jQuery("#mutation_price_field").show()
          } else {
            jQuery("#mutation_price_final_submit").hide()
            jQuery("#mutation_price_field").hide()
          }
        }
      })
    } else {
      jQuery("#mutation_price_notice").html("Bitte wähle ein Produkt aus.")
      jQuery("#mutation_price_notice").show()
    }
  })

  // AJAX CALL MUTATION PRICE FUNCTION - CHANGE PRICE & MUTATE WALLETS
  jQuery("#mutation_price_final_submit").click(function () {
    jQuery(this).prop("disabled", true)
    var product = jQuery("#mutation_price_product_id").val()
    var price = jQuery("#mutation_price_field").val()

    var deleteOrders = []

    jQuery(".mutation_price_order_id").each(function () {
      var orderId = jQuery(this).val()

      deleteOrders.push(orderId)
    })

    jQuery(".spinner").addClass("is-active")

    jQuery.ajax({
      type: "POST",
      url: fc.ajaxurl,
      data: {
        action: "fc_mutation_final_price_function",
        orders: deleteOrders,
        product: product,
        price: price
      },
      success: function (data, textStatus, XMLHttpRequest) {
        jQuery("#mutation_price_final_submit").prop("disabled", false)
        jQuery("#mutation_price_notice").html(data)
        jQuery("#mutation_price_notice").show()

        jQuery("#mutation_price_final_submit").hide()

        jQuery(".spinner").removeClass("is-active")
      },
      error: function (XMLHttpRequest, textStatus, errorThrown, data) {
        jQuery("#mutation_price_notice").html(data)
        jQuery("#mutation_price_notice").show()

        jQuery(".spinner").removeClass("is-active")

        jQuery("#mutation_price_final_submit").hide()
      }
    })
  })
})
