import { requireAdminContext } from "@/lib/auth/user"
import { getStudentPaymentReceipt } from "@/lib/data/payment-receipts"

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

  return Response.json(receipt)
}
