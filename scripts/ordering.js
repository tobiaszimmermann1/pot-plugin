jQuery(document).ready(function ($) {
  // CALCULATE ORDER TOTAL

  function calcOrderTotal() {
    orderTotal = 0

    $(".foodcoop-list-number").each(function () {
      itemId = $(this).attr("id")
      currentId = "#price-" + itemId
      itemPrice = $(currentId).text()
      itemPrice = parseFloat(itemPrice)
      itemNumber = $(this).val()
      itemNumber = parseFloat(itemNumber)

      var itemTotal = itemNumber * itemPrice

      orderTotal = orderTotal + itemTotal

      if (isNaN(orderTotal)) {
        orderTotal = 0
      }
    })

    var orderTotalText = "Total Bestellung: CHF " + orderTotal.toFixed(2)

    $("#foodcoop-order-total").text(orderTotalText)
  }

  var orderTotal = 0
  calcOrderTotal()

  $(".foodcoop-list-number").on("change", function () {
    calcOrderTotal()
  })

  // PRODUCT TABLE

  $("#foodcoop-order-table .products-list").hide()

  $(".table-category span").click(function () {
    var catId = $(this).closest(".table-category").attr("id")

    $('tr[data-cat="' + catId + '"]').toggle(100)

    var caret = $(this).find(".fas")

    if ($(caret).hasClass("fa-caret-down")) {
      $(caret).removeClass("fa-caret-down").addClass("fa-caret-up")
    } else if ($(caret).hasClass("fa-caret-up")) {
      caret.removeClass("fa-caret-up").addClass("fa-caret-down")
    }
  })

  // es fehlen noch

  jQuery(".info-fehlen").mouseenter(function () {
    jQuery(".info-fehlen-div").show(100)
  })

  jQuery(".info-fehlen").mouseleave(function () {
    jQuery(".info-fehlen-div").hide(100)
  })

  // UNWRAP ON PAGE LOAD

  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=")

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1])
      }
    }
    return false
  }

  var category = "#" + getUrlParameter("cat")

  if (typeof category != "undefined" && category !== null && category !== "#false") {
    jQuery(category).find("span").click()

    setTimeout(function () {
      jQuery([document.documentElement, document.body]).animate(
        {
          scrollTop: jQuery(category).offset().top
        },
        100
      )
    }, 200)
  }
  /*
    else {
        
        jQuery('th.category-title-1').find('span').click();

    }
    */
})
