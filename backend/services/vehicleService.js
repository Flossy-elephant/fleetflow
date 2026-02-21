const vehicleModel = require("../models/vehicleModel");

const getVehicles = async () => {
  return await vehicleModel.getAllVehicles();
};

const addVehicle = async (vehicleData) => {
  return await vehicleModel.addVehicle(vehicleData);
};

const updateVehicleStatus = async (vehicleId, status) => {
  return await vehicleModel.updateVehicleStatus(vehicleId, status);
};

module.exports = { getVehicles, addVehicle, updateVehicleStatus };