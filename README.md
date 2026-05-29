# Hackfox 2026 - Real-time Transit Intelligence Platform

**Transforming Urban Mobility Through IoT, Real-Time Data, and Intelligent Routing**

Hackfox is a comprehensive platform that revolutionizes public transportation by combining real-time IoT device tracking, intelligent route optimization, and accessible navigation. It empowers commuters with accurate transit information while providing government agencies with powerful monitoring and analytics capabilities.

---

## Platform Overview

Hackfox operates as an integrated ecosystem with four core components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Users                             │
│        (React Native - Real-time Navigation)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌────────────┐ ┌──────────┐ ┌────────────┐
│   Mobile   │ │ Firebase │ │  Hardware  │
│   App      │ │ Backend  │ │   Sensors  │
│ (Citizens) │ │          │ │  (In Buses)│
└────────────┘ └──────────┘ └────────────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────▼────────────┐
        │  Web Dashboard          │
        │  (Gov Analytics)        │
        └─────────────────────────┘
```

### Core Pillars

| Pillar | Purpose | Technology |
|--------|---------|-----------|
| **Mobile App** | Citizen-facing navigation with live bus tracking, incident reporting, and accessibility | React Native, Expo, Firebase |
| **Web Dashboard** | Government monitoring with KPIs, route analytics, and data visualization | Next.js, TailwindCSS, Recharts |
| **IoT Hardware** | Real-time bus location and sensor data collection | Arduino/ESP32, Bluetooth/GPS |
| **Firebase Backend** | Real-time database, authentication, cloud functions, and data persistence | Firestore, RTDB, Cloud Functions |

---

## Module Directory

### [Mobile App](/mobile-app3/README.md)
**Citizen-Facing Navigation & Incident Reporting**

The heart of the Hackfox platform for everyday commuters:
- **Interactive Real-Time Map** - Live bus visualization with GPS tracking
- **Intelligent Route Optimization** - Smart calculation of optimal transit paths
- **Incident Reporting** - Citizens report road hazards, traffic issues, and transportation complaints
- **Accessibility First** - VoiceOver support, text-to-speech, high-contrast UI
- **Location Services** - GPS-powered navigation with Google Directions API integration

**Stack:** React Native 0.81, Expo 54, TypeScript, Firebase

**Start here:** [Mobile App README](/mobile-app3/README.md)

---

### [Web Dashboard](/web-app/README.md)
**Government Monitoring & Analytics Portal**

Comprehensive analytics platform for transit authorities:
- **KPI Dashboard** - Real-time metrics (total potholes, bus occupancy, daily trips, active routes)
- **Route Statistics** - Searchable table with filtering and sorting
- **Pothole Analysis** - Infrastructure damage tracking by severity and location
- **Occupancy Analytics** - Passenger density trends and heatmaps

**Stack:** Next.js 16.2, TailwindCSS 4, Recharts, TypeScript

**Start here:** [Web Dashboard README](/web-app/README.md)

---

### [Firebase Backend](/firebase/README.md)
**Real-Time Data Infrastructure & Cloud Functions**

Enterprise backend powering both mobile and web clients:
- **Firestore** - NoSQL database for user profiles, reports, route data
- **Realtime Database** - Live bus location streaming (`/active_buses/data`)
- **Cloud Functions** - Serverless processing for incident analysis and alerts
- **Authentication** - Secure user management with custom auth strategies
- **Storage** - Photo uploads and media management

**Configuration:** Database rules, index definitions, function definitions

**Contains:**
- `firestore.rules` - Security & access control rules
- `database.rules.json` - Realtime DB configuration
- `functions/` - Cloud Functions for backend processing
- `firestore.indexes.json` - Performance optimization indexes

**Start here:** See [Firebase Configuration](/firebase/README.md)

---

### [Hardware/IoT](/hardware/README.md)
**Bus-Mounted Sensors & Data Collection**

Real-time data acquisition from public transportation fleet:
- **GPS Tracking** - Real-time bus location via GPS/Bluetooth modules
- **Sensor Integration** - Environmental and occupancy sensors
- **Firmware** - Embedded systems code for data collection and transmission
- **Schematics** - Hardware design and wiring diagrams

**Contains:**
- `firmware_final/` - Arduino/ESP32 firmware code
- `test/` - Hardware testing utilities
- `SCH_Schematic1_2026-05-28.pdf` - Circuit schematics and PCB design

**Start here:** See [Hardware Configuration](/hardware/README.md)

---

## Architecture Layers

### Data Flow

```
Hardware Sensors (IoT)
    ↓
    └─→ Firebase Realtime DB (/active_buses/data)
            ↓
            ├─→ Mobile App (real-time map updates)
            └─→ Cloud Functions (processing & analysis)
                    ↓
                    └─→ Firestore (reports, analytics)
                            ↓
                            └─→ Web Dashboard (visualization)
