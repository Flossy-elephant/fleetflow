const pool = require("../db/db");

const getAllMaintenance = async () => {
  const res = await pool.query(
    `SELECT m.*, v.name as vehicle_name, v.license_plate
     FROM maintenance m
     LEFT JOIN vehicles v ON m.vehicle_id = v.id
     ORDER BY m.date DESC`
  );
  return res.rows;
};

const addMaintenance = async ({ vehicle_id, cost, date, description }) => {
  const res = await pool.query(
    "INSERT INTO maintenance (vehicle_id, cost, date, description, status) VALUES ($1,$2,$3,$4,'Open') RETURNING *",
    [vehicle_id, cost, date || new Date(), description]
  );
  return res.rows[0];
};

const closeMaintenance = async (id) => {
  const res = await pool.query(
    "UPDATE maintenance SET status='Closed', closed_at=NOW() WHERE id=$1 RETURNING *",
    [id]
  );
  return res.rows[0];
};

const getMaintenanceByVehicle = async (vehicle_id) => {
  const res = await pool.query("SELECT * FROM maintenance WHERE vehicle_id=$1", [vehicle_id]);
  return res.rows;
};

module.exports = { getAllMaintenance, addMaintenance, closeMaintenance, getMaintenanceByVehicle };
