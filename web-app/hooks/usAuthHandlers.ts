'use client'

import { useCallback, useState } from 'react'

type AuthContextType = {
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuthHandlers(auth: AuthContextType) {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  } = auth

  const [authError, setAuthError] = useState<string | null>(null)

  const handleEmailSignIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null)
      try {
        await signInWithEmail(email, password)
      } catch {
        setAuthError('Sign in failed. Please check your credentials.')
      }
    },
    [signInWithEmail]
  )

  const handleEmailSignUp = useCallback(
    async (email: string, password: string) => {
      setAuthError(null)
      try {
        await signUpWithEmail(email, password)
      } catch {
        setAuthError('Sign up failed. Please try again.')
      }
    },
    [signUpWithEmail]
  )

  const handleGoogleSignIn = useCallback(async () => {
    setAuthError(null)
    try {
      await signInWithGoogle()
    } catch {
      setAuthError('Google sign-in failed. Please try again.')
    }
  }, [signInWithGoogle])

  const handleSignOut = useCallback(async () => {
    setAuthError(null)
    try {
      await signOut()
    } catch {
      setAuthError('Sign out failed. Please try again.')
    }
  }, [signOut])

  return {
    authError,
    setAuthError,
    handleEmailSignIn,
    handleEmailSignUp,
    handleGoogleSignIn,
    handleSignOut,
  }
}
