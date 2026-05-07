import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

// Routes that require ADMIN role
const adminRoutes = [
  "/dashboard",
  "/users",
  "/transactions",
  "/kyc",
  "/logs",
  "/roles",
  "/support",
];

// Routes that require MERCHANT role
const merchantRoutes = [
  "/merchant/dashboard",
  "/merchant/analytics",
  "/merchant/settlements",
  "/merchant/customers",
  "/merchant/settings",
];

// Public auth pages (no session required)
const publicAuthRoutes = [
  "/admin/login",
  "/merchant/login",
  "/merchant/register",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session from cookie (optimistic — no DB call)
  const sessionCookie = request.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);

  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isMerchantRoute = merchantRoutes.some((r) => pathname.startsWith(r));
  const isPublicAuthRoute = publicAuthRoutes.some((r) =>
    pathname.startsWith(r)
  );

  // --- Protect admin routes ---
  if (isAdminRoute) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (session.role !== "ADMIN") {
      // Wrong role — send merchants back to their portal
      return NextResponse.redirect(
        new URL("/merchant/dashboard", request.url)
      );
    }
  }

  // --- Protect merchant routes ---
  if (isMerchantRoute) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/merchant/login", request.url));
    }
    if (session.role !== "MERCHANT") {
      // Wrong role — send admins back to their portal
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // --- Redirect authenticated users away from auth pages ---
  if (isPublicAuthRoute && session?.userId) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.role === "MERCHANT") {
      return NextResponse.redirect(
        new URL("/merchant/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except API routes, static files, images, favicon
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
