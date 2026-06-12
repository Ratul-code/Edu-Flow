import { requireAdminContext } from "@/lib/auth/user"
import { getTeacherSalaryReceipt } from "@/lib/data/salary-receipts"

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

  return Response.json(receipt)
}
