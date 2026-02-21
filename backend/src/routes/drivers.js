const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/drivers
router.get("/", authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const drivers = await prisma.driver.findMany({
      where,
      include: { _count: { select: { trips: true } } },
      orderBy: { name: "asc" },
    });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/rankings
router.get("/rankings", authenticate, async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({ where: { totalTrips: { gt: 0 } } });

    const ranked = drivers.map((d) => {
      const completionRate = d.totalTrips > 0 ? (d.completedTrips / d.totalTrips) * 100 : 0;
      const onTimeRate = d.completedTrips > 0 ? (d.onTimeTrips / d.completedTrips) * 100 : 0;
      const violationPenalty = d.violations * 5;
      const score = completionRate * 0.4 + d.safetyScore * 0.3 + onTimeRate * 0.2 - violationPenalty * 0.1;
      return { ...d, completionRate: Math.round(completionRate), onTimeRate: Math.round(onTimeRate), rankingScore: Math.round(score) };
    });

    ranked.sort((a, b) => b.rankingScore - a.rankingScore);
    ranked.forEach((d, i) => (d.rank = i + 1));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: Number(req.params.id) },
      include: { trips: { include: { vehicle: true }, orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drivers
router.post("/", authenticate, async (req, res) => {
  try {
    const driver = await prisma.driver.create({ data: { ...req.body, licenseExpiry: new Date(req.body.licenseExpiry) } });
    res.status(201).json(driver);
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ error: "License number already exists" });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drivers/:id
router.put("/:id", authenticate, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.licenseExpiry) data.licenseExpiry = new Date(data.licenseExpiry);
    const driver = await prisma.driver.update({ where: { id: Number(req.params.id) }, data });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
