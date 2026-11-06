/**
 * Validates a redirect target supplied by the client.
 *
 * Only same-site relative paths are allowed. Anything that could point at
 * another origin (absolute URLs, protocol-relative `//evil.example`) is
 * rejected and falls back to the dashboard.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard"
) {
  if (!value) {
    return fallback
  }

  const candidate = value.trim()

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback
  }

  // Reject backslash variants that some browsers normalise to "//".
  if (candidate.includes("\\")) {
    return fallback
  }

  return candidate
}
