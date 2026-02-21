const express = require("express");
const router = express.Router();
const fuelController = require("../controllers/fuelController");

router.get("/", fuelController.getAllFuel);
router.post("/", fuelController.addFuelLog);

module.exports = router;
