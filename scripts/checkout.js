jQuery(document).ready(function ($) {
  const hideButton = $("#foodcoop_wallet_balance_missing").val()

  if (hideButton === "true") {
    setInterval(function () {
      $("#place_order").attr("disabled", true)
    }, 100)
  }
})
