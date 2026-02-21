const vehicleModel = require("../models/vehicleModel");
const driverModel = require("../models/driverModel");
const tripModel = require("../models/tripModel");
const pool = require("../db/db");

const createTrip = async ({ vehicle_id, driver_id, cargo_weight, distance_km, revenue }) => {
  const vehicle = await vehicleModel.getVehicleById(vehicle_id);
  const driver = await driverModel.getDriverById(driver_id);

  if (!vehicle || vehicle.status !== "Available") throw new Error("Dispatch blocked: Vehicle not available.");
  if (!driver || driver.status !== "OnDuty") throw new Error("Dispatch blocked: Driver not available.");
  if (cargo_weight > vehicle.max_capacity) throw new Error("Dispatch blocked: Vehicle overloaded.");
  if (new Date(driver.license_expiry) < new Date()) throw new Error("Dispatch blocked: Driver license expired.");

  const trip = await tripModel.addTrip({
    vehicle_id,
    driver_id,
    cargo_weight,
    distance_km,
    revenue,
    status: "Dispatched",
    start_odometer: vehicle.odometer,
  });

  await pool.query("UPDATE vehicles SET status='OnTrip' WHERE id=$1", [vehicle_id]);
  await pool.query("UPDATE drivers SET status='OnTrip' WHERE id=$1", [driver_id]);

  return trip;
};

const completeTrip = async (trip_id, end_odometer) => {
  const trip = await tripModel.getTripById(trip_id);
  if (!trip || trip.status !== "Dispatched") throw new Error("Trip cannot be completed.");

  await pool.query("UPDATE trips SET status='Completed', end_odometer=$1 WHERE id=$2", [end_odometer, trip_id]);
  await pool.query("UPDATE vehicles SET status='Available', odometer=$1 WHERE id=$2", [end_odometer, trip.vehicle_id]);
  await pool.query(
    "UPDATE drivers SET status='OnDuty', total_trips=total_trips+1, completed_trips=completed_trips+1 WHERE id=$1",
    [trip.driver_id]
  );

  return { message: "Trip completed successfully." };
};

module.exports = { createTrip, completeTrip };