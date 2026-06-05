import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  flashToastCookieName,
  flashToastParamName,
  type FlashToastPayload,
} from "@/lib/flash-toast-shared"

export async function setFlashToast(payload: FlashToastPayload) {
  const cookieStore = await cookies()

  cookieStore.set(
    flashToastCookieName,
    encodeURIComponent(JSON.stringify(payload)),
    {
      maxAge: 30,
      path: "/",
      sameSite: "lax",
    }
  )
}

export function redirectWithFlashToast(
  path: string,
  payload: FlashToastPayload
): never {
  redirect(pathWithFlashToast(path, payload))
}

function pathWithFlashToast(path: string, payload: FlashToastPayload) {
  const [pathWithoutHash, hash = ""] = path.split("#", 2)
  const separator = pathWithoutHash.includes("?") ? "&" : "?"
  const encodedPayload = encodeURIComponent(JSON.stringify(payload))
  const nextPath = `${pathWithoutHash}${separator}${flashToastParamName}=${encodedPayload}`

  return hash ? `${nextPath}#${hash}` : nextPath
}
