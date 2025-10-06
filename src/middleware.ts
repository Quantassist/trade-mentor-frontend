import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import createIntlMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher("/group(.*)")

export default clerkMiddleware(async (auth, request) => {
  // const baseHost = "localhost:3000"
  const baseHost = `${process.env.NEXT_PUBLIC_BASE_URL}`
  const host = request.headers.get("host")
  const reqPath = request.nextUrl.pathname
  const origin = request.nextUrl.origin
  if (isProtectedRoute(request)) auth.protect()

  // Do not apply locale redirection on the landing page
  if (reqPath === "/" || reqPath.startsWith("/callback")) {
    return NextResponse.next()
  }
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

  // Locale routing for group routes using next-intl
  const intlMiddleware = createIntlMiddleware({
    locales: ["en", "hi"],
    defaultLocale: "en",
  })

  // Don't apply locale middleware to API/TRPC routes to avoid prefixing /en or /hi
  const isApiRoute = reqPath.startsWith("/api") || reqPath.startsWith("/trpc")
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Apply locale middleware for all other routes
  return intlMiddleware(request)
  // return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
