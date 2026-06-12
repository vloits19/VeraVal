"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  validateLoginForm,
  validateRegisterForm,
} from "@/lib/auth/validation";
import type { AuthFormState } from "@/types";

/**
 * Register a new user with Supabase Auth + insert into public.users table.
 */
export async function registerUser(formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthFormState> {
  try {
    // 1. Validate
    const { valid, errors } = validateRegisterForm(formData);
    if (!valid) {
      return { success: false, error: null, fieldErrors: errors };
    }

    const supabase = await createClient();

    // 1.1 Validate Environment Variables Early
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[REGISTER_USER] Missing Supabase environment variables.");
      return { 
        success: false, 
        error: "Missing Supabase configuration. Please verify environment variables (NEXT_PUBLIC_SUPABASE_URL).", 
        fieldErrors: {} 
      };
    }

    // 2. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      // Map common Supabase errors to friendly messages
      let message = authError.message;
      if (authError.message.includes("already registered")) {
        message = "An account with this email already exists.";
      }
      return { success: false, error: message, fieldErrors: {} };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Registration failed. Please try again.",
        fieldErrors: {},
      };
    }

    // 3. Insert into public.users table
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      username: formData.username,
      email: formData.email,
      avatar: "",
      banner: "",
      bio: "",
      accent_color: "#7c3aed",
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      
      let errorMessage = "Account created, but profile setup failed. Please contact support.";
      if (profileError.message && profileError.message.toLowerCase().includes("fetch failed")) {
        errorMessage = "Account created, but database network connection failed during profile setup.";
      }

      return {
        success: false,
        error: errorMessage,
        fieldErrors: {},
      };
    }

    return { success: true, error: null, fieldErrors: {} };
  } catch (err: unknown) {
    console.error("Registration exception:", err);
    return {
      success: false,
      error: "Authentication service unavailable. Please check your connection and try again.",
      fieldErrors: {},
    };
  }
}

/**
 * Log in an existing user with email/username and password.
 */
export async function loginUser(formData: {
  identifier: string;
  password: string;
}): Promise<AuthFormState> {
  try {
    // 1. Validate
    const { valid, errors } = validateLoginForm(formData);
    if (!valid) {
      return { success: false, error: null, fieldErrors: errors };
    }

    const supabase = await createClient();

    // 1.1 Validate Environment Variables Early
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[LOGIN_USER] Missing Supabase environment variables.");
      return { 
        success: false, 
        error: "Missing Supabase configuration. Please verify environment variables (NEXT_PUBLIC_SUPABASE_URL).", 
        fieldErrors: {} 
      };
    }

    let email = formData.identifier.trim();

    // 2. Resolve username to email if it's not an email
    if (!email.includes("@")) {
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("email")
        .eq("username", email)
        .maybeSingle();

      if (dbError) {
        console.error("Database error looking up username:", dbError);
        
        let errorMessage = "Database error during login. Please try again.";
        if (dbError.message && dbError.message.toLowerCase().includes("fetch failed")) {
          errorMessage = "Network connection to database failed. Please check your Supabase URL.";
        }

        return {
          success: false,
          error: errorMessage,
          fieldErrors: {},
        };
      }

      if (!userData) {
        return {
          success: false,
          error: "User not found.",
          fieldErrors: {},
        };
      }

      email = userData.email;
    }

    // 3. Sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: formData.password,
    });

    if (error) {
      let message = error.message;
      if (message.toLowerCase().includes("fetch failed")) {
        message = "Authentication endpoint unavailable. Network connection failed. Please check your Supabase URL.";
      } else if (message === "Invalid login credentials") {
        message = "Email/Username or password is incorrect.";
      }
      return { success: false, error: message, fieldErrors: {} };
    }

    return { success: true, error: null, fieldErrors: {} };
  } catch (err: unknown) {
    console.error("Login exception:", err);
    return {
      success: false,
      error: "Authentication service unavailable. Please check your connection and try again.",
      fieldErrors: {},
    };
  }
}

/**
 * Sign out the current user.
 */
export async function logoutUser(): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    console.error("Logout exception:", err);
    return {
      success: false,
      error: "Network error or authentication service unavailable.",
    };
  }
}

/**
 * Sign in with Google OAuth.
 */
export async function signInWithGoogle() {
  const supabase = await createClient();
  
  // Dynamically determine the origin to support Vercel preview deployments
  // and production without strictly relying on NEXT_PUBLIC_SITE_URL.
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || origin}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url); // this throws an error caught by Next.js, must be outside try/catch
  }
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Complete the onboarding profile for OAuth users.
 */
export async function completeOnboarding(formData: {
  username: string;
  email: string;
  avatar: string;
}): Promise<AuthFormState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated", fieldErrors: {} };
    }

    // Basic validation
    const username = formData.username.trim();
    if (!username || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return { success: false, error: null, fieldErrors: { username: "Invalid username format." } };
    }

    const { error: profileError } = await supabase.from("users").insert({
      id: user.id,
      username: username,
      email: formData.email || user.email,
      avatar: formData.avatar || "",
      banner: "",
      bio: "",
      accent_color: "#7c3aed",
    });

    if (profileError) {
      console.error("[ONBOARDING] Profile creation error:", profileError);
      let errorMessage = "Failed to create profile. Please try again.";
      if (profileError.message?.includes("unique constraint")) {
        errorMessage = "Username is already taken.";
        return { success: false, error: null, fieldErrors: { username: errorMessage } };
      }
      return { success: false, error: errorMessage, fieldErrors: {} };
    }

    return { success: true, error: null, fieldErrors: {} };
  } catch (err: unknown) {
    console.error("[ONBOARDING] exception:", err);
    return { success: false, error: "An unexpected error occurred.", fieldErrors: {} };
  }
}
