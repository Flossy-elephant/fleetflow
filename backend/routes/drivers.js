const express = require("express");
const router = express.Router();
const driverController = require("../controllers/drivercontroller");
router.get("/rankings", driverController.driverRankings);

module.exports = router;