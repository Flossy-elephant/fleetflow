const analyticsService = require("../services/analyticsService");

const fleetSummary = async (req, res) => {
  try {
    const summary = await analyticsService.getFleetSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const vehicleROI = async (req, res) => {
  try {
    const roi = await analyticsService.getVehicleROI(req.params.vehicleId);
    res.json(roi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { fleetSummary, vehicleROI };