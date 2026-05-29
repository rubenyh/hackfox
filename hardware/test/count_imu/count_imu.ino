#include <Wire.h>
#include <MPU6050.h>

// ─── Pines ───────────────────────────────────────────
#define TRIGGER1 23
#define ECHO1    18
#define TRIGGER2  4
#define ECHO2     2
#define SDA_PIN  21
#define SCL_PIN  22

// ─── Parámetros conteo ────────────────────────────────
#define VENTANA        5
#define LECTURAS_FUERA 2
#define DISTANCIA_REF  50.0

// ─── Struct datos ultrasónico compartidos ─────────────
struct DatosUS {
  float dist1;
  float dist2;
  int   contador;
};
DatosUS datosUS = {0, 0, 0};

SemaphoreHandle_t xMutex;

// ─── Variables locales tarea ultrasónico ──────────────
float ventana1[VENTANA] = {0};
float ventana2[VENTANA] = {0};
int   indice1 = 0, indice2 = 0;
bool  llena1  = false, llena2 = false;
bool  enPaso1 = false, enPaso2 = false;
int   contador = 0;

MPU6050 mpu;

// ─────────────────────────────────────────────────────
//  Funciones ultrasónico
// ─────────────────────────────────────────────────────
float medirDistancia(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
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
  int fueraDeRango = 0;
  for (int i = 1; i <= LECTURAS_FUERA; i++) {
    int pos = (indice - i + VENTANA) % VENTANA;
    float val = ventana[pos];
    if (val < 0 || val > DISTANCIA_REF) fueraDeRango++;
  }
  return fueraDeRango >= LECTURAS_FUERA;
}

// ─────────────────────────────────────────────────────
//  TAREA — Ultrasónico (10 Hz, Core 1)
// ─────────────────────────────────────────────────────
void tareaUltrasonico(void* pvParameters) {
  TickType_t xLastWakeTime = xTaskGetTickCount();
  const TickType_t xPeriod = pdMS_TO_TICKS(100); // 10 Hz

  for (;;) {
    float dist1 = medirDistancia(TRIGGER1, ECHO1);
    float dist2 = medirDistancia(TRIGGER2, ECHO2);

    agregarLectura(ventana1, indice1, llena1, dist1);
    agregarLectura(ventana2, indice2, llena2, dist2);

    bool paso1 = detectarPaso(ventana1, indice1, llena1);
    bool paso2 = detectarPaso(ventana2, indice2, llena2);

    if (paso1 && !enPaso1) {
      contador++;
      enPaso1 = true;
    } else if (!paso1) {
      enPaso1 = false;
    }

    if (paso2 && !enPaso2) {
      if (contador > 0) contador--;
      enPaso2 = true;
    } else if (!paso2) {
      enPaso2 = false;
    }

    // Pasar datos al struct compartido con mutex
    if (xSemaphoreTake(xMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
      datosUS.dist1    = dist1;
      datosUS.dist2    = dist2;
      datosUS.contador = contador;
      xSemaphoreGive(xMutex);
    }

    vTaskDelayUntil(&xLastWakeTime, xPeriod);
  }
}

// ─────────────────────────────────────────────────────
//  Setup
// ─────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);

  mpu.initialize();
  if (mpu.testConnection())
    Serial.println("[IMU] MPU6050 OK");
  else
    Serial.println("[IMU] ERROR: MPU6050 no detectado");

  pinMode(TRIGGER1, OUTPUT); pinMode(ECHO1, INPUT);
  pinMode(TRIGGER2, OUTPUT); pinMode(ECHO2, INPUT);

  xMutex = xSemaphoreCreateMutex();

  xTaskCreatePinnedToCore(tareaUltrasonico, "Ultrasonico", 4096, NULL, 2, NULL, 1);

  Serial.println("Sistema iniciado");
}

// ─────────────────────────────────────────────────────
//  Loop — IMU a 20 Hz en Core 0
// ─────────────────────────────────────────────────────
void loop() {
  // ── Leer IMU ──────────────────────────────────────
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float aX = ax / 16384.0, aY = ay / 16384.0, aZ = az / 16384.0;
  float gX = gx / 131.0,   gY = gy / 131.0,   gZ = gz / 131.0;
  float temp = mpu.getTemperature() / 340.0 + 36.53;

  // ── Leer datos ultrasónico con mutex ──────────────
  DatosUS us;
  if (xSemaphoreTake(xMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
    us = datosUS;
    xSemaphoreGive(xMutex);
  }

  // ── Imprimir todo ─────────────────────────────────
  Serial.printf("[IMU] Ac: X:%5.2f Y:%5.2f Z:%5.2f g | Gy: X:%6.2f Y:%6.2f Z:%6.2f °/s | T:%.1f°C\n",
                aX, aY, aZ, gX, gY, gZ, temp);
  Serial.printf("[US]  S1:%5.1fcm | S2:%5.1fcm | Personas: %d\n",
                us.dist1, us.dist2, us.contador);

  vTaskDelay(pdMS_TO_TICKS(50)); // 20 Hz
}