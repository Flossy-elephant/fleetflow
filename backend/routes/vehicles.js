const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehiclecontroller");

router.get("/", vehicleController.getVehicles);
router.post("/", vehicleController.addVehicle);

module.exports = router;