jQuery(document).ready(function ($) {
  // AJAX CALL USER STATUS UPDATE FUNCTION
  jQuery(".foodcoop_user_status_activate").click(function () {
    jQuery(this).attr("disabled", true)
    var userId = jQuery(this).data("id")
    var userSpan = jQuery('.foodcoop_user_status[data-user="' + userId + '"]')

    jQuery.ajax({
      type: "POST",
      url: fc.ajaxurl,
      data: {
        action: "fc_user_activity_update_function",
        user_id: userId,
        status: "aktiv"
      },
      success: function (output) {
        jQuery(userSpan).html(output)
        jQuery(this).attr("disabled", false)
      },
      error: function (XMLHttpRequest, textStatus, errorThrown, data) {
        console.log(errorThrown)
      }
    })
  })

  jQuery(".foodcoop_user_status_deactivate").click(function () {
    jQuery(this).attr("disabled", true)
    var userId = jQuery(this).data("id")
    var userSpan = jQuery('.foodcoop_user_status[data-user="' + userId + '"]')

    jQuery.ajax({
      type: "POST",
      url: fc.ajaxurl,
      data: {
        action: "fc_user_activity_update_function",
        user_id: userId,
        status: "gesperrt"
      },
      success: function (output) {
        jQuery(userSpan).html(output)
        jQuery(this).attr("disabled", false)
      },
      error: function (XMLHttpRequest, textStatus, errorThrown, data) {
        console.log(errorThrown)
      }
    })
  })
})
