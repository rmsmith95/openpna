#include <WiFi.h>

// ================= WIFI =================
const char* ssid = "Galaxy S24fe";
const char* pass = "eibz1588";

WiFiServer server(8000);

// ================= L298N =================
const int ENA = 5;     // PWM
const int IN1 = 2;
const int IN2 = 3;

// ================= ACS712 =================
const int CURRENT_1 = A0;
const int CURRENT_2 = A1;

const float VREF = 5.0;
const int ADC_RES = 1023;
const float ZERO_CURRENT = 2.5;   // Calibrate this
const float SENSITIVITY = 0.185;  // ACS712-05A

const int CURRENT_SAMPLES = 20;

// ================= MOTOR =================
void forward(int speed) {
  speed = constrain(speed, 0, 255);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, speed);
}

void reverse(int speed) {
  speed = constrain(speed, 0, 255);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, speed);
}

void stopMotor() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
}

// ================= CURRENT =================
float readCurrent(int pin) {
  long sum = 0;
  for (int i = 0; i < CURRENT_SAMPLES; i++) {
    sum += analogRead(pin);
    delayMicroseconds(200);
  }

  float adc = sum / (float)CURRENT_SAMPLES;
  float voltage = adc * (VREF / ADC_RES);
  return (voltage - ZERO_CURRENT) / SENSITIVITY;
}

// ================= SETUP =================
void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);

  stopMotor();

  Serial.begin(9600);
  while (!Serial);

  Serial.println("🔌 Connecting to WiFi...");
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\n✅ WiFi connected!");
  Serial.print("📡 IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();
  Serial.println("🚀 TCP Server started on port 8000");
}

// ================= LOOP =================
void loop() {
  // ---- TCP control ----
  WiFiClient client = server.available();
  if (client) {
    String cmd = client.readStringUntil('\n');
    cmd.trim();

    Serial.println("📥 Command: " + cmd);

    if (cmd.startsWith("FWD")) {
      int speed = cmd.substring(3).toInt();
      forward(speed);
      client.println("OK FWD");
    }
    else if (cmd.startsWith("REV")) {
      int speed = cmd.substring(3).toInt();
      reverse(speed);
      client.println("OK REV");
    }
    else if (cmd == "STOP") {
      stopMotor();
      client.println("OK STOP");
    }
    else {
      client.println("ERR UNKNOWN");
    }

    client.stop();
  }

  // ---- Current monitoring ----
  float current1 = readCurrent(CURRENT_1);
  float current2 = readCurrent(CURRENT_2);

  Serial.print("⚡ I1: ");
  Serial.print(current1, 3);
  Serial.print(" A | I2: ");
  Serial.print(current2, 3);
  Serial.println(" A");

  delay(500);
}
