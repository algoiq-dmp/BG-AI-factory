import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting for Edge (Warning: resets per isolate)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

function rateLimiter(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  
  if (ip === "unknown") return NextResponse.next();

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return NextResponse.next();
  }

  if (now > record.resetTime) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return NextResponse.next();
  }

  if (record.count >= MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({ error: "Too Many Requests. Please slow down." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  record.count += 1;
  return NextResponse.next();
}

export default withAuth(
  function middleware(req) {
    // 1. Apply Rate Limiting strictly to /api routes
    if (req.nextUrl.pathname.startsWith('/api')) {
      const rateLimitResponse = rateLimiter(req);
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse;
      }
    }
    
    // 2. NextAuth handles the route protection (returns 401/Redirect if unauthenticated)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Exclude public routes from auth
        const publicRoutes = ['/login', '/pricing', '/forgot-password', '/home'];
        if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
          return true; // Always allow
        }
        
        // Exclude public API routes (like auth endpoints)
        if (req.nextUrl.pathname.startsWith('/api/auth')) {
          return true; 
        }

        // Require token for everything else (which includes /api and /(app) routes)
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  // Apply middleware to everything except static files and _next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
