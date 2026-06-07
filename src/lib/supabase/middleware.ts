import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/profile", "/settings"];
const AUTH_ROUTES = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  console.log(`[UPDATE_SESSION] Starting for: ${request.nextUrl.pathname}`);
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseKey || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  console.log(`[UPDATE_SESSION] supabase client created. Calling getUser()...`);
  // Refresh the auth session
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();
  console.log(`[UPDATE_SESSION] getUser returned user:`, user?.id, `error:`, getUserError);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Helper to persist cookies set during the session refresh
  const createRedirect = (path: string) => {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = path;
    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  if (user) {
    // Optimization: Avoid hitting the database on auth callback route
    if (!request.nextUrl.pathname.startsWith("/auth/callback")) {
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      const hasProfile = !!profile;

      // Force user to complete onboarding if profile doesn't exist
      if (!hasProfile && request.nextUrl.pathname !== "/onboarding") {
        return createRedirect("/onboarding");
      }

      // Prevent user from accessing onboarding if profile already exists
      if (hasProfile && request.nextUrl.pathname === "/onboarding") {
        return createRedirect("/");
      }
    }
  }

  if (isProtectedRoute && !user) {
    return createRedirect("/login");
  }

  if (isAuthRoute && user && request.nextUrl.pathname !== "/onboarding") {
    return createRedirect("/");
  }

  return supabaseResponse;
}
