# Hardware/IoT - Hackfox 2026

**Real-Time Bus Location & Sensor Data Collection**

The hardware layer consists of GPS and IoT sensor modules mounted on public buses to continuously collect real-time location data, passenger occupancy information, and environmental metrics.

---

## 🔧 System Architecture

### Bus-Mounted Hardware Stack

```
┌─────────────────────────────────────┐
│   Microcontroller                   │
│   (ESP32 / Arduino)                 │
├─────────────────────────────────────┤
│ • GPS Module (NEO-6M/NEO-M8N)      │
│ • GSM/LTE Modem                     │
│ • Accelerometer (6-axis IMU)        │
│ • Temperature & Humidity Sensor     │
│ • Occupancy Sensor (LIDAR/IR)      │
└────────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
 WiFi/BLE         4G/LTE
    │                 │
    └────────┬────────┘
             │
    ┌────────▼─────────┐
    │ Firebase         │
    │ Realtime DB      │
    └──────────────────┘
```

---

## 📋 Hardware Components

### GPS Module
- **Model:** NEO-M8N or NEO-6M
- **Accuracy:** ±2.5m (typical)
- **Update Rate:** 5-10Hz
- **Protocol:** UART (9600 baud)
- **Power:** 3.3V, ~100mA

### Microcontroller
- **Primary:** ESP32-WROOM-32
- **Flash:** 4MB
- **RAM:** 520KB (SRAM)
- **WiFi/BLE:** Integrated
- **Operating Voltage:** 3.3V

### Occupancy Sensor
- **Type:** Time-of-Flight (ToF) or Passive IR
- **Range:** 0-5m depending on model
- **Protocol:** I²C or PWM
- **Resolution:** Passenger count ±2

### Communication Module
- **Primary:** Integrated WiFi/BLE (ESP32)
- **Backup:** SIM800 GSM module
- **Data Rate:** 2G/3G/4G as available

---

## 📁 Directory Structure

```
hardware/
├── firmware_final/              # Embedded firmware code
│   ├── main.cpp                 # Main program logic
│   ├── gps.cpp/h                # GPS module driver
│   ├── sensor.cpp/h             # Sensor reading functions
│   ├── firebase_client.cpp/h    # Firebase communication
│   └── config.h                 # Configuration constants
├── test/                         # Hardware testing utilities
│   ├── gps_test.ino             # GPS module test
│   ├── sensor_calibration.ino   # Sensor calibration
│   └── connectivity_test.ino    # Network connectivity
├── SCH_Schematic1_2026-05-28.pdf # Circuit schematics
└── README.md                     # This file
```

---

## 🚀 Firmware Setup

### Prerequisites
- Arduino IDE or VS Code + PlatformIO
- ESP32 Board Support Package
- Libraries:
  - `TinyGPS++` (GPS parsing)
  - `WiFi.h` (ESP32 built-in)
  - `Firebase Arduino Library`
  - `DHT.h` (temperature/humidity)
  - `VL53L0X.h` or similar (distance sensor)

### Installation

1. **Clone firmware**
```bash
git clone https://github.com/rubenyh/hackfox.git
cd hackfox/hardware/firmware_final
```

2. **Install dependencies (PlatformIO)**
```bash
platformio lib install
```

3. **Configure WiFi & Firebase**
```cpp
// config.h
#define SSID "YourNetworkSSID"
#define PASSWORD "YourPassword"
#define FIREBASE_HOST "hackfox-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "your_firebase_auth_token"
```

4. **Flash to ESP32**
```bash
platformio run --target upload
```

---

## 📊 Data Collection

### GPS Data Stream
Sent to Firebase every 5-10 seconds

```json
{
  "busId": "BUS_001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "speed": 25.3,           // km/h
  "heading": 180,          // degrees
  "accuracy": 2.5,         // meters
  "altitude": 10.5,        // meters
  "timestamp": 1234567890
}
```

### Sensor Data Stream
Sent every 30 seconds

```json
{
  "busId": "BUS_001",
  "occupancy": 65,         // percentage
  "temperature": 28.5,     // Celsius
  "humidity": 45.2,        // percentage
  "acceleration": {
    "x": 0.1,
    "y": -0.05,
    "z": 9.8               // m/s²
  },
  "timestamp": 1234567890
}
```

---

## 🔌 Firmware Functions

### Core Functions

#### `setup()`
Initializes all modules and connects to network

```cpp
void setup() {
  Serial.begin(115200);
  initGPS();
  initSensors();
  connectWiFi();
  connectFirebase();
}
```

#### `loop()`
Main program loop - collects and sends data

```cpp
void loop() {
  if (gpsReady) {
    gpsData = readGPS();
  }
  
  if (sensorReady) {
    sensorData = readSensors();
  }
  
  if (millis() - lastUpdate > UPDATE_INTERVAL) {
    sendToFirebase(gpsData, sensorData);
    lastUpdate = millis();
  }
}
```

#### `readGPS()`
Parses GPS NMEA sentences

