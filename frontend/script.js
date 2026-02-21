const backendURL = "http://localhost:5000";

// ---------- Vehicles ----------
async function loadVehicles() {
  try {
    const res = await fetch(`${backendURL}/vehicles`);
    const vehicles = await res.json();

    const container = document.getElementById("vehiclesList");
    container.innerHTML = "";

    vehicles.forEach(v => {
      const div = document.createElement("div");
      div.className = "p-3 bg-gray-900 rounded-md flex justify-between items-center fade-in";
      div.innerHTML = `
        <div>
          <strong>${v.name}</strong> — ${v.license_plate}<br/>
          Capacity: ${v.max_capacity}kg, Odometer: ${v.odometer} km
        </div>
        <span class="status-pill status-${v.status.replace(/\s/g,'_')}">${v.status}</span>
      `;
      container.appendChild(div);
    });
  } catch (err) { console.error(err); }
}

// ---------- Drivers Ranking ----------
async function loadDriversRanking() {
  try {
    const res = await fetch(`${backendURL}/drivers/rankings`);
    const drivers = await res.json();

    const container = document.getElementById("driversRanking");
    container.innerHTML = "";

    drivers.forEach((d, index) => {
      const div = document.createElement("div");
      div.className = "p-3 bg-gray-900 rounded-md flex justify-between items-center fade-in";
      div.innerHTML = `
        <div>
          <strong>Rank ${index + 1}: ${d.name}</strong><br/>
          Completion Rate: ${(d.completedTrips/d.totalTrips*100).toFixed(1)}%, Safety Score: ${d.safety_score}, Score: ${d.rankingScore.toFixed(1)}
        </div>
        <span class="status-pill status-ON_DUTY">Driver</span>
      `;
      container.appendChild(div);
    });
  } catch (err) { console.error(err); }
}

// ---------- Trips ----------
async function loadTrips() {
  try {
    const res = await fetch(`${backendURL}/trips`);
    const trips = await res.json();

    const container = document.getElementById("tripsList");
    container.innerHTML = "";

    trips.forEach(t => {
      const div = document.createElement("div");
      div.className = "p-3 bg-gray-900 rounded-md flex justify-between items-center fade-in";
      div.innerHTML = `
        <div>
          Trip #${t.id} — Vehicle: ${t.vehicle_id}, Driver: ${t.driver_id}<br/>
          Cargo: ${t.cargo_weight}kg, Distance: ${t.distance_km}km, Revenue: $${t.revenue.toFixed(2)}
        </div>
        <span class="status-pill status-${t.status.replace(/\s/g,'_')}">${t.status}</span>
      `;
      container.appendChild(div);
    });
  } catch (err) { console.error(err); }
}

// ---------- Fleet Analytics ----------
async function loadFleetSummary() {
  try {
    const res = await fetch(`${backendURL}/analytics/fleet-summary`);
    const data = await res.json();
    document.getElementById("fleetSummary").textContent = JSON.stringify(data, null, 2);
  } catch (err) { console.error(err); }
}

// ---------- Smart Dispatch ----------
document.getElementById("getRecommendation").addEventListener("click", async () => {
  const cargo = document.getElementById("cargoWeight").value;
  const distance = document.getElementById("distanceKm").value;

  try {
    const res = await fetch(`${backendURL}/recommend-vehicle?cargo=${cargo}&distance=${distance}`);
    const data = await res.json();
    document.getElementById("dispatchResult").textContent = JSON.stringify(data, null, 2);
  } catch (err) { console.error(err); }
});

// ---------- Load All ----------
window.addEventListener("DOMContentLoaded", () => {
  loadVehicles();
  loadDriversRanking();
  loadTrips();
  loadFleetSummary();
});