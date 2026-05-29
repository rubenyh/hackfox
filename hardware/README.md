# Hardware Overview - Hackfox IoT Strategy

**Por qué necesitamos hardware dedicado para el éxito de Hackfox**

---

## Índice Ejecutivo

### El Desafío

La inteligencia en transporte público requiere **datos en tiempo real**. Sin hardware dedicado en cada bus, Hackfox no puede:
- Rastrear ubicaciones precisas de vehículos
- Medir ocupancia (densidad de pasajeros)
- Detectar problemas de conducción
- Validar calidad de servicio

### La Solución

Un sistema IoT minimalista, confiable y económico montado en cada bus que recopila datos 24/7 y los envía a Firebase automáticamente.

### Números Clave

| Métrica | Valor |
|---------|-------|
| **Costo por Unidad** | $800 MXN (~$47 USD) |
| **Costo Operativo Mensual** | $1 USD (conectividad eSIM) |
| **ROI Esperado** | 8-12 meses |
| **Cobertura Inicial** | 10-50 buses |
| **Datos por Bus/día** | ~14,400 puntos GPS + sensores |

---

## 1. ¿Por Qué Hardware? (Justificación Estratégica)

### Limitaciones sin Hardware

```
SIN Hardware IoT
│
├─→ Solo ubicación del usuario final (imprecisa)
├─→ No hay datos de ocupancia real
├─→ No hay telemetría de conducción
├─→ Sin alertas de problemas mecánicos
└─→ Gestión reactiva, no predictiva

CON Hardware IoT
│
├─→ Posición del bus cada 5-10 segundos
├─→ Ocupancia en tiempo real
├─→ Aceleración/frenado (seguridad)
├─→ Detección temprana de fallas
└─→ Optimización predictiva
```

### ¿Qué Problema Resuelve?

| Problema | Solución | Beneficio |
|----------|----------|-----------|
| **Falta de ubicación precisa** | GPS en tiempo real cada 5-10s | ETAs precisas para ciudadanos |
| **No hay datos de demanda** | Sensores ultrasónicos de ocupancia | Optimización de rutas/frecuencias |
| **Incidentes sin contexto** | IMU detecta aceleración anormal | Investigación de accidentes |
| **Potholes no reportados** | Vibración detecta infraestructura dañada | Reportes proactivos vs. reactivos |
| **Sin alertas de mantenimiento** | Monitoreo de aceleración/GPS | Mantenimiento preventivo |

---

## 2. Análisis Comparativo: Alternativas

Hemos evaluado tres enfoques. Aquí está por qué elegimos hardware IoT dedicado:

### Opción 1: GPS Solo (Alternativa Pasiva)

```
┌────────────────────────────────┐
│ GPS Tracker Genérico           │
│ (Módulo GPS + SIM)             │
├────────────────────────────────┤
│ ✓ Bajo costo: $400-500 MXN     │
│ ✓ Fácil instalación            │
│ ✗ Solo ubicación               │
│ ✗ No hay datos de ocupancia    │
│ ✗ No hay telemetría conductual │
│ ✗ Poco valor agregado          │
└────────────────────────────────┘
```

**Veredicto:** Insuficiente para Hackfox. Sin ocupancia + telemetría, no hay optimización posible.

---

### Opción 2: Cloud-Only (Datos del Usuario)

```
┌────────────────────────────────┐
│ Mobile App GPS + Reportes      │
│ (Sin hardware adicional)        │
├────────────────────────────────┤
│ ✓ Sin costo hardware           │
│ ✓ Flexible                     │
│ ✗ Depende de usuarios activos  │
│ ✗ Datos incompletos/sesgados   │
│ ✗ No hay datos ocupancia       │
│ ✗ No hay telemetría vehículo   │
│ ✗ Cobertura impredecible       │
└────────────────────────────────┘
```

**Veredicto:** Funciona para ciudadanos, pero no para gestión de flota. El gobierno necesita datos independientes del usuario.

---

### Opción 3: Hardware IoT Dedicado (Nuestra Solución) ✓

```
┌────────────────────────────────────┐
│ ESP32 + GPS + IMU + Ultrasonidos   │
│ + eSIM (Nuestro Stack)             │
├────────────────────────────────────┤
│ ✓ Bajo costo: $800 MXN            │
│ ✓ Datos 24/7 (independiente)       │
│ ✓ Ubicación precisa (5-10s)        │
│ ✓ Ocupancia en tiempo real         │
│ ✓ Telemetría conducción            │
│ ✓ Alertas automáticas              │
│ ✓ Mantenimiento predictivo         │
│ ✓ Escalable: +100 buses            │
└────────────────────────────────────┘
```

