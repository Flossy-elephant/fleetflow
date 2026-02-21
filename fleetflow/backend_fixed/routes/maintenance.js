const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");

router.get("/", maintenanceController.getAllMaintenance);
router.post("/", maintenanceController.addMaintenance);
router.post("/:id/close", maintenanceController.closeMaintenance);

module.exports = router;
