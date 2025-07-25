const VehicleAssignment = require("../models/vehicleAssignmentModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId } = require("../utils/validationHelper");
const {
  getPagination,
  paginatedResponse,
} = require("../utils/paginationHelper");

const createAssignment = async (req, res) => {
  try {
    const { vehicleId, driverId, assignDate, duration } = req.body;

    if ([vehicleId, driverId, assignDate, duration].some(isEmpty)) {
      return Response.fail(res, "All required fields must be filled");
    }

    if (!isValidObjectId(vehicleId) || !isValidObjectId(driverId)) {
      return Response.fail(res, "Invalid vehicle or driver ID");
    }

    const assignment = await VehicleAssignment.create({
      vehicleId,
      driverId,
      assignDate,
      duration,
    });

    return Response.success(res, "Assignment created successfully", assignment);
  } catch (err) {
    return Response.error(res, "Assignment creation failed", err);
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    if (!isValidObjectId(assignmentId)) {
      return Response.fail(res, "Invalid assignment ID");
    }

    const updateData = req.body;

    const updated = await VehicleAssignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true }
    );

    if (!updated) {
      return Response.fail(res, "Assignment not found");
    }

    return Response.success(res, "Assignment updated successfully", updated);
  } catch (err) {
    return Response.error(res, "Update failed", err);
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    if (!isValidObjectId(assignmentId)) {
      return Response.fail(res, "Invalid assignment ID");
    }

    const deleted = await VehicleAssignment.findByIdAndUpdate(
      assignmentId,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) {
      return Response.fail(res, "Assignment not found");
    }

    return Response.success(res, "Assignment deleted successfully", deleted);
  } catch (err) {
    return Response.error(res, "Deletion failed", err);
  }
};

const listAssignments = async (req, res) => {
  try {
    const { search = "", status } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = { isDeleted: false };

    if (search) {
      query.duration = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    const [assignments, total] = await Promise.all([
      VehicleAssignment.find(query)
        .populate("vehicleId") 
        .populate("driverId") 
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      VehicleAssignment.countDocuments(query),
    ]);

    return Response.success(
      res,
      "Assignments fetched successfully",
      paginatedResponse(assignments, total, page, limit)
    );
  } catch (err) {
    return Response.error(res, "Listing failed", err);
  }
};

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listAssignments,
};
