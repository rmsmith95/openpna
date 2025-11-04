#include <SoftwareSerial.h>

#define SERVO_PIN 9   // single-wire signal pin
#define SERVO_ID  1   // default ID

// Half-duplex SoftwareSerial (inverted logic for ST3020)
SoftwareSerial servoSerial(SERVO_PIN, SERVO_PIN, true);

uint8_t calcChecksum(uint8_t *packet, uint8_t len) {
  uint8_t sum = 0;
  for (uint8_t i = 2; i < len - 1; i++) sum += packet[i];
  return ~sum;
}

void sendPacket(uint8_t *packet, uint8_t len) {
  pinMode(SERVO_PIN, OUTPUT);    // take control of line
  servoSerial.write(packet, len);
  servoSerial.flush();
  delayMicroseconds(200);        // let last bits finish
  pinMode(SERVO_PIN, INPUT);     // release line for servo
}

void moveServo(uint16_t pos) {
  // 13-byte packet: move servo to pos (0–4095), speed=256
  uint8_t pkt[13] = {
    0xFF, 0xFF, SERVO_ID, 0x09, 0x03, 0x2A,
    (uint8_t)(pos & 0xFF), (uint8_t)(pos >> 8),
    0x00, 0x01,   // speed = 256
    0x00, 0x00,   // acceleration = 0
    0x00          // checksum placeholder
  };
  pkt[12] = calcChecksum(pkt, 13);
  sendPacket(pkt, 13);
}

void setup() {
  servoSerial.begin(1000000); // ST3020 default baud = 1 Mbps
  delay(500);
}

void loop() {
  moveServo(2048);  // middle position
  delay(2000);

  moveServo(1024);  // left
  delay(2000);

  moveServo(3072);  // right
  delay(2000);
}
