import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import {
  hasSupabaseEnv,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config"

const authRoute = "/login"
const appHome = "/dashboard"

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isLoginRoute = pathname === authRoute
  const isRootRoute = pathname === "/"

  if (!hasSupabaseEnv) {
    if (isLoginRoute || isRootRoute) {
      return NextResponse.next()
    }

    return redirectToLogin(request)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        supabaseResponse = NextResponse.next({
          request,
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && (isLoginRoute || isRootRoute)) {
    return NextResponse.redirect(new URL(appHome, request.url))
  }

  if (!user && !isLoginRoute) {
    return redirectToLogin(request, `${pathname}${search}`)
  }

  return supabaseResponse
}

function redirectToLogin(request: NextRequest, next?: string) {
  const redirectUrl = new URL(authRoute, request.url)

  if (next) {
    redirectUrl.searchParams.set("next", next)
  }

  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
