#include <Wire.h>
#include <MPU6050.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>
#include <time.h>

// ─── WiFi / Firebase ──────────────────────────────────
#define WIFI_SSID "hackfox2026"
#define WIFI_PASS "o5A_I03Gz>v0"
#define FIREBASE_HOST "https://hackfox-default-rtdb.firebaseio.com"
#define BUS_ID        "camion_rojo_01"

// ─── Pines ────────────────────────────────────────────
#define TRIGGER1 23
#define ECHO1    18
#define TRIGGER2  4
#define ECHO2     2
#define SDA_PIN  21
#define SCL_PIN  22
#define GPS_RX   16
#define GPS_TX   17

// ─── Parámetros ───────────────────────────────────────
#define VENTANA            5
#define LECTURAS_FUERA     2
#define DISTANCIA_REF     50.0
#define INTERVALO_DATA_MS  5000
#define UMBRAL_BACHE       0.8
#define SPEED_CONSTANTE    45


// ─── GPS ──────────────────────────────────────────────
TinyGPSPlus gps;
float gpsLat = 32.531791;
float gpsLng = -117.036576;

// ─── Ultrasónico compartido ───────────────────────────
struct DatosUS { float dist1, dist2; int contador; };
DatosUS datosUS = {0, 0, 0};
SemaphoreHandle_t xMutex;

float ventana1[VENTANA] = {0}, ventana2[VENTANA] = {0};
int   indice1 = 0, indice2 = 0;
bool  llena1 = false, llena2 = false;
bool  enPaso1 = false, enPaso2 = false;
int   contador = 0;

MPU6050 mpu;

// ─── NTP / Timestamp ──────────────────────────────────
void sincronizarNTP() {
  configTime(-7 * 3600, 0, "pool.ntp.org", "time.nist.gov"); // UTC-7 Tijuana
  Serial.print("[NTP] Sincronizando");
  struct tm t;
  while (!getLocalTime(&t)) { delay(500); Serial.print("."); }
  Serial.println(" OK");
}

// ─── Timestamp legible ────────────────────────────────
String obtenerTimestamp() {
  struct tm t;
  if (!getLocalTime(&t)) return "sin-hora";
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &t);
  return String(buf);
}

// ─── WiFi / Firebase ──────────────────────────────────
void conectarWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("[WiFi] Conectando");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.printf("\n[WiFi] Conectado: %s\n", WiFi.localIP().toString().c_str());
}

bool firebasePut(const char* path, String& body) {
  if (WiFi.status() != WL_CONNECTED) { conectarWiFi(); return false; }
  HTTPClient http;
  http.begin(String(FIREBASE_HOST) + path);
  http.addHeader("Content-Type", "application/json");
  int code = http.PUT(body);
  http.end();
  return code == 200;
}

bool firebasePost(const char* path, String& body) {
  if (WiFi.status() != WL_CONNECTED) { conectarWiFi(); return false; }
  HTTPClient http;
  http.begin(String(FIREBASE_HOST) + path);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  http.end();
  return code == 200;
}

// ─── Publicaciones ────────────────────────────────────
void publicarData(int personas, float lat, float lng) {
  StaticJsonDocument<256> doc;
  doc["busId"]       = BUS_ID;
  doc["latitude"]    = lat;
  doc["longitude"]   = lng;
  doc["speed"]       = SPEED_CONSTANTE;
  doc["status"]      = "normal";
  doc["passengers"]  = personas;
  doc["lastUpdated"] = obtenerTimestamp();

  String body; serializeJson(doc, body);
  if (firebasePut("/active_buses/data.json", body))
    Serial.printf("[FB] Data OK → pasajeros:%d lat:%.6f lng:%.6f\n", personas, lat, lng);
  else
    Serial.println("[FB] Error publicando data");
}

void publicarBache(float lat, float lng, float intensidad) {
  StaticJsonDocument<128> doc;
  doc["lat"]        = lat;
  doc["lng"]        = lng;
  doc["tipo"]       = "bache";
  doc["intensidad"] = intensidad;
  doc["ts"]         = obtenerTimestamp();

  String body; serializeJson(doc, body);
  if (firebasePost("/reportes.json", body))
    Serial.printf("[FB] Bache! intensidad:%.2fg lat:%.6f lng:%.6f\n", intensidad, lat, lng);
  else
    Serial.println("[FB] Error reportando bache");
}

