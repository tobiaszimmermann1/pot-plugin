function getCookie(cname) {
  let name = cname + "="
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}

function setCookie(name, value, days) {
  var expires = ""
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/"
}

function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
}

function filterProducts(bestellrunde) {
  // reset all products to visible first
  jQuery(".single-product .cart").css({ "pointer-events": "auto" })
  jQuery(".single-product .cart button").prop("disabled", false)
  jQuery(".single-product .cart input").prop("disabled", false)
  jQuery(".single-product .cart .fc_shopwide_bestellrunden_unavailable").remove()
  jQuery("img").css("opacity", "1")
  jQuery(".add_to_cart_button").show()
  jQuery(".fc_shopwide_bestellrunden_unavailable").remove()
  jQuery(".product").addClass("fc_shopwide_bestellrunden_product")

  var bestellrundeProducts = bestellrunde.bestellrunde_products

  jQuery(".product").each(function () {
    var classes = jQuery(this)[0].classList
    var productId = null

    jQuery.each(classes, function (index, item) {
      if (item.substring(0, 5) === "post-") {
        productId = item.substring(5)
      }
    })

    if (productId) {
      if (!bestellrundeProducts.includes(productId)) {
        jQuery(this).find(".cart").css({ "pointer-events": "none" })
        jQuery(this).find(".cart").find("button").prop("disabled", true)
        jQuery(this).find(".cart").find("input").prop("disabled", true)
        jQuery(this).find(".cart").append(`<span class="fc_shopwide_bestellrunden_unavailable">in Bestellrunde <i>${bestellrunde.bestellrunde_name}</i> nicht verfügbar</span>`)
        jQuery(this).find("img").css("opacity", "0.1")
        jQuery(this).find(".add_to_cart_button").hide()
        if (jQuery(this).parents(".related").length) {
          jQuery(this).append(`<span class='fc_shopwide_bestellrunden_unavailable'>in Bestellrunde <i>${bestellrunde.bestellrunde_name}</i> nicht verfügbar</span>`)
        }
      } else {
        jQuery(this).find(".add_to_cart_button").show()
        jQuery(this).find("img").css("opacity", "1")
        jQuery(this).find(".cart").css({ "pointer-events": "auto" })
        jQuery(this).find(".cart").find("button").prop("disabled", false)
        jQuery(this).find(".cart").find("input").prop("disabled", false)
      }
    }
  })
}

jQuery("document").ready(function () {
  // get active bestellrunden form cookie fc_active_bestellrunden, if it exists
  var activeBestellrunden = getCookie("fc_active_bestellrunden")
  if (activeBestellrunden) {
    activeBestellrunden = JSON.parse(activeBestellrunden)
    var bestellrundeFromSession = sessionStorage.getItem("fc_selected_bestellrunde")

    var dropdown = `<span>Bestellrunde: <select id="fc_shopwide_bestellrunden_selector_select">`
    for (var i = 0; i < activeBestellrunden.length; i++) {
      var selected = ""

      if (bestellrundeFromSession) {
        if (JSON.parse(bestellrundeFromSession).ID === activeBestellrunden[i].ID) selected = "selected"
      } else {
        if (i === 0) selected = "selected"
      }
      dropdown += `<option class="fc_shopwide_bestellrunden_selector_option" value="${activeBestellrunden[i].ID}" ${selected}>${activeBestellrunden[i].bestellrunde_name}</option>`
    }
    dropdown += `</select></span>`

    if (activeBestellrunden.length === 1) {
      jQuery("#fc_shopwide_bestellrunden_selector_content").append(`<span>Aktuell gibt es eine aktive Bestellrunde: <strong>${activeBestellrunden[0].bestellrunde_name}</strong></span>`)
    } else {
      jQuery("#fc_shopwide_bestellrunden_selector_content").append("<p>Aktuell gibt es aktive Bestellrunden! Wähle aus in welcher Bestellrunde du bestellen willst.</p>")
      jQuery("#fc_shopwide_bestellrunden_selector_content").append(dropdown)
    }

    // first filtering event from session storage if available or first available bestellrunde
    if (bestellrundeFromSession) {
      filterProducts(JSON.parse(bestellrundeFromSession))
      eraseCookie("fc_selected_bestellrunde")
      setCookie("fc_selected_bestellrunde", bestellrundeFromSession, 7)
    } else {
      filterProducts(activeBestellrunden[0])
      eraseCookie("fc_selected_bestellrunde")
      setCookie("fc_selected_bestellrunde", JSON.stringify(activeBestellrunden[0]), 7)
    }

    jQuery("#fc_shopwide_bestellrunden_selector_select").on("change", function () {
      var id = parseInt(jQuery(this).val())
      jQuery.each(activeBestellrunden, (index, item) => {
        if (item.ID === id) {
          filterProducts(activeBestellrunden[index])
          sessionStorage.setItem("fc_selected_bestellrunde", JSON.stringify(activeBestellrunden[index]))
          eraseCookie("fc_selected_bestellrunde")
          setCookie("fc_selected_bestellrunde", JSON.stringify(activeBestellrunden[index]), 7)
        }
      })
    })
  } else {
    // no active bestellrunden -> disable all add to cart buttons
    eraseCookie("fc_selected_bestellrunde")
    sessionStorage.removeItem("fc_selected_bestellrunde")

    jQuery("#fc_shopwide_bestellrunden_selector").html(`Aktuell ist keine Bestellrunde aktiv und es kann nicht bestellt werden.`)

    jQuery("li.product").each(function () {
      jQuery(this).find(".add_to_cart_button").hide()
    })

    jQuery(".product").each(function () {
      jQuery(this).find(".cart").find("input").hide()
      jQuery(this).find(".cart").find("button").hide()
      jQuery(this).find(".summary").find(".price").after(`<span class='fc_shopwide_bestellrunden_unavailable'>aktuell ist keine Bestellrunde aktiv und es kann nicht bestellt werden.</span>`)
    })
  }
})
