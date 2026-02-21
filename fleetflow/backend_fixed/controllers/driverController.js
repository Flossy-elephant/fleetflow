const rankingService = require("../services/rankingService");
const driverModel = require("../models/driverModel");

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await driverModel.getAllDrivers();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addDriver = async (req, res) => {
  try {
    const driver = await driverModel.addDriver(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
    const pool = require("../db/db");
    const result = await pool.query(
      `UPDATE drivers SET ${setClause} WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const driverRankings = async (req, res) => {
  try {
    const rankings = await rankingService.getDriverRankings();
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllDrivers, addDriver, updateDriver, driverRankings };
