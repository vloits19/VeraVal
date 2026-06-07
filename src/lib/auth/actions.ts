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
      console.error("Profile insertion error:", profileError);
      // If profile creation fails, check if it's a duplicate username
      if (profileError.message.includes("duplicate") || profileError.code === "23505") {
        return {
          success: false,
          error: null,
          fieldErrors: { username: "This username is already taken." },
        };
      }
      return {
        success: false,
        error: "Account created but profile setup failed. Please contact support.",
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
        return {
          success: false,
          error: "Database error during login. Please try again.",
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
      if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password.";
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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url); // this throws an error caught by Next.js, must be outside try/catch
  }
  
  if (error) {
    throw new Error(error.message);
  }
}
