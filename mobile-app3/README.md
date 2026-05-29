# Hackfox 2026 - Mobile App

**Real-time Transit Intelligence for Urban Navigation**

A cutting-edge React Native mobile application that revolutionizes how commuters navigate bus systems. Hackfox combines real-time IoT device tracking, intelligent route optimization, and accessible navigation to deliver the ultimate transit experience.

---

## Core Features

### Interactive Real-Time Map
- Live visualization of active buses using Firebase Real-Time Database
- GPS-powered user location tracking with automatic map centering
- Dynamic route rendering with polyline visualization
- Smooth map animations and responsive touch controls

### Intelligent Route Optimization
The heart of Hackfox is a sophisticated routing engine that calculates the optimal transit path by:
- Finding the nearest bus stops to both origin and destination
- Computing realistic walking distances via Google Directions API
- Analyzing the entire route geometry to estimate bus travel times
- Balancing total journey time to minimize user walking distance
- Capping bus estimates at realistic 10-20 minute intervals

### Smart Walking Route Planning
- Integration with Google Directions API for accurate walking paths
- Polyline decoding to render precise route geometry
- Real-time distance and duration calculations
- Fallback distance estimation using Haversine formula

### Place Search & Geocoding
- Seamless destination searching with real-time suggestions
- Place details and coordinate retrieval
- Quick-select from recent searches

### Accessibility First
- VoiceOver and screen reader support
- Text-to-speech announcements for all navigation events
- High-contrast UI mode support
- Semantic accessibility labels throughout

---

## Demo

![Hackfox Mobile App Demo](./../readme_assets/WhatsApp%20Video%202026-05-29%20at%2010.04.23%20AM.gif)

---

## Technical Architecture

### Technology Stack
- **Frontend**: React 19 + React Native 0.81 with Expo 54
- **Navigation**: Expo Router with bottom-tab navigation
- **Maps**: React Native Maps with custom polyline rendering
- **Backend**: Firebase Realtime Database for IoT bus tracking
- **Location**: Expo Location API for GPS capabilities
- **External APIs**: Google Directions & Geocoding
- **Language**: TypeScript with strict type checking

### Key Modules

#### `utils/routing.ts` — Transit Route Engine
```typescript
calculateTransitRoute(origin, destination, routes)
  → Analyzes all available bus routes
  → Finds optimal stops minimizing walking distance
  → Calculates accurate bus segment times
  → Returns complete journey breakdown with paths and durations
```

Implements:
- **Haversine Distance Calculation**: Precise geographic distance computation
- **Polyline Decoding**: Converts Google's compressed route geometry
- **Route Segmentation**: Extracts relevant bus journey portions
- **Time Estimation**: Uses 60 km/h urban bus velocity with smart capping

#### `hooks/use-routes.ts` — OpenStreetMap Data Parser
- Loads bus routes from OSM data (routes.json)
- Parses route relations with stops and geometry
- Handles bidirectional routes (forward/backward segments)
- Deduplicates coordinate geometry for performance

#### `hooks/use-geocoding.ts` — Place Discovery
- Reverse geocoding for coordinate-to-address lookup
- Forward geocoding for destination search
- Returns detailed place information with coordinates

#### `app/(tabs)/index.tsx` — Map Screen (Main UI)
The central navigation interface featuring:
- Full-screen interactive map display
- Real-time bus marker rendering from Firebase
- Touch-to-set destination with instant route calculation
- Search bar with autocomplete suggestions
- Route summary card showing walk times, bus times, and paths
- Recenter button for quick user location lock

---

## Installation & Setup

```bash
# Install dependencies
npm install

# Configure Firebase
# Add your Firebase config to firebaseConfig.ts

# Add Google API key
# Update GOOGLE_API_KEY in utils/routing.ts

# Run on your platform
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
npm start         # Interactive menu
```

---

## How to Use

1. **Launch the app** — Grant location permissions
2. **View the map** — See all active buses and your location
3. **Select destination** — Tap the map or search for a place
4. **Review route** — See walking times, bus times, and complete route
5. **Navigate** — Follow the polyline to your destination

---

## Performance Features

- **Lazy Loading**: Routes loaded on-demand from Firebase
- **Debounced Search**: Prevents excessive API calls during typing
- **Memoized Calculations**: Efficient distance computations
- **Geometry Deduplication**: Removes redundant coordinate points
- **Smart Caching**: Recent searches and place data cached

---

## Real-Time Architecture

The app connects to Firebase Realtime Database at `/active_buses/data` to stream live bus positions:

```json
{
  "busId": "BUS_001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "route": "Route 42",
  "timestamp": 1234567890
}
```

Updates flow instantly to the map for real-time tracking.

---

## Development

### Add a New Route Feature
Edit `app/(tabs)/rutas.tsx` to display route schedules and details.

### Customize Map Behavior
Modify map region deltas and animation speed in `app/(tabs)/index.tsx`.

### Adjust Timing Algorithms
Fine-tune bus speed (60 km/h), walking speed assumptions, and caps in `utils/routing.ts`.

---

## Dependencies Highlight

| Package | Purpose |
|---------|---------|
| `react-native-maps` | Interactive map rendering |
| `firebase` | Real-time bus data sync |
| `expo-location` | GPS user tracking |
| `expo-router` | Navigation framework |
| `expo-speech` | Accessibility announcements |

---

## Mission

Hackfox empowers urban commuters with intelligent transit guidance, turning complex bus networks into simple, accessible, real-time journeys. Built for accessibility first, designed for efficiency, and engineered for scale.

---

