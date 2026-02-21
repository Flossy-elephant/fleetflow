const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

router.get("/recommend/smart", vehicleController.recommendVehicles);
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicle);
router.post("/", vehicleController.addVehicle);
router.put("/:id", vehicleController.updateVehicle);

module.exports = router;