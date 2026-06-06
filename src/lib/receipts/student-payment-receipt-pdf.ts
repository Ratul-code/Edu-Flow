import type { StudentPaymentReceiptData } from "@/lib/data/payment-receipts"

export function studentPaymentReceiptPdf(receipt: StudentPaymentReceiptData) {
  const lines = [
    "PAYMENT RECEIPT",
    receipt.tenant.name,
    receipt.tenant.address ?? "",
    receipt.tenant.contactPhone ? `Phone: ${receipt.tenant.contactPhone}` : "",
    "",
    `Receipt no: ${receipt.payment.receiptNo}`,
    `Payment date: ${formatDate(receipt.payment.paymentDate)}`,
    "",
    `Student: ${receipt.student.name}`,
    `Guardian phone: ${
      receipt.student.guardianPhone ?? receipt.student.phone ?? "-"
    }`,
    `Billing month: ${formatMonth(receipt.ledger.billingMonth)}`,
    `Batch: ${receipt.batchNames.length ? receipt.batchNames.join(", ") : "-"}`,
    "",
    `Payment method: ${formatMethod(receipt.payment.method)}`,
    `Total expected amount: BDT ${formatNumber(
      receipt.ledger.totalExpectedAmount
    )}`,
    `Paid amount: BDT ${formatNumber(receipt.payment.amount)}`,
    `Due after this payment: BDT ${formatNumber(
      receipt.ledger.dueAmountAfterPayment
    )}`,
    "",
    "This is a computer-generated receipt.",
  ].filter((line) => line !== null)

  return simplePdf(lines)
}

function simplePdf(lines: string[]) {
  const objects: string[] = []
  const addObject = (value: string) => {
    objects.push(value)
    return objects.length
  }
  const content = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    `(${escapePdfText(lines[0] ?? "")}) Tj`,
    "/F1 11 Tf",
    ...lines.slice(1).flatMap((line) => [
      "0 -22 Td",
      `(${escapePdfText(line)}) Tj`,
    ]),
    "ET",
  ].join("\n")
  const catalog = addObject("<< /Type /Catalog /Pages 2 0 R >>")
  const pages = addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
  const page = addObject(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"
  )
  const font = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  const stream = addObject(
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  )
  const header = "%PDF-1.4\n"
  let body = ""
  const offsets = [0]

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(header.length + body.length)
    body += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`
  }

  const xrefOffset = header.length + body.length
  const xref = [
    `xref`,
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
  ].join("\n")
  const trailer = `\ntrailer\n<< /Size ${
    objects.length + 1
  } /Root ${catalog} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  void pages
  void page
  void font
  void stream

  return new TextEncoder().encode(header + body + xref + trailer)
}

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatMethod(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("en-BD")
}
