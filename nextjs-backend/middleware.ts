import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection
 * Add protected routes to the matcher config below
 */
export function middleware(request: NextRequest) {
    // For now, middleware is set up but not actively protecting routes
    // You can add session validation here when needed
    return NextResponse.next();
}

// Configure which routes should use this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth endpoints)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
