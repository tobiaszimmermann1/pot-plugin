jQuery(document).ready(function ($) {
  const hideButton = $("#foodcoop_wallet_balance_missing").val()

  if (hideButton === "true") {
    console.log(hideButton)
    setInterval(function () {
      $("#place_order").attr("disabled", true)
    }, 100)
  }
})
