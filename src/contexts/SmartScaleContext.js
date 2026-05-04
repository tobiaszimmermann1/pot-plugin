import { createContext, useContext, useEffect, useRef, useState } from "react"
import axios from "axios"

const SmartScaleContext = createContext(null)

export const STORAGE_KEY = "fc_selfcheckout_smartscale_url"

export function SmartScaleProvider({ children }) {
  const [weightValue, setWeightValue] = useState(0)
  const subscriberCount = useRef(0)
  const pollInterval = useRef(null)
  const smartScaleURL = useRef(null)

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

  function pair(url) {
    localStorage.setItem(STORAGE_KEY,url);
  }

  function isPaired() {
    let url = localStorage.getItem(STORAGE_KEY);
    if ( !url || url == 'null' ) {
      return false;
    }

    smartScaleURL.current = url;

    if (!smartScaleURL.current) return false;

    return true;
  }

  function fetchWeight() {
    if ( !isPaired() ) return

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
    if ( !isPaired() ) return
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
    if (subscriberCount.current === 1 && isPaired() ) startPolling()
  }

  function unsubscribe() {
    subscriberCount.current -= 1
    if (subscriberCount.current === 0) stopPolling()
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  return (
    <SmartScaleContext.Provider value={{ weightValue, subscribe, unsubscribe, isPaired, pair }}>
      {children}
    </SmartScaleContext.Provider>
  )
}

export function useSmartScale() {
  return useContext(SmartScaleContext)
}