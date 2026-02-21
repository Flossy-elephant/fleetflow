const pool = require("../db/db");

const getAllVehicles = async (status = null) => {
  let query = "SELECT * FROM vehicles";
  if (status) {
    query += " WHERE status = $1";
  }
  query += " ORDER BY id DESC";
  
  const result = status ? await pool.query(query, [status]) : await pool.query(query);
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

const updateVehicleById = async (id, { name, license_plate, max_capacity, odometer, status, acquisition_cost }) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) { fields.push(`name=$${paramCount++}`); values.push(name); }
  if (license_plate !== undefined) { fields.push(`license_plate=$${paramCount++}`); values.push(license_plate); }
  if (max_capacity !== undefined) { fields.push(`max_capacity=$${paramCount++}`); values.push(max_capacity); }
  if (odometer !== undefined) { fields.push(`odometer=$${paramCount++}`); values.push(odometer); }
  if (status !== undefined) { fields.push(`status=$${paramCount++}`); values.push(status); }
  if (acquisition_cost !== undefined) { fields.push(`acquisition_cost=$${paramCount++}`); values.push(acquisition_cost); }

  if (fields.length === 0) return getVehicleById(id);

  values.push(id);
  const result = await pool.query(
    `UPDATE vehicles SET ${fields.join(", ")} WHERE id=$${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

const updateVehicleStatus = async (vehicleId, status) => {
  const result = await pool.query(
    "UPDATE vehicles SET status=$1 WHERE id=$2 RETURNING *",
    [status, vehicleId]
  );
  return result.rows[0];
};

const recommendVehicles = async (cargoWeight, distance) => {
  const query = `
    SELECT * FROM vehicles 
    WHERE status='Available' 
    AND max_capacity >= $1
    ORDER BY max_capacity ASC
    LIMIT 5
  `;
  const result = await pool.query(query, [cargoWeight || 0]);
  return result.rows;
};

module.exports = { getAllVehicles, getVehicleById, addVehicle, updateVehicleById, updateVehicleStatus, recommendVehicles };