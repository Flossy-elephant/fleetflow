const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const where = vehicleId ? { vehicleId: Number(vehicleId) } : {};
    const logs = await prisma.fuelLog.findMany({ where, include: { vehicle: true }, orderBy: { date: "desc" } });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { vehicleId, liters, cost, date, odometer } = req.body;
    const log = await prisma.fuelLog.create({
      data: { vehicleId: Number(vehicleId), liters: Number(liters), cost: Number(cost), pricePerL: liters ? Number(cost) / Number(liters) : null, date: date ? new Date(date) : new Date(), odometer: odometer ? Number(odometer) : null },
      include: { vehicle: true },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
