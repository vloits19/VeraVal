import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In-memory rate limiting store (cleared on server restart or Edge eviction)
// Useful for basic single-instance DoS protection.
// Note: Edge isolates are short-lived, so memory leaks are not a significant issue here.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
  console.log(`[PROXY] Request: ${request.method} ${request.url}`);
  // 1. Rate Limiting for Mutations (POST requests)
  if (request.method === "POST") {
    // Get IP from headers (works on Vercel/proxies) or fallback to generic
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 30; // Max 30 POST requests per minute per IP

    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      record.count++;
      if (record.count > maxRequests) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
    }
  }

  // 2. Supabase Session Management
  console.log(`[PROXY] Calling updateSession...`);
  try {
    const res = await updateSession(request);
    console.log(`[PROXY] updateSession succeeded. Response status: ${res.status}`);
    return res;
  } catch (err) {
    console.error(`[PROXY] updateSession THREW AN ERROR:`, err);
    throw err;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
