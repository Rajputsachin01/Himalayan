const TargetModel = require("../models/targetModel");
const Response = require("../utils/responseHelper");
const {
  isValidObjectId,
  isEmpty,
  isValidDate,
} = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createTarget = async (req, res) => {
  try {
    const { teamLeaderId, Date, target = 0 } = req.body;

    if (!isValidObjectId(teamLeaderId)) return Response.fail(res, "Invalid teamLeaderId");
    if (!Date || !isValidDate(Date)) return Response.fail(res, "Invalid or missing date");

    const newTarget = await TargetModel.create({
      teamLeaderId,
      Date,
      target,
    });

    return Response.success(res, "Target created successfully", newTarget);
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};

const updateTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamLeaderId, Date, target } = req.body;

    if (!isValidObjectId(id)) return Response.fail(res, "Invalid target ID");

    const updates = {};

    if (teamLeaderId) {
      if (!isValidObjectId(teamLeaderId)) return Response.fail(res, "Invalid teamLeaderId");
      updates.teamLeaderId = teamLeaderId;
    }

    if (Date) {
      if (!isValidDate(Date)) return Response.fail(res, "Invalid date");
      updates.Date = Date;
    }

    if (target !== undefined) {
      if (isNaN(target)) return Response.fail(res, "Target must be a number");
      updates.target = target;
    }

    const updated = await TargetModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true }
    );

    if (!updated) return Response.fail(res, "Target not found or already deleted");

    return Response.success(res, "Target updated successfully", updated);
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
const deleteTarget = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return Response.fail(res, "Invalid target ID");

    const deleted = await TargetModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return Response.fail(res, "Target not found or already deleted");

    return Response.success(res, "Target deleted successfully");
  } catch (error) {
    console.log(error);
    return Response.fail(res, error.message);
  }
};
const listTargets = async (req, res) => {
  try {
    const { teamLeaderId } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = { isDeleted: false };

    if (teamLeaderId && isValidObjectId(teamLeaderId)) {
      query.teamLeaderId = teamLeaderId;
    }

    const [targets, total] = await Promise.all([
      TargetModel.find(query)
        .populate("teamLeaderId", "userName email phoneNo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TargetModel.countDocuments(query),
    ]);

    return Response.success(
      res,
      "Target list fetched",
      paginatedResponse(targets, total, page, limit)
    );
  } catch (error) {
    console.error("Error listing targets:", error);
    return Response.fail(res, "Failed to fetch target list");
  }
};

module.exports = {
  createTarget,
  updateTarget,
  deleteTarget,
  listTargets,
};
