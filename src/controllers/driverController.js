const Driver = require("../models/driverModel"); // rename model file properly
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId, isValidPhone } = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createDriver = async (req, res) => {
  try {
    const { driverId, name, licenseNumber, contact, status } = req.body;

    if ([driverId, name, licenseNumber, contact].some(isEmpty)) {
      return Response.fail(res, "All required fields must be filled");
    }

    if (!isValidPhone(contact)) {
      return Response.fail(res, "Invalid contact number");
    }

    const driver = await Driver.create({ driverId, name, licenseNumber, contact, status });
    return Response.success(res, "Driver created successfully", driver);
  } catch (err) {
    return Response.error(res, "Driver creation failed", err);
  }
};

const updateDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    if (!isValidObjectId(driverId)) {
      return Response.fail(res, "Invalid driver ID");
    }

    const updateData = req.body;

    if (updateData.contact && !isValidPhone(updateData.contact)) {
      return Response.fail(res, "Invalid contact number");
    }

    const updatedDriver = await Driver.findByIdAndUpdate(driverId, updateData, { new: true });

    if (!updatedDriver) {
      return Response.fail(res, "Driver not found");
    }

    return Response.success(res, "Driver updated successfully", updatedDriver);
  } catch (err) {
    return Response.error(res, "Driver update failed", err);
  }
};

const deleteDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    if (!isValidObjectId(driverId)) {
      return Response.fail(res, "Invalid driver ID");
    }

    const deleted = await Driver.findByIdAndUpdate(driverId, { isDeleted: true }, { new: true });

    if (!deleted) {
      return Response.fail(res, "Driver not found");
    }

    return Response.success(res, "Driver deleted successfully", deleted);
  } catch (err) {
    return Response.error(res, "Driver deletion failed", err);
  }
};

const listDrivers = async (req, res) => {
  try {
    const { search = "", status } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { driverId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { licenseNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const [drivers, total] = await Promise.all([
      Driver.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Driver.countDocuments(query),
    ]);

    return Response.success(
      res,
      "Drivers fetched successfully",
      paginatedResponse(drivers, total, page, limit)
    );
  } catch (err) {
    return Response.error(res, "Driver listing failed", err);
  }
};
const fetchAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find(
      { isDeleted: false },
      { _id: 1, name: 1 }
    ).sort({ createdAt: -1 });

    return Response.success(res, "Drivers fetched", drivers);
  } catch (err) {
    return Response.error(res, "Fetch all drivers failed", err);
  }
};


module.exports = {
  createDriver,
  updateDriver,
  deleteDriver,
  listDrivers,
  fetchAllDrivers
};
