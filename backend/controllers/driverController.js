const rankingService = require("../services/rankingService");

const driverRankings = async (req, res) => {
  try {
    const rankings = await rankingService.getDriverRankings();
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { driverRankings };