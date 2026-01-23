export async function screwIn(duration, speed) {
  await fetch("/api/screwdriver/screwIn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duration, speed }),
  });
}

export async function screwOut(duration, speed) {
  await fetch("/api/screwdriver/screwOut", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duration, speed }),
  });
}

export async function stop() {
  await fetch("/api/screwdriver/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ }),
  });
}
