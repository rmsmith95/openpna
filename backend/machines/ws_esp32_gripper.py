import time
from fastapi import APIRouter
import requests
import time

# --- CONFIG ---
PORT = "COM4"          # Change to your Arduino’s serial port (e.g. "/dev/ttyUSB0" on Linux/Mac)
router = APIRouter()


class ST3020Servo:
    def __init__(self, ssid="ESP32_DEV", password="12345678", ip="192.168.4.1"):
        self.ssid = ssid
        self.password = password
        self.ip = ip
    
    def send_command(self, cmd_type, cmd_value, extra1=0, extra2=0):
        """Send a command to the ESP32 via HTTP GET."""
        url = f"http://{self.ip}/cmd"
        params = {
            "arg0": cmd_type,
            "arg1": cmd_value,
            "arg2": extra1,
            "arg3": extra2
        }
        try:
            r = requests.get(url, params=params, timeout=2)
            r.raise_for_status()
            return r.text
        except requests.RequestException as e:
            print("Error sending command:", e)
            return None
    
    def select_id(self, servo_index):
        """Select active servo by index (arg0=0)."""
        return self.send_command(0, servo_index)
    
    def set_mode(self, mode):
        """Set mode: 'servo' or 'motor'"""
        mode_case = 12 if mode == "servo" else 13  # 12=servo mode, 13=motor mode
        return self.send_command(1, mode_case)
    
    def set_position_max(self):
        """Move servo to max position (case 5)"""
        return self.send_command(1, 5)
    
    def set_position_min(self):
        """Move servo to min position (case 6)"""
        return self.send_command(1, 6)
    
    def set_speed(self, target_speed):
        """
        Set speed to an exact target by stepping +100 or -100.
        Unit is steps per second, max 4000
        """
        # Read current speed from status feedback
        status = self.get_status()
        if status is None:
            print("Could not read speed")
            return
        
        # Extract speed number from status text
        # Example status contains: "Speed Set:1500"
        try:
            for line in status.splitlines():
                if "Speed Set:" in line:
                    current = int(line.split("Speed Set:")[1])
                    break
            else:
                print("Speed not found in feedback")
                return
        except:
            print("Failed to parse current speed")
            return
        
        print(f"Current Speed: {current}, Target Speed: {target_speed}")

        # Decide direction
        if target_speed > current:
            case = 7   # increase
        else:
            case = 8   # decrease
        
        # Step until we reach target
        while current != target_speed:
            self.send_command(1, case)
            time.sleep(0.1)
            current += 100 if case == 7 else -100
            
            # clamp to target
            if (case == 7 and current > target_speed) or (case == 8 and current < target_speed):
                current = target_speed

        print(f"Speed set to {target_speed}")

    
    def change_speed(self, increase=True):
        """Increase or decrease speed (case 7/8)"""
        case = 7 if increase else 8
        return self.send_command(1, case)
    
    def set_servo_id(self, new_id):
        """Set new servo ID (case 16)"""
        return self.send_command(1, 16, new_id)
    
    def get_status(self):
        """Get current servo status from /readSTS"""
        url = f"http://{self.ip}/readSTS"
        try:
            r = requests.get(url, timeout=2)
            r.raise_for_status()
            return r.text
        except requests.RequestException as e:
            print("Error reading status:", e)
            return None


# --- SETUP SERVO ---
servo = ST3020Servo()
# Select first servo
servo.select_id(1)
# Set mode to motor
servo.set_mode("motor")


@router.post("/gripper_open")
def open(time=2, speed=None):
    """Open the gripper for t seconds at speed (max 4000)"""
    servo.set_speed(speed)
    servo.set_position_max()
    time.sleep(time)


@router.post("/gripper_close")
def close(time=2, speed=None):
    """Close the gripper for t seconds at speed (max 4000)"""
    servo.set_speed(speed)
    servo.set_position_min()
    time.sleep(time)


@router.get("/get_status")
def get_status():
    """Read feedback"""
    status = servo.get_status()
    print("Servo Status:\n", status)
    return status
