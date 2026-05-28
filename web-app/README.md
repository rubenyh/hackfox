# Dashboard de Transporte Público - Hackathon

Dashboard gubernamental para monitoreo de transporte público, desarrollado con Next.js y datos de sensores en camiones.

## Características

- **Dashboard General**: KPIs principales (total de baches, ocupación promedio, viajes diarios, rutas activas)
- **Estadísticas de Rutas**: Tabla completa de rutas con sorting y filtrado
- **Análisis de Baches**: Monitoreo de daños viales por ruta y severidad
- **Análisis de Ocupación**: Gráficos de densidad de viajeros por hora

## Tecnologías

- **Next.js 16.2** - React framework
- **TailwindCSS 4** - Styling
- **Recharts** - Gráficos de datos
- **Lucide React** - Iconos
- **TypeScript** - Type safety

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el dashboard.

## Estructura del Proyecto

```
app/
  ├── page.tsx           # Dashboard principal
  ├── routes/page.tsx    # Estadísticas de rutas
  ├── potholes/page.tsx  # Análisis de baches
  ├── occupancy/page.tsx # Análisis de ocupación
  └── layout.tsx         # Layout global

components/
  ├── Navbar.tsx         # Navegación
  ├── KPICard.tsx        # Tarjetas de KPI
  └── DataTable.tsx      # Tabla genérica

lib/
  ├── types.ts           # Tipos TypeScript
  └── mockData.ts        # Datos de prueba
```

## Próximos pasos

- Integración con Firebase para datos reales
- Mapas interactivos de rutas
- Sistema de alertas en tiempo real
- Exportación de reportes
