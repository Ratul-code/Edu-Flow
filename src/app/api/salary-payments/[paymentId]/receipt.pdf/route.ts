import { requireAdminContext } from "@/lib/auth/user"
import { getTeacherSalaryReceipt } from "@/lib/data/salary-receipts"
import { teacherSalaryReceiptPdf } from "@/lib/receipts/teacher-salary-receipt-pdf"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const admin = await requireAdminContext()
  const { paymentId } = await params
  const receipt = await getTeacherSalaryReceipt(admin.tenantId, paymentId)

  if (!receipt) {
    return Response.json({ error: "Receipt not found." }, { status: 404 })
  }

  return new Response(teacherSalaryReceiptPdf(receipt), {
    headers: {
      "content-disposition": `attachment; filename="salary-receipt-${receipt.payment.receiptNumber}.pdf"`,
      "content-type": "application/pdf",
    },
  })
}
