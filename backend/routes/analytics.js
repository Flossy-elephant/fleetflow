const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/fleet-summary", analyticsController.fleetSummary);
router.get("/vehicle-roi/:vehicleId", analyticsController.vehicleROI);

module.exports = router;