const tripService = require("../services/tripService");

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

module.exports = { createTrip, completeTrip };