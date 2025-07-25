const Lead = require("../models/leadModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId, isValidPhone } = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createLead = async (req, res) => {
  try {
    const {
      companyName,
      companyWebsite,
      contactPersonName,
      emailAddress,
      phoneNumber,
      jobTitle,
      potentialValue,
      priorityLevel,
      stage,
      assignToExecutive,
      leadSource,
      notes,
    } = req.body;

    if (
      [companyName, contactPersonName, emailAddress, phoneNumber, potentialValue, stage, assignToExecutive].some(isEmpty)
    ) {
      return Response.fail(res, "All required fields must be filled");
    }

    if (!isValidPhone(phoneNumber)) {
      return Response.fail(res, "Invalid phone number");
    }

    const lead = await Lead.create({
      companyName,
      companyWebsite,
      contactPersonName,
      emailAddress,
      phoneNumber,
      jobTitle,
      potentialValue,
      priorityLevel,
      stage,
      assignToExecutive,
      leadSource,
      notes,
    });

    return Response.success(res, "Lead created successfully", lead);
  } catch (err) {
    return Response.error(res, "Lead creation failed", err);
  }
};

const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    if (!isValidObjectId(leadId)) {
      return Response.fail(res, "Invalid lead ID");
    }

    const updateData = req.body;

    if (updateData.phoneNumber && !isValidPhone(updateData.phoneNumber)) {
      return Response.fail(res, "Invalid phone number");
    }

    const updatedLead = await Lead.findByIdAndUpdate(leadId, updateData, { new: true });

    if (!updatedLead) {
      return Response.fail(res, "Lead not found");
    }

    return Response.success(res, "Lead updated successfully", updatedLead);
  } catch (err) {
    return Response.error(res, "Lead update failed", err);
  }
};

const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    if (!isValidObjectId(leadId)) {
      return Response.fail(res, "Invalid lead ID");
    }

    const deleted = await Lead.findByIdAndUpdate(leadId, { isDeleted: true }, { new: true });

    if (!deleted) {
      return Response.fail(res, "Lead not found");
    }

    return Response.success(res, "Lead deleted successfully", deleted);
  } catch (err) {
    return Response.error(res, "Lead deletion failed", err);
  }
};

const listLeads = async (req, res) => {
  try {
    const { search = "", priorityLevel, stage } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { contactPersonName: { $regex: search, $options: "i" } },
        { emailAddress: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (priorityLevel) query.priorityLevel = priorityLevel;
    if (stage) query.stage = stage;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignToExecutive", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Lead.countDocuments(query),
    ]);

    return Response.success(
      res,
      "Leads fetched successfully",
      paginatedResponse(leads, total, page, limit)
    );
  } catch (err) {
    return Response.error(res, "Lead listing failed", err);
  }
};

const fetchAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find(
      { isDeleted: false },
      { _id: 1, companyName: 1 }
    ).sort({ createdAt: -1 });

    return Response.success(res, "Leads fetched", leads);
  } catch (err) {
    return Response.error(res, "Fetch all leads failed", err);
  }
};

module.exports = {
  createLead,
  updateLead,
  deleteLead,
  listLeads,
  fetchAllLeads,
};
