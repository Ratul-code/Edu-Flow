"use client"

import {
  ArchiveIcon,
  CheckCircleIcon,
  PencilIcon,
} from "lucide-react"
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
import { cn } from "@/lib/utils"

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

  return <Toaster closeButton position="top-center" />
}

function showFlashToast(payload: FlashToastPayload) {
  toast(payload.title, {
    className: cn(
      "!w-[min(390px,calc(100vw-2rem))] !items-start !gap-3 !rounded-lg !border !p-4 !text-base !shadow-xl",
      toneClass(payload.tone)
    ),
    classNames: {
      closeButton:
        payload.tone === "archive" || payload.tone === "destructive"
          ? "!border-slate-300 !bg-white !text-slate-700 hover:!bg-slate-50"
          : "!border-black/10 !bg-white/80 !text-foreground hover:!bg-white",
      content: "!gap-1",
      description: "!text-[15px] !font-medium !leading-relaxed !text-current !opacity-95",
      icon: "!mt-0.5 !size-9",
      title: "!text-base !font-semibold !leading-tight !text-current",
    },
    description: payload.message,
    duration: 4200,
    icon: (
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          iconContainerClass(payload.tone)
        )}
      >
        {toastIcon(payload.tone)}
      </span>
    ),
  })
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

function toneClass(tone: FlashToastTone) {
  if (tone === "warning") {
    return "!border-amber-200 !bg-amber-50 !text-amber-950 shadow-amber-950/10"
  }

  if (tone === "destructive") {
    return "!border-rose-200 !bg-rose-50 !text-rose-950 shadow-rose-950/10"
  }

  if (tone === "archive") {
    return "!border-slate-300 !bg-slate-100 !text-slate-950 shadow-slate-950/10"
  }

  return "!border-emerald-200 !bg-emerald-50 !text-emerald-950 shadow-emerald-950/10"
}

function iconContainerClass(tone: FlashToastTone) {
  if (tone === "warning") {
    return "bg-amber-100 text-amber-700"
  }

  if (tone === "destructive") {
    return "bg-rose-100 text-rose-700"
  }

  if (tone === "archive") {
    return "bg-slate-200 text-slate-700"
  }

  return "bg-emerald-100 text-emerald-700"
}

function toastIcon(tone: FlashToastTone) {
  if (tone === "warning") {
    return <PencilIcon className="size-5" />
  }

  if (tone === "archive" || tone === "destructive") {
    return <ArchiveIcon className="size-5" />
  }

  return <CheckCircleIcon className="size-5" />
}
