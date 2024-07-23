const settings = window.wc.wcSettings.getSetting("foodcoop_guthaben_data", {})

const label = window.wp.htmlEntities.decodeEntities(settings.title) || window.wp.i18n.__("Foodcoop Guthaben", "fcplugin")

const Content = () => {
  return window.wp.htmlEntities.decodeEntities(settings.description || "")
}

const Block_Gateway = {
  name: "foodcoop_guthaben",
  label: label,
  content: Object(window.wp.element.createElement)(Content, null),
  edit: Object(window.wp.element.createElement)(Content, null),
  canMakePayment: () => true,
  ariaLabel: label,
  supports: {
    features: settings.supports
  },
  placeOrderButtonLabel: window.wp.i18n.__("Einkaufen", "fcplugin")
}

window.wc.wcBlocksRegistry.registerPaymentMethod(Block_Gateway)
