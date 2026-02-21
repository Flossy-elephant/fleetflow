const driverModel = require("../models/driverModel");

const getDriverRankings = async () => {
  const drivers = await driverModel.getAllDrivers();

  return drivers
    .map(driver => {
      const completionRate = driver.total_trips ? driver.completed_trips / driver.total_trips : 0;
      const rankingScore = completionRate * 40 + driver.safety_score * 30; // extend for on-time or violation
      return { ...driver, rankingScore, completionRate };
    })
    .sort((a, b) => b.rankingScore - a.rankingScore);
};

module.exports = { getDriverRankings };