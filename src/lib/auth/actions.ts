"use server";

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
}

/**
 * Log in an existing user with email/password.
 */
export async function loginUser(formData: {
  email: string;
  password: string;
}): Promise<AuthFormState> {
  // 1. Validate
  const { valid, errors } = validateLoginForm(formData);
  if (!valid) {
    return { success: false, error: null, fieldErrors: errors };
  }

  const supabase = await createClient();

  // 2. Sign in
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
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
}

/**
 * Sign out the current user.
 */
export async function logoutUser(): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
