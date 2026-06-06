import type { StudentPaymentReceiptData } from "@/lib/data/payment-receipts"

type StudentPaymentReceiptProps = {
  receipt: StudentPaymentReceiptData
}

export function StudentPaymentReceipt({ receipt }: StudentPaymentReceiptProps) {
  return (
    <div className="mx-auto w-full max-w-[700px] rounded-md border bg-white p-8 text-slate-950 shadow-sm">
      <div className="flex items-start justify-between gap-6 border-b pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Payment Receipt
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{receipt.tenant.name}</h2>
          {receipt.tenant.address ? (
            <p className="mt-1 max-w-md text-sm text-slate-600">
              {receipt.tenant.address}
            </p>
          ) : null}
          {receipt.tenant.contactPhone ? (
            <p className="mt-1 text-sm text-slate-600">
              Phone: {receipt.tenant.contactPhone}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Receipt no</p>
          <p className="text-lg font-semibold text-emerald-700">
            {receipt.payment.receiptNo}
          </p>
          <p className="mt-2 text-xs text-slate-500">Payment date</p>
          <p className="text-sm font-medium">
            {formatDate(receipt.payment.paymentDate)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 border-b py-5 sm:grid-cols-2">
        <ReceiptField label="Student" value={receipt.student.name} />
        <ReceiptField
          label="Guardian phone"
          value={receipt.student.guardianPhone ?? receipt.student.phone ?? "-"}
        />
        <ReceiptField
          label="Billing month"
          value={formatMonth(receipt.ledger.billingMonth)}
        />
        <ReceiptField
          label="Batch"
          value={receipt.batchNames.length ? receipt.batchNames.join(", ") : "-"}
        />
      </div>

      <div className="grid gap-3 py-5">
        <AmountRow label="Payment method" value={formatMethod(receipt.payment.method)} />
        <AmountRow
          label="Total expected amount"
          value={formatTaka(receipt.ledger.totalExpectedAmount)}
        />
        <AmountRow label="Paid amount" value={formatTaka(receipt.payment.amount)} />
        <AmountRow
          emphasize
          label="Due after this payment"
          value={formatTaka(receipt.ledger.dueAmountAfterPayment)}
        />
      </div>

      <p className="border-t pt-4 text-center text-xs text-slate-500">
        This is a computer-generated receipt.
      </p>
    </div>
  )
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function AmountRow({
  emphasize = false,
  label,
  value,
}: {
  emphasize?: boolean
  label: string
  value: string
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-md px-4 py-3 ${
        emphasize ? "bg-emerald-50 text-emerald-800" : "bg-slate-50"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
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

function formatMethod(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
