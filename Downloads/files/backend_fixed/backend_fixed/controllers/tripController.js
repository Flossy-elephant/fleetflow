const tripService = require("../services/tripService");
const tripModel = require("../models/tripModel");
const { convertFrontendStatus } = require("../utils/statusConverter");

const getAllTrips = async (req, res) => {
  try {
    let { status } = req.query;
    if (status) status = convertFrontendStatus(status);
    const trips = await tripModel.getAllTrips(status);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTrip = async (req, res) => {
  try {
    const trip = await tripModel.getTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const completeTrip = async (req, res) => {
  try {
    const result = await tripService.completeTrip(req.params.id, req.body.end_odometer);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const cancelTrip = async (req, res) => {
  try {
    const pool = require("../db/db");
    const trip = await require("../models/tripModel").getTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.status === "Completed") return res.status(400).json({ error: "Cannot cancel a completed trip" });

    await pool.query("UPDATE trips SET status='Cancelled' WHERE id=$1", [req.params.id]);
    await pool.query("UPDATE vehicles SET status='Available' WHERE id=$1", [trip.vehicle_id]);
    await pool.query("UPDATE drivers SET status='OnDuty' WHERE id=$1", [trip.driver_id]);
    res.json({ message: "Trip cancelled successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAllTrips, getTrip, createTrip, completeTrip, cancelTrip };
