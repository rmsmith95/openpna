import serial
import time

# --- CONFIG ---
PORT = "COM3"          # Change to your Arduino’s serial port (e.g. "/dev/ttyUSB0" on Linux/Mac)
BAUD = 115200
TIMEOUT = 1            # seconds

# --- SETUP SERIAL ---
ser = serial.Serial(PORT, BAUD, timeout=TIMEOUT)
time.sleep(2)  # wait for Arduino to reset

def send_command(cmd: str):
    """Send command string and return Arduino reply."""
    ser.write((cmd + "\n").encode())
    time.sleep(0.1)
    output = []
    while ser.in_waiting:
        line = ser.readline().decode(errors="ignore").strip()
        if line:
            output.append(line)
    return "\n".join(output)

def move_gripper(position: int):
    """Move gripper to position 0–4095."""
    print(f"Moving gripper to {position}...")
    response = send_command(f"move {position}")
    print(response)

def get_info():
    """Query servo telemetry."""
    print("Requesting servo info...")
    response = send_command("info")
    print(response)
    return response

get_info()

# # --- MAIN EXAMPLE ---
# if __name__ == "__main__":
#     print("Connected to Arduino.\n")

#     # Move to middle position
#     move_gripper(2048)
#     time.sleep(2)

#     # Get full servo status
#     get_info()

#     # Move back to start
#     move_gripper(1024)
#     time.sleep(2)

#     get_info()

#     ser.close()
#     print("\nDone.")
