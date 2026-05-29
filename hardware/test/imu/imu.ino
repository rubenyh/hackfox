#include <Wire.h>
#include <MPU6050.h>

#define SDA_PIN 21
#define SCL_PIN 22

MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);
  
  Serial.println("Iniciando MPU6050...");
  mpu.initialize();

  if (mpu.testConnection()) {
    Serial.println("MPU6050 conectado correctamente ✓");
  } else {
    Serial.println("ERROR: No se detecta el MPU6050, revisa el cableado");
    while (true); // Detener si no hay conexión
  }
}

void loop() {
  int16_t ax, ay, az;  // Acelerómetro crudo
  int16_t gx, gy, gz;  // Giroscopio crudo
  
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Convertir a unidades reales
  float accelX = ax / 16384.0;  // ±2g por defecto → 16384 LSB/g
  float accelY = ay / 16384.0;
  float accelZ = az / 16384.0;

  float gyroX = gx / 131.0;    // ±250°/s por defecto → 131 LSB/°/s
  float gyroY = gy / 131.0;
  float gyroZ = gz / 131.0;

  // Temperatura interna del chip
  float temp = mpu.getTemperature() / 340.0 + 36.53;

  Serial.println((accelX+accelY+accelY)/3);

  delay(50);
}