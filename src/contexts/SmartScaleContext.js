import { createContext, useContext, useEffect, useRef, useState } from "react"
import axios from "axios"

const SmartScaleContext = createContext(null)

const STORAGE_KEY = "fc_selfcheckout_smartscale_url"

export function SmartScaleProvider({ children }) {
  const [weightValue, setWeightValue] = useState(0)
  const subscriberCount = useRef(0)
  const pollInterval = useRef(null)
  const smartScaleURL = useRef(localStorage.getItem(STORAGE_KEY))

  // URL-Änderungen im localStorage beobachten
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY) {
        smartScaleURL.current = e.newValue

        // URL entfernt → Polling stoppen, Wert zurücksetzen
        if (!e.newValue && subscriberCount.current > 0) {
          stopPolling()
          setWeightValue(0)
        }

        // URL neu gesetzt → Polling starten falls Subscriber vorhanden
        if (e.newValue && subscriberCount.current > 0 && !pollInterval.current) {
          startPolling()
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  function fetchWeight() {
    if (!smartScaleURL.current) return

    axios.get(smartScaleURL.current)
      .then(response => {
        setWeightValue(
          response.data.status === "connected"
            ? response.data.value / 1000
            : 0
        )
      })
      .catch(() => setWeightValue(0))
  }

  function startPolling() {
    if (pollInterval.current) return
    fetchWeight()
    pollInterval.current = setInterval(fetchWeight, 1000)
  }

  function stopPolling() {
    if (pollInterval.current) {
      clearInterval(pollInterval.current)
      pollInterval.current = null
    }
  }

  function subscribe() {
    subscriberCount.current += 1
    if (subscriberCount.current === 1 && smartScaleURL.current) startPolling()
  }

  function unsubscribe() {
    subscriberCount.current -= 1
    if (subscriberCount.current === 0) stopPolling()
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  return (
    <SmartScaleContext.Provider value={{ weightValue, subscribe, unsubscribe }}>
      {children}
    </SmartScaleContext.Provider>
  )
}

export function useSmartScale() {
  return useContext(SmartScaleContext)
}