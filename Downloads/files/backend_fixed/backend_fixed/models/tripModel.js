const pool = require("../db/db");

const getAllTrips = async (status = null) => {
  let query = `SELECT t.*, v.name as vehicle_name, d.name as driver_name
     FROM trips t
     LEFT JOIN vehicles v ON t.vehicle_id = v.id
     LEFT JOIN drivers d ON t.driver_id = d.id`;
  
  if (status) {
    query += ` WHERE t.status = $1`;
  }
  
  query += ` ORDER BY t.id DESC`;
  
  const res = status ? await pool.query(query, [status]) : await pool.query(query);
  return res.rows;
};

const getTripById = async (id) => {
  const res = await pool.query(
    `SELECT t.*, v.name as vehicle_name, d.name as driver_name
     FROM trips t
     LEFT JOIN vehicles v ON t.vehicle_id = v.id
     LEFT JOIN drivers d ON t.driver_id = d.id
     WHERE t.id = $1`,
    [id]
  );
  return res.rows[0];
};

const addTrip = async ({ vehicle_id, driver_id, cargo_weight, distance_km, revenue, status, start_odometer }) => {
  const res = await pool.query(
    `INSERT INTO trips (vehicle_id, driver_id, cargo_weight, distance_km, revenue, status, start_odometer)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [vehicle_id, driver_id, cargo_weight, distance_km || 0, revenue || 0, status, start_odometer]
  );
  return res.rows[0];
};

module.exports = { getAllTrips, getTripById, addTrip };
