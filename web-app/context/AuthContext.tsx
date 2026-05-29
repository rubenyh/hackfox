"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

type AuthContextValue = {
  user: User | null;
  role: string | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: () => void = () => {};

    const init = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        // Persistence failures should not block auth state resolution.
      }

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!isActive) return;
        setUser(firebaseUser);
        if (!firebaseUser) {
          setRole(null);
          setLoading(false);
          return;
        }

        firebaseUser
          .getIdTokenResult()
          .then((result) => {
            if (!isActive) return;
            setRole((result.claims.role as string | undefined) || null);
            setLoading(false);
          })
          .catch(() => {
            if (!isActive) return;
            setRole(null);
            setLoading(false);
          });
      });
    };

    init().catch(() => {
      if (isActive) {
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      signInWithEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
