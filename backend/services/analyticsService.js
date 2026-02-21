const vehicleModel = require("../models/vehicleModel");
const fuelModel = require("../models/fuelModel");
const maintenanceModel = require("../models/maintenanceModel");
const tripModel = require("../models/tripModel");

const getFleetSummary = async () => {
  const vehicles = await vehicleModel.getAllVehicles();
  const totalVehicles = vehicles.length;
  const onTrip = vehicles.filter(v => v.status === "OnTrip").length;
  const inShop = vehicles.filter(v => v.status === "InShop").length;
  const utilizationRate = totalVehicles ? (onTrip / totalVehicles) * 100 : 0;

  let totalFuelCost = 0;
  for (const v of vehicles) {
    const fuels = await fuelModel.getFuelByVehicle(v.id);
    totalFuelCost += fuels.reduce((sum, f) => sum + f.cost, 0);
  }

  return { totalVehicles, onTrip, inShop, utilizationRate, totalFuelCost };
};

const getVehicleROI = async (vehicleId) => {
  const vehicle = await vehicleModel.getVehicleById(vehicleId);
  const trips = await tripModel.getAllTrips();
  const vehicleTrips = trips.filter(t => t.vehicle_id === vehicleId);

  const totalRevenue = vehicleTrips.reduce((sum, t) => sum + t.revenue, 0);
  const fuelLogs = await fuelModel.getFuelByVehicle(vehicleId);
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const maintLogs = await maintenanceModel.getMaintenanceByVehicle(vehicleId);
  const totalMaintCost = maintLogs.reduce((sum, m) => sum + m.cost, 0);

  const roi = (totalRevenue - (totalFuelCost + totalMaintCost)) / vehicle.acquisition_cost;
  return { vehicle, roi };
};

module.exports = { getFleetSummary, getVehicleROI };