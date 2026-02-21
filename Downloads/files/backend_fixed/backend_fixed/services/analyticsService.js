const vehicleModel = require("../models/vehicleModel");
const fuelModel = require("../models/fuelModel");
const maintenanceModel = require("../models/maintenanceModel");
const tripModel = require("../models/tripModel");
const driverModel = require("../models/driverModel");

const getFleetSummary = async () => {
  const vehicles = await vehicleModel.getAllVehicles();
  const drivers = await driverModel.getAllDrivers();
  const trips = await tripModel.getAllTrips();

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === "OnTrip").length;
  const inShop = vehicles.filter(v => v.status === "InShop").length;
  const available = vehicles.filter(v => v.status === "Available").length;
  const utilization = totalVehicles ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  const completedTrips = trips.filter(t => t.status === "Completed");
  const activeTrips = trips.filter(t => t.status === "Dispatched");
  const totalRevenue = completedTrips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
  const totalKm = completedTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);

  let totalFuelCost = 0;
  let totalMaintCost = 0;

  for (const v of vehicles) {
    const fuels = await fuelModel.getFuelByVehicle(v.id);
    totalFuelCost += fuels.reduce((sum, f) => sum + Number(f.cost || 0), 0);
    const maints = await maintenanceModel.getMaintenanceByVehicle(v.id);
    totalMaintCost += maints.reduce((sum, m) => sum + Number(m.cost || 0), 0);
  }

  const totalOperationalCost = totalFuelCost + totalMaintCost;
  const avgCostPerKm = totalKm > 0 ? Math.round((totalOperationalCost / totalKm) * 100) / 100 : 0;

  return {
    vehicles: { total: totalVehicles, active: activeVehicles, inShop, available, retired: 0 },
    drivers: {
      total: drivers.length,
      onDuty: drivers.filter(d => d.status === "OnDuty").length,
      onTrip: drivers.filter(d => d.status === "OnTrip").length,
      suspended: drivers.filter(d => d.status === "Suspended").length,
    },
    trips: { total: trips.length, active: activeTrips.length, completed: completedTrips.length },
    utilization,
    financial: { totalRevenue, totalFuelCost, totalMaintCost, totalOperationalCost, avgCostPerKm },
  };
};

const getVehicleROI = async (vehicleId) => {
  const vehicle = await vehicleModel.getVehicleById(vehicleId);
  if (!vehicle) throw new Error("Vehicle not found");

  const trips = await tripModel.getAllTrips();
  const vehicleTrips = trips.filter(t => String(t.vehicle_id) === String(vehicleId) && t.status === "Completed");
  const totalRevenue = vehicleTrips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
  const totalKm = vehicleTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);

  const fuelLogs = await fuelModel.getFuelByVehicle(vehicleId);
  const totalFuel = fuelLogs.reduce((sum, f) => sum + Number(f.cost || 0), 0);
  const totalLiters = fuelLogs.reduce((sum, f) => sum + Number(f.liters || 0), 0);

  const maintLogs = await maintenanceModel.getMaintenanceByVehicle(vehicleId);
  const totalMaint = maintLogs.reduce((sum, m) => sum + Number(m.cost || 0), 0);

  const totalCost = totalFuel + totalMaint;
  const profit = totalRevenue - totalCost;
  const roi = vehicle.acquisition_cost > 0 ? Math.round((profit / vehicle.acquisition_cost) * 100 * 10) / 10 : 0;
  const kmPerL = totalLiters > 0 ? Math.round((totalKm / totalLiters) * 10) / 10 : 0;

  return {
    vehicle: { id: vehicle.id, name: vehicle.name, licensePlate: vehicle.license_plate },
    totalRevenue, totalFuel, totalMaint, totalCost, profit, roi,
    totalKm, kmPerL, tripsCompleted: vehicleTrips.length,
  };
};

const getFuelEfficiency = async () => {
  const vehicles = await vehicleModel.getAllVehicles();
  const trips = await tripModel.getAllTrips();

  const data = [];
  for (const v of vehicles) {
    const fuelLogs = await fuelModel.getFuelByVehicle(v.id);
    const vTrips = trips.filter(t => String(t.vehicle_id) === String(v.id) && t.status === "Completed");
    const totalKm = vTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);
    const totalLiters = fuelLogs.reduce((sum, f) => sum + Number(f.liters || 0), 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.cost || 0), 0);
    data.push({
      id: v.id, name: v.name, type: v.status,
      totalKm, totalLiters, totalFuelCost,
      kmPerL: totalLiters > 0 ? Math.round((totalKm / totalLiters) * 10) / 10 : 0,
    });
  }
  return data;
};

const getMonthlySummary = async () => {
  const trips = await tripModel.getAllTrips();
  const completedTrips = trips.filter(t => t.status === "Completed" && t.completed_at);
  const byMonth = {};

  completedTrips.forEach(t => {
    const key = new Date(t.completed_at).toISOString().slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { month: key, revenue: 0, trips: 0, fuelCost: 0, maintCost: 0 };
    byMonth[key].revenue += Number(t.revenue || 0);
    byMonth[key].trips += 1;
  });

  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
};

module.exports = { getFleetSummary, getVehicleROI, getFuelEfficiency, getMonthlySummary };
