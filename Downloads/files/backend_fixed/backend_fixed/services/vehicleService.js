const vehicleModel = require("../models/vehicleModel");

const getVehicles = async (status = null) => {
  return await vehicleModel.getAllVehicles(status);
};

const getVehicle = async (id) => {
  return await vehicleModel.getVehicleById(id);
};

const addVehicle = async (vehicleData) => {
  return await vehicleModel.addVehicle(vehicleData);
};

const updateVehicle = async (id, vehicleData) => {
  return await vehicleModel.updateVehicleById(id, vehicleData);
};

const updateVehicleStatus = async (vehicleId, status) => {
  return await vehicleModel.updateVehicleStatus(vehicleId, status);
};

const recommendVehicles = async (params) => {
  const { cargo, distance } = params;
  return await vehicleModel.recommendVehicles(cargo, distance);
};

module.exports = { getVehicles, getVehicle, addVehicle, updateVehicle, updateVehicleStatus, recommendVehicles };