const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/trips
router.get("/", authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const trips = await prisma.trip.findMany({
      where,
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/trips/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: Number(req.params.id) },
      include: { vehicle: true, driver: true },
    });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trips - Create & Dispatch
router.post("/", authenticate, async (req, res) => {
  try {
    const { vehicleId, driverId, cargoWeight, origin, destination, distanceKm, revenue, notes, scheduledAt } = req.body;

    // Fetch vehicle and driver
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } }),
      prisma.driver.findUnique({ where: { id: Number(driverId) } }),
    ]);

    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    if (!driver) return res.status(404).json({ error: "Driver not found" });

    // VALIDATION RULES
    if (vehicle.status !== "AVAILABLE") return res.status(400).json({ error: `Dispatch blocked: Vehicle "${vehicle.name}" is currently ${vehicle.status.replace("_", " ")}.` });
    if (driver.status !== "ON_DUTY") return res.status(400).json({ error: `Dispatch blocked: Driver "${driver.name}" is currently ${driver.status.replace("_", " ")}.` });
    if (cargoWeight > vehicle.maxCapacity) return res.status(400).json({ error: `Dispatch blocked: Vehicle overloaded by ${Math.round(cargoWeight - vehicle.maxCapacity)}kg. Max capacity is ${vehicle.maxCapacity}kg.` });

    const today = new Date();
    if (new Date(driver.licenseExpiry) < today) return res.status(400).json({ error: `Dispatch blocked: Driver license expired on ${new Date(driver.licenseExpiry).toLocaleDateString()}.` });

    // All checks passed — create trip and update statuses
    const [trip] = await prisma.$transaction([
      prisma.trip.create({
        data: {
          vehicleId: Number(vehicleId),
          driverId: Number(driverId),
          cargoWeight: Number(cargoWeight),
          distanceKm: Number(distanceKm) || 0,
          revenue: Number(revenue) || 0,
          status: "DISPATCHED",
          origin,
          destination,
          notes,
          startOdometer: vehicle.odometer,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        },
        include: { vehicle: true, driver: true },
      }),
      prisma.vehicle.update({ where: { id: Number(vehicleId) }, data: { status: "ON_TRIP" } }),
      prisma.driver.update({ where: { id: Number(driverId) }, data: { status: "ON_TRIP" } }),
    ]);

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trips/:id/complete
router.put("/:id/complete", authenticate, async (req, res) => {
  try {
    const { endOdometer, revenue, distanceKm } = req.body;
    const trip = await prisma.trip.findUnique({ where: { id: Number(req.params.id) }, include: { vehicle: true, driver: true } });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.status !== "DISPATCHED") return res.status(400).json({ error: "Only dispatched trips can be completed" });

    const results = await prisma.$transaction([
      prisma.trip.update({
        where: { id: trip.id },
        data: { status: "COMPLETED", endOdometer: Number(endOdometer) || null, completedAt: new Date(), revenue: Number(revenue) || trip.revenue, distanceKm: Number(distanceKm) || trip.distanceKm },
        include: { vehicle: true, driver: true },
      }),
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE", odometer: endOdometer ? Number(endOdometer) : trip.vehicle.odometer } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: "ON_DUTY", totalTrips: { increment: 1 }, completedTrips: { increment: 1 }, onTimeTrips: { increment: 1 } } }),
    ]);

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trips/:id/cancel
router.put("/:id/cancel", authenticate, async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(req.params.id) } });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (!["DRAFT", "DISPATCHED"].includes(trip.status)) return res.status(400).json({ error: "Cannot cancel this trip" });

    const updates = [prisma.trip.update({ where: { id: trip.id }, data: { status: "CANCELLED" } })];
    if (trip.status === "DISPATCHED") {
      updates.push(prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } }));
      updates.push(prisma.driver.update({ where: { id: trip.driverId }, data: { status: "ON_DUTY", totalTrips: { increment: 1 } } }));
    }

    await prisma.$transaction(updates);
    res.json({ message: "Trip cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
