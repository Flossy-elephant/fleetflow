const pool = require("../db/db");

const getAllVehicles = async () => {
  const result = await pool.query("SELECT * FROM vehicles");
  return result.rows;
};

const getVehicleById = async (id) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  return result.rows[0];
};

const addVehicle = async ({ name, license_plate, max_capacity, odometer, status, acquisition_cost }) => {
  const result = await pool.query(
    "INSERT INTO vehicles (name, license_plate, max_capacity, odometer, status, acquisition_cost) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [name, license_plate, max_capacity, odometer, status, acquisition_cost]
  );
  return result.rows[0];
};

module.exports = { getAllVehicles, getVehicleById, addVehicle };