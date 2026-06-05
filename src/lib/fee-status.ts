export function feeStatusRowClass(status: string) {
  const normalized = status.toLowerCase()

  if (normalized === "due" || normalized === "overdue") {
    return "bg-red-50/70 hover:bg-red-50"
  }

  if (normalized === "partial") {
    return "bg-amber-50/70 hover:bg-amber-50"
  }

  if (normalized === "paid") {
    return "bg-emerald-50/70 hover:bg-emerald-50"
  }

  return ""
}

export function feeStatusLabel(status: string) {
  return status.replace(/_/g, " ")
}
