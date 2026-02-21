const vehicleModel = require("../models/vehicleModel");

const recommendVehicle = async (cargoWeight) => {
  const vehicles = await vehicleModel.getAllVehicles();
  const available = vehicles.filter(v => v.status === "Available");
  if (!available.length) throw new Error("No available vehicles.");

  const scored = available.map(v => {
    const capacityScore = 100 - ((v.max_capacity - cargoWeight) / v.max_capacity) * 100;
    const finalScore = 0.4 * capacityScore + 0.3 * 50 + 0.3 * 50; // placeholders
    return { vehicle: v.name, score: finalScore, reason: "Best capacity match and cost" };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
};

module.exports = { recommendVehicle };