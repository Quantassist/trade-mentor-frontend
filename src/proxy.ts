import { getSessionCookie } from "better-auth/cookies"
import createIntlMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

const protectedRoutePatterns = [/^\/[a-z]{2}\/group(.*)/, /^\/group(.*)/]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePatterns.some((pattern) => pattern.test(pathname))
}

export default async function proxy(request: NextRequest) {
  const baseHostEnv = process.env.NEXT_PUBLIC_BASE_URL
  const baseHost = typeof baseHostEnv === "string" ? baseHostEnv : ""
  const host = request.headers.get("host")
  const reqPath = request.nextUrl.pathname
  const origin = request.nextUrl.origin

  // Root path is handled by next-intl middleware with localePrefix: 'as-needed'
  // No explicit redirect needed - the middleware will serve the default locale content

  // Do not apply locale redirection on callback routes
  if (reqPath.startsWith("/callback")) {
    return NextResponse.next()
  }

  // Don't apply middleware to API/TRPC routes
  const isApiRoute = reqPath.startsWith("/api") || reqPath.startsWith("/trpc")
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Check for protected routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(reqPath)) {
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      // Extract locale from path or default to 'en'
      const localeMatch = reqPath.match(/^\/([a-z]{2})\//)
      const locale = localeMatch ? localeMatch[1] : "en"
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url))
    }
  }

  // Handle custom domain routing
  if (baseHost && host && !baseHost.includes(host) && reqPath.startsWith("/group")) {
    try {
      const response = await fetch(`${origin}/api/domain?host=${encodeURIComponent(host)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type") || ""
        let data: any = null

        if (contentType.includes("application/json")) {
          data = await response.json().catch(() => null)
        } else {
          const text = await response.text()
          try {
            data = JSON.parse(text)
          } catch {
            data = null
          }
        }

        if (data?.status === 200 && data?.domain) {
          return NextResponse.rewrite(new URL(reqPath, `https://${data.domain}/${reqPath}`))
        }
      }
    } catch {
      // Ignore domain lookup failures and continue with normal routing
    }
  }

  // Locale routing using next-intl
  const intlMiddleware = createIntlMiddleware({
    locales: ["en", "hi"],
    defaultLocale: "en",
    localePrefix: "as-needed",
  })

  // Apply locale middleware for all other routes
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
