import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

export function useIsMobile() {
  return React.useSyncExternalStore(subscribeToMobileQuery, getMobileSnapshot, getServerSnapshot)
}

function subscribeToMobileQuery(callback: () => void) {
  const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY)

  mediaQueryList.addEventListener("change", callback)

  return () => {
    mediaQueryList.removeEventListener("change", callback)
  }
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function getServerSnapshot() {
  return false
}
