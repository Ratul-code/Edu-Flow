"use server"

import { revalidatePath } from "next/cache"
import { requireAdminContext } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"
import { classLevelSchema, parseFormData } from "@/lib/schemas"

export async function createClassLevel(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { name } = parseFormData(classLevelSchema, formData)

  const { error } = await supabase
    .from("class_levels")
    .insert({
      tenant_id: admin.tenantId,
      name,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/settings")
  revalidatePath("/students")
  revalidatePath("/batches/new")
}

export async function deleteClassLevel(classLevelId: string) {
  const admin = await requireAdminContext()
  const supabase = await createClient()

  const { error } = await supabase
    .from("class_levels")
    .delete()
    .eq("tenant_id", admin.tenantId)
    .eq("id", classLevelId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/settings")
  revalidatePath("/students")
  revalidatePath("/batches/new")
}
