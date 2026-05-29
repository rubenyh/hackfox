import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

function formatRoutesList(routes: any[]) {
  return routes
    .map((r) => `- ${r.name} — Ocupación: ${r.averageOccupancy}% — Viajes diarios: ${r.dailyTrips}`)
    .join("\n");
}

async function loadCollections() {
  const [routesSnap, busesSnap, driversSnap, potholesSnap, occupancySnap] = await Promise.all([
    getDocs(collection(db, "routes")),
    getDocs(collection(db, "buses")),
    getDocs(collection(db, "drivers")),
    getDocs(collection(db, "potholes")),
    getDocs(collection(db, "occupancyMetrics")),
  ]);

  const routes = routesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any[];
  const buses = busesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any[];
  const drivers = driversSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any[];
  const potholes = potholesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any[];
  const occupancy = occupancySnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any[];

  return { routes, buses, drivers, potholes, occupancy };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const q = (body.question || "").toString().toLowerCase();

    if (!q) return NextResponse.json({ answer: "No se proporcionó una pregunta." });

    const { routes, buses, drivers, potholes, occupancy } = await loadCollections();

    // how many routes
    if (q.includes("how many routes") || q.includes("number of routes") || q.includes("cuántas rutas") || q.includes("cuantas rutas") || q.includes("how many routes exist") || q.includes("cuántas rutas hay")) {
      return NextResponse.json({ answer: `Hay ${routes.length} rutas registradas.` });
    }

    // highest occupancy
    if (q.includes("highest occupancy") || q.includes("most crowded") || q.includes("most crowded route") || q.includes("mayor ocupaci") || q.includes("ruta más concurrida") || q.includes("ruta con mayor ocupaci") || q.includes("ruta con mayor ocupación")) {
      const best = routes.reduce((a: any, b: any) => (a.averageOccupancy >= b.averageOccupancy ? a : b));
      return NextResponse.json({ answer: `Ruta con mayor ocupación: ${best.name} — ${best.averageOccupancy}% de ocupación — ${best.dailyTrips || "N/A"} viajes diarios.` });
    }

    // most potholes
    if (q.includes("most potholes") || q.includes("most reported potholes") || q.includes("route with the most reported potholes") || q.includes("más baches") || q.includes("ruta con más baches") || q.includes("mayor cantidad de baches")) {
      const best = routes.reduce((a: any, b: any) => (a.potholeCount >= b.potholeCount ? a : b));
      return NextResponse.json({ answer: `Ruta con más baches: ${best.name} — ${best.potholeCount || 0} baches reportados.` });
    }

    // critical pothole routes
    if (q.includes("critical pothole") || q.includes("critical pothole routes") || q.includes("high severity potholes") || q.includes("critical") || q.includes("baches críticos") || q.includes("baches de alta severidad") || q.includes("crítico")) {
      const critical = potholes.filter((p: any) => p.severity === "high");
      if (critical.length === 0) return NextResponse.json({ answer: "No se encontraron rutas con baches críticos en los datos actuales." });
      return NextResponse.json({ answer: `Rutas con baches críticos:\n${critical.map((c: any) => `- ${c.routeName} — ${c.potholesCount} baches`).join("\n")}` });
    }

    // routes above X% occupancy
    const aboveMatch = q.match(/above (\d{1,3})%/) || q.match(/por encima del (\d{1,3})%/);
    if (aboveMatch) {
      const pct = Number(aboveMatch[1]);
      const matches = routes.filter((r: any) => r.averageOccupancy >= pct);
      if (matches.length === 0) return NextResponse.json({ answer: `No se encontraron rutas con ocupación por encima de ${pct}%.` });
      return NextResponse.json({ answer: `Rutas con ocupación >= ${pct}%:\n${formatRoutesList(matches)}` });
    }

    // occupancy trends for route by name
    if (q.includes("occupancy trends") || q.includes("occupancy trend") || q.includes("show occupancy trends") || q.includes("tendencias de ocupaci") || q.includes("tendencias de ocupación") || q.includes("tendencia de ocupación")) {
      // try to find route name in query
      const route = routes.find((r: any) => q.includes(r.name.toLowerCase()) || q.includes((r.id || "").toLowerCase()));
      if (!route) return NextResponse.json({ answer: "Por favor especifica el nombre de la ruta para mostrar tendencias, por ejemplo: 'Muestra tendencias de ocupación para Ruta Centro - Norte'." });
      const trends = occupancy.filter((m: any) => m.routeId === route.id);
      if (trends.length === 0) return NextResponse.json({ answer: `No se encontraron métricas de ocupación para ${route.name}.` });
      const rows = trends.map((t: any) => `Hora ${t.hour}: ${t.averagePeople}/${t.capacity} (${Math.round((t.averagePeople / t.capacity) * 100)}%)`).join("\n");
      return NextResponse.json({ answer: `Tendencias de ocupación para ${route.name}:\n${rows}` });
    }

    // fleet / buses questions
    if (q.includes("cuántos autobuses") || q.includes("cuantos autobuses") || q.includes("how many buses") || q.includes("buses registered") || q.includes("autobuses registrados")) {
      return NextResponse.json({ answer: `Hay ${buses.length} autobuses registrados.` });
    }

    if (q.includes("conductores") || q.includes("drivers") || q.includes("no están asignados") || q.includes("sin asignación") || q.includes("no asignados")) {
      const unassigned = drivers.filter((d: any) => !d.assignedBusId);
      if (unassigned.length === 0) return NextResponse.json({ answer: "Todos los conductores están asignados a un autobús." });
      return NextResponse.json({ answer: `Conductores sin asignación:\n${unassigned.map((u: any) => `- ${u.fullName} (${u.email || "sin email"})`).join("\n")}` });
    }

    // default: provide brief context summary
    return NextResponse.json({
      answer: `Puedo responder preguntas sobre rutas, baches, flota y ocupación usando los datos reales del panel. Ejemplos: '¿Qué ruta tiene la mayor ocupación?', 'Muestra rutas con baches críticos', 'Muestra tendencias de ocupación para Ruta Centro - Norte'.`,
    });
  } catch (err) {
    return NextResponse.json({ answer: "Error procesando la petición al servidor." }, { status: 500 });
  }
}

export const GET = () => NextResponse.json({ status: "ok" });
