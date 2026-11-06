import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import {
  hasSupabaseEnv,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config"

const authRoute = "/login"
const appHome = "/dashboard"

// Routes a signed-out visitor may reach. A signed-in visitor is redirected
// away from these to the app.
const publicRoutes = ["/login", "/signup", "/pricing"]

const onboardingRoute = "/onboarding"

const isPublicRoute = (pathname: string) =>
  publicRoutes.some((route) => pathname === route)

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isRootRoute = pathname === "/"

  if (!hasSupabaseEnv) {
    if (isPublicRoute(pathname) || isRootRoute) {
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

  if (user && (isPublicRoute(pathname) || isRootRoute)) {
    // A signed-in user on the onboarding route may still need to create a
    // centre, so that route is not bounced away here.
    return NextResponse.redirect(new URL(appHome, request.url))
  }

  if (!user && !isPublicRoute(pathname)) {
    // Onboarding requires a session. Send a signed-out visitor to the login
    // page instead, keeping the intended destination.
    if (pathname === onboardingRoute) {
      return redirectToLogin(request)
    }

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
