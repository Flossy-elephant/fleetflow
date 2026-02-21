const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

router.get("/", driverController.getAllDrivers);
router.post("/", driverController.addDriver);
router.put("/:id", driverController.updateDriver);
router.get("/rankings", driverController.driverRankings);

module.exports = router;
