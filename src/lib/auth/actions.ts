"use server"

import { redirect } from "next/navigation"

import { hasSupabaseEnv } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, parseFormData } from "@/lib/schemas"

function loginError(message: string) {
  redirect(`/login?error=${encodeURIComponent(message)}`)
}

export async function signIn(formData: FormData) {
  if (!hasSupabaseEnv) {
    loginError("Supabase environment variables are not configured yet.")
  }

  const { email, password } = parseFormData(loginSchema, formData)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    loginError(error.message)
  }

  redirect("/dashboard")
}

export async function signOut() {
  if (hasSupabaseEnv) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  redirect("/login")
}
