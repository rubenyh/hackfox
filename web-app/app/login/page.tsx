"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthHandlers } from "@/hooks/useAuthHandlers";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { authError, handleEmailSignIn } = useAuthHandlers();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await handleEmailSignIn(email, password);
    setIsSubmitting(false);
    if (success) {
      router.replace("/");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] gov-text-accent">Acceso interno</p>
        <h1 className="mt-2 text-3xl font-semibold gov-text-tertiary">Panel Administrativo</h1>
        <p className="gov-text-muted mt-2 text-sm">
          Ingresa con tu correo institucional y credenciales asignadas.
        </p>
      </div>

      <form onSubmit={onSubmit} className="gov-card space-y-5 p-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium gov-text-tertiary">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="admin@municipio.gob"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium gov-text-tertiary">
            Contrasena
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="********"
          />
        </div>

        {authError && (
          <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--primary)]">
            {authError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Validando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
