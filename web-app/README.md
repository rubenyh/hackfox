# Hackfox Web App

A modern Next.js (TypeScript) administrative dashboard designed to help public transportation agencies monitor operations, improve rider experience, optimize routes, and make data-driven decisions.

The platform centralizes transportation management into a single interface where administrators can monitor buses, drivers, route performance, infrastructure issues, passenger demand, and operational efficiency in real time.

---

# Key Features

## Executive Dashboard

The Dashboard serves as the central command center for transportation administrators.

Features include:

* Total active routes
* Active buses
* Active drivers
* Daily ridership estimates
* Average route occupancy
* Infrastructure alerts
* Pothole reports
* Route performance indicators
* Service reliability metrics

Interactive KPI cards allow administrators to:

* Open detailed analytics
* Filter by date ranges
* Compare periods
* Drill down into route-specific data
* Identify trends and anomalies

The dashboard also highlights critical alerts requiring immediate attention.

---

## Route Management

The Routes module provides detailed operational visibility.

Administrators can:

* Search routes
* Filter by district or service area
* View route status
* Analyze demand
* Review occupancy trends
* Monitor route performance

Each route includes:

* Route identifier
* Assigned vehicles
* Assigned drivers
* Number of stops
* Estimated travel time
* Reliability score
* Historical occupancy data
* Infrastructure incidents affecting service

Status: Implemented — route listing, creation, stops and basic details are available.

Future integration can support:

* Real GPS telemetry
* Dynamic rerouting
* Congestion analysis
* ETA predictions

---

## Smart Route Optimization

One of the platform's core innovation modules.

The optimization engine analyzes:

* Passenger demand
* Occupancy patterns
* Service coverage
* Infrastructure conditions
* Route overlap
* Travel time estimates

The system generates recommendations such as:

* Increase service frequency
* Reduce underutilized routes
* Merge overlapping routes
* Deploy additional buses
* Reallocate drivers
* Improve underserved areas

Optimization metrics include:

* Coverage efficiency
* Capacity utilization
* Estimated rider impact
* Operational cost indicators

Current calculations are generated through simulation and heuristic models suitable for hackathon demonstrations.

The architecture allows future integration of:

* Machine learning models
* Real-time GPS feeds
* Historical transit datasets
* Traffic prediction systems

---

## Fleet Management

The Buses section provides operational visibility over the vehicle fleet.

Features:

* Vehicle registry
* Assignment management
* Service status
* Maintenance indicators
* Route allocation tracking
* Availability monitoring

Each vehicle record may contain:

* Bus ID
* Vehicle number
* Assigned route
* Driver assignment
* Capacity
* Operational status
* Last known activity

---

## Driver Management

The Drivers module allows administrators to manage personnel.

Capabilities include:

* Driver registration
* Assignment management
* Route allocation
* Status monitoring
* Workforce overview

Each driver profile may include:

* Driver name
* Contact information
* Assigned vehicle
* Assigned route
* Availability status
* Work activity history

Role-based permissions ensure only authorized administrators can modify assignments.

---

## Passenger Occupancy Analytics

The Occupancy module provides visibility into transportation demand.

Visualizations include:

* Time-series charts
* Demand trends
* Route comparisons
* Peak-hour analysis
* Occupancy heatmaps

Administrators can identify:

* Overcrowded routes
* Underutilized services
* Peak demand periods
* Seasonal demand patterns

Filtering options include:

* Date range
* Route
* Service zone
* Time period

Status: Implemented — occupancy charts and tables are available.

---

## Infrastructure Reporting

The Potholes module helps transportation agencies identify infrastructure issues affecting service quality.

Reports contain:

* GPS coordinates
* Severity classification
* Description
* Supporting image
* Timestamp
* Status

Workflow states include:

* Reported
* Under Review
* Scheduled
* Resolved

This allows maintenance teams to prioritize repairs based on impact and severity.

Status: Implemented — the `potholes` page provides report listing, detail modal, status changes and basic triage flows.

---

## Geographic Heatmaps

The Heatmap module visualizes infrastructure issues geographically.

Capabilities include:

* Pothole density visualization
* Geographic clustering
* Severity overlays
* Regional filtering
* Date filtering

Benefits:

* Identify recurring problem zones
* Prioritize maintenance spending
* Improve route safety
* Support city planning initiatives

Google Maps integration enables interactive geographic exploration.

Status: Implemented — the app includes a `GoogleHeatmap` component (used on potholes and demand heatmap cards). Provide `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable map views.

---

## Advanced Analytics

The Analytics module provides decision-support tools.

Available insights include:

* Ridership trends
* Occupancy growth
* Route efficiency
* Infrastructure impact
* Fleet utilization
* Service reliability

The analytics system is designed for both operational monitoring and strategic planning.

Status: Implemented — analytics charts and dashboards are available.

---

## AI Assistant

The platform includes an integrated AI-powered assistant accessible from any page.

Features:

* Natural language interaction
* Instant data exploration
* Context-aware responses
* Dashboard navigation assistance
* Operational insights

Example questions:

* "Which route had the highest occupancy this week?"
* "Show routes affected by potholes."
* "Which drivers are currently assigned to Route 5?"
* "What areas have the highest concentration of infrastructure issues?"
* "Which routes are operating below 50% capacity?"

The assistant can:

* Summarize dashboard information
* Explain metrics
* Locate data quickly
* Recommend actions
* Apply dashboard filters automatically

This significantly reduces the time required to locate operational information.

Status: Implemented — a client `Assistant` component is available for signed-in users and a server-side API endpoint supports extended queries at `/api/ai`.

---

# Authentication & Security

Authentication is powered by Firebase Authentication.

Supported capabilities:

* Secure login
* Session management
* Protected routes
* Role-based access control

Roles may include:

* Administrator
* Operations Manager
* Analyst
* Viewer

Permissions determine access to management functions and sensitive operational data.

---

# Technology Stack

Frontend:

* Next.js
* React
* TypeScript
* Tailwind CSS

Backend Services:

* Firebase Authentication
* Firebase Firestore
* Firebase Cloud Functions

Visualization:

* Charts and analytics dashboards
* Interactive maps
* Heatmaps

AI:

* Natural language assistant
* Data-aware dashboard exploration

---

# System Architecture

Client Layer

* Next.js frontend
* Responsive dashboard UI
* Interactive charts
* Mapping components

API Layer

* Next.js API routes
* Firebase Cloud Functions
* Data aggregation services

Data Layer

* Firestore collections
* User management
* Route data
* Fleet data
* Occupancy data
* Infrastructure reports

External Services

* Google Maps API
* Geocoding services
* AI APIs (optional)

---

# Future Roadmap

Potential future enhancements include:

### Real-Time Tracking

* GPS integration
* Live vehicle locations
* Arrival predictions
* Delay notifications

### Predictive Analytics

* Demand forecasting
* Ridership prediction
* Maintenance forecasting
* Congestion prediction

### Citizen Mobile Application

A companion mobile application could provide:

* Bus tracking
* Route planning
* Arrival estimates
* Infrastructure reporting
* Service notifications

### Smart City Integration

* Traffic systems
* Municipal maintenance departments
* Open transit datasets
* IoT sensors

---

# Local Development

## Requirements

* Node.js 18+
* npm or yarn
* Firebase project
* Google Maps API Key

## Installation

```bash
git clone <repository-url>

cd web-app

npm install

npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Production Build

```bash
npm run build

npm run start
```

---

# Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```
