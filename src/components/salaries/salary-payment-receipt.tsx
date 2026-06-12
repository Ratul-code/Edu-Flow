import type { TeacherSalaryReceiptData } from "@/lib/data/salary-receipts"

export function SalaryPaymentReceipt({
  receipt,
}: {
  receipt: TeacherSalaryReceiptData
}) {
  return (
    <div className="mx-auto w-full max-w-[640px] bg-white text-slate-900">
      <div className="border border-slate-200">
        <div className="border-b-4 border-teal-700 px-8 py-5 text-center">
          <h2 className="text-xl font-bold leading-tight">
            {receipt.tenant.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {receipt.tenant.address || "-"}
            {receipt.tenant.contactPhone ? ` · Phone: ${receipt.tenant.contactPhone}` : ""}
          </p>
          <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Salary Receipt
          </p>
        </div>
        <div className="grid grid-cols-2 border-b border-slate-200 px-8 py-4 text-sm">
          <ReceiptLine label="Receipt No" value={receipt.payment.receiptNumber} />
          <ReceiptLine
            align="right"
            label="Date"
            value={formatDate(receipt.payment.paymentDate)}
          />
        </div>
        <div className="grid gap-x-8 gap-y-3 border-b border-slate-200 px-8 py-5 text-sm sm:grid-cols-2">
          <ReceiptLine label="Paid To" value={receipt.teacher.name} />
          <ReceiptLine label="Phone" value={receipt.teacher.phone ?? "-"} />
          <ReceiptLine
            label="Salary Month"
            value={formatMonth(receipt.ledger.salaryMonth)}
          />
          <ReceiptLine label="Subject" value={receipt.teacher.subject ?? "-"} />
        </div>
        <div className="px-8 py-5">
          <div className="overflow-hidden border border-slate-200 text-sm">
            <AmountRow label="Payment Method" value={paymentMethodLabel(receipt.payment.method)} />
            <AmountRow
              label="Expected Salary"
              value={formatTaka(receipt.ledger.expectedSalary)}
            />
            <AmountRow
              label="Paid Amount"
              positive
              value={formatTaka(receipt.payment.amount)}
            />
            <AmountRow
              danger
              label="Due After This Payment"
              value={formatTaka(receipt.ledger.dueAmountAfterPayment)}
            />
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            This is a computer-generated receipt.
          </p>
        </div>
        <div className="bg-teal-700 px-8 py-3 text-center text-sm font-semibold text-white">
          Thank you for being with us.
        </div>
      </div>
    </div>
  )
}

function ReceiptLine({
  align = "left",
  label,
  value,
}: {
  align?: "left" | "right"
  label: string
  value: string
}) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function AmountRow({
  danger = false,
  label,
  positive = false,
  value,
}: {
  danger?: boolean
  label: string
  positive?: boolean
  value: string
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0 ${
        danger ? "bg-red-50" : "bg-white"
      }`}
    >
      <span className={`font-medium ${danger ? "text-slate-900" : "text-slate-600"}`}>
        {label}
      </span>
      <span
        className={`font-bold ${
          positive ? "text-teal-700" : danger ? "text-red-700" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  )
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

function formatTaka(value: number | string) {
  return `BDT ${Number(value).toLocaleString("en-BD")}`
}

function paymentMethodLabel(value: string) {
  const labels: Record<string, string> = {
    bank: "Bank Transfer",
    bkash: "bKash",
    card: "Card",
    cash: "Cash",
    nagad: "Nagad",
    other: "Other",
  }

  return labels[value] ?? value
}
