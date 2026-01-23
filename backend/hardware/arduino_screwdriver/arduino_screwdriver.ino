// ===== L298N pins =====
const int ENA = 10;
const int IN1 = 9;
const int IN2 = 8;

// ===== Direction enum =====
enum ScrewDirection {
  CLOCKWISE,
  REVERSE,
  STOP
};

void setup() {
  Serial.begin(115200);

  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);

  stopMotor();

  Serial.println("Ready. Commands:");
  Serial.println("S CW <speed> <duration>");
  Serial.println("S CCW <speed> <duration>");
  Serial.println("S STOP");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    handleSerialCommand(cmd);
  }
}

// ===== Serial command handler =====
void handleSerialCommand(String cmd) {
  if (!cmd.startsWith("S")) {
    Serial.println("Invalid command");
    return;
  }

  // STOP command
  if (cmd.indexOf("STOP") > 0) {
    screw(STOP, 0, 0);
    Serial.println("Stopped");
    return;
  }

  // Parse: S DIR SPEED DURATION
  char dirStr[4];
  int speed;
  unsigned long duration;

  int parsed = sscanf(cmd.c_str(), "S %3s %d %lu", dirStr, &speed, &duration);
  if (parsed != 3) {
    Serial.println("Parse error");
    return;
  }

  if (strcmp(dirStr, "CW") == 0) {
    screw(CLOCKWISE, speed, duration);
    Serial.println("CW done");
  }
  else if (strcmp(dirStr, "CCW") == 0) {
    screw(REVERSE, speed, duration);
    Serial.println("CCW done");
  }
  else {
    Serial.println("Unknown direction");
  }
}

// ===== Motor control =====
void screw(ScrewDirection dir, int speed, unsigned long duration) {
  speed = constrain(speed, 0, 255);

  switch (dir) {
    case CLOCKWISE:
      digitalWrite(IN1, HIGH);
      digitalWrite(IN2, LOW);
      analogWrite(ENA, speed);
      delay(duration);
      stopMotor();
      break;

    case REVERSE:
      digitalWrite(IN1, LOW);
      digitalWrite(IN2, HIGH);
      analogWrite(ENA, speed);
      delay(duration);
      stopMotor();
      break;

    case STOP:
      stopMotor();
      break;
  }
}

void stopMotor() {
  analogWrite(ENA, 0);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}