```

### Database Schema

**Firestore:**
- `reports/` - Citizen-reported incidents (potholes, traffic, hazards)
- `routes/` - Bus route definitions and schedules
- `users/` - User profiles and preferences

**Realtime Database:**
- `active_buses/data/` - Live bus position stream
- `queue/incidents/` - Real-time incident queue

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Firebase CLI
- Expo CLI (for mobile)
- Git

### Quick Setup

```bash
# Clone repository
git clone https://github.com/rubenyh/hackfox.git
cd hackfox

# Install dependencies for all modules
cd mobile-app3 && npm install
cd ../web-app && npm install
cd ../firebase && npm install

# Configure environment variables (see individual READMEs)
# - Mobile: .env.local with Firebase config
# - Web: .env.local with API keys
# - Firebase: Configure .firebaserc with project ID
```

### Running Each Module

```bash
# Mobile App (iOS simulator)
cd mobile-app3
npm run ios

# Web Dashboard
cd web-app
npm run dev

# Firebase Emulator
cd firebase
firebase emulators:start
```

---

## Key Features

### For Citizens
- Real-time bus tracking on interactive map  
- Intelligent transit routing with time estimates  
- Report infrastructure problems and hazards  
- Accessible navigation (screen readers, text-to-speech)  
- Recent trip history and favorite destinations  

### For Transit Authorities
- Live fleet monitoring dashboard  
- Infrastructure damage tracking and prioritization  
- Occupancy analytics and congestion prediction  
- Route performance metrics and optimization  
- Real-time incident reporting system  

### For Developers
- Type-safe TypeScript codebase  
Modular architecture (mobile, web, backend independent)  
- Cloud Functions for custom business logic  
- REST and real-time API endpoints  
- Comprehensive error handling and logging  

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Mobile Frontend** | React Native | 0.81 |
| **Mobile Framework** | Expo | 54 |
| **Web Frontend** | Next.js | 16.2 |
| **Styling** | TailwindCSS | 4 |
| **Backend** | Firebase | Latest |
| **Database** | Firestore + RTDB | - |
| **Maps** | Google Maps + React Native Maps | - |
| **Language** | TypeScript | 5+ |

---

## Security

- **Authentication:** Firebase Auth with multi-provider support
- **Database Rules:** Firestore and RTDB security rules enforce access control
- **API Security:** Cloud Functions validate all requests
- **Data Privacy:** User data encrypted at rest and in transit
- **Sensitive Data:** API keys and credentials managed via environment variables

---

## Support & Documentation

Each module has its own detailed README:
- **[Mobile App](/mobile-app3/README.md)** - Installation, features, and development guide
- **[Web Dashboard](/web-app/README.md)** - Dashboard setup and customization
- **[Firebase](/firebase)** - Backend configuration and Cloud Functions
- **[Hardware](/hardware)** - Sensor setup and firmware deployment

---

## Project Vision

Hackfox empowers urban commuters with intelligent transit guidance while providing governments with actionable insights into public transportation performance. By combining real-time data collection, smart algorithms, and accessible design, we're transforming how cities manage and residents navigate their public transportation systems.

**Built for accessibility, designed for efficiency, engineered for scale.**

---

## License

MIT License - See LICENSE file for details

---

**Repository:** https://github.com/rubenyh/hackfox
