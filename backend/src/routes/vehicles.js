const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/vehicles
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { _count: { select: { trips: true, fuelLogs: true, maintenance: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(req.params.id) },
      include: { trips: { include: { driver: true }, orderBy: { createdAt: "desc" }, take: 10 }, maintenance: { orderBy: { date: "desc" }, take: 5 }, fuelLogs: { orderBy: { date: "desc" }, take: 10 } },
    });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles
router.post("/", authenticate, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.create({ data: req.body });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ error: "License plate already exists" });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id
router.put("/:id", authenticate, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.vehicle.update({ where: { id: Number(req.params.id) }, data: { status: "RETIRED" } });
    res.json({ message: "Vehicle retired successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/recommend?cargo=450&distance=120
router.get("/recommend/smart", authenticate, async (req, res) => {
  try {
    const { cargo, distance } = req.query;
    const cargoWeight = parseFloat(cargo) || 0;

    const available = await prisma.vehicle.findMany({
      where: { status: "AVAILABLE", maxCapacity: { gte: cargoWeight } },
      include: { fuelLogs: true, maintenance: { where: { status: "CLOSED" } } },
    });

    if (!available.length) return res.status(404).json({ error: "No available vehicles can handle this cargo weight" });

    const scored = available.map((v) => {
      // Capacity Match Score (0-100)
      const capacityMatch = 100 - ((v.maxCapacity - cargoWeight) / v.maxCapacity) * 100;

      // Cost Efficiency Score
      const totalFuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
      const totalMaintCost = v.maintenance.reduce((s, m) => s + m.cost, 0);
      const costPerKm = v.odometer > 0 ? (totalFuelCost + totalMaintCost) / v.odometer : 999;
      const costScore = Math.max(0, 100 - costPerKm * 10);

      // Maintenance Health (days since last service)
      const lastMaint = v.maintenance[0];
      const daysSinceService = lastMaint ? Math.floor((Date.now() - new Date(lastMaint.closedAt || lastMaint.date)) / 86400000) : 999;
      const maintScore = Math.max(0, 100 - daysSinceService * 0.5);

      const finalScore = capacityMatch * 0.4 + costScore * 0.3 + maintScore * 0.3;
      return { vehicle: v, score: Math.round(finalScore), capacityMatch: Math.round(capacityMatch), costScore: Math.round(costScore), maintScore: Math.round(maintScore) };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    res.json({
      recommended: best.vehicle,
      score: best.score,
      reason: `Best capacity match (${best.capacityMatch}%), cost efficiency (${best.costScore}%), and maintenance health (${best.maintScore}%)`,
      alternatives: scored.slice(1, 3).map((s) => ({ vehicle: s.vehicle, score: s.score })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
