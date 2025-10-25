#include <Wire.h>
#include <Adafruit_PWMServoDriver.h> // Include Adafruit PCA9685 library

// TCA9548A and PCA9685 settings
#define TCA9548A_ADDRESS 0x70     // Default I2C address for TCA9548A
#define PCA9685_ADDRESS 0x40      // Default I2C address for PCA9685
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);

// CNC Shield pin definitions
#define X_STEP_PIN 2
#define X_DIR_PIN 5
#define Y_STEP_PIN 3
#define Y_DIR_PIN 6
#define Z_STEP_PIN 4
#define Z_DIR_PIN 7
#define ENABLE_PIN 8

// PCA9685 channels
#define GRIPPER_CHANNEL 0
#define motorDirectionPin1 8
#define motorDirectionPin2 9

// TCA channels
#define GRIPPER_TCA_CHANNEL 0
#define SCREWDRIVER_TCA_CHANNEL 0
#define ENCODER_TCA_CHANNEL 2

// Stepper motor settings
#define STEPS_PER_REV 200
#define MM_PER_REV 5.0

// Gripper pulse widths
#define GRIPPER_OPEN_PULSE 450
#define GRIPPER_CLOSE_PULSE 100
#define GRIPPER_RELEASE_PULSE 0

// Function to select a TCA channel
void tcaSelect(uint8_t channel) {
  if (channel > 7) return;
  Wire.beginTransmission(TCA9548A_ADDRESS);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

// Convert mm to steps
int mmToSteps(float mm) {
  return (int)((mm / MM_PER_REV) * STEPS_PER_REV);
}

// CNC axis control function
void controlAxis(String cmd, int dirPin, int stepPin) {
  int dir = cmd.substring(1, 2).toInt(); // Extract direction
  float mm = cmd.substring(2, cmd.indexOf('S')).toFloat(); // Extract mm distance
  int speed = cmd.substring(cmd.indexOf('S') + 1).toInt(); // Extract speed in mm/s

  digitalWrite(dirPin, dir); // Set direction
  int steps = mmToSteps(mm); // Convert mm to steps
  float stepDelay = 1000000.0 / (speed * (STEPS_PER_REV / MM_PER_REV)); // Delay in microseconds per step
  Serial.println(steps);

  for (int i = 0; i < steps; i++) {
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(stepDelay / 2);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(stepDelay / 2);

    // if (i % 20 == 0) { // Read encoder every 10 steps
    //   readEncoder();
    // }
  }
  Serial.println("Move Complete");
}

void controlGripper(String cmd) {
  if (cmd == "GRIPPER_RELEASE") {
    // Set the gripper to a neutral position
    pwm.setPWM(GRIPPER_CHANNEL, 0, GRIPPER_RELEASE_PULSE);
    Serial.println("Gripper released");
  } else if (cmd == "GRIPPER_OPEN") {
    // Set the gripper to open position
    pwm.setPWM(GRIPPER_CHANNEL, 0, GRIPPER_OPEN_PULSE);
    Serial.println("Gripper opened");
  } else if (cmd == "GRIPPER_CLOSE") {
    // Set the gripper to closed position
    pwm.setPWM(GRIPPER_CHANNEL, 0, GRIPPER_CLOSE_PULSE);
    Serial.println("Gripper closed");
  } else if (cmd.startsWith("GRIPPER_PULSE")) {
    // Extract the pulse width from the command
    int pulse = cmd.substring(13).toInt(); // Extract pulse after "GRIPPER_PULSE "
    pwm.setPWM(GRIPPER_CHANNEL, 0, pulse);
    Serial.print("Gripper set to pulse width: ");
    Serial.println(pulse);
  } else if (cmd.startsWith("GRIPPER")) {
    // Extract the distance in mm (after "GRIPPER" command)
    float mm = cmd.substring(7).toFloat();  // Extract mm distance

    // Map the mm distance to a pulse width for the servo
    int pulse = map(mm, 0, 20, GRIPPER_CLOSE_PULSE, GRIPPER_OPEN_PULSE);  // Map the mm to pulse range
    // Set the PWM for the gripper
    pwm.setPWM(GRIPPER_CHANNEL, 0, pulse);

    Serial.print("Gripper set to: ");
    Serial.print(mm);
    Serial.print(" mm, Pulse: ");
    Serial.println(pulse);
  } else {
    // If the command is invalid, print an error message
    Serial.println("Invalid command - Gripper released");
    pwm.setPWM(GRIPPER_CHANNEL, 0, GRIPPER_RELEASE_PULSE);
  }
}

// Screwdriver control function
void controlScrewdriver(String cmd) {
  tcaSelect(SCREWDRIVER_TCA_CHANNEL);
  if (cmd == "SCREWDRIVER_FORWARD") {
    pwm.setPWM(motorDirectionPin1, 0, 2048);
    pwm.setPWM(motorDirectionPin2, 0, 0);
    Serial.println("Screwdriver forward");
  } else if (cmd == "SCREWDRIVER_REVERSE") {
    pwm.setPWM(motorDirectionPin1, 0, 0);
    pwm.setPWM(motorDirectionPin2, 0, 2048);
    Serial.println("Screwdriver reverse");
  } else if (cmd == "SCREWDRIVER_STOP") {
    pwm.setPWM(motorDirectionPin1, 0, 0);
    pwm.setPWM(motorDirectionPin2, 0, 0);
    Serial.println("Screwdriver stopped");
  }
}

// Encoder reading function
void readEncoder() {
  tcaSelect(ENCODER_TCA_CHANNEL);
  Wire.requestFrom(0x36, 2); // Request 2 bytes from AS5600
  if (Wire.available() == 2) {
    int highByte = Wire.read();
    int lowByte = Wire.read();
    int position = (highByte << 8) | lowByte;
    Serial.print("Encoder position: ");
    Serial.println(position);
  }
  else {
    Serial.print("AS5600 wire not available");
  }
}

void setup() {
  Serial.begin(9600);
  Wire.begin();

  // Initialize CNC pins
  pinMode(X_STEP_PIN, OUTPUT);
  pinMode(X_DIR_PIN, OUTPUT);
  pinMode(Y_STEP_PIN, OUTPUT);
  pinMode(Y_DIR_PIN, OUTPUT);
  pinMode(Z_STEP_PIN, OUTPUT);
  pinMode(Z_DIR_PIN, OUTPUT);
  pinMode(ENABLE_PIN, OUTPUT);
  digitalWrite(ENABLE_PIN, HIGH); // Disable motors at startup

  // Initialize PCA9685
  tcaSelect(GRIPPER_TCA_CHANNEL);
  pwm.begin();
  pwm.setPWMFreq(60);

  Serial.println("Setup complete");

  controlScrewdriver("SCREWDRIVER_FORWARD");
  delay(1000);
  controlScrewdriver("SCREWDRIVER_STOP");
  controlGripper("GRIPPER_OPEN");
  delay(1000);
  controlGripper("GRIPPER_CLOSE");
  delay(1000);
  controlGripper("GRIPPER_RELEASE");
  delay(1000);

  // digitalWrite(ENABLE_PIN, LOW);
  // controlAxis("Z110S5", Z_DIR_PIN, Z_STEP_PIN);
  // delay(1000);
  // controlAxis("Z010S5", Z_DIR_PIN, Z_STEP_PIN);
  // delay(1000);
  // digitalWrite(ENABLE_PIN, HIGH);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');

    if (command.startsWith("X")) {
      controlAxis(command, X_DIR_PIN, X_STEP_PIN);
    } else if (command.startsWith("Y")) {
      controlAxis(command, Y_DIR_PIN, Y_STEP_PIN);
    } else if (command.startsWith("Z")) {
      controlAxis(command, Z_DIR_PIN, Z_STEP_PIN);
    } else if (command.startsWith("GRIPPER")) {
      controlGripper(command);
    } else if (command.startsWith("SCREWDRIVER")) {
      controlScrewdriver(command);
    } else if (command == "READ_ENCODER") {
      readEncoder();
    } else if (command == "ENABLE") {
      digitalWrite(ENABLE_PIN, LOW);
    } else if (command == "DISABLE") {
      digitalWrite(ENABLE_PIN, HIGH);
    }
  }
}