**Veredicto:** Único enfoque que habilita todas las funciones de Hackfox.

---

### Matriz de Comparación

| Característica | GPS Solo | Cloud-Only | Hardware IoT |
|---|---|---|---|
| Ubicación en tiempo real | ✓ | ◐ | ✓ |
| Ocupancia | ✗ | ✗ | ✓ |
| Telemetría conducción | ✗ | ✗ | ✓ |
| Disponibilidad 24/7 | ✓ | ◐ | ✓ |
| Costo inicial (50 buses) | $24,000 | $0 | $40,000 |
| Costo mensual (50 buses) | $3,000 | $0 | $3,000 |
| Valor de datos | ★★ | ★ | ★★★★★ |
| Viabilidad de rutas inteligentes | No | No | Sí |

---

## 3. Stack de Hardware: Arquitectura

### Diagrama de Sistema

```
┌─────────────────────────────────────────┐
│          Bus Vehicle                     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     ESP32-WROOM-32              │   │
│  │  (Microcontrolador Principal)   │   │
│  └────────────┬────────────────────┘   │
│               │                         │
│     ┌─────────┼─────────┐              │
│     │         │         │              │
│     ▼         ▼         ▼              │
│  ┌─────┐  ┌─────┐  ┌──────┐           │
│  │ GPS │  │ IMU │  │Ultrasonics       │
│  │ Neo │  │MPU  │  │(Ocupancia)       │
│  │M8N  │  │6050 │  │                  │
│  └─────┘  └─────┘  └──────┘           │
│     │         │         │              │
│     └─────────┼─────────┘              │
│               │                        │
│     ┌─────────▼──────────┐            │
│     │ eSIM Module        │            │
│     │ (4G/LTE)           │            │
│     └────────────────────┘            │
│               │                        │
└───────────────┼────────────────────────┘
                │
      ┌─────────▼──────────┐
      │  Firebase         │
      │  Realtime DB      │
      │ (/active_buses)   │
      └───────────────────┘
```

### Componentes

| Componente | Modelo | Función | Costo |
|---|---|---|---|
| **Microcontrolador** | ESP32-WROOM-32 | Core del sistema, WiFi/BLE | $80-120 MXN |
| **GPS** | NEO-M8N | Ubicación (±2.5m, 5Hz) | $150-200 MXN |
| **IMU** | MPU-6050 | Aceleración/movimiento | $80-100 MXN |
| **Ocupancia** | 2× HC-SR04 (Ultrasónico) | Detección de pasajeros | $60-80 MXN |
| **Conectividad** | eSIM + Módulo 4G | Internet confiable | Operativo: $1 USD/mes |
| **Regulador de voltaje** | Buck Converter 12V→3.3V | Alimentación desde bus | $40-60 MXN |
| **Caja/Montaje** | IP67 Waterproof | Protección ambiente | $100-150 MXN |
| **Cables/Conectores** | Varios | Integración | $50-100 MXN |
| **Labor de ensamble** | Manual | Montaje en el bus | Incluido |
| | | **TOTAL POR UNIDAD** | **~$800 MXN** |

---

## 4. Modelo de Costos Detallado

### Escenario: 50 Buses (Fase Piloto → Escalada)

#### Capex (Inversión Inicial)

```
Hardware x 50 buses        = 50 × $800 MXN     = $40,000 MXN
Instalación/Labor          = 50 × $150 MXN     = $7,500 MXN
Testing & QA               = 1 × $5,000 MXN    = $5,000 MXN
Documentación/Training     = 1 × $3,000 MXN    = $3,000 MXN
                                        CAPEX TOTAL = $55,500 MXN (~$3,270 USD)
```

#### Opex (Operación Anual)

```
eSIM Conectividad x 50 × 12 meses
  = 50 × $1 USD × 12       = $600 USD/año     = $10,200 MXN

Firebase Costs (Lectura/escritura)
  - Estimado: 8.64M datos/mes × 50 buses
  - Free tier cubre los primeros ~1M ops
  - Costo proyectado: ~$50-100 USD/mes      = ~$900-1,700 MXN/mes

Reemplazo de hardware (fallos, desgaste)
  - ~5% anual = 2.5 unidades × $800 MXN     = $2,000 MXN/año

Mantenimiento/Calibración
  - GPS/IMU calibración anual                = $2,000 MXN

                                        OPEX ANUAL = $15,100-16,900 MXN (~$890-1,000 USD)
```

