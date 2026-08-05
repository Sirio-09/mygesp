import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const role = (req.auth?.user as { role?: string })?.role
  const otpVerified = (req.auth?.user as { otpVerified?: boolean })?.otpVerified
  const path = req.nextUrl.pathname

  const isAdminArea = path.startsWith("/admin") && !path.startsWith("/admin/login") && !path.startsWith("/admin/2fa")

  if (isAdminArea) {
    if (!isLoggedIn || role !== "admin") {
      return Response.redirect(new URL("/admin/login", req.nextUrl))
    }
    if (!otpVerified) {
      return Response.redirect(new URL("/admin/2fa-verify", req.nextUrl))
    }
  }
})

export const config = {
  matcher: ["/admin/:path*"]
}