// ─── Ultrasónico ──────────────────────────────────────
float medirDistancia(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duracion = pulseIn(echoPin, HIGH, 30000);
  if (duracion == 0) return -1;
  return duracion * 0.0343 / 2.0;
}

void agregarLectura(float* ventana, int &indice, bool &llena, float valor) {
  ventana[indice] = valor;
  indice = (indice + 1) % VENTANA;
  if (indice == 0) llena = true;
}

bool detectarPaso(float* ventana, int indice, bool llena) {
  if (!llena) return false;
  int fuera = 0;
  for (int i = 1; i <= LECTURAS_FUERA; i++) {
    float val = ventana[(indice - i + VENTANA) % VENTANA];
    if (val < 0 || val > DISTANCIA_REF) fuera++;
  }
  return fuera >= LECTURAS_FUERA;
}

// ─── Tarea ultrasónico (Core 1) ───────────────────────
void tareaUltrasonico(void* pvParameters) {
  TickType_t xLastWakeTime = xTaskGetTickCount();
  for (;;) {
    float dist1 = medirDistancia(TRIGGER1, ECHO1);
    float dist2 = medirDistancia(TRIGGER2, ECHO2);

    agregarLectura(ventana1, indice1, llena1, dist1);
    agregarLectura(ventana2, indice2, llena2, dist2);

    bool paso1 = detectarPaso(ventana1, indice1, llena1);
    bool paso2 = detectarPaso(ventana2, indice2, llena2);

    if (paso1 && !enPaso1) { contador++; enPaso1 = true;
      Serial.printf("[US] >> Entrada! Contador: %d\n", contador);
    } else if (!paso1) enPaso1 = false;

    if (paso2 && !enPaso2) { if (contador > 0) contador--; enPaso2 = true;
      Serial.printf("[US] << Salida! Contador: %d\n", contador);
    } else if (!paso2) enPaso2 = false;

    if (xSemaphoreTake(xMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
      datosUS = {dist1, dist2, contador};
      xSemaphoreGive(xMutex);
    }
    vTaskDelayUntil(&xLastWakeTime, pdMS_TO_TICKS(100));
  }
}

// ─── Setup ────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  randomSeed(analogRead(0));

  Wire.begin(SDA_PIN, SCL_PIN);
  mpu.initialize();
  Serial.println(mpu.testConnection() ? "[IMU] MPU6050 OK" : "[IMU] ERROR");

  pinMode(TRIGGER1, OUTPUT); pinMode(ECHO1, INPUT);
  pinMode(TRIGGER2, OUTPUT); pinMode(ECHO2, INPUT);

  conectarWiFi();

  xMutex = xSemaphoreCreateMutex();
  xTaskCreatePinnedToCore(tareaUltrasonico, "Ultrasonico", 4096, NULL, 2, NULL, 1);

  Serial.println("[SYS] Sistema iniciado");
}

// ─── Loop (Core 0) ────────────────────────────────────
void loop() {
  // ── GPS ───────────────────────────────────────────
  while (Serial2.available()) gps.encode(Serial2.read());
  if (gps.location.isValid()) {
    gpsLat = gps.location.lat();
    gpsLng = gps.location.lng();
  }

  // ── IMU ───────────────────────────────────────────
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  float aX = ax / 16384.0, aY = ay / 16384.0, aZ = az / 16384.0;
  float promedioAcel = (fabs(aX) + fabs(aY) + fabs(aZ)) / 3.0;

  // ── Detección de bache ────────────────────────────
  static bool enBache = false;
  if (promedioAcel > UMBRAL_BACHE && !enBache) {
    enBache = true;
    publicarBache(gpsLat, gpsLng, promedioAcel);
  } else if (promedioAcel <= UMBRAL_BACHE) {
    enBache = false;
  }

  // ── Publicar data periódicamente ──────────────────
  static unsigned long ultimoEnvio = 0;
  if (millis() - ultimoEnvio >= INTERVALO_DATA_MS) {
    ultimoEnvio = millis();
    DatosUS us;
    if (xSemaphoreTake(xMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
      us = datosUS; xSemaphoreGive(xMutex);
    }
    publicarData(us.contador, gpsLat, gpsLng);
  }

  vTaskDelay(pdMS_TO_TICKS(50));
}