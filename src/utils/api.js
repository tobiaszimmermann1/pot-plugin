/**
 * Centralized API utility for the Foodcoop plugin.
 *
 * Wraps axios to provide consistent nonce authentication, JSON response parsing,
 * and a single location for the API base URL. All REST API calls in this plugin
 * should use these helpers instead of calling axios directly.
 *
 * Supports both the admin backend context (appLocalizer) and the customer-facing
 * frontend context (frontendLocalizer), automatically selecting the correct one.
 */
import axios from "axios"

/**
 * Returns the active localizer object, preferring the admin backend localizer
 * (appLocalizer) when available and falling back to the frontend localizer
 * (frontendLocalizer) for customer-facing pages.
 *
 * @returns {Object} The active localizer object.
 */
function getLocalizer() {
  if (typeof appLocalizer !== "undefined") {
    return appLocalizer
  }
  return frontendLocalizer
}

/**
 * Returns the default request headers including the WordPress REST API nonce.
 *
 * @returns {Object} Headers object with X-WP-Nonce set.
 */
function getHeaders() {
  return {
    "X-WP-Nonce": getLocalizer().nonce
  }
}

/**
 * Returns the full URL for a given API endpoint.
 *
 * @param {string} endpoint - The endpoint path (e.g. 'getUsers').
 * @returns {string} The full API URL.
 */
function apiUrl(endpoint) {
  return `${getLocalizer().apiUrl}/foodcoop/v1/${endpoint}`
}

/**
 * Performs a GET request to the given foodcoop API endpoint.
 * Automatically includes authentication headers and parses the JSON response.
 *
 * @param {string} endpoint - The API endpoint (e.g. 'getUsers').
 * @param {Object} [params={}] - Optional query parameters.
 * @returns {Promise<*>} Resolves with the parsed response data.
 */
export function apiGet(endpoint, params = {}) {
  return axios
    .get(apiUrl(endpoint), {
      headers: getHeaders(),
      params
    })
    .then(response => {
      if (response.data && typeof response.data === "string") {
        return JSON.parse(response.data)
      }
      return response.data
    })
}

/**
 * Performs a POST request to the given foodcoop API endpoint.
 * Automatically includes authentication headers and parses the JSON response.
 *
 * @param {string} endpoint - The API endpoint (e.g. 'postAddUser').
 * @param {Object} [body={}] - The request body.
 * @returns {Promise<*>} Resolves with the parsed response data.
 */
export function apiPost(endpoint, body = {}) {
  return axios
    .post(apiUrl(endpoint), body, {
      headers: getHeaders()
    })
    .then(response => {
      if (response.data && typeof response.data === "string") {
        return JSON.parse(response.data)
      }
      return response.data
    })
}
