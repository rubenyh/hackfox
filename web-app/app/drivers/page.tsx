"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { auth, db, functions } from "@/lib/firebase/firebase";
import { Bus, DriverProfile } from "@/lib/types";
import { httpsCallable } from "firebase/functions";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function DriversPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [assignedBusId, setAssignedBusId] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const createDriverAccount = httpsCallable<
    {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      license?: string;
      assignedBusId?: string | null;
    },
    unknown
  >(functions, "createDriverAccount");

  useEffect(() => {
    const driversRef = query(collection(db, "drivers"), orderBy("fullName"));
    const unsubDrivers = onSnapshot(driversRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<DriverProfile, "id">),
      }));
      setDrivers(next);
    });

    const busesRef = query(collection(db, "buses"), orderBy("plate"));
    const unsubBuses = onSnapshot(busesRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Bus, "id">),
      }));
      setBuses(next);
    });

    return () => {
      unsubDrivers();
      unsubBuses();
    };
  }, []);

  const busLookup = useMemo(() => {
    return buses.reduce<Record<string, Bus>>((acc, bus) => {
      acc[bus.id] = bus;
      return acc;
    }, {});
  }, [buses]);

  const handleCreateDriver = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName || !email || !password) return;
    setIsSaving(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Debes iniciar sesion para crear conductores.");
      }

      const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims?.role !== "admin") {
        throw new Error("Tu cuenta no tiene permiso de administrador.");
      }

      await user.getIdToken(true);

      await createDriverAccount({
        fullName,
        email,
        password,
        phone,
        license,
        assignedBusId: assignedBusId || null,
      });

      setFullName("");
      setEmail("");
      setPhone("");
      setLicense("");
      setAssignedBusId("");
      setPassword("");
      setFormSuccess("Conductor creado y credenciales asignadas.");
    } catch (error: any) {
  console.log("Full error:", JSON.stringify(error, null, 2));
  console.log("Code:", error?.code);
  console.log("Details:", error?.details);
      const message =
        typeof error?.message === "string"
          ? error.message
          : "No se pudo crear el conductor.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "fullName" as const, label: "Nombre" },
    { key: "email" as const, label: "Correo" },
    { key: "phone" as const, label: "Telefono" },
    { key: "license" as const, label: "Licencia" },
    {
      key: "assignedBusId" as const,
      label: "Bus asignado",
      render: (value: string | null) => {
        if (!value) return "Sin asignar";
        return busLookup[value]?.plate || value;
      },
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold gov-text-tertiary">Conductores</h2>
          <p className="gov-text-muted mt-1">Gestión de cuentas de conductores</p>
        </div>

        {isAdmin ? (
          <form onSubmit={handleCreateDriver} className="gov-card space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold gov-text-tertiary">Agregar conductor</h3>
              <p className="gov-text-muted text-sm">Se crea el usuario con correo y contraseña.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="driver-name">Nombre completo</label>
                <input
                  id="driver-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Juan Perez"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="driver-email">Correo</label>
                <input
                  id="driver-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="conductor@municipio.gob"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="driver-phone">Telefono</label>
                <input
                  id="driver-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="3001234567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="driver-license">Licencia</label>
                <input
                  id="driver-license"
                  value={license}
                  onChange={(event) => setLicense(event.target.value)}
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="LIC-12345"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="driver-bus">Bus asignado</label>
                <select
                  id="driver-bus"
                  value={assignedBusId}
                  onChange={(event) => setAssignedBusId(event.target.value)}
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">Sin asignar</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.plate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="driver-password">Contrasena</label>
                <input
                  id="driver-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="********"
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--primary)]">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-3 text-sm gov-text-tertiary">
                {formSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Guardando..." : "Agregar conductor"}
            </button>
          </form>
        ) : (
          <div className="gov-card px-6 py-4 text-sm gov-text-muted">
            Solo administradores pueden crear conductores.
          </div>
        )}

        <DataTable data={drivers} columns={columns} />
      </div>
    </ProtectedRoute>
  );
}
