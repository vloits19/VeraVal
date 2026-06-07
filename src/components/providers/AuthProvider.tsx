"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { logoutUser } from "@/lib/auth/actions";
import type { User } from "@/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

interface AuthContextValue {
  /** Supabase auth user (null if not logged in) */
  authUser: SupabaseAuthUser | null;
  /** User profile from public.users table */
  profile: User | null;
  /** True while initial session is being loaded */
  loading: boolean;
  /** Sign out and clear state */
  signOut: () => Promise<void>;
  /** Force refresh the profile from the database */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  /** Fetch the user profile from the public.users table */
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as User);
      } else {
        setProfile(null);
      }
    },
    [supabase]
  );

  /** Refresh the current user's profile */
  const refreshProfile = useCallback(async () => {
    if (authUser) {
      await fetchProfile(authUser.id);
    }
  }, [authUser, fetchProfile]);

  /** Sign out */
  const signOut = useCallback(async () => {
    await logoutUser();
    setAuthUser(null);
    setProfile(null);
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setAuthUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn("Failed to get initial session:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          if (event === "SIGNED_IN") {
            await fetchProfile(session.user.id);
          }
        } else {
          setAuthUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    } catch (err) {
      console.warn("Failed to subscribe to auth state changes:", err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase, fetchProfile]);

  const value = useMemo(
    () => ({ authUser, profile, loading, signOut, refreshProfile }),
    [authUser, profile, loading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      authUser: null,
      profile: null,
      loading: true,
      signOut: async () => {},
      refreshProfile: async () => {},
    };
  }
  return context;
}
