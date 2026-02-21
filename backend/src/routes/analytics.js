const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analytics/fleet-summary
router.get("/fleet-summary", authenticate, async (req, res) => {
  try {
    const [vehicles, drivers, trips, fuelLogs, maintenance] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.driver.findMany(),
      prisma.trip.findMany({ where: { status: { in: ["DISPATCHED", "COMPLETED"] } } }),
      prisma.fuelLog.findMany(),
      prisma.maintenanceLog.findMany(),
    ]);

    const activeFleet = vehicles.filter((v) => v.status === "ON_TRIP").length;
    const inShop = vehicles.filter((v) => v.status === "IN_SHOP").length;
    const available = vehicles.filter((v) => v.status === "AVAILABLE").length;
    const utilization = vehicles.length > 0 ? Math.round((activeFleet / vehicles.length) * 100) : 0;
    const pendingTrips = trips.filter((t) => t.status === "DISPATCHED").length;
    const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
    const totalMaintCost = maintenance.reduce((s, m) => s + m.cost, 0);
    const totalRevenue = trips.filter((t) => t.status === "COMPLETED").reduce((s, t) => s + t.revenue, 0);
    const completedTrips = trips.filter((t) => t.status === "COMPLETED");
    const totalKm = completedTrips.reduce((s, t) => s + (t.distanceKm || 0), 0);
    const avgCostPerKm = totalKm > 0 ? Math.round(((totalFuelCost + totalMaintCost) / totalKm) * 100) / 100 : 0;

    res.json({
      vehicles: { total: vehicles.length, active: activeFleet, inShop, available, retired: vehicles.filter((v) => v.status === "RETIRED").length },
      drivers: { total: drivers.length, onDuty: drivers.filter((d) => d.status === "ON_DUTY").length, onTrip: drivers.filter((d) => d.status === "ON_TRIP").length, suspended: drivers.filter((d) => d.status === "SUSPENDED").length },
      trips: { total: trips.length, active: pendingTrips, completed: completedTrips.length },
      utilization,
      financial: { totalRevenue, totalFuelCost, totalMaintCost, totalOperationalCost: totalFuelCost + totalMaintCost, avgCostPerKm },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/vehicle-roi/:vehicleId
router.get("/vehicle-roi/:vehicleId", authenticate, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(req.params.vehicleId) },
      include: { trips: { where: { status: "COMPLETED" } }, fuelLogs: true, maintenance: true },
    });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const totalRevenue = vehicle.trips.reduce((s, t) => s + t.revenue, 0);
    const totalFuel = vehicle.fuelLogs.reduce((s, f) => s + f.cost, 0);
    const totalMaint = vehicle.maintenance.reduce((s, m) => s + m.cost, 0);
    const totalCost = totalFuel + totalMaint;
    const roi = vehicle.acquisitionCost > 0 ? Math.round(((totalRevenue - totalCost) / vehicle.acquisitionCost) * 100 * 10) / 10 : 0;
    const totalKm = vehicle.trips.reduce((s, t) => s + (t.distanceKm || 0), 0);
    const kmPerL = vehicle.fuelLogs.length > 0 ? Math.round((totalKm / vehicle.fuelLogs.reduce((s, f) => s + f.liters, 0)) * 10) / 10 : 0;

    res.json({ vehicle: { id: vehicle.id, name: vehicle.name, licensePlate: vehicle.licensePlate }, totalRevenue, totalFuel, totalMaint, totalCost, profit: totalRevenue - totalCost, roi, totalKm, kmPerL, tripsCompleted: vehicle.trips.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/fuel-efficiency
router.get("/fuel-efficiency", authenticate, async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ include: { fuelLogs: true, trips: { where: { status: "COMPLETED" } } } });
    const data = vehicles.map((v) => {
      const totalKm = v.trips.reduce((s, t) => s + (t.distanceKm || 0), 0);
      const totalLiters = v.fuelLogs.reduce((s, f) => s + f.liters, 0);
      const totalFuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
      return { id: v.id, name: v.name, type: v.type, totalKm, totalLiters, kmPerL: totalLiters > 0 ? Math.round((totalKm / totalLiters) * 10) / 10 : 0, totalFuelCost };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/monthly-summary
router.get("/monthly-summary", authenticate, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({ where: { status: "COMPLETED", completedAt: { not: null } }, include: { vehicle: true } });
    const fuelLogs = await prisma.fuelLog.findMany();
    const maintenance = await prisma.maintenanceLog.findMany();

    const byMonth = {};
    trips.forEach((t) => {
      const key = t.completedAt.toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { month: key, revenue: 0, trips: 0, fuelCost: 0, maintCost: 0 };
      byMonth[key].revenue += t.revenue;
      byMonth[key].trips += 1;
    });
    fuelLogs.forEach((f) => {
      const key = f.date.toISOString().slice(0, 7);
      if (byMonth[key]) byMonth[key].fuelCost += f.cost;
    });
    maintenance.forEach((m) => {
      const key = m.date.toISOString().slice(0, 7);
      if (byMonth[key]) byMonth[key].maintCost += m.cost;
    });

    const result = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
