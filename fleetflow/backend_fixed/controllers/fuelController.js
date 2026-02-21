const fuelModel = require("../models/fuelModel");

const getAllFuel = async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    const logs = vehicle_id
      ? await fuelModel.getFuelByVehicle(vehicle_id)
      : await fuelModel.getAllFuel();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addFuelLog = async (req, res) => {
  try {
    const log = await fuelModel.addFuelLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAllFuel, addFuelLog };
