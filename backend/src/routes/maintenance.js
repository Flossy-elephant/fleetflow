const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { vehicleId, description, cost, date } = req.body;
    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    if (vehicle.status === "ON_TRIP") return res.status(400).json({ error: "Cannot log maintenance for a vehicle currently on a trip" });

    const [log] = await prisma.$transaction([
      prisma.maintenanceLog.create({ data: { vehicleId: Number(vehicleId), description, cost: Number(cost), date: date ? new Date(date) : new Date(), status: "OPEN" }, include: { vehicle: true } }),
      prisma.vehicle.update({ where: { id: Number(vehicleId) }, data: { status: "IN_SHOP" } }),
    ]);

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/close", authenticate, async (req, res) => {
  try {
    const log = await prisma.maintenanceLog.findUnique({ where: { id: Number(req.params.id) } });
    if (!log) return res.status(404).json({ error: "Log not found" });

    const [updated] = await prisma.$transaction([
      prisma.maintenanceLog.update({ where: { id: log.id }, data: { status: "CLOSED", closedAt: new Date() }, include: { vehicle: true } }),
      prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: "AVAILABLE" } }),
    ]);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
