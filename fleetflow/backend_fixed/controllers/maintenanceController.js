const maintenanceModel = require("../models/maintenanceModel");
const vehicleModel = require("../models/vehicleModel");
const pool = require("../db/db");

const getAllMaintenance = async (req, res) => {
  try {
    const logs = await maintenanceModel.getAllMaintenance();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMaintenance = async (req, res) => {
  try {
    const { vehicle_id, cost, date, description } = req.body;
    const vehicle = await vehicleModel.getVehicleById(vehicle_id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    if (vehicle.status === "OnTrip") return res.status(400).json({ error: "Cannot log maintenance: vehicle is currently on a trip" });

    const log = await maintenanceModel.addMaintenance({ vehicle_id, cost, date, description });
    await pool.query("UPDATE vehicles SET status='InShop' WHERE id=$1", [vehicle_id]);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const closeMaintenance = async (req, res) => {
  try {
    const log = await maintenanceModel.closeMaintenance(req.params.id);
    if (!log) return res.status(404).json({ error: "Maintenance log not found" });
    await pool.query("UPDATE vehicles SET status='Available' WHERE id=$1", [log.vehicle_id]);
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAllMaintenance, addMaintenance, closeMaintenance };
