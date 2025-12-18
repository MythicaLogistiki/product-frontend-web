import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Path-based Multi-Tenant Middleware for Numbersence
 *
 * URL Patterns:
 * 1. Organization Mode: numbersence.com/{org_slug}/dashboard
 *    - Extracts org_slug, sets X-Tenant-Slug header
 *    - Rewrites to /app/[slug]/...
 *
 * 2. Individual Mode: numbersence.com/dashboard
 *    - No slug in path = personal tenant
 *    - Rewrites to /app/personal/...
 *
 * Excluded from rewriting:
 * - /api/* (API routes)
 * - /_next/* (Next.js internals)
 * - /static/* (static files)
 * - /*.* (files with extensions)
 * - /login, /signup, /forgot-password (auth pages)
 */

// Reserved paths that should NOT be treated as org slugs
const RESERVED_PATHS = new Set([
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "verify-email",
  "admin",
  "support",
  "api",
  "_next",
  "static",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

// Public pages that don't require tenant context
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/pricing",
  "/about",
  "/contact",
]);

// Regex to detect file extensions
const FILE_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;

// Valid org slug pattern (lowercase letters, numbers, hyphens, 3-63 chars)
const ORG_SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip Next.js internals
  if (pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Skip static files (files with extensions)
  if (FILE_EXTENSION_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // Skip public paths
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Parse the path segments
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return NextResponse.next();
  }

  const firstSegment = segments[0];

  // Check if first segment is a reserved path
  if (RESERVED_PATHS.has(firstSegment)) {
    return NextResponse.next();
  }

  // Check if first segment looks like an org slug
  const isOrgSlug = ORG_SLUG_REGEX.test(firstSegment);

  if (isOrgSlug) {
    // Organization Mode: /{org_slug}/...
    const orgSlug = firstSegment;
    const remainingPath = segments.slice(1).join("/") || "dashboard";

    // Create the rewritten URL
    const url = request.nextUrl.clone();
    url.pathname = `/app/${orgSlug}/${remainingPath}`;

    // Create response with rewrite
    const response = NextResponse.rewrite(url);

    // Set tenant slug header for server components and API calls
    response.headers.set("X-Tenant-Slug", orgSlug);

    // Also set as a cookie for client-side access
    response.cookies.set("tenant-slug", orgSlug, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  }

  // Individual Mode: /dashboard, /settings, etc. (no org slug)
  // These are personal tenant routes
  const personalPaths = [
    "dashboard",
    "settings",
    "transactions",
    "accounts",
    "reports",
    "profile",
  ];

  if (personalPaths.includes(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/app/personal/${pathname.slice(1)}`;

    const response = NextResponse.rewrite(url);

    // Set personal tenant indicator
    response.headers.set("X-Tenant-Slug", "personal");
    response.cookies.set("tenant-slug", "personal", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
