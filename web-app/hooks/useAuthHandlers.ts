"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useAuthHandlers() {
  const { signInWithEmail, signOut } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleEmailSignIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      try {
        await signInWithEmail(email, password);
        return true;
      } catch {
        setAuthError("Sign in failed. Please check your credentials.");
        return false;
      }
    },
    [signInWithEmail]
  );

  const handleSignOut = useCallback(async () => {
    setAuthError(null);
    try {
      await signOut();
      return true;
    } catch {
      setAuthError("Sign out failed. Please try again.");
      return false;
    }
  }, [signOut]);

  return {
    authError,
    handleEmailSignIn,
    handleSignOut,
  };
}
