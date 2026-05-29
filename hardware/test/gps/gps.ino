#include <TinyGPS++.h>

#define RX2 16
#define TX2 17

TinyGPSPlus gps;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RX2, TX2); // NEO-7M por defecto usa 9600
  Serial.println("Esperando señal GPS...");
}

void loop() {
  // Alimentar el parser con los bytes que llegan
  while (Serial2.available()) {
    gps.encode(Serial2.read());
  }

  // Cada 2 segundos imprimir info
  static unsigned long ultimo = 0;
  if (millis() - ultimo >= 2000) {
    ultimo = millis();
    imprimirDatos();
  }
}

void imprimirDatos() {
  Serial.println("---- GPS ----");

  if (gps.location.isValid()) {
    Serial.print("Latitud : "); Serial.println(gps.location.lat(), 6);
    Serial.print("Longitud: "); Serial.println(gps.location.lng(), 6);
  } else {
    Serial.println("Ubicacion: sin fix aun...");
  }

  if (gps.altitude.isValid()) {
    Serial.print("Altitud : "); Serial.print(gps.altitude.meters()); Serial.println(" m");
  }

  if (gps.speed.isValid()) {
    Serial.print("Velocidad: "); Serial.print(gps.speed.kmph()); Serial.println(" km/h");
  }

  if (gps.satellites.isValid()) {
    Serial.print("Satelites: "); Serial.println(gps.satellites.value());
  }

  if (gps.date.isValid() && gps.time.isValid()) {
    Serial.printf("Fecha/Hora UTC: %02d/%02d/%04d %02d:%02d:%02d\n",
      gps.date.day(), gps.date.month(), gps.date.year(),
      gps.time.hour(), gps.time.minute(), gps.time.second());
  }

  if (gps.charsProcessed() < 10) {
    Serial.println("ADVERTENCIA: No llegan datos del GPS, revisa el cableado");
  }
}