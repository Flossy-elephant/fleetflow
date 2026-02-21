const pool = require("../db/db");

const addFuelLog = async ({ vehicle_id, liters, cost, date }) => {
  const res = await pool.query(
    "INSERT INTO fuel_log (vehicle_id, liters, cost, date) VALUES ($1,$2,$3,$4) RETURNING *",
    [vehicle_id, liters, cost, date]
  );
  return res.rows[0];
};

const getFuelByVehicle = async (vehicle_id) => {
  const res = await pool.query("SELECT * FROM fuel_log WHERE vehicle_id=$1", [vehicle_id]);
  return res.rows;
};

module.exports = { addFuelLog, getFuelByVehicle };