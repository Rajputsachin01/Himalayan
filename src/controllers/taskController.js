const Task = require("../models/taskModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId } = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createTask = async (req, res) => {
  try {
    const {
      title,
      dueDate,
      description,
      priorityLevel,
      estimatedTime,
      requiredSkills,
      taskCategory,
      assignedMethod,
      assignedMembers,
    } = req.body;

    if ([title, dueDate].some(isEmpty)) {
      return Response.fail(res, "Title and Due Date are required");
    }

    if (!Array.isArray(assignedMembers) || assignedMembers.length === 0) {
      return Response.fail(res, "At least one assigned member is required");
    }

    const task = await Task.create({
      title,
      dueDate,
      description,
      priorityLevel,
      estimatedTime,
      requiredSkills,
      taskCategory,
      assignedMethod,
      assignedMembers,
    });

    return Response.success(res, "Task created successfully", task);
  } catch (err) {
    return Response.error(res, "Task creation failed", err);
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!isValidObjectId(taskId)) {
      return Response.fail(res, "Invalid task ID");
    }

    const updateData = req.body;

    if (updateData.assignedMembers && (!Array.isArray(updateData.assignedMembers) || updateData.assignedMembers.length === 0)) {
      return Response.fail(res, "Assigned members must be a non-empty array");
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

    if (!updatedTask) {
      return Response.fail(res, "Task not found");
    }

    return Response.success(res, "Task updated successfully", updatedTask);
  } catch (err) {
    return Response.error(res, "Task update failed", err);
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!isValidObjectId(taskId)) {
      return Response.fail(res, "Invalid task ID");
    }

    const deleted = await Task.findByIdAndUpdate(taskId, { isDeleted: true }, { new: true });

    if (!deleted) {
      return Response.fail(res, "Task not found");
    }

    return Response.success(res, "Task deleted successfully", deleted);
  } catch (err) {
    return Response.error(res, "Task deletion failed", err);
  }
};

const listTasks = async (req, res) => {
  try {
    const { search = "", taskCategory, priorityLevel } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requiredSkills: { $regex: search, $options: "i" } },
      ];
    }

    if (taskCategory) query.taskCategory = taskCategory;
    if (priorityLevel) query.priorityLevel = priorityLevel;

    const [tasks, total] = await Promise.all([
      Task.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Task.countDocuments(query),
    ]);

    return Response.success(
      res,
      "Tasks fetched successfully",
      paginatedResponse(tasks, total, page, limit)
    );
  } catch (err) {
    return Response.error(res, "Task listing failed", err);
  }
};

const fetchAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find(
      { isDeleted: false },
      { _id: 1, title: 1 }
    ).sort({ createdAt: -1 });

    return Response.success(res, "Tasks fetched", tasks);
  } catch (err) {
    return Response.error(res, "Fetch all tasks failed", err);
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  fetchAllTasks,
};
