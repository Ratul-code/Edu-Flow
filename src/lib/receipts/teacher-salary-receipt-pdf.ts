import type { TeacherSalaryReceiptData } from "@/lib/data/salary-receipts"

const pageWidth = 595
const pageHeight = 842
const receiptX = 82
const receiptY = 72
const receiptWidth = 431
const teal: Color = [0, 0.48, 0.43]
const slate900: Color = [0.06, 0.09, 0.16]
const slate600: Color = [0.29, 0.35, 0.43]
const slate500: Color = [0.39, 0.45, 0.55]
const slate200: Color = [0.87, 0.9, 0.94]
const red50: Color = [0.99, 0.92, 0.91]
const red700: Color = [0.73, 0.11, 0.11]

type Color = [number, number, number]

export function teacherSalaryReceiptPdf(receipt: TeacherSalaryReceiptData) {
  const pdf = new PdfCanvas()
  const x = receiptX
  const y = receiptY
  const w = receiptWidth
  const right = x + w

  pdf.rect(0, 0, pageWidth, pageHeight, [1, 1, 1])
  pdf.rect(x, y, w, 392, [1, 1, 1], slate200)
  pdf.rect(x, y, w, 4, teal)
  pdf.text(receipt.tenant.name, x + w / 2, y + 33, {
    align: "center",
    color: slate900,
    font: "bold",
    size: 16,
  })
  pdf.text(centerInfo(receipt), x + w / 2, y + 55, {
    align: "center",
    color: slate500,
    size: 9,
  })
  pdf.text("SALARY RECEIPT", x + w / 2, y + 82, {
    align: "center",
    color: teal,
    font: "bold",
    size: 10,
  })
  pdf.line(x, y + 104, right, y + 104, slate200)
  drawField(pdf, x + 24, y + 130, "RECEIPT NO", receipt.payment.receiptNumber)
  drawField(pdf, right - 24, y + 130, "DATE", formatDate(receipt.payment.paymentDate), "right")
  pdf.line(x, y + 154, right, y + 154, slate200)
  drawField(pdf, x + 24, y + 184, "PAID TO", receipt.teacher.name)
  drawField(pdf, x + 235, y + 184, "PHONE", receipt.teacher.phone ?? "-")
  drawField(pdf, x + 24, y + 226, "SALARY MONTH", formatMonth(receipt.ledger.salaryMonth))
  drawField(pdf, x + 235, y + 226, "SUBJECT", receipt.teacher.subject ?? "-")
  pdf.line(x, y + 250, right, y + 250, slate200)

  const tableX = x + 24
  const tableY = y + 274
  const tableW = w - 48
  pdf.rect(tableX, tableY, tableW, 116, [1, 1, 1], slate200)
  drawAmountRow(pdf, tableX, tableY, tableW, "Payment Method", paymentMethodLabel(receipt.payment.method))
  drawAmountRow(pdf, tableX, tableY + 29, tableW, "Expected Salary", formatTaka(receipt.ledger.expectedSalary))
  drawAmountRow(pdf, tableX, tableY + 58, tableW, "Paid Amount", formatTaka(receipt.payment.amount), "positive")
  drawAmountRow(pdf, tableX, tableY + 87, tableW, "Due After This Payment", formatTaka(receipt.ledger.dueAmountAfterPayment), "danger")
  pdf.text("This is a computer-generated receipt.", x + w / 2, y + 417, {
    align: "center",
    color: slate500,
    size: 8,
  })
  pdf.rect(x, y + 438, w, 30, teal)
  pdf.text("Thank you for being with us.", x + w / 2, y + 457, {
    align: "center",
    color: [1, 1, 1],
    font: "bold",
    size: 9,
  })

  return pdf.render()
}

function drawField(pdf: PdfCanvas, x: number, y: number, label: string, value: string, align: "left" | "right" = "left") {
  pdf.text(label, x, y - 13, { align, color: slate500, font: "bold", size: 7 })
  pdf.text(value, x, y + 3, { align, color: slate900, font: "bold", maxWidth: 176, size: 10 })
}

