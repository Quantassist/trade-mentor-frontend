import createIntlMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

const protectedRoutePatterns = [/^\/[a-z]{2}\/group(.*)/, /^\/group(.*)/]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePatterns.some((pattern) => pattern.test(pathname))
}

export default async function middleware(request: NextRequest) {
  const baseHost = `${process.env.NEXT_PUBLIC_BASE_URL}`
  const host = request.headers.get("host")
  const reqPath = request.nextUrl.pathname
  const origin = request.nextUrl.origin

  // Redirect root to default locale landing page
  if (reqPath === "/") {
    return NextResponse.redirect(new URL("/en", request.url))
  }

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
    const sessionCookie = request.cookies.get("better-auth.session_token")
    if (!sessionCookie) {
      // Extract locale from path or default to 'en'
      const localeMatch = reqPath.match(/^\/([a-z]{2})\//)
      const locale = localeMatch ? localeMatch[1] : "en"
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url))
    }
  }

  // Handle custom domain routing
  if (!baseHost.includes(host as string) && reqPath.startsWith("/group")) {
    const response = await fetch(`${origin}/api/domain?host=${host}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const data = await response.json()
    if (data.status === 200 && data) {
      return NextResponse.rewrite(
        new URL(reqPath, `https://${data.domain}/${reqPath}`),
      )
    }
  }

  // Locale routing using next-intl
  const intlMiddleware = createIntlMiddleware({
    locales: ["en", "hi"],
    defaultLocale: "en",
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
