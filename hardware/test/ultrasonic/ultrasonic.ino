// ESP32 - Sensor Ultrasónico HC-SR04
// Trigger: GPIO 23 | Echo: GPIO 22

#define TRIGGER_PIN 23
#define ECHO_PIN    22

void setup() {
  Serial.begin(115200);
  pinMode(TRIGGER_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("Sensor ultrasónico listo...");
}

float medirDistancia() {
  digitalWrite(TRIGGER_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIGGER_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER_PIN, LOW);

  long duracion = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duracion == 0) return -1; 

  float distancia = duracion * 0.0343 / 2.0;
  return distancia;
}

void loop() {
  float distancia = medirDistancia();

  if (distancia < 0) {
    Serial.println("Fuera de rango o sin objeto detectado");
  } else {
    Serial.print("Distancia: ");
    Serial.print(distancia, 1);
    Serial.println(" cm");
  }

  delay(50);
}