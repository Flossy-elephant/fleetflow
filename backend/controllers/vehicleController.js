const vehicleService = require("../services/vehicleService");

const getVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getVehicles();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.addVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getVehicles, addVehicle };