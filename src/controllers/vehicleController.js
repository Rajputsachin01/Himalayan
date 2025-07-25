const Vehicle = require("../models/vehicleModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId } = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createVehicle = async (req, res) => {
  try {
    const { vehicleId, type, plateNumber, status } = req.body;

    if ([vehicleId, type, plateNumber].some(isEmpty)) {
      return Response.fail(res, "All required fields must be filled");
    }

    const vehicle = await Vehicle.create({ vehicleId, type, plateNumber, status });
    return Response.success(res, "Vehicle created successfully", vehicle);
  } catch (err) {
    return Response.error(res, "Vehicle creation failed", err);
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    if (!isValidObjectId(vehicleId)) {
      return Response.fail(res, "Invalid vehicle ID");
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, req.body, { new: true });

    if (!updatedVehicle) {
      return Response.fail(res, "Vehicle not found");
    }

    return Response.success(res, "Vehicle updated successfully", updatedVehicle);
  } catch (err) {
    return Response.error(res, "Vehicle update failed", err);
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    if (!isValidObjectId(vehicleId)) {
      return Response.fail(res, "Invalid vehicle ID");
    }

    const deleted = await Vehicle.findByIdAndUpdate(vehicleId, { isDeleted: true }, { new: true });

    if (!deleted) {
      return Response.fail(res, "Vehicle not found");
    }

    return Response.success(res, "Vehicle deleted successfully", deleted);
  } catch (err) {
    return Response.error(res, "Vehicle deletion failed", err);
  }
};

const listVehicles = async (req, res) => {
  try {
    const { search = "", status, type } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { vehicleId: { $regex: search, $options: "i" } },
        { plateNumber: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (type) query.type = type;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Vehicle.countDocuments(query),
    ]);

    return Response.success(
      res,
      "Vehicles fetched successfully",
      paginatedResponse(vehicles, total, page, limit)
    );
  } catch (err) {
    return Response.error(res, "Vehicle listing failed", err);
  }
};
const fetchAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find(
      { isDeleted: false },
      { _id: 1, vehicleId: 1, type: 1 }
    ).sort({ createdAt: -1 });

    return Response.success(res, "Vehicles fetched", vehicles);
  } catch (err) {
    return Response.error(res, "Fetch all vehicles failed", err);
  }
};


module.exports = {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  listVehicles,
  fetchAllVehicles
};
