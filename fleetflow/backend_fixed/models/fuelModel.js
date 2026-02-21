const pool = require("../db/db");

const getAllFuel = async () => {
  const res = await pool.query(
    `SELECT f.*, v.name as vehicle_name, v.license_plate
     FROM fuel_log f
     LEFT JOIN vehicles v ON f.vehicle_id = v.id
     ORDER BY f.date DESC`
  );
  return res.rows;
};

const addFuelLog = async ({ vehicle_id, liters, cost, date }) => {
  const res = await pool.query(
    "INSERT INTO fuel_log (vehicle_id, liters, cost, date) VALUES ($1,$2,$3,$4) RETURNING *",
    [vehicle_id, liters, cost, date || new Date()]
  );
  return res.rows[0];
};

const getFuelByVehicle = async (vehicle_id) => {
  const res = await pool.query("SELECT * FROM fuel_log WHERE vehicle_id=$1", [vehicle_id]);
  return res.rows;
};

module.exports = { getAllFuel, addFuelLog, getFuelByVehicle };