```cpp
GPSData readGPS() {
  while (gpsSerial.available()) {
    char c = gpsSerial.read();
    gps.encode(c);
  }
  return {
    gps.location.lat(),
    gps.location.lng(),
    gps.speed.kmph(),
    gps.course.deg()
  };
}
```

#### `readSensors()`
Reads all connected sensors via I²C/SPI

```cpp
SensorData readSensors() {
  return {
    dht.readHumidity(),
    dht.readTemperature(),
    imu.getAcceleration(),
    distanceSensor.readRangeContinuousMicrometers()
  };
}
```

#### `sendToFirebase()`
Uploads data to Firebase Realtime Database

```cpp
void sendToFirebase(GPSData gps, SensorData sensors) {
  String path = "/active_buses/" + busId + "/data";
  firebase.setJSON(path, createJSON(gps, sensors));
}
```

---

## 🧪 Testing

### Unit Tests

**GPS Module Test** (`test/gps_test.ino`)
```cpp
// Verify GPS connection and data parsing
void testGPS() {
  Serial.println("Testing GPS Module...");
  GPSData data = readGPS();
  assert(data.latitude > -90 && data.latitude < 90);
  assert(data.longitude > -180 && data.longitude < 180);
  Serial.println("✓ GPS test passed");
}
```

**Sensor Calibration** (`test/sensor_calibration.ino`)
```cpp
// Calibrate sensors before deployment
void calibrateSensors() {
  Serial.println("Calibrating distance sensor...");
  distanceSensor.startRanging();
  // Take 100 readings at 0cm (covers)
  // Store baseline values
}
```

**Connectivity Test** (`test/connectivity_test.ino`)
```cpp
// Verify WiFi and Firebase connection
void testConnectivity() {
  bool wifiOk = WiFi.status() == WL_CONNECTED;
  bool firebaseOk = firebase.connected();
  Serial.printf("WiFi: %s, Firebase: %s\n", 
                wifiOk ? "✓" : "✗", 
                firebaseOk ? "✓" : "✗");
}
```

---

## 📈 Performance Specifications

| Metric | Specification |
|--------|---------------|
| **GPS Update Rate** | 5-10 Hz |
| **Sensor Sample Rate** | 1 Hz |
| **Data Transmission** | Every 5-10 seconds |
| **Latency to Firebase** | <2 seconds (typical) |
| **Power Consumption** | ~500mW average |
| **Battery Backup** | 2-4 hours (optional) |
| **Operating Temp** | 0°C to 50°C |
| **Accuracy (GPS)** | ±2.5m horizontal |

---

## 🔧 Troubleshooting

### GPS Not Getting Fix
- Check antenna orientation
- Move away from tall buildings
- Allow 2-5 minutes for first fix (cold start)
- Check UART connection (TX/RX pins)

### WiFi Connection Fails
- Verify SSID and password in `config.h`
- Check WiFi range (ESP32 range ~100m)
- Ensure 2.4GHz band available
- Check firewall settings if corporate network

### Firebase Connection Issues
- Verify Firebase URL in configuration
- Check Firebase Auth token validity
- Test with Firebase Emulator locally
- Check internet connectivity via ping test

### Sensor Readings Incorrect
- Run calibration routine before deployment
- Check I²C pull-up resistors
- Verify sensor voltage (usually 3.3V)
- Check for sensor damage or water ingress

---

## 📡 Deployment Checklist

- [ ] Firmware compiled and tested locally
- [ ] WiFi/Firebase credentials configured
- [ ] GPS antenna properly oriented
- [ ] Sensors calibrated
- [ ] Power supply stable (12V bus power)
- [ ] Housing sealed against moisture
- [ ] Unit tested on stationary vehicle
- [ ] Data confirmed in Firebase Console
- [ ] Unit mounted securely on bus
- [ ] All connectors weatherproofed

---

## 🔗 Related Documentation

- **Circuit Schematics:** [SCH_Schematic1_2026-05-28.pdf](/hardware/SCH_Schematic1_2026-05-28.pdf)
- **Firebase Backend:** [Firebase Integration](/firebase/README.md)
- **Mobile App:** [Mobile App Documentation](/mobile-app3/README.md)
- **Main README:** [Hackfox Overview](/README.md)

---

## 📝 Component BOM (Bill of Materials)

| Component | Model | Qty | Notes |
|-----------|-------|-----|-------|
| Microcontroller | ESP32-WROOM-32 | 1 | Core processor |
| GPS Module | NEO-M8N | 1 | High accuracy |
| GSM Module | SIM800 | 1 | Backup connectivity |
| Temperature Sensor | DHT22 | 1 | Temp & humidity |
| Distance Sensor | VL53L0X | 1 | Occupancy detection |
| IMU | MPU-6050 | 1 | Motion tracking |
| Power Supply | 12V to 3.3V LDO | 1 | 1A capacity |
| GPS Antenna | 25mm ceramic | 1 | Active antenna |
| Housing | Waterproof IP67 | 1 | Environmental protection |

---

**Last Updated:** May 29, 2026  
**Firmware Version:** 2.1.0  
**Target Platform:** ESP32-WROOM-32
