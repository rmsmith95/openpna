export async function screwCW(duration, speed) {
  await fetch("/api/arduino/screw_clockwise", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duration, speed }),
  });
}

export async function screwCCW(duration, speed) {
  await fetch("/api/arduino/screw_reverse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duration, speed }),
  });
}

export async function screwdriverStop() {
  await fetch("/api/arduino/screwdriver_stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ }),
  });
}
