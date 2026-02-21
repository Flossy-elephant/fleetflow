const pool = require("../db/db");

const getAllDrivers = async () => {
  const result = await pool.query("SELECT * FROM drivers");
  return result.rows;
};

const getDriverById = async (id) => {
  const result = await pool.query("SELECT * FROM drivers WHERE id = $1", [id]);
  return result.rows[0];
};

const addDriver = async ({ name, license_expiry, status, safety_score = 100 }) => {
  const result = await pool.query(
    "INSERT INTO drivers (name, license_expiry, status, safety_score) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, license_expiry, status, safety_score]
  );
  return result.rows[0];
};

module.exports = { getAllDrivers, getDriverById, addDriver };