export type FlashToastTone = "success" | "warning" | "archive" | "destructive"

export type FlashToastPayload = {
  message: string
  title: string
  tone: FlashToastTone
}

export const flashToastCookieName = "edu_flow_flash_toast"
export const flashToastParamName = "flash_toast"
