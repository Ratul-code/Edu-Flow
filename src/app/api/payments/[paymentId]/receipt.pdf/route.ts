import { requireAdminContext } from "@/lib/auth/user"
import { getStudentPaymentReceipt } from "@/lib/data/payment-receipts"
import { studentPaymentReceiptPdf } from "@/lib/receipts/student-payment-receipt-pdf"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const admin = await requireAdminContext()
  const { paymentId } = await params
  const receipt = await getStudentPaymentReceipt(admin.tenantId, paymentId)

  if (!receipt) {
    return Response.json({ error: "Receipt not found." }, { status: 404 })
  }

  return new Response(studentPaymentReceiptPdf(receipt), {
    headers: {
      "content-disposition": `attachment; filename="receipt-${receipt.payment.receiptNo}.pdf"`,
      "content-type": "application/pdf",
    },
  })
}
