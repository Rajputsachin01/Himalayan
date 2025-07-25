const mongoose = require("mongoose");
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  priorityLevel: {
    type: String,
    enum: ["high", "low", "medium"],
    default: "medium",
  },
  dueDate: {
    type: Date,
    require: true,
  },
  estimatedTime: {
    type: Number,
    default: 0,
  },
  requiredSkills: {
    type: String,
    default: "",
  },
  taskCategory: {
    type: String,
    enum: ["leads", "sales", "analysis", "other"],
    default: "leads",
  },
  assignedMethod: {
    type: String,
    enum: ["now", "later"],
    default: "now",
  },
  assignedMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
 isDeleted: {
      type: Boolean,
      default: false,
    },
}, 
 { timestamps: true },
)
module.exports = mongoose.model("Task",TaskSchema);
