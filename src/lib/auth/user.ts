import type { User } from "@supabase/supabase-js"
import { cache } from "react"
import { redirect } from "next/navigation"

import { hasSupabaseEnv } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"

export type AdminContext = {
  adminEmail: string
  adminInitials: string
  adminName: string
  tenantId: string
  tenantName: string
  tenantStatus: string
}

export const getAuthenticatedUser = cache(async function getAuthenticatedUser() {
  if (!hasSupabaseEnv) {
    return null
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return user
})

export const getAdminContext = cache(async function getAdminContext(
  user: User
): Promise<AdminContext | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select(
      `
        tenant_id,
        name,
        phone,
        role,
        status,
        tenant:tenants (
          name,
          subscription_status
        )
      `
    )
    .eq("auth_user_id", user.id)
    .eq("role", "admin")
    .eq("status", "active")
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const tenant = Array.isArray(data.tenant) ? data.tenant[0] : data.tenant
  const adminName = stringFromMetadata(data.name) ?? user.email ?? "Admin"
  const tenantName = stringFromMetadata(tenant?.name)

  if (!tenantName) {
    return null
  }

  return {
    adminEmail: user.email ?? "admin@eduflow.local",
    adminInitials: initialsFor(adminName),
    adminName,
    tenantId: data.tenant_id,
    tenantName,
    tenantStatus: stringFromMetadata(tenant?.subscription_status) ?? "trial",
  }
})

export async function requireAdminContext() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  const admin = await getAdminContext(user)

  if (!admin) {
    redirect(
      `/login?error=${encodeURIComponent(
        "This user is not linked to an active Edu Flow tenant."
      )}`
    )
  }

  return admin
}

export function resolveAdminContext(user: User): AdminContext {
  const metadata = user.user_metadata ?? {}
  const adminName =
    stringFromMetadata(metadata.full_name) ??
    stringFromMetadata(metadata.name) ??
    user.email?.split("@")[0] ??
    "Admin"
  const tenantName =
    stringFromMetadata(metadata.tenant_name) ?? "Dhaka Coaching Center"

  return {
    adminEmail: user.email ?? "admin@eduflow.local",
    adminInitials: initialsFor(adminName),
    adminName,
    tenantId: "metadata-preview",
    tenantName,
    tenantStatus: "MVP workspace",
  }
}

function stringFromMetadata(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function initialsFor(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}
