jQuery(document).ready(function ($) {
  /**
   * Wallet functionality: Manually do transactions
   */

  // Transaction pagination
  jQuery(".foodcoop_wallet_add_transaction").click(function () {
    var userId = jQuery(this).data("id")
    var thisTable = jQuery('.foodcoop_wallet_transaction_form_wrapper[data-id="' + userId + '"]')
    thisTable.show()

    var page_num = 10
    var pageClass = "tr.page-" + page_num
    var row_count = jQuery(thisTable).find(" .foodcoop_wallet_transaction_form_history tr").length
    var row_count_pages = Math.ceil(row_count / 10)
    var pagination = ""

    var i = 1
    while (i <= row_count_pages) {
      pagination += '<span class="button more-transactions" style="margin:10px 5px 0 0;" data-id="' + page_num + '">' + i + "</span>"
      page_num = page_num + 10
      i++
    }

    jQuery(thisTable).find(" .foodcoop_wallet_transaction_form_history tr").hide()
    jQuery(pageClass).show()
    jQuery(".page-header").show()

    jQuery(pagination).insertAfter(".foodcoop_wallet_transaction_form_history")

    jQuery(".more-transactions").click(function () {
      var page_num = jQuery(this).data("id")
      var pageClass = "tr.page-" + page_num
      jQuery(thisTable).find(" .foodcoop_wallet_transaction_form_history tr").hide()
      jQuery(pageClass).show()
      jQuery(".page-header").show()
    })
  })

  // Transaction Ajax call
  jQuery(".foodcoop_wallet_transaction_form_submit").click(function () {
    jQuery(this).hide()

    var userId = jQuery(this).data("id")
    var amount = parseFloat(jQuery('.foodcoop_wallet_transaction_form_amount[data-id="' + userId + '"]').val())
    var today = new Date()
    var month = today.getMonth() + 1
    var date = today.getFullYear() + "-" + month + "-" + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    var details = jQuery('.foodcoop_wallet_transaction_form_details[data-id="' + userId + '"]').val()
    var createdBy = jQuery('.foodcoop_wallet_transaction_form_createdby[data-id="' + userId + '"]').val()

    var url = window.location.href

    // CHECK IF AMOUNT = 0
    if (amount !== 0) {
      jQuery.ajax({
        type: "POST",
        url: fc.ajaxurl,
        data: {
          action: "fc_wallet_update_function",
          user_id: userId,
          amount: amount,
          date: date,
          details: details,
          created_by: createdBy
        },
        success: function (output) {
          window.location.href = url
          jQuery(this).show()
        },
        error: function (XMLHttpRequest, textStatus, errorThrown, data) {
          console.log(errorThrown)
        }
      })
    } else {
      alert("Bitte einen gültigen Betrag eingeben.")
    }
  })

  //Transaction form close
  jQuery(".foodcoop_wallet_transaction_form_close").click(function () {
    var id = jQuery(this).data("id")
    jQuery('.foodcoop_wallet_transaction_form_wrapper[data-id="' + id + '"]').hide()

    jQuery(".more-transactions").remove()
  })

  /**
   * Membership Fee Deduct Function on Membership Admin Page
   */
  jQuery(".foodcoop_wallet_memberfee").click(function () {
    var userId = jQuery(this).data("id")
    jQuery('.foodcoop_wallet_memberfee_form_wrapper[data-id="' + userId + '"]').show()
  })

  jQuery(".foodcoop_wallet_memberfee_form_close").click(function () {
    var id = jQuery(this).data("id")
    jQuery('.foodcoop_wallet_memberfee_form_wrapper[data-id="' + id + '"]').hide()
  })

  // Ajax call
  jQuery(".foodcoop_wallet_memberfee_action").click(function () {
    jQuery(this).hide()
    var thisButton = jQuery(this)
    var userId = jQuery(this).data("id")
    var today = new Date()
    var month = today.getMonth() + 1
    var date = today.getFullYear() + "-" + month + "-" + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    var createdBy = jQuery('.foodcoop_wallet_memberfee_form_createdby[data-id="' + userId + '"]').val()
    var feeYear = jQuery(this).data("year")

    jQuery.ajax({
      type: "POST",
      url: fc.ajaxurl,
      data: {
        action: "fc_user_status_update_function",
        user_id: userId,
        date: date,
        created_by: createdBy,
        fee_year: feeYear,
        status: status
      },
      completed: function (output) {
        console.log(date)
      },
      success: function (output) {
        jQuery(this).show()
        console.log(output)
        jQuery(thisButton).hide()
        jQuery(thisButton).closest("td").prev().text(output)
      },
      error: function (XMLHttpRequest, textStatus, errorThrown, data) {
        console.log(errorThrown)
      }
    })
  })
})
