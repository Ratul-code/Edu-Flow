"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"

import { Toaster } from "@/components/ui/sonner"
import {
  flashToastCookieName,
  flashToastParamName,
  type FlashToastPayload,
  type FlashToastTone,
} from "@/lib/flash-toast-shared"

export function FlashToast() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const shownPayloads = useRef(new Set<string>())

  const urlPayload = useMemo(
    () => searchParams.get(flashToastParamName),
    [searchParams]
  )

  useEffect(() => {
    if (urlPayload) {
      const toastKey = `${pathname}?${search}`
      const payload = parseFlashToastPayload(urlPayload)
      const nextSearchParams = new URLSearchParams(search)

      nextSearchParams.delete(flashToastParamName)
      window.history.replaceState(
        window.history.state,
        "",
        `${pathname}${nextSearchParams.size ? `?${nextSearchParams}` : ""}${window.location.hash}`
      )

      if (!payload || shownPayloads.current.has(toastKey)) {
        return
      }

      shownPayloads.current.add(toastKey)
      showFlashToast(payload)
      return
    }

    const payload = readFlashToast()

    if (payload) {
      document.cookie = `${flashToastCookieName}=; Max-Age=0; path=/; SameSite=Lax`
      showFlashToast(payload)
    }
  }, [pathname, search, urlPayload])

  return <Toaster />
}

function showFlashToast(payload: FlashToastPayload) {
  const options = {
    description: payload.message,
    duration: 4200,
  }

  if (payload.tone === "success") {
    toast.success(payload.title, options)
    return
  }

  if (payload.tone === "warning") {
    toast.warning(payload.title, options)
    return
  }

  if (payload.tone === "destructive") {
    toast.error(payload.title, options)
    return
  }

  toast.warning(payload.title, options)
}

function readFlashToast() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${flashToastCookieName}=`))

  if (!cookie) {
    return null
  }

  try {
    const rawValue = cookie.slice(flashToastCookieName.length + 1)
    return parseFlashToastPayload(decodeURIComponent(rawValue))
  } catch {
    return null
  }
}

function parseFlashToastPayload(value: string) {
  try {
    const payload = JSON.parse(value)

    if (!isFlashToastPayload(payload)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

function isFlashToastPayload(value: unknown): value is FlashToastPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  const payload = value as Partial<FlashToastPayload>

  return (
    typeof payload.title === "string" &&
    typeof payload.message === "string" &&
    isFlashToastTone(payload.tone)
  )
}

function isFlashToastTone(value: unknown): value is FlashToastTone {
  return (
    value === "success" ||
    value === "warning" ||
    value === "archive" ||
    value === "destructive"
  )
}
