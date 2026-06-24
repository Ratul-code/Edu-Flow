import "server-only"

export type SmsMode = "demo" | "production"

export const greenWebDemoToken = "1234567890123456789"

export function getSmsConfig() {
  const mode = smsModeFromEnv(process.env.SMS_MODE)
  const token =
    mode === "demo" ? greenWebDemoToken : process.env.GREENWEB_SMS_TOKEN

  if (!token) {
    throw new Error("GREENWEB_SMS_TOKEN is not configured.")
  }

  return {
    apiUrl:
      process.env.GREENWEB_SMS_API_URL ??
      "https://api.greenweb.com.bd/api.php?json",
    infoUrl:
      process.env.GREENWEB_SMS_INFO_URL ??
      "https://api.greenweb.com.bd/g_api.php",
    mode,
    token,
  }
}

export function getSmsMode(): SmsMode {
  return smsModeFromEnv(process.env.SMS_MODE)
}

function smsModeFromEnv(value: string | undefined): SmsMode {
  return value === "production" ? "production" : "demo"
}
