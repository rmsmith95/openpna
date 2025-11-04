#include <SoftwareSerial.h>

#define SERVO_PIN 9
#define SERVO_ID  1
#define SERVO_BAUD 1000000

SoftwareSerial servoSerial(SERVO_PIN, SERVO_PIN, true);  // half-duplex inverted serial

// ========== Data Structures ==========
struct ServoInfo {
  uint16_t position;
  uint16_t speed;
  uint16_t load;
  uint8_t voltageRaw;
  uint8_t temperature;
  uint8_t moving;
  uint8_t current;
};

// ========== Helpers ==========
uint8_t calcChecksum(uint8_t *packet, uint8_t len) {
  uint8_t sum = 0;
  for (uint8_t i = 2; i < len - 1; i++) sum += packet[i];
  return ~sum;
}

void sendPacket(uint8_t *packet, uint8_t len) {
  pinMode(SERVO_PIN, OUTPUT);
  servoSerial.write(packet, len);
  servoSerial.flush();
  delayMicroseconds(200);
  pinMode(SERVO_PIN, INPUT);
}

// Read raw data from servo
bool readData(uint8_t startAddr, uint8_t length, uint8_t *outBuf) {
  uint8_t pkt[8] = { 0xFF, 0xFF, SERVO_ID, 0x04, 0x02, startAddr, length, 0x00 };
  pkt[7] = calcChecksum(pkt, 8);
  sendPacket(pkt, 8);

  unsigned long timeout = millis() + 50;
  while (!servoSerial.available() && millis() < timeout);

  uint8_t buf[32];
  int n = servoSerial.readBytes(buf, sizeof(buf));

  if (n >= 6 && buf[0] == 0xFF && buf[1] == 0xFF && buf[2] == SERVO_ID && buf[4] == 0x00) {
    memcpy(outBuf, buf + 5, length);
    return true;
  }
  return false;
}

// ========== Move Servo ==========
void moveServo(uint16_t pos) {
  uint8_t pkt[13] = {
    0xFF, 0xFF, SERVO_ID, 0x09, 0x03, 0x2A,
    (uint8_t)(pos & 0xFF), (uint8_t)(pos >> 8),
    0x00, 0x01,   // speed = 256
    0x00, 0x00,   // acceleration = 0
    0x00
  };
  pkt[12] = calcChecksum(pkt, 13);
  sendPacket(pkt, 13);
}

void setGripperPosition(uint16_t pos) {
  if (pos > 4095) pos = 4095;
  moveServo(pos);
}

// ========== Servo Info ==========
bool getServoInfo(ServoInfo &info) {
  // Read from address 0x2A (Voltage) to 0x3E (Current) – 0x15 bytes
  uint8_t data[0x15];
  if (!readData(0x2A, sizeof(data), data)) return false;

  info.voltageRaw  = data[0];                 // 0x2A
  info.temperature = data[1];                 // 0x2B
  info.position    = data[0x0E - 0x2A] | (data[0x0F - 0x2A] << 8);  // 0x3A–0x3B
  info.speed       = data[0x0C - 0x2A] | (data[0x0D - 0x2A] << 8);  // 0x38–0x39
  info.load        = data[0x0A - 0x2A] | (data[0x0B - 0x2A] << 8);  // 0x36–0x37
  info.current     = data[0x14 - 0x2A];       // 0x3E
  info.moving      = data[0x10 - 0x2A];       // 0x3A approx
  return true;
}

// ========== Serial Commands ==========
void handleSerialCommand() {
  if (!Serial.available()) return;
  String input = Serial.readStringUntil('\n');
  input.trim();

  if (input.startsWith("move")) {
    uint16_t pos = input.substring(4).toInt();
    setGripperPosition(pos);
    Serial.print("Moving to position ");
    Serial.println(pos);

  } else if (input.equals("info")) {
    ServoInfo info;
    if (getServoInfo(info)) {
      Serial.println("---- Servo Info ----");
      Serial.print("Position: "); Serial.println(info.position);
      Serial.print("Speed: "); Serial.println(info.speed);
      Serial.print("Load: "); Serial.println(info.load);
      Serial.print("Voltage: "); Serial.print(info.voltageRaw / 10.0); Serial.println(" V");
      Serial.print("Temperature: "); Serial.print(info.temperature); Serial.println(" °C");
      Serial.print("Current: "); Serial.print(info.current); Serial.println(" units");
      Serial.print("Moving: "); Serial.println(info.moving ? "Yes" : "No");
      Serial.println("--------------------");
    } else {
      Serial.println("Failed to read servo info.");
    }

  } else {
    Serial.println("Commands: move <pos>, info");
  }
}

// ========== Setup / Loop ==========
void setup() {
  Serial.begin(115200);  // pc to arduino comms
  servoSerial.begin(SERVO_BAUD);  // arduino to servo comms
  delay(500);
  Serial.println("ST3020 Gripper ready.");
  Serial.println("Commands: move <0–4095>, info");
}

void loop() {
  handleSerialCommand();
}
