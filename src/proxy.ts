import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

// Public auth pages (no session required) — must be checked before the
// role guards, since they live under the guarded /admin prefix
const publicAuthRoutes = ["/admin/login", "/admin/signup", "/login"];

// --- SERVICE_ROLE fencing -------------------------------------------------
// In prod each Cloud Run service runs the same image behind LB host routing
// (dashboard./admin./pay./api.xx.com). The LB routes by host only, so every
// service can technically serve every route — SERVICE_ROLE narrows each
// deployment to its own slice. Unset (dev single deployment) = no fencing.
type ServiceRole = "merchant" | "admin" | "checkout" | "api" | "web";

// LB health checks must succeed on every service
const alwaysAllowed = ["/api/health"];

// "allow": only these prefixes are served. "deny": everything except these —
// used for the marketing site, which serves every page that isn't a portal.
const roleRules: Record<ServiceRole, { mode: "allow" | "deny"; prefixes: string[] }> = {
  admin: {
    mode: "allow",
    prefixes: ["/admin", "/api/admin", "/api/auth", "/forgot-password", "/reset-password"],
  },
  merchant: {
    mode: "allow",
    prefixes: ["/merchant", "/login", "/get-started", "/api/merchant", "/api/auth", "/api/public", "/forgot-password", "/reset-password", "/verify-email"],
  },
  checkout: {
    mode: "allow",
    prefixes: ["/pay", "/lnk", "/api/payments", "/api/public"],
  },
  api: {
    mode: "allow",
    prefixes: ["/api/v1", "/api/payments", "/api/webhooks", "/api/public", "/api/cron"],
  },
  // Marketing site (trite.tech): pages only, no portal/checkout/API surface
  web: {
    mode: "deny",
    prefixes: ["/admin", "/api/admin", "/merchant", "/api/merchant", "/pay", "/lnk", "/api/v1", "/api/payments", "/api/webhooks", "/api/cron", "/api/auth"],
  },
};

function enforceServiceRole(pathname: string, request: NextRequest): NextResponse | null {
  const role = process.env.SERVICE_ROLE;
  if (!role) return null;

  const rules = roleRules[role as ServiceRole];
  if (!rules) {
    // Misconfigured role: fail open — fencing is defense in depth on top of
    // LB host routing, and a typo shouldn't take the whole service down.
    console.warn(`SERVICE_ROLE="${role}" is not a known role; fencing disabled`);
    return null;
  }

  if (role === "admin" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // The dashboard domain opens on the merchant portal, not the marketing page
  if (role === "merchant" && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Marketing can't authenticate anyone (/api/auth is fenced) — send sign-in,
  // sign-up, and password/verification traffic to the dashboard (or admin,
  // for ?admin=true links) domain instead of serving dead forms. The query
  // string carries the reset/verification token, so it must survive the hop.
  const webAuthPages = ["/login", "/get-started", "/forgot-password", "/reset-password", "/verify-email"];
  if (role === "web" && webAuthPages.includes(pathname)) {
    const isAdminLink = request.nextUrl.searchParams.get("admin") === "true";
    const target = isAdminLink ? process.env.ADMIN_BASE_URL : process.env.DASHBOARD_BASE_URL;
    if (target) {
      return NextResponse.redirect(new URL(pathname + request.nextUrl.search, target));
    }
  }

  if (alwaysAllowed.some((p) => matchesPrefix(pathname, p))) return null;

  const matched = rules.prefixes.some((p) => matchesPrefix(pathname, p));
  const allowed = rules.mode === "allow" ? matched : !matched;

  return allowed ? null : new NextResponse(null, { status: 404 });
}

// Matches the prefix itself or any path nested under it, but not
// unrelated siblings (e.g. "/admin" matches "/admin/users", not "/administer")
function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Per-deployment route fencing runs before any session logic
  const fenced = enforceServiceRole(pathname, request);
  if (fenced) return fenced;

  // API routes authenticate in their handlers (lib/guards) — the session
  // redirect logic below is only for pages
  if (matchesPrefix(pathname, "/api")) {
    return NextResponse.next();
  }

  // Read session from cookie (optimistic — no DB call)
  const sessionCookie = request.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);

  const isPublicAuthRoute = publicAuthRoutes.some((r) =>
    matchesPrefix(pathname, r)
  );

  // --- Redirect authenticated users away from auth pages ---
  if (isPublicAuthRoute) {
    if (session?.userId) {
      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (session.role === "MERCHANT") {
        return NextResponse.redirect(new URL("/merchant", request.url));
      }
    }
    return NextResponse.next();
  }

  const isAdminRoute = matchesPrefix(pathname, "/admin");
  const isMerchantRoute = matchesPrefix(pathname, "/merchant");

  // --- Protect admin routes ---
  if (isAdminRoute) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (session.role !== "ADMIN") {
      // Wrong role — send merchants back to their portal
      return NextResponse.redirect(new URL("/merchant", request.url));
    }
  }

  // --- Protect merchant routes ---
  if (isMerchantRoute) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "MERCHANT") {
      // Wrong role — send admins back to their portal
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except static files and images. API routes are
    // included so SERVICE_ROLE fencing covers them; dotted paths (assets
    // like .png/.svg/.ico) are excluded for every deployment role.
    "/((?!_next/static|_next/image|.*\\..*).*)",
  ],
};
