const pool = require("../db/db");

const getAllVehicles = async () => {
  const res = await pool.query("SELECT * FROM vehicles");
  return res.rows;
};

const getVehicleById = async (id) => {
  const res = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  return res.rows[0];
};

const addVehicle = async ({ name, license_plate, max_capacity, odometer, status, acquisition_cost }) => {
  const res = await pool.query(
    "INSERT INTO vehicles (name, license_plate, max_capacity, odometer, status, acquisition_cost) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [name, license_plate, max_capacity, odometer, status, acquisition_cost]
  );
  return res.rows[0];
};

const updateVehicleStatus = async (id, status) => {
  const res = await pool.query("UPDATE vehicles SET status=$1 WHERE id=$2 RETURNING *", [status, id]);
  return res.rows[0];
};

module.exports = { getAllVehicles, getVehicleById, addVehicle, updateVehicleStatus };