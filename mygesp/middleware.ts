import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/admin/login")

  if (isOnAdmin && !isLoggedIn) {
    return Response.redirect(new URL("/admin/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/admin/:path*"]
}