import "server-only"

import { getSmsConfig, type SmsMode } from "@/lib/sms/config"

export type SmsProviderSendInput = {
  message: string
  to: string
}

export type SmsProviderSendResult = {
  errorMessage?: string
  providerMessageId?: string
  raw: unknown
  status: "sent" | "failed"
  to: string
}

export type SmsProviderBulkResult = {
  results: SmsProviderSendResult[]
  raw: unknown
}

export interface SmsProvider {
  checkBalance(): Promise<unknown>
  checkRate(): Promise<unknown>
  sendBulkSms(messages: SmsProviderSendInput[]): Promise<SmsProviderBulkResult>
  sendSms(message: SmsProviderSendInput): Promise<SmsProviderSendResult>
}

export class GreenWebSmsProvider implements SmsProvider {
  private readonly apiUrl: string
  private readonly infoUrl: string
  private readonly mode: SmsMode
  private readonly token: string

  constructor({
    apiUrl,
    infoUrl,
    mode,
    token,
  }: {
    apiUrl?: string
    infoUrl?: string
    mode?: SmsMode
    token?: string
  } = {}) {
    const config = getSmsConfig()

    this.apiUrl = apiUrl ?? config.apiUrl
    this.infoUrl = infoUrl ?? config.infoUrl
    this.mode = mode ?? config.mode
    this.token = token ?? config.token
  }

  async sendSms(message: SmsProviderSendInput) {
    if (this.mode === "demo") {
      return {
        providerMessageId: `demo-${Date.now()}-${message.to}`,
        raw: {
          mode: "demo",
          provider: "greenweb",
          skipped_real_send: true,
          status: "SENT",
        },
        status: "sent" as const,
        to: message.to,
      }
    }

    const payload = new URLSearchParams({
      message: message.message,
      to: message.to,
      token: this.token,
    })

    const raw = await this.post(this.apiUrl, payload)
    return normalizeGreenWebSendResult(raw, message.to)
  }

  async sendBulkSms(messages: SmsProviderSendInput[]) {
    const results: SmsProviderSendResult[] = []

    for (const message of messages) {
      results.push(await this.sendSms(message))
    }

    return {
      raw: results.map((result) => result.raw),
      results,
    }
  }

  async checkBalance() {
    if (this.mode === "demo") {
      return {
        mode: "demo",
        provider: "greenweb",
        token: "demo",
      }
    }

    return this.post(
      this.infoUrl,
      new URLSearchParams({ balance: "true", token: this.token })
    )
  }

  async checkRate() {
    if (this.mode === "demo") {
      return {
        mode: "demo",
        provider: "greenweb",
        rate: "demo",
      }
    }

    return this.post(
      this.infoUrl,
      new URLSearchParams({ rate: "true", token: this.token })
    )
  }

  private async post(url: string, body: URLSearchParams) {
    const response = await fetch(url, {
      body,
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    })
    const text = await response.text()
    const parsed = parseProviderBody(text)

    if (!response.ok) {
      return {
        error: `GreenWeb HTTP ${response.status}`,
        response: parsed,
      }
    }

    return parsed
  }
}

export function createSmsProvider(): SmsProvider {
  return new GreenWebSmsProvider()
}

function parseProviderBody(text: string) {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function normalizeGreenWebSendResult(
  raw: unknown,
  to: string
): SmsProviderSendResult {
  const statusText = providerText(raw).toUpperCase()
  const isSent =
    statusText.includes("SENT") ||
    statusText.includes("SUCCESS") ||
    statusText.includes("DELIVERED")
  const providerMessageId = providerField(raw, [
    "id",
    "message_id",
    "messageId",
    "sms_id",
    "smsId",
    "uid",
  ])

  if (isSent && !statusText.includes("FAILED")) {
    return {
      providerMessageId,
      raw,
      status: "sent",
      to,
    }
  }

  return {
    errorMessage:
      providerField(raw, ["error", "error_message", "message", "status"]) ??
      "GreenWeb SMS send failed.",
    providerMessageId,
    raw,
    status: "failed",
    to,
  }
}

function providerText(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  if (!value || typeof value !== "object") {
    return ""
  }

  return JSON.stringify(value)
}

function providerField(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }

  const record = value as Record<string, unknown>

  for (const key of keys) {
    const field = record[key]

    if (typeof field === "string" && field.trim()) {
      return field.trim()
    }

    if (typeof field === "number") {
      return String(field)
    }
  }

  return undefined
}
