# Firebase Backend - Hackfox 2026

**Real-Time Data Infrastructure & Cloud Services**

The Firebase backend powers the entire Hackfox platform, managing real-time bus data, user authentication, incident reports, and data analytics.

---

## 🏗️ Architecture Overview

### Services Enabled

```
Firebase Project: hackfox
├── Firestore          - NoSQL database for persistent data
├── Realtime Database  - Real-time bus location streaming
├── Cloud Functions    - Serverless backend logic
├── Authentication     - User management & security
├── Storage            - Photo/media uploads
└── Remote Config      - Feature flags & configuration
```

---

## 📊 Database Schema

### Firestore Collections

#### `reports/`
Citizen-reported incidents (potholes, transportation issues, hazards)

```typescript
{
  userId: string;           // User who reported
  incidentType: string;     // "Bache", "Rampa Bloqueada", etc.
  description: string;      // Detailed description
  imageUrl: string;         // Uploaded photo
  latitude: number;         // GPS coordinates
  longitude: number;
  createdAt: Timestamp;     // Server timestamp
  status: "pending" | "reviewed" | "resolved";
}
```

#### `routes/`
Bus route definitions and schedules

```typescript
{
  routeId: string;
  routeName: string;        // "Route 42", etc.
  stops: Stop[];            // Array of bus stops
  geometry: Coordinate[];   // Polyline coordinates
  estimatedTime: number;    // Typical duration in minutes
  active: boolean;
}
```

#### `users/`
User profiles and preferences

```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: "citizen" | "admin" | "transit_operator";
  createdAt: Timestamp;
  lastLogin: Timestamp;
  preferences: {
    accessibility: boolean;
    notifications: boolean;
    theme: "light" | "dark";
  };
}
```

---

### Realtime Database Structure

#### `/active_buses/data`
Live bus location stream (updated every 5-10 seconds)

```json
{
  "BUS_001": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "route": "Route 42",
    "timestamp": 1234567890,
    "occupancy": 65,
    "status": "active"
  },
  "BUS_002": {
    ...
  }
}
```

#### `/queue/incidents`
Real-time incident queue for processing

```json
{
  "incident_123": {
    "userId": "user_456",
    "type": "pothole",
    "location": { "lat": 40.7128, "lng": -74.0060 },
    "timestamp": 1234567890
  }
}
```

---

## 🔐 Security Rules

### Firestore Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Anyone can read routes
    match /routes/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    // Users can create reports
    match /reports/{reportId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
    }
  }
}
```

### Realtime Database Rules (`database.rules.json`)

```json
{
  "rules": {
    "active_buses": {
      ".read": true,
      ".write": "root.child('authorized_devices').child(auth.uid).exists()"
    },
    "queue": {
      "incidents": {
        ".write": "auth != null",
        ".read": "auth.token.admin == true"
      }
    }
  }
}
```

---

## ☁️ Cloud Functions

Functions directory: `functions/`

### Key Functions

#### `processIncidentReport()`
Processes incoming incident reports, validates location, and stores in Firestore

```typescript
// Triggered by: POST /api/reports
// Input: { incidentType, description, imageUrl, location }
// Output: { reportId, timestamp, status }
```

#### `streamBusLocations()`
Aggregates bus GPS data from IoT devices into Realtime Database

```typescript
// Triggered by: IoT device webhook
// Input: { busId, lat, lng, timestamp }
// Output: Updates /active_buses/data/{busId}
```

#### `generateAnalytics()`
Runs scheduled analytics on reports and routes

```typescript
// Triggered by: Cloud Scheduler (daily)
// Calculates: Route KPIs, incident hotspots, occupancy trends
// Stores in: Firestore `analytics/` collection
```

---

## 🚀 Deployment

### Prerequisites
```bash
npm install -g firebase-tools
firebase login
firebase init
```

### Deploy Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### Deploy Database Rules
```bash
firebase deploy --only firestore,database
```

### Deploy All
```bash
firebase deploy
```

---

## 📝 Configuration

### `.firebaserc`
```json
{
  "projects": {
    "default": "hackfox",
    "production": "hackfox-prod"
  }
}
```

### Environment Variables (`functions/.env`)
```
GOOGLE_MAPS_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
```

---

## 🔌 API Endpoints

### Reports Endpoint
- **POST** `/api/reports` - Submit incident report
- **GET** `/api/reports` - Fetch reports (admin only)
- **GET** `/api/reports/{reportId}` - Get specific report

### Routes Endpoint
- **GET** `/api/routes` - Fetch all routes
- **GET** `/api/routes/{routeId}` - Get route details

### Analytics Endpoint
- **GET** `/api/analytics/kpis` - Dashboard KPIs
- **GET** `/api/analytics/potholes` - Pothole hotspots
- **GET** `/api/analytics/occupancy` - Occupancy trends

---

## 📊 Indexes

**Critical indexes defined in `firestore.indexes.json`:**

- `reports` collection: indexed by `createdAt` (descending) for recent incidents
- `reports` collection: composite index on `status` + `createdAt` for admin filtering
- `routes` collection: indexed by `active` for quick route listing

---

## 🧪 Local Development

### Start Firebase Emulator
```bash
firebase emulators:start --import=./emulator-data
```

### Connect from Mobile App
```typescript
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.EXPO_PUBLIC_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## 📈 Monitoring

### Key Metrics to Monitor
- **Active Users** - Real-time connected clients
- **Write Throughput** - Reports/second being submitted
- **Read Latency** - Map update response times
- **Storage Usage** - Database and storage growth
- **Function Execution Time** - Cloud Function performance

### Firebase Console Dashboards
- **Usage** - Track quota usage and costs
- **Performance** - Monitor read/write times
- **Security** - Audit access patterns

---

## 🔗 Related Documentation

- **Mobile App:** [Firebase Config in Mobile App](/mobile-app3/firebaseConfig.ts)
- **Web Dashboard:** [Web App Firebase Integration](/web-app)
- **Hardware:** [IoT Data Streaming to Firebase](/hardware)
- **Main Readme:** [Hackfox Overview](/README.md)

---

## 📞 Support

For backend issues:
1. Check Firebase Console logs
2. Review security rules in `.rules` files
3. Test with Firebase Emulator locally
4. Check Cloud Function logs for errors

---

**Last Updated:** May 29, 2026  
**Firebase Project:** hackfox
