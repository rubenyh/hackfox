"use client";

import React, { useState, useRef } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

type Message = { id: string; from: "user" | "ai"; text: string };

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    // reuse client-side handler
    await sendText(text);
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: String(Date.now()), from: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      // Try to answer using client-side Firestore queries (user's auth used)
      const q = trimmed.toLowerCase();

      // Count routes
      if (q.includes("cuántas rutas") || q.includes("cuantas rutas") || q.includes("how many routes") || q.includes("cuántas rutas hay")) {
        const snap = await getDocs(collection(db, "routes"));
        const ans = `Hay ${snap.size} rutas registradas.`;
        setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: ans }]);
        return;
      }

      // Route with highest occupancy
      if (q.includes("mayor ocupaci") || q.includes("ruta más concurrida") || q.includes("ruta con mayor ocupaci") || q.includes("highest occupancy") || q.includes("most crowded")) {
        const snap = await getDocs(collection(db, "routes"));
        let best: any = null;
        snap.forEach((d) => {
          const data = d.data() as any;
          if (!best || (data.averageOccupancy ?? 0) > (best.averageOccupancy ?? 0)) best = { id: d.id, ...data };
        });
        const ans = best ? `Ruta con mayor ocupación: ${best.name} — ${best.averageOccupancy}% de ocupación — ${best.dailyTrips || "N/A"} viajes diarios.` : "No hay datos de rutas disponibles.";
        setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: ans }]);
        return;
      }

        // Optimization: which routes need more buses
        if (q.includes("necesitan más autobuses") || q.includes("necesitan más buses") || q.includes("necesitan más buses")) {
          const routesSnap = await getDocs(collection(db, "routes"));
          const busesSnap = await getDocs(collection(db, "buses"));
          const suggestions: string[] = [];
          routesSnap.forEach((d) => {
            const data = d.data() as any;
            const assigned = busesSnap.docs.filter((b) => (b.data() as any).routeId === d.id).length;
            const occupancy = data.averageOccupancy ?? 0;
            let recommend = 0;
            if (occupancy >= 90) recommend = 2;
            else if (occupancy >= 80) recommend = 1;
            if (recommend > 0) suggestions.push(`${data.name} — ${occupancy}% de ocupación — ${assigned} autobuses asignados — recomendar: +${recommend}`);
          });
          const ans = suggestions.length === 0 ? "No se detectaron rutas que necesiten autobuses adicionales según las métricas actuales." : `Rutas que podrían necesitar más autobuses:\n${suggestions.map((s) => `- ${s}`).join("\n")}`;
          setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: ans }]);
          return;
        }

        // Describe dashboard pages
        if (q.includes("para qué sirve") || q.includes("para qué es") || q.includes("para que sirve") || q.includes("qué hace cada página") || q.includes("qué hace cada pagina") || q.includes("para que es cada pagina")) {
          const desc = `Descripción de las páginas principales del panel:\n
  - Panel / Dashboard: Vista general con KPIs y resumen operativo (ocupación general, baches críticos, rutas con mayor demanda).\n
  - Rutas: Listado y detalle de rutas (km, viajes diarios, ocupación, baches). Permite filtrar y revisar última actualización.\n
  - Autobuses (Buses): Gestión de la flota — placas, capacidad, ruta asignada.\n
  - Conductores (Drivers): Perfiles de conductores, asignaciones y estado.\n
  - Ocupación: Métricas horarias de demanda por ruta y horas punta. Visualizaciones de tendencias.\n
  - Baches (Potholes): Reportes geolocalizados por ruta con severidad y fecha, útil para priorizar mantenimiento.\n
  - Analytics: Vistas y herramientas analíticas para identificar anomalías y optimizaciones (forecasting/capacity planning).\n
  Si quieres, puedo profundizar en cualquiera de estas páginas.`;
          setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: desc }]);
          return;
        }

      // Routes above X% occupancy
      const aboveMatch = q.match(/(\d{1,3})%/);
      if (aboveMatch && (q.includes("por encima") || q.includes("por encima del") || q.includes("above") || q.includes("mayor que") || q.includes(">"))) {
        const pct = Number(aboveMatch[1]);
        const snap = await getDocs(collection(db, "routes"));
        const matches: any[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          if ((data.averageOccupancy ?? 0) >= pct) matches.push({ id: d.id, ...data });
        });
        const ans = matches.length === 0 ? `No se encontraron rutas con ocupación por encima de ${pct}%.` : `Rutas con ocupación >= ${pct}%:\n${matches.map((r) => `- ${r.name} — Ocupación: ${r.averageOccupancy}% — Viajes diarios: ${r.dailyTrips || "N/A"}`).join("\n")}`;
        setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: ans }]);
        return;
      }

      // Critical potholes
      if (q.includes("baches críticos") || q.includes("baches de alta severidad") || q.includes("crítico") || q.includes("critical")) {
        const snap = await getDocs(collection(db, "potholes"));
        const critical: any[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          if (data.severity === "high") critical.push({ id: d.id, ...data });
        });
        const ans = critical.length === 0 ? "No se encontraron rutas con baches críticos en los datos actuales." : `Rutas con baches críticos:\n${critical.map((c) => `- ${c.routeName} — ${c.potholesCount} baches`).join("\n")}`;
        setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: ans }]);
        return;
      }

      // Occupancy trends for route
      if (q.includes("tendencias de ocupaci") || q.includes("tendencias de ocupación") || q.includes("tendencia de ocupación") || q.includes("occupancy trends")) {
        // try find route name in question
        const routesSnap = await getDocs(collection(db, "routes"));
        let foundRoute: any = null;
        routesSnap.forEach((d) => {
          const data = d.data() as any;
          if (q.includes((data.name || "").toLowerCase()) || q.includes(d.id.toLowerCase())) foundRoute = { id: d.id, ...data };
        });
        if (!foundRoute) {
          setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: "Por favor especifica el nombre de la ruta para mostrar tendencias, por ejemplo: 'Muestra tendencias de ocupación para Ruta Centro - Norte'." }]);
          return;
        }
        const occSnap = await getDocs(query(collection(db, "occupancyMetrics"), where("routeId", "==", foundRoute.id), orderBy("hour")));
        const rows: string[] = [];
        occSnap.forEach((d) => {
          const t = d.data() as any;
          rows.push(`Hora ${t.hour}: ${t.averagePeople}/${t.capacity} (${Math.round((t.averagePeople / t.capacity) * 100)}%)`);
        });
        const ans = rows.length === 0 ? `No se encontraron métricas de ocupación para ${foundRoute.name}.` : `Tendencias de ocupación para ${foundRoute.name}:\n${rows.join("\n")}`;
        setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: ans }]);
        return;
      }

      // Buses count
      if (q.includes("autobuses") || q.includes("buses registered") || q.includes("cuántos autobuses") || q.includes("cuantos autobuses")) {
        const snap = await getDocs(collection(db, "buses"));
        setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: `Hay ${snap.size} autobuses registrados.` }]);
        return;
      }

      // Unassigned drivers
      if (q.includes("conductores sin asignación") || q.includes("sin asignación") || q.includes("no están asignados") || q.includes("no asignados")) {
        const snap = await getDocs(collection(db, "drivers"));
        const unassigned: any[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          if (!data.assignedBusId) unassigned.push(data);
        });
        const ans = unassigned.length === 0 ? "Todos los conductores están asignados a un autobús." : `Conductores sin asignación:\n${unassigned.map((u) => `- ${u.fullName} (${u.email || "sin email"})`).join("\n")}`;
        setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: ans }]);
        return;
      }

      // Fallback: call server endpoint if nothing matched
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      const aiMsg: Message = { id: String(Date.now() + 1), from: "ai", text: data.answer || "No hay datos disponibles." };
      setMessages((m) => [...m, aiMsg]);
    } catch (e) {
      setMessages((m) => [...m, { id: String(Date.now()), from: "ai", text: "Error contactando al asistente." }]);
    } finally {
      setLoading(false);
      setInput("");
      setTimeout(() => areaRef.current?.scrollTo({ top: areaRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <div className="fixed right-6 bottom-6 z-50">
        <button
          aria-label="Abrir Transit Assistant"
          onClick={() => setOpen((s) => !s)}
          className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C7 3 3 6.58 3 11C3 13.39 4.12 15.51 6 16.92V21L10.21 18.54C11.06 18.85 11.99 19 13 19C18 19 22 15.42 22 11C22 6.58 18 3 13 3H12Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ width: 400, height: 600 }} className="fixed right-6 bottom-24 z-50 bg-white shadow-xl rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: "var(--surface)", alignItems: "center" }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "var(--success)" }} />
              <strong>Transit Assistant</strong>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">Cerrar</button>
            </div>
          </div>
          <div ref={areaRef} className="p-4 flex-1 overflow-auto" style={{ background: "var(--surface-muted)" }}>
            {messages.length === 0 && (
              <div className="text-sm text-gray-600">Pregúntame sobre rutas, ocupación, flota o baches.</div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`mb-3 ${m.from === "user" ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block px-3 py-2 rounded-lg shadow-sm max-w-[85%]`}
                  style={{
                    background: m.from === "user" ? "var(--primary)" : "#fff",
                    color: m.from === "user" ? "#fff" : "var(--foreground)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-md border px-2 py-2 text-sm resize-none"
                rows={2}
              />
              <button onClick={send} disabled={loading} className="px-4 py-2 rounded-md" style={{ background: "var(--accent)", color: "#fff" }}>
                {loading ? "..." : "Enviar"}
              </button>
            </div>
            <div className="mt-2 text-sm">
              <div className="overflow-x-auto" style={{ whiteSpace: "nowrap", paddingBottom: 6 }}>
                {[
                  "¿Qué ruta tiene la mayor ocupación?",
                  "Muestra rutas con ocupación por encima del 90%",
                  "Rutas con baches críticos",
                  "¿Cuántos autobuses están registrados?",
                  "¿Qué conductores no están asignados a un autobús?",
                  "¿Qué rutas necesitan más autobuses?",
                  "¿Para qué sirve cada página del panel?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendText(q)}
                    className="inline-block px-3 py-1 mr-2 rounded"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--tertiary)",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Assistant;
