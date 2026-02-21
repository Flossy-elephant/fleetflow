const pool = require("../db/db");

const addMaintenance = async ({ vehicle_id, cost, date, description }) => {
  const res = await pool.query(
    "INSERT INTO maintenance (vehicle_id, cost, date, description) VALUES ($1,$2,$3,$4) RETURNING *",
    [vehicle_id, cost, date, description]
  );
  return res.rows[0];
};

const getMaintenanceByVehicle = async (vehicle_id) => {
  const res = await pool.query("SELECT * FROM maintenance WHERE vehicle_id=$1", [vehicle_id]);
  return res.rows;
};

module.exports = { addMaintenance, getMaintenanceByVehicle };