function drawAmountRow(pdf: PdfCanvas, x: number, y: number, width: number, label: string, value: string, tone: "danger" | "default" | "positive" = "default") {
  if (tone === "danger") pdf.rect(x + 1, y + 1, width - 2, 28, red50)
  if (y > receiptY + 274) pdf.line(x, y, x + width, y, slate200)
  pdf.text(label, x + 12, y + 19, {
    color: tone === "danger" ? slate900 : slate600,
    font: tone === "danger" ? "bold" : "regular",
    size: 9,
  })
  pdf.text(value, x + width - 12, y + 19, {
    align: "right",
    color: tone === "positive" ? teal : tone === "danger" ? red700 : slate900,
    font: "bold",
    size: 9,
  })
}

type TextOptions = { align?: "center" | "left" | "right"; color?: Color; font?: "regular" | "bold"; maxWidth?: number; size?: number }

class PdfCanvas {
  private commands: string[] = []
  rect(x: number, y: number, width: number, height: number, fill: Color, stroke?: Color) {
    this.fill(fill)
    if (stroke) this.stroke(stroke)
    this.commands.push(`${x} ${this.flipY(y + height)} ${width} ${height} re ${stroke ? "B" : "f"}`)
  }
  line(x1: number, y1: number, x2: number, y2: number, color: Color) {
    this.stroke(color)
    this.commands.push(`${x1} ${this.flipY(y1)} m ${x2} ${this.flipY(y2)} l S`)
  }
  text(value: string, x: number, y: number, options: TextOptions = {}) {
    const size = options.size ?? 10
    const font = options.font === "bold" ? "F2" : "F1"
    const text = options.maxWidth ? truncate(value, options.maxWidth, size) : value
    const textWidth = estimateTextWidth(text, size)
    const offset = options.align === "right" ? textWidth : options.align === "center" ? textWidth / 2 : 0
    this.fill(options.color ?? slate900)
    this.commands.push(["BT", `/${font} ${size} Tf`, `${(x - offset).toFixed(2)} ${this.flipY(y).toFixed(2)} Td`, `(${escapePdfText(text)}) Tj`, "ET"].join("\n"))
  }
  render() {
    return simplePdf(this.commands.join("\n"))
  }
  private fill([r, g, b]: Color) {
    this.commands.push(`${r} ${g} ${b} rg`)
  }
  private stroke([r, g, b]: Color) {
    this.commands.push(`${r} ${g} ${b} RG`)
  }
  private flipY(y: number) {
    return pageHeight - y
  }
}

function simplePdf(content: string) {
  const objects: string[] = []
  const addObject = (value: string) => {
    objects.push(value)
    return objects.length
  }
  const catalog = addObject("<< /Type /Catalog /Pages 2 0 R >>")
  const pages = addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
  const page = addObject("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>")
  const regularFont = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  const boldFont = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
  const stream = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
  const header = "%PDF-1.4\n"
  let body = ""
  const offsets = [0]
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(header.length + body.length)
    body += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`
  }
  const xrefOffset = header.length + body.length
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)].join("\n")
  const trailer = `\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  void pages; void page; void regularFont; void boldFont; void stream
  return new TextEncoder().encode(header + body + xref + trailer)
}

function centerInfo(receipt: TeacherSalaryReceiptData) {
  return receipt.tenant.contactPhone ? `${receipt.tenant.address || "-"} | Phone: ${receipt.tenant.contactPhone}` : receipt.tenant.address || "-"
}
function escapePdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "").replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")
}
function estimateTextWidth(value: string, size: number) {
  return value.length * size * 0.53
}
function truncate(value: string, maxWidth: number, size: number) {
  const maxChars = Math.max(8, Math.floor(maxWidth / (size * 0.53)))
  return value.length <= maxChars ? value : `${value.slice(0, maxChars - 3)}...`
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`))
}
function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", { month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`))
}
function formatTaka(value: number | string) {
  return `BDT ${Number(value).toLocaleString("en-BD")}`
}
function paymentMethodLabel(value: string) {
  const labels: Record<string, string> = { bank: "Bank Transfer", bkash: "bKash", card: "Card", cash: "Cash", nagad: "Nagad", other: "Other" }
  return labels[value] ?? value
}