#### ROI Proyectado

| Métrica | Estimado |
|---------|----------|
| **Capex Total** | $55,500 MXN |
| **Opex Anual** | $15,500 MXN |
| **Ahorro por Optimización de Rutas** | $150,000/año |
| **Ahorro por Mantenimiento Preventivo** | $50,000/año |
| **Reducción de Combustible (rutas optimizadas)** | $80,000/año |
| **Total Beneficios Anuales** | $280,000 MXN |
| **Payback Period** | ~2.4 meses |
| **ROI Año 1** | **405%** |

---

## 5. Datos Recopilados & Valor

### ¿Qué Datos Recibe Hackfox?

```json
GPS Stream (cada 5-10 segundos):
{
  "busId": "BUS_001",
  "lat": 19.4326,
  "lng": -99.1332,
  "speed": 35.5,           // km/h
  "heading": 180,          // grados
  "accuracy": 2.5,         // metros
  "timestamp": 1234567890
}
// = 360-720 registros/hora × 50 buses = 18,000-36,000 registros/hora

Sensor Stream (cada 30 segundos):
{
  "busId": "BUS_001",
  "occupancy": 65,         // % de capacidad
  "accelX": 0.1,           // m/s² 
  "accelY": -0.05,
  "accelZ": 9.8,
  "timestamp": 1234567890
}
// = 120 registros/hora × 50 buses = 6,000 registros/hora
```

### Valor de Datos: Casos de Uso

| Dato | Uso | Beneficio |
|---|---|---|
| **Ubicación GPS** | Maps en app, ETAs, rutas | Ciudadanos: reducen espera 20% |
| **Ocupancia** | Optimización de frecuencia | Gobierno: ahorra combustible 15% |
| **Aceleración** | Seguridad, conducción | Reducir accidentes, seguros bajan |
| **Velocidad/Paradas** | Detección de congestión | Predicción de retrasos |
| **Trayectoria anómala** | Mantenimiento predictivo | Detectar desgaste (frenos) |
| **Patrones de ruta** | Route Intelligence | Sugerir rutas alternativas |

---

## 6. Beneficios Estratégicos

### Para Ciudadanos

```
ANTES (sin hardware)          DESPUÉS (con IoT)
├─ ¿Dónde está el bus?        ├─ ¿Dónde está el bus?
│  Estimación imprecisa       │  Precisión: ±2.5m, cada 10s
│                             │
├─ ¿Cuando llega?             ├─ ¿Cuando llega?
│  ETA: ±15-20 minutos        │  ETA: ±2-3 minutos
│                             │
├─ ¿Es seguro viajar?         ├─ ¿Es seguro viajar?
│  Sin contexto               │  Sistema reporta ocupancia
│                             │
└─ Sin alertas de cambios     └─ Alertas de retrasos, cambios
```

**Impacto:** Reducción de tiempo de espera 20-30%, confiabilidad +40%.

---

### Para el Gobierno

```
ANTES                        DESPUÉS
├─ Gestión reactiva         ├─ Gestión predictiva
├─ Sin datos de ocupancia   ├─ Ocupancia real: ajustar flotas
├─ Mantenimiento programado ├─ Mantenimiento predictivo
├─ Rutas ineficientes       ├─ Rutas optimizadas con IA
└─ Incidentes sin contexto  └─ Análisis de patrones
```

**Impacto:** Ahorro operativo $280K/año, mejor servicio.

---

### Para Developers

```
✓ Datos en tiempo real (Firebase Realtime DB)
✓ Telemetría completa para debugging
✓ APIs para nuevas aplicaciones
✓ Extensible: agregar sensores fácilmente
✓ Open-source: personalizable
```

---

## 7. Especificaciones Técnicas

### Performance

| Métrica | Especificación |
|---------|---|
| **Frecuencia de GPS** | 5-10 Hz (cada 100-200ms) |
| **Precisión GPS** | ±2.5m típica |
| **Latencia a Firebase** | <2 segundos (con WiFi/4G) |
| **Precisión Ocupancia** | ±2 personas (~5%) |
| **Rango Ultrasónico** | 0-5 metros |
| **Uptime** | >99.5% (estimado) |
| **Consumo Energía** | ~500mW promedio |

### Configuración

