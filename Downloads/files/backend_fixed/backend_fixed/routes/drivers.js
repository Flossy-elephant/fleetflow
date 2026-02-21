const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

router.get("/rankings", driverController.driverRankings);
router.get("/", driverController.getAllDrivers);
router.get("/:id", driverController.getDriver);
router.post("/", driverController.addDriver);
router.put("/:id", driverController.updateDriver);

module.exports = router;
