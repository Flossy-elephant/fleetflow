const vehicleService = require("../services/vehicleService");
const { convertFrontendStatus } = require("../utils/statusConverter");

const getVehicles = async (req, res) => {
  try {
    let { status } = req.query;
    if (status) status = convertFrontendStatus(status);
    const vehicles = await vehicleService.getVehicles(status);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicle(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
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

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const recommendVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.recommendVehicles(req.query);
    res.json(vehicles.length > 0 ? vehicles[0] : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getVehicles, getVehicle, addVehicle, updateVehicle, recommendVehicles };