```
Microcontrolador:    ESP32-WROOM-32 (3.3V, 520KB RAM, 4MB Flash)
Conectividad:        WiFi 802.11 b/g/n + BLE 4.2
Almacenamiento:      4MB Flash (buffer local si sin conexión)
Batería (backup):    Opcional: 2-4 horas con batería LiPo
Voltaje de entrada:  12V (bus), regulada a 3.3V
```

### Firmware

- **Lenguaje:** Arduino C++ (usando PlatformIO)
- **Librerías:** TinyGPS++, Firebase-Arduino, DHT, VL53L0X
- **OTA (Over-The-Air):** Sí, actualizaciones sin desconectar
- **Logging Local:** Sí, buffer de 1,000 registros si desconexión

---

## 8. Implementación & Timeline

### Fase 1: Prototipo (Semanas 1-4)

```
Semana 1: Diseño + Sourcing
├─ Validar proveedores
├─ Ordenar componentes
└─ Documentación

Semana 2-3: Ensamble + Testing
├─ Armado de 5 prototipos
├─ Testing individual
└─ Calibración

Semana 4: Field Trial
├─ Instalación en 2-3 buses
├─ Monitoreo en vivo
└─ Ajustes
```

**Salida:** 5 unidades testadas, firmware v1.0 validado.

---

### Fase 2: Escalada (Semanas 5-12)

```
Semana 5-8: Producción (50 unidades)
├─ Manufactura por lotes
├─ QA de cada unidad
└─ Empaque/Documentación

Semana 9-11: Instalación en Flota
├─ Training a técnicos
├─ Instalación: 10-15 buses/semana
└─ Validación de datos

Semana 12: Go-Live
├─ Monitoreo 24/7
├─ Soporte en terreno
└─ Optimización
```

**Salida:** 50 buses con IoT activo, datos en tiempo real.

---

### Fase 3: Mantenimiento & Escalada (Mes 4+)

```
Mensual:
├─ Monitoreo de uptime
├─ Actualizaciones OTA de firmware
├─ Análisis de datos anomalías
└─ Soporte a usuarios

Trimestral:
├─ Calibración de sensores
├─ Análisis de ROI
└─ Reportes de performance

Anual:
├─ Reemplazo de hardware degradado
├─ Planificación de expansión
└─ Evaluación de nuevos sensores
```

---

## 9. Riesgos & Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| **Conectividad débil (eSIM)** | Pérdida de datos | Buffer local + retry automático |
| **GPS sin señal** | Ubicación imprecisa | IMU predice movimiento mientras tanto |
| **Fallos de hardware** | Bus sin tracking | Repuestos de stock, garantía |
| **Interferencia EMI en bus** | Ruido en sensores | Aislamiento con ferrita, calibración |
| **Obsolescencia de componentes** | Problema futuro | PCB modular, fácil swap de sensores |

---

## 10. Recomendación Final

### ¿Por Qué Hardware IoT?

1. **Único enfoque** que proporciona datos completos 24/7
2. **ROI rápido:** Payback en 2.4 meses, 405% Año 1
3. **Escalable:** Costo $800 por unidad, fácil agregar buses
4. **Confiable:** Conectividad independiente del usuario
5. **Extensible:** Arquitectura permite agregar sensores
6. **Localizado:** Proveedor en Latinoamérica, soporte cercano

### Próximos Pasos

```
✓ Aprobar presupuesto: $55,500 MXN (Capex)
✓ Sourcing de componentes: 2 semanas
✓ Prototipo: 4 semanas
✓ Instalación Fase 1: 8 semanas
✓ Validación: 2 semanas
└─ Go-Live: Mes 4
```

### KPIs de Éxito

- [ ] Uptime del sistema: >99%
- [ ] Precisión GPS: <3 metros
- [ ] Latencia datos: <2 segundos
- [ ] Ocupancia detectada vs. real: ±5%
- [ ] Reducción de combustible: >10% en 6 meses
- [ ] Satisfacción de usuarios (ETA): +4.0/5.0

---

## 11. Referencias & Documentación

- **Firmware:** `/hardware/firmware_final/` (código Arduino)
- **Esquemáticos:** `SCH_Schematic1_2026-05-28.pdf`
- **Especificaciones de Componentes:** `/hardware/BOM.csv`
- **Guía de Instalación:** `/hardware/INSTALLATION.md` (próximamente)
- **Testing & Calibración:** `/hardware/test/` (códigos de prueba)

---

**Documento preparado para Hackfox - Mayo 2026**

*Para consultas técnicas: Ver `README.md` en `/hardware/` para detalles de firmware*

*Para inversión/presupuesto: Este documento justifica el Capex y proyecta ROI a 12 meses*
